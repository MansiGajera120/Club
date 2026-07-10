import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../models/club_model.dart';
import '../../providers/club_providers.dart';
import '../../routes/route_names.dart';
import '../../theme/app_colors.dart';
import '../../theme/app_gradients.dart';
import '../../theme/app_radius.dart';
import '../../theme/app_shadows.dart';
import '../../theme/app_spacing.dart';
import '../../widgets/widgets.dart';

/// Home tab: editorial header, featured carousel and explore list.
class HomeScreen extends ConsumerWidget {
  const HomeScreen({super.key});

  void _openClub(BuildContext context, String id) {
    context.pushNamed(RouteNames.clubDetail, pathParameters: {'id': id});
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final featured = ref.watch(featuredClubsProvider);
    final recent = ref.watch(recentClubsProvider);
    final theme = Theme.of(context);

    return Scaffold(
      backgroundColor: Colors.transparent,
      body: RefreshIndicator(
        onRefresh: () async {
          ref.invalidate(featuredClubsProvider);
          ref.invalidate(recentClubsProvider);
          await Future.wait([
            ref.read(featuredClubsProvider.future),
            ref.read(recentClubsProvider.future),
          ]);
        },
        child: CustomScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          slivers: [
            SliverToBoxAdapter(child: _HeroHeader(theme: theme)),
            const SliverToBoxAdapter(child: _SectionHeader(title: 'Featured')),
            SliverToBoxAdapter(
              child: SizedBox(
                height: 220,
                child: featured.when(
                  loading: () => const _FeaturedSkeleton(),
                  error: (_, _) => const SizedBox.shrink(),
                  data: (clubs) => clubs.isEmpty
                      ? const _InlineEmpty(text: 'No featured clubs yet')
                      : _FeaturedCarousel(
                          clubs: clubs,
                          onTap: (club) => _openClub(context, club.id),
                        ),
                ),
              ),
            ),
            const SliverToBoxAdapter(
              child: _SectionHeader(title: 'Explore clubs'),
            ),
            recent.when(
              loading: () => const SliverToBoxAdapter(child: _ListSkeleton()),
              error: (e, _) => SliverToBoxAdapter(
                child: _InlineEmpty(text: 'Could not load clubs'),
              ),
              data: (clubs) => clubs.isEmpty
                  ? const SliverFillRemaining(
                      hasScrollBody: false,
                      child: EmptyState(
                        icon: Icons.sports_soccer_rounded,
                        title: 'No clubs yet',
                        message: 'Check back soon as new clubs join.',
                      ),
                    )
                  : SliverPadding(
                      padding: const EdgeInsets.fromLTRB(
                        AppSpacing.lg,
                        0,
                        AppSpacing.lg,
                        100,
                      ),
                      sliver: SliverList.separated(
                        itemCount: clubs.length,
                        separatorBuilder: (_, _) =>
                            const SizedBox(height: AppSpacing.md),
                        itemBuilder: (_, i) => ClubCard(
                          club: clubs[i],
                          onTap: () => _openClub(context, clubs[i].id),
                          showFavorite: true,
                        ),
                      ),
                    ),
            ),
          ],
        ),
      ),
    );
  }
}

class _HeroHeader extends StatelessWidget {
  final ThemeData theme;
  const _HeroHeader({required this.theme});

  @override
  Widget build(BuildContext context) {
    // Push the header below the status bar/notch, plus a little breathing room.
    final topInset = MediaQuery.paddingOf(context).top;
    return Padding(
      padding: EdgeInsets.fromLTRB(
        AppSpacing.lg,
        topInset + AppSpacing.xl,
        AppSpacing.lg,
        AppSpacing.sm,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'DISCOVER',
            style: theme.textTheme.labelSmall,
          ),
          const SizedBox(height: AppSpacing.sm),
          Text(
            'Find your next club',
            style: theme.textTheme.headlineLarge,
          ),
          const SizedBox(height: AppSpacing.sm),
          Text(
            'Browse featured clubs and explore what\'s near you.',
            style: theme.textTheme.bodyMedium,
          ),
        ],
      ),
    );
  }
}

class _SectionHeader extends StatelessWidget {
  final String title;
  const _SectionHeader({required this.title});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Padding(
      padding: const EdgeInsets.fromLTRB(
          AppSpacing.lg, AppSpacing.xl, AppSpacing.lg, AppSpacing.md),
      child: Row(
        children: [
          Text(
            title,
            style: theme.textTheme.titleLarge,
          ),
          const Spacer(),
          Container(
            width: 32,
            height: 3,
            decoration: BoxDecoration(
              color: AppColors.primary.withValues(alpha: 0.35),
              borderRadius: AppRadius.pillAll,
            ),
          ),
        ],
      ),
    );
  }
}

/// Featured clubs shown as a continuously scrolling marquee. Items loop
/// seamlessly and the strip advances on its own; tapping a card still opens it.
class _FeaturedCarousel extends StatefulWidget {
  final List<Club> clubs;
  final void Function(Club club) onTap;
  const _FeaturedCarousel({required this.clubs, required this.onTap});

  @override
  State<_FeaturedCarousel> createState() => _FeaturedCarouselState();
}

class _FeaturedCarouselState extends State<_FeaturedCarousel> {
  static const double _cardWidth = 260;
  static const double _gap = AppSpacing.md;
  static const double _itemExtent = _cardWidth + _gap;
  static const double _pixelsPerTick = 0.6;

