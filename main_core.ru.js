// Инициализация AOS (Анимации при скролле)
AOS.init();

// --- СИСТЕМА ЛОГИРОВАНИЯ ---
const LogLevel = { INFO: 'INFO', WARN: 'WARN', ERROR: 'ERROR', CORE: 'CORE' };
const logEntries = [];
const maxLogEntries = 100;

function appendLog(level, message) {
    const time = new Date().toLocaleTimeString();
    logEntries.push({ time, level, message });
    if (logEntries.length > maxLogEntries) logEntries.shift();
    renderLogs();
}

function renderLogs() {
    const logContent = document.getElementById('log-content');
    const filter = document.getElementById('log-level-filter')?.value || 'all';
    if (!logContent) return;
    
    logContent.innerHTML = '';
    logEntries.forEach(entry => {
        if (filter === 'all' || entry.level.toLowerCase() === filter) {
            const div = document.createElement('div');
            let color = '#a9b7c6';
            if (entry.level === 'WARN') color = '#e6c07b';
            if (entry.level === 'ERROR') color = '#e06c75';
            if (entry.level === 'CORE') color = '#61afef';
            
            div.innerHTML = `<span style="color:#5c6370">[${entry.time}]</span> <strong style="color:${color}">[${entry.level}]</strong> ${entry.message}`;
            logContent.appendChild(div);
        }
    });
    logContent.scrollTop = logContent.scrollHeight;
}

// Перехват консоли
const originalLog = console.log;
console.log = (...args) => { appendLog(LogLevel.INFO, args.join(' ')); originalLog(...args); };

// --- СИСТЕМА ТЕМ (Glassmorphism + LocalStorage) ---
window.setTheme = function(hex, rgbGlow) {
    document.documentElement.style.setProperty('--accent-color', hex);
    document.documentElement.style.setProperty('--accent-glow', rgbGlow);
    
    if (window.particlesMaterial) {
        window.particlesMaterial.color.set(hex);
    }
    
    localStorage.setItem('user-theme-hex', hex);
    localStorage.setItem('user-theme-glow', rgbGlow);
    appendLog(LogLevel.INFO, `Тема интерфейса изменена: ${hex}`);
};

