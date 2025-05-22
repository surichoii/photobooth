# Virtual PhotoBooth by Suri

A real-time webcam photo booth built with p5.js and ml5.js. Snap four photos with fun filters including black & white, green screen, generative art background, or inverted colors, and export them as a customizable 4-shot collage!

## Features

- Live preview of your webcam feed
- **Five filters**
  - **Black & White** (grayscale)
  - **Green Screen** (replace background color or upload your own image)
  - **Generative Art** (dynamic procedural background behind your silhouette)
  - **Inverted Colors**
  - **None** (original feed)
- 3‑second countdown before each shot
- Automatically snaps four photos in a row
- Custom frame color that allows you to pick a border color for your collage
- Downloadable collage that lets you export all four snapshots as a single PNG
- Allows you to reset & retake new photos

## Technologies

- [p5.js](https://p5js.org/) (core drawing & DOM)
- [p5.dom.js](https://p5js.org/reference/#/libraries/p5.dom) (file inputs & color pickers)
- [ml5.js](https://ml5js.org/) (BodySegmentation for green screen & generative art masking)
- JavaScript 
- HTML/CSS

## Usage

1. **Allow camera access** when prompted.
2. **Choose a filter** by clicking one of the circular buttons:

   * Filters with icons (generative art, invert, none) or colored backgrounds (BW, green).
3. For **green screen**:

   * Pick a replacement color or upload your own image.
4. **Click the camera icon** (📷) to start a 4‑shot session.

   * A 3‑second countdown appears before each photo.
5. **After 4 shots**:

   * Use the **color picker** to select a frame border color.
   * Click the **Download** button (⬇️) to save your collage as `photo_booth_collage.png`.
6. **Retake** anytime by clicking **"Take New Photos!"**

## Customization

* **Swap icons**: replace `camera.png`, `download.png`, `art.png`, `invert.png`, `none.png` in the project folder.
* **Adjust generative art**:

  * Tweak `ranges`, `tSpeed`, and the `colors1`/`colors2` palettes in `sketch.js`.
* **Change fonts & styles**:

  * Modify CSS or calls to `textFont()` and `style()` in `setup()`.

