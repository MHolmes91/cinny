# Rebranding Cinny

This fork supports runtime branding through `config.json` for in-app text and auth-page behavior. Some browser, PWA, and icon branding still lives in static files and must be changed separately.

## Runtime Branding

Edit the top-level `branding` object in `config.json`:

```json
{
  "branding": {
    "appName": "My Title",
    "deviceName": "My Title Web",
    "logoAlt": "My Title logo",
    "loadingText": "Loading My Title",
    "authDescription": "Sign in with your organization account to start chatting.",
    "welcomeTitle": "Welcome to My Title",
    "welcomeSubtitle": "A private Matrix client for your community.",
    "aboutSubtitle": "A private Matrix client.",
    "sourceCodeLabel": "Source Code",
    "supportLabel": "Support",
    "showOtherAuthOptionsLabel": "Show other sign-in options"
  }
}
```

Available options:

| Option                      | Used for                                                          |
| --------------------------- | ----------------------------------------------------------------- |
| `appName`                   | Auth header, splash footer, about page, notification pusher brand |
| `deviceName`                | Matrix login/register device display name                         |
| `logoAlt`                   | Logo image alt text                                               |
| `loadingText`               | App loading screens after config is available                     |
| `authDescription`           | Short instructions on the login/register card                     |
| `welcomeTitle`              | Empty-state welcome page title                                    |
| `welcomeSubtitle`           | Empty-state welcome page subtitle                                 |
| `aboutSubtitle`             | About page app description                                        |
| `sourceCodeLabel`           | Source-code button label                                          |
| `supportLabel`              | Support button label                                              |
| `showOtherAuthOptionsLabel` | Button label for revealing secondary auth options                 |

`config.json` loads after the initial HTML page loads. The earliest config-loading screen uses the defaults in `src/app/config/branding.ts` until `config.json` is available.

## Auth Page UI

Edit the top-level `ui.auth` object in `config.json`:

```json
{
  "ui": {
    "auth": {
      "hideHomeserver": true,
      "primaryOptions": ["sso"],
      "otherOptions": ["password", "account-switch"]
    }
  }
}
```

Available options:

| Option           | Used for                                                                        |
| ---------------- | ------------------------------------------------------------------------------- |
| `hideHomeserver` | Hides the homeserver selector on login/register when `true`                     |
| `primaryOptions` | Auth methods shown first                                                        |
| `otherOptions`   | Auth methods hidden behind the reveal button when primary options are available |

Auth option values:

| Value            | Login page                              | Register page                         |
| ---------------- | --------------------------------------- | ------------------------------------- |
| `sso`            | SSO login                               | SSO registration                      |
| `password`       | Password login form                     | Password registration form            |
| `account-switch` | `Do not have an account? Register` link | `Already have an account? Login` link |

Token login is automatic when a `loginToken` is present in the URL. It is not normally configured in `primaryOptions` or `otherOptions`.

Unknown auth option values are ignored.

## Static Branding Files

Runtime `config.json` branding does not change the first HTML response, link previews, browser install metadata, or icon files. Change these static files when making a fully branded fork.

### HTML Metadata

Edit `index.html`:

| Field                 | Current location                           |
| --------------------- | ------------------------------------------ |
| Browser title         | `<title>`                                  |
| App name meta         | `<meta name="name">`                       |
| Description           | `<meta name="description">`                |
| Keywords              | `<meta name="keywords">`                   |
| OpenGraph title       | `<meta property="og:title">`               |
| OpenGraph URL         | `<meta property="og:url">`                 |
| OpenGraph image       | `<meta property="og:image">`               |
| OpenGraph description | `<meta property="og:description">`         |
| Theme color           | `<meta name="theme-color">`                |
| Favicon link          | `<link id="favicon">`                      |
| PWA application name  | `<meta name="application-name">`           |
| Apple web app title   | `<meta name="apple-mobile-web-app-title">` |
| Apple touch icons     | `<link rel="apple-touch-icon">` entries    |

These values are static at load time. Because this app is a static Vite SPA, `config.json` cannot change the initial server-delivered HTML before JavaScript starts.

### PWA Manifest

Edit `public/manifest.json`:

| Field              | Used for                    |
| ------------------ | --------------------------- |
| `name`             | Full installed PWA name     |
| `short_name`       | Short installed PWA name    |
| `description`      | PWA description             |
| `background_color` | PWA splash/background color |
| `theme_color`      | Browser/PWA theme color     |
| `icons`            | Android/PWA icon list       |

### Icons And Logos

Replace these files for a complete visual rebrand:

| File                                      | Used for                                         |
| ----------------------------------------- | ------------------------------------------------ |
| `public/favicon.ico`                      | Browser favicon fallback                         |
| `public/res/svg/cinny.svg`                | Main in-app logo and normal favicon state        |
| `public/res/svg/cinny-unread.svg`         | Favicon when there are unread rooms              |
| `public/res/svg/cinny-highlight.svg`      | Favicon when there are highlighted notifications |
| `public/res/apple/apple-touch-icon-*.png` | iOS home-screen icons                            |
| `public/res/android/android-chrome-*.png` | Android/PWA icons                                |

## Theme Colors

Runtime branding does not currently expose theme colors. To make the app visually distinct, edit the theme definitions in `src/colors.css.ts` and theme registration in `src/app/hooks/useTheme.ts`.

## Recommended Rebranding Checklist

1. Update `config.json` `branding` values.
2. Update `config.json` `ui.auth` behavior for your login/register flow.
3. Replace static icon/logo files under `public/`.
4. Update `index.html` metadata and icon links.
5. Update `public/manifest.json` PWA metadata and icon list.
6. Update theme colors in `src/colors.css.ts` if you want the app to look obviously different from default Cinny.
7. Run `npm run build` and verify the app loads.
