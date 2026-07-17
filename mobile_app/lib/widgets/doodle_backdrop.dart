import 'dart:math' as math;

import 'package:flutter/material.dart';

/// The vocabulary of hand-drawn marks scattered through the auth flow.
enum Doodle {
  ball,
  star,
  bolt,
  trophy,
  whistle,
  sparkle,
  heart,
  zigzag,
  wave,
  spiral,
  plus,
  dottedArc,
  flag,
  stopwatch,
  medal,
  cone,
  arrowLeft,
}

/// One doodle pinned to a fractional spot on its canvas.
///
/// [x] and [y] are 0..1 fractions of the paint area, [size] is the doodle's
/// nominal box in logical pixels, and [phase] offsets its drift so the field
/// never pulses in unison.
class DoodleSpot {
  final Doodle doodle;
  final double x;
  final double y;
  final double size;
  final double rotation;
  final double phase;
  final double opacity;

  /// Bob distance in logical pixels.
  final double drift;

  /// Full turns per loop. Non-zero makes the mark spin instead of just bob —
  /// worth it on the ball, silly on the trophy.
  final double spin;

  /// Pulses the mark's scale — reads as a twinkle on stars and sparkles.
  final bool twinkle;

  /// Ink weight relative to [size]. Heavier marks read as foreground.
  final double weight;

  const DoodleSpot(
    this.doodle,
    this.x,
    this.y,
    this.size, {
    this.rotation = 0,
    this.phase = 0,
    this.opacity = 1,
    this.drift = 6,
    this.spin = 0,
    this.twinkle = false,
    this.weight = 0.06,
  });
}

/// Big, confident marks drawn in white over the brand hero band. These carry the
/// personality of the flow, so they're sized and weighted to actually be seen.
///
/// Placement is a negative space exercise: the headline owns the band's lower
/// left, so the marks crowd the top strip and the right rail. Anything drifting
/// under the words would only make them harder to read.
const List<DoodleSpot> kBandSpots = [
  // Hero mark — big enough to bleed off the right edge, and slowly turning.
  DoodleSpot(
    Doodle.ball,
    0.90,
    0.15,
    104,
    rotation: -0.1,
    phase: 0.0,
    opacity: 0.30,
    drift: 10,
    spin: 0.5,
    weight: 0.05,
  ),
  // Top strip, above the headline.
  DoodleSpot(
    Doodle.dottedArc,
    0.58,
    0.04,
    66,
    rotation: 0.2,
    phase: 0.40,
    opacity: 0.34,
    drift: 4,
  ),
  DoodleSpot(
    Doodle.bolt,
    0.31,
    0.07,
    46,
    rotation: 0.18,
    phase: 0.15,
    opacity: 0.28,
    drift: 7,
  ),
  DoodleSpot(
    Doodle.star,
    0.47,
    0.20,
    28,
    rotation: -0.2,
    phase: 0.70,
    opacity: 0.36,
    drift: 5,
    twinkle: true,
  ),
  DoodleSpot(
    Doodle.sparkle,
    0.68,
    0.27,
    24,
    rotation: 0.3,
    phase: 0.45,
    opacity: 0.44,
    drift: 4,
    twinkle: true,
  ),
  DoodleSpot(
    Doodle.plus,
    0.21,
    0.26,
    15,
    rotation: 0.2,
    phase: 0.90,
    opacity: 0.32,
    drift: 3,
  ),
  // Right rail, clear of where the headline wraps.
  DoodleSpot(
    Doodle.whistle,
    0.95,
    0.52,
    52,
    rotation: 0.22,
    phase: 0.55,
    opacity: 0.18,
    drift: 8,
  ),
  DoodleSpot(
    Doodle.sparkle,
    0.86,
    0.75,
    18,
    rotation: -0.1,
    phase: 0.85,
    opacity: 0.30,
    drift: 4,
    twinkle: true,
  ),
  // Left rail, tucked under the back button.
  DoodleSpot(
    Doodle.cone,
    0.04,
    0.33,
    32,
    rotation: 0.1,
    phase: 0.60,
    opacity: 0.22,
    drift: 6,
  ),
];

