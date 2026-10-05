# EEH spatial models

Eight source-based geometry studies share one mesh between the live GLB viewer and the orthographic drawings. The original Freeze Lab R02 GLB is retained unchanged.

Rebuild from the repository root (Python, NumPy, Pillow):

```sh
python scripts/cad/build_models.py
python scripts/cad/dimensions.py
python scripts/cad/catalog.py
node tests/cad.mjs
```

- Social Value Market: field photos `svm-hall`, `svm-mission`, `svm-booth`, `svm-crates`; three rear panels, three left panels, 8+2 wood bins, START at front left and counter at front right. Lower crate counts and fixture heights obscured in photographs are inferred.
- CSES 2025: separate five-panel proposal, documented 950 × 2370 mm panels; folded arrangement follows the proposal render.
- RECETTE: documented 15000 × 4000 mm facade; depth and furniture details follow source proportions. Original spatial render DITTE; director's recorded scope is booth graphics and ISP.
- King of Kings, Lifemeal Yeonnam, immersive exhibition: original plan proportions; heights are visualization assumptions. NTS.
- Hotel 1997: documented 3030 × 2180 mm lobby wall only; not a whole-venue plan.

Views use +Y up and +Z front. Only original documented dimensions are annotated. No drawing is represented as a field survey or construction approval. The mesh generator is deterministic; no decorative AI image is used as geometric evidence.

`tests/cad.mjs` loads the exported meshes with the real GLTF loader and exercises the viewer with a stub renderer. It checks desktop/mobile orthographic framing, view controls and absence of animation. Embedded bitmap decoding is stubbed. It does not claim browser/WebGL verification.
