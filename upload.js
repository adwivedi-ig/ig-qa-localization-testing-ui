// Handles file uploads and stores them in sessionStorage for in-browser preview only
document.getElementById('uploadForm').addEventListener('submit', async function (e) {
    e.preventDefault();
    const langFiles = document.getElementById('langFiles').files;
    const fontFile = document.getElementById('fontFile').files[0];
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = '';
    if (!langFiles.length || !fontFile) {
        messageDiv.textContent = 'Please select all required files.';
        return;
    }
    // Read files as text and store in sessionStorage
    const langFilesArr = [];
    for (const file of langFiles) {
        const content = await file.text();
        langFilesArr.push({ name: file.name, content });
    }
    sessionStorage.setItem('langFiles', JSON.stringify(langFilesArr));
    const fontFilesArr = [{ name: fontFile.name, content: await fontFile.text() }];
    sessionStorage.setItem('fontFiles', JSON.stringify(fontFilesArr));
    messageDiv.innerHTML = '<span class="success">Files uploaded! Redirecting...</span>';
    setTimeout(() => { window.location.href = 'preview.html'; }, 800);
});
