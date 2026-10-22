let learningHistory = [];
let currentResultData = null;
let recognition = null;
let practiceRecognition = null;
let isListening = false;
let isPracticeListening = false;
let practiceTranscript = "";

// Splash screen dismissal
window.addEventListener('load', () => {
    setTimeout(() => {
        const splash = document.getElementById('splashScreen');
        if (splash) {
            splash.style.opacity = '0';
            splash.style.visibility = 'hidden';
            setTimeout(() => splash.remove(), 800);
        }
    }, 2000);
});

// Dismiss splash on any key or click
document.addEventListener('keydown', dismissSplash);
document.addEventListener('click', dismissSplash);

function dismissSplash() {
    const splash = document.getElementById('splashScreen');
    if (splash && splash.style.opacity !== '0') {
        splash.style.opacity = '0';
        splash.style.visibility = 'hidden';
        setTimeout(() => splash.remove(), 800);
    }
}

// Quick demo function
function demoWord(word) {
    document.getElementById('wordInput').value = word;
    learnWord();
    showToast(`Loading demo: "${word}"...`, 'info');
}

// Comprehensive language list
const allLanguages = [
    { name: "Afrikaans", code: "af-ZA", flag: "🇿🇦" },
    { name: "Albanian", code: "sq-AL", flag: "🇦🇱" },
    { name: "Amharic", code: "am-ET", flag: "🇪🇹" },
    { name: "Arabic", code: "ar-SA", flag: "🇸🇦" },
    { name: "Armenian", code: "hy-AM", flag: "🇦🇲" },
    { name: "Azerbaijani", code: "az-AZ", flag: "🇦🇿" },
    { name: "Basque", code: "eu-ES", flag: "🇪🇸" },
    { name: "Belarusian", code: "be-BY", flag: "🇧🇾" },
    { name: "Bengali", code: "bn-BD", flag: "🇧🇩" },
    { name: "Bosnian", code: "bs-BA", flag: "🇧🇦" },
    { name: "Bulgarian", code: "bg-BG", flag: "🇧🇬" },
    { name: "Catalan", code: "ca-ES", flag: "🇪🇸" },
    { name: "Cebuano", code: "ceb-PH", flag: "🇵🇭" },
    { name: "Chinese", code: "zh-CN", flag: "🇨🇳" },
    { name: "Croatian", code: "hr-HR", flag: "🇭🇷" },
    { name: "Czech", code: "cs-CZ", flag: "🇨🇿" },
    { name: "Danish", code: "da-DK", flag: "🇩🇰" },
    { name: "Dutch", code: "nl-NL", flag: "🇳🇱" },
    { name: "English", code: "en-US", flag: "🇺🇸" },
    { name: "Esperanto", code: "eo", flag: "🏳️" },
    { name: "Estonian", code: "et-EE", flag: "🇪🇪" },
    { name: "Finnish", code: "fi-FI", flag: "🇫🇮" },
    { name: "French", code: "fr-FR", flag: "🇫🇷" },
    { name: "Galician", code: "gl-ES", flag: "🇪🇸" },
    { name: "Georgian", code: "ka-GE", flag: "🇬🇪" },
    { name: "German", code: "de-DE", flag: "🇩🇪" },
    { name: "Greek", code: "el-GR", flag: "🇬🇷" },
    { name: "Gujarati", code: "gu-IN", flag: "🇮🇳" },
    { name: "Haitian Creole", code: "ht-HT", flag: "🇭🇹" },
    { name: "Hausa", code: "ha-NG", flag: "🇳🇬" },
    { name: "Hebrew", code: "he-IL", flag: "🇮🇱" },
    { name: "Hindi", code: "hi-IN", flag: "🇮🇳" },
    { name: "Hmong", code: "hmn", flag: "🏳️" },
    { name: "Hungarian", code: "hu-HU", flag: "🇭🇺" },
    { name: "Icelandic", code: "is-IS", flag: "🇮🇸" },
    { name: "Igbo", code: "ig-NG", flag: "🇳🇬" },
    { name: "Indonesian", code: "id-ID", flag: "🇮🇩" },
    { name: "Irish", code: "ga-IE", flag: "🇮🇪" },
    { name: "Italian", code: "it-IT", flag: "🇮🇹" },
    { name: "Japanese", code: "ja-JP", flag: "🇯🇵" },
    { name: "Javanese", code: "jv-ID", flag: "🇮🇩" },
    { name: "Kannada", code: "kn-IN", flag: "🇮🇳" },
    { name: "Kazakh", code: "kk-KZ", flag: "🇰🇿" },
    { name: "Khmer", code: "km-KH", flag: "🇰🇭" },
    { name: "Korean", code: "ko-KR", flag: "🇰🇷" },
    { name: "Kurdish", code: "ku-TR", flag: "🇹🇷" },
    { name: "Kyrgyz", code: "ky-KG", flag: "🇰🇬" },
    { name: "Lao", code: "lo-LA", flag: "🇱🇦" },
    { name: "Latin", code: "la", flag: "🏛️" },
    { name: "Latvian", code: "lv-LV", flag: "🇱🇻" },
    { name: "Lithuanian", code: "lt-LT", flag: "🇱🇹" },
    { name: "Luxembourgish", code: "lb-LU", flag: "🇱🇺" },
    { name: "Macedonian", code: "mk-MK", flag: "🇲🇰" },
    { name: "Malagasy", code: "mg-MG", flag: "🇲🇬" },
    { name: "Malay", code: "ms-MY", flag: "🇲🇾" },
    { name: "Malayalam", code: "ml-IN", flag: "🇮🇳" },
    { name: "Maltese", code: "mt-MT", flag: "🇲🇹" },
    { name: "Maori", code: "mi-NZ", flag: "🇳🇿" },
    { name: "Marathi", code: "mr-IN", flag: "🇮🇳" },
    { name: "Mongolian", code: "mn-MN", flag: "🇲🇳" },
    { name: "Myanmar", code: "my-MM", flag: "🇲🇲" },
    { name: "Nepali", code: "ne-NP", flag: "🇳🇵" },
    { name: "Norwegian", code: "no-NO", flag: "🇳🇴" },
    { name: "Nyanja", code: "ny-MW", flag: "🇲🇼" },
    { name: "Pashto", code: "ps-AF", flag: "🇦🇫" },
    { name: "Persian", code: "fa-IR", flag: "🇮🇷" },
    { name: "Polish", code: "pl-PL", flag: "🇵🇱" },
    { name: "Portuguese", code: "pt-PT", flag: "🇵🇹" },
    { name: "Punjabi", code: "pa-IN", flag: "🇮🇳" },
    { name: "Romanian", code: "ro-RO", flag: "🇷🇴" },
    { name: "Russian", code: "ru-RU", flag: "🇷🇺" },
    { name: "Samoan", code: "sm-WS", flag: "🇼🇸" },
    { name: "Scottish Gaelic", code: "gd-GB", flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿" },
    { name: "Serbian", code: "sr-RS", flag: "🇷🇸" },
    { name: "Shona", code: "sn-ZW", flag: "🇿🇼" },
    { name: "Sindhi", code: "sd-PK", flag: "🇵🇰" },
    { name: "Sinhala", code: "si-LK", flag: "🇱🇰" },
    { name: "Slovak", code: "sk-SK", flag: "🇸🇰" },
    { name: "Slovenian", code: "sl-SI", flag: "🇸🇮" },
    { name: "Somali", code: "so-SO", flag: "🇸🇴" },
    { name: "Spanish", code: "es-ES", flag: "🇪🇸" },
    { name: "Sundanese", code: "su-ID", flag: "🇮🇩" },
    { name: "Swahili", code: "sw-KE", flag: "🇰🇪" },
    { name: "Swedish", code: "sv-SE", flag: "🇸🇪" },
    { name: "Tagalog", code: "tl-PH", flag: "🇵🇭" },
    { name: "Tajik", code: "tg-TJ", flag: "🇹🇯" },
    { name: "Tamil", code: "ta-IN", flag: "🇮🇳" },
    { name: "Tatar", code: "tt-RU", flag: "🇷🇺" },
    { name: "Telugu", code: "te-IN", flag: "🇮🇳" },
    { name: "Thai", code: "th-TH", flag: "🇹🇭" },
    { name: "Turkish", code: "tr-TR", flag: "🇹🇷" },
    { name: "Turkmen", code: "tk-TM", flag: "🇹🇲" },
    { name: "Ukrainian", code: "uk-UA", flag: "🇺🇦" },
    { name: "Urdu", code: "ur-PK", flag: "🇵🇰" },
    { name: "Uzbek", code: "uz-UZ", flag: "🇺🇿" },
    { name: "Vietnamese", code: "vi-VN", flag: "🇻🇳" },
    { name: "Welsh", code: "cy-GB", flag: "🏴󠁧󠁢󠁷󠁬󠁳󠁿" },
    { name: "Xhosa", code: "xh-ZA", flag: "🇿🇦" },
    { name: "Yiddish", code: "yi", flag: "🏳️" },
    { name: "Yoruba", code: "yo-NG", flag: "🇳🇬" },
    { name: "Zulu", code: "zu-ZA", flag: "🇿🇦" }
];

// Build langCodes from allLanguages
const langCodes = {};
allLanguages.forEach(lang => {
    langCodes[lang.name] = lang.code;
});

// ===== SEARCHABLE DROPDOWN FUNCTIONS =====
let openDropdown = null;

function initSearchableDropdowns() {
    populateOptions('nativeLang');
    populateOptions('targetLang');
    
    // Set initial display values with flags
    const nativeLang = allLanguages.find(l => l.name === document.getElementById('nativeLang').value);
    const targetLang = allLanguages.find(l => l.name === document.getElementById('targetLang').value);
    
    if (nativeLang) {
        document.getElementById('nativeLangInput').value = `${nativeLang.flag} ${nativeLang.name}`;
    }
    if (targetLang) {
        document.getElementById('targetLangInput').value = `${targetLang.flag} ${targetLang.name}`;
    }
    
    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (openDropdown && !e.target.closest(`#${openDropdown}Container`)) {
            closeDropdown(openDropdown);
        }
    });
}

