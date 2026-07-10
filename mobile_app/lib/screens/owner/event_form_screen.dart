import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';

import '../../models/event_model.dart';
import '../../providers/event_providers.dart';
import '../../theme/app_colors.dart';
import '../../theme/app_radius.dart';
import '../../theme/app_spacing.dart';
import '../../utils/app_toast.dart';
import '../../utils/formatters.dart';
import '../../utils/validators.dart';
import '../../widgets/widgets.dart';

/// Arguments for navigating to [EventFormScreen].
class EventFormArgs {
  final String clubId;
  final Event? event;

  const EventFormArgs({required this.clubId, this.event});
}

/// Create or edit an event for one of the owner's clubs.
class EventFormScreen extends ConsumerStatefulWidget {
  final String clubId;
  final Event? event;

  const EventFormScreen({super.key, required this.clubId, this.event});

  bool get isEditing => event != null;

  @override
  ConsumerState<EventFormScreen> createState() => _EventFormScreenState();
}

class _EventFormScreenState extends ConsumerState<EventFormScreen> {
  final _formKey = GlobalKey<FormState>();
  late final TextEditingController _title;
  late final TextEditingController _description;
  late final TextEditingController _location;
  late final TextEditingController _registration;
  late final TextEditingController _price;
  DateTime? _startDate;
  DateTime? _endDate;
  DateTime? _regStart;
  DateTime? _regEnd;
  late String _currency;
  late bool _isActive;
  String? _coverPath;
  bool _busy = false;

  @override
  void initState() {
    super.initState();
    final event = widget.event;
    _title = TextEditingController(text: event?.title ?? '');
    _description = TextEditingController(text: event?.description ?? '');
    _location = TextEditingController(text: event?.location ?? '');
    _registration = TextEditingController(text: event?.registrationLink ?? '');
    _price = TextEditingController(text: (event?.price ?? 0).toString());
    _startDate = event?.startDate.toLocal();
    _endDate = event?.endDate?.toLocal();
    _regStart = event?.registrationStartDate?.toLocal();
    _regEnd = event?.registrationEndDate?.toLocal();
    _currency = event?.priceCurrency ?? 'INR';
    _isActive = event?.isActive ?? true;
  }

  @override
  void dispose() {
    _title.dispose();
    _description.dispose();
    _location.dispose();
    _registration.dispose();
    _price.dispose();
    super.dispose();
  }

  /// Pick a date + time within [minDateTime] and [maxDateTime] (inclusive).
  Future<DateTime?> _pickDateTime(
    DateTime? current, {
    required DateTime minDateTime,
    required DateTime maxDateTime,
  }) async {
    if (minDateTime.isAfter(maxDateTime)) {
      AppToast.error('No valid dates in this range. Check the event date.');
      return null;
    }

    final initial = current ?? minDateTime;
    final clampedInitial = initial.isBefore(minDateTime)
        ? minDateTime
        : initial.isAfter(maxDateTime)
            ? maxDateTime
            : initial;

    final date = await showDatePicker(
      context: context,
      firstDate: DateTime(minDateTime.year, minDateTime.month, minDateTime.day),
      lastDate: DateTime(maxDateTime.year, maxDateTime.month, maxDateTime.day),
      initialDate: DateTime(
        clampedInitial.year,
        clampedInitial.month,
        clampedInitial.day,
      ),
    );
    if (date == null || !mounted) return null;

    final isMinDay = date.year == minDateTime.year &&
        date.month == minDateTime.month &&
        date.day == minDateTime.day;
    final isMaxDay = date.year == maxDateTime.year &&
        date.month == maxDateTime.month &&
        date.day == maxDateTime.day;

    var initialTime = TimeOfDay.fromDateTime(clampedInitial);
    if (isMinDay) {
      final minTime = TimeOfDay.fromDateTime(minDateTime);
      if (_timeOfDayToMinutes(initialTime) < _timeOfDayToMinutes(minTime)) {
        initialTime = minTime;
      }
    }
    if (isMaxDay) {
      final maxTime = TimeOfDay.fromDateTime(maxDateTime);
      if (_timeOfDayToMinutes(initialTime) > _timeOfDayToMinutes(maxTime)) {
        initialTime = maxTime;
      }
    }

    final time = await showTimePicker(
      context: context,
      initialTime: initialTime,
    );
    if (time == null || !mounted) return null;

    final picked = DateTime(
      date.year,
      date.month,
      date.day,
      time.hour,
      time.minute,
    );

    if (picked.isBefore(minDateTime) || picked.isAfter(maxDateTime)) {
      AppToast.error('Selected time is outside the allowed range');
      return null;
    }
    return picked;
  }