/// Marks for the owner dashboard's hero — the same white ink as [kBandSpots],
/// but a much tighter composition.
///
/// This header is dense: the greeting owns the left, the avatar the top-right,
/// and the glass stat tiles the entire bottom. So the marks live almost entirely
/// in the top strip and the right rail, where the only thing they can overlap is
/// the avatar — which is opaque, so the big ball just peeks out from behind it.
/// Nothing drifts below y≈0.5, where the numbers start.
const List<DoodleSpot> kDashboardSpots = [
  // Hero mark, tucked behind the avatar and bleeding off the corner.
  DoodleSpot(
    Doodle.ball,
    0.93,
    0.06,
    86,
    rotation: -0.1,
    phase: 0.0,
    opacity: 0.26,
    drift: 8,
    spin: 0.5,
    weight: 0.05,
  ),
  DoodleSpot(
    Doodle.dottedArc,
    0.66,
    0.02,
    52,
    rotation: 0.24,
    phase: 0.4,
    opacity: 0.30,
    drift: 4,
  ),
  DoodleSpot(
    Doodle.sparkle,
    0.55,
    0.13,
    20,
    rotation: 0.3,
    phase: 0.45,
    opacity: 0.40,
    drift: 4,
    twinkle: true,
  ),
  DoodleSpot(
    Doodle.bolt,
    0.80,
    0.40,
    30,
    rotation: 0.18,
    phase: 0.15,
    opacity: 0.22,
    drift: 6,
  ),
  DoodleSpot(
    Doodle.plus,
    0.62,
    0.34,
    13,
    rotation: 0.2,
    phase: 0.9,
    opacity: 0.28,
    drift: 3,
  ),
  DoodleSpot(
    Doodle.star,
    0.72,
    0.22,
    18,
    rotation: -0.2,
    phase: 0.7,
    opacity: 0.30,
    drift: 4,
    twinkle: true,
  ),
];

/// Marks for the profile header's gradient card.
///
/// Unlike the other heroes, this one's content runs down the *centre* — avatar,
/// name, email, role badge — so the marks take the top strip and both side
/// rails and leave the middle column alone.
const List<DoodleSpot> kProfileSpots = [
  DoodleSpot(
    Doodle.ball,
    0.90,
    0.14,
    84,
    rotation: -0.1,
    phase: 0.0,
    opacity: 0.26,
    drift: 8,
    spin: 0.5,
    weight: 0.05,
  ),
  DoodleSpot(
    Doodle.dottedArc,
    0.16,
    0.09,
    48,
    rotation: 0.22,
    phase: 0.4,
    opacity: 0.30,
    drift: 4,
  ),
  DoodleSpot(
    Doodle.sparkle,
    0.10,
    0.34,
    18,
    rotation: 0.3,
    phase: 0.45,
    opacity: 0.38,
    drift: 3,
    twinkle: true,
  ),
  DoodleSpot(
    Doodle.bolt,
    0.07,
    0.60,
    24,
    rotation: 0.18,
    phase: 0.15,
    opacity: 0.20,
    drift: 5,
  ),
  DoodleSpot(
    Doodle.star,
    0.92,
    0.42,
    18,
    rotation: -0.2,
    phase: 0.7,
    opacity: 0.32,
    drift: 4,
    twinkle: true,
  ),
  DoodleSpot(
    Doodle.plus,
    0.86,
    0.66,
    12,
    rotation: 0.2,
    phase: 0.9,
    opacity: 0.26,
    drift: 3,
  ),
  DoodleSpot(
    Doodle.plus,
    0.27,
    0.17,
    10,
    rotation: -0.1,
    phase: 0.2,
    opacity: 0.24,
    drift: 3,
  ),
];

