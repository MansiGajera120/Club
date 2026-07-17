import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../core/network/dio_client.dart';
import '../services/storage_service.dart';
import 'auth_provider.dart';

/// Core dependency-injection providers. Feature providers (auth, clubs, events)
/// build on top of these in later phases.

/// Secure storage wrapper (tokens, small persisted state).
final storageServiceProvider = Provider<StorageService>((ref) {
  return StorageService();
});

/// Configured Dio client, wired with the auth interceptor. On an unrecoverable
/// 401 (refresh failed), the client drops the session so the router returns the
/// user to sign-in instead of leaving them stranded in a broken state.
final dioClientProvider = Provider<DioClient>((ref) {
  final storage = ref.watch(storageServiceProvider);
  return DioClient(
    storage,
    // Runtime-only read (fired on refresh failure) — no provider-build cycle.
    onSessionExpired: () =>
        ref.read(authControllerProvider.notifier).handleSessionExpired(),
  );
});

/// Raw [Dio] instance for repositories to make requests with.
final dioProvider = Provider<Dio>((ref) {
  return ref.watch(dioClientProvider).dio;
});
