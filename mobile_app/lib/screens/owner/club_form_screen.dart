import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';

import '../../core/error/exceptions.dart';
import '../../models/club_model.dart';
import '../../providers/auth_provider.dart';
import '../../providers/club_providers.dart';
import '../../providers/owner_providers.dart';
import '../../theme/app_colors.dart';
import '../../theme/app_radius.dart';
import '../../theme/app_spacing.dart';
import '../../utils/app_toast.dart';
import '../../utils/validators.dart';
import '../../widgets/widgets.dart';

/// Create or edit a club. When [club] is provided the form edits it (and allows
/// logo upload); otherwise it registers a new club (submitted for approval).
///
/// [embedded] is used by the owner onboarding gate: the form is shown as the
/// home content (not a pushed route), so on success it must NOT pop — the gate
/// re-renders to the status screen once the club provider refreshes. In embedded
/// mode a logout action is shown so the owner isn't trapped on the form.
class ClubFormScreen extends ConsumerStatefulWidget {
  final Club? club;
  final bool embedded;

  const ClubFormScreen({super.key, this.club, this.embedded = false});

  @override
  ConsumerState<ClubFormScreen> createState() => _ClubFormScreenState();
}

class _ClubFormScreenState extends ConsumerState<ClubFormScreen> {
  final _formKey = GlobalKey<FormState>();

  late final _name = TextEditingController(text: widget.club?.name ?? '');
  late final _sport = TextEditingController(text: widget.club?.sport ?? '');
  late final _city = TextEditingController(text: widget.club?.city ?? '');
  late final _address = TextEditingController(text: widget.club?.address ?? '');
  late final _description =
      TextEditingController(text: widget.club?.description ?? '');
  late final _ageMin =
      TextEditingController(text: (widget.club?.ageMin ?? 0).toString());
  late final _ageMax =
      TextEditingController(text: (widget.club?.ageMax ?? 100).toString());
  late final _price =
      TextEditingController(text: (widget.club?.price ?? 0).toString());
  late final _phone = TextEditingController(text: widget.club?.contact?.phone ?? '');
  late final _email = TextEditingController(text: widget.club?.contact?.email ?? '');
  late final _website =
      TextEditingController(text: widget.club?.contact?.website ?? '');
  late final _instagram =
      TextEditingController(text: widget.club?.contact?.instagram ?? '');
  late final _tiktok = TextEditingController(text: widget.club?.contact?.tiktok ?? '');
  late final _services =
      TextEditingController(text: (widget.club?.services ?? []).join(', '));
  late final _registrationLink =
      TextEditingController(text: widget.club?.registrationLink ?? '');

  late String _gender = widget.club?.gender ?? 'mixed';
  late String _currency = widget.club?.priceCurrency ?? 'INR';
  String? _logoPath;

  /// Newly-picked gallery photos (local file paths), uploaded after save.
  final List<String> _galleryPaths = [];

  /// Existing gallery photo URLs (edit mode) — removable immediately.
  late final List<String> _existingGallery = [...(widget.club?.gallery ?? [])];

  bool _busy = false;

  bool get _isEdit => widget.club != null;

  @override
  void dispose() {
    for (final c in [
      _name, _sport, _city, _address, _description, _ageMin, _ageMax, _price,
      _phone, _email, _website, _instagram, _tiktok, _services, _registrationLink,
    ]) {
      c.dispose();
    }
    super.dispose();
  }

  String _labelForField(String raw) {
    switch (raw) {
      case 'name':
        return 'Club name';
      case 'sport':
        return 'Sport';
      case 'city':
        return 'City';
      case 'address':
        return 'Address';
      case 'description':
        return 'Description';
      case 'gender':
        return 'Gender';
      case 'ageMin':
        return 'Min age';
      case 'ageMax':
        return 'Max age';
      case 'price':
        return 'Price';
      case 'registrationLink':
        return 'Registration link';
      case 'contact.phone':
      case 'phone':
        return 'Phone';
      case 'contact.email':
      case 'email':
        return 'Email';
      case 'contact.website':
      case 'website':
        return 'Website';
      case 'contact.instagram':
      case 'instagram':
        return 'Instagram';
      case 'contact.tiktok':
      case 'tiktok':
        return 'TikTok';
      default:
        return raw;
    }
  }

