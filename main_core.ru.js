AOS.init();

const cursor = document.getElementById('custom-cursor');

document.addEventListener('mousemove', e => {
	cursor.style.left = `${e.clientX}px`;
	cursor.style.top = `${e.clientY}px`;
});

const LogLevel = {
	INFO: 'INFO',
	WARN: 'WARN',
	ERROR: 'ERROR',
	DEBUG: 'DEBUG',
	SECURITY: 'SECURITY',
	CORE: 'CORE'
};

// 2. МУЗЫКАЛЬНЫЙ ПЛЕЕР (ГЛОБАЛЬНЫЕ ФУНКЦИИ)
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

    if (audio.paused) {
        audio.play().then(() => {
            if (btn) btn.innerHTML = '<i class="fas fa-pause"></i>';
            if (status) status.innerText = "Playing";
        }).catch(() => appendLog(LogLevel.WARN, "Автоплей заблокирован браузером. Нажми на экран!"));
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
	const filter = document.getElementById('log-level-filter').value;
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

document.addEventListener('DOMContentLoaded', () => {
	const logsysLink = document.getElementById('logsysLink');
	const loggerWindow = document.getElementById('logger-window');
	const closeLoggerButton = document.getElementById('close-logger');
	const logLevelFilter = document.getElementById('log-level-filter');

	if (logsysLink) {
		logsysLink.addEventListener('click', (e) => {
			e.preventDefault();
			loggerWindow.style.display = 'flex';
			appendLog(LogLevel.INFO, 'Окно логов открыто.');
		});
	}

	if (closeLoggerButton) {
		closeLoggerButton.addEventListener('click', () => {
			loggerWindow.style.display = 'none';
			appendLog(LogLevel.INFO, 'Окно логов закрыто.');
		});
	}

	if (logLevelFilter) {
		logLevelFilter.addEventListener('change', renderLogs);
	}
});

document.addEventListener("DOMContentLoaded", function () {
	const loadingScreen = document.getElementById("loading-screen");
	const loadingProgress = document.getElementById("loading-progress");
	const contentSections = document.querySelectorAll('.content-section');
	const siteHeading = document.querySelector('.site-heading');
	const subheading = document.getElementById('slide-subtitle');
	const newsletterSection = document.querySelector('.newsletter-section');
	const gallerySection = document.querySelector('.gallery-section');
	const searchBar = document.querySelector('.search-bar');
	let loadingDuration = 4000;
	const initialSubheadingText = subheading ? subheading.textContent : '';

	if (subheading) subheading.textContent = '';

	let progress = 0;
	const progressInterval = setInterval(() => {
		progress += Math.random() * 20;
		if (progress > 100) progress = 100;
		loadingProgress.style.width = `${progress}%`;
		if (progress >= 100) clearInterval(progressInterval);
	}, 300);

	const particlesCanvas = document.getElementById('loading-particles');
	let particlesRenderer, particlesScene, particlesCamera;

	if (particlesCanvas) {
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
			requestAnimationFrame(animateParticles);
			particles.rotation.y += 0.001;
			particlesRenderer.render(particlesScene, particlesCamera);
		}
		animateParticles();
		appendLog(LogLevel.CORE, 'Экран загрузки инициализирован.');
	}

	const resizeListener = () => {
		if (particlesCamera && particlesRenderer) {
			particlesCamera.aspect = window.innerWidth / window.innerHeight;
			particlesCamera.updateProjectionMatrix();
			particlesRenderer.setSize(window.innerWidth, window.innerHeight);
		}
	};

	window.addEventListener('resize', resizeListener);

	setTimeout(() => {
		if (loadingScreen) {
			loadingScreen.style.opacity = "0";
			setTimeout(() => {
				loadingScreen.style.display = "none";
				window.removeEventListener('resize', resizeListener);
				appendLog(LogLevel.INFO, 'Экран загрузки скрыт.');
			}, 1200);
		}
	}, loadingDuration);

	setTimeout(() => {
		contentSections.forEach(section => {
			section.style.opacity = "1";
			section.style.animation = "fadeIn 1.6s forwards";
		});
		if (newsletterSection) {
			newsletterSection.style.opacity = "1";
			newsletterSection.style.animation = "fadeInDown 1.6s forwards";
		}
		if (gallerySection) {
			gallerySection.style.opacity = "1";
			gallerySection.style.animation = "fadeInUp 1.6s forwards";
		}
		if (searchBar) {
			searchBar.style.opacity = "1";
			searchBar.style.animation = "fadeInDown 1.6s forwards";
		}
		if (siteHeading) siteHeading.style.animation = "fadeInScaleUp 1.6s ease-out forwards";
		if (subheading) typeWriter(subheading, initialSubheadingText, 45);
		appendLog(LogLevel.INFO, 'Основной контент загружен и анимирован.');
	}, loadingDuration + 1200);

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
});

