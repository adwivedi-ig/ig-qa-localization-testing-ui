# Localization Upload & Preview Tool

## Overview
This web application allows you to upload, preview, and verify localization files (JSON) for web applications. It is designed for content managers and developers to ensure localization accuracy before deployment. All processing is done client-side for privacy and security.

## Features
- Upload multiple language JSON files (e.g., en.json, fr.json, etc.)
- Upload a font family JSON file
- Requires at least the English (en.json) file for validation
- Preview and verify localization content with selectable language, font size, unit, and font family
- Responsive, modern UI with clear instructions and error/success messages
- All uploaded files are stored in sessionStorage for the session
- No server-side processing; all logic is client-side

## How to Use
1. **Open `index.html` in your browser.**
2. **Upload Files:**
   - Click the file input for "Language JSON files" and select one or more language files (must include `en.json`).
   - Click the file input for "Font Family JSON file" and select your font family JSON file.
   - Click the "Upload & Continue" button.
3. **Preview & Verify:**
   - After uploading, the UI will transition to a preview area.
   - Use the dropdowns to select language, font size, unit, and font family.
   - The preview area will render the localization content for verification.
4. **Logout/Reset:**
   - Click the "Logout" button to reload the page and clear the session.

## File Requirements
- **Language Files:** Must be valid JSON files. At least `en.json` is required.
- **Font Family File:** Must be a valid JSON file.
- Only JSON files are accepted for upload.

## Security & Privacy
- All processing is done in the browser; no files are sent to a server.
- Uploaded files are stored in `sessionStorage` and cleared on logout or page reload.

## Extending the Tool
- The upload logic is in `upload.js`.
- The preview and rendering logic is in `spin-localization.js`.
- The UI is defined in `index.html`.
- You can add support for more languages or features by extending these scripts.

## Accessibility & Usability
- Responsive design for various screen sizes
- Clear error and success messages for user feedback

---

For more details, see `Implementation_Summary.md`.