/// Marks for the splash's full-bleed brand field.
///
/// The emblem and wordmark own the middle of the screen, so these ring the
/// edges and corners — big and confident, since this is the first thing anyone
/// sees and it's on screen for barely a second.
const List<DoodleSpot> kSplashSpots = [
  DoodleSpot(
    Doodle.ball,
    0.88,
    0.10,
    130,
    rotation: -0.1,
    phase: 0.0,
    opacity: 0.22,
    drift: 10,
    spin: 0.4,
    weight: 0.05,
  ),
  DoodleSpot(
    Doodle.trophy,
    0.13,
    0.14,
    72,
    rotation: -0.18,
    phase: 0.3,
    opacity: 0.20,
    drift: 9,
  ),
  DoodleSpot(
    Doodle.whistle,
    0.16,
    0.86,
    68,
    rotation: 0.2,
    phase: 0.55,
    opacity: 0.18,
    drift: 8,
  ),
  DoodleSpot(
    Doodle.medal,
    0.86,
    0.88,
    74,
    rotation: 0.14,
    phase: 0.75,
    opacity: 0.20,
    drift: 9,
  ),
  DoodleSpot(
    Doodle.bolt,
    0.30,
    0.30,
    40,
    rotation: 0.18,
    phase: 0.15,
    opacity: 0.24,
    drift: 7,
  ),
  DoodleSpot(
    Doodle.cone,
    0.86,
    0.73,
    38,
    rotation: 0.1,
    phase: 0.6,
    opacity: 0.20,
    drift: 6,
  ),
  DoodleSpot(
    Doodle.sparkle,
    0.12,
    0.58,
    26,
    rotation: 0.3,
    phase: 0.45,
    opacity: 0.44,
    drift: 4,
    twinkle: true,
  ),
  DoodleSpot(
    Doodle.sparkle,
    0.78,
    0.34,
    22,
    rotation: -0.1,
    phase: 0.85,
    opacity: 0.40,
    drift: 4,
    twinkle: true,
  ),
  DoodleSpot(
    Doodle.star,
    0.10,
    0.48,
    24,
    rotation: -0.2,
    phase: 0.7,
    opacity: 0.34,
    drift: 5,
    twinkle: true,
  ),
  DoodleSpot(
    Doodle.star,
    0.93,
    0.50,
    18,
    rotation: 0.25,
    phase: 0.1,
    opacity: 0.30,
    drift: 4,
    twinkle: true,
  ),
  DoodleSpot(
    Doodle.dottedArc,
    0.50,
    0.06,
    70,
    rotation: 0.2,
    phase: 0.4,
    opacity: 0.30,
    drift: 4,
  ),
  DoodleSpot(
    Doodle.plus,
    0.62,
    0.20,
    14,
    rotation: 0.2,
    phase: 0.9,
    opacity: 0.30,
    drift: 3,
  ),
  DoodleSpot(
    Doodle.plus,
    0.38,
    0.84,
    12,
    rotation: -0.1,
    phase: 0.2,
    opacity: 0.28,
    drift: 3,
  ),
  DoodleSpot(
    Doodle.zigzag,
    0.50,
    0.94,
    56,
    rotation: 0.05,
    phase: 0.25,
    opacity: 0.22,
    drift: 5,
  ),
];

/// Marks for a light page header ([PageHero]) — drawn in ink rather than white,
/// because there's no colour band under them to knock out of.
///
/// Far fainter than the band sets for the same reason: on a near-white surface
/// there's nothing to hide behind, and dark marks at band opacity would fight
/// the headline instead of backing it. They keep to the right of the copy.
const List<DoodleSpot> kHeaderSpots = [
  DoodleSpot(
    Doodle.ball,
    0.90,
    0.34,
    76,
    rotation: -0.1,
    phase: 0.0,
    opacity: 0.12,
    drift: 6,
    spin: 0.5,
    weight: 0.05,
  ),
  DoodleSpot(
    Doodle.dottedArc,
    0.70,
    0.10,
    44,
    rotation: 0.22,
    phase: 0.4,
    opacity: 0.15,
    drift: 3,
  ),
  DoodleSpot(
    Doodle.sparkle,
    0.62,
    0.42,
    18,
    rotation: 0.3,
    phase: 0.45,
    opacity: 0.20,
    drift: 3,
    twinkle: true,
  ),
  DoodleSpot(
    Doodle.bolt,
    0.78,
    0.78,
    26,
    rotation: 0.18,
    phase: 0.15,
    opacity: 0.13,
    drift: 5,
  ),
  DoodleSpot(
    Doodle.star,
    0.55,
    0.80,
    15,
    rotation: -0.2,
    phase: 0.7,
    opacity: 0.15,
    drift: 3,
    twinkle: true,
  ),
  DoodleSpot(
    Doodle.plus,
    0.97,
    0.72,
    11,
    rotation: 0.2,
    phase: 0.9,
    opacity: 0.15,
    drift: 2,
  ),
];

/// Quieter ink marks on the page below the band. These fill the dead space
/// around and under the form card without competing with it.
///
/// All of them sit below y≈0.42: anything higher would be hidden behind the
/// band, which is painted over this field.
const List<DoodleSpot> kPageSpots = [
  DoodleSpot(
    Doodle.medal,
    0.05,
    0.50,
    40,
    rotation: -0.12,
    phase: 0.2,
    opacity: 0.15,
    drift: 7,
  ),
  DoodleSpot(
    Doodle.heart,
    0.96,
    0.44,
    26,
    rotation: 0.2,
    phase: 0.6,
    opacity: 0.15,
    drift: 6,
  ),
  DoodleSpot(
    Doodle.flag,
    0.97,
    0.66,
    34,
    rotation: -0.14,
    phase: 0.5,
    opacity: 0.14,
    drift: 7,
  ),
  DoodleSpot(
    Doodle.spiral,
    0.03,
    0.72,
    32,
    rotation: 0.0,
    phase: 0.9,
    opacity: 0.13,
    drift: 5,
  ),
  DoodleSpot(
    Doodle.wave,
    0.22,
    0.91,
    62,
    rotation: 0.04,
    phase: 0.35,
    opacity: 0.17,
    drift: 5,
  ),
  DoodleSpot(
    Doodle.stopwatch,
    0.55,
    0.96,
    36,
    rotation: 0.16,
    phase: 0.8,
    opacity: 0.15,
    drift: 8,
  ),
  DoodleSpot(
    Doodle.star,
    0.87,
    0.89,
    24,
    rotation: -0.2,
    phase: 0.05,
    opacity: 0.17,
    drift: 4,
    twinkle: true,
  ),
  DoodleSpot(
    Doodle.plus,
    0.11,
    0.84,
    14,
    rotation: 0.2,
    phase: 0.4,
    opacity: 0.17,
    drift: 3,
  ),
];