const bannerTitles = [
	"Я найду тебя, Акивили",
	"Новая версия v2.6.0",
	"Что это",
	"Новые сервисы.",
	"Хз, этот баннер просто по приколу"
];
const bannerSubtitles = [
	"И подорву поезд ещё разок",
	"Я хз чё поменялось",
	"Че это",
	"Lixiqu | LAB, Qlseeh | Video",
	"А что тут писать?.."
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

function showNextBanner() {
	currentBannerIndex = (currentBannerIndex + 1) % bannerTitles.length;
	updateBannerContent();
}

function showPrevBanner() {
	currentBannerIndex = (currentBannerIndex - 1 + bannerTitles.length) % bannerTitles.length;
	updateBannerContent();
}

if (prevBannerButton) prevBannerButton.addEventListener('click', showPrevBanner);
if (nextBannerButton) nextBannerButton.addEventListener('click', showNextBanner);
document.addEventListener('DOMContentLoaded', updateBannerContent);

function toggleInfo(sectionId, buttonElement) {
	const infoElement = document.getElementById(sectionId + 'Info');
	if (infoElement) {
		infoElement.classList.toggle('visible');
		if (infoElement.classList.contains('visible')) {
			buttonElement.textContent = 'Скрыть';
			appendLog(LogLevel.INFO, `Информация для раздела "${sectionId}" показана.`);
		} else {
			buttonElement.textContent = 'Показать';
			appendLog(LogLevel.INFO, `Информация для раздела "${sectionId}" скрыта.`);
		}
	}
}

document.addEventListener('DOMContentLoaded', () => {
	const backToTop = document.getElementById('back-to-top');
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
});

document.addEventListener('DOMContentLoaded', () => {
	const newsletterForm = document.getElementById('newsletter-form');
	if (newsletterForm) {
		newsletterForm.addEventListener('submit', (e) => {
			e.preventDefault();
			const email = newsletterForm.querySelector('input[type="email"]').value;
			appendLog(LogLevel.INFO, `Подписка на newsletter: ${email}`);
			alert('Вы подписаны! (Симуляция)');
			newsletterForm.reset();
		});
	}
});

document.addEventListener('DOMContentLoaded', () => {
	const documents = [
		{ id: 'project', title: 'Мои проекты', content: 'Проекты, в которых я состою, или являюсь участником проектов. На данный момент у меня 2 проекта: BotGDX BotGD. Ссылка для более подробной информации: https://wbot-soft.my1.ru/' },
		{ id: 'fandom', title: 'Фандомы', content: 'Фандомы, исполнители, группы, которые мне симпатизируют. Фандомы, проекты, группы Vocaloid\'ов/UTAU, японские исполнители и просто исполнители, которые мне нравятся (список пока не полный): Honkai: Star Rail, Sekai Project, Diablo, Sky Children of the Light, Отель Хазбин, Зоофобия, Дроны-убийцы, Цифровой Цирк, Очень странные дела, Эхо террора, Клинок рассекающий демонов, Двуличная сестрёнка Умару-чан, Евангелион, Хроники Эвиллиоса, Метал Фемили, PinocchioP, syudou, Ado, Kikuo, meiyo, cosMo＠暴走P, biz, DECO*27, flower, Eve, COOL&CREATE, Yoh Kamiyama, Sasuke Haraguchi, jon-YAKITORY, Giga Chinozo, Jun Togawa, Guchiry, SLAVE.V-V-R, Creepy Nuts, "MORE! JUMP! MORE!", 25 Nightcord, Vivid BAD SQUAD, Parsley Onuma, Kairikibear, PEPOYO, Монеточка, ПОЛМАТЕРИ, Akuno_P, DECO*27, Kanaria' },
		{ id: 'hyperfix', title: 'Любимое', content: 'Персонажи, вселенные, на которые у меня сейчас гиперфиксы: На данный момент у меня 2 гиперфикса: Honkai: Star Rail, Великая Герта, Анакса' }
	];

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
		searchResults.innerHTML = '';
		if (query.length < 2) return;
		const results = idx.search(query);
		results.forEach(result => {
			const doc = documents.find(d => d.id === result.ref);
			const div = document.createElement('div');
			div.className = 'search-result';
			div.innerHTML = `<h3>${doc.title}</h3><p>${doc.content.replace(new RegExp(query, 'gi'), match => `<span class="highlight">${match}</span>`)}</p>`;
			searchResults.appendChild(div);
		});
		appendLog(LogLevel.INFO, `Поиск выполнен: "${query}"`);
	}

	searchButton.addEventListener('click', () => {
		const query = searchInput.value.toLowerCase();
		performSearch(query);
	});

	searchInput.addEventListener('keyup', e => { if (e.key === 'Enter') performSearch(searchInput.value.toLowerCase()); });
});

