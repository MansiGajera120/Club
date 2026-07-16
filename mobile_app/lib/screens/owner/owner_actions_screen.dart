import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../models/club_model.dart';
import '../../providers/owner_providers.dart';
import '../../routes/route_names.dart';
import '../../theme/theme.dart';
import '../../widgets/widgets.dart';
import 'event_form_screen.dart';

/// Owner-only publishing workspace with actions relevant to club owners.
class OwnerActionsScreen extends ConsumerWidget {
  const OwnerActionsScreen({super.key});

  Future<void> _openClubForm(
    BuildContext context,
    WidgetRef ref, {
    Club? club,
  }) async {
    await context.pushNamed(RouteNames.clubForm, extra: club);
    ref.invalidate(myClubsProvider);
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final clubsAsync = ref.watch(myClubsProvider);

    return Scaffold(
      backgroundColor: Colors.transparent,
      appBar: AppBar(title: const Text('Owner tools')),
      body: clubsAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (_, _) => const EmptyState(
          icon: Icons.build_circle_outlined,
          title: 'Could not load owner tools',
        ),
        data: (clubs) {
          final approvedClubs =
              clubs.where((c) => c.status == 'approved').toList();

          return ListView(
            padding: const EdgeInsets.fromLTRB(
              AppSpacing.lg,
              AppSpacing.lg,
              AppSpacing.lg,
              AppSpacing.xl,
            ),
            children: [
              AppCard(
                variant: AppCardVariant.outlined,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    if (clubs.isEmpty)
                      AppButton(
                        label: 'Register new club',
                        icon: Icons.add_business_outlined,
                        onPressed: () => _openClubForm(context, ref),
                      )
                    else ...[
                      AppButton(
                        label: 'Edit my club',
                        icon: Icons.edit_outlined,
                        onPressed: () =>
                            context.pushNamed(RouteNames.editProfile),
                      ),
                      const SizedBox(height: AppSpacing.md),
                    ],
                    AppButton(
                      label: 'Search clubs',
                      icon: Icons.search_rounded,
                      variant: AppButtonVariant.outline,
                      onPressed: () => context.go(RouteNames.searchPath),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: AppSpacing.xl),
              Text(
                'Create event for',
                style: Theme.of(context).textTheme.titleLarge,
              ),
              const SizedBox(height: AppSpacing.md),
              if (approvedClubs.isEmpty)
                AppCard(
                  variant: AppCardVariant.outlined,
                  child: const EmptyState(
                    icon: Icons.event_busy_outlined,
                    title: 'No approved clubs yet',
                    message:
                        'Your club needs approval before you can publish events.',
                  ),
                )
              else
                AppCard(
                  padding: EdgeInsets.zero,
                  variant: AppCardVariant.outlined,
                  child: Column(
                    children: [
                      for (var i = 0; i < approvedClubs.length; i++) ...[
                        if (i > 0)
                          const Divider(
                            height: 1,
                            indent: AppSpacing.lg,
                            endIndent: AppSpacing.lg,
                          ),
                        InkWell(
                          onTap: () => context.pushNamed(
                            RouteNames.eventForm,
                            extra: EventFormArgs(clubId: approvedClubs[i].id),
                          ),
                          child: Padding(
                            padding: const EdgeInsets.all(AppSpacing.lg),
                            child: Row(
                              children: [
                                DecoratedBox(
                                  decoration: BoxDecoration(
                                    borderRadius: AppRadius.mdAll,
                                    border: Border.all(color: AppColors.border),
                                  ),
                                  child: CachedImage(
                                    url: approvedClubs[i].logo,
                                    width: 52,
                                    height: 52,
                                    borderRadius: AppRadius.mdAll,
                                  ),
                                ),
                                const SizedBox(width: AppSpacing.md),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        approvedClubs[i].name,
                                        style: Theme.of(context)
                                            .textTheme
                                            .titleMedium,
                                      ),
                                      const SizedBox(height: AppSpacing.xs),
                                      Text(
                                        'Create a new event for this club',
                                        style: Theme.of(context)
                                            .textTheme
                                            .bodySmall
                                            ?.copyWith(
                                              color: AppColors.textSecondary,
                                            ),
                                      ),
                                    ],
                                  ),
                                ),
                                Container(
                                  padding: const EdgeInsets.all(6),
                                  decoration: BoxDecoration(
                                    color: AppColors.primary
                                        .withValues(alpha: 0.10),
                                    borderRadius: AppRadius.mdAll,
                                    border: Border.all(
                                      color: AppColors.primary
                                          .withValues(alpha: 0.18),
                                    ),
                                  ),
                                  child: const Icon(
                                    Icons.add_rounded,
                                    color: AppColors.primary,
                                    size: 20,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ],
                    ],
                  ),
                ),
            ],
          );
        },
      ),
    );
  }
}