function populateOptions(dropdownId) {
    const container = document.getElementById(`${dropdownId}Options`);
    const currentValue = document.getElementById(dropdownId).value;
    
    container.innerHTML = allLanguages.map(lang => `
        <div class="searchable-option ${lang.name === currentValue ? 'selected' : ''}" 
             onclick="selectLanguage('${dropdownId}', '${lang.name}', '${lang.flag}')"
             data-name="${lang.name.toLowerCase()}">
            <span class="flag">${lang.flag}</span>
            <span class="lang-name">${lang.name}</span>
            <span class="lang-code">${lang.code}</span>
        </div>
    `).join('');
}

function toggleDropdown(dropdownId) {
    const dropdown = document.getElementById(`${dropdownId}Dropdown`);
    
    if (openDropdown && openDropdown !== dropdownId) {
        closeDropdown(openDropdown);
    }
    
    if (dropdown.classList.contains('hidden')) {
        dropdown.classList.remove('hidden');
        openDropdown = dropdownId;
        
        // Focus the filter input
        setTimeout(() => {
            const filter = dropdown.querySelector('.searchable-filter');
            if (filter) {
                filter.value = '';
                filter.focus();
                filterLanguages(dropdownId, '');
            }
        }, 50);
    } else {
        closeDropdown(dropdownId);
    }
}

