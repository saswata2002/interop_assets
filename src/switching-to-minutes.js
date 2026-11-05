// "Switching to Minutes" — Intro + Loading Loop + Exit, rebuilt in code
// from the After Effects comp of the same name (Back In Stock.aep, folder
// "02 Switching to Minutes (Screen 10)").
//
// The comp is 750 × 1624 at 60 fps; everything here is in those @2x comp
// pixels and the canvas is scaled to whatever it is drawn at. The layer
// stack, parenting, mattes, blend modes and precomp groups are AE's, and
// every animated value is AE's own keyframe (src/switching-to-minutes.data.js)
// played through AE's interpolation (src/ae-keys.js). The one thing AE
// computes rather than keys — the title's per-letter ripple, an expression
// selector — is the same expression, ported below.

import { KEYS } from './switching-to-minutes.data.js';
import { valueAt } from './ae-keys.js';

export const W = 750, H = 1624, FPS = 60;

// ── The sequence ─────────────────────────────────────────────────────
// Intro, the loading loop once, then the exit. Each section is a copy of
// the master comp, so a sequence time maps straight onto the master clock —
// except the exit, which the master only reaches after a second loop
// (master f296): it is pulled forward to follow the first loop at f184.
// The loop is one whole shimmer cycle, so its last frame runs into the
// exit's first the same way it runs into its own repeat.
export const SECTIONS = [
  { id: 'intro', label: 'Intro', from: 0,   frames: 72 },
  { id: 'loop',  label: 'Loop',  from: 72,  frames: 112 },
  { id: 'exit',  label: 'Exit',  from: 184, frames: 34 },
];
export const FRAMES = 218;
export const DURATION = FRAMES / FPS;

const EXIT_PULL = (296 - 184) / FPS;
export function masterTime(t) {
  return t >= 184 / FPS ? t + EXIT_PULL : t;
}

// ── Geometry (the SVGs the shape layers were made from) ──────────────
// AE's "Create Shapes from Vector Layer" puts each shape a fraction of a
// pixel above the SVG: by the fractional part of the SVG's height
// (38.5505 → −0.5505, 19.1814 → −0.1814, 16 → 0). Read off sourceRectAtTime.
const RED = '#D12B28';

