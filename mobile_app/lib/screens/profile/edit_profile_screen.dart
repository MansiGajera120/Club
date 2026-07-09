import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';

import '../../core/error/exceptions.dart';
import '../../providers/auth_provider.dart';
import '../../providers/owner_providers.dart';
import '../../theme/app_radius.dart';
import '../../theme/app_spacing.dart';
import '../../utils/validators.dart';
import '../../widgets/widgets.dart';

/// Edit the current user's profile (name + avatar).
class EditProfileScreen extends ConsumerStatefulWidget {
  const EditProfileScreen({super.key});

  @override
  ConsumerState<EditProfileScreen> createState() => _EditProfileScreenState();
}

class _EditProfileScreenState extends ConsumerState<EditProfileScreen> {
  final _formKey = GlobalKey<FormState>();
  late final TextEditingController _nameCtrl = TextEditingController(
    text: ref.read(authControllerProvider).user?.name ?? '',
  );
  bool _busy = false;

  @override
  void dispose() {
    _nameCtrl.dispose();
    super.dispose();
  }

  void _error(Object e) {
    final message = e is AppException ? e.message : 'Something went wrong';
    if (mounted) {
      ScaffoldMessenger.of(context)
        ..clearSnackBars()
        ..showSnackBar(SnackBar(content: Text(message)));
    }
  }

  Future<void> _pickAvatar() async {
    final picked = await ImagePicker()
        .pickImage(source: ImageSource.gallery, maxWidth: 1024, imageQuality: 85);
    if (picked == null) return;
    setState(() => _busy = true);
    try {
      await ref.read(userRepositoryProvider).uploadAvatar(picked.path);
      await ref.read(authControllerProvider.notifier).refreshUser();
    } catch (e) {
      _error(e);
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  Future<void> _save() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _busy = true);
    try {
      await ref
          .read(userRepositoryProvider)
          .updateProfile(name: _nameCtrl.text.trim());
      await ref.read(authControllerProvider.notifier).refreshUser();
      if (mounted) context.pop();
    } catch (e) {
      _error(e);
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final user = ref.watch(authControllerProvider).user;
    return Scaffold(
      appBar: AppBar(title: const Text('Edit profile')),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(AppSpacing.xl),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
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
                AppTextField(
                  label: 'Full name',
                  controller: _nameCtrl,
                  validator: Validators.name,
                ),
                const SizedBox(height: AppSpacing.xl),
                AppButton(label: 'Save changes', isLoading: _busy, onPressed: _save),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
