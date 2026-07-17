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

/// The three stages of a password reset: ask for the email, confirm the emailed
/// code, then choose a new password.
enum _ResetStep { email, otp, password }

/// Three-step password reset: request a 6-digit code by email, verify it, then
/// set a new password.
class ForgotPasswordScreen extends ConsumerStatefulWidget {
  final String? initialEmail;

  const ForgotPasswordScreen({super.key, this.initialEmail});

  @override
  ConsumerState<ForgotPasswordScreen> createState() =>
      _ForgotPasswordScreenState();
}

class _ForgotPasswordScreenState extends ConsumerState<ForgotPasswordScreen> {
  final _emailFormKey = GlobalKey<FormState>();
  final _otpFormKey = GlobalKey<FormState>();
  final _passwordFormKey = GlobalKey<FormState>();

  late final TextEditingController _emailCtrl = TextEditingController(
    text: widget.initialEmail ?? '',
  );
  final _otpCtrl = TextEditingController();
  final _passwordCtrl = TextEditingController();
  final _confirmCtrl = TextEditingController();

  bool _obscure = true;
  bool _busy = false;
  _ResetStep _step = _ResetStep.email;

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

  String get _email => _emailCtrl.text.trim();

  Future<void> _sendCode() async {
    if (!_emailFormKey.currentState!.validate()) return;
    final ok = await _run(
      () => ref.read(authRepositoryProvider).forgotPassword(_email),
    );
    if (ok && mounted) {
      setState(() => _step = _ResetStep.otp);
      AppToast.success('We emailed a 6-digit code to $_email');
    }
  }

  /// Confirms the code up front so a wrong one is caught here, rather than after
  /// the user has gone to the trouble of choosing a new password.
  Future<void> _verifyCode() async {
    if (!_otpFormKey.currentState!.validate()) return;
    final ok = await _run(
      () => ref
          .read(authRepositoryProvider)
          .verifyResetCode(email: _email, otp: _otpCtrl.text.trim()),
    );
    if (ok && mounted) {
      setState(() => _step = _ResetStep.password);
    }
  }

  Future<void> _resend() async {
    final ok = await _run(
      () => ref.read(authRepositoryProvider).forgotPassword(_email),
    );
    if (ok) AppToast.info('A new code is on its way.');
  }

  Future<void> _resetPassword() async {
    if (!_passwordFormKey.currentState!.validate()) return;
    final ok = await _run(
      () => ref
          .read(authRepositoryProvider)
          .resetPassword(
            email: _email,
            otp: _otpCtrl.text.trim(),
            password: _passwordCtrl.text,
          ),
    );
    if (ok && mounted) {
      AppToast.success('Password updated. Please sign in.');
      context.goNamed(RouteNames.login);
    }
  }

  @override
  Widget build(BuildContext context) {
    return switch (_step) {
      _ResetStep.email => _buildEmailStep(context),
      _ResetStep.otp => _buildOtpStep(context),
      _ResetStep.password => _buildPasswordStep(context),
    };
  }

  Widget _buildEmailStep(BuildContext context) {
    return AuthScaffold(
      title: 'Forgot your',
      titleAccent: 'password?',
      subtitle:
          'Happens to everyone. Enter your email and we\'ll send a 6-digit reset code.',
      sticker: '🔑',
      onBack: () => Navigator.of(context).pop(),
      child: Form(
        key: _emailFormKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const AuthStepDots(count: 3, index: 0),
            const SizedBox(height: AppSpacing.xl),
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

  Widget _buildOtpStep(BuildContext context) {
    final theme = Theme.of(context);

    return AuthScaffold(
      title: 'Enter reset',
      titleAccent: 'code',
      subtitle: 'We sent a 6-digit code to $_email',
      sticker: '📬',
      // Back returns to the email step — the only way to fix a typo now that the
      // separate "Change email" link is gone.
      onBack: _busy ? null : () => setState(() => _step = _ResetStep.email),
      child: Form(
        key: _otpFormKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const AuthStepDots(count: 3, index: 1),
            const SizedBox(height: AppSpacing.xl),
            OtpCodeField(
              controller: _otpCtrl,
              enabled: !_busy,
              validator: (v) {
                final value = v?.trim() ?? '';
                if (value.length != 6) return 'Please enter the 6-digit code';
                return null;
              },
            ),
            const SizedBox(height: AppSpacing.xl),
            AppButton(
              label: 'Verify code',
              isLoading: _busy,
              onPressed: _verifyCode,
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
          ],
        ),
      ),
    );
  }

  Widget _buildPasswordStep(BuildContext context) {
    return AuthScaffold(
      title: 'Set a new',
      titleAccent: 'password',
      subtitle: 'Code confirmed. Choose a new password for $_email.',
      sticker: '🔐',
      onBack: _busy ? null : () => setState(() => _step = _ResetStep.otp),
      child: Form(
        key: _passwordFormKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const AuthStepDots(count: 3, index: 2),
            const SizedBox(height: AppSpacing.xl),
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
          ],
        ),
      ),
    );
  }
}