  final ScrollController _controller = ScrollController();
  Timer? _timer;
  Timer? _resumeTimer;
  bool _autoScrolling = true;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _startAutoScroll());
  }

  @override
  void didUpdateWidget(covariant _FeaturedCarousel oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.clubs.length != widget.clubs.length) {
      _startAutoScroll();
    }
  }

  void _pauseAutoScroll() {
    _autoScrolling = false;
    _timer?.cancel();
    _resumeTimer?.cancel();
  }

  void _scheduleResumeAutoScroll() {
    _resumeTimer?.cancel();
    _resumeTimer = Timer(const Duration(seconds: 3), () {
      if (!mounted) return;
      _autoScrolling = true;
      _startAutoScroll();
    });
  }

  void _startAutoScroll() {
    _timer?.cancel();
    if (!mounted || widget.clubs.isEmpty || !_autoScrolling) return;
    _timer = Timer.periodic(const Duration(milliseconds: 16), (_) {
      if (!_autoScrolling || !_controller.hasClients) return;
      final loopExtent = widget.clubs.length * _itemExtent;
      var next = _controller.offset + _pixelsPerTick;
      if (next >= loopExtent) next -= loopExtent;
      _controller.jumpTo(next);
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    _resumeTimer?.cancel();
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final clubs = widget.clubs;
    return Listener(
      onPointerDown: (_) => _pauseAutoScroll(),
      onPointerUp: (_) => _scheduleResumeAutoScroll(),
      onPointerCancel: (_) => _scheduleResumeAutoScroll(),
      child: NotificationListener<ScrollNotification>(
        onNotification: (notification) {
          if (notification is ScrollStartNotification &&
              notification.dragDetails != null) {
            _pauseAutoScroll();
          } else if (notification is ScrollEndNotification) {
            _scheduleResumeAutoScroll();
          }
          return false;
        },
        child: ListView.separated(
          controller: _controller,
          scrollDirection: Axis.horizontal,
          physics: const BouncingScrollPhysics(
            parent: AlwaysScrollableScrollPhysics(),
          ),
          padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
          itemCount: clubs.length * 1000,
          separatorBuilder: (_, _) => const SizedBox(width: _gap),
          itemBuilder: (_, i) {
            final club = clubs[i % clubs.length];
            return _FeaturedCard(club: club, onTap: () => widget.onTap(club));
          },
        ),
      ),
    );
  }
}

class _FeaturedCard extends StatelessWidget {
  final Club club;
  final VoidCallback onTap;
  const _FeaturedCard({required this.club, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 260,
      child: DecoratedBox(
        decoration: BoxDecoration(
          borderRadius: AppRadius.xlAll,
          boxShadow: AppShadows.md,
        ),
        child: Material(
          color: Colors.transparent,
          borderRadius: AppRadius.xlAll,
          clipBehavior: Clip.antiAlias,
          child: InkWell(
            onTap: onTap,
            child: Stack(
              children: [
                CachedImage(
                  url: club.logo,
                  height: 220,
                  width: double.infinity,
                ),
                const Positioned.fill(
                  child: DecoratedBox(decoration: BoxDecoration(gradient: AppGradients.imageOverlay)),
                ),
                Positioned(
                  top: 12,
                  left: 12,
                  child: Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                    decoration: BoxDecoration(
                      color: AppColors.primary,
                      borderRadius: AppRadius.pillAll,
                    ),
                    child: const Text(
                      'Featured',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 11,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ),
                ),
                Positioned(
                  left: 16,
                  right: 16,
                  bottom: 16,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        club.name,
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 17,
                          fontWeight: FontWeight.w700,
                          height: 1.25,
                        ),
                      ),
                      if (club.city != null && club.city!.isNotEmpty) ...[
                        const SizedBox(height: 4),
                        Row(
                          children: [
                            const Icon(Icons.location_on_outlined,
                                size: 14, color: Colors.white70),
                            const SizedBox(width: 4),
                            Expanded(
                              child: Text(
                                club.city!,
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: const TextStyle(
                                  color: Colors.white70,
                                  fontSize: 13,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _FeaturedSkeleton extends StatelessWidget {
  const _FeaturedSkeleton();

  @override
  Widget build(BuildContext context) {
    return ListView.separated(
      scrollDirection: Axis.horizontal,
      padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
      itemCount: 3,
      separatorBuilder: (_, _) => const SizedBox(width: AppSpacing.md),
      itemBuilder: (_, _) => SizedBox(
        width: 260,
        child: AppSkeleton(
          height: 220,
          width: 260,
          borderRadius: AppRadius.xlAll,
        ),
      ),
    );
  }
}

class _ListSkeleton extends StatelessWidget {
  const _ListSkeleton();

  @override
  Widget build(BuildContext context) {
    return Column(
      children: List.generate(
        4,
        (_) => const Padding(
          padding: EdgeInsets.fromLTRB(
              AppSpacing.lg, 0, AppSpacing.lg, AppSpacing.md),
          child: AppSkeleton(height: 96),
        ),
      ),
    );
  }
}

class _InlineEmpty extends StatelessWidget {
  final String text;
  const _InlineEmpty({required this.text});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(AppSpacing.lg),
      child: Text(text, style: Theme.of(context).textTheme.bodyMedium),
    );
  }
}
