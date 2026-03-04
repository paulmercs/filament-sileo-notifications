<?php

namespace Paulmercs\FilamentSileoNotifications;

use Filament\Contracts\Plugin;
use Filament\Panel;
use Filament\Support\Assets\Js;

class FilamentSileoNotificationsPlugin implements Plugin
{
    public static function make(): static
    {
        return app(static::class);
    }

    public function getId(): string
    {
        return 'filament-sileo-notifications';
    }

    public function register(Panel $panel): void
    {
        $panel->assets([
            Js::make(
                'filament-sileo-notifications',
                __DIR__ . '/../resources/dist/sileo-notifications.js',
            )->module(),
        ], 'paulmercs/filament-sileo-notifications');
    }

    public function boot(Panel $panel): void {}
}

