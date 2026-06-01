# Localization Upload & Preview Tool

## Overview
A client-side web application for uploading, previewing, and verifying localization JSON files. Designed for content managers and developers to catch width overflows and font rendering issues before deployment. All processing happens in the browser — no server required.

## Project Structure

```
index.html            — Upload page
preview.html          — Preview page (Home + Localized tabs)
upload.js             — File validation and sessionStorage storage
spin-localization.js  — Home tab rendering logic
Localized.js          — Localized tab rendering logic
font-family/          — Font family JSON files
languages/            — Language JSON files
```

## How to Use

### 1. Upload (index.html)
Three file inputs are required:

| Input | Description |
|---|---|
| **Language JSON files** | One or more language files including `en.json` (English baseline) |
| **Language JSON files with fonts** | Same language files but with embedded font metadata per key (`font-name`, `font-size`, `pixel`) |
| **Font Family JSON file** | A JSON array of font name strings, e.g. `["Arial", "Gill Sans"]` |

Click **Upload & Continue** to proceed to the preview.

### 2. Home Tab
- Compares each language against the English baseline (`en.json`)
- Controls: **Lang** (ALL or specific language), **Font Size**, **Unit**, **Font Family**
- **ALL** mode: shows only keys where the translated text is wider than English (red = overflow)
- **Single lang** mode: shows all keys with red/green width indicators
- **Flip Layout** button switches between vertical and horizontal (side-by-side) view
- Language navigation links for quick jumping between sections

### 3. Localized Tab
- Uses the **Language JSON files with fonts** (font metadata embedded per key)
- Compares each language against `en.json` using each entry's own `font-name` and `font-size`
- Controls: **Lang** (ALL or specific language)
- **ALL** mode: shows only languages with at least one width overflow
- **Single lang** mode: shows all common keys with red/green indicators
- Key line format: `KEY [en_width - lang_width] | font-name: X | font-size: Y`
- **Flip Layout** + language navigation same as Home tab
- Sticky footer scroll bar in horizontal layout mode

### 4. Logout
Click **Logout** to clear sessionStorage and return to the upload page.

## File Formats

### Language JSON (with fonts)
```json
{
  "KEY_NAME": {
    "text": "Translated string",
    "font-name": "Gill Sans",
    "font-size": 20,
    "pixel": "px"
  }
}
```

### Language JSON (without fonts)
```json
{
  "KEY_NAME": {
    "text": "Translated string"
  }
}
```

### Font Family JSON
```json
["Arial", "Gill Sans", "Franklin Gothic Medium"]
```

## Width Comparison Logic
- **Red** — the translated text is wider than the English baseline at the given font/size (potential overflow)
- **Green** — the translated text fits within the English baseline width

## Security & Privacy
- No files are sent to any server; all processing is in the browser
- Files are stored in `sessionStorage` and cleared on logout or tab close
