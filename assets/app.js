// Helpers
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

const STORAGE_KEYS = {
	profile: "ayur_profile",
	analysis: "ayur_analysis",
	reminders: "ayur_reminders",
	feedback: "ayur_feedback",
	adminPin: "ayur_admin_pin",
	session: "ayur_session"
};

function save(key, value) { localStorage.setItem(key, JSON.stringify(value)); }
function load(key, fallback) {
	try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
}

// Tabs
function activateTab(tab) {
    $$('.tab').forEach(b => b.classList.remove('active'));
    $(`.tab[data-tab="${tab}"]`)?.classList.add('active');
    $$('.panel').forEach(p => p.classList.remove('active'));
    if (tab === 'profile' || tab === 'analysis' || tab === 'diet' || tab === 'schedule' || tab === 'followups' || tab==='summary' || tab==='admin') {
        $('#' + tab)?.classList.add('active');
    }
}

$$('.tab').forEach(btn => {
    btn.addEventListener('click', () => {
        if (btn.getAttribute('aria-disabled') === 'true') return;
        activateTab(btn.dataset.tab);
    });
    btn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            btn.click();
        }
    });
});

// Arrow navigation for tabs
const tablist = document.querySelector('.tabs');
if (tablist) {
    tablist.addEventListener('keydown', (e) => {
        const tabs = Array.from(tablist.querySelectorAll('.tab'));
        const i = tabs.indexOf(document.activeElement);
        if (i === -1) return;
        if (e.key === 'ArrowRight') { e.preventDefault(); tabs[Math.min(i+1, tabs.length-1)].focus(); }
        if (e.key === 'ArrowLeft') { e.preventDefault(); tabs[Math.max(i-1, 0)].focus(); }
        if (e.key === 'Home') { e.preventDefault(); tabs[0].focus(); }
        if (e.key === 'End') { e.preventDefault(); tabs[tabs.length-1].focus(); }
    });
}

// Footer year
const yearEl = $('#year'); if (yearEl) yearEl.textContent = new Date().getFullYear();

// Auth gate
const loginForm = $('#loginForm');
const authSection = $('#auth');
const appMain = $('.app-main');

function setLoggedIn(session) {
    save(STORAGE_KEYS.session, session);
    authSection?.classList.remove('active');
    authSection?.classList.add('hidden');
    appMain?.classList.remove('hidden');
    activateTab('profile');
    $('#summaryBar')?.classList.remove('hidden');
    renderSummaryBar();
}

const sessionState = load(STORAGE_KEYS.session, null);
if (sessionState?.loggedIn) {
    authSection?.classList.add('hidden');
    appMain?.classList.remove('hidden');
    activateTab('profile');
    $('#summaryBar')?.classList.remove('hidden');
    renderSummaryBar();
} else {
    authSection?.classList.add('active');
    appMain?.classList.add('hidden');
}

if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const data = Object.fromEntries(new FormData(loginForm).entries());
        const session = { loggedIn: true, name: data.name, email: data.email, when: Date.now() };
        setLoggedIn(session);
        // Seed profile name/email for convenience if empty
        const p = load(STORAGE_KEYS.profile, {});
        if (!p.fullName) p.fullName = data.name;
        if (!p.email) p.email = data.email;
        save(STORAGE_KEYS.profile, p);
        hydrateProfileForm(p);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// Profile
const profileForm = $('#profileForm');
const loadExampleBtn = $('#loadExample');

function hydrateProfileForm(data) {
	if (!data) return;
	Object.entries(data).forEach(([k, v]) => {
		if (profileForm.elements[k]) profileForm.elements[k].value = v;
	});
}

hydrateProfileForm(load(STORAGE_KEYS.profile, null));

profileForm.addEventListener('submit', (e) => {
	e.preventDefault();
	const formData = Object.fromEntries(new FormData(profileForm).entries());
	// Normalize number fields
	['age','heightCm','weightKg'].forEach(k => formData[k] = formData[k] ? Number(formData[k]) : null);
	save(STORAGE_KEYS.profile, formData);
	alert('Profile saved.');
	refreshAdminTables();
    // Auto-advance to analysis
    activateTab('analysis');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    renderSummaryBar();
});

loadExampleBtn.addEventListener('click', () => {
	hydrateProfileForm(EXAMPLE_PROFILE);
});

// Analysis questionnaire
const analysisForm = $('#analysisForm');
const loadYourAnswersBtn = $('#loadYourAnswers');
const analysisResult = $('#analysisResult');
const wellnessContainer = $('#wellnessSuggestions');

