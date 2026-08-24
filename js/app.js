/* HC & LSY 专属情侣空间 - 主应用逻辑 */
(function () {
    'use strict';

    const CONFIG = {
        defaultPasswords: { hc: '123456', lsy: '123456' },
        adminPassword: '88888888',
        defaultGithub: {
            owner: '2829186707-jpg',
            repo: 'hc-lsy',
            token: ''
        },
        storageKeys: {
            auth: 'hc_lsy_auth', currentUser: 'hc_lsy_current_user', passwords: 'hc_lsy_passwords',
            pwdVersion: 'hc_lsy_pwd_version', github: 'hc_lsy_github_config', anniversary: 'hc_lsy_anniversary',
            anniversaries: 'hc_lsy_anniversaries', photos: 'hc_lsy_photos', diaries: 'hc_lsy_diaries',
            wishes: 'hc_lsy_wishes', messages: 'hc_lsy_messages', letters: 'hc_lsy_letters',
            trips: 'hc_lsy_trips', music: 'hc_lsy_music', coverImage: 'hc_lsy_cover',
            darkMode: 'hc_lsy_dark', missYou: 'hc_lsy_missyou', recycleBin: 'hc_lsy_recycle',
            qaAnswers: 'hc_lsy_qa', weather: 'hc_lsy_weather', period: 'hc_lsy_period',
            albums: 'hc_lsy_albums', dataVersion: 'hc_lsy_data_version'
        },
        githubApiBase: 'https://api.github.com',
        passwordVersion: 2
    };

    const QUOTES = ['愿有岁月可回首，且以深情共白头','你是我枯燥生活里的来日方长','山河远阔，人间烟火，无一是你，无一不是你','我喜欢你，像风走了八千里，不问归期','你是我的今天，以及所有的明天','遇见你，是我所有美好故事的开始','世界上最幸福的事，就是你喜欢的人正好也喜欢你','你是我的小确幸，也是我的大欢喜','余生很长，想和你没完没了','你是我藏在星星里的浪漫','喜欢是乍见之欢，爱是久处不厌','你是我的满目山河，也是我的可爱不可得','我想和你一起生活，在某个小镇，共享无尽的黄昏','你是我的春夏秋冬，也是我的往后余生','所有的美好，都值得被等待；而你，值得我等待'];

    const QA_QUESTIONS = [
        '第一次见面是什么时候？在哪里？','第一次约会去了哪里？','对方最吸引你的地方是什么？','最喜欢对方的哪个习惯？','最难忘的一次旅行是哪里？','一起做过最疯狂的事是什么？','对方最喜欢吃什么？','最想和对方一起去的地方是哪里？','第一次说"我爱你"是什么时候？','对方最让你感动的一件事？','你们的共同爱好是什么？','如果有一天分开了，最舍不得的是什么？','对方的口头禅是什么？','最想对对方说的一句话？','你们是怎么在一起的？谁先表白的？','在一起后最大的变化是什么？','最期待和对方一起做什么事？','对方身上有什么是你想学习的？','你们的第一份共同回忆是什么？','如果可以回到过去，你想回到哪一刻？','对方做过最傻的事是什么？','最浪漫的一次约会是怎样的？','你们的纪念日是怎么过的？','对方最喜欢的电影/音乐是什么？','一起养过宠物吗？想养什么？','对未来的规划是什么？','对方生气时你怎么哄？','你最欣赏对方的什么品质？','一起度过最难的时刻是什么？','如果用三个词形容对方，会是哪三个？'
    ];

    // 问答书按主题分类（保持原始索引不变，不影响已有答案数据）
    const QA_CATEGORIES = [
        { name: '初识回忆篇', icon: '💕', indices: [0, 1, 8, 14, 18, 21] },
        { name: '日常相处篇', icon: '☕', indices: [3, 6, 10, 12, 23, 26] },
        { name: '深度情感篇', icon: '💗', indices: [2, 9, 11, 13, 27, 28] },
        { name: '未来规划篇', icon: '🌈', indices: [4, 7, 16, 22, 24, 25] },
        { name: '趣味假设篇', icon: '✨', indices: [5, 15, 17, 19, 20, 29] }
    ];

    // 日记模板
    const DIARY_TEMPLATES = {
        daily: { title: '日常碎碎念', content: '今天的天气：\n今天做了什么：\n想对TA说：\n今日小确幸：' },
        travel: { title: '旅行日记', content: '📍 目的地：\n📅 日期：\n🚗 交通方式：\n🍜 吃了什么：\n📷 最难忘的瞬间：\n💭 旅行感受：' },
        anniversary: { title: '纪念日', content: '🎉 今天是什么日子：\n⏰ 在一起已经：\n💝 今天做了什么：\n🌹 最感动的瞬间：\n📝 想对未来的我们说：' },
        food: { title: '美食记录', content: '🍽️ 餐厅/店名：\n📍 地址：\n⭐ 评分：\n👍 推荐菜品：\n👎 踩雷菜品：\n💭 整体感受：' },
        reconcile: { title: '吵架和好', content: '😤 吵架原因：\n🤔 我的想法：\n💡 TA的想法：\n❤️ 怎么和好的：\n📝 下次怎么避免：' },
        blank: { title: '', content: '' }
    };

    const DATE_IDEAS = [
        { title: '夜市觅食', desc: '找一个热闹的夜市，从头吃到尾，尝试各种小吃，边走边聊。' },
        { title: '公园野餐', desc: '准备一些三明治、水果和饮料，去公园草坪上晒太阳野餐。' },
        { title: 'DIY手工坊', desc: '一起去做陶艺、绘画或手工，制作属于你们的专属纪念品。' },
        { title: '深夜电影', desc: '选一场深夜场电影，买一桶爆米花，享受两个人的安静时光。' },
        { title: '城市漫步', desc: '没有目的地，随便坐一辆公交车，看到有趣的地方就下车探索。' },
        { title: '一起做饭', desc: '买食材回家，一起研究一道新菜，哪怕做砸了也是乐趣。' },
        { title: '看日出/日落', desc: '早起去山顶或海边看日出，或者傍晚去江边看日落。' },
        { title: '桌游之夜', desc: '买一副新桌游，在家点外卖，玩一整晚的桌游。' },
        { title: '博物馆约会', desc: '去一个没去过的博物馆或美术馆，边看边讨论。' },
        { title: '骑行兜风', desc: '租两辆自行车，沿着江边或绿道骑行，感受风的自由。' },
        { title: 'KTV对唱', desc: '去KTV点一堆情歌对唱，跑调也没关系，开心最重要。' },
        { title: '温泉/SPA', desc: '一起去泡温泉或做SPA，放松身心，享受悠闲时光。' },
        { title: '密室逃脱', desc: '选一个主题密室，两个人合作解谜，考验默契的时候到了。' },
        { title: '拍照打卡', desc: '找一个网红拍照地，互相拍照，留下美美的回忆。' },
        { title: '读书角', desc: '去一家安静的书店或咖啡馆，各看各的书，偶尔抬头相视一笑。' },
        { title: '露营看星星', desc: '去郊外露营，晚上躺在帐篷里看星星，聊到睡着。' },
        { title: '烘焙挑战', desc: '一起尝试做蛋糕或饼干，失败了就当黑暗料理体验。' },
        { title: '逛街不购物', desc: '只是逛街看看橱窗，不一定要买东西，享受陪伴的感觉。' },
        { title: '电玩城', desc: '去电玩城抓娃娃、玩投篮机、跳舞机，像孩子一样开心。' },
        { title: '旧地重游', desc: '回到第一次约会的地方，回忆当时的心情和故事。' }
    ];

    const WEATHER_CODES = {
        0: { icon: '☀️', desc: '晴' }, 1: { icon: '🌤️', desc: '大部晴' }, 2: { icon: '⛅', desc: '多云' }, 3: { icon: '☁️', desc: '阴' },
        45: { icon: '🌫️', desc: '雾' }, 48: { icon: '🌫️', desc: '雾凇' },
        51: { icon: '🌦️', desc: '小毛毛雨' }, 53: { icon: '🌦️', desc: '毛毛雨' }, 55: { icon: '🌧️', desc: '大毛毛雨' },
        61: { icon: '🌧️', desc: '小雨' }, 63: { icon: '🌧️', desc: '中雨' }, 65: { icon: '🌧️', desc: '大雨' },
        71: { icon: '🌨️', desc: '小雪' }, 73: { icon: '🌨️', desc: '中雪' }, 75: { icon: '❄️', desc: '大雪' },
        80: { icon: '🌦️', desc: '阵雨' }, 81: { icon: '🌧️', desc: '阵雨' }, 82: { icon: '⛈️', desc: '暴雨' },
        95: { icon: '⛈️', desc: '雷暴' }, 96: { icon: '⛈️', desc: '雷暴冰雹' }, 99: { icon: '⛈️', desc: '强雷暴' }
    };

    const state = {
        currentUser: null, currentView: 'home', photos: [], diaries: [], wishes: [],
        messages: [], anniversaries: [], letters: [], trips: [], qaAnswers: {}, albums: [],
        githubConfig: null, selectedMood: '', selectedColor: 'pink',
        editingDiaryId: null, editingTripId: null, currentQaIndex: -1,
        lightboxIndex: -1, lightboxSource: 'gallery', lightboxDiaryId: null,
        pendingFiles: [], diaryPendingPhotos: [], music: null, audio: null,
        isPlaying: false, currentQuoteIndex: 0, missYouToday: {}, recycleBin: [],
        collageSelected: [], blindboxDrawn: null, annualYear: null, galleryView: 'time',
        slideshowPlaying: false, slideshowTimer: null, slideshowSpeed: 3000
    };

    // ========== 工具 ==========
    const utils = {
        async hashPassword(pw) {
            const salted = pw + 'hc_lsy_salt_2026';
            if (window.crypto && crypto.subtle) {
                try {
                    const data = new TextEncoder().encode(salted);
                    const buf = await crypto.subtle.digest('SHA-256', data);
                    return 'sha256_' + Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
                } catch (e) {}
            }
            return 'simple_' + this.simpleHash(salted);
        },
        simpleHash(str) {
            let h1 = 5381, h2 = 52711;
            for (let i = 0; i < str.length; i++) { const c = str.charCodeAt(i); h1 = ((h1 << 5) + h1) ^ c; h2 = ((h2 << 5) + h2) ^ c; }
            const a = (h1 >>> 0).toString(16).padStart(8, '0'), b = (h2 >>> 0).toString(16).padStart(8, '0');
            let m = ''; for (let i = 0; i < 8; i++) m += a[i] + b[i];
            return m + a + b;
        },
        generateId() { return Date.now().toString(36) + Math.random().toString(36).substr(2, 9); },
        formatDate(ds) { if (!ds) return ''; const d = new Date(ds); return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`; },
        formatDateInput(date) { const d = date || new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; },
        formatMonth(ds) { const d = new Date(ds); return `${d.getFullYear()}年${d.getMonth() + 1}月`; },
        todayStr() { return this.formatDateInput(); },
        daysBetween(ds) { if (!ds) return 0; return Math.max(0, Math.floor((new Date() - new Date(ds)) / 86400000)); },
        daysUntil(ds) {
            if (!ds) return 0;
            const target = new Date(ds), now = new Date();
            target.setFullYear(now.getFullYear());
            if (target < now) target.setFullYear(now.getFullYear() + 1);
            return Math.ceil((target - now) / 86400000);
        },
        isSameDay(ds) { if (!ds) return false; const d = new Date(ds), n = new Date(); return d.getMonth() === n.getMonth() && d.getDate() === n.getDate(); },
        fileToBase64(file) { return new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result); r.onerror = rej; r.readAsDataURL(file); }); },
        async compressImage(file, maxW = 1280, q = 0.82) {
            return new Promise((res, rej) => {
                const img = new Image(), url = URL.createObjectURL(file);
                img.onload = () => {
                    URL.revokeObjectURL(url);
                    let { width, height } = img;
                    if (width > maxW) { height = (height * maxW) / width; width = maxW; }
                    const c = document.createElement('canvas'); c.width = width; c.height = height;
                    c.getContext('2d').drawImage(img, 0, 0, width, height);
                    c.toBlob(b => res(b), 'image/jpeg', q);
                };
                img.onerror = rej; img.src = url;
            });
        },
        escapeHtml(text) { const d = document.createElement('div'); d.textContent = text; return d.innerHTML; },
        isVideo(file) { return file.type.startsWith('video/'); }
    };

    const storage = {
        get(k, def = null) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : def; } catch { return def; } },
        set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { toast('存储空间不足', 'error'); } },
        remove(k) { localStorage.removeItem(k); }
    };

    function toast(msg, type = 'info') {
        const c = document.getElementById('toastContainer');
        const el = document.createElement('div'); el.className = `toast ${type}`; el.textContent = msg;
        c.appendChild(el); setTimeout(() => el.remove(), 3000);
    }

    function initFloatingHearts() {
        const c = document.getElementById('heartsBg'), hs = ['♥', '♡', '❤', '💕'];
        const n = window.innerWidth < 768 ? 8 : 14;
        for (let i = 0; i < n; i++) {
            const h = document.createElement('span'); h.className = 'floating-heart';
            h.textContent = hs[Math.floor(Math.random() * hs.length)];
            h.style.left = Math.random() * 100 + '%';
            h.style.fontSize = (10 + Math.random() * 18) + 'px';
            h.style.animationDuration = (9 + Math.random() * 12) + 's';
            h.style.animationDelay = (Math.random() * 12) + 's';
            c.appendChild(h);
        }
    }

    function launchConfetti(duration = 3000) {
        const layer = document.getElementById('confettiLayer');
        const colors = ['#b89a97', '#c9a87c', '#f5c6cf', '#d4c0bd', '#e8d5d0', '#f0e0c8'];
        for (let i = 0; i < 80; i++) {
            const p = document.createElement('div'); p.className = 'confetti-piece';
            p.style.left = Math.random() * 100 + '%';
            p.style.background = colors[Math.floor(Math.random() * colors.length)];
            p.style.animationDuration = (2 + Math.random() * 2) + 's';
            p.style.animationDelay = (Math.random() * 0.5) + 's';
            p.style.width = (6 + Math.random() * 8) + 'px';
            p.style.height = (6 + Math.random() * 8) + 'px';
            p.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
            layer.appendChild(p);
            setTimeout(() => p.remove(), 4500);
        }
    }

    // ========== 主题 ==========
    const theme = {
        init() {
            if (storage.get(CONFIG.storageKeys.darkMode)) {
                document.body.classList.add('dark-mode');
                document.getElementById('themeToggle').textContent = '☀️';
            }
        },
        toggle() {
            const isDark = document.body.classList.toggle('dark-mode');
            storage.set(CONFIG.storageKeys.darkMode, isDark);
            document.getElementById('themeToggle').textContent = isDark ? '☀️' : '🌙';
        }
    };

    // ========== 封面 ==========
    const cover = {
        init() { const img = storage.get(CONFIG.storageKeys.coverImage); if (img) this.apply(img); },
        apply(dataUrl) {
            const hero = document.getElementById('heroCover'), bg = document.getElementById('heroCoverBg');
            bg.style.backgroundImage = `url(${dataUrl})`;
            hero.classList.add('has-custom-bg');
            document.getElementById('coverStatus').textContent = '已设置自定义封面';
            document.getElementById('removeCoverBtn').style.display = 'inline-block';
        },
        remove() {
            const hero = document.getElementById('heroCover'), bg = document.getElementById('heroCoverBg');
            bg.style.backgroundImage = ''; hero.classList.remove('has-custom-bg');
            storage.remove(CONFIG.storageKeys.coverImage);
            document.getElementById('coverStatus').textContent = '使用默认渐变';
            document.getElementById('removeCoverBtn').style.display = 'none';
            app.saveData();
        },
        async set(file) {
            if (!file.type.startsWith('image/')) { toast('请选择图片文件', 'error'); return; }
            const compressed = await utils.compressImage(file, 1920, 0.85);
            const dataUrl = await utils.fileToBase64(compressed);
            storage.set(CONFIG.storageKeys.coverImage, dataUrl);
            this.apply(dataUrl); app.saveData(); toast('封面已设置 ♥', 'success');
        }
    };

    // ========== 音乐 ==========
    const music = {
        init() { const s = storage.get(CONFIG.storageKeys.music); if (s && s.dataUrl) { state.music = s; this.show(); this.updateUI(); } },
        show() { document.getElementById('musicControl').style.display = 'flex'; },
        hide() { document.getElementById('musicControl').style.display = 'none'; },
        updateUI() {
            if (state.music) {
                document.getElementById('musicName').textContent = state.music.name || '我们的歌';
                document.getElementById('musicStatus').textContent = state.music.name || '已设置';
                document.getElementById('removeMusicBtn').style.display = 'inline-block';
            }
        },
        async set(file) {
            if (!file.type.startsWith('audio/')) { toast('请选择音频文件', 'error'); return; }
            const dataUrl = await utils.fileToBase64(file);
            state.music = { name: file.name, dataUrl };
            storage.set(CONFIG.storageKeys.music, state.music);
            if (state.audio) { state.audio.pause(); state.audio = null; }
            this.show(); this.updateUI(); app.saveData(); toast('音乐已设置 ♪', 'success');
        },
        toggle() {
            if (!state.music) return;
            if (!state.audio) {
                state.audio = new Audio(state.music.dataUrl);
                state.audio.loop = true;
                state.audio.onended = () => { state.isPlaying = false; this.updateBtn(); };
            }
            if (state.isPlaying) { state.audio.pause(); state.isPlaying = false; }
            else { state.audio.play().catch(() => toast('播放失败', 'error')); state.isPlaying = true; }
            this.updateBtn();
        },
        updateBtn() {
            const btn = document.getElementById('musicToggle'), icon = document.getElementById('musicIcon');
            if (state.isPlaying) { btn.classList.add('playing'); icon.textContent = '♫'; }
            else { btn.classList.remove('playing'); icon.textContent = '♪'; }
        },
        remove() {
            if (state.audio) { state.audio.pause(); state.audio = null; }
            state.music = null; state.isPlaying = false;
            storage.remove(CONFIG.storageKeys.music);
            this.hide(); document.getElementById('musicStatus').textContent = '未设置';
            document.getElementById('removeMusicBtn').style.display = 'none';
            app.saveData();
        }
    };

    // ========== 想你了 ==========
    const missYou = {
        init() {
            const today = utils.todayStr();
            const data = storage.get(CONFIG.storageKeys.missYou, {});
            state.missYouToday = data[today] || {};
            this.updateUI();
        },
        press(user) {
            if (user !== state.currentUser) { toast('只能打卡自己的哦', 'error'); return; }
            const today = utils.todayStr();
            const data = storage.get(CONFIG.storageKeys.missYou, {});
            if (!data[today]) data[today] = {};
            data[today][user] = true;
            storage.set(CONFIG.storageKeys.missYou, data);
            state.missYouToday = data[today];
            this.updateUI();
            app.saveData();
            if (state.missYouToday.hc && state.missYouToday.lsy) { launchConfetti(); toast('今天双向奔赴 ♥', 'success'); }
            else toast(`${user.toUpperCase()} 想你了 ♥`, 'success');
        },
        updateUI() {
            const today = utils.todayStr();
            document.getElementById('missYouDate').textContent = utils.formatDate(today);
            const hc = !!state.missYouToday.hc, lsy = !!state.missYouToday.lsy;
            const hcBtn = document.getElementById('missYouHc'), lsyBtn = document.getElementById('missYouLsy');
            hcBtn.classList.toggle('active', hc);
            lsyBtn.classList.toggle('active', lsy);
            // 权限隔离：只能点自己的按钮
            hcBtn.style.opacity = state.currentUser === 'hc' ? '1' : '0.5';
            hcBtn.style.pointerEvents = state.currentUser === 'hc' ? 'auto' : 'none';
            lsyBtn.style.opacity = state.currentUser === 'lsy' ? '1' : '0.5';
            lsyBtn.style.pointerEvents = state.currentUser === 'lsy' ? 'auto' : 'none';
            document.getElementById('missHcStatus').textContent = hc ? '已打卡 ♥' : (state.currentUser === 'hc' ? '未打卡' : '等待 HC 打卡');
            document.getElementById('missLsyStatus').textContent = lsy ? '已打卡 ♥' : (state.currentUser === 'lsy' ? '未打卡' : '等待 LSY 打卡');
            const heart = document.getElementById('missYouHeart'), result = document.getElementById('missYouResult');
            if (hc && lsy) { heart.classList.add('matched'); heart.textContent = '♥'; result.textContent = '今天双向奔赴 ♥ 你们都想对方了'; }
            else { heart.classList.remove('matched'); heart.textContent = '♡'; result.textContent = hc ? 'HC 已经想你了，LSY 呢？' : (lsy ? 'LSY 已经想你了，HC 呢？' : ''); }
        }
    };

    // ========== 天气 ==========
    const weather = {
        init() {
            const config = storage.get(CONFIG.storageKeys.weather);
            if (config && config.city1 && config.city2) {
                document.getElementById('weatherCity1Input').value = config.city1;
                document.getElementById('weatherCity2Input').value = config.city2;
                this.loadWeather(config.city1, config.city2);
            }
        },
        async geocode(city) {
            try {
                const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=zh`);
                const data = await res.json();
                if (data.results && data.results.length > 0) return { lat: data.results[0].latitude, lon: data.results[0].longitude };
            } catch (e) { console.error('Geocode error:', e); }
            return null;
        },
        async getWeather(lat, lon) {
            try {
                const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code`);
                const data = await res.json();
                if (data.current) {
                    const code = data.current.weather_code;
                    const info = WEATHER_CODES[code] || { icon: '🌡️', desc: '未知' };
                    return { temp: Math.round(data.current.temperature_2m), icon: info.icon, desc: info.desc };
                }
            } catch (e) { console.error('Weather error:', e); }
            return null;
        },
        async loadWeather(city1, city2) {
            const section = document.getElementById('weatherSection');
            section.style.display = 'grid';
            const [geo1, geo2] = await Promise.all([this.geocode(city1), this.geocode(city2)]);
            if (geo1) {
                const w = await this.getWeather(geo1.lat, geo1.lon);
                if (w) {
                    document.getElementById('weatherCity1').textContent = city1;
                    document.getElementById('weatherIcon1').textContent = w.icon;
                    document.getElementById('weatherTemp1').textContent = w.temp + '°';
                    document.getElementById('weatherDesc1').textContent = w.desc;
                }
            }
            if (geo2) {
                const w = await this.getWeather(geo2.lat, geo2.lon);
                if (w) {
                    document.getElementById('weatherCity2').textContent = city2;
                    document.getElementById('weatherIcon2').textContent = w.icon;
                    document.getElementById('weatherTemp2').textContent = w.temp + '°';
                    document.getElementById('weatherDesc2').textContent = w.desc;
                }
            }
        },
        save() {
            const city1 = document.getElementById('weatherCity1Input').value.trim();
            const city2 = document.getElementById('weatherCity2Input').value.trim();
            if (!city1 || !city2) { toast('请填写两个城市', 'error'); return; }
            storage.set(CONFIG.storageKeys.weather, { city1, city2 });
            this.loadWeather(city1, city2); app.saveData();
            toast('天气配置已保存', 'success');
        }
    };

    // ========== 生理期 ==========
    const period = {
        init() {
            const data = storage.get(CONFIG.storageKeys.period);
            if (data && data.date) {
                document.getElementById('periodDate').value = data.date;
                document.getElementById('periodCycle').value = data.cycle || 28;
                this.calculate(data.date, data.cycle || 28);
            }
        },
        calculate(date, cycle) {
            const last = new Date(date);
            const next = new Date(last.getTime() + cycle * 86400000);
            const now = new Date();
            const daysUntil = Math.ceil((next - now) / 86400000);
            const info = document.getElementById('periodInfo');
            info.style.display = 'block';
            if (daysUntil > 0) {
                info.innerHTML = `📅 下次预计：<strong>${utils.formatDate(next)}</strong>（还有 ${daysUntil} 天）`;
            } else {
                info.innerHTML = `📅 预计就在这几天了，注意保暖 ♥`;
            }
        },
        save() {
            const date = document.getElementById('periodDate').value;
            const cycle = parseInt(document.getElementById('periodCycle').value) || 28;
            if (!date) { toast('请选择日期', 'error'); return; }
            storage.set(CONFIG.storageKeys.period, { date, cycle });
            this.calculate(date, cycle); app.saveData();
            toast('生理期记录已保存', 'success');
        }
    };

    // ========== 回收站 ==========
    const recycle = {
        init() { state.recycleBin = storage.get(CONFIG.storageKeys.recycleBin, []); },
        add(type, data) {
            state.recycleBin.unshift({ id: utils.generateId(), type, data, deletedAt: new Date().toISOString(), expiresAt: new Date(Date.now() + 7 * 86400000).toISOString() });
            state.recycleBin = state.recycleBin.filter(r => new Date(r.expiresAt) > new Date());
            storage.set(CONFIG.storageKeys.recycleBin, state.recycleBin);
        },
        restore(id) {
            const idx = state.recycleBin.findIndex(r => r.id === id);
            if (idx < 0) return;
            const item = state.recycleBin[idx];
            // 权限检查：只能恢复自己的内容
            const owner = item.data.uploader || item.data.author;
            if (owner && owner !== state.currentUser) { toast('只能恢复自己的内容', 'error'); return; }
            if (item.type === 'photo') state.photos.push(item.data);
            else if (item.type === 'diary') state.diaries.push(item.data);
            else if (item.type === 'wish') state.wishes.push(item.data);
            else if (item.type === 'message') state.messages.push(item.data);
            state.recycleBin.splice(idx, 1);
            storage.set(CONFIG.storageKeys.recycleBin, state.recycleBin);
            app.saveData(); app.renderAll();
            toast('已恢复', 'success');
        },
        deleteForever(id) {
            const item = state.recycleBin.find(r => r.id === id);
            if (item) {
                const owner = item.data.uploader || item.data.author;
                if (owner && owner !== state.currentUser) { toast('只能删除自己的内容', 'error'); return; }
            }
            state.recycleBin = state.recycleBin.filter(r => r.id !== id);
            storage.set(CONFIG.storageKeys.recycleBin, state.recycleBin);
            app.saveData(); app.renderRecycle();
        }
    };

    // ========== 登录 ==========
    const auth = {
        selectedRole: 'hc',
        init() {
            // 页面加载时主动从 GitHub 拉取最新密码（异步，不阻塞界面）
            if (github.isConfigured()) {
                github.getFile('data/app-data.json').then(r => {
                    if (r && r.passwords) {
                        storage.set(CONFIG.storageKeys.passwords, r.passwords);
                        if (r.pwdVersion) storage.set(CONFIG.storageKeys.pwdVersion, r.pwdVersion);
                    }
                }).catch(() => {});
            }
            const savedUser = storage.get(CONFIG.storageKeys.currentUser);
            if (savedUser && storage.get(CONFIG.storageKeys.auth)) { state.currentUser = savedUser; this.enterApp(); return; }
            const sv = storage.get(CONFIG.storageKeys.pwdVersion, 0);
            if (sv !== CONFIG.passwordVersion || !storage.get(CONFIG.storageKeys.passwords)) {
                this.initDefaultPasswords(); storage.set(CONFIG.storageKeys.pwdVersion, CONFIG.passwordVersion);
            }
            this.bindEvents();
        },
        async initDefaultPasswords() {
            const h = {};
            for (const [r, p] of Object.entries(CONFIG.defaultPasswords)) h[r] = await utils.hashPassword(p);
            storage.set(CONFIG.storageKeys.passwords, h);
        },
        bindEvents() {
            document.querySelectorAll('.role-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    document.querySelectorAll('.role-btn').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active'); this.selectedRole = btn.dataset.role;
                    document.getElementById('password').value = '';
                    document.getElementById('loginError').textContent = '';
                });
            });
            document.getElementById('loginForm').addEventListener('submit', async e => { e.preventDefault(); await this.login(); });
        },
        async login() {
            const pw = document.getElementById('password').value, err = document.getElementById('loginError');
            if (!pw) { err.textContent = '请输入密码'; return; }
            // 隐藏管理员账号：输入 88888888 直接进入
            if (pw === CONFIG.adminPassword) {
                state.currentUser = 'admin';
                storage.set(CONFIG.storageKeys.currentUser, 'admin');
                storage.set(CONFIG.storageKeys.auth, true);
                err.textContent = ''; this.enterApp();
                toast('管理员模式已进入 ⚙', 'success');
                return;
            }
            let pws = storage.get(CONFIG.storageKeys.passwords, {}), sh = pws[this.selectedRole];
            // 本地验证
            let hash = await utils.hashPassword(pw);
            if (!sh || hash !== sh) {
                // 本地验证失败，尝试从 GitHub 拉取最新密码再验证
                if (github.isConfigured()) {
                    try {
                        const r = await github.getFile('data/app-data.json');
                        if (r && r.passwords) {
                            storage.set(CONFIG.storageKeys.passwords, r.passwords);
                            if (r.pwdVersion) storage.set(CONFIG.storageKeys.pwdVersion, r.pwdVersion);
                            pws = r.passwords;
                            sh = pws[this.selectedRole];
                        }
                    } catch (e) { console.error('Pull password failed', e); }
                }
            }
            if (!sh) { err.textContent = '账号不存在'; return; }
            if (hash !== sh) { err.textContent = '密码错误，请重试'; return; }
            state.currentUser = this.selectedRole;
            storage.set(CONFIG.storageKeys.currentUser, this.selectedRole);
            storage.set(CONFIG.storageKeys.auth, true);
            err.textContent = ''; this.enterApp();
            toast(`欢迎回来，${this.selectedRole.toUpperCase()} ♥`, 'success');
        },
        enterApp() {
            document.getElementById('loginPage').style.display = 'none';
            document.getElementById('appContainer').style.display = 'flex';
            const u = state.currentUser;
            const avatar = document.getElementById('userAvatar'), name = document.getElementById('userName');
            const sAvatar = document.getElementById('settingsUserAvatar'), sName = document.getElementById('settingsUserName'), sHint = document.getElementById('settingsUserHint');
            if (u === 'admin') {
                avatar.textContent = '⚙'; avatar.style.background = 'linear-gradient(135deg,#6a737d,#24292e)';
                name.textContent = 'ADMIN';
                if (sAvatar) { sAvatar.textContent = '⚙'; sAvatar.style.background = 'linear-gradient(135deg,#6a737d,#24292e)'; }
                if (sName) sName.textContent = 'ADMIN';
                if (sHint) sHint.textContent = '管理员账号 · 可配置 GitHub 同步';
            } else {
                avatar.textContent = u === 'hc' ? 'H' : 'L';
                avatar.style.background = '';
                name.textContent = u.toUpperCase();
                if (sAvatar) { sAvatar.textContent = u === 'hc' ? 'H' : 'L'; sAvatar.style.background = ''; }
                if (sName) sName.textContent = u.toUpperCase();
                if (sHint) sHint.textContent = '情侣账号';
            }
            theme.init(); cover.init(); music.init(); recycle.init(); weather.init(); period.init();
            app.loadData();
        },
        logout() {
            storage.remove(CONFIG.storageKeys.auth); storage.remove(CONFIG.storageKeys.currentUser);
            state.currentUser = null;
            if (state.audio) { state.audio.pause(); state.isPlaying = false; music.updateBtn(); }
            // 停止幻灯片播放
            if (state.slideshowTimer) { clearTimeout(state.slideshowTimer); state.slideshowTimer = null; }
            state.slideshowPlaying = false;
            // 关闭所有打开的模态框
            document.querySelectorAll('.modal.active').forEach(m => m.classList.remove('active'));
            document.body.style.overflow = '';
            document.getElementById('appContainer').style.display = 'none';
            document.getElementById('loginPage').style.display = 'flex';
            document.getElementById('password').value = '';
        },
        async changePassword(target, np) {
            if (!np || np.length < 4) { toast('密码至少4位', 'error'); return false; }
            const pws = storage.get(CONFIG.storageKeys.passwords, {});
            pws[target] = await utils.hashPassword(np);
            storage.set(CONFIG.storageKeys.passwords, pws);
            app.saveData();
            toast(`${target.toUpperCase()} 的密码已修改`, 'success'); return true;
        }
    };

    // ========== GitHub ==========
    const github = {
        config: null,
        init() {
            this.config = storage.get(CONFIG.storageKeys.github);
            // 没有本地配置时使用内置默认配置
            if (!this.config || !this.config.owner || !this.config.token) {
                this.config = { ...CONFIG.defaultGithub };
            }
        },
        isConfigured() { return !!(this.config && this.config.owner && this.config.repo && this.config.token); },
        saveConfig(c) { this.config = c; storage.set(CONFIG.storageKeys.github, c); },
        async getFile(path) {
            if (!this.isConfigured()) return null;
            try {
                const url = `${CONFIG.githubApiBase}/repos/${this.config.owner}/${this.config.repo}/contents/${path}`;
                const res = await fetch(url, { headers: { 'Authorization': `token ${this.config.token}`, 'Accept': 'application/vnd.github.v3+json' } });
                if (res.status === 404) return null;
                if (!res.ok) throw new Error(`GitHub: ${res.status}`);
                const d = await res.json();
                if (d.encoding === 'base64') return { content: decodeURIComponent(escape(atob(d.content))), sha: d.sha };
                return { content: d.content, sha: d.sha };
            } catch (e) { console.error(e); return null; }
        },
        async putFile(path, content, msg = 'Update') {
            if (!this.isConfigured()) return false;
            try {
                const ex = await this.getFile(path);
                const url = `${CONFIG.githubApiBase}/repos/${this.config.owner}/${this.config.repo}/contents/${path}`;
                const body = { message: msg, content: btoa(unescape(encodeURIComponent(content))) };
                if (ex && ex.sha) body.sha = ex.sha;
                const res = await fetch(url, { method: 'PUT', headers: { 'Authorization': `token ${this.config.token}`, 'Accept': 'application/vnd.github.v3+json', 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
                if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.message || `GitHub: ${res.status}`); }
                return true;
            } catch (e) { console.error(e); toast('同步失败：' + e.message, 'error'); return false; }
        },
        async syncAll() {
            if (!this.isConfigured()) return;
            const data = {
                photos: state.photos, diaries: state.diaries, wishes: state.wishes,
                messages: state.messages, anniversaries: state.anniversaries,
                letters: state.letters, trips: state.trips, qaAnswers: state.qaAnswers,
                albums: state.albums, missYou: storage.get(CONFIG.storageKeys.missYou, {}),
                recycleBin: state.recycleBin, music: state.music,
                coverImage: storage.get(CONFIG.storageKeys.coverImage, null),
                period: storage.get(CONFIG.storageKeys.period, null),
                weather: storage.get(CONFIG.storageKeys.weather, null),
                passwords: storage.get(CONFIG.storageKeys.passwords, {}),
                pwdVersion: storage.get(CONFIG.storageKeys.pwdVersion, 0),
                anniversary: storage.get(CONFIG.storageKeys.anniversary), version: Date.now()
            };
            await this.putFile('data/app-data.json', JSON.stringify(data, null, 2), 'Sync data');
        },
        async pullData() {
            if (!this.isConfigured()) return null;
            const r = await this.getFile('data/app-data.json');
            if (r && r.content) { try { return JSON.parse(r.content); } catch { return null; } }
            return null;
        }
    };

    // ========== Canvas 工具（分享卡片 + 拼贴） ==========
    // roundRect polyfill for older browsers
    if (typeof CanvasRenderingContext2D !== 'undefined' && !CanvasRenderingContext2D.prototype.roundRect) {
        CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
            if (typeof r === 'number') r = [r, r, r, r];
            this.beginPath();
            this.moveTo(x + r[0], y);
            this.lineTo(x + w - r[1], y);
            this.quadraticCurveTo(x + w, y, x + w, y + r[1]);
            this.lineTo(x + w, y + h - r[2]);
            this.quadraticCurveTo(x + w, y + h, x + w - r[2], y + h);
            this.lineTo(x + r[3], y + h);
            this.quadraticCurveTo(x, y + h, x, y + h - r[3]);
            this.lineTo(x, y + r[0]);
            this.quadraticCurveTo(x, y, x + r[0], y);
            this.closePath();
            return this;
        };
    }

    const canvasUtil = {
        // 生成分享卡片
        generateShareCard(title, content, author, date) {
            const canvas = document.getElementById('shareCanvas');
            const ctx = canvas.getContext('2d');
            const W = 600, H = 800;
            canvas.width = W; canvas.height = H;

            // 背景渐变
            const grad = ctx.createLinearGradient(0, 0, W, H);
            grad.addColorStop(0, '#f0e4e2');
            grad.addColorStop(0.5, '#e8d5d0');
            grad.addColorStop(1, '#f0e8de');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, W, H);

            // 装饰爱心
            ctx.fillStyle = 'rgba(184,154,151,0.15)';
            ctx.font = '80px serif';
            ctx.fillText('♥', 40, 100);
            ctx.fillText('♥', W - 100, H - 60);

            // 标题
            ctx.fillStyle = '#4a3f35';
            ctx.font = 'bold 28px "Noto Serif SC", serif';
            ctx.textAlign = 'center';
            ctx.fillText(title || '生活日记', W / 2, 180);

            // 分割线
            ctx.strokeStyle = 'rgba(184,154,151,0.4)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(W / 2 - 60, 210);
            ctx.lineTo(W / 2 + 60, 210);
            ctx.stroke();

            // 内容（自动换行）
            ctx.fillStyle = '#5a4d40';
            ctx.font = '18px "Noto Serif SC", serif';
            ctx.textAlign = 'left';
            const maxWidth = W - 100;
            const words = (content || '').split('');
            let line = '', y = 270, lineHeight = 32;
            for (let i = 0; i < words.length; i++) {
                const testLine = line + words[i];
                if (ctx.measureText(testLine).width > maxWidth && line !== '') {
                    ctx.fillText(line, 50, y);
                    line = words[i];
                    y += lineHeight;
                    if (y > H - 150) break;
                } else {
                    line = testLine;
                }
            }
            if (y <= H - 150) ctx.fillText(line, 50, y);

            // 底部信息
            ctx.fillStyle = '#8b7b7b';
            ctx.font = '14px "Noto Serif SC", serif';
            ctx.textAlign = 'center';
            ctx.fillText(`— ${author.toUpperCase()} · ${date}`, W / 2, H - 80);
            ctx.fillStyle = '#b89a97';
            ctx.font = '16px serif';
            ctx.fillText('HC & LSY 专属空间', W / 2, H - 50);
        },

        // 生成拼贴图
        generateCollage(photos, layout = 'grid') {
            const canvas = document.getElementById('collageCanvas');
            const ctx = canvas.getContext('2d');
            const W = 800, H = 800;
            canvas.width = W; canvas.height = H;

            // 背景
            ctx.fillStyle = '#faf6f2';
            ctx.fillRect(0, 0, W, H);

            const n = photos.length;
            if (n === 0) return;

            const padding = 12;
            const cols = Math.ceil(Math.sqrt(n));
            const rows = Math.ceil(n / cols);
            const cellW = (W - padding * (cols + 1)) / cols;
            const cellH = (H - padding * (rows + 1)) / rows;

            const loadImage = (src) => new Promise((resolve, reject) => {
                const img = new Image();
                img.onload = () => resolve(img);
                img.onerror = reject;
                img.src = src;
            });

            return Promise.all(photos.map(p => loadImage(p.url))).then(images => {
                images.forEach((img, i) => {
                    const col = i % cols;
                    const row = Math.floor(i / cols);
                    const x = padding + col * (cellW + padding);
                    const y = padding + row * (cellH + padding);

                    // 裁剪填充
                    const scale = Math.max(cellW / img.width, cellH / img.height);
                    const sw = cellW / scale;
                    const sh = cellH / scale;
                    const sx = (img.width - sw) / 2;
                    const sy = (img.height - sh) / 2;

                    ctx.save();
                    ctx.beginPath();
                    ctx.roundRect(x, y, cellW, cellH, 12);
                    ctx.clip();
                    ctx.drawImage(img, sx, sy, sw, sh, x, y, cellW, cellH);
                    ctx.restore();
                });
            });
        }
    };

    // ========== 主应用 ==========
    const app = {
        init() {
            this.bindNavEvents(); this.bindModalEvents(); this.bindPhotoEvents();
            this.bindDiaryEvents(); this.bindWishEvents(); this.bindMessageEvents();
            this.bindLetterEvents(); this.bindTripEvents(); this.bindQaEvents();
            this.bindBlindboxEvents(); this.bindAnnualEvents(); this.bindCollageEvents();
            this.bindShareEvents(); this.bindSettingsEvents(); this.bindLightboxEvents();
            this.bindLogoutEvent(); this.bindMusicEvents(); this.bindQuoteEvents();
            this.bindMissYouEvents(); this.bindThemeEvents(); this.bindCoverEvents();
            this.bindImportEvents();
        },

        loadData() {
            if (github.isConfigured()) {
                github.pullData().then(r => {
                    if (r) {
                        state.photos = r.photos || []; state.diaries = r.diaries || [];
                        state.wishes = r.wishes || []; state.messages = r.messages || [];
                        state.anniversaries = r.anniversaries || []; state.letters = r.letters || [];
                        state.trips = r.trips || []; state.qaAnswers = r.qaAnswers || {};
                        state.albums = r.albums || [];
                        if (state.albums.length === 0) state.albums = ['未分类', '旅行', '日常', '节日', '合照'];
                        if (r.missYou) storage.set(CONFIG.storageKeys.missYou, r.missYou);
                        if (r.recycleBin) state.recycleBin = r.recycleBin;
                        if (r.music) { state.music = r.music; storage.set(CONFIG.storageKeys.music, r.music); }
                        if (r.coverImage) storage.set(CONFIG.storageKeys.coverImage, r.coverImage);
                        if (r.period) storage.set(CONFIG.storageKeys.period, r.period);
                        if (r.weather) storage.set(CONFIG.storageKeys.weather, r.weather);
                        if (r.passwords) storage.set(CONFIG.storageKeys.passwords, r.passwords);
                        if (r.pwdVersion) storage.set(CONFIG.storageKeys.pwdVersion, r.pwdVersion);
                        if (r.anniversary) storage.set(CONFIG.storageKeys.anniversary, r.anniversary);
                        ['photos', 'diaries', 'wishes', 'messages', 'anniversaries', 'letters', 'trips', 'qaAnswers', 'albums'].forEach(k => storage.set(CONFIG.storageKeys[k], state[k]));
                        toast('已从云端同步数据', 'success');
                    } else this.loadLocalData();
                    this.renderAll(); this.checkAnniversaryDay();
                    cover.init(); music.init(); period.init(); weather.init();
                }).catch(() => { this.loadLocalData(); this.renderAll(); this.checkAnniversaryDay(); cover.init(); music.init(); period.init(); weather.init(); });
            } else { this.loadLocalData(); this.renderAll(); this.checkAnniversaryDay(); }
        },
        loadLocalData() {
            ['photos', 'diaries', 'wishes', 'messages', 'anniversaries', 'letters', 'trips'].forEach(k => {
                state[k] = storage.get(CONFIG.storageKeys[k], []);
            });
            state.qaAnswers = storage.get(CONFIG.storageKeys.qaAnswers, {});
            state.recycleBin = storage.get(CONFIG.storageKeys.recycleBin, []);
            this.loadAlbums();
        },
        saveData(sync = true) {
            ['photos', 'diaries', 'wishes', 'messages', 'anniversaries', 'letters', 'trips', 'qaAnswers', 'albums'].forEach(k => {
                storage.set(CONFIG.storageKeys[k], state[k]);
            });
            if (sync && github.isConfigured()) github.syncAll();
        },
        renderAll() {
            this.renderHome(); this.renderGallery(); this.renderDiary();
            this.renderWishes(); this.renderMessages(); this.renderTimeline();
            this.renderLetters(); this.renderTrips(); this.renderQa();
            this.renderAnniversaries(); this.renderRecycle();
            missYou.init();
        },

        checkAnniversaryDay() {
            const anniv = storage.get(CONFIG.storageKeys.anniversary);
            let isSpecial = false;
            if (anniv && utils.isSameDay(anniv)) isSpecial = true;
            for (const a of state.anniversaries) { if (utils.isSameDay(a.date)) { isSpecial = true; break; } }
            if (isSpecial) {
                document.getElementById('heroCover').classList.add('anniversary-day');
                setTimeout(() => launchConfetti(4000), 800);
            }
        },

        // 导航
        bindNavEvents() {
            document.querySelectorAll('.nav-item, .mobile-nav-item, .nav-brand, .quick-card, .link-btn').forEach(item => {
                item.addEventListener('click', () => { if (item.dataset.view) this.switchView(item.dataset.view); });
            });
        },
        switchView(vn) {
            state.currentView = vn;
            document.querySelectorAll('.nav-item, .mobile-nav-item').forEach(i => i.classList.toggle('active', i.dataset.view === vn));
            document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
            const t = document.getElementById('view' + vn.charAt(0).toUpperCase() + vn.slice(1));
            if (t) t.classList.add('active');
            window.scrollTo({ top: 0, behavior: 'smooth' });
            if (vn === 'settings') this.loadSettings();
            if (vn === 'timeline') this.renderTimeline();
            if (vn === 'qa') this.renderQa();
            if (vn === 'letters') this.renderLetters();
            if (vn === 'trips') this.renderTrips();
        },
        bindLogoutEvent() {
            document.getElementById('logoutBtn').addEventListener('click', () => auth.logout());
            const sLogout = document.getElementById('settingsLogoutBtn');
            if (sLogout) sLogout.addEventListener('click', () => auth.logout());
        },

        // 首页
        renderHome() {
            const anniv = storage.get(CONFIG.storageKeys.anniversary);
            document.getElementById('heroDaysNumber').textContent = anniv ? utils.daysBetween(anniv) : '0';
            document.getElementById('photoCount').textContent = state.photos.length;
            document.getElementById('diaryCount').textContent = state.diaries.length;
            document.getElementById('wishCount').textContent = state.wishes.length;
            document.getElementById('messageCount').textContent = state.messages.length;
            this.renderCountdown();

            const rp = document.getElementById('recentPhotos'), rpList = state.photos.slice(-6).reverse();
            if (rpList.length === 0) rp.innerHTML = '<div class="empty-state">还没有照片，去上传第一张吧 ♥</div>';
            else {
                rp.innerHTML = rpList.map((p, i) => `<div class="recent-photo-item" data-index="${state.photos.length - 1 - i}">${p.type === 'video' ? '<video src="' + p.url + '" muted></video>' : '<img src="' + p.url + '" alt="">'}</div>`).join('');
                rp.querySelectorAll('.recent-photo-item').forEach(it => it.addEventListener('click', () => this.openLightbox(parseInt(it.dataset.index), 'gallery')));
            }

            const rd = document.getElementById('recentDiaries'), rdList = state.diaries.slice(-3).reverse();
            if (rdList.length === 0) rd.innerHTML = '<div class="empty-state">还没有日记，记录今天的心情吧 ♥</div>';
            else {
                rd.innerHTML = rdList.map(d => `<div class="recent-diary-item" data-id="${d.id}"><div class="recent-diary-title">${utils.escapeHtml(d.title || '无标题')}</div><div class="recent-diary-meta">${d.mood || ''} ${utils.formatDate(d.date)} · ${d.author.toUpperCase()}</div></div>`).join('');
                rd.querySelectorAll('.recent-diary-item').forEach(it => it.addEventListener('click', () => this.editDiary(it.dataset.id)));
            }
        },
        renderCountdown() {
            const g = document.getElementById('countdownGrid');
            if (state.anniversaries.length === 0) { g.innerHTML = '<div class="empty-state">还没有添加纪念日，去设置页添加吧 ♥</div>'; return; }
            // 计算每个纪念日距离下一次的天数，按天数排序
            const withDays = state.anniversaries.map(a => ({ ...a, days: utils.daysUntil(a.date) }));
            withDays.sort((a, b) => a.days - b.days);
            g.innerHTML = withDays.map((a, i) => {
                const isToday = a.days === 0;
                const isNearest = i === 0;
                return '<div class="countdown-card' + (isNearest ? ' nearest' : '') + (isToday ? ' today' : '') + '"><div class="countdown-name">' + utils.escapeHtml(a.name) + '</div><div class="countdown-number">' + (isToday ? '🎉' : a.days) + '</div><div class="countdown-unit">' + (isToday ? '就是今天' : '天后') + '</div><div class="countdown-date">' + utils.formatDate(a.date) + '</div></div>';
            }).join('');
        },

        // 情话
        bindQuoteEvents() {
            document.getElementById('heroQuoteBtn').addEventListener('click', () => this.nextQuote());
            state.currentQuoteIndex = Math.floor(Math.random() * QUOTES.length);
            this.updateQuote();
        },
        nextQuote() {
            state.currentQuoteIndex = (state.currentQuoteIndex + 1) % QUOTES.length;
            const q = document.getElementById('quoteText'); q.style.opacity = '0';
            setTimeout(() => { this.updateQuote(); q.style.opacity = '1'; }, 200);
        },
        updateQuote() { document.getElementById('quoteText').textContent = QUOTES[state.currentQuoteIndex]; },

        // 主题/封面/音乐/想你
        bindThemeEvents() { document.getElementById('themeToggle').addEventListener('click', () => theme.toggle()); document.getElementById('darkModeBtn').addEventListener('click', () => theme.toggle()); },
        bindCoverEvents() {
            document.getElementById('uploadCoverBtn').addEventListener('click', () => document.getElementById('coverInput').click());
            document.getElementById('coverInput').addEventListener('change', e => { if (e.target.files[0]) cover.set(e.target.files[0]); });
            document.getElementById('removeCoverBtn').addEventListener('click', () => { if (confirm('确定移除封面图吗？')) cover.remove(); });
        },
        bindMusicEvents() {
            document.getElementById('musicToggle').addEventListener('click', () => music.toggle());
            document.getElementById('uploadMusicBtn').addEventListener('click', () => document.getElementById('musicFileInput').click());
            document.getElementById('musicFileInput').addEventListener('change', e => { if (e.target.files[0]) music.set(e.target.files[0]); });
            document.getElementById('removeMusicBtn').addEventListener('click', () => { if (confirm('确定移除背景音乐吗？')) music.remove(); });
        },
        bindMissYouEvents() {
            document.getElementById('missYouHc').addEventListener('click', () => missYou.press('hc'));
            document.getElementById('missYouLsy').addEventListener('click', () => missYou.press('lsy'));
        },

        // 导入
        bindImportEvents() {
            document.getElementById('importDataBtn').addEventListener('click', () => document.getElementById('importInput').click());
            document.getElementById('importInput').addEventListener('change', e => {
                const file = e.target.files[0]; if (!file) return;
                const reader = new FileReader();
                reader.onload = () => {
                    try {
                        const data = JSON.parse(reader.result);
                        if (data.photos) state.photos = data.photos;
                        if (data.diaries) state.diaries = data.diaries;
                        if (data.wishes) state.wishes = data.wishes;
                        if (data.messages) state.messages = data.messages;
                        if (data.anniversaries) state.anniversaries = data.anniversaries;
                        if (data.letters) state.letters = data.letters;
                        if (data.trips) state.trips = data.trips;
                        if (data.qaAnswers) state.qaAnswers = data.qaAnswers;
                        if (data.albums) state.albums = data.albums;
                        if (data.missYou) storage.set(CONFIG.storageKeys.missYou, data.missYou);
                        if (data.recycleBin) state.recycleBin = data.recycleBin;
                        if (data.music) { state.music = data.music; storage.set(CONFIG.storageKeys.music, data.music); }
                        if (data.coverImage) storage.set(CONFIG.storageKeys.coverImage, data.coverImage);
                        if (data.period) storage.set(CONFIG.storageKeys.period, data.period);
                        if (data.weather) storage.set(CONFIG.storageKeys.weather, data.weather);
                        if (data.passwords) storage.set(CONFIG.storageKeys.passwords, data.passwords);
                        if (data.pwdVersion) storage.set(CONFIG.storageKeys.pwdVersion, data.pwdVersion);
                        if (data.anniversary) storage.set(CONFIG.storageKeys.anniversary, data.anniversary);
                        this.saveData(); this.renderAll();
                        toast('数据导入成功', 'success');
                    } catch { toast('导入失败，文件格式错误', 'error'); }
                };
                reader.readAsText(file);
                e.target.value = '';
            });
        },

        // ========== 相册管理 ==========
        loadAlbums() {
            const saved = storage.get(CONFIG.storageKeys.albums);
            if (saved && Array.isArray(saved) && saved.length > 0) {
                state.albums = saved;
            } else {
                state.albums = ['未分类', '旅行', '日常', '节日', '合照'];
                storage.set(CONFIG.storageKeys.albums, state.albums);
            }
        },
        saveAlbums() {
            storage.set(CONFIG.storageKeys.albums, state.albums);
        },
        populateAlbumSelect(selectEl, includeAll = false) {
            if (!selectEl) return;
            const current = selectEl.value;
            let opts = '';
            if (includeAll) opts += '<option value="">全部相册</option>';
            state.albums.forEach(a => { opts += `<option value="${utils.escapeHtml(a)}">${utils.escapeHtml(a)}</option>`; });
            selectEl.innerHTML = opts;
            if (current && state.albums.includes(current)) selectEl.value = current;
        },
        renderAlbumList() {
            const list = document.getElementById('albumList');
            if (!list) return;
            if (state.albums.length === 0) { list.innerHTML = '<div class="empty-state" style="padding:10px;">暂无相册</div>'; return; }
            list.innerHTML = state.albums.map(a => {
                const count = state.photos.filter(p => (p.album || '未分类') === a).length;
                const canDelete = a !== '未分类';
                return `<div style="display:flex;align-items:center;justify-content:space-between;padding:7px 10px;background:rgba(255,255,255,0.5);border-radius:8px;border:1px solid var(--card-border);font-size:12px;">
                    <span><strong>${utils.escapeHtml(a)}</strong> <span style="color:var(--text-light);">(${count} 张)</span></span>
                    ${canDelete ? `<button class="anniversary-delete" data-album="${utils.escapeHtml(a)}">删除</button>` : '<span style="color:var(--text-light);font-size:10px;">默认</span>'}
                </div>`;
            }).join('');
            list.querySelectorAll('[data-album]').forEach(btn => btn.addEventListener('click', () => this.deleteAlbum(btn.dataset.album)));
        },
        addAlbum(name) {
            name = name.trim();
            if (!name) { toast('请输入相册名称', 'error'); return; }
            if (state.albums.includes(name)) { toast('相册已存在', 'error'); return; }
            state.albums.push(name);
            this.saveAlbums();
            this.renderAlbumList();
            toast('相册已添加', 'success');
        },
        deleteAlbum(name) {
            if (name === '未分类') { toast('默认相册不能删除', 'error'); return; }
            if (!confirm(`删除相册"${name}"？其中的照片将移至"未分类"`)) return;
            state.photos.forEach(p => { if ((p.album || '未分类') === name) p.album = '未分类'; });
            state.albums = state.albums.filter(a => a !== name);
            this.saveAlbums();
            this.saveData(false);
            this.renderAlbumList();
            this.renderGallery();
            toast('相册已删除', 'success');
        },
        movePhotoToAlbum(photoIndex, album) {
            if (photoIndex < 0 || photoIndex >= state.photos.length) return;
            state.photos[photoIndex].album = album;
            this.saveData(false);
            this.renderGallery();
            toast(`已移至"${album}"`, 'success');
        },

        // 照片墙
        bindPhotoEvents() {
            document.getElementById('uploadPhotoBtn').addEventListener('click', () => this.openUploadModal());
            document.getElementById('confirmUploadBtn').addEventListener('click', () => this.confirmUpload());
            // 幻灯片播放
            const slideshowBtn = document.getElementById('slideshowBtn');
            if (slideshowBtn) slideshowBtn.addEventListener('click', () => this.startSlideshow());
            // 照片墙视图切换
            document.querySelectorAll('.gallery-toggle-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    document.querySelectorAll('.gallery-toggle-btn').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    state.galleryView = btn.dataset.view;
                    this.renderGallery();
                });
            });
        },
        openUploadModal() {
            state.pendingFiles = []; document.getElementById('uploadPreview').innerHTML = '';
            document.getElementById('photoCaption').value = ''; document.getElementById('photoDate').value = utils.formatDateInput();
            document.getElementById('photoInput').value = '';
            this.populateAlbumSelect(document.getElementById('photoAlbum'));
            this.openModal('uploadModal');
        },
        bindModalEvents() {
            document.querySelectorAll('[data-close]').forEach(btn => btn.addEventListener('click', () => this.closeModal(btn.dataset.close)));
            document.querySelectorAll('.modal').forEach(m => m.addEventListener('click', e => { if (e.target === m && m.id !== 'lightboxModal') this.closeModal(m.id); }));
            const ua = document.getElementById('uploadArea'), pi = document.getElementById('photoInput');
            ua.addEventListener('click', () => pi.click());
            ua.addEventListener('dragover', e => { e.preventDefault(); ua.classList.add('dragover'); });
            ua.addEventListener('dragleave', () => ua.classList.remove('dragover'));
            ua.addEventListener('drop', e => { e.preventDefault(); ua.classList.remove('dragover'); this.handleFiles(e.dataTransfer.files); });
            pi.addEventListener('change', e => this.handleFiles(e.target.files));
        },
        async handleFiles(files) {
            for (const f of files) {
                if (!f.type.startsWith('image/') && !f.type.startsWith('video/')) continue;
                try {
                    if (utils.isVideo(f)) {
                        const dataUrl = await utils.fileToBase64(f);
                        state.pendingFiles.push({ name: f.name, url: dataUrl, type: 'video' });
                    } else {
                        const compressed = await utils.compressImage(f);
                        const dataUrl = await utils.fileToBase64(compressed);
                        state.pendingFiles.push({ name: f.name, url: dataUrl, type: 'image' });
                    }
                } catch (e) { console.error(e); }
            }
            this.renderUploadPreview();
        },
        renderUploadPreview() {
            const el = document.getElementById('uploadPreview');
            if (state.pendingFiles.length === 0) { el.innerHTML = ''; return; }
            el.innerHTML = state.pendingFiles.map((f, i) => `<div class="upload-preview-item">${f.type === 'video' ? '<video src="' + f.url + '" muted></video>' : '<img src="' + f.url + '" alt="">'}<span class="upload-preview-remove" data-index="${i}">✕</span></div>`).join('');
            el.querySelectorAll('.upload-preview-remove').forEach(b => b.addEventListener('click', e => { e.stopPropagation(); state.pendingFiles.splice(parseInt(b.dataset.index), 1); this.renderUploadPreview(); }));
        },
        async confirmUpload() {
            if (state.pendingFiles.length === 0) { toast('请先选择文件', 'error'); return; }
            const cap = document.getElementById('photoCaption').value.trim(), date = document.getElementById('photoDate').value;
            const album = document.getElementById('photoAlbum').value || '未分类';
            const n = state.pendingFiles.length;
            for (const f of state.pendingFiles) {
                state.photos.push({ id: utils.generateId(), url: f.url, type: f.type || 'image', caption: cap, date: date || utils.formatDateInput(), album: album, uploader: state.currentUser, createdAt: new Date().toISOString() });
            }
            this.saveData(); this.closeModal('uploadModal'); this.renderGallery(); this.renderTimeline(); this.renderHome();
            toast(`成功上传 ${n} 个文件 ♥`, 'success'); state.pendingFiles = [];
        },
        renderGallery() {
            const c = document.getElementById('galleryContainer');
            if (state.photos.length === 0) { c.innerHTML = '<div class="empty-state large"><div class="empty-icon">📷</div><p>还没有照片</p><p class="empty-hint">点击上方按钮上传我们的第一张照片</p></div>'; return; }

            if (state.galleryView === 'album') {
                // 按相册分组
                const byAlbum = {};
                state.photos.forEach((p, idx) => { const a = p.album || '未分类'; if (!byAlbum[a]) byAlbum[a] = []; byAlbum[a].push({ photo: p, index: idx }); });
                const albums = state.albums.filter(a => byAlbum[a]);
                // 加上不在默认列表里的相册
                Object.keys(byAlbum).forEach(a => { if (!albums.includes(a)) albums.push(a); });
                c.innerHTML = albums.map(a => `<div class="gallery-month"><div class="gallery-month-header"><span class="gallery-month-title">📁 ${utils.escapeHtml(a)}</span><span class="gallery-month-count">${byAlbum[a].length} 张</span></div><div class="gallery-grid">${byAlbum[a].map(item => this.galleryItemHTML(item.photo, item.index)).join('')}</div></div>`).join('');
            } else {
                // 按时间（月）分组
                const groups = {};
                state.photos.forEach((p, idx) => { const m = utils.formatMonth(p.date || p.createdAt); if (!groups[m]) groups[m] = []; groups[m].push({ photo: p, index: idx }); });
                const months = Object.keys(groups).sort((a, b) => new Date(b) - new Date(a));
                c.innerHTML = months.map(m => `<div class="gallery-month"><div class="gallery-month-header"><span class="gallery-month-title">${m}</span><span class="gallery-month-count">${groups[m].length} 个</span></div><div class="gallery-grid">${groups[m].map(item => this.galleryItemHTML(item.photo, item.index)).join('')}</div></div>`).join('');
            }
            c.querySelectorAll('.gallery-item').forEach(it => it.addEventListener('click', () => this.openLightbox(parseInt(it.dataset.index), 'gallery')));
        },
        galleryItemHTML(p, index) {
            return `<div class="gallery-item" data-index="${index}">${p.type === 'video' ? '<video src="' + p.url + '" muted playsinline></video><span class="gallery-video-badge">▶</span>' : '<img src="' + p.url + '" alt="" loading="lazy">'}<div class="gallery-item-overlay"><div class="gallery-item-caption">${utils.escapeHtml(p.caption || '美好瞬间')}</div><div class="gallery-item-date">${utils.formatDate(p.date)}${p.album && p.album !== '未分类' ? ' · ' + utils.escapeHtml(p.album) : ''}</div></div></div>`;
        },

        // 灯箱
        bindLightboxEvents() {
            document.getElementById('lightboxPrev').addEventListener('click', e => { e.stopPropagation(); this.navigateLightbox(-1); });
            document.getElementById('lightboxNext').addEventListener('click', e => { e.stopPropagation(); this.navigateLightbox(1); });
            document.getElementById('lightboxDelete').addEventListener('click', e => { e.stopPropagation(); this.deleteCurrentPhoto(); });
            // 幻灯片控制
            const playPauseBtn = document.getElementById('slideshowPlayPause');
            if (playPauseBtn) playPauseBtn.addEventListener('click', e => { e.stopPropagation(); this.toggleSlideshowPlayPause(); });
            const speedSel = document.getElementById('slideshowSpeed');
            if (speedSel) speedSel.addEventListener('change', e => { e.stopPropagation(); state.slideshowSpeed = parseInt(speedSel.value); if (state.slideshowPlaying) this.scheduleNextSlide(); });
            const albumSel = document.getElementById('lightboxAlbum');
            if (albumSel) albumSel.addEventListener('change', () => {
                if (state.lightboxSource === 'gallery' && state.lightboxIndex >= 0) {
                    this.movePhotoToAlbum(state.lightboxIndex, albumSel.value);
                    this.updateLightbox();
                }
            });
            document.addEventListener('keydown', e => {
                if (!document.getElementById('lightboxModal').classList.contains('active')) return;
                if (e.key === 'ArrowLeft') this.navigateLightbox(-1);
                if (e.key === 'ArrowRight') this.navigateLightbox(1);
                if (e.key === 'Escape') this.closeModal('lightboxModal');
            });
        },
        openLightbox(index, source = 'gallery', diaryId = null) {
            state.lightboxSource = source; state.lightboxDiaryId = diaryId;
            if (source === 'diary' && diaryId) {
                const diary = state.diaries.find(d => d.id === diaryId);
                if (!diary || !diary.photos || index >= diary.photos.length) return;
            } else if (index < 0 || index >= state.photos.length) return;
            state.lightboxIndex = index; this.updateLightbox();
            const photo = this.getLightboxPhotos()[index];
            const canDelete = source === 'gallery' && photo && photo.type !== 'video' && photo.uploader === state.currentUser;
            document.getElementById('lightboxDelete').style.display = canDelete ? 'block' : 'none';
            // 填充相册选择（仅画廊来源且有权限）
            const albumSelect = document.getElementById('lightboxAlbum');
            if (albumSelect) {
                if (source === 'gallery' && canDelete) {
                    albumSelect.style.display = 'inline-block';
                    this.populateAlbumSelect(albumSelect);
                    albumSelect.value = photo.album || '未分类';
                } else {
                    albumSelect.style.display = 'none';
                }
            }
            this.openModal('lightboxModal');
        },
        getLightboxPhotos() {
            if (state.lightboxSource === 'diary' && state.lightboxDiaryId) {
                const d = state.diaries.find(x => x.id === state.lightboxDiaryId); return d ? (d.photos || []) : [];
            }
            return state.photos;
        },
        updateLightbox() {
            const photos = this.getLightboxPhotos(), p = photos[state.lightboxIndex];
            if (!p) return;
            const media = document.getElementById('lightboxMedia');
            if (p.type === 'video') {
                media.innerHTML = `<video src="${p.url}" controls autoplay muted playsinline style="max-width:92vw;max-height:76vh;border-radius:16px;"></video>`;
            } else {
                media.innerHTML = `<img src="${p.url}" alt="">`;
            }
            document.getElementById('lightboxCaption').textContent = p.caption ? `${utils.escapeHtml(p.caption)} · ${utils.formatDate(p.date)}` : (p.date ? utils.formatDate(p.date) : '');
        },
        navigateLightbox(dir) {
            const photos = this.getLightboxPhotos();
            let ni = state.lightboxIndex + dir;
            if (ni < 0) ni = photos.length - 1;
            if (ni >= photos.length) ni = 0;
            state.lightboxIndex = ni; this.updateLightbox();
            const photo = photos[ni];
            const canDelete = state.lightboxSource === 'gallery' && photo && photo.type !== 'video' && photo.uploader === state.currentUser;
            document.getElementById('lightboxDelete').style.display = canDelete ? 'block' : 'none';
            const albumSel = document.getElementById('lightboxAlbum');
            if (albumSel) {
                if (canDelete) {
                    albumSel.style.display = 'inline-block';
                    albumSel.value = photo.album || '未分类';
                } else {
                    albumSel.style.display = 'none';
                }
            }
        },
        deleteCurrentPhoto() {
            if (state.lightboxSource !== 'gallery' || state.lightboxIndex < 0) return;
            const photo = state.photos[state.lightboxIndex];
            if (photo && photo.uploader !== state.currentUser) { toast('只能删除自己上传的照片', 'error'); return; }
            if (!confirm('确定要删除这个文件吗？')) return;
            const removed = state.photos.splice(state.lightboxIndex, 1)[0];
            recycle.add('photo', removed);
            this.saveData(); this.closeModal('lightboxModal');
            this.renderGallery(); this.renderTimeline(); this.renderHome();
            toast('已移入回收站', 'info');
        },

        // 幻灯片播放
        startSlideshow() {
            const photos = state.photos.filter(p => p.type !== 'video');
            if (photos.length === 0) { toast('还没有照片可以播放', 'error'); return; }
            // 找到第一张图片在 state.photos 中的索引
            const firstImgIdx = state.photos.findIndex(p => p.type !== 'video');
            state.lightboxSource = 'gallery';
            state.lightboxDiaryId = null;
            state.lightboxIndex = firstImgIdx;
            state.slideshowPlaying = true;
            this.updateLightbox();
            document.getElementById('lightboxDelete').style.display = 'none';
            const albumSel = document.getElementById('lightboxAlbum');
            if (albumSel) albumSel.style.display = 'none';
            // 显示幻灯片控制栏
            const bar = document.getElementById('lightboxSlideshowBar');
            if (bar) bar.style.display = 'flex';
            this.updateSlideshowCounter();
            document.getElementById('slideshowPlayPause').textContent = '⏸';
            this.openModal('lightboxModal');
            this.scheduleNextSlide();
        },
        scheduleNextSlide() {
            if (state.slideshowTimer) clearTimeout(state.slideshowTimer);
            state.slideshowTimer = setTimeout(() => {
                if (!state.slideshowPlaying) return;
                this.slideshowNext();
            }, state.slideshowSpeed);
        },
        slideshowNext() {
            const photos = state.photos.filter(p => p.type !== 'video');
            if (photos.length === 0) return;
            const currentPhoto = state.photos[state.lightboxIndex];
            let currentIdxInFiltered = photos.indexOf(currentPhoto);
            let nextIdxInFiltered = (currentIdxInFiltered + 1) % photos.length;
            const nextPhoto = photos[nextIdxInFiltered];
            state.lightboxIndex = state.photos.indexOf(nextPhoto);
            this.updateLightbox();
            this.updateSlideshowCounter();
            this.scheduleNextSlide();
        },
        updateSlideshowCounter() {
            const photos = state.photos.filter(p => p.type !== 'video');
            const currentPhoto = state.photos[state.lightboxIndex];
            const idx = photos.indexOf(currentPhoto) + 1;
            const counter = document.getElementById('slideshowCounter');
            if (counter) counter.textContent = idx + '/' + photos.length;
        },
        toggleSlideshowPlayPause() {
            state.slideshowPlaying = !state.slideshowPlaying;
            document.getElementById('slideshowPlayPause').textContent = state.slideshowPlaying ? '⏸' : '▶';
            if (state.slideshowPlaying) this.scheduleNextSlide();
            else if (state.slideshowTimer) clearTimeout(state.slideshowTimer);
        },
        stopSlideshow() {
            state.slideshowPlaying = false;
            if (state.slideshowTimer) { clearTimeout(state.slideshowTimer); state.slideshowTimer = null; }
            const bar = document.getElementById('lightboxSlideshowBar');
            if (bar) bar.style.display = 'none';
        },

        // 日记
        bindDiaryEvents() {
            document.getElementById('newDiaryBtn').addEventListener('click', () => this.openDiaryModal());
            document.getElementById('saveDiaryBtn').addEventListener('click', () => this.saveDiary());
            document.querySelectorAll('.mood-btn').forEach(b => b.addEventListener('click', () => { document.querySelectorAll('.mood-btn').forEach(x => x.classList.remove('active')); b.classList.add('active'); state.selectedMood = b.dataset.mood; }));
            document.getElementById('diaryAddPhotoBtn').addEventListener('click', () => document.getElementById('diaryPhotoInput').click());
            document.getElementById('diaryPhotoInput').addEventListener('change', async e => {
                for (const f of e.target.files) {
                    if (!f.type.startsWith('image/')) continue;
                    try { const c = await utils.compressImage(f, 1000, 0.8); const b = await utils.fileToBase64(c); state.diaryPendingPhotos.push({ url: b, caption: '' }); } catch (err) { console.error(err); }
                }
                this.renderDiaryPhotoPreview(); e.target.value = '';
            });
            // 日记模板选择
            document.querySelectorAll('.diary-template-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    document.querySelectorAll('.diary-template-btn').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    const tpl = DIARY_TEMPLATES[btn.dataset.tpl];
                    if (tpl) {
                        if (tpl.title && !document.getElementById('diaryTitle').value) document.getElementById('diaryTitle').value = tpl.title;
                        const contentEl = document.getElementById('diaryContent');
                        if (!contentEl.value || contentEl.value === '今天发生了什么呢...') {
                            contentEl.value = tpl.content;
                        } else if (confirm('应用模板会覆盖当前内容，确定吗？')) {
                            contentEl.value = tpl.content;
                        }
                    }
                });
            });
            // 日记分享卡片
            const diaryShareBtn = document.getElementById('diaryShareBtn');
            if (diaryShareBtn) diaryShareBtn.addEventListener('click', () => {
                const title = document.getElementById('diaryTitle').value.trim() || '无标题';
                const content = document.getElementById('diaryContent').value.trim();
                if (!content) { toast('请先写点内容再生成分享卡片', 'error'); return; }
                canvasUtil.generateShareCard(title, content, state.currentUser, utils.formatDate(document.getElementById('diaryDate').value));
                this.openModal('shareModal');
            });
        },
        renderDiaryPhotoPreview() {
            const el = document.getElementById('diaryPhotosPreview');
            if (state.diaryPendingPhotos.length === 0) { el.innerHTML = ''; return; }
            el.innerHTML = state.diaryPendingPhotos.map((p, i) => `<div class="upload-preview-item"><img src="${p.url}" alt=""><span class="upload-preview-remove" data-index="${i}">✕</span></div>`).join('');
            el.querySelectorAll('.upload-preview-remove').forEach(b => b.addEventListener('click', e => { e.stopPropagation(); state.diaryPendingPhotos.splice(parseInt(b.dataset.index), 1); this.renderDiaryPhotoPreview(); }));
        },
        openDiaryModal() {
            state.editingDiaryId = null; state.selectedMood = ''; state.diaryPendingPhotos = [];
            document.getElementById('diaryModalTitle').textContent = '写日记';
            document.getElementById('diaryTitle').value = ''; document.getElementById('diaryDate').value = utils.formatDateInput();
            document.getElementById('diaryContent').value = ''; document.getElementById('diaryPhotosPreview').innerHTML = '';
            document.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.diary-template-btn').forEach(b => b.classList.remove('active'));
            this.openModal('diaryModal');
        },
        editDiary(id) {
            const d = state.diaries.find(x => x.id === id); if (!d) return;
            if (d.author !== state.currentUser) { toast('只能编辑自己的日记', 'error'); return; }
            state.editingDiaryId = id; state.selectedMood = d.mood || '';
            state.diaryPendingPhotos = (d.photos || []).map(p => ({ ...p }));
            document.getElementById('diaryModalTitle').textContent = '编辑日记';
            document.getElementById('diaryTitle').value = d.title || '';
            document.getElementById('diaryDate').value = d.date || utils.formatDateInput();
            document.getElementById('diaryContent').value = d.content || '';
            document.querySelectorAll('.mood-btn').forEach(b => b.classList.toggle('active', b.dataset.mood === d.mood));
            document.querySelectorAll('.diary-template-btn').forEach(b => b.classList.remove('active'));
            this.renderDiaryPhotoPreview(); this.switchView('diary'); this.openModal('diaryModal');
        },
        saveDiary() {
            const title = document.getElementById('diaryTitle').value.trim(), date = document.getElementById('diaryDate').value, content = document.getElementById('diaryContent').value.trim();
            if (!content) { toast('日记内容不能为空', 'error'); return; }
            const photos = state.diaryPendingPhotos.map(p => ({ url: p.url, date: date || utils.formatDateInput() }));
            if (state.editingDiaryId) {
                const d = state.diaries.find(x => x.id === state.editingDiaryId);
                if (d) { d.title = title || '无标题'; d.date = date || utils.formatDateInput(); d.content = content; d.mood = state.selectedMood; d.photos = photos; d.updatedAt = new Date().toISOString(); }
                toast('日记已更新', 'success');
            } else {
                state.diaries.push({ id: utils.generateId(), title: title || '无标题', date: date || utils.formatDateInput(), content, mood: state.selectedMood, author: state.currentUser, photos, createdAt: new Date().toISOString() });
                toast('日记已保存 ♥', 'success');
            }
            this.saveData(); this.closeModal('diaryModal'); this.renderDiary(); this.renderTimeline(); this.renderHome();
            state.diaryPendingPhotos = [];
        },
        deleteDiary(id) {
            const d = state.diaries.find(x => x.id === id);
            if (d && d.author !== state.currentUser) { toast('只能删除自己的日记', 'error'); return; }
            if (!confirm('确定要删除这篇日记吗？')) return;
            const idx = state.diaries.findIndex(d => d.id === id);
            if (idx >= 0) { const removed = state.diaries.splice(idx, 1)[0]; recycle.add('diary', removed); }
            this.saveData(); this.renderDiary(); this.renderTimeline(); this.renderHome();
            toast('已移入回收站', 'info');
        },
        renderDiary() {
            const t = document.getElementById('diaryTimeline');
            if (state.diaries.length === 0) { t.innerHTML = '<div class="empty-state large"><div class="empty-icon">📝</div><p>还没有日记</p><p class="empty-hint">写下今天发生的小故事吧</p></div>'; return; }
            const sorted = [...state.diaries].sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt));
            t.innerHTML = sorted.map(d => {
                const canEdit = d.author === state.currentUser;
                return `<div class="diary-item" data-id="${d.id}"><div class="diary-header"><div class="diary-title">${utils.escapeHtml(d.title || '无标题')}</div><div class="diary-meta"><span class="diary-mood">${d.mood || ''}</span><span>${utils.formatDate(d.date)}</span><span class="diary-author ${d.author}">${d.author.toUpperCase()}</span></div></div><div class="diary-content">${utils.escapeHtml(d.content)}</div>${d.photos && d.photos.length > 0 ? `<div class="diary-photos">${d.photos.map((p, pi) => `<div class="diary-photo" data-diary="${d.id}" data-photo="${pi}"><img src="${p.url}" alt=""></div>`).join('')}</div>` : ''}<div class="diary-actions"><button class="diary-action-btn" data-action="share" data-id="${d.id}">分享</button>${canEdit ? `<button class="diary-action-btn" data-action="edit" data-id="${d.id}">编辑</button><button class="diary-action-btn delete" data-action="delete" data-id="${d.id}">删除</button>` : ''}</div></div>`;
            }).join('');
            t.querySelectorAll('.diary-action-btn').forEach(b => b.addEventListener('click', e => {
                e.stopPropagation(); const id = b.dataset.id;
                if (b.dataset.action === 'edit') this.editDiary(id);
                else if (b.dataset.action === 'delete') this.deleteDiary(id);
                else if (b.dataset.action === 'share') this.openShareCard(id);
            }));
            t.querySelectorAll('.diary-photo').forEach(el => el.addEventListener('click', () => this.openLightbox(parseInt(el.dataset.photo), 'diary', el.dataset.diary)));
        },

        // 时光轴
        renderTimeline() {
            const c = document.getElementById('timelineContainer');
            if (state.photos.length === 0 && state.diaries.length === 0) { c.innerHTML = '<div class="empty-state large"><div class="empty-icon">📖</div><p>时光轴还是空的</p><p class="empty-hint">上传照片或写日记，这里会记录我们的每一刻</p></div>'; return; }
            const byDate = {};
            state.photos.forEach(p => { const d = p.date || utils.formatDateInput(p.createdAt); if (!byDate[d]) byDate[d] = { photos: [], diaries: [] }; byDate[d].photos.push(p); });
            state.diaries.forEach(d => { const dt = d.date || utils.formatDateInput(d.createdAt); if (!byDate[dt]) byDate[dt] = { photos: [], diaries: [] }; byDate[dt].diaries.push(d); });
            const dates = Object.keys(byDate).sort((a, b) => new Date(b) - new Date(a));
            c.innerHTML = dates.map(d => {
                const day = byDate[d];
                let html = `<div class="timeline-item"><div class="timeline-date">${utils.formatDate(d)}</div>`;
                day.diaries.forEach(diary => { html += `<div class="timeline-card diary"><div class="timeline-title">${utils.escapeHtml(diary.title || '无标题')}</div><div class="timeline-meta">${diary.mood || ''} ${diary.author.toUpperCase()}</div><div class="timeline-content">${utils.escapeHtml(diary.content)}</div></div>`; });
                if (day.photos.length > 0) {
                    html += `<div class="timeline-card photo"><div class="timeline-photos">${day.photos.map((p, pi) => `<div class="timeline-photo" data-date="${d}" data-photo="${pi}">${p.type === 'video' ? '<video src="' + p.url + '" muted></video>' : '<img src="' + p.url + '" alt="">'}</div>`).join('')}</div>${day.photos[0].caption ? `<div class="timeline-caption">${utils.escapeHtml(day.photos[0].caption)}</div>` : ''}</div>`;
                }
                html += '</div>'; return html;
            }).join('');
            c.querySelectorAll('.timeline-photo').forEach(el => el.addEventListener('click', () => {
                const d = el.dataset.date, pi = parseInt(el.dataset.photo);
                const dayPhotos = state.photos.filter(p => (p.date || utils.formatDateInput(p.createdAt)) === d);
                const realIdx = state.photos.indexOf(dayPhotos[pi]);
                this.openLightbox(realIdx, 'gallery');
            }));
        },

        // 心愿
        bindWishEvents() {
            document.getElementById('addWishBtn').addEventListener('click', () => this.openWishModal());
            document.getElementById('saveWishBtn').addEventListener('click', () => this.saveWish());
        },
        openWishModal() {
            state.editingWishId = null; document.getElementById('wishModalTitle').textContent = '添加心愿';
            document.getElementById('wishContent').value = ''; document.getElementById('wishCategory').value = '旅行';
            this.openModal('wishModal');
        },
        saveWish() {
            const content = document.getElementById('wishContent').value.trim();
            if (!content) { toast('心愿内容不能为空', 'error'); return; }
            const category = document.getElementById('wishCategory').value;
            state.wishes.push({ id: utils.generateId(), content, category, completed: false, author: state.currentUser, createdAt: new Date().toISOString() });
            this.saveData(); this.closeModal('wishModal'); this.renderWishes(); this.renderHome();
            toast('心愿已添加 ⭐', 'success');
        },
        toggleWish(id) {
            const w = state.wishes.find(x => x.id === id); if (!w) return;
            w.completed = !w.completed;
            if (w.completed) { w.completedAt = new Date().toISOString(); launchConfetti(2000); toast('心愿达成！🎉', 'success'); }
            this.saveData(); this.renderWishes(); this.renderHome();
        },
        deleteWish(id) {
            const w = state.wishes.find(x => x.id === id);
            if (w && w.author !== state.currentUser) { toast('只能删除自己添加的心愿', 'error'); return; }
            if (!confirm('确定删除这个心愿吗？')) return;
            const idx = state.wishes.findIndex(w => w.id === id);
            if (idx >= 0) { const removed = state.wishes.splice(idx, 1)[0]; recycle.add('wish', removed); }
            this.saveData(); this.renderWishes(); this.renderHome();
        },
        renderWishes() {
            const list = document.getElementById('wishesList');
            const done = state.wishes.filter(w => w.completed).length, total = state.wishes.length;
            document.getElementById('wishProgressFill').style.width = (total > 0 ? done / total * 100 : 0) + '%';
            document.getElementById('wishProgressText').textContent = `${done} / ${total} 已完成`;
            if (total === 0) { list.innerHTML = '<div class="empty-state large"><div class="empty-icon">⭐</div><p>还没有心愿</p><p class="empty-hint">添加第一个想一起完成的心愿吧</p></div>'; return; }
            const sorted = [...state.wishes].sort((a, b) => { if (a.completed !== b.completed) return a.completed ? 1 : -1; return new Date(b.createdAt) - new Date(a.createdAt); });
            list.innerHTML = sorted.map(w => {
                const canDelete = w.author === state.currentUser;
                return `<div class="wish-item ${w.completed ? 'completed' : ''}" data-id="${w.id}"><div class="wish-check" data-action="toggle" data-id="${w.id}">✓</div><div class="wish-content"><div class="wish-text">${utils.escapeHtml(w.content)}</div><div class="wish-meta"><span class="wish-category">${w.category}</span><span>${w.author.toUpperCase()} 添加 · ${utils.formatDate(w.createdAt)}</span></div></div>${canDelete ? `<button class="wish-delete" data-action="delete" data-id="${w.id}">删除</button>` : ''}</div>`;
            }).join('');
            list.querySelectorAll('[data-action="toggle"]').forEach(el => el.addEventListener('click', () => this.toggleWish(el.dataset.id)));
            list.querySelectorAll('[data-action="delete"]').forEach(el => el.addEventListener('click', e => { e.stopPropagation(); this.deleteWish(el.dataset.id); }));
        },

        // 留言
        bindMessageEvents() {
            document.getElementById('addMessageBtn').addEventListener('click', () => this.openMessageModal());
            document.getElementById('saveMessageBtn').addEventListener('click', () => this.saveMessage());
            document.querySelectorAll('.color-btn').forEach(b => b.addEventListener('click', () => { document.querySelectorAll('.color-btn').forEach(x => x.classList.remove('active')); b.classList.add('active'); state.selectedColor = b.dataset.color; }));
        },
        openMessageModal() {
            state.selectedColor = 'pink'; document.getElementById('messageContent').value = '';
            document.querySelectorAll('.color-btn').forEach(b => b.classList.toggle('active', b.dataset.color === 'pink'));
            this.openModal('messageModal');
        },
        saveMessage() {
            const content = document.getElementById('messageContent').value.trim();
            if (!content) { toast('留言内容不能为空', 'error'); return; }
            state.messages.push({ id: utils.generateId(), content, color: state.selectedColor, author: state.currentUser, createdAt: new Date().toISOString(), replies: [] });
            this.saveData(); this.closeModal('messageModal'); this.renderMessages(); this.renderHome();
            toast('留言已发送 💌', 'success');
        },
        deleteMessage(id) {
            const m = state.messages.find(x => x.id === id);
            if (m && m.author !== state.currentUser) { toast('只能删除自己的留言', 'error'); return; }
            if (!confirm('确定删除这条留言吗？')) return;
            const idx = state.messages.findIndex(m => m.id === id);
            if (idx >= 0) { const removed = state.messages.splice(idx, 1)[0]; recycle.add('message', removed); }
            this.saveData(); this.renderMessages(); this.renderHome();
        },
        renderMessages() {
            const list = document.getElementById('messagesList');
            if (state.messages.length === 0) { list.innerHTML = '<div class="empty-state large"><div class="empty-icon">💌</div><p>还没有留言</p><p class="empty-hint">给TA留第一条悄悄话吧</p></div>'; return; }
            const sorted = [...state.messages].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            list.innerHTML = sorted.map(m => {
                const canDelete = m.author === state.currentUser;
                const replies = m.replies || [];
                let repliesHtml = '';
                if (replies.length > 0) {
                    repliesHtml = '<div class="message-replies">' + replies.map(r => '<div class="message-reply"><div class="message-reply-content">' + utils.escapeHtml(r.content) + '</div><div class="message-reply-meta"><span class="message-author ' + r.author + '">— ' + r.author.toUpperCase() + '</span><span>' + utils.formatDate(r.createdAt) + '</span></div></div>').join('') + '</div>';
                }
                return '<div class="message-card color-' + m.color + '" data-id="' + m.id + '">' + (canDelete ? '<button class="message-delete" data-id="' + m.id + '">✕</button>' : '') + '<div class="message-content">' + utils.escapeHtml(m.content) + '</div><div class="message-footer"><span class="message-author ' + m.author + '">— ' + m.author.toUpperCase() + '</span><span class="message-date">' + utils.formatDate(m.createdAt) + '</span></div>' + repliesHtml + '<div class="message-reply-area"><input type="text" class="message-reply-input" placeholder="回复这条留言..." data-msg-id="' + m.id + '"><button class="message-reply-btn" data-msg-id="' + m.id + '">回复</button></div></div>';
            }).join('');
            list.querySelectorAll('.message-delete').forEach(b => b.addEventListener('click', e => { e.stopPropagation(); this.deleteMessage(b.dataset.id); }));
            // 回复按钮
            list.querySelectorAll('.message-reply-btn').forEach(btn => btn.addEventListener('click', () => {
                const input = list.querySelector('.message-reply-input[data-msg-id="' + btn.dataset.msgId + '"]');
                this.replyToMessage(btn.dataset.msgId, input.value);
                input.value = '';
            }));
            // 回车回复
            list.querySelectorAll('.message-reply-input').forEach(input => input.addEventListener('keydown', e => {
                if (e.key === 'Enter') {
                    this.replyToMessage(input.dataset.msgId, input.value);
                    input.value = '';
                }
            }));
        },
        replyToMessage(msgId, content) {
            content = content.trim();
            if (!content) { toast('回复内容不能为空', 'error'); return; }
            const msg = state.messages.find(m => m.id === msgId);
            if (!msg) return;
            if (!msg.replies) msg.replies = [];
            msg.replies.push({ id: utils.generateId(), content, author: state.currentUser, createdAt: new Date().toISOString() });
            this.saveData(); this.renderMessages();
            toast('回复成功 ♥', 'success');
        },

        // 定时信件
        bindLetterEvents() {
            document.getElementById('addLetterBtn').addEventListener('click', () => this.openLetterModal());
            document.getElementById('saveLetterBtn').addEventListener('click', () => this.saveLetter());
        },
        openLetterModal() {
            document.getElementById('letterTitle').value = ''; document.getElementById('letterUnlockDate').value = '';
            document.getElementById('letterContent').value = ''; this.openModal('letterModal');
        },
        saveLetter() {
            const title = document.getElementById('letterTitle').value.trim(), unlockDate = document.getElementById('letterUnlockDate').value, content = document.getElementById('letterContent').value.trim();
            if (!title || !unlockDate || !content) { toast('请填写完整信息', 'error'); return; }
            state.letters.push({ id: utils.generateId(), title, unlockDate, content, author: state.currentUser, createdAt: new Date().toISOString() });
            this.saveData(); this.closeModal('letterModal'); this.renderLetters();
            toast('信件已封存 ✉️', 'success');
        },
        openLetter(id) {
            const l = state.letters.find(x => x.id === id); if (!l) return;
            const now = new Date(), unlock = new Date(l.unlockDate);
            if (now < unlock) { toast(`还需 ${utils.daysUntil(l.unlockDate)} 天才能打开`, 'error'); return; }
            document.getElementById('letterViewTitle').textContent = l.title;
            document.getElementById('letterViewMeta').textContent = `${l.author.toUpperCase()} 写于 ${utils.formatDate(l.createdAt)} · 解锁于 ${utils.formatDate(l.unlockDate)}`;
            document.getElementById('letterViewContent').textContent = l.content;
            this.openModal('letterViewModal');
        },
        deleteLetter(id) {
            const l = state.letters.find(x => x.id === id);
            if (l && l.author !== state.currentUser) { toast('只能删除自己写的信', 'error'); return; }
            if (!confirm('确定删除这封信吗？')) return;
            state.letters = state.letters.filter(l => l.id !== id);
            this.saveData(); this.renderLetters();
        },
        renderLetters() {
            const list = document.getElementById('lettersList');
            if (state.letters.length === 0) { list.innerHTML = '<div class="empty-state large"><div class="empty-icon">✉️</div><p>还没有定时信件</p><p class="empty-hint">写一封给未来的信吧</p></div>'; return; }
            const sorted = [...state.letters].sort((a, b) => new Date(a.unlockDate) - new Date(b.unlockDate));
            const now = new Date();
            list.innerHTML = sorted.map(l => {
                const unlocked = now >= new Date(l.unlockDate);
                const days = utils.daysUntil(l.unlockDate);
                const canDelete = l.author === state.currentUser;
                return `<div class="letter-card ${unlocked ? 'unlocked' : 'locked'}" data-id="${l.id}"><div class="letter-icon">${unlocked ? '📬' : '🔒'}</div><div class="letter-title">${utils.escapeHtml(l.title)}</div><div class="letter-meta">${l.author.toUpperCase()} · ${utils.formatDate(l.createdAt)}</div><div class="letter-unlock">${unlocked ? '✓ 已解锁，点击查看' : `🔒 ${days} 天后解锁（${utils.formatDate(l.unlockDate)}）`}</div><div style="margin-top:8px;display:flex;gap:6px;"><button class="diary-action-btn" data-action="open" data-id="${l.id}">${unlocked ? '打开' : '查看'}</button>${canDelete ? `<button class="diary-action-btn delete" data-action="delete" data-id="${l.id}">删除</button>` : ''}</div></div>`;
            }).join('');
            list.querySelectorAll('[data-action="open"]').forEach(b => b.addEventListener('click', () => this.openLetter(b.dataset.id)));
            list.querySelectorAll('[data-action="delete"]').forEach(b => b.addEventListener('click', () => this.deleteLetter(b.dataset.id)));
            list.querySelectorAll('.letter-card').forEach(c => c.addEventListener('click', e => { if (!e.target.closest('button')) this.openLetter(c.dataset.id); }));
        },

        // 旅行计划
        bindTripEvents() {
            document.getElementById('addTripBtn').addEventListener('click', () => this.openTripModal());
            document.getElementById('saveTripBtn').addEventListener('click', () => this.saveTrip());
        },
        openTripModal() {
            state.editingTripId = null; document.getElementById('tripModalTitle').textContent = '新建旅行计划';
            document.getElementById('tripName').value = ''; document.getElementById('tripDestination').value = '';
            document.getElementById('tripStartDate').value = ''; document.getElementById('tripEndDate').value = '';
            document.getElementById('tripBudget').value = ''; document.getElementById('tripItems').value = '';
            document.getElementById('tripNotes').value = ''; this.openModal('tripModal');
        },
        saveTrip() {
            const name = document.getElementById('tripName').value.trim();
            if (!name) { toast('请填写旅行名称', 'error'); return; }
            const itemsText = document.getElementById('tripItems').value.trim();
            const items = itemsText ? itemsText.split('\n').filter(t => t.trim()).map(t => ({ text: t.trim(), done: false })) : [];
            state.trips.push({ id: utils.generateId(), name, destination: document.getElementById('tripDestination').value.trim(), startDate: document.getElementById('tripStartDate').value, endDate: document.getElementById('tripEndDate').value, budget: document.getElementById('tripBudget').value, items, notes: document.getElementById('tripNotes').value.trim(), author: state.currentUser, createdAt: new Date().toISOString() });
            this.saveData(); this.closeModal('tripModal'); this.renderTrips();
            toast('旅行计划已保存 ✈️', 'success');
        },
        toggleTripItem(tripId, itemIdx) {
            const t = state.trips.find(x => x.id === tripId); if (!t || !t.items[itemIdx]) return;
            t.items[itemIdx].done = !t.items[itemIdx].done;
            this.saveData(); this.renderTrips();
        },
        deleteTrip(id) {
            const t = state.trips.find(x => x.id === id);
            if (t && t.author !== state.currentUser) { toast('只能删除自己创建的旅行计划', 'error'); return; }
            if (!confirm('确定删除这个旅行计划吗？')) return;
            state.trips = state.trips.filter(t => t.id !== id);
            this.saveData(); this.renderTrips();
        },
        renderTrips() {
            const list = document.getElementById('tripsList');
            if (state.trips.length === 0) { list.innerHTML = '<div class="empty-state large"><div class="empty-icon">✈️</div><p>还没有旅行计划</p><p class="empty-hint">规划我们的第一次旅行吧</p></div>'; return; }
            list.innerHTML = state.trips.map(t => {
                const done = t.items.filter(i => i.done).length;
                const canDelete = t.author === state.currentUser;
                return `<div class="trip-card" data-id="${t.id}"><div class="trip-header"><div><div class="trip-name">${utils.escapeHtml(t.name)}</div><div class="trip-destination">📍 ${utils.escapeHtml(t.destination || '未设定')}</div></div><div class="trip-dates">${t.startDate ? utils.formatDate(t.startDate) : '未定'}${t.endDate ? ' ~ ' + utils.formatDate(t.endDate) : ''}${t.budget ? `<div class="trip-budget">💰 ${t.budget} 元</div>` : ''}</div></div>${t.items && t.items.length > 0 ? `<div class="trip-items">${t.items.map((item, ii) => `<div class="trip-item ${item.done ? 'done' : ''}" data-trip="${t.id}" data-item="${ii}"><div class="trip-item-check">✓</div><span class="trip-item-text">${utils.escapeHtml(item.text)}</span></div>`).join('')}<div style="font-size:11px;color:var(--text-light);margin-top:6px;">${done}/${t.items.length} 已完成 · ${t.author.toUpperCase()} 创建</div></div>` : ''}${t.notes ? `<div class="trip-notes">${utils.escapeHtml(t.notes)}</div>` : ''}${canDelete ? `<div class="trip-actions"><button class="diary-action-btn delete" data-action="delete" data-id="${t.id}">删除计划</button></div>` : ''}</div>`;
            }).join('');
            list.querySelectorAll('.trip-item').forEach(el => el.addEventListener('click', () => this.toggleTripItem(el.dataset.trip, parseInt(el.dataset.item))));
            list.querySelectorAll('[data-action="delete"]').forEach(b => b.addEventListener('click', () => this.deleteTrip(b.dataset.id)));
        },

        // 问答书
        bindQaEvents() {
            document.getElementById('saveQaBtn').addEventListener('click', () => this.saveQaAnswer());
        },
        openQaModal(index) {
            state.currentQaIndex = index;
            const q = QA_QUESTIONS[index];
            document.getElementById('qaQuestionText').textContent = q;
            const existing = state.qaAnswers[index];
            document.getElementById('qaAnswer').value = existing ? (existing[state.currentUser] || '') : '';
            this.openModal('qaModal');
        },
        saveQaAnswer() {
            const answer = document.getElementById('qaAnswer').value.trim();
            if (!answer) { toast('请填写答案', 'error'); return; }
            if (!state.qaAnswers[state.currentQaIndex]) state.qaAnswers[state.currentQaIndex] = {};
            state.qaAnswers[state.currentQaIndex][state.currentUser] = answer;
            this.saveData(); this.closeModal('qaModal'); this.renderQa();
            toast('回答已保存', 'success');
        },
        renderQa() {
            const list = document.getElementById('qaList');
            if (!list) return;
            const answered = Object.keys(state.qaAnswers).filter(k => state.qaAnswers[k] && (state.qaAnswers[k].hc || state.qaAnswers[k].lsy)).length;
            document.getElementById('qaProgressFill').style.width = (answered / QA_QUESTIONS.length * 100) + '%';
            document.getElementById('qaProgressText').textContent = `${answered} / ${QA_QUESTIONS.length} 已回答`;

            try {
                // 按分类渲染
                let html = '';
                const cats = (typeof QA_CATEGORIES !== 'undefined' && QA_CATEGORIES && QA_CATEGORIES.length) ? QA_CATEGORIES : null;
                if (cats) {
                    cats.forEach(cat => {
                        const catAnswered = cat.indices.filter(i => {
                            const a = state.qaAnswers[i];
                            return a && (a.hc || a.lsy);
                        }).length;
                        html += '<div class="qa-category"><div class="qa-category-header"><span class="qa-category-icon">' + cat.icon + '</span><span class="qa-category-name">' + cat.name + '</span><span class="qa-category-count">' + catAnswered + '/' + cat.indices.length + '</span></div><div class="qa-category-items">';
                        cat.indices.forEach(i => {
                            html += this.qaItemHTML(i);
                        });
                        html += '</div></div>';
                    });
                } else {
                    // 回退：平铺所有问题
                    html = QA_QUESTIONS.map((q, i) => this.qaItemHTML(i)).join('');
                }
                list.innerHTML = html;
            } catch (e) {
                console.error('renderQa error:', e);
                // 最终回退：简单平铺
                list.innerHTML = QA_QUESTIONS.map((q, i) => {
                    const ans = state.qaAnswers[i] || {};
                    return '<div class="qa-item"><div class="qa-item-header"><div class="qa-question">' + (i+1) + '. ' + utils.escapeHtml(q) + '</div></div><div style="margin-top:8px;"><button class="secondary-btn" onclick="app.openQaModal(' + i + ')">回答问题</button></div></div>';
                }).join('');
            }
        },
        qaItemHTML(i) {
            const q = QA_QUESTIONS[i];
            const ans = state.qaAnswers[i];
            const hcAns = ans && ans.hc;
            const lsyAns = ans && ans.lsy;
            let status = 'pending', statusText = '未回答';
            if (hcAns && lsyAns) { status = 'done'; statusText = '都回答了'; }
            else if (hcAns || lsyAns) { status = 'partial'; statusText = '部分回答'; }
            let answersHtml = '';
            if (hcAns || lsyAns) {
                answersHtml = '<div class="qa-answers"><div class="qa-answer hc"><div class="qa-answer-label">HC</div><div class="' + (hcAns ? '' : 'qa-answer empty') + '">' + (hcAns ? utils.escapeHtml(hcAns) : '尚未回答') + '</div></div><div class="qa-answer lsy"><div class="qa-answer-label">LSY</div><div class="' + (lsyAns ? '' : 'qa-answer empty') + '">' + (lsyAns ? utils.escapeHtml(lsyAns) : '尚未回答') + '</div></div></div>';
            }
            const btnText = ((hcAns && state.currentUser === 'hc') || (lsyAns && state.currentUser === 'lsy')) ? '修改我的回答' : '回答问题';
            return '<div class="qa-item"><div class="qa-item-header"><div class="qa-question">' + (i+1) + '. ' + utils.escapeHtml(q) + '</div><span class="qa-status ' + status + '">' + statusText + '</span></div>' + answersHtml + '<div style="margin-top:8px;"><button class="secondary-btn" onclick="app.openQaModal(' + i + ')">' + btnText + '</button></div></div>';
        },

        // 约会盲盒
        bindBlindboxEvents() {
            document.getElementById('quickBlindbox').addEventListener('click', () => this.openModal('blindboxModal'));
            document.getElementById('blindboxDrawBtn').addEventListener('click', () => this.drawBlindbox());
            document.getElementById('blindboxAgainBtn').addEventListener('click', () => this.drawBlindbox());
        },
        drawBlindbox() {
            const box = document.getElementById('blindboxBox');
            box.classList.add('shaking');
            setTimeout(() => {
                box.classList.remove('shaking');
                const idea = DATE_IDEAS[Math.floor(Math.random() * DATE_IDEAS.length)];
                document.getElementById('blindboxTitle').textContent = idea.title;
                document.getElementById('blindboxDesc').textContent = idea.desc;
                document.getElementById('blindboxResult').style.display = 'block';
                document.getElementById('blindboxDrawBtn').style.display = 'none';
                document.getElementById('blindboxAgainBtn').style.display = 'inline-block';
            }, 500);
        },

        // 年度回顾
        bindAnnualEvents() {
            document.getElementById('quickAnnual').addEventListener('click', () => this.openAnnual());
            document.getElementById('annualYear').addEventListener('change', () => this.renderAnnual());
        },
        openAnnual() {
            const years = [...new Set([...state.photos.map(p => new Date(p.date || p.createdAt).getFullYear()), ...state.diaries.map(d => new Date(d.date || d.createdAt).getFullYear())])].sort((a, b) => b - a);
            if (years.length === 0) years.push(new Date().getFullYear());
            const select = document.getElementById('annualYear');
            select.innerHTML = years.map(y => `<option value="${y}">${y}年</option>`).join('');
            state.annualYear = years[0];
            this.renderAnnual();
            this.openModal('annualModal');
        },
        renderAnnual() {
            const year = parseInt(document.getElementById('annualYear').value) || state.annualYear;
            const photos = state.photos.filter(p => new Date(p.date || p.createdAt).getFullYear() === year);
            const diaries = state.diaries.filter(d => new Date(d.date || d.createdAt).getFullYear() === year);
            const wishes = state.wishes.filter(w => new Date(w.createdAt).getFullYear() === year);
            const messages = state.messages.filter(m => new Date(m.createdAt).getFullYear() === year);
            const trips = state.trips.filter(t => new Date(t.createdAt).getFullYear() === year);
            const content = document.getElementById('annualContent');
            content.innerHTML = `
                <div class="annual-grid">
                    <div class="annual-card"><div class="annual-number">${photos.length}</div><div class="annual-label">张照片</div></div>
                    <div class="annual-card"><div class="annual-number">${diaries.length}</div><div class="annual-label">篇日记</div></div>
                    <div class="annual-card"><div class="annual-number">${wishes.length}</div><div class="annual-label">个心愿</div></div>
                    <div class="annual-card"><div class="annual-number">${messages.length}</div><div class="annual-label">条留言</div></div>
                </div>
                ${trips.length > 0 ? `<div class="annual-section-title">✈️ 旅行计划（${trips.length}）</div>${trips.map(t => `<div class="annual-item"><span>${utils.escapeHtml(t.name)}</span><span>${t.destination || ''}</span></div>`).join('')}` : ''}
                ${diaries.length > 0 ? `<div class="annual-section-title">📝 日记精选</div>${diaries.slice(0, 5).map(d => `<div class="annual-item"><span>${utils.escapeHtml(d.title || '无标题')}</span><span>${utils.formatDate(d.date)}</span></div>`).join('')}` : ''}
                ${photos.length > 0 ? `<div class="annual-section-title">📷 照片预览</div><div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px;">${photos.slice(0, 8).map(p => p.type === 'video' ? `<div style="aspect-ratio:1;border-radius:8px;overflow:hidden;background:#000;display:flex;align-items:center;justify-content:center;color:white;font-size:20px;">▶</div>` : `<img src="${p.url}" style="aspect-ratio:1;object-fit:cover;border-radius:8px;width:100%;">`).join('')}</div>` : ''}
                ${photos.length === 0 && diaries.length === 0 ? '<div class="empty-state" style="grid-column:1/-1;">这一年还没有记录，开始创造回忆吧 ♥</div>' : ''}
            `;
        },

        // 拼贴
        bindCollageEvents() {
            document.getElementById('quickCollage').addEventListener('click', () => this.openCollage());
            document.getElementById('collageGenerateBtn').addEventListener('click', () => this.generateCollage());
            document.getElementById('collageDownloadBtn').addEventListener('click', () => this.downloadCollage());
        },
        openCollage() {
            state.collageSelected = [];
            const select = document.getElementById('collageSelect');
            if (state.photos.filter(p => p.type !== 'video').length === 0) {
                select.innerHTML = '<div class="empty-state">还没有照片可以拼贴</div>';
            } else {
                select.innerHTML = state.photos.filter(p => p.type !== 'video').map((p, i) => `<div class="collage-select-item" data-index="${i}"><img src="${p.url}" alt=""><span class="collage-select-check">✓</span></div>`).join('');
                select.querySelectorAll('.collage-select-item').forEach(el => el.addEventListener('click', () => {
                    const idx = parseInt(el.dataset.index);
                    const pos = state.collageSelected.indexOf(idx);
                    if (pos >= 0) { state.collageSelected.splice(pos, 1); el.classList.remove('selected'); }
                    else if (state.collageSelected.length < 9) { state.collageSelected.push(idx); el.classList.add('selected'); }
                    else toast('最多选择9张照片', 'error');
                }));
            }
            document.getElementById('collageResult').style.display = 'none';
            this.openModal('collageModal');
        },
        async generateCollage() {
            if (state.collageSelected.length < 2) { toast('请至少选择2张照片', 'error'); return; }
            const photos = state.collageSelected.map(i => state.photos.filter(p => p.type !== 'video')[i]);
            await canvasUtil.generateCollage(photos);
            document.getElementById('collageResult').style.display = 'block';
            toast('拼贴图已生成', 'success');
        },
        downloadCollage() {
            const canvas = document.getElementById('collageCanvas');
            const link = document.createElement('a');
            link.download = `hc-lsy-collage-${utils.formatDateInput()}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
            toast('拼贴图已下载', 'success');
        },

        // 分享卡片
        bindShareEvents() {
            document.getElementById('shareDownloadBtn').addEventListener('click', () => this.downloadShareCard());
        },
        openShareCard(diaryId) {
            const d = state.diaries.find(x => x.id === diaryId);
            if (!d) return;
            canvasUtil.generateShareCard(d.title, d.content, d.author, utils.formatDate(d.date));
            this.openModal('shareModal');
        },
        downloadShareCard() {
            const canvas = document.getElementById('shareCanvas');
            const link = document.createElement('a');
            link.download = `hc-lsy-diary-${utils.formatDateInput()}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
            toast('分享卡片已下载', 'success');
        },

        // 设置
        bindSettingsEvents() {
            document.getElementById('saveAnniversaryBtn').addEventListener('click', () => {
                const d = document.getElementById('anniversaryDate').value;
                if (d) { storage.set(CONFIG.storageKeys.anniversary, d); this.saveData(); this.renderHome(); this.checkAnniversaryDay(); toast('纪念日已保存', 'success'); }
            });
            document.getElementById('addAnnivBtn').addEventListener('click', () => {
                const name = document.getElementById('newAnnivName').value.trim(), date = document.getElementById('newAnnivDate').value;
                if (!name || !date) { toast('请填写名称和日期', 'error'); return; }
                state.anniversaries.push({ id: utils.generateId(), name, date });
                this.saveData(); document.getElementById('newAnnivName').value = ''; document.getElementById('newAnnivDate').value = '';
                this.renderAnniversaries(); this.renderHome(); toast('纪念日已添加', 'success');
            });
            document.getElementById('saveWeatherBtn').addEventListener('click', () => weather.save());
            document.getElementById('savePeriodBtn').addEventListener('click', () => period.save());
            document.getElementById('saveGithubBtn').addEventListener('click', () => {
                const c = { owner: document.getElementById('githubOwner').value.trim(), repo: document.getElementById('githubRepo').value.trim(), token: document.getElementById('githubToken').value.trim() };
                if (!c.owner || !c.repo || !c.token) { toast('请填写完整配置', 'error'); return; }
                github.saveConfig(c);
                const s = document.getElementById('githubStatus'); s.textContent = '测试连接中...'; s.className = 'config-status';
                github.getFile('data/app-data.json').then(() => { s.textContent = '✓ 配置成功'; s.className = 'config-status success'; toast('GitHub 配置成功', 'success'); this.loadData(); }).catch(() => { s.textContent = '✓ 已保存（连接失败）'; s.className = 'config-status error'; });
            });
            document.getElementById('changePwdBtn').addEventListener('click', async () => {
                if (await auth.changePassword(document.getElementById('pwdTarget').value, document.getElementById('newPassword').value)) document.getElementById('newPassword').value = '';
            });
            document.getElementById('exportDataBtn').addEventListener('click', () => this.exportData());
            document.getElementById('clearDataBtn').addEventListener('click', () => {
                if (!confirm('确定要清空所有本地数据吗？此操作不可恢复！')) return;
                ['photos', 'diaries', 'wishes', 'messages', 'anniversaries', 'letters', 'trips', 'qaAnswers', 'albums', 'anniversary', 'missYou', 'recycleBin', 'music', 'coverImage', 'period', 'weather', 'passwords', 'pwdVersion'].forEach(k => storage.remove(CONFIG.storageKeys[k]));
                state.photos = []; state.diaries = []; state.wishes = []; state.messages = [];
                state.anniversaries = []; state.letters = []; state.trips = []; state.qaAnswers = {};
                state.albums = ['未分类', '旅行', '日常', '节日', '合照'];
                state.recycleBin = []; state.music = null;
                this.renderAll(); toast('本地数据已清空', 'info');
            });
            // 相册管理
            const addAlbumBtn = document.getElementById('addAlbumBtn');
            if (addAlbumBtn) addAlbumBtn.addEventListener('click', () => {
                const name = document.getElementById('newAlbumName').value.trim();
                this.addAlbum(name);
                document.getElementById('newAlbumName').value = '';
            });
        },
        renderAnniversaries() {
            const list = document.getElementById('anniversaryList');
            if (state.anniversaries.length === 0) { list.innerHTML = '<div class="empty-state" style="padding:12px;">暂无纪念日</div>'; return; }
            list.innerHTML = state.anniversaries.map(a => `<div class="anniversary-item" data-id="${a.id}"><span class="anniversary-item-name">${utils.escapeHtml(a.name)}</span><span class="anniversary-item-date">${utils.formatDate(a.date)}</span><button class="anniversary-delete" data-id="${a.id}">删除</button></div>`).join('');
            list.querySelectorAll('.anniversary-delete').forEach(b => b.addEventListener('click', () => {
                state.anniversaries = state.anniversaries.filter(a => a.id !== b.dataset.id);
                this.saveData(); this.renderAnniversaries(); this.renderHome();
            }));
        },
        renderRecycle() {
            const list = document.getElementById('recycleList');
            if (state.recycleBin.length === 0) { list.innerHTML = '<div class="empty-state" style="padding:12px;">回收站为空</div>'; return; }
            list.innerHTML = state.recycleBin.map(r => {
                let title = '';
                if (r.type === 'photo') title = r.data.caption || '照片';
                else if (r.type === 'diary') title = r.data.title || '日记';
                else if (r.type === 'wish') title = r.data.content || '心愿';
                else if (r.type === 'message') title = (r.data.content || '').substring(0, 20) + '...';
                const owner = r.data.uploader || r.data.author;
                const canAction = !owner || owner === state.currentUser;
                return `<div class="recycle-item"><div class="recycle-item-info"><span class="recycle-item-type">${r.type}</span><span class="recycle-item-title">${utils.escapeHtml(title)}</span><div class="recycle-item-date">删除于 ${utils.formatDate(r.deletedAt)}${owner ? ` · ${owner.toUpperCase()}` : ''}</div></div>${canAction ? `<div class="recycle-item-actions"><button class="recycle-btn restore" data-id="${r.id}">恢复</button><button class="recycle-btn delete" data-id="${r.id}">永久删除</button></div>` : ''}</div>`;
            }).join('');
            list.querySelectorAll('.recycle-btn.restore').forEach(b => b.addEventListener('click', () => recycle.restore(b.dataset.id)));
            list.querySelectorAll('.recycle-btn.delete').forEach(b => b.addEventListener('click', () => recycle.deleteForever(b.dataset.id)));
        },
        loadSettings() {
            const a = storage.get(CONFIG.storageKeys.anniversary);
            if (a) document.getElementById('anniversaryDate').value = a;
            // GitHub 配置仅管理员可见
            const ghSection = document.getElementById('githubConfigSection');
            if (ghSection) ghSection.style.display = state.currentUser === 'admin' ? 'block' : 'none';
            // 显示当前生效的配置（本地覆盖或内置默认）
            const gh = github.isConfigured() ? github.config : CONFIG.defaultGithub;
            if (gh) {
                document.getElementById('githubOwner').value = gh.owner || '';
                document.getElementById('githubRepo').value = gh.repo || '';
                document.getElementById('githubToken').value = gh.token || '';
            }
            this.renderAnniversaries(); this.renderRecycle(); this.renderAlbumList();
        },
        exportData() {
            const data = { photos: state.photos, diaries: state.diaries, wishes: state.wishes, messages: state.messages, anniversaries: state.anniversaries, letters: state.letters, trips: state.trips, qaAnswers: state.qaAnswers, albums: state.albums, missYou: storage.get(CONFIG.storageKeys.missYou, {}), recycleBin: state.recycleBin, music: state.music, coverImage: storage.get(CONFIG.storageKeys.coverImage, null), period: storage.get(CONFIG.storageKeys.period, null), weather: storage.get(CONFIG.storageKeys.weather, null), passwords: storage.get(CONFIG.storageKeys.passwords, {}), pwdVersion: storage.get(CONFIG.storageKeys.pwdVersion, 0), anniversary: storage.get(CONFIG.storageKeys.anniversary), exportedAt: new Date().toISOString() };
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a'); a.href = url; a.download = `hc-lsy-data-${utils.formatDateInput()}.json`; a.click();
            URL.revokeObjectURL(url); toast('数据已导出', 'success');
        },

        // 弹窗
        openModal(id) { document.getElementById(id).classList.add('active'); document.body.style.overflow = 'hidden'; },
        closeModal(id) {
            document.getElementById(id).classList.remove('active');
            document.body.style.overflow = '';
            if (id === 'lightboxModal') this.stopSlideshow();
        }
    };

    // 暴露 app 给全局（用于问答书按钮 onclick）
    window.app = app;

    // 启动
    document.addEventListener('DOMContentLoaded', () => {
        initFloatingHearts();
        github.init();
        app.init();
        auth.init();
        // PWA: 注册 Service Worker（离线支持）
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('./service-worker.js').then(() => {
                console.log('PWA Service Worker 注册成功');
            }).catch(err => {
                console.warn('PWA Service Worker 注册失败:', err);
            });
        }
    });

})();
