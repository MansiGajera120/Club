import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../models/club_model.dart';
import '../repositories/user_repository.dart';
import 'club_providers.dart';
import 'core_providers.dart';

final userRepositoryProvider = Provider<UserRepository>((ref) {
  return UserRepository(ref.watch(dioProvider));
});

/// The current club owner's clubs (any status). Refreshable after create/edit.
final myClubsProvider = FutureProvider.autoDispose<List<Club>>((ref) {
  return ref.watch(clubRepositoryProvider).myClubs();
});

/// The owner's single club (or null if they haven't registered one yet). Drives
/// the onboarding gate: null → show the registration form, non-approved → show
/// the status screen, approved → show the dashboard. Refreshes whenever
/// [myClubsProvider] is invalidated.
final myClubProvider = FutureProvider.autoDispose<Club?>((ref) async {
  final clubs = await ref.watch(myClubsProvider.future);
  return clubs.isEmpty ? null : clubs.first;
});
