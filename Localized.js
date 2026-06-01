(function () {

    // --- Utilities ---

    function getTextWidth(text, fontSizePx, fontFamily) {
        var canvas = getTextWidth._canvas || (getTextWidth._canvas = document.createElement("canvas"));
        var ctx = canvas.getContext("2d");
        ctx.font = fontSizePx + "px " + fontFamily;
        var lines = String(text).split("\n");
        var maxWidth = 0;
        for (var i = 0; i < lines.length; i++) {
            var w = ctx.measureText(lines[i]).width;
            if (w > maxWidth) maxWidth = w;
        }
        return Math.round(maxWidth);
    }

    function convertPxToUnit(pxValue, unit) {
        switch (unit) {
            case "cm": return ((pxValue / 96) * 2.54).toFixed(2) + "cm";
            case "mm": return ((pxValue / 96) * 25.4).toFixed(2) + "mm";
            case "in": return (pxValue / 96).toFixed(2) + "in";
            case "pt": return ((pxValue / 96) * 72).toFixed(2) + "pt";
            default: return pxValue + "px";
        }
    }

    // --- Session storage ---

    function readFilesFromSessionStorage() {
        try {
            var raw = sessionStorage.getItem("langFilesWithFonts");
            if (!raw) return [];
            var parsed = JSON.parse(raw);
            if (!Array.isArray(parsed)) return [];
            return parsed.filter(function (f) {
                return f && typeof f.name === "string" && typeof f.content === "string";
            }).map(function (f) {
                try {
                    return { name: f.name, data: JSON.parse(f.content) };
                } catch (e) {
                    return null;
                }
            }).filter(Boolean);
        } catch (e) {
            return [];
        }
    }

    function getLangCode(fileName) {
        return String(fileName).replace(/\.json$/i, "").toLowerCase();
    }

    // --- Entry helpers ---

    function getEntry(fileData, key) {
        var entry = fileData[key];
        return (entry && typeof entry.text === "string") ? entry : null;
    }

    function entryFontName(entry) {
        return (entry && entry["font-name"]) ? String(entry["font-name"]) : "Arial";
    }

    function entryFontSize(entry) {
        var sz = entry && entry["font-size"];
        if (typeof sz === "number") return sz;
        if (typeof sz === "string" && /^\d+(\.\d+)?$/.test(sz)) return parseFloat(sz);
        return 14;
    }

    function getCommonKeys(enData, langData) {
        return Object.keys(enData).filter(function (k) {
            return Object.prototype.hasOwnProperty.call(langData, k);
        });
    }

    // --- UI helpers ---

    function getTab2Lang() {
        var sel = document.getElementById("tab2LangSelect");
        return sel ? sel.value : "ALL";
    }

    function populateTab2LangDropdown(langCodes) {
        var sel = document.getElementById("tab2LangSelect");
        if (!sel) return;
        var prev = sel.value;
        sel.innerHTML = "";
        var allOpt = document.createElement("option");
        allOpt.value = "ALL";
        allOpt.textContent = "ALL";
        sel.appendChild(allOpt);
        langCodes.forEach(function (code) {
            var opt = document.createElement("option");
            opt.value = code;
            opt.textContent = code.toUpperCase();
            sel.appendChild(opt);
        });
        if (prev && langCodes.indexOf(prev) !== -1) sel.value = prev;
    }

    // --- Block creation ---

    function createTab2Block(key, enEntry, langEntry, unit) {
        var enText = enEntry ? enEntry.text : "";
        var langText = langEntry ? langEntry.text : "";
        var enFont = entryFontName(enEntry);
        var enSize = entryFontSize(enEntry);
        var langFont = entryFontName(langEntry);
        var langSize = entryFontSize(langEntry);

        var enWidth = getTextWidth(enText, enSize, enFont);
        var langWidth = getTextWidth(langText, langSize, langFont);
        var isLangWider = langWidth > enWidth;

        var container = document.createElement("div");
        container.dataset.key = key;
        container.style.marginBottom = "8px";

        var keyLine = document.createElement("div");
        keyLine.textContent = key +
            " [" + convertPxToUnit(enWidth, unit) + " - " + convertPxToUnit(langWidth, unit) + "]" +
            " | font-name: " + langFont + " | font-size: " + langSize;
        keyLine.style.fontWeight = "bold";
        keyLine.style.color = isLangWider ? "red" : "green";
        keyLine.style.whiteSpace = "nowrap";
        container.appendChild(keyLine);

        var enPre = document.createElement("pre");
        enPre.style.margin = "0";
        enPre.style.fontFamily = enFont;
        enPre.style.fontSize = enSize + "px";
        enPre.textContent = "\t" + enText;
        container.appendChild(enPre);

        var langPre = document.createElement("pre");
        langPre.style.margin = "0";
        langPre.style.fontFamily = langFont;
        langPre.style.fontSize = langSize + "px";
        langPre.textContent = "\t" + langText;
        container.appendChild(langPre);

        return container;
    }

    // --- Navigation bar (matches Tab 1 structure) ---

    function buildNavBar(langItems) {
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
        flipBtn.onclick = function () {
            var spin = document.getElementById("spin2");
            if (spin) spin.classList.toggle("horizontal-layout");
        };
        navBar.appendChild(flipBtn);

        langItems.forEach(function (lang) {
            var link = document.createElement("a");
            link.href = "#tab2-lang-section-" + lang.code;
            link.textContent = lang.code.toUpperCase();
            link.style.marginRight = "18px";
            link.style.fontWeight = "bold";
            link.style.color = "#000";
            link.style.cursor = "pointer";
            link.onclick = function (e) {
                e.preventDefault();
                var section = document.getElementById("tab2-lang-section-" + lang.code);
                if (section) section.scrollIntoView({ behavior: "smooth", block: "start" });
            };
            navBar.appendChild(link);
        });

        return navBar;
    }

    function setupScrollSync(navBar, hScrollBar, sectionsWrapper) {
        function syncBar() {
            var spin = document.getElementById("spin2");
            if (spin && spin.classList.contains("horizontal-layout")) {
                hScrollBar.style.display = "block";
                if (hScrollBar.firstChild) hScrollBar.removeChild(hScrollBar.firstChild);
                var inner = document.createElement("div");
                inner.style.width = sectionsWrapper.scrollWidth + "px";
                inner.style.height = "1px";
                hScrollBar.appendChild(inner);
                hScrollBar.scrollLeft = sectionsWrapper.scrollLeft;
            } else {
                hScrollBar.style.display = "none";
            }
        }
        var btn = navBar.querySelector("button");
        if (btn) btn.addEventListener("click", function () { setTimeout(syncBar, 100); });
        hScrollBar.addEventListener("scroll", function () { sectionsWrapper.scrollLeft = hScrollBar.scrollLeft; });
        sectionsWrapper.addEventListener("scroll", function () { hScrollBar.scrollLeft = sectionsWrapper.scrollLeft; });
        setTimeout(syncBar, 100);
    }

    function injectCSS() {
        if (document.getElementById("tab2-layout-css")) return;
        var style = document.createElement("style");
        style.id = "tab2-layout-css";
        style.textContent =
            "#spin2.horizontal-layout #tab2-lang-sections-wrapper{display:flex!important;flex-direction:row;overflow-x:auto;padding-bottom:24px;}" +
            "#spin2.horizontal-layout .tab2-lang-section{white-space:nowrap;}" +
            ".tab2-sep{height:1px;background:#ddd;margin:24px 0;}" +
            "#spin2.horizontal-layout .tab2-sep{height:auto;width:1px;background:#ccc;align-self:stretch;margin:0 16px;flex-shrink:0;}";
        document.head.appendChild(style);
    }

    // --- ALL languages view (only red keys, same as Tab 1 ALL mode) ---

    function renderAll(rootContainer, enData, allLangs, unit) {
        injectCSS();

        var langsWithRed = allLangs.map(function (lang) {
            var redKeys = [];
            getCommonKeys(enData, lang.data).forEach(function (key) {
                var enEntry = getEntry(enData, key);
                var langEntry = getEntry(lang.data, key);
                if (!enEntry || !langEntry) return;
                var enW = getTextWidth(enEntry.text, entryFontSize(enEntry), entryFontName(enEntry));
                var lW = getTextWidth(langEntry.text, entryFontSize(langEntry), entryFontName(langEntry));
                if (lW > enW) redKeys.push(key);
            });
            return redKeys.length ? { code: lang.code, data: lang.data, redKeys: redKeys } : null;
        }).filter(Boolean);

        rootContainer.innerHTML = "";

        if (!langsWithRed.length) {
            rootContainer.textContent = "No width overflows found in any language.";
            return;
        }

        var navBar = buildNavBar(langsWithRed);
        var hScrollBar = document.createElement("div");
        hScrollBar.style.width = "100%";
        hScrollBar.style.overflowX = "auto";
        hScrollBar.style.overflowY = "hidden";
        hScrollBar.style.height = "18px";
        hScrollBar.style.display = "none";
        hScrollBar.style.position = "sticky";
        hScrollBar.style.bottom = "0";
        hScrollBar.style.background = "#f0f0f0";
        hScrollBar.style.zIndex = "5";
        hScrollBar.style.borderTop = "1px solid #ddd";

        rootContainer.appendChild(navBar);

        var wrapper = document.createElement("div");
        wrapper.id = "tab2-lang-sections-wrapper";

        langsWithRed.forEach(function (lang, idx) {
            var section = document.createElement("div");
            section.id = "tab2-lang-section-" + lang.code;
            section.className = "tab2-lang-section";
            section.style.marginBottom = "32px";
            section.style.display = "block";
            section.style.minWidth = "340px";
            section.style.boxSizing = "border-box";
            section.style.verticalAlign = "top";
            section.style.padding = "0 12px";
            section.style.flex = "0 0 auto";

            var anchorSpacer = document.createElement("div");
            anchorSpacer.style.height = "60px";
            anchorSpacer.style.marginTop = "-60px";
            anchorSpacer.style.pointerEvents = "none";
            section.appendChild(anchorSpacer);

            var header = document.createElement("div");
            header.textContent = lang.code.toUpperCase();
            header.style.fontWeight = "bold";
            header.style.fontSize = "26px";
            header.style.color = "#000";
            header.style.margin = "24px 0 4px 0";
            section.appendChild(header);

            lang.redKeys.forEach(function (key, i) {
                var block = createTab2Block(key, getEntry(enData, key), getEntry(lang.data, key), unit);
                if (block.firstChild) {
                    block.firstChild.textContent = (i + 1) + ". " + block.firstChild.textContent;
                }
                section.appendChild(block);
            });

            wrapper.appendChild(section);

            if (idx < langsWithRed.length - 1) {
                var sep = document.createElement("div");
                sep.className = "tab2-sep";
                wrapper.appendChild(sep);
            }
        });

        rootContainer.appendChild(wrapper);
        rootContainer.appendChild(hScrollBar);
        setupScrollSync(navBar, hScrollBar, wrapper);
    }

    // --- Single language view (all keys, same as Tab 1 single lang mode) ---

    function renderSingle(rootContainer, enData, lang, unit) {
        rootContainer.innerHTML = "";
        var keys = getCommonKeys(enData, lang.data);
        if (!keys.length) {
            rootContainer.textContent = "No common keys found between en.json and " + lang.code + ".json";
            return;
        }
        keys.forEach(function (key, i) {
            var block = createTab2Block(key, getEntry(enData, key), getEntry(lang.data, key), unit);
            if (block.firstChild) {
                block.firstChild.textContent = (i + 1) + ". " + block.firstChild.textContent;
            }
            rootContainer.appendChild(block);
        });
    }

    // --- Main render ---

    function render() {
        var rootContainer = document.getElementById("spin2");
        if (!rootContainer) return;

        var files = readFilesFromSessionStorage();
        if (!files.length) {
            rootContainer.textContent = "No language files with fonts found. Please upload files.";
            return;
        }

        var enFile = files.find(function (f) { return getLangCode(f.name) === "en"; });
        if (!enFile) {
            rootContainer.innerHTML = '<span style="color:red;font-weight:bold;">Error: en.json not found in language files with fonts.</span>';
            return;
        }

        var otherFiles = files
            .filter(function (f) { return getLangCode(f.name) !== "en"; })
            .sort(function (a, b) { return getLangCode(a.name).localeCompare(getLangCode(b.name)); });

        var allLangs = otherFiles.map(function (f) {
            return { code: getLangCode(f.name), data: f.data };
        });

        var unit = "px";
        var selectedLang = getTab2Lang();

        if (selectedLang === "ALL") {
            renderAll(rootContainer, enFile.data, allLangs, unit);
        } else {
            var langObj = allLangs.find(function (l) { return l.code === selectedLang; });
            if (!langObj) {
                rootContainer.textContent = "Language not found: " + selectedLang;
                return;
            }
            renderSingle(rootContainer, enFile.data, langObj, unit);
        }
    }

    // --- Initialize ---

    function initialize() {
        var files = readFilesFromSessionStorage();
        var otherFiles = files.filter(function (f) { return getLangCode(f.name) !== "en"; });
        var langCodes = otherFiles
            .map(function (f) { return getLangCode(f.name); })
            .sort();

        populateTab2LangDropdown(langCodes);

        var langSel = document.getElementById("tab2LangSelect");
        if (langSel) langSel.addEventListener("change", render);

        render();
    }

    window.tab2FontsPreview = {
        initialize: initialize,
        renderCurrent: render
    };

})();
