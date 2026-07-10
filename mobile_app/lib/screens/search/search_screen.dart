import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../models/club_filter.dart';
import '../../providers/club_providers.dart';
import '../../routes/route_names.dart';
import '../../theme/app_spacing.dart';
import '../../widgets/widgets.dart';
import 'widgets/filter_sheet.dart';

/// Search tab: live keyword search + filters over the club catalog.
class SearchScreen extends ConsumerStatefulWidget {
  const SearchScreen({super.key});

  @override
  ConsumerState<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends ConsumerState<SearchScreen> {
  final _scrollController = ScrollController();
  final _searchController = TextEditingController();
  final _searchFocusNode = FocusNode();
  Timer? _debounce;

  @override
  void initState() {
    super.initState();
    _scrollController.addListener(_onScroll);
    _searchController.addListener(_onSearchTextChanged);
  }

  @override
  void dispose() {
    _debounce?.cancel();
    _searchController.removeListener(_onSearchTextChanged);
    _scrollController.dispose();
    _searchController.dispose();
    _searchFocusNode.dispose();
    super.dispose();
  }

  void _onScroll() {
    if (_scrollController.position.pixels >=
        _scrollController.position.maxScrollExtent - 300) {
      ref.read(searchControllerProvider.notifier).loadMore();
    }
  }

  void _onSearchTextChanged() {
    setState(() {});

    _debounce?.cancel();
    _debounce = Timer(const Duration(milliseconds: 350), () {
      final query = _searchController.text.trim();
      final current = ref.read(searchControllerProvider).filter.search ?? '';
      if (query == current) return;
      ref.read(searchControllerProvider.notifier).setSearch(query);
    });
  }

  void _clearSearch() {
    _searchController.clear();
    ref.read(searchControllerProvider.notifier).setSearch('');
  }

  Future<void> _openFilters(ClubFilter current) async {
    _searchFocusNode.unfocus();
    FocusManager.instance.primaryFocus?.unfocus();

    final result = await showModalBottomSheet<ClubFilter>(
      context: context,
      isScrollControlled: true,
      useSafeArea: true,
      backgroundColor: Colors.transparent,
      builder: (_) => FilterSheet(initial: current),
    );

    if (!mounted) return;

    if (result != null) {
      ref.read(searchControllerProvider.notifier).applyFilter(result);
    }

    // Bottom sheet dismiss can restore focus to the search field — keep keyboard closed.
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) _searchFocusNode.unfocus();
    });
  }

  void _openClub(String id) =>
      context.pushNamed(RouteNames.clubDetail, pathParameters: {'id': id});

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(searchControllerProvider);

    return Scaffold(
      backgroundColor: Colors.transparent,
      appBar: AppBar(title: const Text('Search'), centerTitle: false),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(
                AppSpacing.lg, 0, AppSpacing.lg, AppSpacing.sm),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _searchController,
                    focusNode: _searchFocusNode,
                    autofocus: false,
                    textInputAction: TextInputAction.search,
                    decoration: InputDecoration(
                      hintText: 'Search clubs, city, sport…',
                      prefixIcon: const Icon(Icons.search),
                      suffixIcon: _searchController.text.isEmpty
                          ? null
                          : IconButton(
                              icon: const Icon(Icons.close),
                              onPressed: _clearSearch,
                            ),
                    ),
                  ),
                ),
                const SizedBox(width: AppSpacing.sm),
                IconButton.filledTonal(
                  onPressed: () => _openFilters(state.filter),
                  icon: Badge(
                    isLabelVisible: state.filter.hasActiveFilters,
                    child: const Icon(Icons.tune),
                  ),
                ),
              ],
            ),
          ),
          Expanded(
            child: GestureDetector(
              onTap: () => _searchFocusNode.unfocus(),
              behavior: HitTestBehavior.translucent,
              child: _buildResults(state),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildResults(SearchState state) {
    final notifier = ref.read(searchControllerProvider.notifier);

    if (state.loading && state.clubs.isEmpty) {
      return ListView(
        children: List.generate(
          5,
          (_) => const Padding(
            padding: EdgeInsets.fromLTRB(
                AppSpacing.lg, 0, AppSpacing.lg, AppSpacing.md),
            child: AppSkeleton(height: 96),
          ),
        ),
      );
    }

    if (state.error != null && state.clubs.isEmpty) {
      return EmptyState(
        icon: Icons.wifi_off,
        title: 'Something went wrong',
        message: 'Pull to try again.',
        actionLabel: 'Retry',
        onAction: notifier.refresh,
      );
    }

    if (state.clubs.isEmpty) {
      final query = state.filter.search?.trim() ?? '';
      final hasQuery = query.isNotEmpty;
      final queryTooShort = hasQuery && query.length < 2;
      final hasFilters = state.filter.hasActiveFilters;

      if (queryTooShort && !hasFilters) {
        return EmptyState(
          icon: Icons.keyboard_outlined,
          title: 'Keep typing…',
          message: 'Enter at least 2 characters to search clubs.',
        );
      }

      return EmptyState(
        icon: hasQuery || hasFilters
            ? Icons.search_off
            : Icons.travel_explore_outlined,
        title: hasQuery || hasFilters ? 'No clubs found' : 'Search clubs',
        message: hasQuery || hasFilters
            ? 'Try a different keyword or adjust your filters.'
            : 'Type a club name, city, or sport to see matching results.',
      );
    }

    return RefreshIndicator(
      onRefresh: notifier.refresh,
      child: ListView.separated(
        controller: _scrollController,
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.fromLTRB(
            AppSpacing.lg, 0, AppSpacing.lg, 100),
        itemCount: state.clubs.length + (state.hasMore ? 1 : 0),
        separatorBuilder: (_, _) => const SizedBox(height: AppSpacing.md),
        itemBuilder: (_, i) {
          if (i >= state.clubs.length) {
            return const Padding(
              padding: EdgeInsets.all(AppSpacing.md),
              child: Center(child: CircularProgressIndicator()),
            );
          }
          final club = state.clubs[i];
          return ClubCard(
            club: club,
            onTap: () => _openClub(club.id),
            showFavorite: true,
          );
        },
      ),
    );
  }
}