function closeDropdown(dropdownId) {
    const dropdown = document.getElementById(`${dropdownId}Dropdown`);
    dropdown.classList.add('hidden');
    if (openDropdown === dropdownId) {
        openDropdown = null;
    }
}

function filterLanguages(dropdownId, query) {
    const container = document.getElementById(`${dropdownId}Options`);
    const options = container.querySelectorAll('.searchable-option');
    const lowerQuery = query.toLowerCase();
    
    let hasVisible = false;
    options.forEach(option => {
        const name = option.dataset.name;
        const code = option.querySelector('.lang-code').textContent.toLowerCase();
        const isMatch = name.includes(lowerQuery) || code.includes(lowerQuery);
        
        option.style.display = isMatch ? 'flex' : 'none';
        if (isMatch) hasVisible = true;
    });
    
    // Show/hide no results message
    let noResults = container.querySelector('.no-results');
    if (!hasVisible) {
        if (!noResults) {
            noResults = document.createElement('div');
            noResults.className = 'no-results';
            noResults.textContent = 'No languages found';
            container.appendChild(noResults);
        }
        noResults.style.display = 'block';
    } else if (noResults) {
        noResults.style.display = 'none';
    }
}

function selectLanguage(dropdownId, name, flag) {
    document.getElementById(`${dropdownId}Input`).value = `${flag} ${name}`;
    document.getElementById(dropdownId).value = name;
    closeDropdown(dropdownId);
    
    // Update selected state
    const container = document.getElementById(`${dropdownId}Options`);
    container.querySelectorAll('.searchable-option').forEach(opt => {
        opt.classList.toggle('selected', opt.dataset.name === name.toLowerCase());
    });
}

// Initialize on load
window.addEventListener('load', initSearchableDropdowns);

// Toast notification
function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    const icon = toast.querySelector('.toast-icon');
    const msg = toast.querySelector('.toast-message');
    
    const icons = {
        'info': 'ℹ️',
        'success': '✅',
        'error': '❌',
        'warning': '⚠️'
    };
    
    icon.textContent = icons[type] || icons['info'];
    msg.textContent = message;
    
    toast.classList.remove('hidden');
    setTimeout(() => toast.classList.add('show'), 10);
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.classList.add('hidden'), 500);
    }, 3000);
}

