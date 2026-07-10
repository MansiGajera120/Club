import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../providers/auth_provider.dart';
import '../../providers/owner_providers.dart';
import '../../routes/route_names.dart';
import '../../theme/app_colors.dart';
import '../../theme/app_spacing.dart';
import '../../utils/app_toast.dart';
import '../../utils/validators.dart';
import '../../widgets/widgets.dart';

/// Change password for accounts that signed up with email and password.
/// Step 1 verifies the current password; step 2 sets the new one.
class ChangePasswordScreen extends ConsumerStatefulWidget {
  const ChangePasswordScreen({super.key});

  @override
  ConsumerState<ChangePasswordScreen> createState() =>
      _ChangePasswordScreenState();
}

class _ChangePasswordScreenState extends ConsumerState<ChangePasswordScreen> {
  final _formKey = GlobalKey<FormState>();
  final _currentCtrl = TextEditingController();
  final _newCtrl = TextEditingController();
  final _confirmCtrl = TextEditingController();
  bool _obscureCurrent = true;
  bool _obscureNew = true;
  bool _obscureConfirm = true;
  bool _busy = false;
  bool _currentVerified = false;
  String? _currentPasswordError;

  @override
  void dispose() {
    _currentCtrl.dispose();
    _newCtrl.dispose();
    _confirmCtrl.dispose();
    super.dispose();
  }

  void _openForgotPassword() {
    final email = ref.read(authControllerProvider).user?.email.trim();
    context.pushNamed(
      RouteNames.forgotPassword,
      queryParameters:
          email != null && email.isNotEmpty ? {'email': email} : const {},
    );
  }

  Future<void> _verifyCurrent() async {
    if (_currentCtrl.text.trim().isEmpty) {
      setState(() => _currentPasswordError = 'Enter your current password');
      return;
    }

    setState(() {
      _busy = true;
      _currentPasswordError = null;
    });

    try {
      await ref
          .read(userRepositoryProvider)
          .verifyCurrentPassword(_currentCtrl.text);
      if (mounted) {
        setState(() => _currentVerified = true);
        AppToast.success('Current password verified');
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _currentPasswordError = 'Current password is incorrect';
        });
        AppToast.showError(e, fallback: 'Current password is incorrect');
      }
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  void _changeCurrentPassword() {
    setState(() {
      _currentVerified = false;
      _newCtrl.clear();
      _confirmCtrl.clear();
      _currentPasswordError = null;
    });
  }

  Future<void> _submitNewPassword() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _busy = true);
    try {
      await ref.read(userRepositoryProvider).changePassword(
            currentPassword: _currentCtrl.text,
            newPassword: _newCtrl.text,
          );
      await ref.read(authControllerProvider.notifier).logout();
      if (mounted) {
        AppToast.success('Password changed. Please sign in again.');
        context.goNamed(RouteNames.login);
      }
    } catch (e) {
      AppToast.showError(e);
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(title: const Text('Change password')),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(AppSpacing.lg),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                if (!_currentVerified) ...[
                  FormSection(
                    title: 'Verify current password',
                    subtitle:
                        'Confirm your identity before setting a new password.',
                    icon: Icons.lock_outline_rounded,
                    children: [
                      AppTextField(
                        label: 'Current password',
                        controller: _currentCtrl,
                        obscureText: _obscureCurrent,
                        onChanged: (_) {
                          if (_currentPasswordError != null) {
                            setState(() => _currentPasswordError = null);
                          }
                        },
                        validator: (v) =>
                            Validators.required(v, field: 'Current password'),
                        suffixIcon: IconButton(
                          icon: Icon(_obscureCurrent
                              ? Icons.visibility_off_outlined
                              : Icons.visibility_outlined),
                          onPressed: () => setState(
                              () => _obscureCurrent = !_obscureCurrent),
                        ),
                      ),
                      if (_currentPasswordError != null) ...[
                        const SizedBox(height: AppSpacing.xs),
                        Text(
                          _currentPasswordError!,
                          style: theme.textTheme.bodySmall?.copyWith(
                            color: AppColors.danger,
                          ),
                        ),
                      ],
                      Align(
                        alignment: Alignment.centerRight,
                        child: TextButton(
                          onPressed: _busy ? null : _openForgotPassword,
                          child: const Text('Forgot password?'),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: AppSpacing.xl),
                  AppButton(
                    label: 'Continue',
                    isLoading: _busy,
                    onPressed: _verifyCurrent,
                  ),
                ] else ...[
                  AppCard(
                    variant: AppCardVariant.outlined,
                    child: Row(
                      children: [
                        Container(
                          width: 40,
                          height: 40,
                          decoration: BoxDecoration(
                            color: AppColors.success.withValues(alpha: 0.12),
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(
                            Icons.check_rounded,
                            color: AppColors.success,
                            size: 22,
                          ),
                        ),
                        const SizedBox(width: AppSpacing.md),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'Identity verified',
                                style: theme.textTheme.titleSmall,
                              ),
                              Text(
                                'You can now choose a new password.',
                                style: theme.textTheme.bodySmall,
                              ),
                            ],
                          ),
                        ),
                        TextButton(
                          onPressed: _busy ? null : _changeCurrentPassword,
                          child: const Text('Change'),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: AppSpacing.lg),
                  FormSection(
                    title: 'New password',
                    subtitle:
                        'You will be signed out on all devices after updating.',
                    icon: Icons.password_rounded,
                    children: [
                      AppTextField(
                        label: 'New password',
                        controller: _newCtrl,
                        obscureText: _obscureNew,
                        validator: Validators.password,
                        suffixIcon: IconButton(
                          icon: Icon(_obscureNew
                              ? Icons.visibility_off_outlined
                              : Icons.visibility_outlined),
                          onPressed: () =>
                              setState(() => _obscureNew = !_obscureNew),
                        ),
                      ),
                      AppTextField(
                        label: 'Confirm new password',
                        controller: _confirmCtrl,
                        obscureText: _obscureConfirm,
                        validator:
                            Validators.confirmPassword(() => _newCtrl.text),
                        suffixIcon: IconButton(
                          icon: Icon(_obscureConfirm
                              ? Icons.visibility_off_outlined
                              : Icons.visibility_outlined),
                          onPressed: () => setState(
                              () => _obscureConfirm = !_obscureConfirm),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: AppSpacing.md),
                  Align(
                    alignment: Alignment.centerLeft,
                    child: TextButton(
                      onPressed: _busy ? null : _openForgotPassword,
                      child: const Text('Forgot current password?'),
                    ),
                  ),
                  const SizedBox(height: AppSpacing.lg),
                  AppButton(
                    label: 'Update password',
                    isLoading: _busy,
                    onPressed: _submitNewPassword,
                  ),
                ],
              ],
            ),
          ),
        ),
      ),
    );
  }
}