  String _serverValidationMessage(ServerException e) {
    if (e.errors.isEmpty) return e.message;

    final lines = <String>[];
    for (final error in e.errors) {
      final rawField = [
        error['field'],
        error['path'],
        error['param'],
        error['name'],
      ].whereType<String>().firstOrNull;

      final rawMessage = [
        error['message'],
        error['msg'],
        error['error'],
      ].whereType<String>().firstOrNull;

      if (rawField != null && rawMessage != null) {
        lines.add('${_labelForField(rawField)}: $rawMessage');
      } else if (rawMessage != null) {
        lines.add(rawMessage);
      }
    }

    if (lines.isEmpty) return e.message;
    return lines.join('\n');
  }

  void _error(Object e) {
    final message = switch (e) {
      ServerException() => _serverValidationMessage(e),
      AppException() => e.message,
      _ => 'Something went wrong',
    };
    AppToast.error(message);
  }

  Future<void> _pickLogo() async {
    final picked = await ImagePicker()
        .pickImage(source: ImageSource.gallery, maxWidth: 1024, imageQuality: 85);
    if (picked != null) setState(() => _logoPath = picked.path);
  }

  Future<void> _pickGallery() async {
    final picked = await ImagePicker()
        .pickMultiImage(maxWidth: 1600, imageQuality: 85);
    if (picked.isNotEmpty) {
      setState(() => _galleryPaths.addAll(picked.map((x) => x.path)));
    }
  }

  Future<void> _removeExistingPhoto(String url) async {
    try {
      await ref.read(clubRepositoryProvider).removeGallery(widget.club!.id, url);
      setState(() => _existingGallery.remove(url));
      ref.invalidate(clubDetailProvider(widget.club!.id));
    } catch (e) {
      _error(e);
    }
  }

  List<String> _servicesList() => _services.text
      .split(',')
      .map((s) => s.trim())
      .where((s) => s.isNotEmpty)
      .toList();

