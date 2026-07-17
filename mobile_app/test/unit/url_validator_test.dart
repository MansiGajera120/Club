import 'package:flutter_test/flutter_test.dart';

import 'package:club_app/utils/validators.dart';

void main() {
  group('Validators.url', () {
    test('names the field when empty', () {
      expect(
        Validators.url('', field: 'a registration link'),
        'Please enter a registration link',
      );
      expect(Validators.url('   ', field: 'a link'), 'Please enter a link');
      expect(Validators.url(null, field: 'a link'), 'Please enter a link');
    });

    test('accepts absolute http(s) links', () {
      expect(Validators.url('https://example.com'), isNull);
      expect(Validators.url('http://example.com/register?id=1'), isNull);
      expect(Validators.url('  https://club.org/signup  '), isNull);
    });

    test('rejects what the API would reject', () {
      // Joi.string().uri() refuses all of these; catching them here keeps the
      // message on the field instead of surfacing as a 400.
      expect(Validators.url('example.com'), isNotNull);
      expect(Validators.url('not a link'), isNotNull);
      expect(Validators.url('https://'), isNotNull);
      expect(Validators.url('ftp://example.com'), isNotNull);
    });
  });
}
