/// In-app legal copy for profile settings.
enum LegalDocumentType {
  privacy,
  terms,
}

extension LegalDocumentTypeX on LegalDocumentType {
  String get title => switch (this) {
        LegalDocumentType.privacy => 'Privacy Policy',
        LegalDocumentType.terms => 'Terms & Conditions',
      };

  String get body => switch (this) {
        LegalDocumentType.privacy => _privacyPolicy,
        LegalDocumentType.terms => _termsAndConditions,
      };
}

const _privacyPolicy = '''
Last updated: July 2026

Sports Club ("we", "our", "us") helps parents discover clubs and events, and helps club owners manage their presence on the platform.

Information we collect
• Account details such as your name, email address, and profile photo.
• Club information submitted by club owners, including contact details and media.
• Usage data such as favorites and events you interact with.

How we use information
• To operate your account and provide core app features.
• To verify club owner registrations and moderate published content.
• To improve reliability, security, and support.

Sharing
• We do not sell your personal information.
• Club contact details you choose to publish may be visible to other users.
• We may use trusted service providers for hosting, email delivery, and authentication.

Data retention
• We keep account data while your account is active.
• You may request account deletion by contacting support.

Security
• Passwords are stored using industry-standard hashing.
• Please use a strong, unique password and keep your device secure.

Contact
• For privacy questions, email support@sportsclub.app.
''';

const _termsAndConditions = '''
Last updated: July 2026

By using Sports Club you agree to these terms.

Accounts
• You must provide accurate information when registering.
• You are responsible for activity on your account.
• Club owner accounts are subject to review before clubs become publicly visible.

Acceptable use
• Do not post false, misleading, or harmful content.
• Do not attempt to access accounts or data that are not yours.
• Do not misuse contact details published by clubs or users.

Club owner content
• Owners are responsible for the accuracy of club listings, pricing, and events.
• We may approve, reject, suspend, or remove content that violates these terms.

Events & third-party links
• Registration links may direct you to external websites operated by clubs.
• We are not responsible for third-party sites or their policies.

Availability
• The service is provided on an "as is" basis.
• We may update, suspend, or discontinue features with reasonable notice where possible.

Liability
• To the extent permitted by law, Sports Club is not liable for indirect or consequential losses arising from use of the app.

Changes
• We may update these terms. Continued use after changes means you accept the updated terms.

Contact
• Questions about these terms: support@sportsclub.app.
''';