/// A field of hand-drawn marks, painted in code and drifting on a slow loop.
///
/// Every mark is a `Path` — no assets, no network, and it scales to any screen.
class AnimatedDoodleField extends StatefulWidget {
  final List<DoodleSpot> spots;

  /// Base ink colour; each spot's `opacity` is applied on top of it.
  final Color color;

  const AnimatedDoodleField({
    super.key,
    required this.spots,
    required this.color,
  });

  @override
  State<AnimatedDoodleField> createState() => _AnimatedDoodleFieldState();
}

class _AnimatedDoodleFieldState extends State<AnimatedDoodleField>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller = AnimationController(
    vsync: this,
    duration: const Duration(seconds: 16),
  );

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    // Drift is pure decoration, so it's the first thing to go when the platform
    // asks for reduced motion — the doodles then simply hold still.
    final reduceMotion = MediaQuery.maybeDisableAnimationsOf(context) ?? false;
    if (reduceMotion) {
      _controller.stop();
    } else if (!_controller.isAnimating) {
      _controller.repeat();
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return IgnorePointer(
      child: RepaintBoundary(
        child: AnimatedBuilder(
          animation: _controller,
          builder: (context, _) => CustomPaint(
            painter: _DoodlePainter(
              _controller.value,
              widget.spots,
              widget.color,
            ),
            size: Size.infinite,
          ),
        ),
      ),
    );
  }
}

/// A still field of marks — no controller, no ticker.
///
/// Use this wherever the doodles are content rather than atmosphere: generated
/// artwork, list thumbnails, anything that repeats down a scrolling page. A
/// screen full of independently drifting covers would be a mess to look at and
/// a waste of frames to paint.
class DoodleArt extends StatelessWidget {
  final List<DoodleSpot> spots;
  final Color color;

  const DoodleArt({super.key, required this.spots, required this.color});

  @override
  Widget build(BuildContext context) {
    return IgnorePointer(
      child: RepaintBoundary(
        child: CustomPaint(
          painter: _DoodlePainter(0, spots, color),
          size: Size.infinite,
        ),
      ),
    );
  }
}

class _DoodlePainter extends CustomPainter {
  final double t;
  final List<DoodleSpot> spots;
  final Color color;

  _DoodlePainter(this.t, this.spots, this.color);

  @override
  void paint(Canvas canvas, Size size) {
    for (final spot in spots) {
      final cycle = (t + spot.phase) * 2 * math.pi;
      final bob = math.sin(cycle);
      final sway = math.cos(cycle);

      canvas.save();
      canvas.translate(
        spot.x * size.width + sway * spot.drift * 0.4,
        spot.y * size.height + bob * spot.drift,
      );
      canvas.rotate(spot.rotation + bob * 0.05 + spot.spin * t * 2 * math.pi);
      if (spot.twinkle) {
        final s = 1 + bob * 0.18;
        canvas.scale(s, s);
      }

      final paint = Paint()
        ..color = color.withValues(alpha: color.a * spot.opacity)
        ..style = PaintingStyle.stroke
        ..strokeWidth = spot.size * spot.weight
        ..strokeCap = StrokeCap.round
        ..strokeJoin = StrokeJoin.round;

      _drawDoodle(canvas, paint, spot.doodle, spot.size);
      canvas.restore();
    }
  }

  @override
  bool shouldRepaint(_DoodlePainter old) =>
      old.t != t || old.color != color || old.spots != spots;
}

