// watch -f 'js/*.js' -r 'terser js/bucket.js js/script.js --source-map -m -o js/script.terser.js'
var navbar, navbarSections, names, active_section = null, active_work = '';

// toggle dark mode
function darkMode(force) {
	document.documentElement.classList.toggle('dark-mode', force);
}
if (window.matchMedia) window.matchMedia('(prefers-color-scheme: dark)').addListener(e => darkMode(e.matches))

// load section from url parameter
function redirectToSection(query) {
	// Remove leading ? or / if present
	query = query.replace(/^[\/?]/, '');
	
	if (query.length === 0) return;

	const segments = query.split('/');
	const sectionName = segments[0];
	const sub = segments[1] || '';

	
	// Validate section name
	const validSections = Array.from(
		document.querySelectorAll('.section-nav span[data-section-name]')
	).map(s => s.getAttribute('data-section-name'));

	if (!validSections.includes(sectionName)) return;

	// Add animation end listener
	document.querySelector(`#id-${sectionName} .text`).addEventListener('animationend', _ => {
		if (sectionName === 'work' && Array.from(document.querySelectorAll('#id-work .card')).map(d => d.getAttribute('id')).includes(sub)) {
			workPicker(sub);
		}
		document.body.classList.remove('no-touching');
	}, {once: true});

	document.body.classList.add('no-touching');
	setTimeout(_ => trackEvent(`Navigating directly to section: /${sectionName}/${sub}`, 'Deep Linked'), 900);
	setTimeout(_ => navControl(sectionName), 1000);
}

// back button fail safe
window.addEventListener('popstate', _ => {
	navbarSections.forEach(s => s.classList.remove('active'));
	hideAllSections();
	trackEvent('-', 'Back button clicked');
});

// Wave
var wave, swell, tide, crests = [], troughs = [];
function ripple(delay = 0) {
	clearTimeout(swell);
	swell = setTimeout(function () {
		if (navbarSections && navbarSections.length) navbarSections.forEach((s, i, sections) => {
			crests[i] = setTimeout(rippleUp, 150 * i, s, names[i]);
			troughs[i] = setTimeout(rippleDown, (sections.length * 150) + (200 * i), s, names[i]);
		});
	}, delay);
}

function rippleUp(section, name) {
	section.classList.add('wave');
	if (name) name.classList.add('wave');
}
function rippleDown(section, name) {
	section.classList.remove('wave');
	if (name) name.classList.remove('wave');
}

function startWave(rippleDelay = 0) {
	if (rippleDelay > 0) ripple(rippleDelay);
	clearInterval(wave);
	clearTimeout(tide);
	tide = setTimeout(_ => wave = setInterval(ripple, 4000), rippleDelay);
}

function killWave(except) {
	clearTimeout(tide);
	clearTimeout(swell);
	clearInterval(wave);
	navbarSections.forEach((s,i) => {
		// kill all rippleUps
		clearTimeout(crests[i]);
		// kill all rippleDowns except i
		if (i === except) {
			clearTimeout(troughs[i]);
		} else {	
			rippleDown(s, names[i]);
		}
	});
}

function highTide() {
	killWave();
	navbarSections.forEach((s, i, sections) => setTimeout(rippleUp, 150 * i, s, names[i]));
}

// Navbar
function navControl(sectionName) {
	if (!typeof sectionName === 'string' || sectionName.length === 0) return;

	var navChild = navbar.querySelector(`span[data-section-name="${sectionName}"]`);
	if (!navChild || !navChild.parentElement) return;
	var navButton = navChild.parentElement;

	var sectionID = `id-${sectionName}`;
	killWave();

	//reset navbar bg and buttons
	navbar.classList.remove('active');
	navbarSections.forEach(s => s.classList.remove('active'));

	//if selected section is already open, shut it down
	if (sectionID === active_section) {
		hideAllSections();
		trackEvent('-', 'Sections Closed');
	} else{
		// open section
		showSection(sectionID);
		//change navbar bg colour and .active
		navbar.setAttribute('data-bg-color', navButton.getAttribute('data-bg-color'));
		navbar.setAttribute('data-open', 'true');
		navbar.classList.add('active');
		navButton.classList.add('active');
		document.getElementById('section-container').classList.add('active');
		document.title = `${sectionName} | kali yilmaz`;
		history.pushState(null, null, `/${sectionName}`);
		trackEvent(sectionName, 'Section Changed');
	}
}

