import 'package:flutter/material.dart';

import 'doodle_backdrop.dart';

/// Generated cover art for events that have no uploaded image.
///
/// Owners can't set a cover today, so every event fell back to a grey icon
/// placeholder. Instead of one shared stand-in, each event derives its own
/// artwork from its id: a colour pairing, a hero doodle, and a scatter of marks.
///
/// The seed is hashed with FNV-1a rather than [Object.hashCode] on purpose —
/// Dart's string hash is not guaranteed stable across runs, which would mean an
/// event quietly changed its cover every time the app restarted. Same event,
/// same art, forever.
class EventCoverArt extends StatelessWidget {
  /// Stable identity for the event — its id. Falls back to the title if empty.
  final String seed;

  const EventCoverArt({super.key, required this.seed});

  @override
  Widget build(BuildContext context) {
    final hash = _fnv1a(seed.isEmpty ? 'event' : seed);
    final palette = _palettes[_pick(hash, _kPalette) % _palettes.length];

    return LayoutBuilder(
      builder: (context, constraints) {
        // Marks are sized in logical pixels, so scale them to whatever box the
        // art lands in — a 72px list thumbnail and a 240px detail header both
        // get the same composition rather than a cropped one.
        final extent = constraints.hasBoundedHeight && constraints.maxHeight > 0
            ? constraints.maxHeight
            : 160.0;

        return DecoratedBox(
          decoration: BoxDecoration(
            gradient: LinearGradient(
              colors: palette,
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
          ),
          child: DoodleArt(spots: _spotsFor(hash, extent), color: Colors.white),
        );
      },
    );
  }
}

/// 32-bit FNV-1a. Small, deterministic, and stable across runs.
int _fnv1a(String input) {
  var hash = 0x811c9dc5;
  for (final unit in input.codeUnits) {
    hash ^= unit;
    hash = (hash * 0x01000193) & 0xFFFFFFFF;
  }
  return hash;
}

// Salts, so each visual choice is drawn from an independent stream.
const int _kPalette = 0x9e3779b9;
const int _kHero = 0x85ebca6b;
const int _kMirror = 0xc2b2ae35;
const int _kTilt = 0x27d4eb2f;

/// Derives an independent value for one visual choice.
///
/// Slicing separate bit ranges out of a single FNV hash isn't enough: ids that
/// differ only in their last characters (consecutive Mongo ObjectIds, say) leave
/// the high bits nearly identical, so covers clumped onto the same few palettes.
/// Salting and re-avalanching decorrelates each choice from the others.
int _pick(int hash, int salt) {
  var h = (hash ^ salt) & 0xFFFFFFFF;
  h ^= h >>> 16;
  h = (h * 0x7feb352d) & 0xFFFFFFFF;
  h ^= h >>> 15;
  h = (h * 0x846ca68b) & 0xFFFFFFFF;
  h ^= h >>> 16;
  return h;
}

/// Vivid pairings that still belong to the product. The first few stay in the
/// brand's ocean range; the rest push further out so a schedule of events reads
/// as a set of distinct cards rather than a wall of blue.
const List<List<Color>> _palettes = [
  [Color(0xFF2563EB), Color(0xFF38BDF8)], // brand blue → sky
  [Color(0xFF0EA5E9), Color(0xFF22D3EE)], // sky → cyan
  [Color(0xFF7C3AED), Color(0xFF3B82F6)], // violet → blue
  [Color(0xFF059669), Color(0xFF34D399)], // emerald
  [Color(0xFF0F766E), Color(0xFF2DD4BF)], // teal
  [Color(0xFFF59E0B), Color(0xFFF97316)], // amber → orange
  [Color(0xFFEC4899), Color(0xFF8B5CF6)], // pink → violet
  [Color(0xFFEF4444), Color(0xFFF59E0B)], // red → amber
];

/// The mark that carries each cover. All sports kit, so whichever one an event
/// draws still reads as belonging to a club.
const List<Doodle> _heroes = [
  Doodle.ball,
  Doodle.trophy,
  Doodle.whistle,
  Doodle.medal,
  Doodle.cone,
  Doodle.bolt,
  Doodle.flag,
  Doodle.stopwatch,
];

/// Builds the composition for [hash] at a box of [extent] pixels tall.
///
/// `drift: 0` throughout: this is a still image inside scrolling lists, so the
/// marks must not wander (and a list of covers must never animate).
List<DoodleSpot> _spotsFor(int hash, double extent) {
  final hero = _heroes[_pick(hash, _kHero) % _heroes.length];
  // Mirror half the covers so the hero doesn't always sit on the same side.
  final mirrored = (_pick(hash, _kMirror) & 1) == 1;
  double x(double v) => mirrored ? 1 - v : v;
  // −0.25..0.25 rad of tilt, derived from the seed.
  final tilt = ((_pick(hash, _kTilt) % 21) - 10) / 40;

  return [
    DoodleSpot(
      hero,
      x(0.78),
      0.46,
      extent * 0.86,
      rotation: tilt,
      opacity: 0.30,
      drift: 0,
      weight: 0.05,
    ),
    DoodleSpot(
      Doodle.sparkle,
      x(0.24),
      0.24,
      extent * 0.17,
      rotation: tilt * 2,
      opacity: 0.52,
      drift: 0,
    ),
    DoodleSpot(
      Doodle.star,
      x(0.14),
      0.74,
      extent * 0.14,
      rotation: -tilt,
      opacity: 0.42,
      drift: 0,
    ),
    DoodleSpot(
      Doodle.plus,
      x(0.46),
      0.16,
      extent * 0.09,
      opacity: 0.42,
      drift: 0,
    ),
    DoodleSpot(
      Doodle.dottedArc,
      x(0.40),
      0.88,
      extent * 0.42,
      rotation: tilt,
      opacity: 0.32,
      drift: 0,
    ),
  ];
}