// --- ИНИЦИАЛИЗАЦИЯ ПРИ СТАРТЕ ---
document.addEventListener('DOMContentLoaded', () => {
    // 1. Загрузка темы
    const savedHex = localStorage.getItem('user-theme-hex');
    const savedGlow = localStorage.getItem('user-theme-glow');
    if (savedHex && savedGlow) setTheme(savedHex, savedGlow);

    // 2. Регистрация Service Worker (PWA)
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
            .then(reg => appendLog(LogLevel.CORE, `PWA Service Worker активен. Scope: ${reg.scope}`))
            .catch(err => appendLog(LogLevel.ERROR, `Ошибка PWA: ${err}`));
    }

    // 3. WBUID Генерация (Crypto Subtle API)
    async function generateWBUID() {
        const str = navigator.userAgent + Date.now() + Math.random();
        const buffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
        return Array.from(new Uint8Array(buffer)).map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 32);
    }

    (async () => {
        let wbuid = localStorage.getItem('wbuid');
        if (!wbuid) {
            wbuid = await generateWBUID();
            localStorage.setItem('wbuid', wbuid);
            document.getElementById('wbuid-text').textContent = wbuid;
            document.getElementById('unique-id-banner').style.display = 'block';
            appendLog(LogLevel.CORE, `Сгенерирован новый WBUID: ${wbuid.substring(0,8)}...`);
        } else {
            appendLog(LogLevel.INFO, `Загружен существующий WBUID.`);
        }
    })();

    document.getElementById('close-id-banner')?.addEventListener('click', function() {
        this.parentElement.style.display = 'none';
    });

    // 4. Окно логов UI
    document.getElementById('logsysLink')?.addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('logger-window').style.display = 'flex';
    });
    document.getElementById('close-logger')?.addEventListener('click', () => {
        document.getElementById('logger-window').style.display = 'none';
    });
    document.getElementById('log-level-filter')?.addEventListener('change', renderLogs);

    // 5. Рандомный факт
    const facts = [
        'Сайт использует нативный алгоритм SHA-256 для ID.',
        'Доступна установка сайта как PWA-приложения.',
        '3D-частицы на фоне реагируют на движение мыши.',
        'Все элементы интерфейса стилизованы под матовое стекло.'
    ];
    const factEl = document.getElementById('fun-fact');
    if (factEl) factEl.textContent = facts[Math.floor(Math.random() * facts.length)];

    // 6. Баннер-Слайдер
    const titles = ["Приветствую в Сети", "База данных クルシーP", "Cyber-Glassmorphism", "Система активна"];
    const subtitles = ["v3.0 Запущена", "Вся информация здесь", "Новый дизайн", "Ожидание команд..."];
    let slideIdx = 0;

    function updateSlide() {
        const elTitle = document.getElementById('slide-title');
        const elSub = document.getElementById('slide-subtitle');
        if (elTitle) elTitle.textContent = titles[slideIdx];
        if (elSub) elSub.textContent = subtitles[slideIdx];
        document.getElementById('banner-counter').textContent = `${slideIdx + 1} / ${titles.length}`;
    }
    
    document.getElementById('prev-banner')?.addEventListener('click', () => {
        slideIdx = (slideIdx - 1 + titles.length) % titles.length;
        updateSlide();
    });
    document.getElementById('next-banner')?.addEventListener('click', () => {
        slideIdx = (slideIdx + 1) % titles.length;
        updateSlide();
    });
    updateSlide();

    // 7. Поиск Lunr.js
    const searchDb = [
        { id: '1', title: 'Проекты', content: 'Telegram переводы, KURU-KURU VIDEO, Министерство Ахахи' },
        { id: '2', title: 'Фандомы', content: 'Honkai Star Rail, Zenless Zone Zero, Vocaloid, Отель Хазбин, Цифровой цирк' },
        { id: '3', title: 'Музыка', content: 'PinocchioP, syudou, Ado, Kikuo, DECO*27, MARETU, Kanaria' },
        { id: '4', title: 'Персонажи', content: 'Великая Герта, Анакса, Акивили' }
    ];

    const idx = lunr(function () {
        this.use(lunr.multiLanguage('en', 'ru'));
        this.ref('id');
        this.field('title');
        this.field('content');
        searchDb.forEach(doc => this.add(doc));
    });

    function doSearch(q) {
        const resEl = document.getElementById('search-results');
        resEl.innerHTML = '';
        if (q.length < 2) return;
        const results = idx.search(q);
        results.forEach(r => {
            const doc = searchDb.find(d => d.id === r.ref);
            resEl.innerHTML += `<div class="search-result glass-panel mt-2">
                <h4 style="color: var(--accent-color); margin-bottom: 5px;">${doc.title}</h4>
                <p style="margin: 0;">${doc.content}</p>
            </div>`;
        });
        appendLog(LogLevel.INFO, `Поиск выполнен: ${q}`);
    }

    document.getElementById('search-button')?.addEventListener('click', () => {
        doSearch(document.getElementById('search-input').value);
    });
    document.getElementById('search-input')?.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') doSearch(e.target.value);
    });

    // Голосовой поиск
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    const voiceBtn = document.getElementById('voice-search');
    if (SpeechRec && voiceBtn) {
        const rec = new SpeechRec();
        rec.lang = 'ru-RU';
        rec.onresult = (e) => {
            const text = e.results[0][0].transcript;
            document.getElementById('search-input').value = text;
            doSearch(text);
            appendLog(LogLevel.INFO, `Голосовой ввод: ${text}`);
        };
        voiceBtn.addEventListener('click', () => {
            rec.start();
            appendLog(LogLevel.INFO, `Микрофон активирован...`);
        });
    }

    // 8. Кнопка Наверх
    const btt = document.getElementById('back-to-top');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) btt.classList.add('visible');
        else btt.classList.remove('visible');
    });
    btt?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

    // 9. Скрытие экрана загрузки
    let progress = 0;
    const progBar = document.getElementById('loading-progress');
    const loadInterval = setInterval(() => {
        progress += Math.random() * 25;
        if (progress > 100) progress = 100;
        if (progBar) progBar.style.width = `${progress}%`;
        if (progress >= 100) {
            clearInterval(loadInterval);
            setTimeout(() => {
                const ls = document.getElementById('loading-screen');
                if (ls) {
                    ls.style.opacity = '0';
                    setTimeout(() => { 
                        ls.style.display = 'none';
                        document.getElementById('music-island')?.classList.add('visible');
                        appendLog(LogLevel.CORE, `Инициализация завершена.`);
                    }, 800);
                }
            }, 500);
        }
    }, 200);
});