function scoreDosha(answers) {
	const score = { Vata: 0, Pitta: 0, Kapha: 0 };
	// Map answers to doshas
	const map = {
		skin: { dry: 'Vata', oily: 'Pitta', balanced: 'Kapha' },
		body: { slim: 'Vata', muscular: 'Pitta', heavy: 'Kapha' },
		hair: { dry: 'Vata', oily: 'Pitta', thick: 'Kapha' },
		eyes: { small: 'Vata', medium: 'Pitta', large: 'Kapha' },
		mindset: { restless: 'Vata', intense: 'Pitta', calm: 'Kapha' },
		memory: { forgetful: 'Vata', sharp: 'Pitta', slowlong: 'Kapha' },
		emotions: { anxious: 'Vata', angry: 'Pitta', content: 'Kapha' },
		dietpref: { lightSweet: 'Kapha', hotspicy: 'Pitta', coldspicy: 'Pitta' },
		sleep: { light: 'Vata', moderate: 'Pitta', deep: 'Kapha' },
		energy: { variable: 'Vata', high: 'Pitta', balanced: 'Kapha' },
		weather: { warm: 'Vata', hot: 'Pitta', cool: 'Kapha' },
		stress: { anxious: 'Vata', irritable: 'Pitta', calm: 'Kapha' }
	};
	Object.entries(answers).forEach(([k, v]) => {
		const d = map[k]?.[v];
		if (d) score[d]++;
	});
	// Determine dominant(s)
	const entries = Object.entries(score).sort((a,b) => b[1]-a[1]);
	const top = entries[0][1];
	const dominants = entries.filter(([_, val]) => val === top).map(([k]) => k);
	return { score, dominants };
	
}

function explainDosha(dominants) {
	const texts = {
		Vata: "Creative, quick, variable energy — benefits from warmth and routine.",
		Pitta: "Focused, driven, warm — benefits from cooling foods and calm mind.",
		Kapha: "Steady, resilient, calm — benefits from light, stimulating routines."
	};
	return dominants.map(d => `${d}: ${texts[d]}`).join(' \n');
}

analysisForm.addEventListener('submit', (e) => {
	e.preventDefault();
	const answers = Object.fromEntries(new FormData(analysisForm).entries());
	const { score, dominants } = scoreDosha(answers);
	const doshaText = dominants.join('-');
	$('.dosha', analysisResult).textContent = `Dominant Prakriti: ${doshaText}`;
	$('.explain', analysisResult).textContent = explainDosha(dominants);
	analysisResult.classList.remove('hidden');
	const record = { answers, dominants, score, when: Date.now() };
	save(STORAGE_KEYS.analysis, record);
	// Refresh diet & schedule
	renderDiet(dominants);
	renderSchedule(dominants);
	renderWellness(dominants);
    renderSummary(dominants);
	refreshAdminTables();
    // Auto-advance to summary
    activateTab('summary');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    renderSummaryBar();
});

loadYourAnswersBtn.addEventListener('click', () => {
	Object.entries(EXAMPLE_ANSWERS).forEach(([k,v]) => { if (analysisForm.elements[k]) analysisForm.elements[k].value = v; });
});

// Diet rendering
function renderDiet(dominants) {
	const dietEl = $('#dietContent');
	dietEl.innerHTML = '';
	if (!dominants || !dominants.length) {
		dietEl.innerHTML = '<div class="muted">Complete the analysis to see diet suggestions.</div>';
		return;
	}
    // Show recommendations
    dominants.forEach(d => {
        (DOSHA_DIET[d] || []).forEach(item => {
            const div = document.createElement('div');
            div.className = 'card';
            div.innerHTML = `<h3>${d}: ${item.title}</h3><p class="muted">${item.desc}</p>`;
            dietEl.appendChild(div);
        });
    });
    // Full meal plan from primary dosha
    const primary = dominants[0];
    const plan = DOSHA_MEAL_PLAN[primary];
    if (plan) {
        const card = document.createElement('div');
        card.className = 'card';
        const rows = Object.entries(plan).map(([meal, items]) => `
            <tr><th>${meal}</th><td>${items.map(i=>`• ${i}`).join('<br>')}</td></tr>
        `).join('');
        card.innerHTML = `<h3>${primary} Meal Plan</h3><table class="table"><tbody>${rows}</tbody></table>`;
        dietEl.appendChild(card);
    }
}

