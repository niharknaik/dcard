<?php

use App\Models\Faq;
use App\Models\Page;

it('returns published faqs', function () {
    Faq::create(['question' => 'What is DCard?', 'answer' => 'A digital card SaaS.', 'is_published' => true]);
    Faq::create(['question' => 'Hidden?', 'answer' => 'No', 'is_published' => false]);

    $this->getJson('/api/v1/content/faqs')
        ->assertOk()
        ->assertJsonCount(1, 'data');
});

it('returns a published legal page by slug', function () {
    Page::create(['title' => 'Privacy Policy', 'slug' => 'privacy', 'content' => '...', 'is_published' => true]);

    $this->getJson('/api/v1/content/pages/privacy')
        ->assertOk()
        ->assertJsonPath('data.slug', 'privacy');
});

it('returns 404 for an unpublished page', function () {
    Page::create(['title' => 'Draft', 'slug' => 'draft', 'content' => '...', 'is_published' => false]);

    $this->getJson('/api/v1/content/pages/draft')->assertNotFound();
});

it('redirects guests away from the admin panel', function () {
    $this->get('/admin')->assertRedirect();
});
