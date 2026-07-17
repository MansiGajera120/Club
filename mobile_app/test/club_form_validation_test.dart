import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:club_app/screens/owner/club_form_screen.dart';
import 'package:club_app/widgets/app_text_field.dart';

void main() {
  Future<void> pumpForm(WidgetTester tester) async {
    tester.view.physicalSize = const Size(1170, 2532);
    tester.view.devicePixelRatio = 3.0;
    addTearDown(tester.view.reset);

    await tester.pumpWidget(
      const ProviderScope(child: MaterialApp(home: ClubFormScreen())),
    );
    tester.takeException();
    await tester.pump();
    tester.takeException();
  }

  /// AppTextField renders its label as a sibling Text, not inside the input, so
  /// reach the field through the AppTextField that owns the label.
  Finder fieldFor(String label) => find.descendant(
    of: find.widgetWithText(AppTextField, label),
    matching: find.byType(TextFormField),
  );

  /// The form is far taller than the viewport, so scroll before tapping.
  Future<void> submit(WidgetTester tester) async {
    final button = find.text('Submit for approval');
    await tester.ensureVisible(button);
    await tester.pump();
    await tester.tap(button);
    await tester.pump();
    tester.takeException();
  }

  testWidgets('submitting an empty club form names every missing field', (
    tester,
  ) async {
    await pumpForm(tester);
    await submit(tester);

    expect(find.text('Please enter the club name'), findsOneWidget);
    expect(find.text('Please enter the services offered'), findsOneWidget);
    expect(find.text('Please enter an address'), findsOneWidget);
    expect(find.text('Please enter a description'), findsOneWidget);
    expect(find.text('Please enter an Instagram handle'), findsOneWidget);
    expect(find.text('Please enter a TikTok handle'), findsOneWidget);
    expect(find.text('Please enter a registration link'), findsOneWidget);
    expect(find.text('Please enter a website'), findsOneWidget);
    expect(find.text('Please enter your email'), findsOneWidget);
    expect(find.text('Please enter your phone number'), findsOneWidget);
  });

  testWidgets('max age below min age is rejected', (tester) async {
    await pumpForm(tester);

    await tester.enterText(fieldFor('Min age'), '12');
    await tester.enterText(fieldFor('Max age'), '8');
    await submit(tester);

    expect(find.text('Must be at least the minimum age'), findsOneWidget);
  });

  testWidgets('an age over 100 is rejected', (tester) async {
    await pumpForm(tester);

    await tester.enterText(fieldFor('Min age'), '120');
    await submit(tester);

    expect(find.text('Age cannot be over 100'), findsOneWidget);
  });
}
