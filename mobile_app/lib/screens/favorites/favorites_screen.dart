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
      appBar: AppBar(title: const Text('Favorites'), centerTitle: false),
      body: favorites.when(
        loading: () => ListView(
          children: List.generate(
            4,
            (_) => const Padding(
              padding: EdgeInsets.fromLTRB(
                  AppSpacing.lg, AppSpacing.md, AppSpacing.lg, 0),
              child: AppSkeleton(height: 96),
            ),
          ),
        ),
        error: (_, _) => const EmptyState(
          icon: Icons.favorite_border,
          title: 'No favorites yet',
          message: 'Save clubs you love to find them here.',
        ),
        data: (clubs) {
          if (clubs.isEmpty) {
            return const EmptyState(
              icon: Icons.favorite_border,
              title: 'No favorites yet',
              message: 'Tap the heart on a club to save it here.',
            );
          }
          return RefreshIndicator(
            onRefresh: () =>
                ref.read(favoritesControllerProvider.notifier).refresh(),
            child: ListView.separated(
              padding: const EdgeInsets.fromLTRB(
                  AppSpacing.lg, AppSpacing.lg, AppSpacing.lg, AppSpacing.xl),
              itemCount: clubs.length,
              separatorBuilder: (_, _) => const SizedBox(height: AppSpacing.md),
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
    );
  }
}
