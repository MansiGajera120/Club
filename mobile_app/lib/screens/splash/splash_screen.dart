import 'package:flutter/material.dart';

import '../../config/app_config.dart';
import '../../theme/app_colors.dart';
import '../../theme/app_fonts.dart';
import '../../theme/app_gradients.dart';
import '../../theme/app_radius.dart';
import '../../theme/app_shadows.dart';
import '../../theme/app_typography.dart';

/// Branded splash screen — bright warm cream with coral branding.
class SplashScreen extends StatelessWidget {
  const SplashScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: TweenAnimationBuilder<double>(
        tween: Tween(begin: 0.0, end: 1.0),
        duration: const Duration(milliseconds: 2500),
        curve: Curves.easeOutExpo,
        builder: (context, value, child) {
          return Stack(
            fit: StackFit.expand,
            children: [
              // Beautiful aesthetic background image
              Image.asset(
                'assets/images/splash_bg.png',
                fit: BoxFit.cover,
                alignment: Alignment.center,
              ),
              
              // Dark gradient overlay for extreme cinematic contrast
              Container(
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topCenter,
                    end: Alignment.bottomCenter,
                    colors: [
                      Colors.black.withValues(alpha: 0.3),
                      Colors.black.withValues(alpha: 0.8),
                    ],
                  ),
                ),
              ),
              
              // Centered dynamic logo sequence
              Center(
                child: Transform.scale(
                  scale: 0.90 + (0.10 * value),
                  child: Opacity(
                    opacity: value,
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Container(
                          width: 110,
                          height: 110,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            color: Colors.white.withValues(alpha: 0.1),
                            border: Border.all(
                              color: Colors.white.withValues(alpha: 0.2),
                              width: 1,
                            ),
                          ),
                          child: Center(
                            child: Icon(
                              Icons.sports_soccer_rounded,
                              size: 56,
                              color: Colors.white.withValues(alpha: 0.95),
                            ),
                          ),
                        ),
                        const SizedBox(height: 38),
                        Text(
                          AppConfig.appName,
                          style: AppFonts.display(AppTypography.h2).copyWith(
                            color: Colors.white,
                            fontWeight: FontWeight.w900,
                            letterSpacing: 2.0,
                          ),
                        ),
                        const SizedBox(height: 12),
                        Text(
                          'SPORTS CLUBS, SIMPLIFIED.',
                          style: AppFonts.body(AppTypography.bodySm).copyWith(
                            color: Colors.white.withValues(alpha: 0.7),
                            fontWeight: FontWeight.w600,
                            letterSpacing: 4.0, // wide luxury spacing
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
              
              // Subtle bottom loader fades in purely towards the end of the duration
              Positioned(
                bottom: 80,
                left: 0,
                right: 0,
                child: Opacity(
                  opacity: value > 0.8 ? ((value - 0.8) * 5) : 0.0,
                  child: Center(
                    child: SizedBox(
                      width: 24,
                      height: 24,
                      child: CircularProgressIndicator(
                        strokeWidth: 2.5,
                        valueColor: AlwaysStoppedAnimation(
                          Colors.white.withValues(alpha: 0.8),
                        ),
                      ),
                    ),
                  ),
                ),
              ),
            ],
          );
        },
      ),
    );
  }
}
