import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../../../theme/app_colors.dart';
import '../../../theme/app_radius.dart';
import '../../../theme/app_spacing.dart';

/// Six-box OTP input with a single hidden field for paste support.
class OtpCodeField extends StatefulWidget {
  final TextEditingController controller;
  final String? Function(String?)? validator;
  final bool enabled;

  const OtpCodeField({
    super.key,
    required this.controller,
    this.validator,
    this.enabled = true,
  });

  @override
  State<OtpCodeField> createState() => _OtpCodeFieldState();
}

class _OtpCodeFieldState extends State<OtpCodeField> {
  final _focusNode = FocusNode();
  String _code = '';

  @override
  void initState() {
    super.initState();
    _code = widget.controller.text;
    widget.controller.addListener(_syncFromController);
  }

  @override
  void dispose() {
    widget.controller.removeListener(_syncFromController);
    _focusNode.dispose();
    super.dispose();
  }

  void _syncFromController() {
    final next = widget.controller.text.replaceAll(RegExp(r'\D'), '');
    if (next != _code) setState(() => _code = next);
  }

  void _onChanged(String value) {
    final cleaned = value.replaceAll(RegExp(r'\D'), '');
    final digits = cleaned.length > 6 ? cleaned.substring(0, 6) : cleaned;
    widget.controller.text = digits;
    widget.controller.selection = TextSelection.collapsed(
      offset: digits.length,
    );
    setState(() => _code = digits);
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Verification code',
          style: theme.textTheme.labelLarge?.copyWith(
            fontSize: 13,
            fontWeight: FontWeight.w600,
            color: AppColors.textSecondary,
          ),
        ),
        const SizedBox(height: AppSpacing.sm),
        GestureDetector(
          onTap: widget.enabled ? () => _focusNode.requestFocus() : null,
          child: Stack(
            alignment: Alignment.center,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: List.generate(6, (i) {
                  final char = i < _code.length ? _code[i] : '';
                  final filled = char.isNotEmpty;
                  final active = _focusNode.hasFocus && i == _code.length;

                  return AnimatedContainer(
                    duration: const Duration(milliseconds: 150),
                    width: 46,
                    height: 52,
                    alignment: Alignment.center,
                    decoration: BoxDecoration(
                      color: AppColors.card,
                      borderRadius: AppRadius.mdAll,
                      border: Border.all(
                        color: active
                            ? AppColors.primary
                            : filled
                            ? AppColors.borderStrong
                            : AppColors.border,
                        width: active ? 1.8 : 1.25,
                      ),
                      boxShadow: active
                          ? [
                              BoxShadow(
                                color: AppColors.primary.withValues(
                                  alpha: 0.12,
                                ),
                                blurRadius: 8,
                                offset: const Offset(0, 2),
                              ),
                            ]
                          : null,
                    ),
                    child: Text(
                      char,
                      style: theme.textTheme.titleLarge?.copyWith(
                        fontWeight: FontWeight.w700,
                        letterSpacing: 0,
                      ),
                    ),
                  );
                }),
              ),
              Opacity(
                opacity: 0,
                child: TextFormField(
                  controller: widget.controller,
                  focusNode: _focusNode,
                  enabled: widget.enabled,
                  keyboardType: TextInputType.number,
                  textInputAction: TextInputAction.done,
                  autofillHints: const [AutofillHints.oneTimeCode],
                  inputFormatters: [
                    FilteringTextInputFormatter.digitsOnly,
                    LengthLimitingTextInputFormatter(6),
                  ],
                  validator: widget.validator,
                  onChanged: _onChanged,
                  decoration: const InputDecoration(
                    border: InputBorder.none,
                    counterText: '',
                  ),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: AppSpacing.sm),
        Text(
          'Enter the 6-digit code from your email',
          style: theme.textTheme.bodySmall?.copyWith(
            color: AppColors.textTertiary,
          ),
        ),
      ],
    );
  }
}