// Initialize speech recognition
function initSpeechRecognition() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        showToast('Speech recognition not supported in your browser', 'warning');
        document.getElementById('micBtn').style.display = 'none';
        return null;
    }
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const rec = new SpeechRecognition();
    rec.continuous = false;
    rec.interimResults = true;
    rec.maxAlternatives = 1;
    
    rec.onresult = function(event) {
        let finalTranscript = '';
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
                finalTranscript += transcript;
            } else {
                interimTranscript += transcript;
            }
        }
        
        if (finalTranscript) {
            document.getElementById('wordInput').value = finalTranscript.trim();
            stopVoiceInput();
            setTimeout(() => learnWord(), 500);
        } else if (interimTranscript) {
            document.getElementById('wordInput').value = interimTranscript.trim();
        }
    };
    
    rec.onerror = function(event) {
        console.error('Speech recognition error:', event.error);
        stopVoiceInput();
        if (event.error === 'not-allowed') {
            showToast('Microphone access denied', 'error');
        }
    };
    
    rec.onend = function() {
        stopVoiceInput();
    };
    
    return rec;
}

function toggleVoiceInput() {
    if (!recognition) {
        recognition = initSpeechRecognition();
        if (!recognition) return;
    }
    
    if (isListening) {
        stopVoiceInput();
    } else {
        startVoiceInput();
    }
}

function startVoiceInput() {
    const nativeLang = document.getElementById('nativeLang').value;
    recognition.lang = langCodes[nativeLang] || 'en-US';
    
    try {
        recognition.start();
        isListening = true;
        document.getElementById('micBtn').classList.add('listening');
        document.getElementById('voiceStatus').classList.remove('hidden');
        document.getElementById('wordInput').placeholder = "Listening...";
    } catch (e) {
        console.error('Failed to start recognition:', e);
    }
}

function stopVoiceInput() {
    if (recognition) {
        try { recognition.stop(); } catch (e) {}
    }
    isListening = false;
    document.getElementById('micBtn').classList.remove('listening');
    document.getElementById('voiceStatus').classList.add('hidden');
    document.getElementById('wordInput').placeholder = "Type a word or phrase to learn...";
}

// Text-to-Speech
function speakText(text, lang) {
    if (!('speechSynthesis' in window)) {
        showToast('Speech synthesis not supported', 'warning');
        return;
    }
    
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = langCodes[lang] || 'en-US';
    utterance.rate = 0.85;
    utterance.pitch = 1;
    
    const voices = window.speechSynthesis.getVoices();
    const langCode = langCodes[lang] || 'en-US';
    const voice = voices.find(v => v.lang.startsWith(langCode.split('-')[0]));
    if (voice) utterance.voice = voice;
    
    window.speechSynthesis.speak(utterance);
}

function speakTranslation() {
    if (currentResultData?.translation) {
        const targetLang = document.getElementById('targetLang').value;
        speakText(currentResultData.translation, targetLang);
    }
}

function speakExample() {
    if (currentResultData?.example_sentence) {
        const targetLang = document.getElementById('targetLang').value;
        speakText(currentResultData.example_sentence, targetLang);
    }
}

// Pronunciation Practice
function listenAndPractice() {
    if (!currentResultData) return;
    
    const targetLang = document.getElementById('targetLang').value;
    const textToSpeak = currentResultData.translation || currentResultData.word;
    
    const statusEl = document.getElementById('practiceStatus');
    statusEl.textContent = "👂 Listen carefully...";
    statusEl.classList.remove('hidden');
    
    speakText(textToSpeak, targetLang);
    
    setTimeout(() => {
        statusEl.textContent = "Now click '🎤 Record' and say it!";
    }, 2000);
}

function initPracticeRecognition() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        showToast('Speech recognition not supported', 'warning');
        return null;
    }
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const rec = new SpeechRecognition();
    rec.continuous = false;
    rec.interimResults = true;
    rec.maxAlternatives = 3;
    
    rec.onresult = function(event) {
        let finalTranscript = '';
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
                finalTranscript += transcript;
            } else {
                interimTranscript += transcript;
            }
        }
        
        if (finalTranscript) {
            practiceTranscript = finalTranscript.trim().toLowerCase();
            const transcriptEl = document.getElementById('practiceTranscript');
            transcriptEl.textContent = `You said: "${practiceTranscript}"`;
            transcriptEl.classList.remove('hidden');
            stopPracticeRecording();
        } else if (interimTranscript) {
            document.getElementById('practiceStatus').textContent = `Hearing: ${interimTranscript}`;
        }
    };
    
    rec.onerror = function(event) {
        console.error('Practice recognition error:', event.error);
        stopPracticeRecording();
    };
    
    rec.onend = function() {
        stopPracticeRecording();
    };
    
    return rec;
}

