import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../models/club_filter.dart';
import '../../providers/club_providers.dart';
import '../../routes/route_names.dart';
import '../../theme/app_colors.dart';
import '../../theme/app_radius.dart';
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
      body: GestureDetector(
        onTap: () => _searchFocusNode.unfocus(),
        behavior: HitTestBehavior.translucent,
        child: RefreshIndicator(
          onRefresh: ref.read(searchControllerProvider.notifier).refresh,
          child: CustomScrollView(
            controller: _scrollController,
            physics: const AlwaysScrollableScrollPhysics(),
            slivers: [
              SliverToBoxAdapter(
                child: PageHero(
                  overline: 'SEARCH',
                  title: 'Find a club',
                  subtitle:
                      'Filter by city, age and more to narrow things down.',
                ),
              ),
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(
                    AppSpacing.lg,
                    AppSpacing.lg,
                    AppSpacing.lg,
                    0,
                  ),
                  child: TextField(
                    controller: _searchController,
                    focusNode: _searchFocusNode,
                    autofocus: false,
                    textInputAction: TextInputAction.search,
                    decoration: InputDecoration(
                      hintText: 'Search city, organization, keywords…',
                      prefixIcon: const Icon(Icons.search),
                      // Clear (when there's text) and filter share the suffix.
                      // Default suffix constraints would stretch the row, so
                      // they're relaxed to let it size to its children.
                      suffixIconConstraints: const BoxConstraints(
                        minWidth: 0,
                        minHeight: 0,
                      ),
                      suffixIcon: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          if (_searchController.text.isNotEmpty)
                            IconButton(
                              icon: const Icon(Icons.close_rounded, size: 20),
                              onPressed: _clearSearch,
                              tooltip: 'Clear search',
                              visualDensity: VisualDensity.compact,
                            ),
                          Padding(
                            padding: const EdgeInsets.only(
                              right: AppSpacing.sm,
                            ),
                            child: _FilterButton(
                              active: state.filter.hasActiveFilters,
                              onTap: () => _openFilters(state.filter),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ),
              ..._resultSlivers(state),
            ],
          ),
        ),
      ),
    );
  }

  /// Results area as slivers so the hero and search field scroll with the list.
  List<Widget> _resultSlivers(SearchState state) {
    final notifier = ref.read(searchControllerProvider.notifier);

    if (state.loading && state.clubs.isEmpty) {
      return [const _ResultsSkeleton()];
    }

    if (state.error != null && state.clubs.isEmpty) {
      return [
        SliverFillRemaining(
          hasScrollBody: false,
          child: EmptyState(
            icon: Icons.wifi_off,
            title: 'Something went wrong',
            message: 'Pull to try again.',
            actionLabel: 'Retry',
            onAction: notifier.refresh,
          ),
        ),
      ];
    }

    if (state.clubs.isEmpty) {
      final query = state.filter.search?.trim() ?? '';
      final hasQuery = query.isNotEmpty;
      final queryTooShort = hasQuery && query.length < 2;
      final hasFilters = state.filter.hasActiveFilters;

      if (queryTooShort && !hasFilters) {
        return [
          const SliverFillRemaining(
            hasScrollBody: false,
            child: EmptyState(
              icon: Icons.keyboard_outlined,
              title: 'Keep typing…',
              message: 'Enter at least 2 characters to search clubs.',
            ),
          ),
        ];
      }

      return [
        SliverFillRemaining(
          hasScrollBody: false,
          child: EmptyState(
            icon: hasQuery || hasFilters
                ? Icons.search_off
                : Icons.travel_explore_outlined,
            title: hasQuery || hasFilters ? 'No clubs found' : 'Search clubs',
            message: hasQuery || hasFilters
                ? 'Try a different keyword or adjust your filters.'
                : 'Type a city, organization name, or keywords to see matching results.',
          ),
        ),
      ];
    }

    return [
      SliverPadding(
        padding: const EdgeInsets.fromLTRB(
          AppSpacing.lg,
          AppSpacing.md,
          AppSpacing.lg,
          AppSpacing.xl,
        ),
        sliver: SliverList.separated(
          itemCount: state.clubs.length + (state.hasMore ? 1 : 0),
          separatorBuilder: (_, _) => const SizedBox(height: AppSpacing.md),
          itemBuilder: (_, i) {
            // Trailing skeleton doubles as the "loading more" affordance.
            if (i >= state.clubs.length) return const AppSkeleton(height: 96);
            final club = state.clubs[i];
            return ClubCard(
              club: club,
              onTap: () => _openClub(club.id),
              showFavorite: true,
            );
          },
        ),
      ),
    ];
  }
}

/// Filter affordance living inside the search field's suffix. A brand-tinted
/// tile that fills in solid once filters are active, so its state is obvious at
/// a glance — Material's stock `IconButton.filledTonal` ignores the brand
/// palette. Sized to sit within the field's 16px vertical padding.
class _FilterButton extends StatelessWidget {
  final bool active;
  final VoidCallback onTap;
  const _FilterButton({required this.active, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return PressableScale(
      child: Material(
        color: active
            ? AppColors.primary
            : AppColors.primary.withValues(alpha: 0.08),
        borderRadius: AppRadius.smAll,
        clipBehavior: Clip.antiAlias,
        child: InkWell(
          onTap: onTap,
          child: SizedBox(
            width: 36,
            height: 36,
            child: Icon(
              Icons.tune_rounded,
              size: 18,
              color: active ? Colors.white : AppColors.primary,
            ),
          ),
        ),
      ),
    );
  }
}

class _ResultsSkeleton extends StatelessWidget {
  const _ResultsSkeleton();

  @override
  Widget build(BuildContext context) {
    return SliverPadding(
      padding: const EdgeInsets.fromLTRB(
        AppSpacing.lg,
        AppSpacing.md,
        AppSpacing.lg,
        AppSpacing.xl,
      ),
      sliver: SliverList.separated(
        itemCount: 5,
        separatorBuilder: (_, _) => const SizedBox(height: AppSpacing.md),
        itemBuilder: (_, _) => const AppSkeleton(height: 96),
      ),
    );
  }
}
