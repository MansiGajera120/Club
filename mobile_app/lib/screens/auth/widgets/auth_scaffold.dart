import 'package:flutter/material.dart';

import '../../../theme/app_colors.dart';
import '../../../theme/app_gradients.dart';
import '../../../theme/app_radius.dart';
import '../../../theme/app_shadows.dart';
import '../../../theme/app_spacing.dart';
import '../../../widgets/doodle_backdrop.dart';

/// Shared auth layout — a hand-drawn sketchbook page with the form floating on
/// top as a sticker-tagged card.
///
/// Everything decorative is painted in code (see `doodle_backdrop.dart`), so the
/// flow carries no image assets and adapts to any screen size.
class AuthScaffold extends StatelessWidget {
  final String title;

  /// Trailing words of the headline, drawn over a hand-marker swipe. Kept
  /// separate from [title] because the highlight has to be sized to the words it
  /// sits under, which means painting behind its own text box.
  final String? titleAccent;
  final String subtitle;
  final Widget child;
  final Widget? footer;
  final VoidCallback? onBack;

  /// Emoji on the sticker pinned to the card's top corner — a per-screen cue
  /// (👋 sign in, ✨ sign up, 🔑 reset) that gives each step its own face.
  final String sticker;

  const AuthScaffold({
    super.key,
    required this.title,
    this.titleAccent,
    required this.subtitle,
    required this.child,
    this.footer,
    this.onBack,
    this.sticker = '👋',
  });

