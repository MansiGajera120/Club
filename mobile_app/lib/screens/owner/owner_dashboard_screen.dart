import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../providers/owner_providers.dart';
import '../../routes/route_names.dart';
import '../../theme/theme.dart';
import '../../widgets/widgets.dart';

/// Owner-first dashboard shown in the bottom-nav shell for club owners.
class OwnerDashboardScreen extends ConsumerWidget {
  const OwnerDashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final clubsAsync = ref.watch(myClubsProvider);

    return Scaffold(
      backgroundColor: Colors.transparent,
      appBar: AppBar(title: const Text('Owner dashboard')),
      body: clubsAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (_, _) => const EmptyState(
          icon: Icons.dashboard_customize_outlined,
          title: 'Could not load dashboard',
          message: 'Please try again in a moment.',
        ),
        data: (clubs) {
          final approved = clubs.where((c) => c.status == 'approved').length;
          final pending = clubs.where((c) => c.status == 'pending').length;
          final rejected = clubs
              .where((c) => c.status == 'rejected' || c.status == 'suspended')
              .length;

          return RefreshIndicator(
            onRefresh: () async {
              ref.invalidate(myClubsProvider);
              await ref.read(myClubsProvider.future);
            },
            child: ListView(
              padding: const EdgeInsets.fromLTRB(
                AppSpacing.lg,
                AppSpacing.lg,
                AppSpacing.lg,
                100,
              ),
              physics: const AlwaysScrollableScrollPhysics(),
              children: [
                AppCard(
                  padding: EdgeInsets.zero,
                  variant: AppCardVariant.outlined,
                  child: Column(
                    children: [
                      Row(
                        children: [
                          Expanded(
                            child: AppMetricCell(
                              label: 'Total clubs',
                              value: clubs.length.toString(),
                            ),
                          ),
                          Container(
                            width: 1,
                            height: 52,
                            color: AppColors.border,
                          ),
                          Expanded(
                            child: AppMetricCell(
                              label: 'Approved',
                              value: approved.toString(),
                              valueColor: AppColors.success,
                            ),
                          ),
                        ],
                      ),
                      const Divider(height: 1),
                      Row(
                        children: [
                          Expanded(
                            child: AppMetricCell(
                              label: 'Pending',
                              value: pending.toString(),
                              valueColor: AppColors.warning,
                            ),
                          ),
                          Container(
                            width: 1,
                            height: 52,
                            color: AppColors.border,
                          ),
                          Expanded(
                            child: AppMetricCell(
                              label: 'Needs action',
                              value: rejected.toString(),
                              valueColor: AppColors.danger,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: AppSpacing.xl),
                Text(
                  'Quick actions',
                  style: Theme.of(context).textTheme.titleLarge,
                ),
                const SizedBox(height: AppSpacing.md),
                AppCard(
                  padding: EdgeInsets.zero,
                  variant: AppCardVariant.outlined,
                  child: Column(
                    children: [
                      AppListTileCard(
                        icon: Icons.storefront_outlined,
                        title: 'Manage my club',
                        subtitle: 'Edit details and club information.',
                        onTap: () => context.go(RouteNames.searchPath),
                      ),
                      AppListTileCard(
                        icon: Icons.event_available_outlined,
                        title: 'Manage club events',
                        subtitle: 'Create and publish events for your club.',
                        onTap: () => context.go(RouteNames.eventsPath),
                        showDivider: false,
                      ),
                    ],
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}
