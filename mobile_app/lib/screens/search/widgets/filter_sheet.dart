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
  late String _sort = widget.initial.sort;
  late bool _featured = widget.initial.featured ?? false;
  late final _cityCtrl = TextEditingController(text: widget.initial.city ?? '');
  late final _sportCtrl =
      TextEditingController(text: widget.initial.sport ?? '');
  late final _ageCtrl =
      TextEditingController(text: widget.initial.age?.toString() ?? '');
  late final _minPriceCtrl =
      TextEditingController(text: widget.initial.minPrice?.toString() ?? '');
  late final _maxPriceCtrl =
      TextEditingController(text: widget.initial.maxPrice?.toString() ?? '');

  @override
  void dispose() {
    _cityCtrl.dispose();
    _sportCtrl.dispose();
    _ageCtrl.dispose();
    _minPriceCtrl.dispose();
    _maxPriceCtrl.dispose();
    super.dispose();
  }

  void _reset() {
    setState(() {
      _gender = null;
      _sort = 'newest';
      _featured = false;
      _cityCtrl.clear();
      _sportCtrl.clear();
      _ageCtrl.clear();
      _minPriceCtrl.clear();
      _maxPriceCtrl.clear();
    });
  }

  /// Count of non-default filters — surfaced on the Reset/Apply controls.
  int get _activeCount {
    var n = 0;
    if (_gender != null) n++;
    if (_cityCtrl.text.trim().isNotEmpty) n++;
    if (_sportCtrl.text.trim().isNotEmpty) n++;
    if (_ageCtrl.text.trim().isNotEmpty) n++;
    if (_minPriceCtrl.text.trim().isNotEmpty) n++;
    if (_maxPriceCtrl.text.trim().isNotEmpty) n++;
    if (_featured) n++;
    if (_sort != 'newest') n++;
    return n;
  }

  void _apply() {
    FocusManager.instance.primaryFocus?.unfocus();
    num? parseNum(String v) => v.trim().isEmpty ? null : num.tryParse(v.trim());
    int? parseInt(String v) => v.trim().isEmpty ? null : int.tryParse(v.trim());

    Navigator.of(context).pop(
      ClubFilter(
        search: widget.initial.search,
        gender: _gender,
        sort: _sort,
        featured: _featured ? true : null,
        city: _cityCtrl.text.trim().isEmpty ? null : _cityCtrl.text.trim(),
        sport: _sportCtrl.text.trim().isEmpty ? null : _sportCtrl.text.trim(),
        age: parseInt(_ageCtrl.text),
        minPrice: parseNum(_minPriceCtrl.text),
        maxPrice: parseNum(_maxPriceCtrl.text),
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
                  color: Color(0x1F1C1C28),
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
                            label: 'Any',
                            selected: _gender == null,
                            onTap: () => setState(() => _gender = null),
                          ),
                          _SelectPill(
                            label: 'Boys',
                            selected: _gender == 'male',
                            onTap: () => setState(() => _gender = 'male'),
                          ),
                          _SelectPill(
                            label: 'Girls',
                            selected: _gender == 'female',
                            onTap: () => setState(() => _gender = 'female'),
                          ),
                          _SelectPill(
                            label: 'Mixed',
                            selected: _gender == 'mixed',
                            onTap: () => setState(() => _gender = 'mixed'),
                          ),
                        ],
                      ),
                      const SizedBox(height: AppSpacing.xl),
                      const _SectionLabel(
                          icon: Icons.tune_rounded, label: 'Details'),
                      const SizedBox(height: AppSpacing.sm + 2),
                      AppTextField(
                        label: 'City',
                        controller: _cityCtrl,
                        prefixIcon: const Icon(Icons.location_city_outlined,
                            size: 20, color: AppColors.textTertiary),
                        onChanged: (_) => setState(() {}),
                      ),
                      const SizedBox(height: AppSpacing.md),
                      AppTextField(
                        label: 'Sport',
                        controller: _sportCtrl,
                        hint: 'e.g. Football, Swimming',
                        prefixIcon: const Icon(Icons.sports_soccer_outlined,
                            size: 20, color: AppColors.textTertiary),
                        onChanged: (_) => setState(() {}),
                      ),
                      const SizedBox(height: AppSpacing.md),
                      AppTextField(
                        label: "Children's age",
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
                      const SizedBox(height: AppSpacing.xl),
                      const _SectionLabel(
                          icon: Icons.payments_outlined, label: 'Price range'),
                      const SizedBox(height: AppSpacing.sm + 2),
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Expanded(
                            child: AppTextField(
                              label: 'Min',
                              controller: _minPriceCtrl,
                              keyboardType: TextInputType.number,
                              inputFormatters: [
                                FilteringTextInputFormatter.digitsOnly,
                              ],
                              onChanged: (_) => setState(() {}),
                            ),
                          ),
                          const Padding(
                            padding: EdgeInsets.only(top: 34),
                            child: SizedBox(
                              width: AppSpacing.md,
                              child: Center(
                                child: Text('–',
                                    style: TextStyle(
                                        color: AppColors.textTertiary)),
                              ),
                            ),
                          ),
                          Expanded(
                            child: AppTextField(
                              label: 'Max',
                              controller: _maxPriceCtrl,
                              keyboardType: TextInputType.number,
                              inputFormatters: [
                                FilteringTextInputFormatter.digitsOnly,
                              ],
                              onChanged: (_) => setState(() {}),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: AppSpacing.lg),
                      _ToggleCard(
                        value: _featured,
                        onChanged: (v) => setState(() => _featured = v),
                      ),
                      const SizedBox(height: AppSpacing.xl),
                      const _SectionLabel(
                          icon: Icons.sort_rounded, label: 'Sort by'),
                      const SizedBox(height: AppSpacing.sm + 2),
                      Wrap(
                        spacing: AppSpacing.sm,
                        runSpacing: AppSpacing.sm,
                        children: [
                          for (final option in _sortOptions)
                            _SelectPill(
                              label: option.$2,
                              icon: option.$3,
                              selected: _sort == option.$1,
                              onTap: () => setState(() => _sort = option.$1),
                            ),
                        ],
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

  static const List<(String, String, IconData)> _sortOptions = [
    ('newest', 'Newest', Icons.fiber_new_outlined),
    ('oldest', 'Oldest', Icons.history_rounded),
    ('price_asc', 'Price: low', Icons.arrow_upward_rounded),
    ('price_desc', 'Price: high', Icons.arrow_downward_rounded),
    ('popular', 'Most popular', Icons.local_fire_department_outlined),
  ];
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
  final IconData? icon;

  const _SelectPill({
    required this.label,
    required this.selected,
    required this.onTap,
    this.icon,
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
            if (icon != null) ...[
              Icon(icon,
                  size: 16,
                  color: selected ? Colors.white : AppColors.textTertiary),
              const SizedBox(width: 6),
            ],
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

/// Bordered card toggling the "Featured only" filter.
class _ToggleCard extends StatelessWidget {
  final bool value;
  final ValueChanged<bool> onChanged;

  const _ToggleCard({required this.value, required this.onChanged});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Material(
      color: value ? AppColors.surfaceMuted : AppColors.card,
      shape: RoundedRectangleBorder(
        borderRadius: AppRadius.lgAll,
        side: BorderSide(
          color: value ? AppColors.primary.withValues(alpha: 0.35) : AppColors.borderStrong,
          width: 1.25,
        ),
      ),
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: () => onChanged(!value),
        child: Padding(
          padding: const EdgeInsets.symmetric(
              horizontal: AppSpacing.md, vertical: AppSpacing.sm + 2),
          child: Row(
            children: [
              Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  color: AppColors.accent.withValues(alpha: 0.16),
                  borderRadius: AppRadius.mdAll,
                ),
                child: const Icon(Icons.star_rounded,
                    color: AppColors.accent, size: 22),
              ),
              const SizedBox(width: AppSpacing.md),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Featured only',
                        style: theme.textTheme.bodyLarge
                            ?.copyWith(fontWeight: FontWeight.w700)),
                    Text('Show highlighted clubs first',
                        style: theme.textTheme.bodySmall
                            ?.copyWith(color: AppColors.textTertiary)),
                  ],
                ),
              ),
              Switch(value: value, onChanged: onChanged),
            ],
          ),
        ),
      ),
    );
  }
}
