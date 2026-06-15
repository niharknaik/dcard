<?php

namespace App\Support;

use App\Models\Setting;

/**
 * Editable marketing content for the web landing page. Stored as a single JSON
 * blob in the settings table (key: landing_content) and edited from the Filament
 * "Landing Page" admin page. `current()` always falls back to sensible defaults
 * so the landing renders even before anything is saved.
 */
class LandingContent
{
    public const KEY = 'landing_content';

    /** The merged, ready-to-serve content (stored sections override defaults). */
    public static function current(): array
    {
        $raw = Setting::get(self::KEY);
        $stored = is_string($raw) ? json_decode($raw, true) : null;

        if (! is_array($stored)) {
            return self::defaults();
        }

        return array_replace(self::defaults(), $stored);
    }

    public static function save(array $data): void
    {
        Setting::set(self::KEY, json_encode($data), 'json', 'landing');
    }

    public static function defaults(): array
    {
        return [
            'hero' => [
                'badge' => 'No paper · No friction · No third-party trackers',
                'title' => 'Your digital visiting card,',
                'highlight' => 'everywhere',
                'description' => 'Create a beautiful digital visiting card, share it with a tap or QR code, capture leads and track every view — all from your phone.',
                'primary_cta' => 'Get the app',
                'secondary_cta' => 'See how it works',
                'rating' => '4.8',
                'rating_caption' => 'Loved by 10,000+ professionals',
            ],
            'stats' => [
                ['value' => '10k+', 'label' => 'Cards created'],
                ['value' => '4.8★', 'label' => 'Average rating'],
                ['value' => '120+', 'label' => 'Countries'],
                ['value' => '0', 'label' => 'Paper wasted'],
            ],
            'features' => [
                ['icon' => 'card', 'title' => 'Beautiful digital cards', 'description' => 'Craft a polished card with your photo, role, company, contact details and brand colours.'],
                ['icon' => 'qr', 'title' => 'Share by QR or link', 'description' => 'One tap to share. Anyone can scan your QR or open your link — no app required to view.'],
                ['icon' => 'inbox', 'title' => 'Capture leads', 'description' => 'Visitors send their details straight to your inbox. Never lose a connection again.'],
                ['icon' => 'chart', 'title' => 'Know your reach', 'description' => 'Track views, unique visitors, QR scans and link clicks with built-in analytics.'],
                ['icon' => 'portfolio', 'title' => 'Showcase your work', 'description' => 'Add a portfolio and services so prospects see what you do, not just who you are.'],
                ['icon' => 'bell', 'title' => 'Private notifications', 'description' => 'In-app + email alerts for leads and milestones. No Firebase, no third-party trackers.'],
            ],
            'steps' => [
                ['title' => 'Create your card', 'description' => 'Add your details, photo and links in minutes.'],
                ['title' => 'Share it anywhere', 'description' => 'Send your link or let people scan your QR code.'],
                ['title' => 'Grow your network', 'description' => 'Capture leads and watch your analytics climb.'],
            ],
            'testimonials' => [
                ['quote' => 'I shared my DCard at a conference and had 14 leads in my inbox before I got home. It paid for itself the first week.', 'name' => 'Aarav Rao', 'role' => 'Product Designer, Lumen', 'initials' => 'AR'],
                ['quote' => 'Our whole sales team switched to DCard. The analytics tell us exactly which events are worth attending.', 'name' => 'Meera Shah', 'role' => 'Head of Sales, Vertex', 'initials' => 'MS'],
                ['quote' => 'Clean, fast, and it just works on every phone. People are genuinely impressed when I tap to share.', 'name' => 'Daniel Okafor', 'role' => 'Founder, Cobalt Studio', 'initials' => 'DO'],
            ],
            'trusted_by' => ['Lumen', 'Northwind', 'Acme Co', 'Vertex', 'Polaris', 'Meridian', 'Cobalt', 'Skyline'],
            'pricing' => [
                ['name' => 'Free', 'price' => '₹0', 'period' => 'forever', 'description' => 'Everything you need to get started.', 'features' => ['1 card', 'Basic template', 'Limited analytics'], 'cta' => 'Get started', 'highlight' => false],
                ['name' => 'Premium', 'price' => '₹299', 'period' => '/month', 'description' => 'For professionals who want to stand out.', 'features' => ['Unlimited cards', 'Premium templates', 'Portfolio uploads', 'Full analytics', 'Lead collection'], 'cta' => 'Go Premium', 'highlight' => true],
                ['name' => 'Business', 'price' => '₹999', 'period' => '/month', 'description' => 'For teams that grow together.', 'features' => ['Everything in Premium', 'Team management', 'Employee cards', 'Advanced analytics'], 'cta' => 'Talk to us', 'highlight' => false],
            ],
            'faqs' => [
                ['q' => 'Do people need the app to view my card?', 'a' => 'No. Your card opens in any browser via your link or QR code. The app is only for creating and managing your cards.'],
                ['q' => 'Can I create more than one card?', 'a' => 'Yes — Premium and Business plans include unlimited cards, perfect for multiple roles or businesses.'],
                ['q' => 'How do leads work?', 'a' => 'Visitors can send you their contact details from your card. Leads land in your inbox with in-app and email alerts.'],
                ['q' => 'Is my data private?', 'a' => 'Yes. DCard uses a privacy-first notification system — no Firebase, no OneSignal, no third-party ad trackers on your card.'],
                ['q' => 'What payment methods are supported?', 'a' => 'Payments are handled securely through Razorpay, supporting cards, UPI, net banking and wallets.'],
            ],
            'cta' => [
                'badge' => 'Free forever — no credit card needed',
                'title' => 'Ready to go digital?',
                'description' => 'Create your card in minutes and start sharing today. Join 10,000+ professionals who never run out of business cards again.',
            ],
        ];
    }
}
