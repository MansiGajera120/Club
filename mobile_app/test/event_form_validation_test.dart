import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:club_app/screens/owner/event_form_screen.dart';

void main() {
  Future<void> pumpForm(WidgetTester tester) async {
    tester.view.physicalSize = const Size(1170, 2532);
    tester.view.devicePixelRatio = 3.0;
    addTearDown(tester.view.reset);

    await tester.pumpWidget(
      const ProviderScope(
        child: MaterialApp(home: EventFormScreen(clubId: 'club-1')),
      ),
    );
    // google_fonts can't resolve headlessly; the validation is what's under test.
    tester.takeException();
    await tester.pump();
    tester.takeException();
  }

  /// The form is taller than the viewport, so the button must be scrolled to
  /// before it can be tapped.
  Future<void> submit(WidgetTester tester) async {
    await tester.ensureVisible(find.text('Create event'));
    await tester.pump();
    await tester.tap(find.text('Create event'));
    await tester.pump();
    tester.takeException();
  }

  testWidgets('submitting an empty form names every missing field', (
    tester,
  ) async {
    await pumpForm(tester);

    await submit(tester);

    expect(find.text('Please enter a title'), findsOneWidget);
    expect(find.text('Please enter a description'), findsOneWidget);
    expect(find.text('Please enter a location'), findsOneWidget);
    expect(find.text('Please enter a registration link'), findsOneWidget);
    // The date picker isn't a FormField — its error is driven by screen state.
    expect(find.text('Please choose a start date'), findsOneWidget);
    // Price is deliberately absent here: a new event starts pre-filled with 0
    // (a free event), so it is never blank unless the owner clears it.
  });

  testWidgets('clearing the pre-filled price is rejected', (tester) async {
    await pumpForm(tester);

    await tester.enterText(
      find.widgetWithText(TextFormField, 'Enter 0 for a free event'),
      '',
    );
    await submit(tester);

    expect(find.text('Please enter a price'), findsOneWidget);
  });

  testWidgets('a malformed registration link is rejected', (tester) async {
    await pumpForm(tester);

    await tester.enterText(
      find.widgetWithText(TextFormField, 'https://…'),
      'example.com',
    );
    await submit(tester);

    expect(
      find.text('Enter a full link starting with https://'),
      findsOneWidget,
    );
  });

  testWidgets('a price above the API cap is rejected', (tester) async {
    await pumpForm(tester);

    await tester.enterText(
      find.widgetWithText(TextFormField, 'Enter 0 for a free event'),
      '9999999',
    );
    await submit(tester);

    expect(find.text('Price cannot be more than 10,00,000'), findsOneWidget);
  });
}
