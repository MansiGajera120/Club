import 'package:flutter/material.dart';

/// Wraps a tappable surface so it dips slightly while pressed, giving cards and
/// buttons a soft, physical response.
///
/// It listens to raw pointer events (rather than a tap gesture) so it composes
/// cleanly with the child's own [InkWell]/[GestureDetector] — the ripple and
/// tap handling stay with the child; this only animates the scale. A small drag
/// releases the press so scrolling a list never leaves a card stuck pressed.
class PressableScale extends StatefulWidget {
  final Widget child;

  /// Scale applied at the bottom of the press. Smaller = deeper dip.
  final double pressedScale;
  final Duration duration;

  const PressableScale({
    super.key,
    required this.child,
    this.pressedScale = 0.97,
    this.duration = const Duration(milliseconds: 120),
  });

  @override
  State<PressableScale> createState() => _PressableScaleState();
}

class _PressableScaleState extends State<PressableScale> {
  bool _pressed = false;
  Offset _downPosition = Offset.zero;

  void _setPressed(bool value) {
    if (_pressed == value) return;
    setState(() => _pressed = value);
  }

  @override
  Widget build(BuildContext context) {
    return Listener(
      onPointerDown: (event) {
        _downPosition = event.position;
        _setPressed(true);
      },
      onPointerMove: (event) {
        if ((event.position - _downPosition).distance > 12) {
          _setPressed(false);
        }
      },
      onPointerUp: (_) => _setPressed(false),
      onPointerCancel: (_) => _setPressed(false),
      child: AnimatedScale(
        scale: _pressed ? widget.pressedScale : 1.0,
        duration: widget.duration,
        curve: Curves.easeOut,
        child: widget.child,
      ),
    );
  }
}
