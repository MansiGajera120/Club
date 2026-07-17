import { Box } from '@mui/material';

/**
 * Hand-drawn marks, rebuilt as inline SVG.
 *
 * A deliberate port of the Flutter `CustomPainter` doodles in
 * `mobile_app/lib/widgets/doodle_backdrop.dart` — same shapes, same hand — so
 * the admin panel and the app read as one product. The Dart paths can't cross
 * over, but the geometry can: every shape is drawn in a 100×100 viewBox centred
 * on the origin, mirroring the Flutter shapes' "centred in a box of s × s"
 * contract. Coordinates below are that contract evaluated at s = 100.
 *
 * Keep the two in sync when either side gains a mark.
 */

// Ball: pentagon and rim points at -90° + i·72° — the classic panel seam.
const BALL_PENTAGON = '0,-15.6 14.8,-4.8 9.2,12.6 -9.2,12.6 -14.8,-4.8';
const BALL_SPOKES = [
  [0, -15.6, 0, -46],
  [14.8, -4.8, 43.7, -14.2],
  [9.2, 12.6, 27, 37.2],
  [-9.2, 12.6, -27, 37.2],
  [-14.8, -4.8, -43.7, -14.2],
];

// Star: alternating outer (50) / inner (21) points at -90° + i·36°.
const STAR_POINTS =
  '0,-50 12.3,-17 47.6,-15.5 20,6.5 29.4,40.5 0,21 -29.4,40.5 -20,6.5 -47.6,-15.5 -12.3,-17';

const BOLT_POINTS = '12.8,-50 -32,6 -1.6,6 -12.8,50 32,-7.5 1.6,-7.5';

// Seven dots swept from 27° to 153° at r=50.
const ARC_DOTS = [
  [44.5, 22.7],
  [33.5, 37.2],
  [17.9, 46.7],
  [0, 50],
  [-17.9, 46.7],
  [-33.5, 37.2],
  [-44.5, 22.7],
];

// Medal: the struck star on the disc face, centred at (0, 16).
const MEDAL_STAR =
  '0,0.25 3.89,10.65 14.98,11.13 6.29,18.04 9.26,28.74 0,22.6 -9.26,28.74 -6.29,18.04 -14.98,11.13 -3.89,10.65';

/** One doodle, drawn in a 100×100 viewBox centred on the origin. */
function DoodleShape({ name, weight }) {
  const s = {
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: weight * 100,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  };

  switch (name) {
    case 'ball':
      return (
        <g {...s}>
          <circle cx="0" cy="0" r="46" />
          <polygon points={BALL_PENTAGON} />
          {BALL_SPOKES.map(([x1, y1, x2, y2]) => (
            <line key={`${x2},${y2}`} x1={x1} y1={y1} x2={x2} y2={y2} />
          ))}
        </g>
      );
    case 'star':
      return (
        <g {...s}>
          <polygon points={STAR_POINTS} />
        </g>
      );
    case 'bolt':
      return (
        <g {...s}>
          <polygon points={BOLT_POINTS} />
        </g>
      );
    case 'sparkle':
      // Concave sides pinch each arm to a needle.
      return (
        <g {...s}>
          <path d="M0,-50 Q7,-7 50,0 Q7,7 0,50 Q-7,7 -50,0 Q-7,-7 0,-50 Z" />
        </g>
      );
    case 'plus':
      return (
        <g {...s}>
          <line x1="0" y1="-50" x2="0" y2="50" />
          <line x1="-50" y1="0" x2="50" y2="0" />
        </g>
      );
    case 'dottedArc':
      return (
        <g fill="currentColor">
          {ARC_DOTS.map(([cx, cy]) => (
            <circle key={`${cx},${cy}`} cx={cx} cy={cy} r="3.5" />
          ))}
        </g>
      );
    case 'trophy':
      // The handles bow well outside the 100×100 box — see `overflow: visible`
      // on the <svg> below, which keeps SVG from clipping them off.
      return (
        <g {...s}>
          <path d="M-46,-50 L46,-50 L33.1,2.5 Q27.6,21 0,21 Q-27.6,21 -33.1,2.5 Z" />
          <path d="M-43.7,-41 Q-87.4,-25 -39.1,-5" />
          <path d="M43.7,-41 Q87.4,-25 39.1,-5" />
          <line x1="0" y1="21" x2="0" y2="36" />
          <line x1="-25.3" y1="36" x2="25.3" y2="36" />
        </g>
      );
    case 'medal':
      return (
        <g {...s}>
          <path d="M-30,-50 L0,-0.5 M30,-50 L0,-0.5" />
          <circle cx="0" cy="16" r="30" />
          <polygon points={MEDAL_STAR} />
        </g>
      );
    case 'cone':
      return (
        <g {...s}>
          <path d="M0,-50 L34,27.5 L-34,27.5 Z" />
          <line x1="-51" y1="27.5" x2="51" y2="27.5" />
          <line x1="-15.3" y1="-2.5" x2="15.3" y2="-2.5" />
        </g>
      );
    case 'whistle':
      // Mouthpiece left, barrel swelling right, air hole on the crown.
      return (
        <g {...s}>
          <path d="M-10,-10 L2,-27 Q46,-30 44,2 Q42,31 4,27 L-10,10 Z" />
          <rect x="-48" y="-10" width="40" height="20" rx="5" />
          <circle cx="18" cy="-11" r="5.5" />
        </g>
      );
    case 'stopwatch':
      return (
        <g {...s}>
          <circle cx="0" cy="8" r="40" />
          <line x1="-14" y1="-46" x2="14" y2="-46" />
          <line x1="0" y1="-46" x2="0" y2="-36" />
          <line x1="0" y1="8" x2="0" y2="-14" />
          <line x1="0" y1="8" x2="18" y2="16" />
        </g>
      );
    case 'flag':
      return (
        <g {...s}>
          <line x1="-30" y1="-50" x2="-30" y2="50" />
          <path d="M-30,-50 L45,-27.5 Q5,-10 -30,-2.5 Z" />
        </g>
      );
    case 'zigzag':
      return (
        <g {...s}>
          <path d="M-50,0 L-37.5,-20 L-25,0 L-12.5,20 L0,0 L12.5,-20 L25,0 L37.5,20 L50,0" />
        </g>
      );
    default:
      return null;
  }
}

/**
 * A single doodle rendered at [size] — the counterpart to Flutter's
 * `DoodleMark`.
 *
 * `overflow: visible` because some marks (the trophy's handles) deliberately
 * bow past their nominal box, exactly as they do in the Flutter painter, which
 * has no clip.
 */
export function Doodle({ name, size = 16, color = 'currentColor', weight = 0.09, sx }) {
  return (
    <Box
      component="svg"
      viewBox="-50 -50 100 100"
      aria-hidden
      sx={{
        width: size,
        height: size,
        color,
        display: 'block',
        flexShrink: 0,
        overflow: 'visible',
        ...sx,
      }}
    >
      <DoodleShape name={name} weight={weight} />
    </Box>
  );
}

export default Doodle;
