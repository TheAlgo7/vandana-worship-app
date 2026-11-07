// Vandana's README pictures, drawn by the README Kit (Work\Playbooks\README Kit\render.py).
// Every wide picture has a "-mobile" twin that the README swaps in on screens up to 600 px.
// The screens come from scripts/readme-shots.py: the live app, phones at 393x852 and 2x, the
// desktop at 1440x900. Type is the app's own: Lora (and its italic) with Plus Jakarta Sans.
const GOLD = '#c4aa7e', INK = '#f3ede3';
const DIM = (at, glow = '#2a2216') => `radial-gradient(760px 620px at ${at}, ${glow} 0%, rgba(10,10,14,0) 70%), #0a0a0e`;
const P = (src, x, y, w, rot = 0, z = 20, glow = null, light = false) =>
  ({ type: 'phone', src, x, y, w, rot, z, glow, bar: true, barBg: light ? '#f3ede3' : '#0a0a0e', barColor: light ? '#1d1a16' : '#f3ede3' });
const panel = (head, sub, items, glow) => ({
  w: 1600, h: 760, bg: DIM('76% 54%', glow), color: INK, accent: GOLD,
  head: { x: 80, y: 200, size: 110, max: 560, lines: head }, sub: { x: 82, width: 500, size: 27, text: sub }, items,
});
const tall = (head, sub, items, h = 1360, glow) => ({
  w: 1080, h, bg: DIM('56% 74%', glow), color: INK, accent: GOLD,
  head: { x: 66, y: 86, size: 130, max: 950, lines: head }, sub: { x: 70, width: 930, size: 36, text: sub }, items,
});

window.README = {
  name: 'Vandana', icon: 'icon.png',
  fonts: {
    head: { family: 'Lora', src: 'assets/fonts/lora.woff2', weight: 500, upper: false, lh: 1.05, tracking: '-0.01em' },
    accent: { family: 'Lora', src: 'assets/fonts/lora-italic.woff2', weight: 500, style: 'italic' },
    body: { family: 'Plus Jakarta Sans', src: 'assets/fonts/plus-jakarta-sans.woff2', weight: 500 },
    brand: { family: 'Lora', src: 'assets/fonts/lora.woff2', weight: 500 },
  },
  layouts: {
    hero: {
      w: 1600, h: 820, bg: DIM('72% 52%'), color: INK, accent: GOLD,
      brand: { x: 84, y: 120, size: 34 },
      head: { x: 80, y: 236, size: 92, max: 600, lines: ['Every song in', 'two scripts,', 'one worship.'] },
      sub: { x: 84, width: 500, size: 27, gap: 34, text: 'Hindi and Hinglish worship lyrics for dim rooms, late prayers and Sundays without WiFi.' },
      items: [P('home.png', 760, 150, 250, -6), P('hindi.png', 1010, 80, 290, 0, 24), P('light.png', 1300, 150, 250, 6, 22, null, true)],
    },
    'hero-mobile': {
      w: 1080, h: 1400, bg: DIM('56% 76%'), color: INK, accent: GOLD,
      brand: { x: 70, y: 70, size: 40 },
      head: { x: 66, y: 190, size: 120, max: 950, lines: ['Every song in', 'two scripts,', 'one worship.'] },
      sub: { x: 70, width: 930, size: 38, text: 'Hindi and Hinglish worship lyrics for dim rooms, late prayers and Sundays without WiFi.' },
      items: [P('home.png', 64, 750, 280, -6), P('hindi.png', 400, 720, 290, 0, 24), P('light.png', 736, 750, 280, 6, 22, null, true)],
    },
    scripts: panel(['Hinglish or Hindi,', 'one tap apart'], 'Every song in both scripts, switched with one tap, with the text size to suit the room.', [
      P('hindi.png', 900, 80, 290, -4, 24), P('song.png', 1220, 110, 280, 5, 22),
    ]),
    'scripts-mobile': tall(['Hinglish or Hindi,', 'one tap apart'], 'Every song in both scripts, switched with one tap, at the size the room needs.', [
      P('hindi.png', 90, 590, 330, -4, 24), P('song.png', 590, 620, 330, 5, 22),
    ]),
    present: panel(['Present mode,', 'setlists for Sunday'], 'Big centred lyrics for the screen at the front, and a setlist in the order you will sing it.', [
      P('present.png', 900, 80, 290, -4, 24), P('setlist.png', 1220, 110, 280, 5, 22),
    ], '#1f1a2a'),
    'present-mobile': tall(['Present mode,', 'setlists for Sunday'], 'Big centred lyrics for the screen at the front, and the setlist in singing order.', [
      P('present.png', 90, 590, 330, -4, 24), P('setlist.png', 590, 620, 330, 5, 22),
    ], 1360, '#1f1a2a'),
    desktop: panel(['On the big screen', 'too'], 'The same library on a laptop: browse on the left, the song in the middle, the details beside it.', [
      { type: 'laptop', src: 'desktop.png', x: 700, y: 120, w: 760 },
      P('home.png', 1300, 230, 220, 5, 24),
    ], '#16202a'),
    'desktop-mobile': tall(['On the big screen', 'too'], 'The same library on a laptop: browse, the song, and its details side by side.', [
      { type: 'laptop', src: 'desktop.png', x: 80, y: 600, w: 840 },
      P('home.png', 760, 760, 230, 5, 24),
    ], 1360, '#16202a'),
  },
};