function togglePracticeRecording() {
    if (!practiceRecognition) {
        practiceRecognition = initPracticeRecognition();
        if (!practiceRecognition) return;
    }
    
    if (isPracticeListening) {
        stopPracticeRecording();
    } else {
        startPracticeRecording();
    }
}

function startPracticeRecording() {
    const targetLang = document.getElementById('targetLang').value;
    practiceRecognition.lang = langCodes[targetLang] || 'en-US';
    practiceTranscript = "";
    
    try {
        practiceRecognition.start();
        isPracticeListening = true;
        document.getElementById('recordBtn').classList.add('recording');
        document.getElementById('practiceStatus').textContent = "🎤 Recording... Say the word!";
        document.getElementById('practiceStatus').classList.remove('hidden');
        document.getElementById('practiceResult').classList.add('hidden');
        document.getElementById('practiceTranscript').classList.add('hidden');
    } catch (e) {
        console.error('Failed to start practice recording:', e);
    }
}

function stopPracticeRecording() {
    if (practiceRecognition) {
        try { practiceRecognition.stop(); } catch (e) {}
    }
    isPracticeListening = false;
    document.getElementById('recordBtn').classList.remove('recording');
    document.getElementById('practiceStatus').textContent = "Recording complete. Click '✅ Check' to see how you did!";
}

function checkPronunciation() {
    if (!currentResultData) {
        showToast('Learn a word first before practicing!', 'warning');
        return;
    }
    
    if (!practiceTranscript) {
        showToast('Please record yourself first!', 'warning');
        return;
    }
    
    const expected = (currentResultData.translation || currentResultData.word).toLowerCase().trim();
    const spoken = practiceTranscript.toLowerCase().trim();
    const similarity = calculateSimilarity(expected, spoken);
    
    const resultDiv = document.getElementById('practiceResult');
    resultDiv.classList.remove('hidden');
    
    if (similarity >= 0.8) {
        resultDiv.innerHTML = `
            <div class="feedback excellent">
                <span class="feedback-icon">🎯</span>
                <span class="feedback-text">Perfect! Excellent pronunciation!</span>
                <div class="feedback-score">${Math.round(similarity * 100)}%</div>
            </div>
        `;
        showToast('Excellent pronunciation!', 'success');
    } else if (similarity >= 0.5) {
        resultDiv.innerHTML = `
            <div class="feedback good">
                <span class="feedback-icon">👍</span>
                <span class="feedback-text">Good try! Getting closer.</span>
                <div class="feedback-score">${Math.round(similarity * 100)}%</div>
                <div class="feedback-hint">Expected: "${expected}"</div>
            </div>
        `;
    } else {
        resultDiv.innerHTML = `
            <div class="feedback needs-work">
                <span class="feedback-icon">💪</span>
                <span class="feedback-text">Keep practicing! Listen and try again.</span>
                <div class="feedback-score">${Math.round(similarity * 100)}%</div>
                <div class="feedback-hint">Expected: "${expected}" | You said: "${spoken}"</div>
            </div>
        `;
    }
}

function calculateSimilarity(str1, str2) {
    const len1 = str1.length;
    const len2 = str2.length;
    
    if (len1 === 0 && len2 === 0) return 1;
    if (len1 === 0 || len2 === 0) return 0;
    
    if (str1.includes(str2) || str2.includes(str1)) {
        const longer = str1.length > str2.length ? str1 : str2;
        const shorter = str1.length > str2.length ? str2 : str1;
        return shorter.length / longer.length;
    }
    
    const matrix = [];
    for (let i = 0; i <= len2; i++) {
        matrix[i] = [i];
    }
    for (let j = 0; j <= len1; j++) {
        matrix[0][j] = j;
    }
    
    for (let i = 1; i <= len2; i++) {
        for (let j = 1; j <= len1; j++) {
            if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j] + 1
                );
            }
        }
    }
    
    const distance = matrix[len2][len1];
    const maxLen = Math.max(len1, len2);
    return 1 - distance / maxLen;
}

