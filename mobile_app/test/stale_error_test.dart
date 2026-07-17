import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:club_app/utils/validators.dart';
import 'package:club_app/widgets/app_text_field.dart';

void main() {
  // Regression: after a failed submit, the "Please enter …" message used to
  // stay put even once the field had been filled in, because FormField's
  // default autovalidateMode only re-runs validators on the next validate().
  testWidgets('error clears as soon as the field is filled in', (tester) async {
    final formKey = GlobalKey<FormState>();

    await tester.pumpWidget(
      MaterialApp(
        home: Scaffold(
          body: Form(
            key: formKey,
            child: AppTextField(
              label: 'Title',
              validator: (v) => Validators.required(v, field: 'a title'),
            ),
          ),
        ),
      ),
    );

    // Submit while empty — the message appears.
    formKey.currentState!.validate();
    await tester.pump();
    expect(find.text('Please enter a title'), findsOneWidget);

    // Type a value; the message should go away on its own.
    await tester.enterText(find.byType(TextFormField), 'Summer camp');
    await tester.pump();
    expect(
      find.text('Please enter a title'),
      findsNothing,
      reason:
          'the message must clear once the field is valid, without '
          'waiting for another submit',
    );
  });
}
