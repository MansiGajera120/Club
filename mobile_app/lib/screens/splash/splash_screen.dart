import 'dart:math' as math;
import 'dart:ui';

import 'package:flutter/material.dart';

import '../../config/app_config.dart';
import '../../theme/app_colors.dart';
import '../../theme/app_fonts.dart';
import '../../theme/app_gradients.dart';
import '../../theme/app_radius.dart';
import '../../theme/app_typography.dart';

/// Branded splash — a warm "Sunrise Bloom" composition: a soft peach-to-cream
/// wash, drifting ambient glows, a glowing coral emblem framed by pulsing halo
/// rings, and an animated wordmark. Fully themed (no photo) so it always
/// matches the app.
class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen>
    with TickerProviderStateMixin {
  // Continuous, slow pulse driving the halo rings and glow.
  late final AnimationController _pulse = AnimationController(
    vsync: this,
    duration: const Duration(milliseconds: 2600),
  )..repeat();

  // One-shot entrance for the emblem and wordmark.
  late final AnimationController _enter = AnimationController(
    vsync: this,
    duration: const Duration(milliseconds: 1300),
  )..forward();

  late final Animation<double> _emblemIn = CurvedAnimation(
    parent: _enter,
    curve: const Interval(0.0, 0.7, curve: Curves.easeOutBack),
  );
  late final Animation<double> _textIn = CurvedAnimation(
    parent: _enter,
    curve: const Interval(0.35, 1.0, curve: Curves.easeOut),
  );

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
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [
              Color(0xFFEAF1FC), // cool sky tint
              AppColors.background,
              Color(0xFFF1F6FD),
            ],
            stops: [0.0, 0.55, 1.0],
          ),
        ),
        child: Stack(
          fit: StackFit.expand,
          children: [
            // Drifting ambient brand glows.
            const _AmbientGlow(
              alignment: Alignment(1.15, -0.85),
              color: AppColors.primary,
              size: 340,
              opacity: 0.24,
            ),
            const _AmbientGlow(
              alignment: Alignment(-1.05, 0.75),
              color: AppColors.accent,
              size: 320,
              opacity: 0.20,
            ),
            const _AmbientGlow(
              alignment: Alignment(-0.7, -1.0),
              color: AppColors.secondary,
              size: 220,
              opacity: 0.16,
            ),

            // Emblem with pulsing halo rings.
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
                        builder: (context, child) {
                          return SizedBox(
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
                          );
                        },
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
                              color: AppColors.textPrimary,
                              fontWeight: FontWeight.w800,
                              letterSpacing: 0.5,
                            ),
                          ),
                          const SizedBox(height: 12),
                          Container(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 14, vertical: 6),
                            decoration: BoxDecoration(
                              gradient: LinearGradient(
                                colors: [
                                  AppColors.primary.withValues(alpha: 0.10),
                                  AppColors.accent.withValues(alpha: 0.10),
                                ],
                              ),
                              borderRadius: AppRadius.pillAll,
                              border: Border.all(
                                color: AppColors.primary.withValues(alpha: 0.16),
                              ),
                            ),
                            child: Text(
                              'SPORTS CLUBS, SIMPLIFIED',
                              style: AppFonts.body(AppTypography.overline)
                                  .copyWith(
                                color: AppColors.primaryDark,
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
                        AppColors.primary.withValues(alpha: 0.7),
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
    final opacity = (1.0 - phase) * 0.5;
    return Transform.scale(
      scale: scale,
      child: Container(
        width: 200,
        height: 200,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          border: Border.all(
            color: AppColors.primary.withValues(alpha: opacity),
            width: 2,
          ),
        ),
      ),
    );
  }
}

/// The central coral emblem — a gradient disc with a glossy sheen, soft glow
/// and the sport glyph.
class _LogoBadge extends StatelessWidget {
  const _LogoBadge();

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 122,
      height: 122,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        gradient: AppGradients.brand,
        boxShadow: [
          BoxShadow(
            color: AppColors.primary.withValues(alpha: 0.50),
            blurRadius: 48,
            spreadRadius: 4,
            offset: const Offset(0, 16),
          ),
        ],
      ),
      child: Stack(
        alignment: Alignment.center,
        children: [
          // Glossy top-left sheen.
          const DecoratedBox(
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              gradient: AppGradients.cardSheen,
            ),
          ),
          Transform.rotate(
            angle: -math.pi / 16,
            child: const Icon(
              Icons.sports_soccer_rounded,
              size: 62,
              color: Colors.white,
            ),
          ),
        ],
      ),
    );
  }
}

/// A large, softly-blurred radial brand blob used as ambient background decor.
class _AmbientGlow extends StatelessWidget {
  final Alignment alignment;
  final Color color;
  final double size;
  final double opacity;

  const _AmbientGlow({
    required this.alignment,
    required this.color,
    required this.size,
    required this.opacity,
  });

  @override
  Widget build(BuildContext context) {
    return Align(
      alignment: alignment,
      child: ImageFiltered(
        imageFilter: ImageFilter.blur(sigmaX: 90, sigmaY: 90),
        child: Container(
          width: size,
          height: size,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: color.withValues(alpha: opacity),
          ),
        ),
      ),
    );
  }
}
