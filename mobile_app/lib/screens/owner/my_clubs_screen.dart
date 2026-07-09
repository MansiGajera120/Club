import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../models/club_model.dart';
import '../../providers/owner_providers.dart';
import '../../routes/route_names.dart';
import '../../theme/app_colors.dart';
import '../../theme/app_radius.dart';
import '../../theme/app_spacing.dart';
import '../../widgets/widgets.dart';

/// Club owner's dashboard: their clubs with status, plus create/edit/add-event.
class MyClubsScreen extends ConsumerWidget {
  const MyClubsScreen({super.key});

  Color _statusColor(String status) {
    switch (status) {
      case 'approved':
        return AppColors.success;
      case 'pending':
        return AppColors.warning;
      case 'rejected':
      case 'suspended':
        return AppColors.danger;
      default:
        return AppColors.textSecondary;
    }
  }

  Future<void> _openForm(BuildContext context, WidgetRef ref, {Club? club}) async {
    await context.pushNamed(RouteNames.clubForm, extra: club);
    ref.invalidate(myClubsProvider);
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final clubs = ref.watch(myClubsProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('My clubs')),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => _openForm(context, ref),
        icon: const Icon(Icons.add),
        label: const Text('Register club'),
      ),
      body: clubs.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (_, _) => const EmptyState(
          icon: Icons.error_outline,
          title: 'Could not load your clubs',
        ),
        data: (list) {
          if (list.isEmpty) {
            return const EmptyState(
              icon: Icons.storefront_outlined,
              title: 'No clubs yet',
              message: 'Register your club to get started. It will be reviewed '
                  'before appearing to parents.',
            );
          }
          return ListView.separated(
            padding: const EdgeInsets.all(AppSpacing.lg),
            itemCount: list.length,
            separatorBuilder: (_, _) => const SizedBox(height: AppSpacing.md),
            itemBuilder: (_, i) {
              final club = list[i];
              return AppCard(
                variant: AppCardVariant.outlined,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        DecoratedBox(
                          decoration: BoxDecoration(
                            borderRadius: AppRadius.mdAll,
                            border: Border.all(color: AppColors.border),
                          ),
                          child: CachedImage(
                            url: club.logo,
                            width: 56,
                            height: 56,
                            borderRadius: AppRadius.mdAll,
                          ),
                        ),
                        const SizedBox(width: AppSpacing.md),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(club.name,
                                  style: Theme.of(context).textTheme.titleMedium),
                              const SizedBox(height: 4),
                              Container(
                                padding: const EdgeInsets.symmetric(
                                    horizontal: 8, vertical: 2),
                                decoration: BoxDecoration(
                                  color: _statusColor(club.status)
                                      .withValues(alpha: 0.12),
                                  borderRadius: AppRadius.pillAll,
                                ),
                                child: Text(
                                  club.status.toUpperCase(),
                                  style: TextStyle(
                                    color: _statusColor(club.status),
                                    fontSize: 11,
                                    fontWeight: FontWeight.w700,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                    if (club.status == 'rejected' &&
                        club.rejectionReason != null) ...[
                      const SizedBox(height: AppSpacing.sm),
                      Text('Reason: ${club.rejectionReason}',
                          style: Theme.of(context).textTheme.bodySmall),
                    ],
                    const SizedBox(height: AppSpacing.sm),
                    Row(
                      children: [
                        TextButton.icon(
                          onPressed: () => _openForm(context, ref, club: club),
                          icon: const Icon(Icons.edit_outlined, size: 18),
                          label: const Text('Edit'),
                        ),
                        TextButton.icon(
                          onPressed: () => context.pushNamed(
                            RouteNames.eventForm,
                            extra: club.id,
                          ),
                          icon: const Icon(Icons.event, size: 18),
                          label: const Text('Add event'),
                        ),
                      ],
                    ),
                  ],
                ),
              );
            },
          );
        },
      ),
    );
  }
}
