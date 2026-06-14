<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HelpArticle extends Model
{
    protected $fillable = ['title', 'slug', 'content', 'category', 'is_published'];

    protected function casts(): array
    {
        return ['is_published' => 'boolean'];
    }

    public function getRouteKeyName(): string
    {
        return 'slug';
    }
}