const SQUIRCLE = 'M0 16.0373C0 8.47723 0 4.69721 2.3486 2.3486C4.69721 0 8.47723 0 16.0373 0H157.123C164.683 0 168.464 0 170.812 2.3486C173.161 4.69721 173.161 8.47723 173.161 16.0373V22.5133C173.161 30.0733 173.161 33.8533 170.812 36.2019C168.464 38.5505 164.683 38.5505 157.123 38.5505H16.0373C8.47723 38.5505 4.69721 38.5505 2.3486 36.2019C0 33.8533 0 30.0733 0 22.5132V16.0373Z';
const TICKET = 'M167.374 26.8223V10.9468C167.374 9.14338 168.728 7.68078 170.455 7.55298C170.455 4.91179 168.355 2.7534 165.771 2.7534H7.38952C4.80579 2.7534 2.70564 4.92599 2.70564 7.58139C4.41892 7.69499 5.78678 9.15759 5.78678 10.961V26.8365C5.78678 28.6399 4.43273 30.1025 2.70564 30.2303V30.9829C2.70564 33.6383 4.80579 35.7967 7.38952 35.7967H165.771C168.355 35.7967 170.455 33.6241 170.455 30.9687V30.2161C168.742 30.0883 167.374 28.6257 167.374 26.8223Z';
const MINUTES = [
  'M16.623 9.65781H23.2916L25.7279 16.4219L31.9649 9.65781H39.3853L33.9557 28.8911H27.2315L29.9184 19.3605L23.3194 26.204H23.2081L20.4933 19.3605L17.8064 28.8911H11.1935L16.623 9.65781Z',
  'M44.1189 9.65783H50.871L45.4415 28.8911H38.6894L44.1189 9.65783Z',
  'M55.5503 9.65783H61.8708L66.465 18.8443L69.0684 9.65783H75.7648L70.3353 28.8911H64.3211L59.5319 19.334L56.8172 28.8911H50.1208L55.5503 9.65783Z',
  'M76.8474 22.1469C76.8474 21.1541 76.9866 20.0819 77.279 19.0494L79.9938 9.4659H86.8712L84.045 19.4598C83.9058 20.0025 83.8084 20.532 83.8084 20.9688C83.8084 22.5572 84.7968 23.3911 86.5788 23.3911C87.4141 23.3911 88.1937 23.1132 88.7506 22.5969C89.3632 22.0145 89.7669 21.2732 90.1985 19.7907L93.1221 9.4659H99.9995L96.7974 20.7835C96.0735 23.3382 95.0294 25.2046 93.6233 26.5548C91.716 28.3682 88.8341 29.083 85.6182 29.083C79.9242 29.083 76.8613 26.5018 76.8613 22.1601L76.8474 22.1469Z',
  'M107.27 15.0982H101.325L102.857 9.65783H121.512L119.981 15.0982H114.036L110.138 28.8911H103.372L107.27 15.0982Z',
  'M124.462 9.65783H141.712L140.208 14.9393H129.6L129.057 16.8852H138.941L137.632 21.5314H127.748L127.149 23.6228H137.897L136.421 28.8911H119.033L124.462 9.65783Z',
  'M140.527 25.7804L144.398 21.3858C146.709 23.2257 149.075 24.0993 151.219 24.0993C152.082 24.0993 152.695 23.7949 152.695 23.2522C152.695 22.6433 152.319 22.458 149.368 21.4122C145.609 20.0885 143.855 18.831 143.855 15.9983C143.855 12.292 147.433 9.27398 152.96 9.27398C156.565 9.27398 159.781 10.3726 161.967 12.1596L158.097 16.5543C156.565 15.3762 154.393 14.4099 152.263 14.4099C151.4 14.4099 150.788 14.6349 150.788 15.1776C150.788 15.7601 151.219 15.866 154.018 16.8587C157.456 18.0633 159.656 19.4399 159.656 22.3785C159.656 26.2569 156.301 29.275 150.495 29.275C146.486 29.275 142.978 27.8983 140.527 25.7804Z',
].join('');
// The crate: Figma Inter-OP 507:25598 "Image", 375 × 537 at the foot of the
// screen (y 275–812), exported @2x as one flattened picture. It is the
// photo, its cut-out, the dodged wordmark and both top fades in one image,
// so it replaces those four layers and rides the same "Crate reveal" motion.
// Their three opacity curves are identical, so one opacity carries it.
const CRATE = { x: 0, y: 550, w: 750, h: 1074 };     // comp px
const CRATE_REST = [375, 1250];                       // "Crate reveal" at rest
// Its own top fade (Rectangle 1891599166): solid to y 59.42, clear by 125.42
// (pt, in the image). Baked in as red; redrawn in the ground colour otherwise.
const CRATE_FADE = [118.8468, 250.832];

// The label block — title, MINUTES lockup, sparkles — placed 1:1 with Figma
// Inter-OP 505:25521 "Screen 10": group 2147242509 at y 173 pt, title box
// top 195.57, lockup 235.57, sparkles at (82.15, 173) and (274.08, 279.49).
// The AE comp has the block 10 pt lower; every piece moves by the same
// amount, so it is one offset on "Label exit", the null they all hang from.
const LABEL_DY = -20;                                 // comp px (= −10 pt)

// The MINUTES lockup's box (Figma vectors 505:25540/41), in its own @1x units.
const LOCKUP = { w: 173.16070556640625, h: 38.55051803588867 };

const SPARKLE = 'M16.0001 8C8.79126 8.43956 8.43961 8.79121 8.00005 16C7.56048 8.79121 7.20883 8.43956 0 8C7.20883 7.56044 7.56048 7.20879 8.00005 0C8.43961 7.20879 8.79126 7.56044 16.0001 8Z';

// ── The title ────────────────────────────────────────────────────────
// Point text, centre-justified on the layer origin: Noontree Bold 48,
// tracking −10 (‰ of the em). Ink box in layer space per AE's
// sourceRectAtTime: [−135.970, −35.433] 272.622 × 45.729.
const TITLE = 'Switching to';
const FONT = '48px "Noontree"';
const TRACKING = -10 / 1000 * 48;
const INK_LEFT = -135.970413;
// Character anchors: grouping "Character", alignment [0, −50], i.e. each
// letter scales about its own centre, half the ink box up from the baseline.
const LETTER_CY = -35.433105 / 2;
// The sheen is white taken 30 % toward the ground (#F1BFBF on #D12B28),
// so it follows the background colour.
const sheenFor = ([r, g, b]) => `rgb(${[r, g, b].map(v => Math.round(255 * 0.7 + v * 0.3)).join(',')})`;
const rgbOf = hex => [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16));