// Main learning function
async function learnWord() {
    const word = document.getElementById('wordInput').value.trim();
    if (!word) {
        showToast('Please enter a word or phrase', 'warning');
        return;
    }
    
    const nativeLang = document.getElementById('nativeLang').value;
    const targetLang = document.getElementById('targetLang').value;
    const includeExamples = document.getElementById('includeExamples').checked;
    const includeImages = document.getElementById('includeImages').checked;
    
    const resultDiv = document.getElementById('result');
    resultDiv.classList.remove('hidden');
    resultDiv.innerHTML = `
        <div class="loading">
            <div class="loading-spinner"></div>
            <div>Learning...</div>
        </div>
    `;
    
    try {
        const response = await fetch('/api/learning/learn', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                native_language: nativeLang,
                target_language: targetLang,
                word_or_phrase: word,
                include_examples: includeExamples,
                include_image: includeImages
            })
        });
        
        const text = await response.text();
        let data;
        try {
            data = JSON.parse(text);
        } catch (parseErr) {
            resultDiv.innerHTML = `<div class="error">Server error:<br><pre>${text.substring(0, 500)}</pre></div>`;
            return;
        }
        
        if (data.success) {
            displayResult(data.data);
            addToHistory(word, data.data.translation);
            showToast('Word learned successfully!', 'success');
        } else {
            resultDiv.innerHTML = `<div class="error">Error: ${data.error || 'Unknown error'}</div>`;
            showToast(data.error || 'Something went wrong', 'error');
        }
    } catch (error) {
        resultDiv.innerHTML = `<div class="error">Network Error: ${error.message}</div>`;
        showToast('Network error. Please try again.', 'error');
    }
}

function displayResult(data) {
    currentResultData = data;
    const resultDiv = document.getElementById('result');
    
    let examplesHtml = '';
    if (data.example_sentence) {
        examplesHtml = `
            <div class="examples-section">
                <h3>Example</h3>
                <div class="example-sentence">${data.example_sentence}</div>
                <div class="example-translation">${data.example_translation}</div>
                <button class="speak-btn small" onclick="speakExample()" title="Listen to example">🔊</button>
            </div>
        `;
    }
    
    let imageHtml = '';
    if (data.image_url) {
        const urls = data.image_urls || [data.image_url];
        const imgId = 'wordImage_' + Date.now();
        const sectionId = 'imageSection_' + Date.now();
        imageHtml = `
            <div class="image-section" id="${sectionId}">
                <h3>Visual</h3>
                <img id="${imgId}" src="${urls[0]}" alt="${data.word}" style="max-width:100%;border-radius:12px;min-height:200px;object-fit:cover;">
            </div>
        `;
        setTimeout(() => {
            const img = document.getElementById(imgId);
            const section = document.getElementById(sectionId);
            if (img && section) {
                let currentIndex = 0;
                img.onerror = function() {
                    currentIndex++;
                    if (currentIndex < urls.length) {
                        img.src = urls[currentIndex];
                    } else {
                        section.style.display = 'none';
                    }
                };
                img.onload = function() {
                    img.style.display = 'block';
                };
            }
        }, 0);
    }
    
    resultDiv.innerHTML = `
        <div class="word-display">
            <h2>${data.word}</h2>
            <div class="pronunciation-guide">
                📢 ${data.pronunciation_guide || 'Click speaker to hear'}
            </div>
        </div>
        
        <div class="translation-section">
            <div class="translation-text">
                <strong>Translation:</strong> ${data.translation}
            </div>
            <button class="speak-btn" onclick="speakTranslation()" title="Listen to pronunciation">🔊</button>
        </div>
        
        ${examplesHtml}
        ${imageHtml}
        
        <div class="practice-card glass-card">
            <h3>🎯 Pronunciation Practice</h3>
            <div class="practice-controls">
                <button onclick="listenAndPractice()" class="practice-btn listen-btn">👂 Listen</button>
                <button id="recordBtn" onclick="togglePracticeRecording()" class="practice-btn record-btn">🎤 Record</button>
                <button onclick="checkPronunciation()" class="practice-btn check-btn">✅ Check</button>
            </div>
            <div id="practiceStatus" class="practice-status hidden"></div>
            <div id="practiceResult" class="practice-result hidden"></div>
            <div id="practiceTranscript" class="practice-transcript hidden"></div>
        </div>
        
        <div class="conversation-card glass-card">
            <h3>💬 Conversation Simulator</h3>
            <p class="conversation-subtitle">Practice using "${data.word}" in a real conversation</p>
            <div class="conversation-controls">
                <button onclick="startConversation()" class="practice-btn listen-btn">🚀 Start Conversation</button>
            </div>
            <div id="conversationArea" class="conversation-area hidden">
                <div class="conversation-scenario" id="conversationScenario"></div>
                <div class="conversation-messages" id="conversationMessages"></div>
                <div class="conversation-input-area">
                    <input type="text" id="conversationInput" placeholder="Type your response..." onkeypress="if(event.key==='Enter') sendConversationMessage()">
                    <button onclick="sendConversationMessage()" class="send-btn">➤</button>
                </div>
            </div>
        </div>
    `;
    
    resultDiv.classList.remove('hidden');
}

