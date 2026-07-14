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
import '../../utils/formatters.dart';
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
              loading: () => const _GridSkeleton(),
              error: (e, _) => const SliverToBoxAdapter(
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
                      sliver: SliverGrid(
                        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                          crossAxisCount: 1,
                          mainAxisSpacing: AppSpacing.md,
                          crossAxisSpacing: AppSpacing.md,
                          childAspectRatio: 1.35,
                        ),
                        delegate: SliverChildBuilderDelegate(
                          (context, i) => _ExploreClubGridCard(
                            club: clubs[i],
                            onTap: () => _openClub(context, clubs[i].id),
                          ),
                          childCount: clubs.length,
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

class _GridSkeleton extends StatelessWidget {
  const _GridSkeleton();

  @override
  Widget build(BuildContext context) {
    return SliverPadding(
      padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
      sliver: SliverGrid(
        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: 1,
          mainAxisSpacing: AppSpacing.md,
          crossAxisSpacing: AppSpacing.md,
          childAspectRatio: 1.35,
        ),
        delegate: SliverChildBuilderDelegate(
          (context, i) => AppSkeleton(borderRadius: AppRadius.lgAll),
          childCount: 4,
        ),
      ),
    );
  }
}

class _ExploreClubGridCard extends StatelessWidget {
  final Club club;
  final VoidCallback onTap;

  const _ExploreClubGridCard({
    required this.club,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final String? imageUrl = club.gallery.isNotEmpty ? club.gallery.first : club.logo;

    return DecoratedBox(
      decoration: BoxDecoration(
        color: theme.cardTheme.color ?? theme.colorScheme.surface,
        borderRadius: AppRadius.lgAll,
        border: Border.all(color: theme.dividerColor),
        boxShadow: AppShadows.sm,
      ),
      child: Material(
        color: Colors.transparent,
        borderRadius: AppRadius.lgAll,
        clipBehavior: Clip.antiAlias,
        child: InkWell(
          onTap: onTap,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Expanded(
                child: Stack(
                  children: [
                    Positioned.fill(
                      child: CachedImage(
                        url: imageUrl,
                        fit: BoxFit.cover,
                      ),
                    ),
                    const Positioned.fill(
                      child: DecoratedBox(
                        decoration: BoxDecoration(
                          gradient: LinearGradient(
                            begin: Alignment.topCenter,
                            end: Alignment.bottomCenter,
                            colors: [Colors.transparent, Colors.black45],
                          ),
                        ),
                      ),
                    ),
                    if (club.isFeatured)
                      Positioned(
                        top: 10,
                        left: 10,
                        child: Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 8,
                            vertical: 3,
                          ),
                          decoration: BoxDecoration(
                            color: AppColors.primary,
                            borderRadius: AppRadius.pillAll,
                          ),
                          child: const Text(
                            'Featured',
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: 9,
                              fontWeight: FontWeight.w700,
                              letterSpacing: 0.3,
                            ),
                          ),
                        ),
                      ),
                    if (club.sport != null && club.sport!.isNotEmpty)
                      Positioned(
                        left: AppSpacing.md,
                        bottom: AppSpacing.md,
                        child: Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 10,
                            vertical: 4,
                          ),
                          decoration: BoxDecoration(
                            color: AppColors.primary,
                            borderRadius: AppRadius.pillAll,
                          ),
                          child: Text(
                            club.sport!.toUpperCase(),
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 9,
                              fontWeight: FontWeight.w700,
                              letterSpacing: 0.3,
                            ),
                          ),
                        ),
                      ),
                    Positioned(
                      top: 10,
                      right: 10,
                      child: Container(
                        decoration: BoxDecoration(
                          color: theme.colorScheme.surface.withValues(alpha: 0.90),
                          shape: BoxShape.circle,
                        ),
                        child: ClubFavoriteButton(
                          club: club,
                          iconSize: 18,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              Padding(
                padding: const EdgeInsets.all(AppSpacing.md),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      club.name,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: theme.textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    const SizedBox(height: 2),
                    if (club.city != null && club.city!.isNotEmpty) ...[
                      Row(
                        children: [
                          Icon(
                            Icons.location_on_outlined,
                            size: 13,
                            color: theme.textTheme.bodySmall?.color ?? AppColors.textSecondary,
                          ),
                          const SizedBox(width: 3),
                          Expanded(
                            child: Text(
                              club.city!,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: theme.textTheme.bodySmall,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 6),
                    ],
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Expanded(
                          child: Text(
                            '${Formatters.genderLabel(club.gender)} · Ages ${club.ageMin}-${club.ageMax}',
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: theme.textTheme.bodySmall?.copyWith(
                              fontSize: 10.5,
                            ),
                          ),
                        ),
                        const SizedBox(width: 4),
                        Text(
                          Formatters.price(club.price, club.priceCurrency),
                          style: theme.textTheme.titleSmall?.copyWith(
                            color: AppColors.primary,
                            fontWeight: FontWeight.w800,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
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
