import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/error/exceptions.dart';
import '../../providers/auth_provider.dart';
import '../../routes/route_names.dart';
import '../../theme/app_spacing.dart';
import '../../utils/validators.dart';
import '../../widgets/widgets.dart';
import 'widgets/auth_scaffold.dart';

/// Request a password-reset email.
class ForgotPasswordScreen extends ConsumerStatefulWidget {
  const ForgotPasswordScreen({super.key});

  @override
  ConsumerState<ForgotPasswordScreen> createState() =>
      _ForgotPasswordScreenState();
}

class _ForgotPasswordScreenState extends ConsumerState<ForgotPasswordScreen> {
  final _formKey = GlobalKey<FormState>();
  final _emailCtrl = TextEditingController();
  bool _busy = false;
  bool _sent = false;

  @override
  void dispose() {
    _emailCtrl.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _busy = true);
    try {
      await ref
          .read(authRepositoryProvider)
          .forgotPassword(_emailCtrl.text.trim());
      if (mounted) setState(() => _sent = true);
    } catch (e) {
      final message =
          e is AppException ? e.message : 'Something went wrong';
      if (mounted) {
        ScaffoldMessenger.of(context)
          ..clearSnackBars()
          ..showSnackBar(SnackBar(content: Text(message)));
      }
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_sent) {
      return AuthScaffold(
        title: 'Check your email',
        subtitle: 'Password reset instructions are on the way',
        onBack: () => Navigator.of(context).pop(),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            EmptyState(
              icon: Icons.mark_email_read_outlined,
              title: 'Email sent',
              message:
                  'If an account exists for ${_emailCtrl.text.trim()}, we\'ve sent a code to reset your password.',
              actionLabel: 'I have a reset code',
              onAction: () => context.pushNamed(RouteNames.resetPassword),
            ),
            const SizedBox(height: AppSpacing.md),
            TextButton(
              onPressed: () => Navigator.of(context).pop(),
              child: const Text('Back to sign in'),
            ),
          ],
        ),
      );
    }

    return AuthScaffold(
      title: 'Reset password',
      subtitle: 'Enter your email and we\'ll send you a reset link',
      onBack: () => Navigator.of(context).pop(),
      child: Form(
        key: _formKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            AppTextField(
              label: 'Email',
              hint: 'you@example.com',
              controller: _emailCtrl,
              keyboardType: TextInputType.emailAddress,
              validator: Validators.email,
            ),
            const SizedBox(height: AppSpacing.xl),
            AppButton(
              label: 'Send reset link',
              isLoading: _busy,
              onPressed: _submit,
            ),
          ],
        ),
      ),
    );
  }
}