// Schedule rendering
function renderSchedule(dominants) {
	const schedEl = $('#scheduleContent');
	schedEl.innerHTML = '';
	if (!dominants || !dominants.length) {
		schedEl.innerHTML = '<div class="muted">Complete the analysis to see your routine.</div>';
		return;
	}
	// Use first dominant as primary for schedule
	const primary = dominants[0];
	(DOSHA_SCHEDULE[primary] || []).forEach(ev => {
		const row = document.createElement('div');
		row.className = 'event';
		row.innerHTML = `<div class="time">${ev.time}</div><div class="desc">${ev.desc}</div>`;
		schedEl.appendChild(row);
	});
}

// Wellness rendering
function renderWellness(dominants) {
    if (!wellnessContainer) return;
    wellnessContainer.innerHTML = '';
    if (!dominants || !dominants.length) return;
    dominants.forEach(d => {
        (DOSHA_WELLNESS[d] || []).forEach(w => {
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `<h3>${d}: ${w.title}</h3><p class="muted">${w.desc}</p>`;
            wellnessContainer.appendChild(card);
        });
    });
}

// Initialize diet/schedule if previous analysis exists
const lastAnalysis = load(STORAGE_KEYS.analysis, null);
if (lastAnalysis) {
	analysisResult.classList.remove('hidden');
	$('.dosha', analysisResult).textContent = `Dominant Prakriti: ${lastAnalysis.dominants.join('-')}`;
	$('.explain', analysisResult).textContent = explainDosha(lastAnalysis.dominants);
	renderDiet(lastAnalysis.dominants);
	renderSchedule(lastAnalysis.dominants);
    renderWellness(lastAnalysis.dominants);
    renderSummary(lastAnalysis.dominants);
    renderSummaryBar();
}

// Follow-ups: Reminders
const reminderForm = $('#reminderForm');
const remindersList = $('#remindersList');

function loadReminders() { return load(STORAGE_KEYS.reminders, []); }
function saveReminders(items) { save(STORAGE_KEYS.reminders, items); }

function renderReminders() {
	const items = loadReminders();
	remindersList.innerHTML = '';
	items
		.sort((a,b) => a.when - b.when)
		.forEach((r, idx) => {
			const li = document.createElement('li');
			const when = new Date(r.when).toLocaleString();
			const status = Date.now() > r.when ? 'Due' : 'Scheduled';
			li.innerHTML = `<span><strong>${r.title}</strong><br><span class="muted">${when}</span></span><span class="pill ${status==='Due'?'warn':'ok'}">${status}</span>`;
			li.addEventListener('click', () => { if (confirm('Delete this reminder?')) { const arr = loadReminders(); arr.splice(idx,1); saveReminders(arr); renderReminders(); refreshAdminTables(); } });
			remindersList.appendChild(li);
		});
}

reminderForm.addEventListener('submit', (e) => {
	e.preventDefault();
	const data = Object.fromEntries(new FormData(reminderForm).entries());
	const when = new Date(data.datetime).getTime();
	if (Number.isNaN(when)) return alert('Please choose a valid date & time.');
	const items = loadReminders();
	items.push({ title: data.title, when, done: false });
	saveReminders(items);
	reminderForm.reset();
	renderReminders();
	refreshAdminTables();
	tryScheduleNotification({ title: data.title, when });
});

function tryScheduleNotification({ title, when }) {
	if (!('Notification' in window)) return; // Not supported
	if (Notification.permission === 'granted') scheduleCheck();
	else if (Notification.permission !== 'denied') {
		Notification.requestPermission().then(p => { if (p === 'granted') scheduleCheck(); });
	}
	function scheduleCheck() {
		const delay = Math.max(0, when - Date.now());
		setTimeout(() => { new Notification('Reminder', { body: title }); }, Math.min(delay, 60*60*1000));
	}
}

renderReminders();
renderSummaryBar();

// Follow-ups: Feedback
const feedbackForm = $('#feedbackForm');
const feedbackList = $('#feedbackList');

function loadFeedback() { return load(STORAGE_KEYS.feedback, []); }
function saveFeedback(items) { save(STORAGE_KEYS.feedback, items); }

function renderFeedback() {
	const items = loadFeedback().slice(-20).reverse();
	feedbackList.innerHTML = '';
	items.forEach((f, idx) => {
		const li = document.createElement('li');
		li.innerHTML = `<span><strong>${f.mood}</strong><br><span class="muted">${new Date(f.when).toLocaleString()}</span><br>${f.feedback || ''}</span><button class="btn" aria-label="delete">Delete</button>`;
		$('button', li).addEventListener('click', () => { const arr = loadFeedback(); arr.splice(arr.length-1-idx, 1); saveFeedback(arr); renderFeedback(); });
		feedbackList.appendChild(li);
	});
}

