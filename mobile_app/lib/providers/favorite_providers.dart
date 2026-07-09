import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../models/club_model.dart';
import '../repositories/favorite_repository.dart';
import 'core_providers.dart';

final favoriteRepositoryProvider = Provider<FavoriteRepository>((ref) {
  return FavoriteRepository(ref.watch(dioProvider));
});

/// The current parent's favorite clubs, with add/remove/toggle. Other screens
/// read [isFavorite] and call [toggle] to keep favorites consistent app-wide.
class FavoritesController extends AsyncNotifier<List<Club>> {
  @override
  Future<List<Club>> build() async {
    final result = await ref.watch(favoriteRepositoryProvider).list();
    return result.items;
  }

  bool isFavorite(String clubId) =>
      state.value?.any((c) => c.id == clubId) ?? false;

  Future<void> _add(Club club) async {
    await ref.read(favoriteRepositoryProvider).add(club.id);
    final current = state.value ?? [];
    if (!current.any((c) => c.id == club.id)) {
      state = AsyncData([club.copyWith(isFavorite: true), ...current]);
    }
  }

  Future<void> _remove(String clubId) async {
    await ref.read(favoriteRepositoryProvider).remove(clubId);
    state = AsyncData((state.value ?? []).where((c) => c.id != clubId).toList());
  }

  /// Toggle favorite for a club. Returns the new favorited state.
  Future<bool> toggle(Club club) async {
    final currentlyFav = isFavorite(club.id) || club.isFavorite;
    if (currentlyFav) {
      await _remove(club.id);
      return false;
    }
    await _add(club);
    return true;
  }

  Future<void> refresh() async {
    state = const AsyncLoading();
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
