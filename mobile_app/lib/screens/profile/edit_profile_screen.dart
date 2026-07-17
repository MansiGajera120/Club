import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';

import '../../core/error/exceptions.dart';
import '../../models/club_model.dart';
import '../../models/user_model.dart';
import '../../providers/auth_provider.dart';
import '../../providers/club_providers.dart';
import '../../providers/owner_providers.dart';
import '../../theme/app_colors.dart';
import '../../theme/app_radius.dart';
import '../../theme/app_spacing.dart';
import '../../utils/app_toast.dart';
import '../../utils/validators.dart';
import '../../widgets/widgets.dart';

/// Edit the current user's profile (name + avatar).
/// For club owners, also shows all club detail fields so they can manage
/// their profile and club from a single screen.
class EditProfileScreen extends ConsumerStatefulWidget {
  const EditProfileScreen({super.key});

  @override
  ConsumerState<EditProfileScreen> createState() => _EditProfileScreenState();
}

class _EditProfileScreenState extends ConsumerState<EditProfileScreen> {
  final _formKey = GlobalKey<FormState>();

  // ── User fields ──
  late final TextEditingController _nameCtrl = TextEditingController(
    text: ref.read(authControllerProvider).user?.name ?? '',
  );

  // ── Club fields (initialised in didChangeDependencies) ──
  final _clubNameCtrl = TextEditingController();
  final _cityCtrl = TextEditingController();
  final _addressCtrl = TextEditingController();
  final _descriptionCtrl = TextEditingController();
  final _ageMinCtrl = TextEditingController();
  final _ageMaxCtrl = TextEditingController();
  final _priceCtrl = TextEditingController();
  final _phoneCtrl = TextEditingController();
  final _emailCtrl = TextEditingController();
  final _websiteCtrl = TextEditingController();
  final _instagramCtrl = TextEditingController();
  final _tiktokCtrl = TextEditingController();
  final _servicesCtrl = TextEditingController();
  final _registrationLinkCtrl = TextEditingController();

  String _gender = 'mixed';
  String _currency = 'INR';
  String? _logoPath;

  final List<String> _galleryPaths = [];
  List<String> _existingGallery = [];

  bool _busy = false;
  bool _clubFieldsInitialised = false;

  bool get _isOwner =>
      ref.read(authControllerProvider).user?.role == UserRole.clubOwner;

  @override
  void dispose() {
    _nameCtrl.dispose();
    _clubNameCtrl.dispose();
    _cityCtrl.dispose();
    _addressCtrl.dispose();
    _descriptionCtrl.dispose();
    _ageMinCtrl.dispose();
    _ageMaxCtrl.dispose();
    _priceCtrl.dispose();
    _phoneCtrl.dispose();
    _emailCtrl.dispose();
    _websiteCtrl.dispose();
    _instagramCtrl.dispose();
    _tiktokCtrl.dispose();
    _servicesCtrl.dispose();
    _registrationLinkCtrl.dispose();
    super.dispose();
  }

  /// Populate club fields once the club data arrives.
  void _initClubFields(Club club) {
    if (_clubFieldsInitialised) return;
    _clubFieldsInitialised = true;

    _clubNameCtrl.text = club.name;
    _cityCtrl.text = club.city ?? '';
    _addressCtrl.text = club.address ?? '';
    _descriptionCtrl.text = club.description ?? '';
    _ageMinCtrl.text = club.ageMin.toString();
    _ageMaxCtrl.text = club.ageMax.toString();
    _priceCtrl.text = club.price.toString();
    _phoneCtrl.text = club.contact?.phone ?? '';
    _emailCtrl.text = club.contact?.email ?? '';
    _websiteCtrl.text = club.contact?.website ?? '';
    _instagramCtrl.text = club.contact?.instagram ?? '';
    _tiktokCtrl.text = club.contact?.tiktok ?? '';
    _servicesCtrl.text = (club.services).join(', ');
    _registrationLinkCtrl.text = club.registrationLink ?? '';
    _gender = club.gender;
    _currency = club.priceCurrency;
    _existingGallery = [...club.gallery];
  }

  // ── Helpers ──

