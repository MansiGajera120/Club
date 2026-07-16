import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../../../models/club_filter.dart';
import '../../../theme/app_colors.dart';
import '../../../theme/app_radius.dart';
import '../../../theme/app_spacing.dart';
import '../../../widgets/app_button.dart';
import '../../../widgets/app_text_field.dart';

/// Bottom sheet for refining the club search. Returns a new [ClubFilter] (or
/// null if dismissed). The free-text `search` value is preserved.
class FilterSheet extends StatefulWidget {
  final ClubFilter initial;

  const FilterSheet({super.key, required this.initial});

  @override
  State<FilterSheet> createState() => _FilterSheetState();
}

class _FilterSheetState extends State<FilterSheet> {
  late String? _gender = widget.initial.gender;
  late final _ageCtrl =
      TextEditingController(text: widget.initial.age?.toString() ?? '');

  @override
  void dispose() {
    _ageCtrl.dispose();
    super.dispose();
  }

  void _reset() {
    setState(() {
      _gender = null;
      _ageCtrl.clear();
    });
  }

  /// Count of non-default filters — surfaced on the Reset/Apply controls.
  int get _activeCount {
    var n = 0;
    if (_gender != null) n++;
    if (_ageCtrl.text.trim().isNotEmpty) n++;
    return n;
  }

