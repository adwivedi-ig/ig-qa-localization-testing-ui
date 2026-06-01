// Populates the font family dropdown with the given font list.
function populateFontFamilyDropdown(fontList) {
    var select = document.getElementById("fontFamilySelect");
    if (!select) return;
    select.innerHTML = "";
    // Add ALL FONTS option
    var allFontsOption = document.createElement("option");
    allFontsOption.value = "ALL_FONTS";
    allFontsOption.textContent = "ALL FONTS";
    select.appendChild(allFontsOption);
    for (var i = 0; i < fontList.length; i++) {
        var font = fontList[i];
        var option = document.createElement("option");
        option.value = font;
        option.textContent = font;
        select.appendChild(option);
    }
}
// Loads all font names from any uploaded font-family JSON (in-memory only)
function loadJsonFromPath(filePath) {
    if (sessionStorage.getItem('fontFiles')) {
        try {
            const fontFiles = JSON.parse(sessionStorage.getItem('fontFiles'));
            // Try all uploaded font files, return the first valid array of font names
            for (const file of fontFiles) {
                const parsed = JSON.parse(file.content);
                if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === 'string') {
                    return Promise.resolve(parsed);
                }
            }
        } catch (e) {}
    }
    return Promise.reject(new Error('No valid font-family JSON uploaded. Please upload a JSON array of font names.'));
}

// Loads a JSON file from languages (in-memory only)
function loadJson(fileName) {
    if (sessionStorage.getItem('langFiles')) {
        try {
            const langFiles = JSON.parse(sessionStorage.getItem('langFiles'));
            const found = langFiles.find(f => f.name.toLowerCase() === fileName.toLowerCase());
            if (found) {
                return Promise.resolve(JSON.parse(found.content));
            }
        } catch (e) {}
    }
    return Promise.reject(new Error('Language file not found in memory: ' + fileName + '. Please upload all required JSON files.'));
}

// Gets the HTML container element by ID, clears its content, and returns it for rendering.
function getContainer(containerId) {
    var container = document.getElementById(containerId);
    if (!container) {
        return null;
    }

    container.innerHTML = "";
    return container;
}

// Extracts the text value from a locale data object for a given key.
function getTextForKey(localeData, key) {
    var entry = localeData[key];
    if (!entry || typeof entry.text !== "string") {
        return "";
    }

    return entry.text;
}

// Reads the 'key' URL parameter from query string to filter display to a single key.
function getRequestedKey() {
    var params = new URLSearchParams(window.location.search);
    return params.get("key");
}

// Gets the currently selected language from the language dropdown (defaults to 'ar').
function getRequestedLang() {
    var select = document.getElementById("langSelect");
    if (select && select.value) {
        return select.value;
    }
    return "ar";
}

// Discovers available language files by parsing the directory listing of /languages/.
// Works with directory-listing servers (e.g. python -m http.server). Excludes en.json (baseline).
function discoverLanguageFiles() {
    // Check sessionStorage for langFiles
    if (sessionStorage.getItem('langFiles')) {
        try {
            const langFiles = JSON.parse(sessionStorage.getItem('langFiles'));
            // Exclude en.json (baseline)
            const langCodes = langFiles
                .map(f => f.name.replace(/\.json$/i, '').toLowerCase())
                .filter(code => code && code !== 'en');
            langCodes.sort();
            return Promise.resolve(langCodes);
        } catch (e) {}
    }
    return fetch("languages/")
        .then(function (response) {
            if (!response.ok) {
                throw new Error("Cannot list languages folder: " + response.status);
            }
            return response.text();
        })
        .then(function (html) {
            var langCodes = [];
            var seen = {};
            var regex = /href="([^\"]+\.json)"/gi;
            var match;
            while ((match = regex.exec(html)) !== null) {
                var file = match[1].split("/").pop();
                var code = file.replace(/\.json$/i, "").toLowerCase();
                if (code && code !== "en" && !seen[code]) {
                    seen[code] = true;
                    langCodes.push(code);
                }
            }
            langCodes.sort();
            return langCodes;
        });
}