  Map<String, dynamic> _body() => {
        'name': _name.text.trim(),
        'sport': _sport.text.trim(),
        'services': _servicesList(),
        'city': _city.text.trim(),
        'address': _address.text.trim(),
        'description': _description.text.trim(),
        'gender': _gender,
        'ageMin': int.tryParse(_ageMin.text.trim()) ?? 0,
        'ageMax': int.tryParse(_ageMax.text.trim()) ?? 100,
        'price': num.tryParse(_price.text.trim()) ?? 0,
        'priceCurrency': _currency,
        'registrationLink': _registrationLink.text.trim(),
        'contact': {
          'phone': _phone.text.trim(),
          'email': _email.text.trim(),
          'website': _website.text.trim(),
          'instagram': _instagram.text.trim(),
          'tiktok': _tiktok.text.trim(),
        },
      };

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _busy = true);
    try {
      final repo = ref.read(clubRepositoryProvider);
      final Club saved = _isEdit
          ? await repo.updateClub(widget.club!.id, _body())
          : await repo.createClub(_body());

      if (_logoPath != null) {
        await repo.uploadLogo(saved.id, _logoPath!);
      }
      if (_galleryPaths.isNotEmpty) {
        await repo.addGallery(saved.id, _galleryPaths);
      }

      ref.invalidate(myClubsProvider);
      ref.invalidate(featuredClubsProvider);
      ref.invalidate(recentClubsProvider);
      ref.invalidate(searchControllerProvider);

      if (mounted) {
        AppToast.success(
          _isEdit ? 'Club updated' : 'Club submitted for approval',
        );
        // Embedded (onboarding) form is the home content — don't pop; the gate
        // rebuilds to the status screen once myClubProvider refreshes.
        if (!widget.embedded) context.pop();
      }
    } catch (e) {
      _error(e);
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(_isEdit ? 'Edit club' : 'Register your club'),
        automaticallyImplyLeading: !widget.embedded,
        actions: widget.embedded
            ? [
                IconButton(
                  icon: const Icon(Icons.logout),
                  tooltip: 'Log out',
                  onPressed: () async {
                    AppToast.info('Logging out…');
                    await ref.read(authControllerProvider.notifier).logout();
                    AppToast.success('Logged out successfully');
                  },
                ),
              ]
            : null,
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
                  title: 'Club logo',
                  subtitle: 'Tap to upload a square image',
                  icon: Icons.image_outlined,
                  children: [
                    Center(
                      child: GestureDetector(
                        onTap: _busy ? null : _pickLogo,
                        child: Container(
                          width: 104,
                          height: 104,
                          decoration: BoxDecoration(
                            color: AppColors.card,
                            borderRadius: AppRadius.lgAll,
                            border: Border.all(
                              color: AppColors.borderStrong,
                              width: 1.25,
                            ),
                          ),
                          clipBehavior: Clip.antiAlias,
                          child: _logoPath != null
                              ? Image.file(
                                  File(_logoPath!),
                                  fit: BoxFit.cover,
                                  errorBuilder: (_, _, _) => const Icon(
                                    Icons.add_a_photo_outlined,
                                  ),
                                )
                              : (widget.club?.logo != null
                                  ? CachedImage(url: widget.club!.logo)
                                  : Column(
                                      mainAxisAlignment:
                                          MainAxisAlignment.center,
                                      children: [
                                        Icon(
                                          Icons.add_a_photo_outlined,
                                          size: 28,
                                          color: AppColors.textTertiary,
                                        ),
                                        const SizedBox(height: 4),
                                        Text(
                                          'Add logo',
                                          style: Theme.of(context)
                                              .textTheme
                                              .labelSmall
                                              ?.copyWith(
                                                color: AppColors.textTertiary,
                                              ),
                                        ),
                                      ],
                                    )),
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: AppSpacing.lg),
                FormSection(
                  title: 'Basic details',
                  subtitle: 'Core information parents will see',
                  icon: Icons.storefront_outlined,
                  children: [
                    AppTextField(
                      label: 'Club name',
                      controller: _name,
                      maxLength: 120,
                      validator: (v) =>
                          Validators.required(v, field: 'Club name'),
                    ),
                    AppTextField(
                        label: 'Sport', controller: _sport, maxLength: 80),
                    AppTextField(
                      label: 'Services (comma separated)',
                      controller: _services,
                      hint: 'Coaching, Summer camp, Trials',
                      maxLength: 500,
                    ),
                    AppTextField(
                        label: 'City', controller: _city, maxLength: 120),
                    AppTextField(
                        label: 'Address', controller: _address, maxLength: 300),
                    AppTextField(
                      label: 'Description',
                      controller: _description,
                      maxLines: 4,
                      minLines: 3,
                      maxLength: 4000,
                    ),
                  ],
                ),
                const SizedBox(height: AppSpacing.lg),
                FormSection(
                  title: 'Audience & pricing',
                  icon: Icons.people_outline_rounded,
                  children: [
                    Text(
                      'Gender',
                      style: Theme.of(context).textTheme.labelLarge?.copyWith(
                            fontSize: 13,
                            fontWeight: FontWeight.w600,
                            color: AppColors.textSecondary,
                          ),
                    ),
                    const SizedBox(height: AppSpacing.sm),
                    SegmentedButton<String>(
                      segments: const [
                        ButtonSegment(value: 'male', label: Text('Boys')),
                        ButtonSegment(value: 'female', label: Text('Girls')),
                        ButtonSegment(value: 'mixed', label: Text('Mixed')),
                      ],
                      selected: {_gender},
                      onSelectionChanged: (s) =>
                          setState(() => _gender = s.first),
                    ),
                    Row(
                      children: [
                        Expanded(
                          child: AppTextField(
                            label: 'Min age',
                            controller: _ageMin,
                            keyboardType: TextInputType.number,
                            maxLength: 3,
                            inputFormatters: [
                              FilteringTextInputFormatter.digitsOnly,
                            ],
                          ),
                        ),
                        const SizedBox(width: AppSpacing.md),
                        Expanded(
                          child: AppTextField(
                            label: 'Max age',
                            controller: _ageMax,
                            keyboardType: TextInputType.number,
                            maxLength: 3,
                            inputFormatters: [
                              FilteringTextInputFormatter.digitsOnly,
                            ],
                          ),
                        ),
                      ],
                    ),
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Expanded(
                          flex: 2,
                          child: AppTextField(
                            label: 'Price',
                            controller: _price,
                            keyboardType: TextInputType.number,
                            maxLength: 9,
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
                  title: 'Contact & links',
                  subtitle: 'How parents can reach you',
                  icon: Icons.contact_phone_outlined,
                  children: [
                    AppTextField(
                      label: 'Phone',
                      controller: _phone,
                      keyboardType: TextInputType.phone,
                      inputFormatters: [
                        FilteringTextInputFormatter.digitsOnly,
                        LengthLimitingTextInputFormatter(10),
                      ],
                      validator: Validators.phone,
                    ),
                    AppTextField(
                      label: 'Email',
                      controller: _email,
                      keyboardType: TextInputType.emailAddress,
                      maxLength: 160,
                    ),
                    AppTextField(
                      label: 'Website',
                      controller: _website,
                      hint: 'https://…',
                      maxLength: 300,
                    ),
                    AppTextField(
                        label: 'Instagram',
                        controller: _instagram,
                        maxLength: 300),
                    AppTextField(
                        label: 'TikTok', controller: _tiktok, maxLength: 300),
                    AppTextField(
                      label: 'Registration link',
                      controller: _registrationLink,
                      hint: 'https://…',
                      maxLength: 300,
                    ),
                  ],
                ),
                const SizedBox(height: AppSpacing.lg),
                FormSection(
                  title: 'Photos',
                  subtitle: 'Showcase your club — shown in the gallery',
                  icon: Icons.photo_library_outlined,
                  children: [
                    _GalleryEditor(
                      existing: _existingGallery,
                      staged: _galleryPaths,
                      onAdd: _busy ? null : _pickGallery,
                      onRemoveExisting: _busy ? null : _removeExistingPhoto,
                      onRemoveStaged: (path) =>
                          setState(() => _galleryPaths.remove(path)),
                    ),
                  ],
                ),
                const SizedBox(height: AppSpacing.xl),
                AppButton(
                  label: _isEdit ? 'Save changes' : 'Submit for approval',
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

/// Grid of gallery photos (existing + newly-picked) with a remove control on
/// each and an "Add photos" tile. Existing photos are removed from the server
/// immediately; staged photos are removed locally.
class _GalleryEditor extends StatelessWidget {
  final List<String> existing;
  final List<String> staged;
  final VoidCallback? onAdd;
  final void Function(String url)? onRemoveExisting;
  final void Function(String path) onRemoveStaged;

  const _GalleryEditor({
    required this.existing,
    required this.staged,
    required this.onAdd,
    required this.onRemoveExisting,
    required this.onRemoveStaged,
  });

  @override
  Widget build(BuildContext context) {
    return Wrap(
      spacing: AppSpacing.sm,
      runSpacing: AppSpacing.sm,
      children: [
        for (final url in existing)
          _Thumb(
            onRemove: onRemoveExisting == null
                ? null
                : () => onRemoveExisting!(url),
            child: CachedImage(url: url, fit: BoxFit.cover),
          ),
        for (final path in staged)
          _Thumb(
            onRemove: () => onRemoveStaged(path),
            child: Image.file(File(path), fit: BoxFit.cover),
          ),
        // Add tile
        InkWell(
          onTap: onAdd,
          borderRadius: AppRadius.mdAll,
          child: Container(
            width: 84,
            height: 84,
            decoration: BoxDecoration(
              color: AppColors.card,
              borderRadius: AppRadius.mdAll,
              border: Border.all(color: AppColors.borderStrong, width: 1.25),
            ),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.add_a_photo_outlined,
                    size: 22, color: AppColors.textTertiary),
                const SizedBox(height: 4),
                Text('Add',
                    style: Theme.of(context)
                        .textTheme
                        .labelSmall
                        ?.copyWith(color: AppColors.textTertiary)),
              ],
            ),
          ),
        ),
      ],
    );
  }
}

class _Thumb extends StatelessWidget {
  final Widget child;
  final VoidCallback? onRemove;

  const _Thumb({required this.child, required this.onRemove});

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 84,
      height: 84,
      child: Stack(
        fit: StackFit.expand,
        children: [
          ClipRRect(borderRadius: AppRadius.mdAll, child: child),
          Positioned(
            top: 2,
            right: 2,
            child: GestureDetector(
              onTap: onRemove,
              child: Container(
                padding: const EdgeInsets.all(2),
                decoration: const BoxDecoration(
                  color: Colors.black54,
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.close, size: 16, color: Colors.white),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
