import { Box, Typography } from '@mui/material';

/**
 * The auth flow's headline — a port of the mobile app's, so signing in to the
 * console reads like signing in to the app.
 *
 * The last word or two rides a hand-marker swipe: two stroked passes with round
 * caps, uneven ends, and a lighter second streak. A plain rounded div reads as a
 * chip/badge; the wobble is what makes it look drawn.
 */
export default function AuthHeading({ title, accent, subtitle }) {
  return (
    <Box sx={{ mb: 5 }}>
      <Typography
        variant="h3"
        sx={{
          color: '#111827',
          fontWeight: 850,
          fontSize: { xs: '2.1rem', sm: '2.5rem' },
          letterSpacing: '-0.02em',
          lineHeight: 1.12,
        }}
      >
        {title}
        {accent && (
          <Box
            component="span"
            sx={{
              position: 'relative',
              // inline-block, not inline: an absolutely-positioned child of an
              // inline box is laid out against the font's em box, which sits
              // higher than the text and left the bottom of the word off the
              // swipe. inline-block gives the span a real line-height-tall box
              // for the swipe to fill.
              display: 'inline-block',
              // Own stacking context, so the z-index:-1 swipe lands behind the
              // word rather than behind the page.
              isolation: 'isolate',
              // Clears the swipe's left overshoot (-0.22em ≈ 9px at this size).
              // The swipe's ink now stops at that overshoot and no further —
              // see the cap inset below — so this gap holds for any accent
              // word, not just a short one.
              ml: 2.25,
              // Ink on amber: white over #F59E0B is roughly 2:1 contrast.
              color: '#111827',
              whiteSpace: 'nowrap',
            }}
          >
            {/* A plain div does the stretching, and the SVG fills it at 100%.
                An <svg> is a replaced element: given `height: auto` it takes its
                size from the viewBox's aspect ratio and quietly ignores
                `bottom`, which pinned the swipe to a 5:1 sliver at the top of
                the word instead of covering it. */}
            <Box
              aria-hidden
              sx={{
                position: 'absolute',
                left: '-0.22em',
                right: '-0.22em',
                top: 0,
                bottom: 0,
                zIndex: -1,
                pointerEvents: 'none',
              }}
            >
              <Box
                component="svg"
                viewBox="0 0 100 20"
                preserveAspectRatio="none"
                sx={{
                  width: '100%',
                  height: '100%',
                  display: 'block',
                  // The main pass is thicker than the viewBox, so it bleeds
                  // above and below the word to cover it; without this the SVG
                  // root clips it. Horizontal bleed is handled by the cap inset
                  // below rather than by clipping, so the ends keep their
                  // drawn-by-hand round caps.
                  overflow: 'visible',
                }}
              >
                {/* Endpoints are inset by the cap radius (half the stroke
                    width) so the round caps land *on* the viewBox edges instead
                    of past them.

                    This is load-bearing, and the reason is preserveAspectRatio
                    ="none": it scales x by width/100, so a cap 12 units wide
                    renders 12 × width/100 PIXELS. The bleed therefore grows
                    with the accent word — "back" overhung 19px, "password?"
                    26px, straight into the word before it. Insetting keeps the
                    ink inside the box at every width; nudging the margin only
                    ever fixes the one word it was measured against. */}
                <path
                  d="M12,11 Q50,7 88,13"
                  fill="none"
                  stroke="#F59E0B"
                  strokeWidth="24"
                  strokeLinecap="round"
                  opacity="0.92"
                />
                <path
                  d="M11,4 Q52,8 89,3"
                  fill="none"
                  stroke="#F59E0B"
                  strokeWidth="6"
                  strokeLinecap="round"
                  opacity="0.35"
                />
              </Box>
            </Box>
            {accent}
          </Box>
        )}
      </Typography>

      {subtitle && (
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mt: 2 }}>
          {/* Short brand rule — the drawn tick that ties the copy to the panel. */}
          <Box
            sx={{
              mt: '11px',
              width: 22,
              height: 3,
              borderRadius: 999,
              background: 'linear-gradient(90deg, #2563EB 0%, #38BDF8 100%)',
              flexShrink: 0,
            }}
          />
          <Typography sx={{ color: '#566072', fontSize: '1rem', lineHeight: 1.5 }}>
            {subtitle}
          </Typography>
        </Box>
      )}
    </Box>
  );
}
