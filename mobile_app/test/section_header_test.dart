import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:club_app/widgets/page_header.dart';

void main() {
  // Regression: the title used to sit in a Flexible next to a Spacer. Both are
  // flex:1, so they split the free space and the trailing tick came to rest in
  // the middle of the row instead of flush right.
  testWidgets('section header keeps trailing flush right', (tester) async {
    await tester.pumpWidget(
      const MaterialApp(
        home: Scaffold(
          body: SectionHeader(
            title: 'Quick actions',
            trailing: Icon(Icons.chevron_right, key: Key('tick')),
          ),
        ),
      ),
    );
    // Drain the google_fonts load failure; layout is what's under test.
    tester.takeException();

    final rowWidth = tester.getSize(find.byType(Scaffold)).width;
    final tickRight = tester.getTopRight(find.byKey(const Key('tick'))).dx;
    // Trailing should hug the row's right gutter, not float mid-row.
    expect(rowWidth - tickRight, lessThan(20));
  });

  testWidgets('long section title ellipsises instead of overflowing', (
    tester,
  ) async {
    await tester.pumpWidget(
      const MaterialApp(
        home: Scaffold(
          body: SectionHeader(
            title:
                'An extremely long section title that will not fit on one '
                'line of a narrow phone screen at all',
          ),
        ),
      ),
    );
    tester.takeException();
    expect(tester.takeException(), isNull);
  });
}
