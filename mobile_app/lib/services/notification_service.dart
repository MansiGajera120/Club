import 'package:flutter/foundation.dart';

/// Push-notification service (Firebase Cloud Messaging).
///
/// Structure is prepared per requirements; actual FCM initialization,
/// permission requests, token registration and message handling are wired up
/// once Firebase is configured for the project. Keeping the surface here means
/// the rest of the app can depend on a stable API today.
class NotificationService {
  const NotificationService();

  /// Initialize messaging. No-op until Firebase is configured.
  Future<void> initialize() async {
    // TODO(phase-later): Firebase.initializeApp + FirebaseMessaging setup,
    // request permissions, register the device token with the backend, and
    // register foreground/background message handlers.
    debugPrint('NotificationService: initialize() — pending Firebase config');
  }
}
