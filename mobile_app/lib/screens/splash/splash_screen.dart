import 'package:flutter/material.dart';

import '../../config/app_config.dart';
import '../../theme/app_colors.dart';
import '../../theme/app_fonts.dart';
import '../../theme/app_gradients.dart';
import '../../theme/app_radius.dart';
import '../../theme/app_typography.dart';
import '../../widgets/doodle_backdrop.dart';

/// Branded splash — a full-bleed brand gradient scattered with the app's own
/// hand-drawn marks, a white emblem carrying the drawn ball, and the wordmark.
///
/// Everything is painted in code, so the first frame owes nothing to an image
/// decode and the composition adapts to any screen. It deliberately opens on the
/// same saturated gradient and marks the auth flow lands on, so the app
/// introduces itself with the face it keeps.
class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen>
    with TickerProviderStateMixin {
  // Continuous, slow pulse driving the halo rings.
  late final AnimationController _pulse = AnimationController(
    vsync: this,
    duration: const Duration(milliseconds: 2600),
  );

  // One-shot entrance for the emblem and wordmark.
  late final AnimationController _enter = AnimationController(
    vsync: this,
    duration: const Duration(milliseconds: 1300),
  );

  late final Animation<double> _emblemIn = CurvedAnimation(
    parent: _enter,
    curve: const Interval(0.0, 0.7, curve: Curves.easeOutBack),
  );
  late final Animation<double> _textIn = CurvedAnimation(
    parent: _enter,
    curve: const Interval(0.35, 1.0, curve: Curves.easeOut),
  );

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    // Reduced motion still gets the composition, just without the ripple: the
    // entrance jumps to its end state and the halo holds still.
    final reduceMotion = MediaQuery.maybeDisableAnimationsOf(context) ?? false;
    if (reduceMotion) {
      _pulse.stop();
      _enter.value = 1;
    } else {
      if (!_pulse.isAnimating) _pulse.repeat();
      if (!_enter.isAnimating && _enter.value == 0) _enter.forward();
    }
  }

  @override
  void dispose() {
    _pulse.dispose();
    _enter.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: DecoratedBox(
        decoration: const BoxDecoration(gradient: AppGradients.brand),
        child: Stack(
          fit: StackFit.expand,
          children: [
            // The full cast of marks, ringing the emblem.
            const AnimatedDoodleField(spots: kSplashSpots, color: Colors.white),

            Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  ScaleTransition(
                    scale: Tween(begin: 0.6, end: 1.0).animate(_emblemIn),
                    child: FadeTransition(
                      opacity: _emblemIn,
                      child: AnimatedBuilder(
                        animation: _pulse,
                        builder: (context, child) => SizedBox(
                          width: 220,
                          height: 220,
                          child: Stack(
                            alignment: Alignment.center,
                            children: [
                              _HaloRing(t: _pulse.value, delay: 0.0),
                              _HaloRing(t: _pulse.value, delay: 0.5),
                              child!,
                            ],
                          ),
                        ),
                        child: const _LogoBadge(),
                      ),
                    ),
                  ),
                  const SizedBox(height: 34),
                  FadeTransition(
                    opacity: _textIn,
                    child: SlideTransition(
                      position: Tween(
                        begin: const Offset(0, 0.35),
                        end: Offset.zero,
                      ).animate(_textIn),
                      child: Column(
                        children: [
                          Text(
                            AppConfig.appName,
                            style: AppFonts.display(AppTypography.displayLg)
                                .copyWith(
                                  color: Colors.white,
                                  fontWeight: FontWeight.w800,
                                  letterSpacing: 0.5,
                                ),
                          ),
                          const SizedBox(height: 12),
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 14,
                              vertical: 6,
                            ),
                            decoration: BoxDecoration(
                              color: Colors.white.withValues(alpha: 0.16),
                              borderRadius: AppRadius.pillAll,
                              border: Border.all(
                                color: Colors.white.withValues(alpha: 0.45),
                              ),
                            ),
                            child: Text(
                              'SPORTS CLUBS, SIMPLIFIED',
                              style: AppFonts.body(AppTypography.overline)
                                  .copyWith(
                                    color: Colors.white,
                                    letterSpacing: 2.2,
                                  ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),

            // Understated loader near the bottom.
            Positioned(
              bottom: 76,
              left: 0,
              right: 0,
              child: FadeTransition(
                opacity: _textIn,
                child: Center(
                  child: SizedBox(
                    width: 26,
                    height: 26,
                    child: CircularProgressIndicator(
                      strokeWidth: 2.5,
                      valueColor: AlwaysStoppedAnimation(
                        Colors.white.withValues(alpha: 0.85),
                      ),
                    ),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

/// A single expanding, fading ring. [t] is the shared pulse phase (0..1);
/// [delay] offsets this ring so two rings ripple outward in sequence.
class _HaloRing extends StatelessWidget {
  final double t;
  final double delay;
  const _HaloRing({required this.t, required this.delay});

  @override
  Widget build(BuildContext context) {
    final phase = (t + delay) % 1.0;
    final scale = 0.62 + (0.38 * phase);
    final opacity = (1.0 - phase) * 0.45;
    return Transform.scale(
      scale: scale,
      child: Container(
        width: 200,
        height: 200,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          border: Border.all(
            color: Colors.white.withValues(alpha: opacity),
            width: 2,
          ),
        ),
      ),
    );
  }
}

/// The central emblem — a white disc carrying the app's drawn ball.
///
/// White on the gradient rather than a gradient disc on cream: it inverts the
/// band, and the mark inside is the same [Doodle.ball] the wallpaper is drawn
/// with instead of a Material icon.
class _LogoBadge extends StatelessWidget {
  const _LogoBadge();

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 122,
      height: 122,
      alignment: Alignment.center,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        color: Colors.white,
        boxShadow: [
          BoxShadow(
            color: AppColors.shadow.withValues(alpha: 0.28),
            blurRadius: 40,
            spreadRadius: 2,
            offset: const Offset(0, 14),
          ),
        ],
      ),
      child: const DoodleMark(
        doodle: Doodle.ball,
        size: 68,
        color: AppColors.primary,
        weight: 0.06,
      ),
    );
  }
}
