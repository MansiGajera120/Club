import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'auth_provider.dart';
import 'club_providers.dart';
import 'favorite_providers.dart';

/// Clears user-specific caches when the signed-in account changes (login,
/// logout, or switching users on the same device).
final userSessionCoordinatorProvider = Provider<void>((ref) {
  ref.listen(
    authControllerProvider.select((s) => s.user?.id),
    (previous, next) {
      if (previous == next) return;

      ref.invalidate(favoritesControllerProvider);
      ref.invalidate(favoriteUiProvider);
      ref.invalidate(featuredClubsProvider);
      ref.invalidate(recentClubsProvider);
      ref.invalidate(searchControllerProvider);
    },
  );
});