feedbackForm.addEventListener('submit', (e) => {
	e.preventDefault();
	const data = Object.fromEntries(new FormData(feedbackForm).entries());
	const items = loadFeedback();
	items.push({ ...data, when: Date.now() });
	saveFeedback(items);
	feedbackForm.reset();
	renderFeedback();
});

renderFeedback();
renderSummaryBar();

// Admin Panel
const adminPinInput = $('#adminPin');
const adminLoginBtn = $('#adminLogin');
const adminAuth = $('#adminAuth');
const adminContent = $('#adminContent');
const studentsTableBody = $('#studentsTable tbody');
const followupsTableBody = $('#followupsTable tbody');
const exportBtn = $('#exportData');
const importFile = $('#importFile');
const newPinInput = $('#newPin');
const changePinBtn = $('#changePin');
const adminEditForm = $('#adminEditProfile');

// Default PIN if not set
if (!load(STORAGE_KEYS.adminPin, null)) save(STORAGE_KEYS.adminPin, { pin: '1234' });

adminLoginBtn.addEventListener('click', () => {
	const { pin } = load(STORAGE_KEYS.adminPin, { pin: '1234' });
	if (adminPinInput.value === pin) {
		adminAuth.classList.add('hidden');
		adminContent.classList.remove('hidden');
		refreshAdminTables();
	} else {
		alert('Incorrect PIN');
	}
});

function refreshAdminTables() {
	// Students from single profile for demo; could be extended to list
	const p = load(STORAGE_KEYS.profile, null);
	const a = load(STORAGE_KEYS.analysis, null);
	studentsTableBody.innerHTML = '';
	if (p) {
		const tr = document.createElement('tr');
		const dosha = a ? a.dominants.join('-') : '—';
		tr.innerHTML = `<td>${p.fullName || '—'}</td><td>${p.age || '—'}</td><td>${dosha}</td><td>${p.email || '—'}</td>`;
		studentsTableBody.appendChild(tr);
	}
	// Followups from reminders
	followupsTableBody.innerHTML = '';
	loadReminders().forEach((r, i) => {
		const tr = document.createElement('tr');
		const when = new Date(r.when).toLocaleString();
		const due = Date.now() > r.when;
		tr.innerHTML = `<td>${r.title}</td><td>${when}</td><td>${due?'<span class="pill warn">Due</span>':'<span class="pill ok">Scheduled</span>'}</td><td><button class="btn">Mark Done</button></td>`;
		$('button', tr).addEventListener('click', () => {
			const arr = loadReminders();
			arr.splice(i, 1);
			saveReminders(arr);
			refreshAdminTables();
			renderReminders();
		});
		followupsTableBody.appendChild(tr);
	});
}

// Initial admin table hydration on open
if (!adminContent.classList.contains('hidden')) refreshAdminTables();

// Flow lock: disable tabs until analysis
function updateTabLocks() {
    const analyzed = !!load(STORAGE_KEYS.analysis, null);
    const lockTabs = ['diet','schedule','followups','summary'];
    lockTabs.forEach(t => {
        const el = document.querySelector(`.tab[data-tab="${t}"]`);
        if (!el) return;
        if (!analyzed) el.setAttribute('aria-disabled','true'); else el.removeAttribute('aria-disabled');
    });
}
updateTabLocks();

// Summary Bar rendering (always visible)
function renderSummaryBar() {
    const bar = $('#summaryBar');
    if (!bar || bar.classList.contains('hidden')) return;
    const data = load(STORAGE_KEYS.analysis, null);
    const t = $('#summaryBarTitle');
    const d = $('#summaryBarDesc');
    if (!data) {
        t.textContent = 'Not analyzed yet';
        d.textContent = 'Complete the Prakriti Analysis to see your personalized summary here.';
    } else {
        t.textContent = `Prakriti: ${data.dominants.join('-')}`;
        d.textContent = 'Open Summary for diet highlights, schedule preview, and recent progress.';
    }
    // quick-nav buttons
    $$('#summaryBar [data-jump]').forEach(btn => btn.onclick = () => activateTab(btn.getAttribute('data-jump')));
}