document.addEventListener('DOMContentLoaded', () => {
	const voiceSearchBtn = document.getElementById('voice-search');
	const searchInput = document.getElementById('search-input');
	if ('webkitSpeechRecognition' in window) {
		const recognition = new webkitSpeechRecognition();
		recognition.lang = 'ru-RU';
		recognition.interimResults = false;
		recognition.onresult = (event) => {
			searchInput.value = event.results[0][0].transcript;
			performSearch(searchInput.value.toLowerCase());
			appendLog(LogLevel.INFO, `Голосовой поиск: "${searchInput.value}"`);
		};
		voiceSearchBtn.addEventListener('click', () => {
			recognition.start();
			appendLog(LogLevel.INFO, 'Голосовой поиск активирован.');
		});
	} else {
		voiceSearchBtn.style.display = 'none';
	}
});

document.addEventListener('DOMContentLoaded', () => {
	const canvas = document.getElementById('particles-canvas');
	const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true });
	renderer.setSize(window.innerWidth, window.innerHeight);
	const scene = new THREE.Scene();
	const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 3000);
	camera.position.z = 1000;

	const geometry = new THREE.BufferGeometry();
	const vertices = [];
	for (let i = 0; i < 5000; i++) {
		vertices.push(Math.random() * 2000 - 1000, Math.random() * 2000 - 1000, Math.random() * 2000 - 1000);
	}
	geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
	const material = new THREE.PointsMaterial({ color: 0x8c3ae8, size: 2, sizeAttenuation: true });
	const particles = new THREE.Points(geometry, material);
	scene.add(particles);

	function animate() {
		requestAnimationFrame(animate);
		particles.rotation.y += 0.0002;
		renderer.render(scene, camera);
	}
	animate();

	window.addEventListener('resize', () => {
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();
		renderer.setSize(window.innerWidth, window.innerHeight);
	});
	appendLog(LogLevel.CORE, 'Фоновая инициализация 3D эффектов завершена.');
});

document.addEventListener('DOMContentLoaded', () => {
	const loadingCanvas = document.getElementById('loading-canvas');
	if (loadingCanvas) {
		const renderer = new THREE.WebGLRenderer({ canvas: loadingCanvas, alpha: true });
		renderer.setSize(loadingCanvas.clientWidth, loadingCanvas.clientHeight);
		const scene = new THREE.Scene();
		const camera = new THREE.PerspectiveCamera(75, loadingCanvas.clientWidth / loadingCanvas.clientHeight, 0.1, 1000);
		camera.position.z = 2;

		const geometry = new THREE.IcosahedronGeometry(1, 0);
		const material = new THREE.MeshBasicMaterial({ color: 0x8c3ae8, wireframe: true });
		const icosahedron = new THREE.Mesh(geometry, material);
		scene.add(icosahedron);

		function animate() {
			requestAnimationFrame(animate);
			icosahedron.rotation.x += 0.02;
			icosahedron.rotation.y += 0.02;
			material.color.setHSL((Date.now() % 5000) / 5000, 0.5, 0.5);
			renderer.render(scene, camera);
		}
		animate();
		appendLog(LogLevel.INFO, '3D эффекты инициализированы.');
	}
});

function openModal(src, caption) {
	const modal = document.getElementById('gallery-modal');
	const modalImg = document.getElementById('modal-image');
	const captionText = document.getElementById('modal-caption');
	modal.style.display = "block";
	modalImg.src = src;
	captionText.innerHTML = caption;
	appendLog(LogLevel.INFO, `Открыто изображение в модале: ${caption}`);
}

function closeModal() {
	const modal = document.getElementById('gallery-modal');
	modal.style.display = "none";
	appendLog(LogLevel.INFO, 'Модальное окно галереи закрыт.');
}