// Populates the language dropdown with the given language codes.
function populateLangDropdown(langCodes) {
    var select = document.getElementById("langSelect");
    if (!select) {
        return;
    }
    select.innerHTML = "";
    // Add ALL option
    var allOption = document.createElement("option");
    allOption.value = "ALL";
    allOption.textContent = "ALL";
    select.appendChild(allOption);
    for (var i = 0; i < langCodes.length; i += 1) {
        var code = langCodes[i];
        var option = document.createElement("option");
        option.value = code;
        option.textContent = code.toUpperCase();
        select.appendChild(option);
    }
}

// Gets the selected font size from the font-size dropdown (defaults to 14px).
function getRequestedFontSize() {
    var select = document.getElementById("fontSizeSelect");
    if (select) {
        var value = parseInt(select.value, 10);
        if (!Number.isNaN(value)) {
            return value;
        }
    }
    return 14;
}

// Gets the selected width unit (px, cm, mm, in, pt). Defaults to 'px'.
function getRequestedUnit() {
    var select = document.getElementById("unitSelect");
    if (select) {
        return select.value;
    }
    return "px";
}

// Converts pixel value to the requested unit. Standard: 96px = 1in, 1in = 2.54cm, 1in = 72pt.
function convertPxToUnit(pxValue, unit) {
    var converted;
    switch (unit) {
        case "cm":
            converted = (pxValue / 96) * 2.54;
            return converted.toFixed(2) + "cm";
        case "mm":
            converted = (pxValue / 96) * 25.4;
            return converted.toFixed(2) + "mm";
        case "in":
            converted = pxValue / 96;
            return converted.toFixed(2) + "in";
        case "pt":
            converted = (pxValue / 96) * 72;
            return converted.toFixed(2) + "pt";
        default:
            return pxValue + "px";
    }
}

// Finds all keys that exist in both English and the selected language JSON files.
function getCommonKeys(enData, langData) {
    var commonKeys = [];
    var enKeys = Object.keys(enData);

    for (var i = 0; i < enKeys.length; i += 1) {
        var key = enKeys[i];
        if (Object.prototype.hasOwnProperty.call(langData, key)) {
            commonKeys.push(key);
        }
    }

    return commonKeys;
}

// Returns rendered text width in pixels at the selected font size (uses longest line for multiline text).
function getRequestedFontFamily() {
    var select = document.getElementById("fontFamilySelect");
    if (select && select.value) {
        return select.value;
    }
    return "Arial";
}

function getTextWidth(text, fontSizePx, fontFamily) {
    var measureCanvas = getTextWidth._canvas || (getTextWidth._canvas = document.createElement("canvas"));
    var context = measureCanvas.getContext("2d");
    context.font = fontSizePx + "px " + fontFamily;

    var lines = String(text).split("\n");
    var maxWidth = 0;

    for (var i = 0; i < lines.length; i += 1) {
        var lineWidth = context.measureText(lines[i]).width;
        if (lineWidth > maxWidth) {
            maxWidth = lineWidth;
        }
    }

    return Math.round(maxWidth);
}

// Creates a runtime DOM block displaying key with width comparison and text values.
// Shows key in green if widths match, red if they differ. Displays [en_width-lang_width] notation in selected unit.
function createRuntimeBlock(key, enText, langText, fontSizePx, unit, fontFamily) {
    var enWidth = getTextWidth(enText, fontSizePx, fontFamily);
    var langWidth = getTextWidth(langText, fontSizePx, fontFamily);
    var isLangWider = enWidth < langWidth;

    var enDisplay = convertPxToUnit(enWidth, unit);
    var langDisplay = convertPxToUnit(langWidth, unit);

    var container = document.createElement("div");
    container.dataset.key = key;
    container.style.marginBottom = "8px";

    var keyLine = document.createElement("div");
    keyLine.textContent = key + " [" + enDisplay + " - " + langDisplay + "]";
    keyLine.style.fontWeight = "bold";

    if (isLangWider) {
        keyLine.style.color = "red";
    } else {
        keyLine.style.color = "green";
    }

    var textBlock = document.createElement("pre");
    textBlock.textContent = "\t" + enText + "\n\t" + langText;
    textBlock.style.margin = "0";
    textBlock.style.fontFamily = fontFamily;
    textBlock.style.fontSize = fontSizePx + "px";

    container.appendChild(keyLine);
    container.appendChild(textBlock);
    return container;
}

