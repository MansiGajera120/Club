import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../providers/auth_provider.dart';
import '../../routes/route_names.dart';
import '../../theme/app_spacing.dart';
import '../../utils/app_toast.dart';
import '../../utils/validators.dart';
import '../../widgets/widgets.dart';
import 'widgets/auth_scaffold.dart';
import 'widgets/otp_code_field.dart';

/// Two-step password reset: request a 6-digit code by email, then enter the
/// code with a new password.
class ForgotPasswordScreen extends ConsumerStatefulWidget {
  final String? initialEmail;

  const ForgotPasswordScreen({super.key, this.initialEmail});

  @override
  ConsumerState<ForgotPasswordScreen> createState() =>
      _ForgotPasswordScreenState();
}

class _ForgotPasswordScreenState extends ConsumerState<ForgotPasswordScreen> {
  final _requestFormKey = GlobalKey<FormState>();
  final _resetFormKey = GlobalKey<FormState>();

  late final TextEditingController _emailCtrl =
      TextEditingController(text: widget.initialEmail ?? '');
  final _otpCtrl = TextEditingController();
  final _passwordCtrl = TextEditingController();
  final _confirmCtrl = TextEditingController();

  bool _obscure = true;
  bool _busy = false;
  bool _codeSent = false;

  @override
  void dispose() {
    _emailCtrl.dispose();
    _otpCtrl.dispose();
    _passwordCtrl.dispose();
    _confirmCtrl.dispose();
    super.dispose();
  }

  Future<bool> _run(Future<void> Function() action) async {
    setState(() => _busy = true);
    try {
      await action();
      return true;
    } catch (e) {
      AppToast.showError(e);
      return false;
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  Future<void> _sendCode() async {
    if (!_requestFormKey.currentState!.validate()) return;
    final ok = await _run(
      () => ref
          .read(authRepositoryProvider)
          .forgotPassword(_emailCtrl.text.trim()),
    );
    if (ok && mounted) {
      setState(() => _codeSent = true);
      AppToast.success('We emailed a 6-digit code to ${_emailCtrl.text.trim()}');
    }
  }

  Future<void> _resend() async {
    final ok = await _run(
      () => ref
          .read(authRepositoryProvider)
          .forgotPassword(_emailCtrl.text.trim()),
    );
    if (ok) AppToast.info('A new code is on its way.');
  }

  Future<void> _resetPassword() async {
    if (!_resetFormKey.currentState!.validate()) return;
    final ok = await _run(
      () => ref.read(authRepositoryProvider).resetPassword(
            email: _emailCtrl.text.trim(),
            otp: _otpCtrl.text.trim(),
            password: _passwordCtrl.text,
          ),
    );
    if (ok && mounted) {
      AppToast.success('Password updated. Please sign in.');
      context.goNamed(RouteNames.login);
    }
  }

  void _changeEmail() {
    _otpCtrl.clear();
    _passwordCtrl.clear();
    _confirmCtrl.clear();
    setState(() => _codeSent = false);
  }

  @override
  Widget build(BuildContext context) {
    return _codeSent ? _buildResetStep(context) : _buildRequestStep(context);
  }

  Widget _buildRequestStep(BuildContext context) {
    return AuthScaffold(
      title: 'Reset password',
      subtitle: 'Enter your email and we\'ll send you a 6-digit reset code',
      onBack: () => Navigator.of(context).pop(),
      child: Form(
        key: _requestFormKey,
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
              label: 'Send reset code',
              isLoading: _busy,
              onPressed: _sendCode,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildResetStep(BuildContext context) {
    final theme = Theme.of(context);

    return AuthScaffold(
      title: 'Enter reset code',
      subtitle: 'We sent a 6-digit code to ${_emailCtrl.text.trim()}',
      onBack: _busy ? null : _changeEmail,
      child: Form(
        key: _resetFormKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            OtpCodeField(
              controller: _otpCtrl,
              enabled: !_busy,
              validator: (v) {
                final value = v?.trim() ?? '';
                if (value.length != 6) return 'Enter the 6-digit code';
                return null;
              },
            ),
            const SizedBox(height: AppSpacing.lg),
            AppTextField(
              label: 'New password',
              controller: _passwordCtrl,
              obscureText: _obscure,
              validator: Validators.password,
              suffixIcon: IconButton(
                icon: Icon(
                  _obscure
                      ? Icons.visibility_off_outlined
                      : Icons.visibility_outlined,
                ),
                onPressed: () => setState(() => _obscure = !_obscure),
              ),
            ),
            const SizedBox(height: AppSpacing.lg),
            AppTextField(
              label: 'Confirm password',
              controller: _confirmCtrl,
              obscureText: _obscure,
              validator: Validators.confirmPassword(() => _passwordCtrl.text),
            ),
            const SizedBox(height: AppSpacing.xl),
            AppButton(
              label: 'Update password',
              isLoading: _busy,
              onPressed: _resetPassword,
            ),
            const SizedBox(height: AppSpacing.md),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text("Didn't get the code?", style: theme.textTheme.bodyMedium),
                TextButton(
                  onPressed: _busy ? null : _resend,
                  child: const Text('Resend'),
                ),
              ],
            ),
            TextButton(
              onPressed: _busy ? null : _changeEmail,
              child: const Text('Change email'),
            ),
          ],
        ),
      ),
    );
  }
}