/// Dispatches to a shape builder. Every shape draws centred on the origin
/// inside a box of `s` × `s`, so callers control position and scale.
void _drawDoodle(Canvas canvas, Paint paint, Doodle doodle, double s) {
  switch (doodle) {
    case Doodle.ball:
      _ball(canvas, paint, s);
    case Doodle.star:
      _star(canvas, paint, s);
    case Doodle.bolt:
      _bolt(canvas, paint, s);
    case Doodle.trophy:
      _trophy(canvas, paint, s);
    case Doodle.whistle:
      _whistle(canvas, paint, s);
    case Doodle.sparkle:
      _sparkle(canvas, paint, s);
    case Doodle.heart:
      _heart(canvas, paint, s);
    case Doodle.zigzag:
      _zigzag(canvas, paint, s);
    case Doodle.wave:
      _wave(canvas, paint, s);
    case Doodle.spiral:
      _spiral(canvas, paint, s);
    case Doodle.plus:
      _plus(canvas, paint, s);
    case Doodle.dottedArc:
      _dottedArc(canvas, paint, s);
    case Doodle.flag:
      _flag(canvas, paint, s);
    case Doodle.stopwatch:
      _stopwatch(canvas, paint, s);
    case Doodle.medal:
      _medal(canvas, paint, s);
    case Doodle.cone:
      _cone(canvas, paint, s);
    case Doodle.arrowLeft:
      _arrowLeft(canvas, paint, s);
  }
}

/// A single doodle rendered as an icon — same hand as the wallpaper, so the
/// brand mark and the background are demonstrably the same drawing.
class DoodleMark extends StatelessWidget {
  final Doodle doodle;
  final double size;
  final Color color;

  /// Ink weight relative to [size]. Small marks need proportionally heavier
  /// strokes or they turn to mush.
  final double weight;

  const DoodleMark({
    super.key,
    required this.doodle,
    required this.size,
    required this.color,
    this.weight = 0.09,
  });

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: size,
      height: size,
      child: CustomPaint(painter: _MarkPainter(doodle, color, weight)),
    );
  }
}

class _MarkPainter extends CustomPainter {
  final Doodle doodle;
  final Color color;
  final double weight;

  _MarkPainter(this.doodle, this.color, this.weight);

  @override
  void paint(Canvas canvas, Size size) {
    final s = math.min(size.width, size.height);
    canvas.translate(size.width / 2, size.height / 2);
    final paint = Paint()
      ..color = color
      ..style = PaintingStyle.stroke
      ..strokeWidth = s * weight
      ..strokeCap = StrokeCap.round
      ..strokeJoin = StrokeJoin.round;
    _drawDoodle(canvas, paint, doodle, s);
  }

  @override
  bool shouldRepaint(_MarkPainter old) =>
      old.doodle != doodle || old.color != color || old.weight != weight;
}

void _ball(Canvas canvas, Paint paint, double s) {
  final r = s / 2;
  canvas.drawCircle(Offset.zero, r, paint);

  // Centre pentagon with spokes running to the rim — the classic panel seam.
  final pent = Path();
  const sides = 5;
  final inner = r * 0.34;
  for (var i = 0; i < sides; i++) {
    final a = -math.pi / 2 + i * 2 * math.pi / sides;
    final p = Offset(math.cos(a) * inner, math.sin(a) * inner);
    i == 0 ? pent.moveTo(p.dx, p.dy) : pent.lineTo(p.dx, p.dy);
  }
  pent.close();
  canvas.drawPath(pent, paint);

  for (var i = 0; i < sides; i++) {
    final a = -math.pi / 2 + i * 2 * math.pi / sides;
    canvas.drawLine(
      Offset(math.cos(a) * inner, math.sin(a) * inner),
      Offset(math.cos(a) * r, math.sin(a) * r),
      paint,
    );
  }
}

void _star(Canvas canvas, Paint paint, double s) {
  final outer = s / 2;
  final inner = outer * 0.42;
  final path = Path();
  for (var i = 0; i < 10; i++) {
    final r = i.isEven ? outer : inner;
    final a = -math.pi / 2 + i * math.pi / 5;
    final p = Offset(math.cos(a) * r, math.sin(a) * r);
    i == 0 ? path.moveTo(p.dx, p.dy) : path.lineTo(p.dx, p.dy);
  }
  path.close();
  canvas.drawPath(path, paint);
}

void _bolt(Canvas canvas, Paint paint, double s) {
  final h = s / 2;
  final w = s * 0.32;
  final path = Path()
    ..moveTo(w * 0.4, -h)
    ..lineTo(-w, h * 0.12)
    ..lineTo(-w * 0.05, h * 0.12)
    ..lineTo(-w * 0.4, h)
    ..lineTo(w, -h * 0.15)
    ..lineTo(w * 0.05, -h * 0.15)
    ..close();
  canvas.drawPath(path, paint);
}

