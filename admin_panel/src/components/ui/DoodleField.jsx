import { Box } from '@mui/material';

import { Doodle } from './Doodle';

/**
 * Composition for the auth panel — the counterpart to the app's splash field.
 *
 * The emblem and wordmark own the middle, so these ring the edges and corners.
 * This panel is tall and narrow rather than wide, so the marks hug the top and
 * bottom bands instead of the left/right rails a page header would use.
 *
 * `x`/`y` are percentages of the panel; `phase` (0..1) offsets each mark's
 * drift so the field never pulses in unison.
 */
const AUTH_PANEL_SPOTS = [
  {
    name: 'ball',
    x: 86,
    y: 9,
    size: 132,
    opacity: 0.2,
    drift: 10,
    phase: 0,
    spin: true,
    weight: 0.05,
  },
  {
    name: 'trophy',
    x: 15,
    y: 12,
    size: 76,
    opacity: 0.18,
    drift: 9,
    phase: 0.3,
    rotate: -10,
  },
  {
    name: 'whistle',
    x: 16,
    y: 88,
    size: 72,
    opacity: 0.16,
    drift: 8,
    phase: 0.55,
    rotate: 12,
  },
  {
    name: 'medal',
    x: 84,
    y: 90,
    size: 78,
    opacity: 0.18,
    drift: 9,
    phase: 0.75,
    rotate: 8,
  },
  {
    name: 'bolt',
    x: 30,
    y: 30,
    size: 42,
    opacity: 0.22,
    drift: 7,
    phase: 0.15,
    rotate: 10,
  },
  {
    name: 'cone',
    x: 76,
    y: 72,
    size: 40,
    opacity: 0.18,
    drift: 6,
    phase: 0.6,
    rotate: 6,
  },
  {
    name: 'sparkle',
    x: 22,
    y: 60,
    size: 28,
    opacity: 0.4,
    drift: 4,
    phase: 0.45,
    twinkle: true,
  },
  {
    name: 'sparkle',
    x: 80,
    y: 36,
    size: 24,
    opacity: 0.36,
    drift: 4,
    phase: 0.85,
    twinkle: true,
  },
  {
    name: 'star',
    x: 10,
    y: 46,
    size: 26,
    opacity: 0.3,
    drift: 5,
    phase: 0.7,
    twinkle: true,
  },
  {
    name: 'star',
    x: 92,
    y: 56,
    size: 20,
    opacity: 0.28,
    drift: 4,
    phase: 0.1,
    twinkle: true,
  },
  {
    name: 'dottedArc',
    x: 50,
    y: 5,
    size: 72,
    opacity: 0.28,
    drift: 4,
    phase: 0.4,
    rotate: 12,
  },
  { name: 'plus', x: 62, y: 18, size: 15, opacity: 0.28, drift: 3, phase: 0.9 },
  { name: 'plus', x: 38, y: 82, size: 13, opacity: 0.26, drift: 3, phase: 0.2 },
  { name: 'zigzag', x: 52, y: 95, size: 58, opacity: 0.2, drift: 5, phase: 0.25 },
];

const DRIFT_SECONDS = 16;

/**
 * Drifting field of marks for a gradient panel. Absolutely positioned, so the
 * parent must be `position: relative` — and should clip, since the marks are
 * sized to bleed past the edges.
 */
export default function DoodleField({ spots = AUTH_PANEL_SPOTS, color = '#FFFFFF' }) {
  return (
    <Box
      aria-hidden
      sx={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        color,
        '@keyframes doodleDrift': {
          '0%, 100%': { transform: 'translateY(calc(var(--drift) * -1))' },
          '50%': { transform: 'translateY(var(--drift))' },
        },
        '@keyframes doodleSpin': {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
        '@keyframes doodleTwinkle': {
          '0%, 100%': { transform: 'scale(0.84)' },
          '50%': { transform: 'scale(1.16)' },
        },
      }}
    >
      {spots.map((spot, i) => (
        <Box
          key={`${spot.name}-${i}`}
          sx={{
            position: 'absolute',
            left: `${spot.x}%`,
            top: `${spot.y}%`,
            width: spot.size,
            height: spot.size,
            marginLeft: `${-spot.size / 2}px`,
            marginTop: `${-spot.size / 2}px`,
            opacity: spot.opacity,
            '--drift': `${spot.drift}px`,
            animation: `doodleDrift ${DRIFT_SECONDS}s ease-in-out infinite`,
            // Negative delay starts each mark mid-cycle instead of waiting.
            animationDelay: `${-spot.phase * DRIFT_SECONDS}s`,
            // Drift is pure decoration — the first thing to drop when the OS
            // asks for reduced motion.
            '@media (prefers-reduced-motion: reduce)': {
              animation: 'none',
              '& > *': { animation: 'none' },
            },
          }}
        >
          <Box
            sx={{
              width: '100%',
              height: '100%',
              transform: spot.rotate ? `rotate(${spot.rotate}deg)` : undefined,
              ...(spot.spin && {
                animation: `doodleSpin ${DRIFT_SECONDS * 2}s linear infinite`,
              }),
              ...(spot.twinkle && {
                animation: `doodleTwinkle ${DRIFT_SECONDS / 2}s ease-in-out infinite`,
                animationDelay: `${-spot.phase * DRIFT_SECONDS}s`,
              }),
            }}
          >
            <Doodle
              name={spot.name}
              size="100%"
              weight={spot.weight ?? 0.06}
              sx={{ width: '100%', height: '100%' }}
            />
          </Box>
        </Box>
      ))}
    </Box>
  );
}
