import 'package:flutter_test/flutter_test.dart';

import 'package:club_app/utils/validators.dart';

void main() {
  group('Validators.email', () {
    test('accepts a valid email', () {
      expect(Validators.email('a@b.com'), isNull);
    });
    test('rejects empty and malformed', () {
      expect(Validators.email(''), isNotNull);
      expect(Validators.email('nope'), isNotNull);
    });
  });

  group('Validators.password', () {
    test('requires 8+ characters', () {
      expect(Validators.password('short'), isNotNull);
      expect(Validators.password('longenough'), isNull);
    });
  });

  group('Validators.name', () {
    test('requires 2+ characters', () {
      expect(Validators.name('A'), isNotNull);
      expect(Validators.name('Alice'), isNull);
    });
  });

  group('Validators.confirmPassword', () {
    test('matches the original', () {
      final validate = Validators.confirmPassword(() => 'secret12');
      expect(validate('secret12'), isNull);
      expect(validate('different'), isNotNull);
    });
  });
}