void _trophy(Canvas canvas, Paint paint, double s) {
  final w = s * 0.46;
  final h = s / 2;

  // Cup: straight shoulders tapering into a rounded base.
  final cup = Path()
    ..moveTo(-w, -h)
    ..lineTo(w, -h)
    ..lineTo(w * 0.72, h * 0.05)
    ..quadraticBezierTo(w * 0.6, h * 0.42, 0, h * 0.42)
    ..quadraticBezierTo(-w * 0.6, h * 0.42, -w * 0.72, h * 0.05)
    ..close();
  canvas.drawPath(cup, paint);

  // Handles.
  final left = Path()
    ..moveTo(-w * 0.95, -h * 0.82)
    ..quadraticBezierTo(-w * 1.9, -h * 0.5, -w * 0.85, -h * 0.1);
  final right = Path()
    ..moveTo(w * 0.95, -h * 0.82)
    ..quadraticBezierTo(w * 1.9, -h * 0.5, w * 0.85, -h * 0.1);
  canvas.drawPath(left, paint);
  canvas.drawPath(right, paint);

  // Stem and plinth.
  canvas.drawLine(Offset(0, h * 0.42), Offset(0, h * 0.72), paint);
  canvas.drawLine(
    Offset(-w * 0.55, h * 0.72),
    Offset(w * 0.55, h * 0.72),
    paint,
  );
}

/// Referee's whistle, in profile: mouthpiece at the left, barrel swelling to the
/// right, air hole on the crown.
///
/// The previous take was a rounded box with a hole in it and a spur on the side,
/// which at any real size read as a padlock rather than a whistle.
void _whistle(Canvas canvas, Paint paint, double s) {
  // Barrel: flat where the mouthpiece meets it, swelling round to the right.
  final body = Path()
    ..moveTo(-s * 0.10, -s * 0.10)
    ..lineTo(s * 0.02, -s * 0.27)
    ..quadraticBezierTo(s * 0.46, -s * 0.30, s * 0.44, s * 0.02)
    ..quadraticBezierTo(s * 0.42, s * 0.31, s * 0.04, s * 0.27)
    ..lineTo(-s * 0.10, s * 0.10)
    ..close();
  canvas.drawPath(body, paint);

  // Mouthpiece: a slim bar running left to the lips.
  final mouth = RRect.fromRectAndRadius(
    Rect.fromLTRB(-s * 0.48, -s * 0.10, -s * 0.08, s * 0.10),
    Radius.circular(s * 0.05),
  );
  canvas.drawRRect(mouth, paint);

  // Air hole on the crown.
  canvas.drawCircle(Offset(s * 0.18, -s * 0.11), s * 0.055, paint);
}

void _sparkle(Canvas canvas, Paint paint, double s) {
  final r = s / 2;
  // Four-point twinkle: concave sides pinch each arm to a needle.
  final path = Path()..moveTo(0, -r);
  path.quadraticBezierTo(r * 0.14, -r * 0.14, r, 0);
  path.quadraticBezierTo(r * 0.14, r * 0.14, 0, r);
  path.quadraticBezierTo(-r * 0.14, r * 0.14, -r, 0);
  path.quadraticBezierTo(-r * 0.14, -r * 0.14, 0, -r);
  path.close();
  canvas.drawPath(path, paint);
}

void _heart(Canvas canvas, Paint paint, double s) {
  final r = s / 2;
  final path = Path()
    ..moveTo(0, r * 0.85)
    ..cubicTo(-r * 1.5, -r * 0.1, -r * 0.55, -r * 1.25, 0, -r * 0.35)
    ..cubicTo(r * 0.55, -r * 1.25, r * 1.5, -r * 0.1, 0, r * 0.85)
    ..close();
  canvas.drawPath(path, paint);
}

void _zigzag(Canvas canvas, Paint paint, double s) {
  final path = Path()..moveTo(-s / 2, 0);
  const steps = 4;
  final step = s / steps;
  for (var i = 0; i < steps; i++) {
    path.lineTo(-s / 2 + step * (i + 0.5), i.isEven ? -s * 0.2 : s * 0.2);
    path.lineTo(-s / 2 + step * (i + 1), 0);
  }
  canvas.drawPath(path, paint);
}

void _wave(Canvas canvas, Paint paint, double s) {
  final path = Path()..moveTo(-s / 2, 0);
  const humps = 3;
  final step = s / humps;
  for (var i = 0; i < humps; i++) {
    final x = -s / 2 + step * i;
    path.quadraticBezierTo(
      x + step * 0.25,
      i.isEven ? -s * 0.22 : s * 0.22,
      x + step * 0.5,
      0,
    );
    path.quadraticBezierTo(
      x + step * 0.75,
      i.isEven ? s * 0.22 : -s * 0.22,
      x + step,
      0,
    );
  }
  canvas.drawPath(path, paint);
}