  String _labelForField(String raw) {
    return switch (raw) {
      'name' => 'Club name',
      'sport' => 'Sport',
      'city' => 'City',
      'address' => 'Address',
      'description' => 'Description',
      'gender' => 'Gender',
      'ageMin' => 'Min age',
      'ageMax' => 'Max age',
      'price' => 'Price',
      'registrationLink' => 'Registration link',
      'contact.phone' || 'phone' => 'Phone',
      'contact.email' || 'email' => 'Email',
      'contact.website' || 'website' => 'Website',
      'contact.instagram' || 'instagram' => 'Instagram',
      'contact.tiktok' || 'tiktok' => 'TikTok',
      _ => raw,
    };
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

  // ── Image pickers ──

  Future<void> _pickAvatar() async {
    final picked = await ImagePicker().pickImage(
      source: ImageSource.gallery,
      maxWidth: 1024,
      imageQuality: 85,
    );
    if (picked == null) return;
    setState(() => _busy = true);
    try {
      await ref.read(userRepositoryProvider).uploadAvatar(picked.path);
      await ref.read(authControllerProvider.notifier).refreshUser();
      AppToast.success('Profile photo updated');
    } catch (e) {
      _error(e);
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  Future<void> _pickLogo() async {
    final picked = await ImagePicker().pickImage(
      source: ImageSource.gallery,
      maxWidth: 1024,
      imageQuality: 85,
    );
    if (picked != null) setState(() => _logoPath = picked.path);
  }

  Future<void> _pickGallery() async {
    final picked = await ImagePicker().pickMultiImage(
      maxWidth: 1600,
      imageQuality: 85,
    );
    if (picked.isNotEmpty) {
      setState(() => _galleryPaths.addAll(picked.map((x) => x.path)));
    }
  }

  Future<void> _removeExistingPhoto(String url, String clubId) async {
    try {
      await ref.read(clubRepositoryProvider).removeGallery(clubId, url);
      if (!mounted) return;
      setState(() => _existingGallery.remove(url));
      ref.invalidate(clubDetailProvider(clubId));
    } catch (e) {
      _error(e);
    }
  }

  // ── Save ──

  List<String> _servicesList() => _servicesCtrl.text
      .split(',')
      .map((s) => s.trim())
      .where((s) => s.isNotEmpty)
      .toList();

  Map<String, dynamic> _clubBody() => {
    'name': _clubNameCtrl.text.trim(),
    'sport': _servicesList().firstOrNull ?? '',
    'services': _servicesList(),
    'city': _cityCtrl.text.trim(),
    'address': _addressCtrl.text.trim(),
    'description': _descriptionCtrl.text.trim(),
    'gender': _gender,
    'ageMin': int.tryParse(_ageMinCtrl.text.trim()) ?? 0,
    'ageMax': int.tryParse(_ageMaxCtrl.text.trim()) ?? 100,
    'price': num.tryParse(_priceCtrl.text.trim()) ?? 0,
    'priceCurrency': _currency,
    'registrationLink': _registrationLinkCtrl.text.trim(),
    'contact': {
      'phone': _phoneCtrl.text.trim(),
      'email': _emailCtrl.text.trim(),
      'website': _websiteCtrl.text.trim(),
      'instagram': _instagramCtrl.text.trim(),
      'tiktok': _tiktokCtrl.text.trim(),
    },
  };

  Future<void> _save() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _busy = true);
    try {
      // Save user profile
      await ref
          .read(userRepositoryProvider)
          .updateProfile(name: _nameCtrl.text.trim());
      await ref.read(authControllerProvider.notifier).refreshUser();

      // Save club data (owner only)
      if (_isOwner) {
        final club = await ref.read(myClubProvider.future);
        if (club != null) {
          final repo = ref.read(clubRepositoryProvider);
          await repo.updateClub(club.id, _clubBody());

          if (_logoPath != null) {
            await repo.uploadLogo(club.id, _logoPath!);
          }
          if (_galleryPaths.isNotEmpty) {
            await repo.addGallery(club.id, _galleryPaths);
          }

          ref.invalidate(myClubsProvider);
          ref.invalidate(featuredClubsProvider);
          ref.invalidate(recentClubsProvider);
          ref.invalidate(searchControllerProvider);
        }
      }

      if (mounted) {
        AppToast.success('Profile updated');
        context.pop();
      }
    } catch (e) {
      _error(e);
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  // ── Build ──

  @override
  Widget build(BuildContext context) {
    final user = ref.watch(authControllerProvider).user;
    final isOwner = _isOwner;

    return Scaffold(
      appBar: AppBar(title: const Text('Edit profile')),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(AppSpacing.lg),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // ── Avatar ──
                Center(
                  child: Stack(
                    children: [
                      ClipRRect(
                        borderRadius: AppRadius.pillAll,
                        child: SizedBox(
                          width: 96,
                          height: 96,
                          child: CachedImage(
                            url: user?.avatarUrl,
                            placeholderIcon: Icons.person,
                          ),
                        ),
                      ),
                      Positioned(
                        right: 0,
                        bottom: 0,
                        child: CircleAvatar(
                          radius: 16,
                          child: IconButton(
                            iconSize: 16,
                            icon: const Icon(Icons.camera_alt),
                            onPressed: _busy ? null : _pickAvatar,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: AppSpacing.xl),

                // ── Name ──
                AppTextField(
                  label: 'Full name',
                  controller: _nameCtrl,
                  validator: Validators.name,
                ),

                // ── Club fields (owner only) ──
                if (isOwner) ...[
                  const SizedBox(height: AppSpacing.xl),
                  _buildClubSection(context),
                ],

                const SizedBox(height: AppSpacing.xl),
                AppButton(
                  label: 'Save changes',
                  isLoading: _busy,
                  onPressed: _busy ? null : _save,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildClubSection(BuildContext context) {
    final clubAsync = ref.watch(myClubProvider);

    return clubAsync.when(
      loading: () => const Center(
        child: Padding(
          padding: EdgeInsets.all(AppSpacing.xl),
          child: CircularProgressIndicator(),
        ),
      ),
      error: (_, _) => const EmptyState(
        icon: Icons.error_outline,
        title: 'Could not load club details',
      ),
      data: (club) {
        if (club == null) {
          return const EmptyState(
            icon: Icons.storefront_outlined,
            title: 'No club registered',
            message: 'Register your club first to edit club details here.',
          );
        }

        _initClubFields(club);

        return Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Club logo
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
                              errorBuilder: (_, _, _) =>
                                  const Icon(Icons.add_a_photo_outlined),
                            )
                          : (club.logo != null
                                ? CachedImage(url: club.logo)
                                : Column(
                                    mainAxisAlignment: MainAxisAlignment.center,
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

            // Basic details
            FormSection(
              title: 'Basic details',
              subtitle: 'Core information parents will see',
              icon: Icons.storefront_outlined,
              children: [
                AppTextField(
                  label: 'Club name',
                  controller: _clubNameCtrl,
                  maxLength: 120,
                  validator: (v) =>
                      Validators.required(v, field: 'the club name'),
                ),
                AppTextField(
                  label: 'Services offered (comma-separated)',
                  controller: _servicesCtrl,
                  hint: 'Coaching, Summer camp, Trials',
                  maxLength: 500,
                  validator: (v) =>
                      Validators.required(v, field: 'the services offered'),
                ),
                AppTextField(
                  label: 'City',
                  controller: _cityCtrl,
                  maxLength: 120,
                ),
                AppTextField(
                  label: 'Address',
                  controller: _addressCtrl,
                  maxLength: 300,
                ),
                AppTextField(
                  label: 'Description',
                  controller: _descriptionCtrl,
                  maxLines: 4,
                  minLines: 3,
                  maxLength: 4000,
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.lg),

            // Audience & pricing
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
                  onSelectionChanged: (s) => setState(() => _gender = s.first),
                ),
                Row(
                  children: [
                    Expanded(
                      child: AppTextField(
                        label: 'Min age',
                        controller: _ageMinCtrl,
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
                        controller: _ageMaxCtrl,
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
                        controller: _priceCtrl,
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

            // Contact & links
            FormSection(
              title: 'Contact & links',
              subtitle: 'How parents can reach you',
              icon: Icons.contact_phone_outlined,
              children: [
                AppTextField(
                  label: 'Phone',
                  controller: _phoneCtrl,
                  keyboardType: TextInputType.phone,
                  inputFormatters: [
                    FilteringTextInputFormatter.digitsOnly,
                    LengthLimitingTextInputFormatter(10),
                  ],
                  validator: Validators.phone,
                ),
                AppTextField(
                  label: 'Email',
                  controller: _emailCtrl,
                  keyboardType: TextInputType.emailAddress,
                  maxLength: 160,
                ),
                AppTextField(
                  label: 'Website',
                  controller: _websiteCtrl,
                  hint: 'https://…',
                  maxLength: 300,
                ),
                AppTextField(
                  label: 'Instagram',
                  controller: _instagramCtrl,
                  maxLength: 300,
                ),
                AppTextField(
                  label: 'TikTok',
                  controller: _tiktokCtrl,
                  maxLength: 300,
                ),
                AppTextField(
                  label: 'Registration link',
                  controller: _registrationLinkCtrl,
                  hint: 'https://…',
                  maxLength: 300,
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.lg),

            // Photos
            FormSection(
              title: 'Photos',
              subtitle: 'Showcase your club — shown in the gallery',
              icon: Icons.photo_library_outlined,
              children: [
                _GalleryEditor(
                  existing: _existingGallery,
                  staged: _galleryPaths,
                  onAdd: _busy ? null : _pickGallery,
                  onRemoveExisting: _busy
                      ? null
                      : (url) => _removeExistingPhoto(url, club.id),
                  onRemoveStaged: (path) =>
                      setState(() => _galleryPaths.remove(path)),
                ),
              ],
            ),
          ],
        );
      },
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Gallery editor widgets (copied from club_form_screen to keep self-contained)
// ─────────────────────────────────────────────────────────────────────────────

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
                Icon(
                  Icons.add_a_photo_outlined,
                  size: 22,
                  color: AppColors.textTertiary,
                ),
                const SizedBox(height: 4),
                Text(
                  'Add',
                  style: Theme.of(context).textTheme.labelSmall?.copyWith(
                    color: AppColors.textTertiary,
                  ),
                ),
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
