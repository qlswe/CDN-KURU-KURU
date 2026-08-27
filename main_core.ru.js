AOS.init();

// --- Кастомный курсор ---
const cursor = document.getElementById('custom-cursor');
if (cursor) {
	document.addEventListener('mousemove', e => {
		cursor.style.left = `${e.clientX}px`;
		cursor.style.top = `${e.clientY}px`;
	});
}

// --- Уровни логирования ---
const LogLevel = {
	INFO: 'INFO',
	WARN: 'WARN',
	ERROR: 'ERROR',
	DEBUG: 'DEBUG',
	SECURITY: 'SECURITY',
	CORE: 'CORE'
};

const logEntries = [];
const maxLogEntries = 600;

function appendLog(level, message) {
	const timestamp = new Date().toLocaleString();
	logEntries.push({ timestamp, level, message });
	if (logEntries.length > maxLogEntries) logEntries.shift();
	renderLogs();
}

function renderLogs() {
	const logContent = document.getElementById('log-content');
	const filterEl = document.getElementById('log-level-filter');
	if (!logContent || !filterEl) return;
	
	const filter = filterEl.value;
	logContent.innerHTML = '';
	logEntries.forEach(entry => {
		if (filter === 'all' || entry.level.toLowerCase() === filter) {
			const logLine = document.createElement('div');
			logLine.className = `log-entry log-${entry.level.toLowerCase()}`;
			logLine.innerHTML = `<span style="color: #888;">[${entry.timestamp}]</span> <strong style="color: ${getLogLevelColor(entry.level)};">[${entry.level}]</strong> ${entry.message}`;
			logContent.appendChild(logLine);
		}
	});
	logContent.scrollTop = logContent.scrollHeight;
}

function getLogLevelColor(level) {
	switch (level) {
		case LogLevel.INFO: return '#5cb85c';
		case LogLevel.WARN: return '#f0ad4e';
		case LogLevel.ERROR: return '#d9534f';
		case LogLevel.DEBUG: return '#5bc0de';
		case LogLevel.SECURITY: return '#ff9800';
		case LogLevel.CORE: return '#2196f3';
		default: return '#d9edf7';
	}
}

// Перехват логов консоли
const originalConsoleLog = console.log;
const originalConsoleWarn = console.warn;
const originalConsoleError = console.error;
const originalConsoleDebug = console.debug;

console.log = (...args) => {
	appendLog(LogLevel.INFO, args.map(arg => typeof arg === 'object' ? JSON.stringify(arg, null, 2) : arg).join(' '));
	originalConsoleLog.apply(console, args);
};
console.warn = (...args) => {
	appendLog(LogLevel.WARN, args.map(arg => typeof arg === 'object' ? JSON.stringify(arg, null, 2) : arg).join(' '));
	originalConsoleWarn.apply(console, args);
};
console.error = (...args) => {
	appendLog(LogLevel.ERROR, args.map(arg => typeof arg === 'object' ? JSON.stringify(arg, null, 2) : arg).join(' '));
	originalConsoleError.apply(console, args);
};
console.debug = (...args) => {
	appendLog(LogLevel.DEBUG, args.map(arg => typeof arg === 'object' ? JSON.stringify(arg, null, 2) : arg).join(' '));
	originalConsoleDebug.apply(console, args);
};

