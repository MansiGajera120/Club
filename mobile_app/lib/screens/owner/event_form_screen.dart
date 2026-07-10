import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../models/event_model.dart';
import '../../providers/event_providers.dart';
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
  DateTime? _startDate;
  DateTime? _regStart;
  DateTime? _regEnd;
  bool _busy = false;

  @override
  void initState() {
    super.initState();
    final event = widget.event;
    _title = TextEditingController(text: event?.title ?? '');
    _description = TextEditingController(text: event?.description ?? '');
    _location = TextEditingController(text: event?.location ?? '');
    _registration = TextEditingController(text: event?.registrationLink ?? '');
    _startDate = event?.startDate.toLocal();
    _regStart = event?.registrationStartDate?.toLocal();
    _regEnd = event?.registrationEndDate?.toLocal();
  }

  @override
  void dispose() {
    _title.dispose();
    _description.dispose();
    _location.dispose();
    _registration.dispose();
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
        _clearInvalidRegistrationDates();
      });
    }
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
    return {
      'title': _title.text.trim(),
      'description': _description.text.trim(),
      'location': _location.text.trim(),
      'startDate': _startDate!.toUtc().toIso8601String(),
      'registrationLink': _registration.text.trim(),
      'registrationStartDate': _regStart?.toUtc().toIso8601String(),
      'registrationEndDate': _regEnd?.toUtc().toIso8601String(),
    };
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    if (_startDate == null) {
      AppToast.info('Please choose a start date');
      return;
    }
    if (!_validateRegistrationDates()) return;

    setState(() => _busy = true);
    try {
      final repo = ref.read(eventRepositoryProvider);
      if (widget.isEditing) {
        await repo.updateEvent(widget.event!.id, _buildPayload());
      } else {
        await repo.createEvent({
          'club': widget.clubId,
          ..._buildPayload(),
        });
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
                  title: 'Event details',
                  subtitle: 'What parents will see in the events feed',
                  icon: Icons.event_outlined,
                  children: [
                    AppTextField(
                      label: 'Title',
                      controller: _title,
                      validator: (v) =>
                          Validators.required(v, field: 'Title'),
                    ),
                    AppTextField(
                      label: 'Description',
                      controller: _description,
                      maxLines: 4,
                      minLines: 3,
                    ),
                    AppTextField(label: 'Location', controller: _location),
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
                    AppTextField(
                      label: 'Registration link',
                      controller: _registration,
                      hint: 'https://…',
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
