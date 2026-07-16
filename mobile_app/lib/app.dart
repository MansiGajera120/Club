import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter/services.dart';

import 'config/app_config.dart';
import 'providers/session_providers.dart';
import 'routes/app_router.dart';
import 'theme/app_theme.dart';
import 'utils/app_toast.dart';
import 'widgets/app_background.dart';

/// Root application widget. Light-only theme with auth-aware routing.
class ClubApp extends ConsumerWidget {
  const ClubApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    ref.watch(userSessionCoordinatorProvider);
    final router = ref.watch(routerProvider);

    return MaterialApp.router(
      title: AppConfig.appName,
      debugShowCheckedModeBanner: false,
      scaffoldMessengerKey: rootScaffoldMessengerKey,
      theme: AppTheme.light,
      themeMode: ThemeMode.light,
      routerConfig: router,
      builder: (context, child) {
        // Ignore the device's font-size / display-size setting so the app's
        // layout stays consistent regardless of system text scaling.
        final mediaQuery = MediaQuery.of(context);
        return MediaQuery(
          data: mediaQuery.copyWith(textScaler: TextScaler.noScaling),
          child: AnnotatedRegion<SystemUiOverlayStyle>(
            value: const SystemUiOverlayStyle(
              statusBarColor: Colors.transparent,
              statusBarIconBrightness: Brightness.dark,
              statusBarBrightness: Brightness.light,
              systemNavigationBarColor: Colors.white,
              systemNavigationBarIconBrightness: Brightness.dark,
            ),
            child: AppBackground(child: child ?? const SizedBox.shrink()),
          ),
        );
      },
    );
  }
}