// Renders all common keys between English and selected language into the #spin container.
// Displays each key with width comparison and text values for both languages.
function renderMappedKeys(enData, langData, requestedKey, langCode, fontSizePx, unit, fontFamily) {
    var rootContainer = getContainer("spin");

    if (!rootContainer) {
        return;
    }

    rootContainer.style.fontSize = fontSizePx + "px";
    rootContainer.style.fontFamily = fontFamily;

    var keysToRender;
    if (requestedKey && Object.prototype.hasOwnProperty.call(enData, requestedKey) && Object.prototype.hasOwnProperty.call(langData, requestedKey)) {
        keysToRender = [requestedKey];
    } else {
        keysToRender = getCommonKeys(enData, langData);
    }

    if (keysToRender.length === 0) {
        rootContainer.textContent = "No common key found between en.json and " + langCode + ".json";
        return;
    }

    var showNumbering = true;
    for (var i = 0; i < keysToRender.length; i += 1) {
        var key = keysToRender[i];
        var enText = getTextForKey(enData, key);
        var langText = getTextForKey(langData, key);
        var keyBlock = createRuntimeBlock(key, enText, langText, fontSizePx, unit, fontFamily);
        // Always prepend numbering to key header
        if (keyBlock && keyBlock.firstChild && keyBlock.firstChild.nodeType === 1) {
            keyBlock.firstChild.textContent = (i + 1) + ". " + keyBlock.firstChild.textContent;
        }
        rootContainer.appendChild(keyBlock);
    }
}

var enData = null;

