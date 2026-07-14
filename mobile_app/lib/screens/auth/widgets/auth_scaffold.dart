import 'package:flutter/material.dart';

import '../../../theme/app_colors.dart';
import '../../../theme/app_spacing.dart';

/// Shared auth flow layout — background artwork, ambient glows, and premium form.
class AuthScaffold extends StatelessWidget {
  final String title;
  final String subtitle;
  final Widget child;
  final Widget? footer;
  final VoidCallback? onBack;

  const AuthScaffold({
    super.key,
    required this.title,
    required this.subtitle,
    required this.child,
    this.footer,
    this.onBack,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final size = MediaQuery.of(context).size;

    return Scaffold(
      backgroundColor: AppColors.background,
      extendBodyBehindAppBar: true,
      body: CustomScrollView(
        physics: const BouncingScrollPhysics(),
        slivers: [
          SliverAppBar(
            expandedHeight: size.height * 0.32,
            toolbarHeight: 80.0, // keeps a slither of the image visible when fully scrolled up
            pinned: true,
            stretch: true,
            backgroundColor: AppColors.background,
            elevation: 0,
            leading: onBack != null
                ? IconButton(
                    icon: Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        shape: BoxShape.circle,
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withValues(alpha: 0.1),
                            blurRadius: 10,
                          ),
                        ],
                      ),
                      child: const Icon(Icons.arrow_back_rounded, color: Colors.black, size: 20),
                    ),
                    onPressed: onBack,
                  )
                : null,
            bottom: PreferredSize(
              preferredSize: const Size.fromHeight(32.0),
              child: Container(
                height: 32.0,
                decoration: BoxDecoration(
                  color: AppColors.background,
                  borderRadius: const BorderRadius.only(
                    topLeft: Radius.circular(32),
                    topRight: Radius.circular(32),
                  ),
                ),
              ),
            ),
            flexibleSpace: FlexibleSpaceBar(
              collapseMode: CollapseMode.parallax,
              stretchModes: const [StretchMode.zoomBackground],
              background: Stack(
                fit: StackFit.expand,
                children: [
                  Image.asset(
                    'assets/images/auth_header.png',
                    fit: BoxFit.cover,
                    alignment: Alignment.topCenter,
                  ),
                  // 2. Soft fade mask blending into the solid background
                  Positioned(
                    bottom: -2,
                    left: 0,
                    right: 0,
                    height: size.height * 0.15, // Blend the bottom 15% of the image
                    child: Container(
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          begin: Alignment.topCenter,
                          end: Alignment.bottomCenter,
                          colors: [
                            AppColors.background.withValues(alpha: 0.0),
                            AppColors.background,
                            AppColors.background,
                          ],
                          stops: const [0.0, 0.6, 1.0], // Pushes pure white higher to hide resting curve
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
          SliverToBoxAdapter(
            child: Container(
              color: AppColors.background,
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: AppSpacing.xl),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    const SizedBox(height: AppSpacing.md),
                  // Title and Subtitle seamlessly floating
                  Text(
                    title,
                    textAlign: TextAlign.left,
                    style: theme.textTheme.headlineMedium?.copyWith(
                      fontWeight: FontWeight.w900,
                      letterSpacing: -0.5,
                      fontSize: 32,
                      color: AppColors.textPrimary,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    subtitle,
                    textAlign: TextAlign.left,
                    style: theme.textTheme.titleMedium?.copyWith(
                      color: AppColors.textSecondary,
                      height: 1.4,
                    ),
                  ),
                  const SizedBox(height: AppSpacing.xxxl),

                  // Content fields right on the background
                  child,

                  if (footer != null) ...[
                    const SizedBox(height: AppSpacing.xl),
                    footer!,
                  ],
                  const SizedBox(height: AppSpacing.xxxl),
                ],
              ),
            ),
          ),
        ),
      ],
      ),
    );
  }
}

/// Role picker for signup — parent vs club owner.
class AuthRolePicker extends StatelessWidget {
  final String selected;
  final ValueChanged<String> onChanged;

  const AuthRolePicker({
    super.key,
    required this.selected,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    return SegmentedButton<String>(
      segments: const [
        ButtonSegment(
          value: 'parent',
          label: Text('User'),
          icon: Icon(Icons.person_outline_rounded, size: 18),
        ),
        ButtonSegment(
          value: 'club_owner',
          label: Text('Club owner'),
          icon: Icon(Icons.storefront_outlined, size: 18),
        ),
      ],
      selected: {selected},
      onSelectionChanged: (s) => onChanged(s.first),
    );
  }
}
