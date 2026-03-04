<?php

namespace Paulmercs\FilamentSileoNotifications;

use Filament\Contracts\Plugin;
use Filament\Panel;
use Filament\Support\Assets\Js;
use Filament\View\PanelsRenderHook;
use Illuminate\Support\Facades\Blade;

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

        $panel->renderHook(
            PanelsRenderHook::BODY_END,
            fn (): string => Blade::render(
                <<<'BLADE'
                    <script>
                        window.filamentSileoNotificationsConfig = {
                            enabled: @js(config('filament-sileo-notifications.override_action_notifications', true)),
                            messages: @js(config('filament-sileo-notifications.messages', [])),
                        };
                    </script>
                BLADE,
            ),
        );
    }

    public function boot(Panel $panel): void {}
}