// --- Музыкальный плеер ---
const playlist = [
    { name: "Cyber Dreams", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" },
    { name: "Neon District", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3" },
    { name: "Synthetic Soul", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3" }
];
let currentTrackIndex = 0;

window.loadTrack = function(index) {
    const audio = document.getElementById('main-audio');
    const nameLabel = document.getElementById('current-track-name');
    const statusLabel = document.getElementById('player-status');
    if (!audio || !playlist[index]) return;
    
    audio.src = playlist[index].url;
    if (nameLabel) nameLabel.innerText = playlist[index].name;
    if (statusLabel) statusLabel.innerText = "Ready";
    appendLog(LogLevel.INFO, `Трек сменен на: ${playlist[index].name}`);
};

window.togglePlay = function() {
    const audio = document.getElementById('main-audio');
    const btn = document.getElementById('play-pause');
    const status = document.getElementById('player-status');
    if (!audio) return;

    if (!audio.src) window.loadTrack(currentTrackIndex);

    if (audio.paused) {
        audio.play().then(() => {
            if (btn) btn.innerHTML = '<i class="fas fa-pause"></i>';
            if (status) status.innerText = "Playing";
        }).catch(() => appendLog(LogLevel.WARN, "Автоплей заблокирован браузером. Нажмите на кнопку!"));
    } else {
        audio.pause();
        if (btn) btn.innerHTML = '<i class="fas fa-play"></i>';
        if (status) status.innerText = "Paused";
    }
};

window.nextTrack = function() {
    currentTrackIndex = (currentTrackIndex + 1) % playlist.length;
    window.loadTrack(currentTrackIndex);
    window.togglePlay();
};

window.prevTrack = function() {
    currentTrackIndex = (currentTrackIndex - 1 + playlist.length) % playlist.length;
    window.loadTrack(currentTrackIndex);
    window.togglePlay();
};

window.changeVolume = function(val) {
    const audio = document.getElementById('main-audio');
    if (audio) audio.volume = val;
};

// --- Инициализация интерфейса ---
document.addEventListener('DOMContentLoaded', () => {
	// Окно логов
	const logsysLink = document.getElementById('logsysLink');
	const loggerWindow = document.getElementById('logger-window');
	const closeLoggerButton = document.getElementById('close-logger');
	const logLevelFilter = document.getElementById('log-level-filter');

	if (logsysLink && loggerWindow) {
		logsysLink.addEventListener('click', (e) => {
			e.preventDefault();
			loggerWindow.style.display = 'flex';
			appendLog(LogLevel.INFO, 'Окно логов открыто.');
		});
	}
	if (closeLoggerButton && loggerWindow) {
		closeLoggerButton.addEventListener('click', () => {
			loggerWindow.style.display = 'none';
			appendLog(LogLevel.INFO, 'Окно логов закрыто.');
		});
	}
	if (logLevelFilter) {
		logLevelFilter.addEventListener('change', renderLogs);
	}

	// Экран загрузки
	const loadingScreen = document.getElementById("loading-screen");
	const loadingProgress = document.getElementById("loading-progress");
	const musicIsland = document.getElementById("music-island");
	const contentSections = document.querySelectorAll('.content-section');
	const siteHeading = document.querySelector('.site-heading');
	const subheading = document.getElementById('slide-subtitle');
	const searchBar = document.querySelector('.search-bar');
	const initialSubheadingText = subheading ? subheading.textContent : '';

	if (subheading) subheading.textContent = '';

	let progress = 0;
	const progressInterval = setInterval(() => {
		progress += Math.random() * 20;
		if (progress > 100) progress = 100;
		if (loadingProgress) loadingProgress.style.width = `${progress}%`;
		if (progress >= 100) clearInterval(progressInterval);
	}, 200);

	// THREE.js Canvas Загрузки
	const particlesCanvas = document.getElementById('loading-particles');
	let particlesRenderer, particlesScene, particlesCamera;

	if (particlesCanvas && window.THREE) {
		particlesRenderer = new THREE.WebGLRenderer({ canvas: particlesCanvas, alpha: true });
		particlesRenderer.setSize(window.innerWidth, window.innerHeight);
		particlesScene = new THREE.Scene();
		particlesCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 3000);
		particlesCamera.position.z = 1000;

		const geometry = new THREE.BufferGeometry();
		const vertices = [];
		for (let i = 0; i < 2000; i++) {
			vertices.push(Math.random() * 2000 - 1000, Math.random() * 2000 - 1000, Math.random() * 2000 - 1000);
		}
		geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
		const material = new THREE.PointsMaterial({ color: 0xe83ab5, size: 3, sizeAttenuation: true });
		const particles = new THREE.Points(geometry, material);
		particlesScene.add(particles);

		function animateParticles() {
			if (loadingScreen && loadingScreen.style.display === 'none') return;
			requestAnimationFrame(animateParticles);
			particles.rotation.y += 0.001;
			particlesRenderer.render(particlesScene, particlesCamera);
		}
		animateParticles();
		appendLog(LogLevel.CORE, 'Экран загрузки инициализирован.');
	}

	setTimeout(() => {
		if (loadingScreen) {
			loadingScreen.style.opacity = "0";
			setTimeout(() => {
				loadingScreen.style.display = "none";
				if (musicIsland) musicIsland.classList.add('visible');
				appendLog(LogLevel.INFO, 'Экран загрузки скрыт.');
			}, 800);
		}

		contentSections.forEach(section => {
			section.style.opacity = "1";
			section.style.animation = "fadeIn 1.6s forwards";
		});
		if (searchBar) {
			searchBar.style.opacity = "1";
			searchBar.style.animation = "fadeInDown 1.6s forwards";
		}
		if (siteHeading) siteHeading.style.animation = "fadeInScaleUp 1.6s ease-out forwards";
		if (subheading) typeWriter(subheading, initialSubheadingText, 45);
		appendLog(LogLevel.INFO, 'Основной контент загружен.');
	}, 3000);

	function typeWriter(element, text, speed) {
		let i = 0;
		function type() {
			if (element && i < text.length) {
				element.textContent += text.charAt(i);
				i++;
				setTimeout(type, speed);
			}
		}
		type();
	}

	// Поиск и Голосовой поиск (Объединены во избежание Scope-ошибок)
	const documents = [
		{ id: 'project', title: 'Мои проекты', content: 'Проекты: クルシーP переводит, KURU-KURU | VIDEO, Министерство Ахахи' },
		{ id: 'fandom', title: 'Фандомы', content: 'Honkai: Star Rail, Zenless Zone Zero, Vocaloid, Sekai Project, Diablo, Sky Children of the Light, Отель Хазбин, Цифровой Цирк, Очень странные дела, Эхо террора, Клинок рассекающий демонов, Евангелион, Хроники Эвиллиоса, Метал Фемили, PinocchioP, syudou, Ado, Kikuo, meiyo, cosMo＠暴走P, biz, DECO*27, flower, Eve' },
		{ id: 'hyperfix', title: 'Любимое', content: 'Персонажи: Великая Герта, Анакса' }
	];

	if (window.lunr) {
		const idx = lunr(function () {
			this.use(lunr.multiLanguage('en', 'ru'));
			this.ref('id');
			this.field('title');
			this.field('content');
			documents.forEach(doc => this.add(doc));
		});

		const searchInput = document.getElementById('search-input');
		const searchButton = document.getElementById('search-button');
		const searchResults = document.getElementById('search-results');

		function performSearch(query) {
			if (!searchResults) return;
			searchResults.innerHTML = '';
			if (query.length < 2) return;
			try {
				const results = idx.search(query);
				results.forEach(result => {
					const doc = documents.find(d => d.id === result.ref);
					const div = document.createElement('div');
					div.className = 'search-result';
					div.innerHTML = `<h3>${doc.title}</h3><p>${doc.content.replace(new RegExp(query, 'gi'), match => `<span class="highlight">${match}</span>`)}</p>`;
					searchResults.appendChild(div);
				});
				appendLog(LogLevel.INFO, `Поиск выполнен: "${query}"`);
			} catch (err) {
				appendLog(LogLevel.WARN, `Ошибка поиска: ${err.message}`);
			}
		}

		if (searchButton && searchInput) {
			searchButton.addEventListener('click', () => performSearch(searchInput.value.toLowerCase()));
			searchInput.addEventListener('keyup', e => { if (e.key === 'Enter') performSearch(searchInput.value.toLowerCase()); });
		}

		// Web Speech API
		const voiceSearchBtn = document.getElementById('voice-search');
		const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

		if (SpeechRecognition && voiceSearchBtn && searchInput) {
			const recognition = new SpeechRecognition();
			recognition.lang = 'ru-RU';
			recognition.interimResults = false;

			recognition.onresult = (event) => {
				const transcript = event.results[0][0].transcript;
				searchInput.value = transcript;
				performSearch(transcript.toLowerCase());
				appendLog(LogLevel.INFO, `Голосовой поиск: "${transcript}"`);
			};

			voiceSearchBtn.addEventListener('click', () => {
				recognition.start();
				appendLog(LogLevel.INFO, 'Голосовой поиск активирован.');
			});
		} else if (voiceSearchBtn) {
			voiceSearchBtn.style.display = 'none';
		}
	}

	// Нативный Async SHA-256 для генерации WBUID
	async function generateHashedUserId() {
		const uniqueString = navigator.userAgent + screen.width + screen.height + new Date().getTime();
		if (window.crypto && window.crypto.subtle) {
			const msgUint8 = new TextEncoder().encode(uniqueString);
			const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
			const hashArray = Array.from(new Uint8Array(hashBuffer));
			return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
		}
		return 'user-' + Math.random().toString(36).substring(2, 15);
	}

	(async () => {
		let wbuid = localStorage.getItem('wbuid');
		const banner = document.getElementById('unique-id-banner');
		const idText = document.getElementById('wbuid-text');
		const closeBanner = document.getElementById('close-id-banner');

		if (!wbuid) {
			wbuid = await generateHashedUserId();
			localStorage.setItem('wbuid', wbuid);
			appendLog(LogLevel.SECURITY, 'Новый WBUID сгенерирован.');
			if (banner && idText && closeBanner) {
				idText.textContent = wbuid;
				banner.style.display = 'block';
				closeBanner.addEventListener('click', () => {
					banner.style.display = 'none';
					appendLog(LogLevel.INFO, 'Баннер WBUID закрыт.');
				});
			}
		} else {
			appendLog(LogLevel.INFO, 'Существующий WBUID загружен.');
		}
	})();

	// Кнопка наверх
	const backToTop = document.getElementById('back-to-top');
	if (backToTop) {
		window.addEventListener('scroll', () => {
			if (window.scrollY > 400) {
				backToTop.classList.add('visible');
			} else {
				backToTop.classList.remove('visible');
			}
		});
		backToTop.addEventListener('click', () => {
			window.scrollTo({ top: 0, behavior: 'smooth' });
			appendLog(LogLevel.INFO, 'Пользователь вернулся наверх страницы.');
		});
	}

	// Рандомный факт
	const funFactElement = document.getElementById('fun-fact');
	if (funFactElement) {
		const funFacts = [
			'Версия этого сайта разрабатывалась почти месяц',
			'Здесь доступен голосовой поиск по материалам!',
			'Проект KURU-KURU постоянно обновляется',
			'Вы можете просмотреть системные логи прямо на сайте'
		];
		funFactElement.textContent = funFacts[Math.floor(Math.random() * funFacts.length)];
	}

	appendLog(LogLevel.CORE, 'Страница загружена.');
});

// --- Баннер-слайдер ---
const bannerTitles = [
	"Я найду тебя, Акивили",
	"Новая версия v2.6.0",
	"Что это",
	"Новые сервисы.",
	"Интерактивный био-сайт"
];
const bannerSubtitles = [
	"И подорву поезд ещё разок",
	"Обновлены стили и оптимизирован JS",
	"Добро пожаловать!",
	"Lixiqu | LAB, Qlseeh | Video",
	"Все новости и проекты в одном месте"
];

let currentBannerIndex = 0;
const slideTitle = document.getElementById('slide-title');
const slideSubtitle = document.getElementById('slide-subtitle');
const prevBannerButton = document.getElementById('prev-banner');
const nextBannerButton = document.getElementById('next-banner');
const bannerCounter = document.getElementById('banner-counter');

function updateBannerContent() {
	if (slideTitle) slideTitle.textContent = bannerTitles[currentBannerIndex];
	if (slideSubtitle) slideSubtitle.textContent = bannerSubtitles[currentBannerIndex];
	if (bannerCounter) bannerCounter.textContent = `${currentBannerIndex + 1} / ${bannerTitles.length}`;
	appendLog(LogLevel.INFO, `Баннер переключен на индекс: ${currentBannerIndex}`);
}

if (prevBannerButton) prevBannerButton.addEventListener('click', () => {
	currentBannerIndex = (currentBannerIndex - 1 + bannerTitles.length) % bannerTitles.length;
	updateBannerContent();
});
if (nextBannerButton) nextBannerButton.addEventListener('click', () => {
	currentBannerIndex = (currentBannerIndex + 1) % bannerTitles.length;
	updateBannerContent();
});
document.addEventListener('DOMContentLoaded', updateBannerContent);

// --- Аккордеоны карточек ---
function toggleInfo(sectionId, buttonElement) {
	const infoElement = document.getElementById(sectionId + 'Info');
	if (infoElement) {
		infoElement.classList.toggle('visible');
		if (infoElement.classList.contains('visible')) {
			buttonElement.textContent = 'Скрыть';
			appendLog(LogLevel.INFO, `Раздел "${sectionId}" открыт.`);
		} else {
			buttonElement.textContent = 'Показать';
			appendLog(LogLevel.INFO, `Раздел "${sectionId}" скрыт.`);
		}
	}
}

// --- 3D Background Particles ---
document.addEventListener('DOMContentLoaded', () => {
	const canvas = document.getElementById('particles-canvas');
	if (!canvas || !window.THREE) return;
	
	const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true });
	renderer.setSize(window.innerWidth, window.innerHeight);
	const scene = new THREE.Scene();
	const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 3000);
	camera.position.z = 1000;

	const geometry = new THREE.BufferGeometry();
	const vertices = [];
	for (let i = 0; i < 3000; i++) {
		vertices.push(Math.random() * 2000 - 1000, Math.random() * 2000 - 1000, Math.random() * 2000 - 1000);
	}
	geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
	const material = new THREE.PointsMaterial({ color: 0x8c3ae8, size: 2, sizeAttenuation: true });
	const particles = new THREE.Points(geometry, material);
	scene.add(particles);

	function animate() {
		requestAnimationFrame(animate);
		particles.rotation.y += 0.0003;
		renderer.render(scene, camera);
	}
	animate();

	window.addEventListener('resize', () => {
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();
		renderer.setSize(window.innerWidth, window.innerHeight);
	});
});

// --- Модальное окно Галереи ---
function openModal(src, caption) {
	const modal = document.getElementById('gallery-modal');
	const modalImg = document.getElementById('modal-image');
	const captionText = document.getElementById('modal-caption');
	if (modal && modalImg) {
		modal.style.display = "block";
		modalImg.src = src;
		if (captionText) captionText.innerHTML = caption;
		appendLog(LogLevel.INFO, `Галерея: ${caption}`);
	}
}

function closeModal() {
	const modal = document.getElementById('gallery-modal');
	if (modal) {
		modal.style.display = "none";
		appendLog(LogLevel.INFO, 'Галерея закрыта.');
	}
}
