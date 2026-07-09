import 'package:flutter_test/flutter_test.dart';

import 'package:club_app/utils/formatters.dart';

void main() {
  group('Formatters.price', () {
    test('shows Free for zero', () {
      expect(Formatters.price(0, 'USD'), 'Free');
    });
    test('formats whole and decimal amounts', () {
      expect(Formatters.price(50, 'USD'), 'USD 50');
      expect(Formatters.price(49.5, 'EUR'), 'EUR 49.50');
    });
  });

  test('Formatters.ageRange', () {
    expect(Formatters.ageRange(6, 12), 'Ages 6–12');
  });

  group('Formatters.genderLabel', () {
    test('maps backend values to labels', () {
      expect(Formatters.genderLabel('male'), 'Boys');
      expect(Formatters.genderLabel('female'), 'Girls');
      expect(Formatters.genderLabel('mixed'), 'Mixed');
    });
  });
}
