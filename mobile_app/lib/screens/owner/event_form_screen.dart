import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
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
  late final TextEditingController _price;
  DateTime? _startDate;
  late String _type;
  bool _busy = false;

  /// Set on a failed submit; the date picker isn't a [FormField], so its error
  /// is tracked here rather than by the [Form].
  String? _startDateError;

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
    _type = event?.type ?? 'Events';
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

  /// Pick a date within [minDate] and [maxDate] (inclusive).
  Future<DateTime?> _pickDate(
    DateTime? current, {
    required DateTime minDate,
    required DateTime maxDate,
  }) async {
    if (minDate.isAfter(maxDate)) {
      AppToast.error('No valid dates in this range.');
      return null;
    }

    final initial = current ?? minDate;
    final clampedInitial = initial.isBefore(minDate)
        ? minDate
        : initial.isAfter(maxDate)
        ? maxDate
        : initial;

    final date = await showDatePicker(
      context: context,
      firstDate: DateTime(minDate.year, minDate.month, minDate.day),
      lastDate: DateTime(maxDate.year, maxDate.month, maxDate.day),
      initialDate: DateTime(
        clampedInitial.year,
        clampedInitial.month,
        clampedInitial.day,
      ),
    );
    if (date == null || !mounted) return null;

    return DateTime(date.year, date.month, date.day);
  }

  DateTime get _now => DateTime.now();

  DateTime get _maxEventDate => DateTime(_now.year + 3, _now.month, _now.day);

  Future<void> _pickStart() async {
    // When editing an event whose start is already in the past, allow keeping
    // (or re-picking) that original date; new events stay today-or-later.
    final original = widget.event?.startDate.toLocal();
    final minDate = (original != null && original.isBefore(_now))
        ? original
        : _now;
    final picked = await _pickDate(
      _startDate,
      minDate: minDate,
      maxDate: _maxEventDate,
    );
    if (picked != null) {
      setState(() {
        _startDate = picked;
        // Clear the miss as soon as it's fixed, rather than leaving the message
        // under a field that now has a date in it.
        _startDateError = null;
      });
    }
  }

  Map<String, dynamic> _buildPayload() {
    final payload = <String, dynamic>{
      'title': _title.text.trim(),
      'type': _type,
      'description': _description.text.trim(),
      'location': _location.text.trim(),
      'startDate': _startDate!.toUtc().toIso8601String(),
      'price': num.tryParse(_price.text.trim()) ?? 0,
      'priceCurrency': 'INR',
      'registrationLink': _registration.text.trim(),
      'registrationStartDate': null,
      'registrationEndDate': null,
      'endDate': null,
      'isActive': true,
    };
    return payload;
  }

  Future<void> _submit() async {
    // Run both checks before bailing out, so every problem on the form is
    // flagged at once instead of one per tap.
    final fieldsOk = _formKey.currentState!.validate();
    final dateOk = _startDate != null;
    setState(
      () => _startDateError = dateOk ? null : 'Please choose a start date',
    );
    if (!fieldsOk || !dateOk) return;

    setState(() => _busy = true);
    try {
      final repo = ref.read(eventRepositoryProvider);
      if (widget.isEditing) {
        await repo.updateEvent(widget.event!.id, _buildPayload());
      } else {
        await repo.createEvent({'club': widget.clubId, ..._buildPayload()});
      }

      ref.invalidate(ownerEventsScreenProvider);
      ref.invalidate(ownerEventsProvider);
      ref.invalidate(upcomingEventsProvider);
      if (mounted) {
        AppToast.success(widget.isEditing ? 'Event updated' : 'Event created');
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
                      maxLength: 160,
                      validator: (v) {
                        final empty = Validators.required(v, field: 'a title');
                        if (empty != null) return empty;
                        // The API enforces min(2); mirror it so a one-letter
                        // title fails here rather than as a 400.
                        if (v!.trim().length < 2) {
                          return 'Title must be at least 2 characters';
                        }
                        return null;
                      },
                    ),
                    AppDropdownField<String>(
                      label: 'Event type',
                      value: _type,
                      items: const [
                        DropdownMenuItem(value: 'Camps', child: Text('Camps')),
                        DropdownMenuItem(
                          value: 'Clinics',
                          child: Text('Clinics'),
                        ),
                        DropdownMenuItem(
                          value: 'Events',
                          child: Text('Events'),
                        ),
                      ],
                      onChanged: (v) => setState(() => _type = v ?? _type),
                    ),
                    AppTextField(
                      label: 'Description',
                      controller: _description,
                      maxLines: 4,
                      minLines: 3,
                      maxLength: 4000,
                      validator: (v) =>
                          Validators.required(v, field: 'a description'),
                    ),
                    AppTextField(
                      label: 'Location',
                      controller: _location,
                      maxLength: 300,
                      validator: (v) =>
                          Validators.required(v, field: 'a location'),
                    ),
                  ],
                ),
                const SizedBox(height: AppSpacing.lg),
                FormSection(
                  title: 'Schedule & registration',
                  icon: Icons.schedule_outlined,
                  children: [
                    AppPickerField(
                      label: 'Start date',
                      value: _startDate == null
                          ? ''
                          : Formatters.date(_startDate!),
                      placeholder: 'Choose date',
                      onTap: _pickStart,
                      errorText: _startDateError,
                    ),
                    AppTextField(
                      label: 'Registration link',
                      controller: _registration,
                      hint: 'https://…',
                      keyboardType: TextInputType.url,
                      maxLength: 300,
                      validator: (v) =>
                          Validators.url(v, field: 'a registration link'),
                    ),
                  ],
                ),
                const SizedBox(height: AppSpacing.lg),
                FormSection(
                  title: 'Pricing',
                  icon: Icons.payments_outlined,
                  children: [
                    AppTextField(
                      label: 'Price (₹)',
                      controller: _price,
                      hint: 'Enter 0 for a free event',
                      keyboardType: TextInputType.number,
                      maxLength: 7,
                      inputFormatters: [FilteringTextInputFormatter.digitsOnly],
                      validator: (v) {
                        final empty = Validators.required(v, field: 'a price');
                        if (empty != null) return empty;
                        final amount = num.tryParse(v!.trim());
                        if (amount == null) return 'Enter a valid price';
                        // maxLength of 7 allows 9,999,999 but the API caps
                        // price at 1,000,000 — without this the form happily
                        // submits a value the server then rejects.
                        if (amount > 1000000) {
                          return 'Price cannot be more than 10,00,000';
                        }
                        return null;
                      },
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