  int _timeOfDayToMinutes(TimeOfDay time) => time.hour * 60 + time.minute;

  DateTime get _now => DateTime.now();

  DateTime get _maxEventDate => DateTime(_now.year + 3, _now.month, _now.day);

  void _clearInvalidRegistrationDates() {
    if (_startDate == null) return;
    if (_regStart != null && !_regStart!.isBefore(_startDate!)) {
      _regStart = null;
    }
    if (_regEnd != null && !_regEnd!.isBefore(_startDate!)) {
      _regEnd = null;
    }
    if (_regStart != null &&
        _regEnd != null &&
        _regEnd!.isBefore(_regStart!)) {
      _regEnd = null;
    }
  }

  Future<void> _pickStart() async {
    final picked = await _pickDateTime(
      _startDate,
      minDateTime: _now,
      maxDateTime: _maxEventDate,
    );
    if (picked != null) {
      setState(() {
        _startDate = picked;
        if (_endDate != null && _endDate!.isBefore(picked)) _endDate = null;
        _clearInvalidRegistrationDates();
      });
    }
  }

  Future<void> _pickEnd() async {
    if (_startDate == null) {
      AppToast.info('Choose the start date first');
      return;
    }
    final picked = await _pickDateTime(
      _endDate,
      minDateTime: _startDate!,
      maxDateTime: _maxEventDate,
    );
    if (picked != null) setState(() => _endDate = picked);
  }

  Future<void> _pickCover() async {
    final picked = await ImagePicker()
        .pickImage(source: ImageSource.gallery, maxWidth: 1600, imageQuality: 85);
    if (picked != null) setState(() => _coverPath = picked.path);
  }

  Future<void> _pickRegStart() async {
    if (_startDate == null) {
      AppToast.info('Choose the event date first');
      return;
    }
    final picked = await _pickDateTime(
      _regStart,
      minDateTime: _now,
      maxDateTime: _startDate!,
    );
    if (picked != null) {
      setState(() {
        _regStart = picked;
        if (_regEnd != null && _regEnd!.isBefore(picked)) {
          _regEnd = null;
        }
      });
    }
  }

  Future<void> _pickRegEnd() async {
    if (_startDate == null) {
      AppToast.info('Choose the event date first');
      return;
    }
    final minDateTime = _regStart ?? _now;
    final picked = await _pickDateTime(
      _regEnd ?? _regStart,
      minDateTime: minDateTime,
      maxDateTime: _startDate!,
    );
    if (picked != null) setState(() => _regEnd = picked);
  }

  bool _validateRegistrationDates() {
    if (_regStart == null && _regEnd == null) return true;

    if (_regStart != null && !_regStart!.isBefore(_startDate!)) {
      AppToast.error('Registration must open before the event starts');
      return false;
    }
    if (_regEnd != null && !_regEnd!.isBefore(_startDate!)) {
      AppToast.error('Registration must close before the event starts');
      return false;
    }
    if (_regStart != null && _regEnd != null && _regEnd!.isBefore(_regStart!)) {
      AppToast.error('Registration close must be after it opens');
      return false;
    }
    return true;
  }

