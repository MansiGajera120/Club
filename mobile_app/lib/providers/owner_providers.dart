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