// The "Shimmer letters (elastic)" expression selector, as written in AE:
// a band crosses the title every 112 f from 1.2 s; each letter springs
// (ω 22, ζ 0.55) as the band's centre reaches it, held 0.22 s, and the
// amount drives Position [0, −2] and Scale 104.2 %.
const RIPPLE = { T0: 1.2, P: 112 / 60, X0: -266, SPD: 830 / (112 / 60), TL: -136, TW: 272.6 };
function spring(t) {
  if (t <= 0) return 0;
  const w = 22, z = 0.55, wd = w * Math.sqrt(1 - z * z);
  return 1 - Math.exp(-z * w * t) * (Math.cos(wd * t) + z * w / wd * Math.sin(wd * t));
}
function rippleAmount(time, index, total, R = RIPPLE) {
  const { T0, P, X0, SPD, TL, TW } = R;
  if (time < T0) return 0;
  const xc = TL + TW * (index - 0.5) / total;
  const ti = (xc - X0) / SPD;
  const u = time - T0 - ti, k = Math.floor((u + 0.35) / P), tau = u - k * P;
  return (spring(tau + 0.12) - spring(tau - 0.10)) / 1.2;
}

// ── Transforms ───────────────────────────────────────────────────────
// AE's 2D layer matrix: translate(position) · rotate · scale · translate(−anchor).
function layerMatrix(tr, t) {
  const a = tr.AnchorPoint ? valueAt(tr.AnchorPoint, t) : [0, 0];
  const p = tr.Position ? valueAt(tr.Position, t)
    : [valueAt(tr.Position_0, t), valueAt(tr.Position_1, t)];
  const s = tr.Scale ? valueAt(tr.Scale, t) : [100, 100];
  const r = tr.RotateZ ? valueAt(tr.RotateZ, t) : 0;
  return new DOMMatrix().translate(p[0], p[1]).rotate(r)
    .scale(s[0] / 100, s[1] / 100).translate(-a[0], -a[1]);
}
const opacity = (tr, t) => (tr.Opacity ? valueAt(tr.Opacity, t) : 100) / 100;

