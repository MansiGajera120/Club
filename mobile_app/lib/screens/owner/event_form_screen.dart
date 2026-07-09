import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/error/exceptions.dart';
import '../../providers/event_providers.dart';
import '../../theme/app_spacing.dart';
import '../../utils/formatters.dart';
import '../../utils/validators.dart';
import '../../widgets/widgets.dart';

/// Create an event for one of the owner's clubs.
class EventFormScreen extends ConsumerStatefulWidget {
  final String clubId;

  const EventFormScreen({super.key, required this.clubId});

  @override
  ConsumerState<EventFormScreen> createState() => _EventFormScreenState();
}

class _EventFormScreenState extends ConsumerState<EventFormScreen> {
  final _formKey = GlobalKey<FormState>();
  final _title = TextEditingController();
  final _description = TextEditingController();
  final _location = TextEditingController();
  final _registration = TextEditingController();
  DateTime? _startDate;
  bool _busy = false;

  @override
  void dispose() {
    _title.dispose();
    _description.dispose();
    _location.dispose();
    _registration.dispose();
    super.dispose();
  }

  Future<void> _pickDate() async {
    final now = DateTime.now();
    final date = await showDatePicker(
      context: context,
      firstDate: now,
      lastDate: DateTime(now.year + 3),
      initialDate: _startDate ?? now,
    );
    if (date == null || !mounted) return;
    final time = await showTimePicker(
      context: context,
      initialTime: TimeOfDay.fromDateTime(_startDate ?? now),
    );
    setState(() {
      _startDate = DateTime(
        date.year,
        date.month,
        date.day,
        time?.hour ?? 9,
        time?.minute ?? 0,
      );
    });
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    if (_startDate == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please choose a start date')),
      );
      return;
    }
    setState(() => _busy = true);
    try {
      await ref.read(eventRepositoryProvider).createEvent({
        'club': widget.clubId,
        'title': _title.text.trim(),
        'description': _description.text.trim(),
        'location': _location.text.trim(),
        'startDate': _startDate!.toUtc().toIso8601String(),
        'registrationLink': _registration.text.trim(),
      });
      ref.invalidate(ownerEventsScreenProvider);
      ref.invalidate(ownerEventsProvider);
      ref.invalidate(upcomingEventsProvider);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Event created')),
        );
        context.pop();
      }
    } catch (e) {
      final message = e is AppException ? e.message : 'Something went wrong';
      if (mounted) {
        ScaffoldMessenger.of(context)
          ..clearSnackBars()
          ..showSnackBar(SnackBar(content: Text(message)));
      }
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('New event')),
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
                      onTap: _pickDate,
                    ),
                    AppTextField(
                      label: 'Registration link',
                      controller: _registration,
                      hint: 'https://…',
                    ),
                  ],
                ),
                const SizedBox(height: AppSpacing.xl),
                AppButton(
                  label: 'Create event',
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
