import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../models/club_model.dart';
import '../models/event_model.dart';
import '../repositories/event_repository.dart';
import 'core_providers.dart';
import 'owner_providers.dart';

final eventRepositoryProvider = Provider<EventRepository>((ref) {
  return EventRepository(ref.watch(dioProvider));
});

/// Event plus the owning club metadata for the owner dashboard.
class OwnerEventItem {
  final Event event;
  final Club club;

  const OwnerEventItem({required this.event, required this.club});
}

/// Screen data for the owner events tab (clubs + their events).
class OwnerEventsScreenData {
  final List<Club> clubs;
  final List<OwnerEventItem> events;

  const OwnerEventsScreenData({
    required this.clubs,
    required this.events,
  });
}

/// Combined loader for the owner events screen.
///
/// Events are fetched first and are what the screen is really about; the club
/// metadata (used only for labels and the "create event" shortcuts) is
/// best-effort so a hiccup loading clubs can never hide the owner's events.
final ownerEventsScreenProvider =
    FutureProvider.autoDispose<OwnerEventsScreenData>((ref) async {
  final result = await ref.watch(eventRepositoryProvider).myEvents(limit: 100);

  List<Club> clubs = const [];
  try {
    clubs = await ref.watch(myClubsProvider.future);
  } catch (_) {
    clubs = const []; // events still render with a fallback club label
  }
  final clubMap = {for (final club in clubs) club.id: club};

  final items = <OwnerEventItem>[];
  for (final event in result.items) {
    final club = clubMap[event.club] ??
        Club(
          id: event.club,
          name: 'My club',
          status: 'approved',
        );
    items.add(OwnerEventItem(event: event, club: club));
  }

  items.sort((a, b) => b.event.startDate.compareTo(a.event.startDate));
  return OwnerEventsScreenData(clubs: clubs, events: items);
});

/// Upcoming events feed for the Events tab.
final upcomingEventsProvider = FutureProvider.autoDispose<List<Event>>((ref) async {
  final result = await ref.watch(eventRepositoryProvider).upcoming();
  return result.items;
});

/// Events for a specific club (used on the club detail screen).
final clubEventsProvider =
    FutureProvider.autoDispose.family<List<Event>, String>((ref, clubId) async {
  final result = await ref.watch(eventRepositoryProvider).forClub(clubId);
  return result.items;
});

/// All events across the current owner's clubs (includes inactive).
final ownerEventsProvider =
    FutureProvider.autoDispose<List<OwnerEventItem>>((ref) async {
  final data = await ref.watch(ownerEventsScreenProvider.future);
  return data.events;
});
