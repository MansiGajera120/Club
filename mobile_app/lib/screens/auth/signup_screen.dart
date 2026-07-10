import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../providers/auth_provider.dart';
import '../../theme/app_spacing.dart';
import '../../utils/app_toast.dart';
import '../../utils/validators.dart';
import '../../widgets/widgets.dart';
import 'widgets/auth_scaffold.dart';
import 'widgets/otp_code_field.dart';
import 'widgets/social_auth_buttons.dart';

/// The two stages of the signup screen: collect details, then confirm the
/// emailed one-time passcode.
enum _SignupStep { form, otp }

/// Registration for users and club owners.
class SignupScreen extends ConsumerStatefulWidget {
  const SignupScreen({super.key});

  @override
  ConsumerState<SignupScreen> createState() => _SignupScreenState();
}

class _SignupScreenState extends ConsumerState<SignupScreen> {
  final _formKey = GlobalKey<FormState>();
  final _otpFormKey = GlobalKey<FormState>();
  final _nameCtrl = TextEditingController();
  final _emailCtrl = TextEditingController();
  final _passwordCtrl = TextEditingController();
  final _confirmCtrl = TextEditingController();
  final _otpCtrl = TextEditingController();
  String _role = 'parent';
  bool _obscure = true;
  bool _busy = false;
  _SignupStep _step = _SignupStep.form;

  @override
  void dispose() {
    _nameCtrl.dispose();
    _emailCtrl.dispose();
    _passwordCtrl.dispose();
    _confirmCtrl.dispose();
    _otpCtrl.dispose();
    super.dispose();
  }

  void _showMessage(String message) {
    AppToast.info(message);
  }

  void _showError(Object error) {
    AppToast.showError(error);
  }

  Future<bool> _run(Future<void> Function() action) async {
    setState(() => _busy = true);
    try {
      await action();
      return true;
    } catch (e) {
      _showError(e);
      return false;
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  Future<void> _submitDetails() async {
    if (!_formKey.currentState!.validate()) return;
    final ok = await _run(
      () => ref.read(authControllerProvider.notifier).startSignup(
            name: _nameCtrl.text.trim(),
            email: _emailCtrl.text.trim(),
            password: _passwordCtrl.text,
            role: _role,
          ),
    );
    if (ok && mounted) {
      setState(() => _step = _SignupStep.otp);
      _showMessage('We emailed a 6-digit code to ${_emailCtrl.text.trim()}');
    }
  }

  Future<void> _verifyOtp() async {
    if (!_otpFormKey.currentState!.validate()) return;
    final ok = await _run(
      () => ref
          .read(authControllerProvider.notifier)
          .verifyPendingOtp(_otpCtrl.text.trim()),
    );
    if (ok) AppToast.success('Account verified. Welcome!');
  }

  Future<void> _resendOtp() async {
    final ok = await _run(
      () => ref.read(authControllerProvider.notifier).resendPendingOtp(),
    );
    if (ok) _showMessage('A new code is on its way.');
  }

  void _backToForm() {
    ref.read(authControllerProvider.notifier).cancelPendingSignup();
    _otpCtrl.clear();
    setState(() => _step = _SignupStep.form);
  }

  @override
  Widget build(BuildContext context) {
    if (_step == _SignupStep.otp) {
      return _buildOtp(context);
    }
    return _buildForm(context);
  }

  Widget _buildForm(BuildContext context) {
    final theme = Theme.of(context);

    return AuthScaffold(
      title: 'Create account',
      subtitle: 'Join as a user or register your sports club',
      footer: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text('Already have an account?', style: theme.textTheme.bodyMedium),
          TextButton(
            onPressed: () => context.pop(),
            child: const Text('Sign in'),
          ),
        ],
      ),
      child: Form(
        key: _formKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            AuthRolePicker(
              selected: _role,
              onChanged: (role) => setState(() => _role = role),
            ),
            const SizedBox(height: AppSpacing.xl),
            AppTextField(
              label: 'Full name',
              controller: _nameCtrl,
              textInputAction: TextInputAction.next,
              validator: Validators.name,
            ),
            const SizedBox(height: AppSpacing.lg),
            AppTextField(
              label: 'Email',
              hint: 'you@example.com',
              controller: _emailCtrl,
              keyboardType: TextInputType.emailAddress,
              textInputAction: TextInputAction.next,
              validator: Validators.email,
            ),
            const SizedBox(height: AppSpacing.lg),
            AppTextField(
              label: 'Password',
              controller: _passwordCtrl,
              obscureText: _obscure,
              textInputAction: TextInputAction.next,
              validator: Validators.password,
              suffixIcon: IconButton(
                icon: Icon(
                  _obscure ? Icons.visibility_off_outlined : Icons.visibility_outlined,
                ),
                onPressed: () => setState(() => _obscure = !_obscure),
              ),
            ),
            const SizedBox(height: AppSpacing.lg),
            AppTextField(
              label: 'Confirm password',
              controller: _confirmCtrl,
              obscureText: _obscure,
              textInputAction: TextInputAction.done,
              validator: Validators.confirmPassword(() => _passwordCtrl.text),
            ),
            const SizedBox(height: AppSpacing.xl),
            AppButton(
              label: 'Continue',
              isLoading: _busy,
              onPressed: _submitDetails,
            ),
            const SizedBox(height: AppSpacing.xl),
            SocialAuthButtons(
              isBusy: _busy,
              onGoogle: () => _run(
                ref.read(authControllerProvider.notifier).loginWithGoogle,
              ),
              onApple: () => _run(
                ref.read(authControllerProvider.notifier).loginWithApple,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildOtp(BuildContext context) {
    final theme = Theme.of(context);
    final email = ref.read(authControllerProvider.notifier).pendingEmail ??
        _emailCtrl.text.trim();

    return AuthScaffold(
      title: 'Verify your email',
      subtitle: 'We sent a 6-digit code to $email',
      onBack: _busy ? null : _backToForm,
      child: Form(
        key: _otpFormKey,
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
            const SizedBox(height: AppSpacing.xl),
            AppButton(
              label: 'Verify & continue',
              isLoading: _busy,
              onPressed: _verifyOtp,
            ),
            const SizedBox(height: AppSpacing.md),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text("Didn't get the code?", style: theme.textTheme.bodyMedium),
                TextButton(
                  onPressed: _busy ? null : _resendOtp,
                  child: const Text('Resend'),
                ),
              ],
            ),
            TextButton(
              onPressed: _busy ? null : _backToForm,
              child: const Text('Change email'),
            ),
          ],
        ),
      ),
    );
  }
}
