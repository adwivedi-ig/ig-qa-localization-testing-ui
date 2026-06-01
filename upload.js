// Show selected language files as comma-separated list and count
document.getElementById('langFiles').addEventListener('change', function () {
    const files = Array.from(this.files || []);
    const infoDiv = document.getElementById('langFilesInfo');
    if (!infoDiv) {
        return;
    }
    if (!files.length) {
        infoDiv.textContent = '';
        return;
    }
    infoDiv.style.fontWeight = 'bold';
    infoDiv.style.color = '#1a237e';
    infoDiv.textContent = `Selected (${files.length}): ${files.map(f => f.name).join(', ')}`;
});

// Show selected language files with fonts as comma-separated list and count
document.getElementById('langFilesWithFonts').addEventListener('change', function () {
    const files = Array.from(this.files || []);
    const infoDiv = document.getElementById('langFilesWithFontsInfo');
    if (!infoDiv) {
        return;
    }
    if (!files.length) {
        infoDiv.textContent = '';
        return;
    }
    infoDiv.style.fontWeight = 'bold';
    infoDiv.style.color = '#1a237e';
    infoDiv.textContent = `Selected (${files.length}): ${files.map(f => f.name).join(', ')}`;
});

// Show selected font-family file name
document.getElementById('fontFile').addEventListener('change', function () {
    const file = this.files && this.files[0];
    const infoDiv = document.getElementById('fontFileInfo');
    if (!infoDiv) {
        return;
    }
    if (!file) {
        infoDiv.textContent = '';
        return;
    }
    infoDiv.style.fontWeight = 'bold';
    infoDiv.style.color = '#1a237e';
    infoDiv.textContent = `Selected: ${file.name}`;
});

// Handles file uploads and stores them in sessionStorage for in-browser preview only
document.getElementById('uploadForm').addEventListener('submit', async function (e) {
    e.preventDefault();
    const langFiles = document.getElementById('langFiles').files;
    const langFilesWithFonts = document.getElementById('langFilesWithFonts').files;
    const fontFile = document.getElementById('fontFile').files[0];
    const messageDiv = document.getElementById('message');

    messageDiv.textContent = '';
    if (!langFiles.length || !langFilesWithFonts.length || !fontFile) {
        messageDiv.innerHTML = '<span class="error">Please select all required files.</span>';
        return;
    }

    const langFileNames = Array.from(langFiles).map(f => f.name.toLowerCase());
    if (!langFileNames.includes('en.json')) {
        messageDiv.innerHTML = '<span class="error">Please select en.json as one of the Language JSON files.</span>';
        return;
    }
    if (langFiles.length < 2) {
        messageDiv.innerHTML = '<span class="error">Please select at least one language JSON file in addition to en.json.</span>';
        return;
    }

    const langWithFontsNames = Array.from(langFilesWithFonts).map(f => f.name.toLowerCase());
    if (!langWithFontsNames.includes('en.json')) {
        messageDiv.innerHTML = '<span class="error">Please select en.json as one of the Language JSON files with fonts.</span>';
        return;
    }

    // Read and validate language files
    const langFilesArr = [];
    for (const file of langFiles) {
        const content = await file.text();
        try {
            JSON.parse(content);
        } catch (error) {
            messageDiv.innerHTML = `<span class="error">Invalid JSON in Language JSON files: ${file.name}</span>`;
            return;
        }
        langFilesArr.push({ name: file.name, content });
    }

    // Read and validate language files with fonts
    const langFilesWithFontsArr = [];
    for (const file of langFilesWithFonts) {
        const content = await file.text();
        try {
            JSON.parse(content);
        } catch (error) {
            messageDiv.innerHTML = `<span class="error">Invalid JSON in Language JSON files with fonts: ${file.name}</span>`;
            return;
        }
        langFilesWithFontsArr.push({ name: file.name, content });
    }

    // Read and validate font-family file
    const fontContent = await fontFile.text();
    try {
        const fontList = JSON.parse(fontContent);
        if (!Array.isArray(fontList) || fontList.length === 0 || typeof fontList[0] !== 'string') {
            messageDiv.innerHTML = '<span class="error">Please upload a valid Font Family JSON file (array of font names).</span>';
            return;
        }
    } catch (error) {
        messageDiv.innerHTML = '<span class="error">Font Family JSON file is not valid JSON.</span>';
        return;
    }

    sessionStorage.setItem('langFiles', JSON.stringify(langFilesArr));
    sessionStorage.setItem('langFilesWithFonts', JSON.stringify(langFilesWithFontsArr));
    sessionStorage.setItem('fontFiles', JSON.stringify([{ name: fontFile.name, content: fontContent }]));

    messageDiv.innerHTML = '<span class="success">Files uploaded! Redirecting...</span>';
    setTimeout(function () {
        window.location.href = 'preview.html';
    }, 800);
});
