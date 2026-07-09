# Sports Club Platform — Mobile App

Flutter application for **Parents** and **Club Owners**, built with Riverpod,
Go Router, Dio and Freezed following a clean, layered architecture.

## Requirements

- Flutter **>= 3.44** (Dart **>= 3.12**)
- Android Studio / Xcode toolchains for device builds

## Getting Started

```bash
cd mobile_app
flutter pub get
flutter run
```

API URL is chosen automatically:

| Mode | How | Backend API |
| ---- | --- | ----------- |
| Development | `flutter run` (debug) | `http://localhost:5000/api/v1` |
| Production | `flutter build apk/ios` (release) | `https://club-1r4i.onrender.com/api/v1` |

**Android emulator** — localhost does not reach the host machine. Use:

```bash
flutter run --dart-define-from-file=config/android_emulator.json
```

**Explicit config files** (optional):

```bash
flutter run --dart-define-from-file=config/dev.json
flutter build apk --dart-define-from-file=config/prod.json
```

> iOS simulator: `localhost` works. Physical device: use your PC's LAN IP via
> `--dart-define=API_BASE_URL=http://<your-ip>:5000/api/v1`.

### Code generation

Freezed / json_serializable / Riverpod generators run via `build_runner`:

```bash
dart run build_runner build --delete-conflicting-outputs
# or, while developing:
dart run build_runner watch --delete-conflicting-outputs
```

### Useful commands

| Command                | Description               |
| ---------------------- | ------------------------- |
| `flutter run`          | Run on a connected device |
| `flutter analyze`      | Static analysis           |
| `flutter test`         | Run tests                 |
| `flutter build apk`    | Build Android release     |
| `flutter build ios`    | Build iOS release         |

## Configuration

Runtime configuration is read in [`lib/config/app_config.dart`](lib/config/app_config.dart).
URLs switch automatically between local dev and the Render backend; override with
`--dart-define` or `--dart-define-from-file=config/*.json`.

| Define         | When set | Purpose             |
| -------------- | -------- | ------------------- |
| `ENV`          | optional | `dev` / `staging` / `prod` flavor |
| `API_BASE_URL` | optional | Force a specific API base URL |

## Architecture

```
lib/
├── config/         App/environment configuration
├── core/
│   ├── constants/  Storage keys, etc.
│   ├── error/      Exceptions & Failures
│   ├── network/    Dio client, endpoints, interceptors
│   └── extensions/ Dart/Flutter extensions
├── models/         Freezed + json_serializable models (added per feature)
├── repositories/   Data layer (services → providers)
├── services/       Platform services (secure storage, notifications)
├── providers/      Riverpod providers (DI + state)
├── routes/         Go Router configuration
├── screens/        Feature screens
├── widgets/        Reusable UI components
├── theme/          Design system (colors, theme)
├── utils/          Helpers & formatters
├── app.dart        Root MaterialApp (router + theme)
└── main.dart       Entry point (ProviderScope)
```

### Data flow

```
Screen (ConsumerWidget) → Provider → Repository → DioClient → Backend API
```

- **Providers** expose state and dependencies (Riverpod).
- **Repositories** call the API via Dio and map errors into typed `Failure`s.
- **Screens/Widgets** never touch Dio directly.

## State of the app

Phase 3 delivers the runnable skeleton: configuration, networking, secure
storage, theming foundation, routing and a branded splash screen. The full
design system arrives in **Phase 5**, authentication in **Phase 6**, and the
feature screens (Home, Search, Club Details, Favorites, Events, Profile) in
**Phase 9**.

## Push notifications

Firebase Messaging is included and the service surface is prepared in
[`lib/services/notification_service.dart`](lib/services/notification_service.dart).
Firebase project configuration (`google-services.json` / `GoogleService-Info.plist`)
is added when notifications are activated.
