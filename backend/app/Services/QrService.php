<?php

namespace App\Services;

use App\Models\Card;
use SimpleSoftwareIO\QrCode\Facades\QrCode;

class QrService
{
    /**
     * Build a QR code image for a card's public URL.
     *
     * @return array{content: string, mime: string, extension: string}
     */
    public function forCard(Card $card, string $format = 'svg', int $size = 400): array
    {
        $format = in_array($format, ['svg', 'png'], true) ? $format : 'svg';
        $size = max(100, min($size, 1000));

        // PNG requires the imagick extension; fall back to SVG when unavailable.
        if ($format === 'png' && ! extension_loaded('imagick')) {
            $format = 'svg';
        }

        $content = QrCode::format($format)
            ->size($size)
            ->margin(1)
            ->errorCorrection('H')
            ->generate($card->public_url);

        return [
            'content' => (string) $content,
            'mime' => $format === 'png' ? 'image/png' : 'image/svg+xml',
            'extension' => $format,
        ];
    }
}