void _spiral(Canvas canvas, Paint paint, double s) {
  final path = Path();
  const turns = 2.6;
  const segments = 60;
  final maxR = s / 2;
  for (var i = 0; i <= segments; i++) {
    final f = i / segments;
    final a = f * turns * 2 * math.pi;
    final r = maxR * f;
    final p = Offset(math.cos(a) * r, math.sin(a) * r);
    i == 0 ? path.moveTo(p.dx, p.dy) : path.lineTo(p.dx, p.dy);
  }
  canvas.drawPath(path, paint);
}

void _plus(Canvas canvas, Paint paint, double s) {
  final r = s / 2;
  canvas.drawLine(Offset(0, -r), Offset(0, r), paint);
  canvas.drawLine(Offset(-r, 0), Offset(r, 0), paint);
}

void _dottedArc(Canvas canvas, Paint paint, double s) {
  final r = s / 2;
  final dot = Paint()
    ..color = paint.color
    ..style = PaintingStyle.fill;
  const count = 7;
  for (var i = 0; i < count; i++) {
    final a = math.pi * 0.15 + (i / (count - 1)) * math.pi * 0.7;
    canvas.drawCircle(Offset(math.cos(a) * r, math.sin(a) * r), s * 0.035, dot);
  }
}

void _flag(Canvas canvas, Paint paint, double s) {
  final h = s / 2;
  canvas.drawLine(Offset(-s * 0.3, -h), Offset(-s * 0.3, h), paint);
  // Pennant with a fluttering trailing edge.
  final flag = Path()
    ..moveTo(-s * 0.3, -h)
    ..lineTo(s * 0.45, -h * 0.55)
    ..quadraticBezierTo(s * 0.05, -h * 0.2, -s * 0.3, -h * 0.05)
    ..close();
  canvas.drawPath(flag, paint);
}

void _stopwatch(Canvas canvas, Paint paint, double s) {
  final r = s * 0.4;
  canvas.drawCircle(Offset(0, s * 0.08), r, paint);
  // Crown and button.
  canvas.drawLine(
    Offset(-r * 0.35, -r - s * 0.06),
    Offset(r * 0.35, -r - s * 0.06),
    paint,
  );
  canvas.drawLine(Offset(0, -r - s * 0.06), Offset(0, -r + s * 0.04), paint);
  // Hands frozen at ten-past.
  canvas.drawLine(Offset(0, s * 0.08), Offset(0, s * 0.08 - r * 0.55), paint);
  canvas.drawLine(
    Offset(0, s * 0.08),
    Offset(r * 0.45, s * 0.08 + r * 0.2),
    paint,
  );
}

void _medal(Canvas canvas, Paint paint, double s) {
  final r = s * 0.30;
  final cy = s * 0.16;
  // Ribbon: a clean V from the top corners down to the disc. The straps used to
  // stop short and sit vertically, which — above a ringed circle — read as a
  // padlock shackle rather than a medal.
  final ribbon = Path()
    ..moveTo(-s * 0.30, -s * 0.5)
    ..lineTo(0, cy - r * 0.55)
    ..moveTo(s * 0.30, -s * 0.5)
    ..lineTo(0, cy - r * 0.55);
  canvas.drawPath(ribbon, paint);
  canvas.drawCircle(Offset(0, cy), r, paint);
  // A star on the face, so the disc reads as struck rather than as a washer.
  canvas.save();
  canvas.translate(0, cy);
  _star(canvas, paint, r * 1.05);
  canvas.restore();
}

void _cone(Canvas canvas, Paint paint, double s) {
  final h = s / 2;
  final w = s * 0.34;
  // Training cone: tapered body on a wide base.
  final body = Path()
    ..moveTo(0, -h)
    ..lineTo(w, h * 0.55)
    ..lineTo(-w, h * 0.55)
    ..close();
  canvas.drawPath(body, paint);
  canvas.drawLine(Offset(-w * 1.5, h * 0.55), Offset(w * 1.5, h * 0.55), paint);
  // Reflective stripe.
  canvas.drawLine(
    Offset(-w * 0.45, -h * 0.05),
    Offset(w * 0.45, -h * 0.05),
    paint,
  );
}

