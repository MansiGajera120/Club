import 'package:flutter_test/flutter_test.dart';

import 'package:club_app/models/club_filter.dart';

void main() {
  group('ClubFilter.toQuery', () {
    test('includes page/limit/sort and omits null values', () {
      final query = const ClubFilter().toQuery(page: 2, limit: 30);
      expect(query['page'], 2);
      expect(query['limit'], 30);
      expect(query['sort'], 'newest');
      expect(query.containsKey('city'), isFalse);
      expect(query.containsKey('gender'), isFalse);
    });

    test('includes only set filters', () {
      final query = const ClubFilter(
        search: 'soccer',
        city: 'Austin',
        gender: 'mixed',
        age: 8,
        minPrice: 10,
        featured: true,
      ).toQuery();
      expect(query['search'], 'soccer');
      expect(query['city'], 'Austin');
      expect(query['gender'], 'mixed');
      expect(query['age'], 8);
      expect(query['minPrice'], 10);
      expect(query['featured'], true);
    });

    test('featured false is omitted', () {
      final query = const ClubFilter(featured: false).toQuery();
      expect(query.containsKey('featured'), isFalse);
    });
  });

  group('ClubFilter.hasActiveFilters', () {
    test('is false for an empty filter', () {
      expect(const ClubFilter().hasActiveFilters, isFalse);
    });
    test('is true when a filter is set', () {
      expect(const ClubFilter(city: 'Austin').hasActiveFilters, isTrue);
    });
  });
}
