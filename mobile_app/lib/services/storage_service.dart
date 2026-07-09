import 'package:flutter_secure_storage/flutter_secure_storage.dart';

import '../core/constants/storage_keys.dart';

/// Thin, typed wrapper around [FlutterSecureStorage] for auth tokens and small
/// bits of persisted state. All secure reads/writes go through here.
class StorageService {
  final FlutterSecureStorage _storage;

  StorageService([FlutterSecureStorage? storage])
      : _storage = storage ?? const FlutterSecureStorage();

  Future<void> write(String key, String value) =>
      _storage.write(key: key, value: value);

  Future<String?> read(String key) => _storage.read(key: key);

  Future<void> delete(String key) => _storage.delete(key: key);

  Future<void> clear() => _storage.deleteAll();

  // ---- Convenience helpers for tokens ----

  Future<String?> get accessToken => read(StorageKeys.accessToken);
  Future<String?> get refreshToken => read(StorageKeys.refreshToken);

  Future<void> saveTokens({
    required String accessToken,
    required String refreshToken,
  }) async {
    await write(StorageKeys.accessToken, accessToken);
    await write(StorageKeys.refreshToken, refreshToken);
  }

  Future<void> clearTokens() async {
    await delete(StorageKeys.accessToken);
    await delete(StorageKeys.refreshToken);
  }
}
