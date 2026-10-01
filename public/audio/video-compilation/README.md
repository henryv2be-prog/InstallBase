# Create-video sound library

Any **`.mp3`** in this folder (including subfolders like `pixabay/`) is offered in the **Create video → Add sound** picker after you deploy.

## Add tracks from Pixabay (recommended)

1. Download royalty-free MP3s from [Pixabay Music](https://pixabay.com/music/) (Pixabay Content License).
2. Commit them here, e.g. `pixabay/motivational-hip-hop.mp3`.
3. Push and let Railway redeploy — no code changes needed.

Use short, URL-safe filenames (`motivational-hip-hop.mp3`). The app derives a display name from the filename (`Motivational Hip Hop`).

## Optional labels (`manifest.json`)

Create `manifest.json` in this folder to override names:

```json
{
  "tracks": {
    "motivational-hip-hop": {
      "label": "Down to business",
      "tag": "Montage",
      "description": "Hype install timelapse"
    }
  }
}
```

The key is the filename **without** `.mp3`.

## Dev-only synthesized beds

`node scripts/generate-compilation-sounds.mjs` recreates the four placeholder beats in the repo root of this folder. Replace them with real Pixabay downloads when you can.
