import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../providers/favorite_providers.dart';
import '../../routes/route_names.dart';
import '../../theme/app_spacing.dart';
import '../../widgets/widgets.dart';

/// Favorites tab: the parent's saved clubs, with quick un-favorite.
class FavoritesScreen extends ConsumerWidget {
  const FavoritesScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final favorites = ref.watch(favoritesControllerProvider);

    return Scaffold(
      backgroundColor: Colors.transparent,
      body: RefreshIndicator(
        onRefresh: () =>
            ref.read(favoritesControllerProvider.notifier).refresh(),
        child: CustomScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          slivers: [
            const SliverToBoxAdapter(
              child: PageHero(
                overline: 'SAVED',
                title: 'Your favorites',
                subtitle: 'Clubs you\'ve saved, ready when you are.',
              ),
            ),
            favorites.when(
              loading: () => const _FavoritesSkeleton(),
              error: (_, _) => const SliverFillRemaining(
                hasScrollBody: false,
                child: EmptyState(
                  icon: Icons.favorite_border,
                  title: 'Could not load favorites',
                  message: 'Pull down to try again.',
                ),
              ),
              data: (clubs) {
                if (clubs.isEmpty) {
                  return const SliverFillRemaining(
                    hasScrollBody: false,
                    child: EmptyState(
                      icon: Icons.favorite_border,
                      title: 'No favorites yet',
                      message: 'Tap the heart on a club to save it here.',
                    ),
                  );
                }
                return SliverPadding(
                  padding: const EdgeInsets.fromLTRB(
                    AppSpacing.lg,
                    AppSpacing.md,
                    AppSpacing.lg,
                    AppSpacing.xl,
                  ),
                  sliver: SliverList.separated(
                    itemCount: clubs.length,
                    separatorBuilder: (_, _) =>
                        const SizedBox(height: AppSpacing.md),
                    itemBuilder: (_, i) {
                      final club = clubs[i];
                      return ClubCard(
                        club: club,
                        showFavorite: true,
                        onTap: () => context.pushNamed(
                          RouteNames.clubDetail,
                          pathParameters: {'id': club.id},
                        ),
                      );
                    },
                  ),
                );
              },
            ),
          ],
        ),
      ),
    );
  }
}

class _FavoritesSkeleton extends StatelessWidget {
  const _FavoritesSkeleton();

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
        itemCount: 4,
        separatorBuilder: (_, _) => const SizedBox(height: AppSpacing.md),
        itemBuilder: (_, _) => const AppSkeleton(height: 96),
      ),
    );
  }
}
