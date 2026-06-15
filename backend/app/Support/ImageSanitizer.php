<?php

namespace App\Support;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

/**
 * Strips EXIF / geolocation (GPS) and any other embedded metadata from uploaded
 * images by decoding then re-encoding the raster with PHP's bundled GD
 * extension. Re-encoding produces a fresh file that contains pixels only — no
 * EXIF, no IPTC, no XMP, no GPS tags — satisfying the data-minimisation
 * requirement (LAUNCH-CHECKLIST §1.7, COMPLIANCE §1).
 *
 * Fails safe: if GD is unavailable, or the bytes are not a supported raster,
 * the original content is returned unchanged so uploads never break.
 */
class ImageSanitizer
{
    /** MIME types we can safely re-encode with GD. Anything else is passed through. */
    private const SUPPORTED_MIMES = [
        'image/jpeg',
        'image/png',
        'image/webp',
    ];

    /** JPEG/WebP re-encode quality (0-100). High enough to be visually lossless. */
    private const QUALITY = 90;

    /**
     * Sanitise raw image bytes. Returns metadata-free bytes on success, or the
     * original bytes unchanged when sanitising is not possible.
     */
    public static function stripMetadata(string $contents, ?string $mimeType = null): string
    {
        if (! function_exists('imagecreatefromstring')) {
            return $contents;
        }

        $mimeType ??= self::detectMime($contents);

        if (! in_array($mimeType, self::SUPPORTED_MIMES, true)) {
            return $contents;
        }

        $image = @imagecreatefromstring($contents);
        if ($image === false) {
            return $contents;
        }

        // Preserve alpha for formats that support transparency.
        if ($mimeType === 'image/png' || $mimeType === 'image/webp') {
            imagealphablending($image, false);
            imagesavealpha($image, true);
        }

        ob_start();
        $ok = match ($mimeType) {
            'image/jpeg' => imagejpeg($image, null, self::QUALITY),
            'image/png' => imagepng($image),
            'image/webp' => function_exists('imagewebp')
                ? imagewebp($image, null, self::QUALITY)
                : false,
        };
        $rendered = ob_get_clean();
        imagedestroy($image);

        if ($ok === false || $rendered === '' || $rendered === false) {
            return $contents;
        }

        return $rendered;
    }

    /**
     * Sanitise an uploaded image and persist the metadata-free bytes to the given
     * disk, returning the stored relative path (mirrors UploadedFile::store()).
     * Non-image uploads (video, pdf, …) are stored unchanged.
     */
    public static function storeSanitized(
        UploadedFile $file,
        string $directory,
        string $disk = 'public'
    ): string {
        $mime = $file->getMimeType();

        if (! in_array($mime, self::SUPPORTED_MIMES, true)) {
            return $file->store($directory, $disk);
        }

        $original = (string) file_get_contents($file->getRealPath());
        $sanitized = self::stripMetadata($original, $mime);

        $path = trim($directory, '/').'/'.Str::random(40).'.'.self::extensionFor($mime, $file);
        Storage::disk($disk)->put($path, $sanitized);

        return $path;
    }

    private static function detectMime(string $contents): ?string
    {
        if (! function_exists('finfo_open')) {
            return null;
        }

        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        if ($finfo === false) {
            return null;
        }

        $mime = finfo_buffer($finfo, $contents);
        finfo_close($finfo);

        return $mime ?: null;
    }

    private static function extensionFor(string $mime, UploadedFile $file): string
    {
        return match ($mime) {
            'image/jpeg' => 'jpg',
            'image/png' => 'png',
            'image/webp' => 'webp',
            default => $file->getClientOriginalExtension() ?: 'bin',
        };
    }
}
