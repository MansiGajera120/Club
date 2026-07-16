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

/// Set a new password using the 6-digit code emailed by the forgot-password
/// flow. Used when the user already has a code (deep link / manual entry).
class ResetPasswordScreen extends ConsumerStatefulWidget {
  final String? email;

  const ResetPasswordScreen({super.key, this.email});

  @override
  ConsumerState<ResetPasswordScreen> createState() =>
      _ResetPasswordScreenState();
}

class _ResetPasswordScreenState extends ConsumerState<ResetPasswordScreen> {
  final _formKey = GlobalKey<FormState>();
  late final TextEditingController _emailCtrl =
      TextEditingController(text: widget.email ?? '');
  final _otpCtrl = TextEditingController();
  final _passwordCtrl = TextEditingController();
  final _confirmCtrl = TextEditingController();
  bool _obscure = true;
  bool _busy = false;

  @override
  void dispose() {
    _emailCtrl.dispose();
    _otpCtrl.dispose();
    _passwordCtrl.dispose();
    _confirmCtrl.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _busy = true);
    try {
      await ref.read(authRepositoryProvider).resetPassword(
            email: _emailCtrl.text.trim(),
            otp: _otpCtrl.text.trim(),
            password: _passwordCtrl.text,
          );
      if (!mounted) return;
      AppToast.success('Password updated. Please sign in.');
      context.goNamed(RouteNames.login);
    } catch (e) {
      AppToast.showError(e);
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return AuthScaffold(
      title: 'New password',
      subtitle: 'Enter the code from your email and choose a new password',
      onBack: () => context.goNamed(RouteNames.login),
      child: Form(
        key: _formKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            if (widget.email == null || widget.email!.isEmpty) ...[
              AppTextField(
                label: 'Email',
                hint: 'you@example.com',
                controller: _emailCtrl,
                keyboardType: TextInputType.emailAddress,
                validator: Validators.email,
              ),
              const SizedBox(height: AppSpacing.lg),
            ],
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
              onPressed: _submit,
            ),
          ],
        ),
      ),
    );
  }
}
