import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../core/network/dio_client.dart';
import '../services/storage_service.dart';

/// Core dependency-injection providers. Feature providers (auth, clubs, events)
/// build on top of these in later phases.

/// Secure storage wrapper (tokens, small persisted state).
final storageServiceProvider = Provider<StorageService>((ref) {
  return StorageService();
});

/// Configured Dio client, wired with the auth interceptor.
final dioClientProvider = Provider<DioClient>((ref) {
  final storage = ref.watch(storageServiceProvider);
  return DioClient(storage);
});

/// Raw [Dio] instance for repositories to make requests with.
final dioProvider = Provider<Dio>((ref) {
  return ref.watch(dioClientProvider).dio;
});
