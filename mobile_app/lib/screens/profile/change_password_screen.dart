import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../providers/auth_provider.dart';
import '../../providers/owner_providers.dart';
import '../../routes/route_names.dart';
import '../../theme/app_spacing.dart';
import '../../utils/app_toast.dart';
import '../../utils/validators.dart';
import '../../widgets/widgets.dart';

/// Change password screen — single form with current, new and confirm password
/// fields. The backend verifies the current password before updating.
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

  @override
  void dispose() {
    _currentCtrl.dispose();
    _newCtrl.dispose();
    _confirmCtrl.dispose();
    super.dispose();
  }

  Future<void> _submitPassword() async {
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
      AppToast.showError(e, fallback: 'Failed to update password');
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
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
                FormSection(
                  title: 'Update your password',
                  subtitle:
                      'Enter your current password and choose a new one. You will be signed out after updating.',
                  icon: Icons.lock_outline_rounded,
                  children: [
                    // Current password
                    AppTextField(
                      label: 'Current password',
                      hint: 'Enter your current password',
                      controller: _currentCtrl,
                      obscureText: _obscureCurrent,
                      textInputAction: TextInputAction.next,
                      validator: (v) =>
                          Validators.required(v, field: 'Current password'),
                      suffixIcon: IconButton(
                        icon: Icon(_obscureCurrent
                            ? Icons.visibility_off_outlined
                            : Icons.visibility_outlined),
                        onPressed: () =>
                            setState(() => _obscureCurrent = !_obscureCurrent),
                      ),
                    ),

                    // New password
                    AppTextField(
                      label: 'New password',
                      hint: 'At least 8 characters with a letter & number',
                      controller: _newCtrl,
                      obscureText: _obscureNew,
                      textInputAction: TextInputAction.next,
                      validator: (v) {
                        final base = Validators.password(v);
                        if (base != null) return base;
                        if (v == _currentCtrl.text) {
                          return 'New password must differ from current password';
                        }
                        return null;
                      },
                      suffixIcon: IconButton(
                        icon: Icon(_obscureNew
                            ? Icons.visibility_off_outlined
                            : Icons.visibility_outlined),
                        onPressed: () =>
                            setState(() => _obscureNew = !_obscureNew),
                      ),
                    ),

                    // Confirm new password
                    AppTextField(
                      label: 'Confirm new password',
                      hint: 'Re-enter your new password',
                      controller: _confirmCtrl,
                      obscureText: _obscureConfirm,
                      textInputAction: TextInputAction.done,
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
                const SizedBox(height: AppSpacing.xl),
                AppButton(
                  label: 'Update password',
                  icon: Icons.lock_reset_rounded,
                  isLoading: _busy,
                  onPressed: _busy ? null : _submitPassword,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
