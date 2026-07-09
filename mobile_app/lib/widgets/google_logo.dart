import 'package:flutter/material.dart';

/// Official multicolor Google "G" mark (bundled asset).
class GoogleLogo extends StatelessWidget {
  final double size;

  const GoogleLogo({super.key, this.size = 20});

  @override
  Widget build(BuildContext context) {
    return Image.asset(
      'assets/icons/google_logo.png',
      width: size,
      height: size,
      filterQuality: FilterQuality.high,
      errorBuilder: (_, _, _) => const _FallbackGoogleLogo(),
    );
  }
}

/// Lightweight painted fallback if the asset fails to load.
class _FallbackGoogleLogo extends StatelessWidget {
  const _FallbackGoogleLogo();

  @override
  Widget build(BuildContext context) {
    return const SizedBox(
      width: 20,
      height: 20,
      child: CustomPaint(painter: _GoogleGPainter()),
    );
  }
}

class _GoogleGPainter extends CustomPainter {
  const _GoogleGPainter();

  static const _blue = Color(0xFF4285F4);
  static const _green = Color(0xFF34A853);
  static const _yellow = Color(0xFFFBBC05);
  static const _red = Color(0xFFEA4335);

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final radius = size.width * 0.42;
    final rect = Rect.fromCircle(center: center, radius: radius);
    const sweep = 1.57;

    canvas.drawArc(rect, 0.9, sweep, true, Paint()..color = _red);
    canvas.drawArc(rect, 0.9 + sweep, sweep, true, Paint()..color = _yellow);
    canvas.drawArc(rect, 0.9 + sweep * 2, sweep, true, Paint()..color = _green);
    canvas.drawArc(rect, 0.9 + sweep * 3, sweep, true, Paint()..color = _blue);

    canvas.drawCircle(center, radius * 0.58, Paint()..color = Colors.white);

    final bar = Paint()..color = _blue;
    canvas.drawRect(
      Rect.fromLTWH(center.dx - radius * 0.05, center.dy - radius * 0.22,
          radius * 1.05, radius * 0.44),
      bar,
    );
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
