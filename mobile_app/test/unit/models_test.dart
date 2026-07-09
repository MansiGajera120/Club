import 'package:flutter_test/flutter_test.dart';

import 'package:club_app/models/club_model.dart';
import 'package:club_app/models/event_model.dart';

void main() {
  group('Club.fromJson', () {
    test('parses a full club with contact and defaults', () {
      final club = Club.fromJson({
        'id': 'c1',
        'name': 'Riverside FC',
        'city': 'Austin',
        'gender': 'mixed',
        'price': 50,
        'gallery': ['gallery/a.webp'],
        'contact': {'phone': '123', 'email': 'a@b.com'},
        'isFeatured': true,
        'isFavorite': true,
        'status': 'approved',
      });

      expect(club.id, 'c1');
      expect(club.name, 'Riverside FC');
      expect(club.gender, 'mixed');
      expect(club.price, 50);
      expect(club.gallery, ['gallery/a.webp']);
      expect(club.contact?.phone, '123');
      expect(club.isFeatured, isTrue);
      expect(club.isFavorite, isTrue);
    });

    test('applies defaults for missing optional fields', () {
      final club = Club.fromJson({'id': 'c2', 'name': 'Minimal'});
      expect(club.gender, 'mixed');
      expect(club.ageMin, 0);
      expect(club.ageMax, 100);
      expect(club.gallery, isEmpty);
      expect(club.isFavorite, isFalse);
    });
  });

  group('Event.fromJson', () {
    test('parses required + optional fields', () {
      final event = Event.fromJson({
        'id': 'e1',
        'club': 'c1',
        'title': 'Open Trials',
        'startDate': '2027-01-01T10:00:00.000Z',
        'isActive': true,
      });
      expect(event.id, 'e1');
      expect(event.club, 'c1');
      expect(event.title, 'Open Trials');
      expect(event.startDate.toUtc().year, 2027);
      expect(event.isActive, isTrue);
    });
  });
}