  void _apply() {
    FocusManager.instance.primaryFocus?.unfocus();
    int? parseInt(String v) => v.trim().isEmpty ? null : int.tryParse(v.trim());

    Navigator.of(context).pop(
      ClubFilter(
        search: widget.initial.search,
        gender: _gender,
        age: parseInt(_ageCtrl.text),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final bottomInset = MediaQuery.viewInsetsOf(context).bottom;

    return Padding(
      padding: EdgeInsets.only(bottom: bottomInset),
      child: DraggableScrollableSheet(
        initialChildSize: 0.85,
        minChildSize: 0.5,
        maxChildSize: 0.94,
        expand: false,
        builder: (context, scrollController) {
          return Container(
            decoration: const BoxDecoration(
              color: AppColors.background,
              borderRadius: BorderRadius.vertical(
                top: Radius.circular(AppRadius.xl),
              ),
              boxShadow: [
                BoxShadow(
                  color: Color(0x1F0F172A),
                  blurRadius: 28,
                  offset: Offset(0, -6),
                ),
              ],
            ),
            child: Column(
              children: [
                const SizedBox(height: AppSpacing.sm + 2),
                Container(
                  width: 44,
                  height: 5,
                  decoration: BoxDecoration(
                    color: AppColors.borderStrong,
                    borderRadius: AppRadius.pillAll,
                  ),
                ),
                _Header(
                  onReset: _activeCount == 0 ? null : _reset,
                ),
                Expanded(
                  child: ListView(
                    controller: scrollController,
                    padding: const EdgeInsets.fromLTRB(
                      AppSpacing.lg,
                      AppSpacing.sm,
                      AppSpacing.lg,
                      AppSpacing.md,
                    ),
                    children: [
                      const _SectionLabel(
                          icon: Icons.people_alt_outlined, label: 'Gender'),
                      const SizedBox(height: AppSpacing.sm + 2),
                      Wrap(
                        spacing: AppSpacing.sm,
                        runSpacing: AppSpacing.sm,
                        children: [
                          _SelectPill(
                            label: 'Boys Only',
                            selected: _gender == 'male',
                            onTap: () => setState(() => _gender = 'male'),
                          ),
                          _SelectPill(
                            label: 'Girls Only',
                            selected: _gender == 'female',
                            onTap: () => setState(() => _gender = 'female'),
                          ),
                          _SelectPill(
                            label: 'Boys & Girls',
                            selected: _gender == 'mixed',
                            onTap: () => setState(() => _gender = 'mixed'),
                          ),
                        ],
                      ),
                      const SizedBox(height: AppSpacing.xl),
                      const _SectionLabel(
                          icon: Icons.cake_outlined, label: 'Age Range'),
                      const SizedBox(height: AppSpacing.sm + 2),
                      AppTextField(
                        label: 'Age Range',
                        controller: _ageCtrl,
                        keyboardType: TextInputType.number,
                        maxLength: 2,
                        inputFormatters: [
                          FilteringTextInputFormatter.digitsOnly,
                        ],
                        prefixIcon: const Icon(Icons.cake_outlined,
                            size: 20, color: AppColors.textTertiary),
                        onChanged: (_) => setState(() {}),
                      ),
                    ],
                  ),
                ),
                _Footer(
                  activeCount: _activeCount,
                  onApply: _apply,
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}

/// Sheet header with a title and a Reset action.
class _Header extends StatelessWidget {
  final VoidCallback? onReset;

  const _Header({required this.onReset});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Padding(
      padding: const EdgeInsets.fromLTRB(
        AppSpacing.lg,
        AppSpacing.md,
        AppSpacing.md,
        AppSpacing.sm,
      ),
      child: Row(
        children: [
          Text('Filters',
              style: theme.textTheme.titleLarge
                  ?.copyWith(fontWeight: FontWeight.w800)),
          const Spacer(),
          TextButton.icon(
            onPressed: onReset,
            icon: const Icon(Icons.refresh_rounded, size: 18),
            label: const Text('Reset'),
            style: TextButton.styleFrom(
              foregroundColor: onReset == null
                  ? AppColors.textTertiary
                  : AppColors.textSecondary,
            ),
          ),
        ],
      ),
    );
  }
}

/// Pinned footer holding the primary Apply button.
class _Footer extends StatelessWidget {
  final int activeCount;
  final VoidCallback onApply;

  const _Footer({required this.activeCount, required this.onApply});

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        color: AppColors.card,
        border: Border(top: BorderSide(color: AppColors.border)),
      ),
      padding: EdgeInsets.fromLTRB(
        AppSpacing.lg,
        AppSpacing.md,
        AppSpacing.lg,
        AppSpacing.md + MediaQuery.paddingOf(context).bottom,
      ),
      child: AppButton(
        label: activeCount == 0
            ? 'Apply filters'
            : 'Apply filters ($activeCount)',
        onPressed: onApply,
      ),
    );
  }
}

/// Small icon + uppercase caption introducing each section.
class _SectionLabel extends StatelessWidget {
  final IconData icon;
  final String label;

  const _SectionLabel({required this.icon, required this.label});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Icon(icon, size: 16, color: AppColors.primary),
        const SizedBox(width: 6),
        Text(
          label.toUpperCase(),
          style: Theme.of(context).textTheme.labelMedium?.copyWith(
                color: AppColors.textSecondary,
                fontWeight: FontWeight.w700,
                letterSpacing: 0.6,
              ),
        ),
      ],
    );
  }
}

/// Selectable pill used for Gender and Sort. Selected pills use the brand
/// gradient with a soft glow; unselected ones are a bordered surface.
class _SelectPill extends StatelessWidget {
  final String label;
  final bool selected;
  final VoidCallback onTap;

  const _SelectPill({
    required this.label,
    required this.selected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 160),
        curve: Curves.easeOut,
        padding: const EdgeInsets.symmetric(
            horizontal: AppSpacing.md + 2, vertical: 10),
        decoration: BoxDecoration(
          gradient: selected
              ? const LinearGradient(colors: AppColors.brandGradient)
              : null,
          color: selected ? null : AppColors.card,
          borderRadius: AppRadius.pillAll,
          border: Border.all(
            color: selected ? Colors.transparent : AppColors.borderStrong,
            width: 1.25,
          ),
          boxShadow: selected
              ? [
                  BoxShadow(
                    color: AppColors.primary.withValues(alpha: 0.32),
                    blurRadius: 12,
                    offset: const Offset(0, 4),
                  ),
                ]
              : null,
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              label,
              style: theme.textTheme.bodyMedium?.copyWith(
                color: selected ? Colors.white : AppColors.textSecondary,
                fontWeight: FontWeight.w600,
              ),
            ),
          ],
        ),
      ),
    );
  }
}


