<?php

namespace Paulmercs\FilamentSileoNotifications;

use Filament\Actions\CreateAction;
use Filament\Actions\DeleteAction;
use Filament\Actions\EditAction;
use Filament\Notifications\Notification;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Lang;

class FilamentSileoNotificationsServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->mergeConfigFrom(
            __DIR__ . '/../config/filament-sileo-notifications.php',
            'filament-sileo-notifications',
        );
    }

    public function boot(): void
    {
        $this->publishes([
            __DIR__ . '/../config/filament-sileo-notifications.php' => config_path('filament-sileo-notifications.php'),
        ], 'filament-sileo-notifications-config');

        if (! config('filament-sileo-notifications.override_action_notifications', true)) {
            return;
        }

        Lang::addLines([
            'resources/pages/create-record.notifications.created.title' => (string) config('filament-sileo-notifications.messages.create.title'),
            'resources/pages/edit-record.notifications.saved.title' => (string) config('filament-sileo-notifications.messages.edit.title'),
        ], 'en', 'filament-panels');

        CreateAction::configureUsing(function (CreateAction $action): void {
            $action->successNotification(
                Notification::make()
                    ->success()
                    ->title((string) config('filament-sileo-notifications.messages.create.title'))
                    ->body((string) config('filament-sileo-notifications.messages.create.body')),
            );
        });

        EditAction::configureUsing(function (EditAction $action): void {
            $action->successNotification(
                Notification::make()
                    ->success()
                    ->title((string) config('filament-sileo-notifications.messages.edit.title'))
                    ->body((string) config('filament-sileo-notifications.messages.edit.body')),
            );
        });

        DeleteAction::configureUsing(function (DeleteAction $action): void {
            $action->successNotification(
                Notification::make()
                    ->success()
                    ->title((string) config('filament-sileo-notifications.messages.delete.title'))
                    ->body((string) config('filament-sileo-notifications.messages.delete.body')),
            );
        });
    }
}