// --- АККОРДЕОНЫ КАРТОЧЕК ---
window.toggleInfo = function(id, btn) {
    const el = document.getElementById(id + 'Info');
    if (el) {
        el.classList.toggle('visible');
        btn.textContent = el.classList.contains('visible') ? 'Свернуть' : 'Развернуть';
    }
};

// --- МУЗЫКАЛЬНЫЙ ПЛЕЕР ---
const tracks = [
    { name: "Neon District", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" },
    { name: "Cyber Dreams", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3" }
];
let trackIdx = 0;

window.loadTrack = function(idx) {
    const audio = document.getElementById('main-audio');
    if (!audio || !tracks[idx]) return;
    audio.src = tracks[idx].url;
    document.getElementById('current-track-name').textContent = tracks[idx].name;
    document.getElementById('player-status').textContent = "Готов";
};

window.togglePlay = function() {
    const audio = document.getElementById('main-audio');
    const btn = document.getElementById('play-pause');
    if (!audio.src) window.loadTrack(trackIdx);

    if (audio.paused) {
        audio.play();
        btn.innerHTML = '<i class="fas fa-pause-circle"></i>';
        document.getElementById('player-status').textContent = "Играет";
    } else {
        audio.pause();
        btn.innerHTML = '<i class="fas fa-play-circle"></i>';
        document.getElementById('player-status').textContent = "Пауза";
    }
};

window.nextTrack = function() { trackIdx = (trackIdx + 1) % tracks.length; loadTrack(trackIdx); togglePlay(); };
window.prevTrack = function() { trackIdx = (trackIdx - 1 + tracks.length) % tracks.length; loadTrack(trackIdx); togglePlay(); };
window.changeVolume = function(val) { document.getElementById('main-audio').volume = val; };


// --- 3D ФОН (Mouse Parallax & Additive Blending) ---
document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('particles-canvas');
    if (!canvas || !window.THREE) return;
    
    const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 3000);
    camera.position.z = 1000;

    const geo = new THREE.BufferGeometry();
    const vertices = [];
    for (let i = 0; i < 3500; i++) {
        vertices.push((Math.random() - 0.5)*3000, (Math.random() - 0.5)*3000, (Math.random() - 0.5)*3000);
    }
    geo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    
    const initialColor = getComputedStyle(document.documentElement).getPropertyValue('--accent-color').trim() || '#8c3ae8';
    window.particlesMaterial = new THREE.PointsMaterial({ 
        color: initialColor, 
        size: 2.5, 
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending 
    });
    
    const particles = new THREE.Points(geo, window.particlesMaterial);
    scene.add(particles);

    let mouseX = 0;
    let mouseY = 0;
    document.addEventListener('mousemove', (e) => {
        mouseX = (e.clientX - window.innerWidth / 2) * 0.5;
        mouseY = (e.clientY - window.innerHeight / 2) * 0.5;
    });

    function animate() {
        requestAnimationFrame(animate);
        particles.rotation.y += 0.0005;
        particles.rotation.x += 0.0002;
        
        // Плавное следование за мышью
        camera.position.x += (mouseX - camera.position.x) * 0.05;
        camera.position.y += (-mouseY - camera.position.y) * 0.05;
        camera.lookAt(scene.position);
        
        renderer.render(scene, camera);
    }
    animate();

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
});