/// Back arrow, drawn rather than set: the shaft bows very slightly and the head
/// is an open V, so it belongs with the doodles instead of the icon font.
void _arrowLeft(Canvas canvas, Paint paint, double s) {
  final r = s * 0.36;
  final shaft = Path()
    ..moveTo(r, r * 0.06)
    ..quadraticBezierTo(0, -r * 0.12, -r, r * 0.02);
  canvas.drawPath(shaft, paint);

  final head = Path()
    ..moveTo(-r * 0.28, -r * 0.52)
    ..lineTo(-r, r * 0.02)
    ..lineTo(-r * 0.24, r * 0.56);
  canvas.drawPath(head, paint);
}

/// A rough marker swipe drawn behind a word — the hand-highlighted look you get
/// from a real highlighter: uneven ends, slight overshoot, a lighter second pass.
class MarkerHighlight extends StatelessWidget {
  final Widget child;
  final Color color;

  const MarkerHighlight({super.key, required this.child, required this.color});

  @override
  Widget build(BuildContext context) {
    return CustomPaint(painter: _MarkerPainter(color), child: child);
  }
}

class _MarkerPainter extends CustomPainter {
  final Color color;

  _MarkerPainter(this.color);

  @override
  void paint(Canvas canvas, Size size) {
    // The swipe has to cover the whole word, not just sit under it: the word on
    // top is dark ink, which is only legible against the amber. A stroke that
    // pooled under the baseline left the tops of the letters as ink-on-gradient
    // at roughly 2:1 contrast.
    final h = size.height * 0.86;
    final centerY = size.height * 0.52;
    final paint = Paint()
      ..color = color.withValues(alpha: 0.92)
      ..style = PaintingStyle.stroke
      ..strokeWidth = h
      ..strokeCap = StrokeCap.round;

    // A round cap bulges half a stroke-width *past* each endpoint. Starting the
    // path at x=0 therefore threw ~h/2 of amber to the left of the word, over
    // the space and into the last letter of the word before it. Pull the
    // endpoints in by the cap radius and the paint lands where it's asked to,
    // overshooting by [overshoot] and no more.
    const overshoot = 3.0;
    final capInset = math.min(h / 2 - overshoot, size.width * 0.35);

    // A slight tilt across the word plus round caps: the band's edges stay
    // uneven, so it still reads as drawn rather than as a rounded rectangle.
    final path = Path()
      ..moveTo(capInset, centerY + h * 0.04)
      ..quadraticBezierTo(
        size.width * 0.5,
        centerY - h * 0.06,
        size.width - capInset,
        centerY + h * 0.06,
      );
    canvas.drawPath(path, paint);

    // Lighter second pass across the top — the streak of a stroke gone over
    // twice, which keeps the block from reading as a flat highlight chip.
    final secondWidth = h * 0.22;
    final second = Paint()
      ..color = color.withValues(alpha: 0.35)
      ..style = PaintingStyle.stroke
      ..strokeWidth = secondWidth
      ..strokeCap = StrokeCap.round;
    final secondInset = math.min(
      secondWidth / 2 + size.width * 0.04,
      size.width * 0.4,
    );
    final path2 = Path()
      ..moveTo(secondInset, centerY - h * 0.34)
      ..quadraticBezierTo(
        size.width * 0.55,
        centerY - h * 0.2,
        size.width - secondInset,
        centerY - h * 0.38,
      );
    canvas.drawPath(path2, second);
  }

  @override
  bool shouldRepaint(_MarkerPainter old) => old.color != color;
}

/// Clips a hero band to a hand-torn bottom edge — an uneven sweep rather than a
/// machined arc, so the band belongs to the same hand as the doodles.
class TornEdgeClipper extends CustomClipper<Path> {
  /// Scales how deep the tear bites into the band. 1.0 takes up to 58px out of
  /// the bottom-right — fine for auth, where the band ends in empty gradient.
  /// Denser headers want less, or the tear eats their content.
  final double depth;

  const TornEdgeClipper({this.depth = 1.0});

  /// The largest vertical bite the tear takes, so callers can reserve exactly
  /// enough bottom padding to keep content clear of it.
  double get maxBite => 58 * depth;

  @override
  Path getClip(Size size) {
    final w = size.width;
    final h = size.height;
    double y(double up) => h - up * depth;
    return Path()
      ..moveTo(0, 0)
      ..lineTo(0, y(38))
      // Two uneven sweeps: dips low on the left, rides up to the right.
      ..cubicTo(w * 0.18, y(4), w * 0.44, y(-2), w * 0.63, y(18))
      ..cubicTo(w * 0.78, y(34), w * 0.88, y(40), w, y(58))
      ..lineTo(w, 0)
      ..close();
  }

  @override
  bool shouldReclip(TornEdgeClipper oldClipper) => oldClipper.depth != depth;
}
