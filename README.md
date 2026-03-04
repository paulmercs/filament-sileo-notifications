# Filament Sileo Notifications

Use [Sileo](https://www.npmjs.com/package/sileo)-style toasts in Filament v5, and optionally apply generic global notification messages for create/edit/delete actions.

## Features

- Replaces default Filament toast UI with Sileo-style toast output
- Works with server-rendered Filament notifications and JS-dispatched notifications
- Global generic `title` + `body` messages for:
  - `CreateAction`
  - `EditAction`
  - `DeleteAction`
- Configurable message content

## Requirements

- PHP `^8.2`
- Laravel `^12`
- Filament `^5`

## Installation

```bash
composer require paulmercs/filament-sileo-notifications:^1.0
```

## Register The Plugin

In your panel provider (example: `app/Providers/Filament/AdminPanelProvider.php`):

```php
use Paulmercs\FilamentSileoNotifications\FilamentSileoNotificationsPlugin;

return $panel
    // ...
    ->plugin(FilamentSileoNotificationsPlugin::make());
```

## Publish Config (Optional)

```bash
php artisan vendor:publish --tag=filament-sileo-notifications-config
```

Published file:

`config/filament-sileo-notifications.php`

## Publish Filament Assets

```bash
php artisan filament:assets
```

## Configuration

```php
return [
    'override_action_notifications' => true,

    'messages' => [
        'create' => [
            'title' => 'Record created successfully',
            'body' => 'The record has been created and saved. You can now review or update the details anytime.',
        ],
        'edit' => [
            'title' => 'Changes saved successfully',
            'body' => 'Your updates were saved successfully and are now reflected across the system.',
        ],
        'delete' => [
            'title' => 'Record deleted successfully',
            'body' => 'The selected record has been deleted and removed from the current dataset.',
        ],
    ],
];
```

## Recommended After Install/Update

```bash
php artisan optimize:clear
php artisan filament:assets
```

Then hard refresh the browser (`Ctrl + F5`).

## Troubleshooting

- If no notification appears, check browser console for JS errors and run:
  - `php artisan filament:assets`
- If default Filament toast still appears, ensure plugin is registered in the active panel provider.
- If config changes are not reflected:
  - `php artisan config:clear`
  - `php artisan optimize:clear`

## License

MIT

