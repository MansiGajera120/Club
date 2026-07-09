import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../core/network/paginated.dart';
import '../models/club_filter.dart';
import '../models/club_model.dart';
import '../repositories/club_repository.dart';
import 'core_providers.dart';

final clubRepositoryProvider = Provider<ClubRepository>((ref) {
  return ClubRepository(ref.watch(dioProvider));
});

/// Featured clubs for the home carousel.
final featuredClubsProvider = FutureProvider.autoDispose<List<Club>>((ref) {
  return ref.watch(clubRepositoryProvider).featuredClubs();
});

/// First page of newest clubs for the home list.
final recentClubsProvider = FutureProvider.autoDispose<List<Club>>((ref) async {
  final result =
      await ref.watch(clubRepositoryProvider).listClubs(const ClubFilter(), limit: 10);
  return result.items;
});

/// A single club's detail.
final clubDetailProvider =
    FutureProvider.autoDispose.family<Club, String>((ref, id) {
  return ref.watch(clubRepositoryProvider).getClub(id);
});

/// State for the paginated search/browse screen.
class SearchState {
  final ClubFilter filter;
  final List<Club> clubs;
  final PageMeta meta;
  final bool loading;
  final bool loadingMore;
  final Object? error;

  const SearchState({
    required this.filter,
    required this.clubs,
    required this.meta,
    required this.loading,
    required this.loadingMore,
    required this.error,
  });

  factory SearchState.initial(ClubFilter filter) => SearchState(
        filter: filter,
        clubs: const [],
        meta: PageMeta.empty,
        loading: true,
        loadingMore: false,
        error: null,
      );

  bool get hasMore => meta.hasMore;

  SearchState copyWith({
    ClubFilter? filter,
    List<Club>? clubs,
    PageMeta? meta,
    bool? loading,
    bool? loadingMore,
    Object? error,
    bool clearError = false,
  }) {
    return SearchState(
      filter: filter ?? this.filter,
      clubs: clubs ?? this.clubs,
      meta: meta ?? this.meta,
      loading: loading ?? this.loading,
      loadingMore: loadingMore ?? this.loadingMore,
      error: clearError ? null : (error ?? this.error),
    );
  }
}

/// Drives the search screen: holds the active filter and paginated results.
class ClubSearchController extends Notifier<SearchState> {
  @override
  SearchState build() {
    return SearchState(
      filter: const ClubFilter(),
      clubs: const [],
      meta: PageMeta.empty,
      loading: false,
      loadingMore: false,
      error: null,
    );
  }

  Future<void> _load(ClubFilter filter, {required bool reset, int page = 1}) async {
    if (!filter.shouldQueryCatalog) {
      state = state.copyWith(
        filter: filter,
        clubs: const [],
        meta: PageMeta.empty,
        loading: false,
        loadingMore: false,
        clearError: true,
      );
      return;
    }

    if (reset) {
      state = state.copyWith(
        filter: filter,
        clubs: const [],
        loading: true,
        loadingMore: false,
        clearError: true,
      );
    } else {
      state = state.copyWith(loadingMore: true, clearError: true);
    }

    try {
      final result =
          await ref.read(clubRepositoryProvider).listClubs(filter, page: page);
      final items = reset ? result.items : [...state.clubs, ...result.items];
      state = state.copyWith(
        clubs: items,
        meta: result.meta,
        loading: false,
        loadingMore: false,
      );
    } catch (e) {
      state = state.copyWith(loading: false, loadingMore: false, error: e);
    }
  }

  Future<void> applyFilter(ClubFilter filter) => _load(filter, reset: true);

  Future<void> setSearch(String query) {
    final trimmed = query.trim();
    final next = trimmed.isEmpty
        ? state.filter.copyWith(clearSearch: true)
        : state.filter.copyWith(search: trimmed);
    return _load(next, reset: true);
  }

  Future<void> refresh() => _load(state.filter, reset: true);

  Future<void> loadMore() async {
    if (!state.hasMore || state.loadingMore || state.loading) return;
    await _load(state.filter, reset: false, page: state.meta.page + 1);
  }
}

final searchControllerProvider =
    NotifierProvider<ClubSearchController, SearchState>(ClubSearchController.new);