function showSection(sectionID) {
	// pre-loading
	switch(sectionID) {
		case 'id-work':
			document.querySelectorAll('.card .logo img, .badges img').forEach(l => l.src = l.getAttribute('data-src'));
			if (active_work === '') break;
			document.querySelector('.work.active').classList.remove('active');
			document.getElementById(active_work).classList.add('hidden');
			active_work = '';
			break;
		case 'id-about':
			document.getElementById('me-jpg').src = 'assets/me.jpg';
			break;
	}

	// if no section is open
	if (active_section === null){
		toggleHero();
		//wait for minimize to complete
		setTimeout(_ => document.getElementById(sectionID).classList.remove('hidden'), 1000);
	} else {
		// changing sections
		window.scroll({ top: 0, left: 0, behavior: 'smooth' });
		animateOut(`#${active_section}`, 'fade-out-bottom', _ => document.getElementById(sectionID).classList.remove('hidden'));
	}
	active_section = sectionID;
}
function toggleHero() {
	var hero = document.getElementById('hero');
	hero.style.height = hero.style.height === `0px` ? `calc(var(--vh, 1vh) * 60)` : `0px`;
}

function loadFile(name, type, url, callback = _ => {}) {
	if (!name || name.length === 0 || !['css', 'js'].includes(type) || !url || url.length === 0 || document.querySelector(`.${type}-${name}`)) return;
	var tag = Object.assign(document.createElement(type === 'js' ? 'script' : 'link'), {
		... type === 'js' ? {src: url} : {},
		... type === 'css' ? {rel: 'stylesheet', href: url} : {},
		className: `${type}-${name}`,
		onload: callback
	});
	document[type === 'js' ? 'body' : 'head'].appendChild(tag)
}

function hideAllSections() {
	navbar.setAttribute('data-open', 'false');
	navbar.classList.remove('active');
	document.getElementById('section-container').classList.remove('active');
	
	toggleHero();
	killWave();
	startWave(1500);

	document.title = `kali yilmaz`;
	history.pushState(null, null, '/');

	animateOut('#' + active_section, 'fade-out-bottom');
	active_section = null;
}

// Work
function workPicker(workName) {
	if (typeof workName !== 'string' || workName.length === 0) return;
	var element = document.querySelector(`.work[data-work-name="${workName}"]`);
	if (!element) return;

	// cancel if already open
	if (active_work === workName) return;

	var card = document.getElementById(workName);
	if (active_work === '') {
		card.classList.remove('hidden');
	} else {
		// hide preivous card if one is open
		document.querySelector('.work.active').classList.remove('active');
		animateOut(`#${active_work}`, 'fade-out-right', _ => card.classList.remove('hidden'));
	}
	element.classList.add('active');
	active_work = workName;

	document.querySelectorAll('.arrow span').forEach(as => {
		as.classList.add('fade-down-twice');
		as.addEventListener('animationend', _ => as.classList.remove('fade-down-twice'), {once: true});
	})

	document.title = `${element.querySelector('.work-name').innerText.toLowerCase()} | work | kali yilmaz`;
	history.pushState('', '', `/work/${workName}`);
	trackEvent(workName, 'Work Clicked');
}

// analytics
function trackEvent(name, type) {
	return;
	try { if (umami) umami.trackEvent(name, type) } catch {console.log('Unable to track Event', name, type)}
}

// Animate functions
function animateOut(elementName, animationName, callback, animationDuration = 500) {
	var el = document.querySelector(elementName);
	el.classList.add(animationName);
	setTimeout(_ => {
		el.classList.add('hidden');
		el.classList.remove(animationName);
		if (callback) callback();
	}, animationDuration, el, animationName, callback);
}

function animateIn(elementName, animationName, callback, animationDuration = 500) {
	var el = document.querySelector(elementName);
	el.classList.remove('hidden');
	el.classList.add(animationName);
	setTimeout(_ => el.classList.remove(animationName), animationDuration, el);
	if (callback) callback();
}

// Better array shuffling
function shuffleArray(array) {
	return array.map(a => [Math.random(),a]).sort((a,b) => a[0]-b[0]).map(a => a[1])
}

function mobileViewportHack() {
	document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
}
mobileViewportHack()

var debounced, window_height = window.innerHeight
window.addEventListener('resize', _ => {
	clearTimeout(debounced);
	debounced = setTimeout(_ => {
		if (map && map.resize) map.resize();
		if (window.innerHeight === window_height) return;
		window_height = window.innerHeight;
		mobileViewportHack()
	}, 100);
});
window.addEventListener('orientationchange', mobileViewportHack);

document.querySelectorAll('a').forEach(link => {
	link.addEventListener('click', _ => {
		trackEvent(`Opening ${link.getAttribute('data-name') ? link.getAttribute('data-name') : link.hostname}`, 'URL clicked');
	})
})

document.addEventListener('DOMContentLoaded', _ => {
	redirectToSection(window.location.search);
	navbar = document.getElementById('navigation');
	navbarSections = navbar.querySelectorAll('.section-title');
	names = document.querySelectorAll('#hero span span');
	navbarSections.forEach((span,i) => {
		span.addEventListener('mouseover', _ => {killWave(i);if (active_section === null) names[i].classList.add('wave')});
		span.addEventListener('mousemove', _ => {if (active_section === null) names[i].classList.add('wave')});
		span.addEventListener('mouseout', _ => {killWave(); if (active_section === null) startWave(1500)});
	});
	startWave(1000);
}, {once: true});