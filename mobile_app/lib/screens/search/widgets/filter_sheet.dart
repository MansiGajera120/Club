import 'package:flutter/material.dart';

import '../../../models/club_filter.dart';
import '../../../theme/app_radius.dart';
import '../../../theme/app_spacing.dart';
import '../../../widgets/app_button.dart';

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
    final theme = Theme.of(context);
    final bottomInset = MediaQuery.viewInsetsOf(context).bottom;

    return Padding(
      padding: EdgeInsets.only(bottom: bottomInset),
      child: DraggableScrollableSheet(
        initialChildSize: 0.82,
        minChildSize: 0.45,
        maxChildSize: 0.92,
        expand: false,
        builder: (context, scrollController) {
          return Container(
            decoration: BoxDecoration(
              color: theme.colorScheme.surface,
              borderRadius: const BorderRadius.vertical(
                top: Radius.circular(AppRadius.xl),
              ),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.08),
                  blurRadius: 24,
                  offset: const Offset(0, -4),
                ),
              ],
            ),
            child: Column(
              children: [
                const SizedBox(height: AppSpacing.sm),
                Container(
                  width: 40,
                  height: 4,
                  decoration: BoxDecoration(
                    color: theme.dividerColor,
                    borderRadius: AppRadius.pillAll,
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.fromLTRB(
                    AppSpacing.lg,
                    AppSpacing.lg,
                    AppSpacing.lg,
                    AppSpacing.sm,
                  ),
                  child: Row(
                    children: [
                      Expanded(
                        child: Text('Filters', style: theme.textTheme.titleLarge),
                      ),
                      TextButton(onPressed: _reset, child: const Text('Reset')),
                    ],
                  ),
                ),
                Expanded(
                  child: ListView(
                    controller: scrollController,
                    padding: const EdgeInsets.fromLTRB(
                      AppSpacing.lg,
                      0,
                      AppSpacing.lg,
                      AppSpacing.md,
                    ),
                    children: [
                      Text('Gender', style: theme.textTheme.bodySmall),
                      const SizedBox(height: AppSpacing.sm),
                      Wrap(
                        spacing: AppSpacing.sm,
                        runSpacing: AppSpacing.sm,
                        children: [
                          _choice('Any', _gender == null,
                              () => setState(() => _gender = null)),
                          _choice('Boys', _gender == 'male',
                              () => setState(() => _gender = 'male')),
                          _choice('Girls', _gender == 'female',
                              () => setState(() => _gender = 'female')),
                          _choice('Mixed', _gender == 'mixed',
                              () => setState(() => _gender = 'mixed')),
                        ],
                      ),
                      const SizedBox(height: AppSpacing.lg),
                      TextField(
                        controller: _cityCtrl,
                        decoration: const InputDecoration(labelText: 'City'),
                      ),
                      const SizedBox(height: AppSpacing.md),
                      TextField(
                        controller: _sportCtrl,
                        textCapitalization: TextCapitalization.words,
                        decoration: const InputDecoration(
                          labelText: 'Sport',
                          hintText: 'e.g. Football, Swimming',
                        ),
                      ),
                      const SizedBox(height: AppSpacing.md),
                      TextField(
                        controller: _ageCtrl,
                        keyboardType: TextInputType.number,
                        decoration: const InputDecoration(labelText: 'Age'),
                      ),
                      const SizedBox(height: AppSpacing.md),
                      Row(
                        children: [
                          Expanded(
                            child: TextField(
                              controller: _minPriceCtrl,
                              keyboardType: TextInputType.number,
                              decoration:
                                  const InputDecoration(labelText: 'Min price'),
                            ),
                          ),
                          const SizedBox(width: AppSpacing.md),
                          Expanded(
                            child: TextField(
                              controller: _maxPriceCtrl,
                              keyboardType: TextInputType.number,
                              decoration:
                                  const InputDecoration(labelText: 'Max price'),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: AppSpacing.sm),
                      SwitchListTile(
                        contentPadding: EdgeInsets.zero,
                        title: const Text('Featured only'),
                        value: _featured,
                        onChanged: (v) => setState(() => _featured = v),
                      ),
                      const SizedBox(height: AppSpacing.md),
                      Text('Sort by', style: theme.textTheme.bodySmall),
                      const SizedBox(height: AppSpacing.sm),
                      DropdownButtonFormField<String>(
                        key: ValueKey(_sort),
                        initialValue: _sort,
                        isExpanded: true,
                        items: const [
                          DropdownMenuItem(
                              value: 'newest', child: Text('Newest')),
                          DropdownMenuItem(
                              value: 'oldest', child: Text('Oldest')),
                          DropdownMenuItem(
                              value: 'price_asc',
                              child: Text('Price: low to high')),
                          DropdownMenuItem(
                              value: 'price_desc',
                              child: Text('Price: high to low')),
                          DropdownMenuItem(
                              value: 'popular', child: Text('Most popular')),
                        ],
                        onChanged: (v) => setState(() => _sort = v ?? 'newest'),
                      ),
                    ],
                  ),
                ),
                Padding(
                  padding: EdgeInsets.fromLTRB(
                    AppSpacing.lg,
                    AppSpacing.sm,
                    AppSpacing.lg,
                    AppSpacing.lg + MediaQuery.paddingOf(context).bottom,
                  ),
                  child: AppButton(label: 'Apply filters', onPressed: _apply),
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _choice(String label, bool selected, VoidCallback onTap) {
    return ChoiceChip(
      label: Text(label),
      selected: selected,
      onSelected: (_) => onTap(),
    );
  }
}