// ── Renderer ─────────────────────────────────────────────────────────
export async function createSwitchingToMinutes(canvas, { assetBase = 'assets/switching-to-minutes/' } = {}) {
  const font = new FontFace('Noontree', `url(${new URL('../fonts/Noontree-Bold.otf', import.meta.url)})`, { weight: '700' });
  document.fonts.add(await font.load());

  const load = src => new Promise((res, rej) => {
    const im = new Image();
    im.onload = () => res(im); im.onerror = rej;
    im.src = assetBase + src;
  });
  const original = await load('crate-image@2x.webp');
  let crate = original;

  const P = {
    squircle: new Path2D(SQUIRCLE), ticket: new Path2D(TICKET), minutes: new Path2D(MINUTES),
    sparkle: new Path2D(SPARKLE),
  };

  const ctx = canvas.getContext('2d');
  // Precomps render into their own buffer and land with one opacity, the way
  // AE composites a precomp layer: overlapping pieces fade as one picture.
  const buffers = [];
  const buffer = i => {
    if (!buffers[i]) buffers[i] = document.createElement('canvas');
    const b = buffers[i];
    if (b.width !== canvas.width || b.height !== canvas.height) { b.width = canvas.width; b.height = canvas.height; }
    const c = b.getContext('2d');
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.globalAlpha = 1; c.globalCompositeOperation = 'source-over';
    c.clearRect(0, 0, b.width, b.height);
    return [b, c];
  };

  // Title layout: per-letter x from the kerned advances of each prefix, so
  // the letters can move one by one without losing the font's kerning. The
  // line is centred on the layer origin; AE's own title also fixes the small
  // offset between a plain centred line and where AE puts its ink, and every
  // other title keeps that same offset.
  ctx.font = FONT;
  const lineWidth = text => ctx.measureText(text).width + TRACKING * Math.max(text.length - 1, 0);
  const CENTER_FIX = INK_LEFT + ctx.measureText(TITLE[0]).actualBoundingBoxLeft + lineWidth(TITLE) / 2;
  function layout(text) {
    const x0 = -lineWidth(text) / 2 + CENTER_FIX;
    const list = [...text].map((ch, i) => {
      const pre = ctx.measureText(text.slice(0, i)).width + TRACKING * i;
      return { ch, x: x0 + pre, cx: x0 + pre + ctx.measureText(ch).width / 2 };
    });
    const m = ctx.measureText(text);
    return { list, inkL: x0 - m.actualBoundingBoxLeft, inkR: x0 + m.actualBoundingBoxRight };
  }
  const ORIGINAL = layout(TITLE);
  let letters, ripple, bandX;
  // Another title stretches the shimmer to its own width: the band's track,
  // the ripple's letter span and its speed all scale about the ink centre,
  // so the sweep crosses any line in the same time. AE's title maps to itself.
  /** Change the title line; "Switching to" is AE's. */
  function setTitle(text) {
    const L = text ? layout(text) : { list: [], inkL: ORIGINAL.inkL, inkR: ORIGINAL.inkR };
    letters = L.list;
    const c0 = (ORIGINAL.inkL + ORIGINAL.inkR) / 2, c1 = (L.inkL + L.inkR) / 2;
    const k = (L.inkR - L.inkL) / (ORIGINAL.inkR - ORIGINAL.inkL) || 1;
    const map = x => c1 + (x - c0) * k;
    bandX = x => map(x) - x;
    ripple = { ...RIPPLE, X0: map(RIPPLE.X0), SPD: RIPPLE.SPD * k, TL: map(RIPPLE.TL), TW: RIPPLE.TW * k };
  }
  setTitle(TITLE);

  // The ground: the comp's background, which the crate's top fade melts into.
  // The ticket keeps its own red.
  let ground = rgbOf(RED);
  let backdrop = null;
  let logo = null;

  const K = KEYS;
  const view = () => new DOMMatrix().scale(canvas.width / W, canvas.height / H);
  const use = (c, m) => c.setTransform(m.a, m.b, m.c, m.d, m.e, m.f);

  function drawTitle(c, m, t, fill) {
    c.font = FONT; c.fillStyle = fill; c.textBaseline = 'alphabetic';
    for (let i = 0; i < letters.length; i++) {
      const l = letters[i];
      if (l.ch === ' ') continue;
      const a = rippleAmount(t, i + 1, letters.length, ripple);
      const s = 1 + 0.042 * a;
      use(c, m.translate(l.cx, LETTER_CY - 2 * a).scale(s, s).translate(-l.cx, -LETTER_CY));
      c.fillText(l.ch, l.x, 0);
    }
  }

  /** Draw sequence time t (seconds, 0 … DURATION). */
  function render(seqTime) {
    const t = masterTime(Math.min(Math.max(seqTime, 0), DURATION - 1e-6));
    const V = view();
    const M = K.main, C = K.crate, T = K.title;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = `rgb(${ground})`;                      // Background #D12B28
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    if (backdrop) {                                        // optional picture over the colour
      use(ctx, V);
      drawCover(ctx, backdrop, { x: 0, y: 0, w: W, h: H });
      ctx.setTransform(1, 0, 0, 1, 0, 0);
    }

    // ── Crate plate (precomp) ──
    {
      const [b, c] = buffer(0);
      const plate = V.multiply(layerMatrix(M['Crate plate (precomp)'], t));
      const nul = plate.multiply(layerMatrix(C['Crate reveal'], t));

      use(c, nul.translate(CRATE.x - CRATE_REST[0], CRATE.y - CRATE_REST[1]));
      c.globalAlpha = opacity(C['Crate photo (15 1)'], t);
      drawCover(c, crate, CRATE, 0, 0);
      // The Figma image already carries this fade in red, which is right on
      // the red ground. On anything else the fade is cut into the crate's own
      // alpha instead, so it melts into whatever is behind — a colour or a
      // picture. Over a solid colour that is the same as painting the fade in it.
      if (crate !== original || backdrop || ground.join() !== rgbOf(RED).join()) {
        const g = c.createLinearGradient(0, CRATE_FADE[0], 0, CRATE_FADE[1]);
        g.addColorStop(0, 'rgba(0,0,0,1)'); g.addColorStop(1, 'rgba(0,0,0,0)');
        c.globalAlpha = 1; c.globalCompositeOperation = 'destination-out';
        c.fillStyle = g; c.fillRect(0, 0, CRATE.w, CRATE_FADE[1]);
        c.globalCompositeOperation = 'source-over';
      }

      ctx.globalAlpha = opacity(M['Crate plate (precomp)'], t);
      ctx.drawImage(b, 0, 0);
      ctx.globalAlpha = 1;
    }

    const label = V.translate(0, LABEL_DY).multiply(layerMatrix(M['Label exit'], t));

    // ── MINUTES lockup (precomp): box + ticket ──
    {
      const [b, c] = buffer(1);
      const m = label.multiply(layerMatrix(M['MINUTES lockup'], t))
        .multiply(layerMatrix(M['MINUTES lockup (precomp)'], t))
        .translate(201.839996, 491.138).scale(2, 2);   // Figma's own SVG origin, without AE's −0.5505 import shift
      use(c, m);
      if (logo) {
        drawContain(c, logo, LOCKUP);
      } else {
        c.fillStyle = '#2A2B2B'; c.fill(P.squircle);
        c.fillStyle = RED; c.fill(P.ticket);
        c.fillStyle = '#fff'; c.fill(P.minutes);
      }
      ctx.globalAlpha = opacity(M['MINUTES lockup (precomp)'], t);
      ctx.drawImage(b, 0, 0);
      ctx.globalAlpha = 1;
    }

    // ── Switching to (precomp): title + its sheen ──
    {
      const [b, c] = buffer(2);
      const pre = label.multiply(layerMatrix(M['Switching to (precomp)'], t));
      const titleM = pre.multiply(layerMatrix(T['Switching to'], t));
      c.globalAlpha = opacity(T['Switching to'], t);
      drawTitle(c, titleM, t, '#fff');

      // Sheen: the same title in #F1BFBF, luma-matted by a 96 × 120 band
      // (black → white → black, 17°) parented to the title.
      const [sb, sc] = buffer(3);
      const sheenM = pre.multiply(layerMatrix(T['Switching to (shimmer sheen)'], t));
      drawTitle(sc, sheenM, t, sheenFor(ground));
      const band = T['Title shimmer band (luma matte)'];
      use(sc, titleM.translate(bandX(valueAt(band.Position_0, t)), 0).multiply(layerMatrix(band, t)));
      const bg = sc.createLinearGradient(0, 0, 96, 0);
      bg.addColorStop(0, 'rgba(0,0,0,0)'); bg.addColorStop(0.5, 'rgba(0,0,0,1)'); bg.addColorStop(1, 'rgba(0,0,0,0)');
      // destination-in also clears everything outside the band: no matte, no sheen.
      sc.globalCompositeOperation = 'destination-in';
      sc.fillStyle = bg; sc.fillRect(0, 0, 96, 120);
      c.setTransform(1, 0, 0, 1, 0, 0);
      c.globalAlpha = opacity(T['Switching to (shimmer sheen)'], t);
      c.drawImage(sb, 0, 0);

      ctx.globalAlpha = opacity(M['Switching to (precomp)'], t);
      ctx.drawImage(b, 0, 0);
      ctx.globalAlpha = 1;
    }

    // ── Sparkles ──
    for (const name of ['Sparkle 1', 'Sparkle 2']) {
      use(ctx, label.multiply(layerMatrix(M[name], t)));
      ctx.globalAlpha = opacity(M[name], t);
      ctx.fillStyle = '#fff'; ctx.fill(P.sparkle);
    }
    ctx.globalAlpha = 1;

    // ── Exit dome: a Ø797.8 circle with a 2400-tall block under its centre ──
    use(ctx, V.multiply(layerMatrix(M['Exit dome'], t)));
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(0, 0, 398.899994, 0, Math.PI * 2);
    ctx.rect(-398.899994, 0, 797.799988, 2400);
    ctx.fill('nonzero');
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }

  /** Change the ground colour (#rrggbb); the comp's own is #D12B28. */
  function setBackground(hex) { ground = rgbOf(hex); }

  // Pictures fill their box the way CSS object-fit: cover would — scaled
  // to cover it, centred, the overflow cropped. Drawn at the box's origin
  // unless told otherwise (the crate is drawn in its own space, at 0, 0).
  function drawCover(c, im, box, x = box.x, y = box.y) {
    const iw = im.naturalWidth || im.width, ih = im.naturalHeight || im.height;
    const s = Math.max(box.w / iw, box.h / ih);
    const sw = box.w / s, sh = box.h / s;
    c.drawImage(im, (iw - sw) / 2, (ih - sh) / 2, sw, sh, x, y, box.w, box.h);
  }

  /** Swap the crate picture (any drawable image); null puts the Figma one back. */
  function setImage(im) { crate = im || original; }

  // A replacement logo fits inside the lockup's box like object-fit:
  // contain — whole, centred, never cropped — and keeps its animation.
  function drawContain(c, im, box) {
    const iw = im.naturalWidth || im.width || box.w, ih = im.naturalHeight || im.height || box.h;
    const s = Math.min(box.w / iw, box.h / ih);
    c.drawImage(im, (box.w - iw * s) / 2, (box.h - ih * s) / 2, iw * s, ih * s);
  }

  /** Swap the MINUTES lockup for any drawable image; null puts the Figma one back. */
  function setLogo(im) { logo = im || null; }

  /** Put a picture behind everything, over the background colour; null removes it. */
  function setBackgroundImage(im) { backdrop = im || null; }

  return { render, setBackground, setBackgroundImage, setImage, setLogo, setTitle };
}