function addToHistory(word, translation) {
    learningHistory.unshift({ word, translation, timestamp: new Date() });
    if (learningHistory.length > 10) learningHistory.pop();
    
    const historyList = document.getElementById('historyList');
    historyList.innerHTML = learningHistory.map(item => 
        `<li onclick="relearnWord('${item.word}')">
            <div>
                <strong>${item.word}</strong> → ${item.translation}
            </div>
            <small>${new Date(item.timestamp).toLocaleTimeString()}</small>
        </li>`
    ).join('');
}

function relearnWord(word) {
    document.getElementById('wordInput').value = word;
    learnWord();
}

async function generateQuiz() {
    if (learningHistory.length === 0) {
        showToast('Learn some words first!', 'warning');
        return;
    }
    
    const vocabulary = learningHistory.map(item => item.word);
    const nativeLang = document.getElementById('nativeLang').value;
    const targetLang = document.getElementById('targetLang').value;
    
    const quizContainer = document.getElementById('quizContainer');
    quizContainer.innerHTML = `
        <div class="loading">
            <div class="loading-spinner"></div>
            <div>Generating quiz...</div>
        </div>
    `;
    
    try {
        const response = await fetch('/api/learning/quiz/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                vocabulary: vocabulary,
                native_language: nativeLang,
                target_language: targetLang
            })
        });
        
        const data = await response.json();
        
        if (data.success && data.quiz && data.quiz.questions && data.quiz.questions.length > 0) {
            displayQuiz(data.quiz.questions);
        } else {
            const errorMsg = data.error || 'No questions generated. Try learning more words first!';
            quizContainer.innerHTML = `<div class="error">${errorMsg}</div>`;
        }
    } catch (error) {
        quizContainer.innerHTML = `<div class="error">Error: ${error.message}</div>`;
    }
}

function displayQuiz(questions) {
    const quizContainer = document.getElementById('quizContainer');
    
    let quizHtml = '<div class="quiz">';
    questions.forEach((q, index) => {
        quizHtml += `
            <div class="quiz-question" data-question="${index}">
                <p><strong>${index + 1}. ${q.question}</strong></p>
                <div class="quiz-options">
                    ${q.options.map((opt, optIndex) => `
                        <div class="quiz-option" onclick="checkAnswer(${index}, ${optIndex}, ${q.correct})" data-index="${optIndex}">
                            ${opt}
                        </div>
                    `).join('')}
                </div>
                <div class="quiz-explanation hidden"></div>
            </div>
        `;
    });
    quizHtml += '</div>';
    
    quizContainer.innerHTML = quizHtml;
}

function checkAnswer(questionIndex, selectedIndex, correctIndex) {
    const questionDiv = document.querySelector(`.quiz-question[data-question="${questionIndex}"]`);
    const options = questionDiv.querySelectorAll('.quiz-option');
    const explanationDiv = questionDiv.querySelector('.quiz-explanation');
    
    // Disable all options
    options.forEach(opt => {
        opt.style.pointerEvents = 'none';
        opt.style.opacity = '0.7';
    });
    
    // Highlight correct and wrong
    options[correctIndex].classList.add('correct');
    options[correctIndex].style.opacity = '1';
    
    if (selectedIndex !== correctIndex) {
        options[selectedIndex].classList.add('wrong');
        options[selectedIndex].style.opacity = '1';
        explanationDiv.innerHTML = '<span class="incorrect-text">❌ Incorrect. Try again next time!</span>';
    } else {
        explanationDiv.innerHTML = '<span class="correct-text">✅ Correct! Well done!</span>';
        showToast('Correct! 🎉', 'success');
    }
    
    explanationDiv.classList.remove('hidden');
}

// ===== CONVERSATION SIMULATOR =====
let conversationHistory = [];
let isConversationActive = false;

async function startConversation() {
    if (!currentResultData) return;
    
    const targetLang = document.getElementById('targetLang').value;
    const nativeLang = document.getElementById('nativeLang').value;
    
    const conversationArea = document.getElementById('conversationArea');
    const messagesDiv = document.getElementById('conversationMessages');
    const scenarioDiv = document.getElementById('conversationScenario');
    
    conversationArea.classList.remove('hidden');
    messagesDiv.innerHTML = '<div class="loading"><div class="loading-spinner"></div><div>Starting conversation...</div></div>';
    scenarioDiv.textContent = '';
    conversationHistory = [];
    
    try {
        const response = await fetch('/api/conversation/start', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                word: currentResultData.word,
                target_language: targetLang,
                native_language: nativeLang
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            isConversationActive = true;
            
            if (data.scenario) {
                scenarioDiv.innerHTML = `<div class="scenario-badge">📍 ${data.scenario}</div>`;
            }
            
            messagesDiv.innerHTML = '';
            addMessageToConversation(data.ai_message, false, data.translation);
            
            // Auto-speak the opening message
            speakText(data.ai_message, targetLang);
        } else {
            messagesDiv.innerHTML = `<div class="error">${data.error || 'Failed to start conversation'}</div>`;
        }
    } catch (error) {
        messagesDiv.innerHTML = `<div class="error">Error: ${error.message}</div>`;
    }
}