  /// How far the card rides up into the band. Also the height the layout gets
  /// back at the bottom, since Transform doesn't shrink the space it occupies.
  static const double _overlap = 34;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      backgroundColor: AppColors.background,
      resizeToAvoidBottomInset: true,
      body: Stack(
        children: [
          // Ink marks on the page itself, filling the space the band doesn't.
          const Positioned.fill(
            child: AnimatedDoodleField(
              spots: kPageSpots,
              color: AppColors.textPrimary,
            ),
          ),
          SingleChildScrollView(
            // Clamping, and deliberately not AlwaysScrollable: short steps like
            // sign-in and the account-type picker then sit perfectly still
            // instead of rubber-banding against a scroll that has nowhere to go.
            // Taller steps still scroll, just without the bounce.
            physics: const ClampingScrollPhysics(),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                _HeroBand(
                  title: title,
                  accent: titleAccent,
                  subtitle: subtitle,
                  onBack: onBack,
                ),
                Transform.translate(
                  offset: const Offset(0, -_overlap),
                  child: Padding(
                    padding: const EdgeInsets.symmetric(
                      horizontal: AppSpacing.xl,
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        _FormCard(sticker: sticker, child: child),
                        if (footer != null) ...[
                          const SizedBox(height: AppSpacing.xl),
                          DefaultTextStyle.merge(
                            style:
                                theme.textTheme.bodyMedium ?? const TextStyle(),
                            child: footer!,
                          ),
                        ],
                      ],
                    ),
                  ),
                ),
                // Bottom breathing room, less the space the overlap gave back.
                const SizedBox(height: AppSpacing.xxxl - _overlap),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

/// The saturated brand panel at the top: doodles in white, headline over them,
/// torn bottom edge. This is the flow's focal point — everything below it is
/// deliberately calm by comparison.
class _HeroBand extends StatelessWidget {
  final String title;
  final String? accent;
  final String subtitle;
  final VoidCallback? onBack;

  const _HeroBand({
    required this.title,
    required this.accent,
    required this.subtitle,
    required this.onBack,
  });

  @override
  Widget build(BuildContext context) {
    final topInset = MediaQuery.paddingOf(context).top;

    return ClipPath(
      clipper: const TornEdgeClipper(),
      child: Container(
        decoration: const BoxDecoration(gradient: AppGradients.brand),
        // Sized by its content, plus room for the torn edge and the card's
        // overlap to land on empty gradient rather than on the subtitle.
        padding: EdgeInsets.fromLTRB(
          AppSpacing.xl,
          topInset + AppSpacing.md,
          AppSpacing.xl,
          AppSpacing.xxxl + AppSpacing.xl,
        ),
        child: Stack(
          children: [
            const Positioned.fill(
              child: AnimatedDoodleField(
                spots: kBandSpots,
                color: Colors.white,
              ),
            ),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                _TopBar(onBack: onBack),
                const SizedBox(height: AppSpacing.xxl),
                _Headline(title: title, accent: accent, subtitle: subtitle),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

/// The band's top row: just the back sticker.
///
/// The [SizedBox] holds the row's height open on steps with no back action, so
/// the headline below starts at the same place on every screen in the flow.
class _TopBar extends StatelessWidget {
  final VoidCallback? onBack;

  const _TopBar({this.onBack});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        if (onBack != null)
          _StickerButton(onTap: onBack!)
        else
          const SizedBox(height: 44),
      ],
    );
  }
}

/// Rounded-square back control, tilted like a sticker pressed on by hand.
///
/// Solid white with a brand-blue arrow: a frosted chip washed out against the
/// gradient, and the back affordance is not the place to be subtle.
class _StickerButton extends StatelessWidget {
  final VoidCallback onTap;

  const _StickerButton({required this.onTap});

  @override
  Widget build(BuildContext context) {
    return Transform.rotate(
      angle: -0.06,
      child: Material(
        color: Colors.white,
        borderRadius: AppRadius.mdAll,
        child: InkWell(
          onTap: onTap,
          borderRadius: AppRadius.mdAll,
          child: Ink(
            width: 44,
            height: 44,
            decoration: BoxDecoration(
              borderRadius: AppRadius.mdAll,
              boxShadow: [
                BoxShadow(
                  color: AppColors.shadow.withValues(alpha: 0.18),
                  blurRadius: 12,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: const Center(
              child: DoodleMark(
                doodle: Doodle.arrowLeft,
                size: 22,
                color: AppColors.primary,
                weight: 0.13,
              ),
            ),
          ),
        ),
      ),
    );
  }
}

/// Oversized headline with the accent words riding a marker swipe, then the
/// subtitle. Both fade up on entry so the page assembles rather than snaps in.
class _Headline extends StatelessWidget {
  final String title;
  final String? accent;
  final String subtitle;

  const _Headline({
    required this.title,
    required this.accent,
    required this.subtitle,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final titleStyle =
        theme.textTheme.displaySmall?.copyWith(
          fontSize: 38,
          height: 1.1,
          fontWeight: FontWeight.w800,
          letterSpacing: -1.2,
          color: Colors.white,
        ) ??
        const TextStyle(
          fontSize: 38,
          fontWeight: FontWeight.w800,
          color: Colors.white,
        );

    return _FadeUp(
      delay: Duration.zero,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Wrap (not RichText) so the highlight can be painted behind just the
          // accent words — a span has no box of its own to paint against.
          Wrap(
            crossAxisAlignment: WrapCrossAlignment.center,
            children: [
              Text(title, style: titleStyle),
              if (accent != null) ...[
                Text(' ', style: titleStyle),
                MarkerHighlight(
                  // Warm swipe against the cool band — the one place on the
                  // screen where the palette breaks, so the eye lands here.
                  color: AppColors.warning,
                  // Ink, not white: white on amber is roughly 2:1 contrast and
                  // the word goes mushy. Dark ink on amber is ~8:1 and reads
                  // like it was meant to be highlighted.
                  child: Text(
                    accent!,
                    style: titleStyle.copyWith(color: AppColors.textPrimary),
                  ),
                ),
              ],
            ],
          ),
          const SizedBox(height: AppSpacing.md),
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Short rule — a drawn tick that ties the copy to the doodles.
              Container(
                margin: const EdgeInsets.only(top: 8, right: AppSpacing.md),
                width: 22,
                height: 3,
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.7),
                  borderRadius: AppRadius.pillAll,
                ),
              ),
              Expanded(
                child: Text(
                  subtitle,
                  style: theme.textTheme.titleMedium?.copyWith(
                    color: Colors.white.withValues(alpha: 0.94),
                    height: 1.45,
                    fontSize: 15,
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

/// The white card the form lives on, with a tilted emoji sticker overhanging the
/// top-right corner.
class _FormCard extends StatelessWidget {
  final String sticker;
  final Widget child;

  const _FormCard({required this.sticker, required this.child});

  @override
  Widget build(BuildContext context) {
    return _FadeUp(
      delay: const Duration(milliseconds: 90),
      child: Stack(
        clipBehavior: Clip.none,
        children: [
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(AppSpacing.xl),
            decoration: BoxDecoration(
              color: AppColors.card,
              borderRadius: BorderRadius.circular(28),
              border: Border.all(color: AppColors.border, width: 1.5),
              boxShadow: AppShadows.lg,
            ),
            child: child,
          ),
          // Tape strips pinning the card to the band it overlaps — the detail
          // that sells "stuck down by hand" rather than "floating div".
          const Positioned(top: -9, left: 26, child: _Tape(angle: -0.14)),
          const Positioned(top: -11, right: 78, child: _Tape(angle: 0.11)),
          Positioned(top: -24, right: -8, child: _EmojiSticker(emoji: sticker)),
        ],
      ),
    );
  }
}

/// A strip of washi tape: translucent, soft-edged, slightly askew.
class _Tape extends StatelessWidget {
  final double angle;

  const _Tape({required this.angle});

  @override
  Widget build(BuildContext context) {
    return Transform.rotate(
      angle: angle,
      child: Container(
        width: 58,
        height: 20,
        decoration: BoxDecoration(
          // Milky rather than tinted, so it reads as tape over both the band
          // above and the card below.
          color: Colors.white.withValues(alpha: 0.55),
          borderRadius: BorderRadius.circular(2),
          border: Border.all(
            color: Colors.white.withValues(alpha: 0.65),
            width: 1,
          ),
          boxShadow: [
            BoxShadow(
              color: AppColors.shadow.withValues(alpha: 0.10),
              blurRadius: 4,
              offset: const Offset(0, 1),
            ),
          ],
        ),
      ),
    );
  }
}

class _EmojiSticker extends StatelessWidget {
  final String emoji;

  const _EmojiSticker({required this.emoji});

  @override
  Widget build(BuildContext context) {
    return Transform.rotate(
      angle: 0.18,
      child: Container(
        width: 62,
        height: 62,
        alignment: Alignment.center,
        decoration: BoxDecoration(
          color: AppColors.card,
          shape: BoxShape.circle,
          border: Border.all(color: AppColors.background, width: 3),
          boxShadow: AppShadows.md,
        ),
        // The emoji is the sticker's whole point — at 20pt it was lost in its
        // own badge. The disc grew with it to keep the ring proportional.
        child: Text(emoji, style: const TextStyle(fontSize: 30)),
      ),
    );
  }
}

/// Entry animation: a short fade paired with a small upward slide.
class _FadeUp extends StatelessWidget {
  final Widget child;
  final Duration delay;

  const _FadeUp({required this.child, required this.delay});

  @override
  Widget build(BuildContext context) {
    return TweenAnimationBuilder<double>(
      tween: Tween(begin: 0, end: 1),
      duration: const Duration(milliseconds: 520) + delay,
      curve: Interval(
        delay.inMilliseconds / (520 + delay.inMilliseconds),
        1,
        curve: Curves.easeOutCubic,
      ),
      builder: (context, value, child) => Opacity(
        opacity: value.clamp(0, 1),
        child: Transform.translate(
          offset: Offset(0, (1 - value) * 18),
          child: child,
        ),
      ),
      child: child,
    );
  }
}

/// Full-width role card for the signup role step: emoji tile, name, and a line
/// explaining the choice.
///
/// Selection is carried by border weight, a tinted emoji tile, and a check
/// badge — three cues, never colour alone.
class AuthRoleCard extends StatelessWidget {
  final String emoji;
  final String title;
  final String description;
  final bool selected;
  final VoidCallback onTap;

  const AuthRoleCard({
    super.key,
    required this.emoji,
    required this.title,
    required this.description,
    required this.selected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return AnimatedContainer(
      duration: const Duration(milliseconds: 200),
      curve: Curves.easeOut,
      decoration: BoxDecoration(
        // Stays white when picked. The old tinted fill plus brand glow made the
        // chosen card look like a warning banner; selection should feel like a
        // clean check, not an alarm.
        color: AppColors.card,
        borderRadius: BorderRadius.circular(22),
        border: Border.all(
          color: selected ? AppColors.primary : AppColors.border,
          width: selected ? 2 : 1.5,
        ),
        boxShadow: selected
            ? [
                BoxShadow(
                  color: AppColors.primary.withValues(alpha: 0.13),
                  blurRadius: 18,
                  offset: const Offset(0, 6),
                ),
              ]
            : AppShadows.sm,
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(22),
          child: Padding(
            padding: const EdgeInsets.all(AppSpacing.lg),
            child: Row(
              children: [
                // Emoji tile — the only element that takes brand colour when
                // picked, which is enough to carry the state without shouting.
                AnimatedContainer(
                  duration: const Duration(milliseconds: 200),
                  curve: Curves.easeOut,
                  width: 52,
                  height: 52,
                  alignment: Alignment.center,
                  decoration: BoxDecoration(
                    color: selected
                        ? AppColors.primary.withValues(alpha: 0.10)
                        : AppColors.surfaceMuted,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(
                      color: selected
                          ? AppColors.primary.withValues(alpha: 0.35)
                          : AppColors.border,
                      width: 1.5,
                    ),
                  ),
                  child: Text(emoji, style: const TextStyle(fontSize: 24)),
                ),
                const SizedBox(width: AppSpacing.lg),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        title,
                        style: theme.textTheme.titleMedium?.copyWith(
                          fontWeight: FontWeight.w800,
                          fontSize: 15,
                          letterSpacing: -0.2,
                          color: selected
                              ? AppColors.primary
                              : AppColors.textPrimary,
                        ),
                      ),
                      const SizedBox(height: 3),
                      Text(
                        description,
                        style: theme.textTheme.bodySmall?.copyWith(
                          color: AppColors.textSecondary,
                          fontSize: 12,
                          height: 1.35,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: AppSpacing.sm),
                AnimatedScale(
                  duration: const Duration(milliseconds: 220),
                  curve: Curves.easeOutBack,
                  scale: selected ? 1 : 0,
                  child: Container(
                    width: 24,
                    height: 24,
                    decoration: const BoxDecoration(
                      color: AppColors.primary,
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(
                      Icons.check_rounded,
                      size: 15,
                      color: Colors.white,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

/// Progress dots for the multi-step flows — the current step stretches into a
/// pill so the position is legible without counting.
class AuthStepDots extends StatelessWidget {
  final int count;
  final int index;

  const AuthStepDots({super.key, required this.count, required this.index});

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: List.generate(count, (i) {
        final active = i == index;
        return AnimatedContainer(
          duration: const Duration(milliseconds: 260),
          curve: Curves.easeOut,
          margin: const EdgeInsets.symmetric(horizontal: 3),
          width: active ? 22 : 7,
          height: 7,
          decoration: BoxDecoration(
            color: active
                ? AppColors.primary
                : (i < index
                      ? AppColors.primary.withValues(alpha: 0.35)
                      : AppColors.borderStrong),
            borderRadius: AppRadius.pillAll,
          ),
        );
      }),
    );
  }
}

/// Text link styled as a hand-underlined word — used for the "Sign in" /
/// "Create account" pivots between screens.
class AuthLink extends StatelessWidget {
  final String leading;
  final String label;
  final VoidCallback onTap;

  const AuthLink({
    super.key,
    required this.leading,
    required this.label,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    // Wrap, not Row: at large text scales the prompt and the link need to be
    // free to fall onto separate lines rather than overflow.
    return Wrap(
      alignment: WrapAlignment.center,
      crossAxisAlignment: WrapCrossAlignment.center,
      spacing: 6,
      children: [
        Text(
          leading,
          style: theme.textTheme.bodyMedium?.copyWith(
            color: AppColors.textSecondary,
          ),
        ),
        InkWell(
          onTap: onTap,
          borderRadius: AppRadius.smAll,
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 2),
            child: CustomPaint(
              painter: _UnderlinePainter(AppColors.primary),
              child: Text(
                label,
                style: theme.textTheme.bodyMedium?.copyWith(
                  color: AppColors.primary,
                  fontWeight: FontWeight.w800,
                ),
              ),
            ),
          ),
        ),
      ],
    );
  }
}

/// A single wobbling pen stroke under a link — drawn, not a border.
class _UnderlinePainter extends CustomPainter {
  final Color color;

  _UnderlinePainter(this.color);

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = color.withValues(alpha: 0.55)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2
      ..strokeCap = StrokeCap.round;

    final y = size.height - 1;
    final path = Path()..moveTo(0, y);
    // Two shallow humps give the line its drawn-by-hand waver.
    path.quadraticBezierTo(
      size.width * 0.25,
      y - 2.2,
      size.width * 0.5,
      y - 0.4,
    );
    path.quadraticBezierTo(size.width * 0.75, y + 1.6, size.width, y - 1.2);
    canvas.drawPath(path, paint);
  }

  @override
  bool shouldRepaint(_UnderlinePainter old) => old.color != color;
}