  Map<String, dynamic> _buildPayload() {
    final payload = <String, dynamic>{
      'title': _title.text.trim(),
      'description': _description.text.trim(),
      'location': _location.text.trim(),
      'startDate': _startDate!.toUtc().toIso8601String(),
      'price': num.tryParse(_price.text.trim()) ?? 0,
      'priceCurrency': _currency,
      'registrationLink': _registration.text.trim(),
      'registrationStartDate': _regStart?.toUtc().toIso8601String(),
      'registrationEndDate': _regEnd?.toUtc().toIso8601String(),
      'isActive': _isActive,
    };
    // endDate is optional and cannot be null server-side — include only if set.
    if (_endDate != null) {
      payload['endDate'] = _endDate!.toUtc().toIso8601String();
    }
    return payload;
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    if (_startDate == null) {
      AppToast.info('Please choose a start date');
      return;
    }
    if (_endDate != null && _endDate!.isBefore(_startDate!)) {
      AppToast.error('End date must be on or after the start date');
      return;
    }
    if (!_validateRegistrationDates()) return;

    setState(() => _busy = true);
    try {
      final repo = ref.read(eventRepositoryProvider);
      final Event saved = widget.isEditing
          ? await repo.updateEvent(widget.event!.id, _buildPayload())
          : await repo.createEvent({
              'club': widget.clubId,
              ..._buildPayload(),
            });

      if (_coverPath != null) {
        await repo.uploadCover(saved.id, _coverPath!);
      }
      ref.invalidate(ownerEventsScreenProvider);
      ref.invalidate(ownerEventsProvider);
      ref.invalidate(upcomingEventsProvider);
      if (mounted) {
        AppToast.success(
          widget.isEditing ? 'Event updated' : 'Event created',
        );
        context.pop();
      }
    } catch (e) {
      AppToast.showError(e);
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.isEditing ? 'Edit event' : 'New event'),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(AppSpacing.lg),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                FormSection(
                  title: 'Cover image',
                  subtitle: 'Shown at the top of the event card',
                  icon: Icons.image_outlined,
                  children: [
                    _CoverPicker(
                      localPath: _coverPath,
                      existingUrl: widget.event?.coverImage,
                      onTap: _busy ? null : _pickCover,
                    ),
                  ],
                ),
                const SizedBox(height: AppSpacing.lg),
                FormSection(
                  title: 'Event details',
                  subtitle: 'What parents will see in the events feed',
                  icon: Icons.event_outlined,
                  children: [
                    AppTextField(
                      label: 'Title',
                      controller: _title,
                      maxLength: 160,
                      validator: (v) =>
                          Validators.required(v, field: 'Title'),
                    ),
                    AppTextField(
                      label: 'Description',
                      controller: _description,
                      maxLines: 4,
                      minLines: 3,
                      maxLength: 4000,
                    ),
                    AppTextField(
                        label: 'Location',
                        controller: _location,
                        maxLength: 300),
                  ],
                ),
                const SizedBox(height: AppSpacing.lg),
                FormSection(
                  title: 'Schedule & registration',
                  icon: Icons.schedule_outlined,
                  children: [
                    AppPickerField(
                      label: 'Start date & time',
                      value: _startDate == null
                          ? ''
                          : Formatters.dateTime(_startDate!),
                      placeholder: 'Choose date and time',
                      onTap: _pickStart,
                    ),
                    AppPickerField(
                      label: 'End date & time (optional)',
                      value:
                          _endDate == null ? '' : Formatters.dateTime(_endDate!),
                      placeholder: _startDate == null
                          ? 'Set start date first'
                          : 'Choose date and time',
                      onTap: _pickEnd,
                    ),
                    AppTextField(
                      label: 'Registration link',
                      controller: _registration,
                      hint: 'https://…',
                      maxLength: 300,
                    ),
                  ],
                ),
                const SizedBox(height: AppSpacing.lg),
                FormSection(
                  title: 'Pricing',
                  icon: Icons.payments_outlined,
                  children: [
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Expanded(
                          flex: 2,
                          child: AppTextField(
                            label: 'Price',
                            controller: _price,
                            keyboardType: TextInputType.number,
                            maxLength: 7,
                            inputFormatters: [
                              FilteringTextInputFormatter.digitsOnly,
                            ],
                          ),
                        ),
                        const SizedBox(width: AppSpacing.md),
                        Expanded(
                          child: AppDropdownField<String>(
                            label: 'Currency',
                            value: _currency,
                            items: const [
                              DropdownMenuItem(value: 'USD', child: Text('USD')),
                              DropdownMenuItem(value: 'INR', child: Text('INR')),
                              DropdownMenuItem(value: 'EUR', child: Text('EUR')),
                              DropdownMenuItem(value: 'GBP', child: Text('GBP')),
                            ],
                            onChanged: (v) =>
                                setState(() => _currency = v ?? _currency),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
                const SizedBox(height: AppSpacing.lg),
                FormSection(
                  title: 'Registration period',
                  subtitle: _startDate == null
                      ? 'Set the event date first — registration must end before the event starts'
                      : 'Optional — registration must open and close before the event starts',
                  icon: Icons.how_to_reg_outlined,
                  children: [
                    AppPickerField(
                      label: 'Registration opens',
                      value: _regStart == null
                          ? ''
                          : Formatters.dateTime(_regStart!),
                      placeholder: _startDate == null
                          ? 'Set event date first'
                          : 'Choose date and time',
                      onTap: _pickRegStart,
                    ),
                    AppPickerField(
                      label: 'Registration closes',
                      value:
                          _regEnd == null ? '' : Formatters.dateTime(_regEnd!),
                      placeholder: _startDate == null
                          ? 'Set event date first'
                          : 'Choose date and time',
                      onTap: _pickRegEnd,
                    ),
                  ],
                ),
                const SizedBox(height: AppSpacing.lg),
                FormSection(
                  title: 'Visibility',
                  icon: Icons.visibility_outlined,
                  children: [
                    SwitchListTile(
                      contentPadding: EdgeInsets.zero,
                      title: const Text('Active'),
                      subtitle: const Text('Visible to parents in the app'),
                      value: _isActive,
                      onChanged: (v) => setState(() => _isActive = v),
                    ),
                  ],
                ),
                const SizedBox(height: AppSpacing.xl),
                AppButton(
                  label: widget.isEditing ? 'Save changes' : 'Create event',
                  isLoading: _busy,
                  onPressed: _submit,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

/// Wide 16:9 cover picker showing the newly-picked local file, the existing
/// cover (edit mode), or an empty prompt.
class _CoverPicker extends StatelessWidget {
  final String? localPath;
  final String? existingUrl;
  final VoidCallback? onTap;

  const _CoverPicker({
    required this.localPath,
    required this.existingUrl,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    Widget content;
    if (localPath != null) {
      content = Image.file(File(localPath!), fit: BoxFit.cover);
    } else if (existingUrl != null) {
      content = CachedImage(url: existingUrl, fit: BoxFit.cover);
    } else {
      content = Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.add_photo_alternate_outlined,
              size: 30, color: AppColors.textTertiary),
          const SizedBox(height: 6),
          Text('Tap to add a cover',
              style: Theme.of(context)
                  .textTheme
                  .labelMedium
                  ?.copyWith(color: AppColors.textTertiary)),
        ],
      );
    }

    return GestureDetector(
      onTap: onTap,
      child: AspectRatio(
        aspectRatio: 16 / 9,
        child: Container(
          decoration: BoxDecoration(
            color: AppColors.card,
            borderRadius: AppRadius.lgAll,
            border: Border.all(color: AppColors.borderStrong, width: 1.25),
          ),
          clipBehavior: Clip.antiAlias,
          child: content,
        ),
      ),
    );
  }
}