// Loads selected language JSON and triggers rendering with English baseline comparison.
function initializeApp(enData) {
    var langCode = getRequestedLang();
    var fontFamily = getRequestedFontFamily();
    var fontSizePx = getRequestedFontSize();
    var unit = getRequestedUnit();
    var requestedKey = getRequestedKey();

    // If ALL FONTS is selected, regardless of language selection, show all keys for all fonts for each language
    if (langCode === "ALL") {
        var rootContainer = getContainer("spin");
        if (!rootContainer) return;
        discoverLanguageFiles().then(function(langCodes) {
            langCodes.sort();
            var langPromises = langCodes.map(function(code) {
                return loadJson(code + ".json").then(function(langData) {
                    return { code: code, data: langData };
                });
            });
            var fontListPromise = (fontFamily === "ALL_FONTS") ? loadJsonFromPath("font-family/fonts.json") : Promise.resolve([fontFamily]);
            Promise.all([fontListPromise].concat(langPromises)).then(function(results) {
                var fontList = results[0];
                if (!Array.isArray(fontList)) fontList = [fontList];
                var allLangs = results.slice(1);
                allLangs.sort(function(a, b) { return a.code.localeCompare(b.code); });
                rootContainer.innerHTML = "";
                // --- Navigation and Flip Layout Bar ---
                var navBar = document.createElement("div");
                navBar.style.position = "sticky";
                navBar.style.top = "0";
                navBar.style.background = "#fff";
                navBar.style.zIndex = "10";
                navBar.style.padding = "8px 0 16px 0";
                navBar.style.marginBottom = "16px";
                navBar.style.borderBottom = "1px solid #222";
                var flipBtn = document.createElement("button");
                flipBtn.textContent = "Flip Layout";
                flipBtn.style.marginRight = "18px";
                flipBtn.style.padding = "4px 12px";
                flipBtn.style.fontWeight = "bold";
                flipBtn.style.fontSize = "14px";
                flipBtn.style.cursor = "pointer";
                flipBtn.style.border = "1px solid #aaa";
                flipBtn.style.background = "#f5f5f5";
                flipBtn.style.borderRadius = "4px";
                flipBtn.onclick = function() {
                    var spin = document.getElementById("spin");
                    if (spin.classList.contains("horizontal-layout")) {
                        spin.classList.remove("horizontal-layout");
                    } else {
                        spin.classList.add("horizontal-layout");
                    }
                };
                navBar.appendChild(flipBtn);
                allLangs.forEach(function(lang, idx) {
                    var link = document.createElement("a");
                    link.href = "#lang-section-" + lang.code;
                    link.textContent = lang.code.toUpperCase();
                    link.style.marginRight = "18px";
                    link.style.fontWeight = "bold";
                    link.style.color = "#000";
                    link.style.cursor = "pointer";
                    link.onclick = function(e) {
                        e.preventDefault();
                        var section = document.getElementById("lang-section-" + lang.code);
                        if (section) section.scrollIntoView({ behavior: "smooth", block: "start" });
                    };
                    navBar.appendChild(link);
                });
                var hScrollBar = document.createElement("div");
                hScrollBar.id = "horizontal-scroll-bar";
                hScrollBar.style.width = "100%";
                hScrollBar.style.overflowX = "auto";
                hScrollBar.style.overflowY = "hidden";
                hScrollBar.style.height = "18px";
                hScrollBar.style.margin = "-8px 0 8px 0";
                hScrollBar.style.display = "none";
                rootContainer.appendChild(navBar);
                rootContainer.appendChild(hScrollBar);
                // --- End Navigation and Flip Layout Bar ---
                var langSectionsWrapper = document.createElement("div");
                langSectionsWrapper.id = "lang-sections-wrapper";
                allLangs.forEach(function(lang, idx) {
                    var langSection = document.createElement("div");
                    langSection.id = "lang-section-" + lang.code;
                    langSection.style.marginBottom = "32px";
                    langSection.style.display = "block";
                    langSection.style.minWidth = "340px";
                    langSection.style.maxWidth = "700px";
                    langSection.style.boxSizing = "border-box";
                    langSection.style.verticalAlign = "top";
                    langSection.style.background = "inherit";
                    langSection.style.padding = "0 12px";
                    langSection.style.flex = "0 0 auto";
                    var langHeader = document.createElement("div");
                    langHeader.textContent = lang.code.toUpperCase();
                    langHeader.style.fontWeight = "bold";
                    langHeader.style.fontSize = (fontSizePx + 12) + "px";
                    langHeader.style.color = "#000";
                    langHeader.style.margin = "24px 0 12px 0";
                    langSection.appendChild(langHeader);
                    var commonKeys = getCommonKeys(enData, lang.data);
                    // For each key, print key header ONCE, then for each font where red, print font label and block
                    commonKeys.forEach(function(key) {
                        var firstRed = true;
                        var redCount = 0;
                        fontList.forEach(function(font) {
                            var enText = getTextForKey(enData, key);
                            var langText = getTextForKey(lang.data, key);
                            var enWidth = getTextWidth(enText, fontSizePx, font);
                            var langWidth = getTextWidth(langText, fontSizePx, font);
                            if (langWidth > enWidth) {
                                if (firstRed) {
                                    var keyHeader = document.createElement("div");
                                    keyHeader.textContent = key;
                                    keyHeader.style.fontWeight = "bold";
                                    keyHeader.style.margin = "12px 0 4px 0";
                                    keyHeader.style.color = "red";
                                    langSection.appendChild(keyHeader);
                                    firstRed = false;
                                }
                                var fontLabel = document.createElement("div");
                                fontLabel.textContent = font;
                                fontLabel.style.fontSize = "12px";
                                fontLabel.style.fontWeight = "bold";
                                fontLabel.style.color = "#555";
                                fontLabel.style.margin = "2px 0 0 8px";
                                langSection.appendChild(fontLabel);
                                langSection.appendChild(createRuntimeBlock(key, enText, langText, fontSizePx, unit, font));
                            }
                        });
                    });
                    langSectionsWrapper.appendChild(langSection);
                });
                rootContainer.appendChild(langSectionsWrapper);
                // --- Sync horizontal scroll bar with langSectionsWrapper in horizontal layout ---
                function syncHorizontalScrollBar() {
                    var spin = document.getElementById("spin");
                    if (spin.classList.contains("horizontal-layout")) {
                        hScrollBar.style.display = "block";
                        hScrollBar.scrollLeft = langSectionsWrapper.scrollLeft;
                        hScrollBar.firstChild && hScrollBar.removeChild(hScrollBar.firstChild);
                        var inner = document.createElement("div");
                        inner.style.width = langSectionsWrapper.scrollWidth + "px";
                        inner.style.height = "1px";
                        hScrollBar.appendChild(inner);
                    } else {
                        hScrollBar.style.display = "none";
                    }
                }
                var flipBtn2 = navBar.querySelector('button');
                if (flipBtn2) {
                    flipBtn2.addEventListener('click', function() {
                        setTimeout(syncHorizontalScrollBar, 100);
                    });
                }
                hScrollBar.addEventListener('scroll', function() {
                    langSectionsWrapper.scrollLeft = hScrollBar.scrollLeft;
                });
                langSectionsWrapper.addEventListener('scroll', function() {
                    hScrollBar.scrollLeft = langSectionsWrapper.scrollLeft;
                });
                setTimeout(syncHorizontalScrollBar, 100);
                (function() {
                    var style = document.createElement('style');
                    style.innerHTML = `
                    #spin.horizontal-layout #lang-sections-wrapper {
                        display: flex !important;
                        flex-direction: row;
                        gap: 24px;
                        overflow-x: auto;
                        padding-bottom: 24px;
                    }
                    #spin.horizontal-layout .lang-section-separator {
                        display: none !important;
                    }
                    `;
                    document.head.appendChild(style);
                })();
            });
        });
        return;
    }
    var langCode = getRequestedLang();
    var fontSizePx = getRequestedFontSize();
    var unit = getRequestedUnit();
    var fontFamily = getRequestedFontFamily();
    var requestedKey = getRequestedKey();
    var rootContainer = getContainer("spin");
    if (langCode === "ALL") {
        // Show all red category details for all languages, grouped by language
        discoverLanguageFiles().then(function(langCodes) {
            langCodes.sort(); // Ensure alphabetical order
            var langPromises = langCodes.map(function(code) {
                return loadJson(code + ".json").then(function(langData) {
                    return { code: code, data: langData };
                });
            });
            Promise.all(langPromises).then(function(allLangs) {
                // Sort allLangs alphabetically by code
                allLangs.sort(function(a, b) { return a.code.localeCompare(b.code); });
                rootContainer.innerHTML = "";
                rootContainer.style.fontFamily = fontFamily;
                var anyRed = false;
                // Filter only languages with red keys
                var langsWithRed = allLangs.map(function(lang) {
                    var redKeys = [];
                    var seenKeys = {};
                    var commonKeys = getCommonKeys(enData, lang.data);
                    for (var i = 0; i < commonKeys.length; i++) {
                        var key = commonKeys[i];
                        if (seenKeys[key]) continue; // Avoid duplicate keys in one language
                        seenKeys[key] = true;
                        var enText = getTextForKey(enData, key);
                        var langText = getTextForKey(lang.data, key);
                        var enWidth = getTextWidth(enText, fontSizePx, fontFamily);
                        var langWidth = getTextWidth(langText, fontSizePx, fontFamily);
                        if (langWidth > enWidth) {
                            redKeys.push({ key: key, enText: enText, langText: langText, enWidth: enWidth, langWidth: langWidth });
                        }
                    }
                    return redKeys.length > 0 ? { code: lang.code, redKeys: redKeys } : null;
                }).filter(Boolean);
                if (langsWithRed.length === 0) {
                    rootContainer.textContent = "No red category (width mismatch) found in any language.";
                    return;
                }
                anyRed = true;
                // Add navigation bar with Flip Layout button
                var navBar = document.createElement("div");
                navBar.style.position = "sticky";
                navBar.style.top = "0";
                navBar.style.background = "#fff";
                navBar.style.zIndex = "10";
                navBar.style.padding = "8px 0 16px 0";
                navBar.style.marginBottom = "16px";
                navBar.style.borderBottom = "1px solid #222";

                // Flip Layout button
                var flipBtn = document.createElement("button");
                flipBtn.textContent = "Flip Layout";
                flipBtn.style.marginRight = "18px";
                flipBtn.style.padding = "4px 12px";
                flipBtn.style.fontWeight = "bold";
                flipBtn.style.fontSize = "14px";
                flipBtn.style.cursor = "pointer";
                flipBtn.style.border = "1px solid #aaa";
                flipBtn.style.background = "#f5f5f5";
                flipBtn.style.borderRadius = "4px";
                flipBtn.onclick = function() {
                    var spin = document.getElementById("spin");
                    if (spin.classList.contains("horizontal-layout")) {
                        spin.classList.remove("horizontal-layout");
                    } else {
                        spin.classList.add("horizontal-layout");
                    }
                };
                navBar.appendChild(flipBtn);

                langsWithRed.forEach(function(lang, idx) {
                    var link = document.createElement("a");
                    link.href = "#lang-section-" + lang.code;
                    link.textContent = lang.code.toUpperCase();
                    link.style.marginRight = "18px";
                    link.style.fontWeight = "bold";
                    link.style.color = "#000";
                    link.style.cursor = "pointer";
                    link.onclick = function(e) {
                        e.preventDefault();
                        var section = document.getElementById("lang-section-" + lang.code);
                        if (section) section.scrollIntoView({ behavior: "smooth", block: "start" });
                    };
                    navBar.appendChild(link);
                });

                // Horizontal scroll bar container
                var hScrollBar = document.createElement("div");
                hScrollBar.id = "horizontal-scroll-bar";
                hScrollBar.style.width = "100%";
                hScrollBar.style.overflowX = "auto";
                hScrollBar.style.overflowY = "hidden";
                hScrollBar.style.height = "18px";
                hScrollBar.style.margin = "-8px 0 8px 0";
                hScrollBar.style.display = "none";
                // This will be shown only in horizontal layout
                rootContainer.appendChild(navBar);
                rootContainer.appendChild(hScrollBar);

                // Container for language sections (for both layouts)
                var langSectionsWrapper = document.createElement("div");
                langSectionsWrapper.id = "lang-sections-wrapper";
                langsWithRed.forEach(function(lang, idx) {
                    var langSection = document.createElement("div");
                    langSection.id = "lang-section-" + lang.code;
                    langSection.style.marginBottom = "32px";
                    langSection.style.display = "block";
                    langSection.style.minWidth = "340px";
                    langSection.style.maxWidth = "500px";
                    langSection.style.boxSizing = "border-box";
                    langSection.style.verticalAlign = "top";
                    langSection.style.background = "inherit";
                    langSection.style.padding = "0 12px";
                    langSection.style.flex = "0 0 auto";
                    // Add an anchor spacer for better scroll alignment
                    var anchorSpacer = document.createElement("div");
                    anchorSpacer.style.height = "60px";
                    anchorSpacer.style.marginTop = "-60px";
                    anchorSpacer.style.pointerEvents = "none";
                    langSection.appendChild(anchorSpacer);
                    var langHeader = document.createElement("div");
                    langHeader.textContent = lang.code.toUpperCase();
                    langHeader.style.fontWeight = "bold";
                    langHeader.style.fontSize = (fontSizePx + 12) + "px";
                    langHeader.style.color = "#000";
                    langHeader.style.margin = "24px 0 12px 0";
                    langSection.appendChild(langHeader);
                    lang.redKeys.forEach(function(item) {
                        langSection.appendChild(createRuntimeBlock(item.key, item.enText, item.langText, fontSizePx, unit, fontFamily));
                    });
                    // Add separator except after last non-empty language section (always show in both layouts)
                    if (idx < langsWithRed.length - 1) {
                        var sep = document.createElement("hr");
                        sep.style.margin = "24px 0";
                        sep.className = "lang-section-separator";
                        langSection.appendChild(sep);
                    }
                    langSectionsWrapper.appendChild(langSection);
                });
                rootContainer.appendChild(langSectionsWrapper);

                // Sync horizontal scroll bar with langSectionsWrapper in horizontal layout
                function syncHorizontalScrollBar() {
                    var spin = document.getElementById("spin");
                    if (spin.classList.contains("horizontal-layout")) {
                        hScrollBar.style.display = "block";
                        hScrollBar.scrollLeft = langSectionsWrapper.scrollLeft;
                        hScrollBar.firstChild && hScrollBar.removeChild(hScrollBar.firstChild);
                        // Add a wide inner div to enable scrolling
                        var inner = document.createElement("div");
                        inner.style.width = langSectionsWrapper.scrollWidth + "px";
                        inner.style.height = "1px";
                        hScrollBar.appendChild(inner);
                    } else {
                        hScrollBar.style.display = "none";
                    }
                }

                // Listen for layout flip
                var flipBtn = navBar.querySelector('button');
                if (flipBtn) {
                    flipBtn.addEventListener('click', function() {
                        setTimeout(syncHorizontalScrollBar, 100);
                    });
                }
                // Sync scroll positions
                hScrollBar.addEventListener('scroll', function() {
                    langSectionsWrapper.scrollLeft = hScrollBar.scrollLeft;
                });
                langSectionsWrapper.addEventListener('scroll', function() {
                    hScrollBar.scrollLeft = langSectionsWrapper.scrollLeft;
                });
                // Initial sync
                setTimeout(syncHorizontalScrollBar, 100);
            // Add CSS for horizontal layout
            (function() {
                var style = document.createElement('style');
                style.innerHTML = `
                #spin.horizontal-layout #lang-sections-wrapper {
                    display: flex !important;
                    flex-direction: row;
                    gap: 24px;
                    overflow-x: auto;
                    padding-bottom: 24px;
                }
                #spin.horizontal-layout .lang-section-separator {
                    display: none !important;
                }
                `;
                document.head.appendChild(style);
            })();
            });
        });
    } else {
        loadJson(langCode + ".json")
            .then(function (langData) {
                renderMappedKeys(enData, langData, requestedKey, langCode, fontSizePx, unit, fontFamily);
            })
            .catch(function (error) {
                if (rootContainer) {
                    rootContainer.textContent = "Unable to load " + langCode + ".json. Make sure the file exists.";
                }
                console.error(error);
            });
    }
}