// Summary rendering
function renderSummary(dominants) {
    const cons = $('#summaryConstitution');
    const sched = $('#summarySchedule');
    const diet = $('#summaryDiet');
    const sFollows = $('#summaryFollowups');
    const sFeedback = $('#summaryFeedback');
    if (!cons || !sched || !diet) return;
    cons.querySelector('.dosha').textContent = `Dominant Prakriti: ${dominants.join('-')}`;
    cons.querySelector('.explain').textContent = explainDosha(dominants);
    // Diet highlights
    diet.innerHTML = '';
    (DOSHA_DIET[dominants[0]] || []).slice(0,3).forEach(item => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `<h3>${item.title}</h3><p class="muted">${item.desc}</p>`;
        diet.appendChild(card);
    });
    // Schedule preview
    sched.innerHTML = '';
    (DOSHA_SCHEDULE[dominants[0]] || []).slice(0,4).forEach(ev => {
        const row = document.createElement('div');
        row.className = 'event';
        row.innerHTML = `<div class="time">${ev.time}</div><div class="desc">${ev.desc}</div>`;
        sched.appendChild(row);
    });
    // Follow-ups preview
    sFollows.innerHTML = '';
    loadReminders().slice(0,5).forEach(r => {
        const li = document.createElement('li');
        li.innerHTML = `<span><strong>${r.title}</strong><br><span class=\"muted\">${new Date(r.when).toLocaleString()}</span></span>`;
        sFollows.appendChild(li);
    });
    // Feedback preview
    sFeedback.innerHTML = '';
    loadFeedback().slice(-3).reverse().forEach(f => {
        const li = document.createElement('li');
        li.innerHTML = `<span><strong>${f.mood}</strong><br><span class=\"muted\">${new Date(f.when).toLocaleString()}</span><br>${f.feedback || ''}</span>`;
        sFeedback.appendChild(li);
    });
}

// Admin: Export
if (exportBtn) {
    exportBtn.addEventListener('click', () => {
        const payload = {
            profile: load(STORAGE_KEYS.profile, null),
            analysis: load(STORAGE_KEYS.analysis, null),
            reminders: load(STORAGE_KEYS.reminders, []),
            feedback: load(STORAGE_KEYS.feedback, []),
            meta: { exportedAt: new Date().toISOString(), app: 'AyurPrakriti' }
        };
        const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'ayurprakriti-backup.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });
}

// Admin: Import
if (importFile) {
    importFile.addEventListener('change', (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            try {
                const data = JSON.parse(reader.result);
                if (data.profile !== undefined) save(STORAGE_KEYS.profile, data.profile);
                if (data.analysis !== undefined) save(STORAGE_KEYS.analysis, data.analysis);
                if (data.reminders !== undefined) save(STORAGE_KEYS.reminders, data.reminders);
                if (data.feedback !== undefined) save(STORAGE_KEYS.feedback, data.feedback);
                alert('Data imported.');
                refreshAdminTables();
                renderReminders();
                renderFeedback();
                if (data.analysis?.dominants) {
                    $('.dosha', analysisResult).textContent = `Dominant Prakriti: ${data.analysis.dominants.join('-')}`;
                    $('.explain', analysisResult).textContent = explainDosha(data.analysis.dominants);
                    analysisResult.classList.remove('hidden');
                    renderDiet(data.analysis.dominants);
                    renderSchedule(data.analysis.dominants);
                    renderWellness(data.analysis.dominants);
                }
            } catch (err) {
                alert('Invalid file.');
            }
        };
        reader.readAsText(file);
        e.target.value = '';
    });
}

// Admin: Change PIN
if (changePinBtn) {
    changePinBtn.addEventListener('click', () => {
        const newPin = (newPinInput?.value || '').trim();
        if (!newPin) return alert('Enter a new PIN.');
        save(STORAGE_KEYS.adminPin, { pin: newPin });
        newPinInput.value = '';
        alert('PIN updated.');
    });
}

// Admin: Edit Profile
if (adminEditForm) {
    // Prefill
    const p = load(STORAGE_KEYS.profile, null);
    if (p) Object.entries(p).forEach(([k,v]) => { if (adminEditForm.elements[k]) adminEditForm.elements[k].value = v; });
    adminEditForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = Object.fromEntries(new FormData(adminEditForm).entries());
        ['age','heightCm','weightKg'].forEach(k => formData[k] = formData[k] ? Number(formData[k]) : null);
        save(STORAGE_KEYS.profile, formData);
        alert('Profile updated.');
        hydrateProfileForm(formData);
        refreshAdminTables();
    });
}


