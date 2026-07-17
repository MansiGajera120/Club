import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:club_app/app.dart';
import 'package:club_app/providers/core_providers.dart';
import 'package:club_app/services/storage_service.dart';

/// In-memory storage so the test never touches the secure-storage plugin.
class _FakeStorage extends StorageService {
  final Map<String, String> _m = {};

  @override
  Future<void> write(String key, String value) async => _m[key] = value;

  @override
  Future<String?> read(String key) async => _m[key];

  @override
  Future<void> delete(String key) async => _m.remove(key);

  @override
  Future<void> clear() async => _m.clear();
}

void main() {
  testWidgets('boots to splash, then routes to login when no session',
      (WidgetTester tester) async {
    await tester.pumpWidget(
      ProviderScope(
        overrides: [storageServiceProvider.overrideWithValue(_FakeStorage())],
        child: const ClubApp(),
      ),
    );

    // Splash shows first while the session is being resolved.
    expect(find.byType(CircularProgressIndicator), findsOneWidget);

    // Bootstrap finds no token → unauthenticated → router redirects to login.
    // Pumped by hand rather than settled: the login backdrop drifts on an
    // endless loop, so pumpAndSettle would never return.
    for (var i = 0; i < 25; i++) {
      await tester.pump(const Duration(milliseconds: 200));
    }
    // The headline splits across two widgets so the accent can be highlighted.
    expect(find.text('Welcome'), findsOneWidget);
    expect(find.text('back'), findsOneWidget);
  });
}