document.addEventListener("DOMContentLoaded", function () {
    // Debug: Log sessionStorage contents
    try {
        console.log("[DEBUG] sessionStorage.langFiles:", JSON.parse(sessionStorage.getItem('langFiles')));
    } catch (e) { console.log("[DEBUG] No langFiles in sessionStorage"); }
    try {
        console.log("[DEBUG] sessionStorage.fontFiles:", JSON.parse(sessionStorage.getItem('fontFiles')));
    } catch (e) { console.log("[DEBUG] No fontFiles in sessionStorage"); }

    Promise.all([
        loadJson("en.json"),
        discoverLanguageFiles().catch(function () { return []; }),
        loadJsonFromPath("font-family/fonts.json")
    ])
        .then(function (results) {
            enData = results[0];
            var langCodes = results[1];
            var fontList = results[2];

            if (!enData) {
                var rootContainer = getContainer("spin");
                if (rootContainer) {
                    rootContainer.innerHTML = '<span style="color:red;font-weight:bold;">Error: Missing or invalid en.json. Please upload a valid English baseline file.</span>';
                }
                return;
            }
            if (!Array.isArray(fontList) || fontList.length === 0) {
                var rootContainer = getContainer("spin");
                if (rootContainer) {
                    rootContainer.innerHTML = '<span style="color:red;font-weight:bold;">Error: Missing or invalid font-family JSON. Please upload a JSON file containing an array of font names.</span>';
                }
                return;
            }
            if (!langCodes || langCodes.length === 0) {
                var rootContainer = getContainer("spin");
                if (rootContainer) {
                    rootContainer.innerHTML = '<span style="color:red;font-weight:bold;">Error: No language files found (other than en.json). Please upload at least one language JSON file.</span>';
                }
                return;
            }

            populateLangDropdown(langCodes);
            populateFontFamilyDropdown(fontList);
            initializeApp(enData);

            var langSelect = document.getElementById("langSelect");
            if (langSelect) {
                langSelect.addEventListener("change", function () {
                    if (enData) {
                        initializeApp(enData);
                    }
                });
            }

            var fontSizeSelect = document.getElementById("fontSizeSelect");
            if (fontSizeSelect) {
                fontSizeSelect.addEventListener("change", function () {
                    if (enData) {
                        initializeApp(enData);
                    }
                });
            }

            var unitSelect = document.getElementById("unitSelect");
            if (unitSelect) {
                unitSelect.addEventListener("change", function () {
                    if (enData) {
                        initializeApp(enData);
                    }
                });
            }

            var fontFamilySelect = document.getElementById("fontFamilySelect");
            if (fontFamilySelect) {
                fontFamilySelect.addEventListener("change", function () {
                    if (enData) {
                        initializeApp(enData);
                    }
                });
            }
        })
        .catch(function (error) {
            var rootContainer = getContainer("spin");
            if (rootContainer) {
                var msg = error && error.message ? error.message : 'Unable to load required files. Please upload en.json, at least one language JSON, and a valid font-family JSON (array of font names).';
                rootContainer.innerHTML = '<span style="color:red;font-weight:bold;">Error: ' + msg + '</span>';
            }
            console.error(error);
        });
});