document.addEventListener('DOMContentLoaded', () => {
	appendLog(LogLevel.CORE, 'Страница загружена.');

	function generateUUID() {
		return 'xxxxxxxx-xxxxy'.replace(/[xy]/g, function(c) {
			var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
			return v.toString(16);
		});
	}

	function base64encode(e) {
		var t = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=", n = "", r, i, s, o, u, a, f, l = 0;
		while (l < e.length) {
			r = e.charCodeAt(l++);
			i = e.charCodeAt(l++);
			s = e.charCodeAt(l++);
			o = r >> 2;
			u = (r & 3) << 4 | i >> 4;
			a = (i & 15) << 2 | s >> 6;
			f = s & 63;
			if (isNaN(i)) { a = f = 64 } else if (isNaN(s)) { f = 64 }
			n += t.charAt(o) + t.charAt(u) + t.charAt(a) + t.charAt(f)
		}
		return n
	}

	function sha256(s) {
		function r(v, a) { return v >>> a | v << 32 - a }
		var p = Math.pow;
		var m = p(2, 32);
		var l = "length";
		var i, j, result = "";
		var w = [];
		var bl = s[l] * 8;
		var h = [];
		var k = [];
		var pc = 0;
		var c = {};
		for (var d = 2; pc < 64; d++) {
			if (!c[d]) {
				for (i = 0; i < 313; i += d) { c[i] = d }
				h[pc] = p(d, .5) * m | 0;
				k[pc++] = p(d, 1 / 3) * m | 0
			}
		}
		s += "\x80";
		while (s[l] % 64 - 56) s += "\x00";
		for (i = 0; i < s[l]; i++) {
			j = s.charCodeAt(i);
			w[i >> 2] |= j << (3 - i) % 4 * 8
		}
		w[w[l]] = bl / m | 0;
		w[w[l]] = bl;
		for (j = 0; j < w[l];) {
			var ww = w.slice(j, j += 16);
			var oh = h;
			h = h.slice(0, 8);
			for (i = 0; i < 64; i++) {
				var w15 = ww[i - 15], w2 = ww[i - 2];
				var a = h[0], e = h[4];
				var t1 = h[7] + (r(e, 6) ^ r(e, 11) ^ r(e, 25)) + (e & h[5] ^ (~e) & h[6]) + k[i] + (ww[i] = i < 16 ? ww[i] : ww[i - 16] + (r(w15, 7) ^ r(w15, 18) ^ w15 >>> 3) + ww[i - 7] + (r(w2, 17) ^ r(w2, 19) ^ w2 >>> 10) | 0);
				var t2 = (r(a, 2) ^ r(a, 13) ^ r(a, 22)) + (a & h[1] ^ a & h[2] ^ h[1] & h[2]);
				h = [t1 + t2 | 0].concat(h);
				h[4] = h[4] + t1 | 0
			}
			for (i = 0; i < 8; i++) { h[i] = h[i] + oh[i] | 0 }
		}
		var bytes = "";
		for (i = 0; i < 8; i++) {
			for (j = 3; j >= 0; j--) {
				var b = h[i] >> j * 8 & 255;
				bytes += String.fromCharCode(b)
			}
		}
		return base64encode(bytes)
	}

	function generateHashedUserId() {
		const uniqueString = navigator.userAgent + screen.width + screen.height + new Date().getTime();
		const input = unescape(encodeURIComponent(uniqueString));
		return sha256(input);
	}

	let wbuid = localStorage.getItem('wbuid');
	const banner = document.getElementById('unique-id-banner');
	const idText = document.getElementById('wbuid-text');
	const closeBanner = document.getElementById('close-id-banner');

	if (!wbuid) {
		wbuid = generateHashedUserId();
		localStorage.setItem('wbuid', wbuid);
		appendLog(LogLevel.SECURITY, 'Новый WBUID сгенерированю');
		if (banner && idText && closeBanner) {
			idText.textContent = wbuid;
			banner.style.display = 'block';
			closeBanner.addEventListener('click', () => {
				banner.style.display = 'none';
				appendLog(LogLevel.INFO, 'Баннер WBUID закрыт. Дальнейшие действия: отключить показ баннера');
			});
		}
	} else {
		appendLog(LogLevel.INFO, 'Существующий WBUID загружен.');
	}

	const funFactElement = document.getElementById('fun-fact');
	if (funFactElement) {
		const funFacts = [
			'Версия этого сайта разрабатывалась почти месяц',
			'Я написаю в стакан, а ты попьёшь мою мочу',
			'Хз чё писать. Ну на сайте можно использовать голосовой поиск',
			'Всё, у меня уже нет фантазии на факты',
			'Зачем ваще нужна эта функция...'
		];
		const randomFact = funFacts[Math.floor(Math.random() * funFacts.length)];
		funFactElement.textContent = randomFact;
	}
});
