import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../models/club_model.dart';
import '../repositories/favorite_repository.dart';
import 'auth_provider.dart';
import 'core_providers.dart';

final favoriteRepositoryProvider = Provider<FavoriteRepository>((ref) {
  return FavoriteRepository(ref.watch(dioProvider));
});

/// Tracks which clubs currently have an in-flight favorite toggle.
class FavoriteUiState {
  final Set<String> pendingIds;

  const FavoriteUiState({this.pendingIds = const {}});

  bool isPending(String clubId) => pendingIds.contains(clubId);
}

class FavoriteUiNotifier extends Notifier<FavoriteUiState> {
  @override
  FavoriteUiState build() => const FavoriteUiState();

  void setPending(String clubId, bool pending) {
    final next = Set<String>.from(state.pendingIds);
    if (pending) {
      next.add(clubId);
    } else {
      next.remove(clubId);
    }
    state = FavoriteUiState(pendingIds: next);
  }
}

final favoriteUiProvider =
    NotifierProvider<FavoriteUiNotifier, FavoriteUiState>(
      FavoriteUiNotifier.new,
    );

/// Resolves favorite state for the signed-in user only. Keyed by club id.
/// Cached `isFavorite` from club payloads is deliberately ignored — it can
/// belong to a previous session. During a reload the last-known list is used
/// (via `valueOrNull`) so hearts don't flicker off.
final clubIsFavoriteProvider = Provider.family<bool, String>((ref, clubId) {
  final auth = ref.watch(authControllerProvider);
  if (!auth.isAuthenticated) return false;

  final favorites = ref.watch(favoritesControllerProvider);
  final list = favorites.maybeWhen(data: (clubs) => clubs, orElse: () => null);
  if (list == null) return false;
  return list.any((c) => c.id == clubId);
});

final clubFavoritePendingProvider = Provider.family<bool, String>((
  ref,
  clubId,
) {
  return ref.watch(favoriteUiProvider).isPending(clubId);
});

/// The current parent's favorite clubs, with add/remove/toggle. Other screens
/// read [clubIsFavoriteProvider] and call [toggle] to keep favorites consistent
/// app-wide.
class FavoritesController extends AsyncNotifier<List<Club>> {
  @override
  Future<List<Club>> build() async {
    // Re-fetch whenever the signed-in user changes (login / logout / switch).
    ref.watch(authControllerProvider.select((s) => s.user?.id));
    final auth = ref.read(authControllerProvider);
    if (!auth.isAuthenticated) return [];

    final result = await ref.read(favoriteRepositoryProvider).list();
    return result.items;
  }

  bool _resolveFavorite(Club club) {
    final list = state.value;
    if (list != null) return list.any((c) => c.id == club.id);
    return club.isFavorite;
  }

  void _setFavoriteLocally(Club club, bool isFav) {
    final current = state.value ?? [];
    if (isFav) {
      if (!current.any((c) => c.id == club.id)) {
        state = AsyncData([club.copyWith(isFavorite: true), ...current]);
      }
      return;
    }
    state = AsyncData(current.where((c) => c.id != club.id).toList());
  }

  /// Toggle favorite for a club. Returns the new favorited state.
  Future<bool> toggle(Club club) async {
    final ui = ref.read(favoriteUiProvider.notifier);
    if (ref.read(favoriteUiProvider).isPending(club.id)) {
      return _resolveFavorite(club);
    }

    // Snapshot so a failed toggle restores the exact prior list — original
    // ordering and any fresher fields — instead of re-inserting at the front.
    final previous = state;
    final currentlyFav = _resolveFavorite(club);
    final nextFav = !currentlyFav;

    ui.setPending(club.id, true);
    _setFavoriteLocally(club, nextFav);

    try {
      if (nextFav) {
        await ref.read(favoriteRepositoryProvider).add(club.id);
      } else {
        await ref.read(favoriteRepositoryProvider).remove(club.id);
      }
      return nextFav;
    } catch (_) {
      state = previous;
      rethrow;
    } finally {
      ui.setPending(club.id, false);
    }
  }

  Future<void> refresh() async {
    // Keep the current list visible while refreshing (the pull-to-refresh
    // indicator shows progress) so favorite hearts don't blank out app-wide.
    state = await AsyncValue.guard(() async {
      final result = await ref.read(favoriteRepositoryProvider).list();
      return result.items;
    });
  }
}

final favoritesControllerProvider =
    AsyncNotifierProvider<FavoritesController, List<Club>>(
      FavoritesController.new,
    );