async function sendConversationMessage() {
    const input = document.getElementById('conversationInput');
    const message = input.value.trim();
    
    if (!message || !isConversationActive) return;
    
    const targetLang = document.getElementById('targetLang').value;
    const nativeLang = document.getElementById('nativeLang').value;
    
    // Add user message
    addMessageToConversation(message, true);
    input.value = '';
    
    // Add loading indicator
    const messagesDiv = document.getElementById('conversationMessages');
    const loadingId = 'loading_' + Date.now();
    messagesDiv.innerHTML += `<div class="message ai-message" id="${loadingId}">
        <div class="message-bubble">
            <div class="typing-indicator"><span></span><span></span><span></span></div>
        </div>
    </div>`;
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
    
    try {
        const response = await fetch('/api/conversation/continue', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                word: currentResultData.word,
                target_language: targetLang,
                native_language: nativeLang,
                user_message: message,
                conversation_history: conversationHistory
            })
        });
        
        const data = await response.json();
        
        // Remove loading
        document.getElementById(loadingId).remove();
        
        if (data.success) {
            addMessageToConversation(data.ai_message, false, data.translation);
            speakText(data.ai_message, targetLang);
        } else {
            addMessageToConversation("Sorry, I didn't catch that. Could you try again?", false, "Error response");
        }
    } catch (error) {
        document.getElementById(loadingId).remove();
        addMessageToConversation("Sorry, I didn't catch that. Could you try again?", false, "Error response");
    }
}

function addMessageToConversation(text, isUser, translation = null) {
    const messagesDiv = document.getElementById('conversationMessages');
    const messageClass = isUser ? 'user-message' : 'ai-message';
    
    let translationHtml = '';
    if (translation && !isUser) {
        translationHtml = `<div class="message-translation">${translation}</div>`;
    }
    
    messagesDiv.innerHTML += `
        <div class="message ${messageClass}">
            <div class="message-bubble">
                ${text}
                ${translationHtml}
            </div>
        </div>
    `;
    
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
    
    conversationHistory.push({
        text: text,
        is_user: isUser,
        translation: translation
    });
}

// ===== IMAGE TRANSLATION =====
function handleDragOver(e) {
    e.preventDefault();
    e.currentTarget.classList.add('drag-over');
}

function handleDragLeave(e) {
    e.currentTarget.classList.remove('drag-over');
}

function handleDrop(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        processImageFile(files[0]);
    }
}

function handleImageUpload(e) {
    const file = e.target.files[0];
    if (file) {
        processImageFile(file);
    }
}

async function processImageFile(file) {
    const resultDiv = document.getElementById('imageResult');
    const targetLang = document.getElementById('targetLang').value;
    const nativeLang = document.getElementById('nativeLang').value;
    
    resultDiv.classList.remove('hidden');
    resultDiv.innerHTML = `
        <div class="loading">
            <div class="loading-spinner"></div>
            <div>Analyzing image...</div>
        </div>
    `;
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('target_language', targetLang);
    formData.append('native_language', nativeLang);
    
    try {
        const response = await fetch('/api/image/translate', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (data.success && data.objects && data.objects.length > 0) {
            let objectsHtml = data.objects.map(obj => `
                <div class="object-card">
                    <div class="object-name">${obj.name}</div>
                    <div class="object-translation">${obj.translation}</div>
                    ${obj.description ? `<div class="object-desc">${obj.description}</div>` : ''}
                    <button class="speak-btn small" onclick="speakText('${obj.translation.replace(/'/g, "\\'")}', '${targetLang}')">🔊</button>
                </div>
            `).join('');
            
            resultDiv.innerHTML = `
                <div class="image-description">${data.description || 'Objects found in image:'}</div>
                <div class="objects-grid">${objectsHtml}</div>
            `;
            showToast(`Found ${data.objects.length} objects!`, 'success');
        } else {
            resultDiv.innerHTML = `<div class="error">${data.error || 'No objects identified. Try a clearer image.'}</div>`;
        }
    } catch (error) {
        resultDiv.innerHTML = `<div class="error">Error: ${error.message}</div>`;
    }
}

// Enter key support
document.getElementById('wordInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        learnWord();
    }
});

// Initialize voices on load
if ('speechSynthesis' in window) {
    window.speechSynthesis.getVoices();
    window.speechSynthesis.onvoiceschanged = function() {
        window.speechSynthesis.getVoices();
    };
}
