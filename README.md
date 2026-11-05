# Interop Assets

Code builds of the Interop After Effects animations.

## Switching to Minutes — Intro + Loop + Exit

A canvas rebuild of the AE comp "Switching to Minutes - Sequence (Intro + Loop x2 + Exit)" (`Back In Stock.aep` → `02 Switching to Minutes (Screen 10)`), with the loading loop played once instead of twice. It is 750 × 1624 @2x, 60 fps and 218 frames (3.63 s) long:

- **Intro:** f0–71
- **Loading loop:** f72–183, played once
- **Exit:** f184–217. This is the AE exit (master f296–329) moved up to follow the single loop; the cut between them is seamless.

Run `python3 ../.claude/serve.py "$PWD" 8323`, or start "Interop Assets" from `.claude/launch.json`, then open `http://localhost:8323/`.

### Files

- `src/switching-to-minutes.js`: the scene. It has AE's layer stack, parenting, the precomp groups, the luma-matted sheen and the colour-dodge logo, plus a port of the title's letter-ripple expression. Call `createSwitchingToMinutes(canvas)` to get `{ render(t) }`.
- `src/switching-to-minutes.data.js`: every transform keyframe exactly as AE stores it (value, interpolation, temporal ease). This file is generated.
- `src/ae-keys.js`: AE's keyframe interpolation (bezier temporal ease, linear, hold).

### Re-exporting after the comp changes

1. Open `Back In Stock.aep` in AE. Run `tools/export-ae-keys.jsx` (File → Scripts → Run Script File) to write `tools/ae-dump.json`.
2. Run `python3 tools/build-data.py` to regenerate `src/switching-to-minutes.data.js`.
3. To check the result, render frames of the Sequence comp from AE (`CompItem.saveFrameToPng`, named `fNNN.png`). Then run `node tools/compare.mjs <ae-frames> <out>` and diff the two folders.

Measured on 2026-11-05 over 39 frames: the mean difference from AE is 0.30/255. The rest is text antialiasing and the near-lossless photo encode. The dome edge is within 0.12 px of AE on every exit frame.

### Crate image

The crate is no longer the AE photo, cut-out and wordmark layers. It is one image: Figma Inter-OP 507:25598 "Image", 375 × 537 at the foot of the screen (y 275–812), exported @2x (`assets/switching-to-minutes/crate-image@2x.webp`). The image keeps the "Crate reveal" motion and the crate's opacity curve. At rest it matches the Figma export within 0.21/255.

The image's own top fade is baked in red. When you pick another background colour, the code redraws that fade in the new colour.

### Label placement

The label block (title, MINUTES lockup, sparkles) follows Figma Inter-OP 505:25521 "Screen 10" 1:1. That puts it 10 pt (20 px @2x) higher than in the AE comp, applied as one offset on the "Label exit" null. The lockup is drawn at Figma's own SVG origin, without AE's 1.1 px import shift. Against the Figma @2x export, the lockup and sparkles are exact and the title is within 0.3 px.


### Preview controls

The card beside the frame has these controls:
- **Text:** changes the title line.
- **Logo:** swaps the MINUTES lockup for any image (PNG, SVG, …). It fits inside the lockup's 173 × 38.6 pt box like `object-fit: contain` and keeps the lockup's animation.
- **Background:** a hex code box, plus an optional picture that fills the screen like `object-fit: cover`, drawn over the colour.
- **Crate image:** Replace or drop an image to swap the crate; Reset brings back the Figma one.

When the setup isn't the original red ground with the Figma crate, the crate's top fade is cut into its alpha, so it melts into any colour or picture behind it. Nothing you change here is saved; a reload restores the defaults.
