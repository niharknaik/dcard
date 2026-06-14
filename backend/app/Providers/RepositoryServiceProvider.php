<?php

namespace App\Providers;

use App\Repositories\CardRepository;
use App\Repositories\Contracts\CardRepositoryInterface;
use App\Repositories\Contracts\LeadRepositoryInterface;
use App\Repositories\Contracts\TemplateRepositoryInterface;
use App\Repositories\Contracts\UserRepositoryInterface;
use App\Repositories\LeadRepository;
use App\Repositories\TemplateRepository;
use App\Repositories\UserRepository;
use Illuminate\Support\ServiceProvider;

/**
 * Binds repository interfaces to concrete implementations (Clean Architecture).
 * New repositories are registered here as each phase adds them.
 */
class RepositoryServiceProvider extends ServiceProvider
{
    public array $bindings = [
        UserRepositoryInterface::class => UserRepository::class,
        CardRepositoryInterface::class => CardRepository::class,
        LeadRepositoryInterface::class => LeadRepository::class,
        TemplateRepositoryInterface::class => TemplateRepository::class,
    ];
}
