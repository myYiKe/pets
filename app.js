/* ===== 爪迹 PetTrace · MVP 逻辑 ===== */

// ---------- 工具 ----------
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}
function fmtDate(d) {
  const dt = new Date(d);
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, '0');
  const day = String(dt.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
function today() { return fmtDate(new Date()); }

function calcAge(birthDate) {
  if (!birthDate) return '未知';
  const b = new Date(birthDate);
  const now = new Date();
  let months = (now.getFullYear() - b.getFullYear()) * 12 + (now.getMonth() - b.getMonth());
  if (months < 0) months = 0;
  if (months < 12) return `${months} 个月`;
  const y = Math.floor(months / 12);
  const rem = months % 12;
  return rem ? `${y} 岁 ${rem} 个月` : `${y} 岁`;
}
function daysAgo(n) { return fmtDate(new Date(Date.now() - n * 86400000)); }

// ---------- 常量 ----------
const SPECIES = ['猫咪', '狗狗', '兔子', '仓鼠', '鸟类', '爬宠', '鱼类', '其他'];
const EMOJIS = ['🐱', '🐶', '🐰', '🐹', '🦜', '🐢', '🐠', '🦎', '🐴', '🐦', '🐍', '🐟'];
const COLORS = ['#f9a8d4', '#93c5fd', '#6ee7b7', '#fcd34d', '#c4b5fd', '#fca5a5', '#5eead4', '#fda4af'];
const REGIONS = ['上海', '北京', '杭州', '深圳', '成都', '广州', '南京', '武汉'];

const CATEGORIES = {
  weight:   { label: '体重', icon: '⚖️', color: '#bfdbfe' },
  vaccine:  { label: '疫苗', icon: '💉', color: '#a7f3d0' },
  deworming:{ label: '驱虫', icon: '🪱', color: '#fde68a' },
  medical:  { label: '医疗', icon: '🩺', color: '#fbcfe8' },
};

// ---------- 状态 & 持久化 ----------
const KEYS = { pets: 'pettrace_pets', records: 'pettrace_records', posts: 'pettrace_posts' };
let state = { pets: [], records: [], posts: [] };
let currentView = 'dashboard';

// 附近宠友（演示数据）
const MOCK_NEARBY = [
  { id: 'n1', name: '布丁', species: '猫咪', breed: '布偶猫', gender: '妹妹', ageText: '1 岁 2 个月', region: '上海', distanceKm: 1.2, emoji: '🐱', color: '#c4b5fd', tags: ['温柔', '爱撒娇'] },
  { id: 'n2', name: '皮皮', species: '狗狗', breed: '柯基', gender: '弟弟', ageText: '2 岁 1 个月', region: '上海', distanceKm: 2.5, emoji: '🐶', color: '#fcd34d', tags: ['爱运动', '社牛'] },
  { id: 'n3', name: '团子', species: '兔子', breed: '垂耳兔', gender: '妹妹', ageText: '8 个月', region: '上海', distanceKm: 3.8, emoji: '🐰', color: '#f9a8d4', tags: ['安静', '爱吃草'] },
  { id: 'n4', name: '可乐', species: '猫咪', breed: '美短', gender: '弟弟', ageText: '3 岁', region: '上海', distanceKm: 5.1, emoji: '🐱', color: '#93c5fd', tags: ['高冷', '粘人'] },
  { id: 'n5', name: '奶糖', species: '狗狗', breed: '比熊', gender: '妹妹', ageText: '1 岁 6 个月', region: '北京', distanceKm: 0, emoji: '🐶', color: '#fda4af', tags: ['乖巧', '爱拍照'] },
  { id: 'n6', name: '球球', species: '仓鼠', breed: '金丝熊', gender: '弟弟', ageText: '6 个月', region: '杭州', distanceKm: 0, emoji: '🐹', color: '#fcd34d', tags: ['可爱', '夜猫子'] },
  { id: 'n7', name: '翡翠', species: '鸟类', breed: '虎皮鹦鹉', gender: '妹妹', ageText: '1 岁', region: '杭州', distanceKm: 0, emoji: '🦜', color: '#6ee7b7', tags: ['会说话', '活泼'] },
  { id: 'n8', name: '多多', species: '猫咪', breed: '橘猫', gender: '弟弟', ageText: '4 岁', region: '深圳', distanceKm: 0, emoji: '🐱', color: '#fcd34d', tags: ['干饭王', '温柔'] },
  { id: 'n9', name: '小鹿', species: '狗狗', breed: '柴犬', gender: '弟弟', ageText: '2 岁', region: '成都', distanceKm: 0, emoji: '🐶', color: '#fca5a5', tags: ['爱笑', '精力旺'] },
];

function load() {
  state.pets = JSON.parse(localStorage.getItem(KEYS.pets) || 'null');
  state.records = JSON.parse(localStorage.getItem(KEYS.records) || 'null');
  state.posts = JSON.parse(localStorage.getItem(KEYS.posts) || 'null');
  if (!state.pets) { seed(); }
  state.records = state.records || [];
  state.posts = state.posts || [];
}
function save() {
  localStorage.setItem(KEYS.pets, JSON.stringify(state.pets));
  localStorage.setItem(KEYS.records, JSON.stringify(state.records));
  localStorage.setItem(KEYS.posts, JSON.stringify(state.posts));
}

function seed() {
  const p1 = { id: 'pet-demo-1', name: '雪球', species: '猫咪', breed: '英国短毛猫', gender: '妹妹', birthDate: '2025-03-12', region: '上海', emoji: '🐱', color: '#f9a8d4' };
  const p2 = { id: 'pet-demo-2', name: '豆豆', species: '狗狗', breed: '柯基', gender: '弟弟', birthDate: '2024-11-02', region: '上海', emoji: '🐶', color: '#93c5fd' };
  state.pets = [p1, p2];
  state.records = [
    { id: uid(), petId: p1.id, category: 'weight', date: '2025-04-01', title: '', value: 1.2, note: '' },
    { id: uid(), petId: p1.id, category: 'weight', date: '2025-06-01', title: '', value: 2.1, note: '' },
    { id: uid(), petId: p1.id, category: 'weight', date: '2025-09-01', title: '', value: 3.0, note: '' },
    { id: uid(), petId: p1.id, category: 'weight', date: '2025-12-01', title: '', value: 3.6, note: '' },
    { id: uid(), petId: p1.id, category: 'weight', date: '2026-03-01', title: '', value: 4.1, note: '' },
    { id: uid(), petId: p1.id, category: 'weight', date: '2026-06-01', title: '', value: 4.3, note: '' },
    { id: uid(), petId: p1.id, category: 'vaccine', date: '2025-04-15', title: '猫三联（第一针）', value: null, note: '' },
    { id: uid(), petId: p1.id, category: 'vaccine', date: '2025-05-15', title: '猫三联（第二针）', value: null, note: '' },
    { id: uid(), petId: p1.id, category: 'vaccine', date: '2025-06-15', title: '猫三联（第三针）+ 狂犬', value: null, note: '' },
    { id: uid(), petId: p1.id, category: 'deworming', date: '2025-05-20', title: '体内驱虫', value: null, note: '' },
    { id: uid(), petId: p1.id, category: 'deworming', date: '2025-11-20', title: '体内外驱虫', value: null, note: '' },
    { id: uid(), petId: p1.id, category: 'medical', date: '2026-02-10', title: '年度体检', value: null, note: '各项指标正常' },

    { id: uid(), petId: p2.id, category: 'weight', date: '2024-12-01', title: '', value: 5.0, note: '' },
    { id: uid(), petId: p2.id, category: 'weight', date: '2025-04-01', title: '', value: 8.2, note: '' },
    { id: uid(), petId: p2.id, category: 'weight', date: '2025-10-01', title: '', value: 10.5, note: '' },
    { id: uid(), petId: p2.id, category: 'weight', date: '2026-04-01', title: '', value: 11.2, note: '' },
    { id: uid(), petId: p2.id, category: 'vaccine', date: '2025-01-10', title: '犬四联', value: null, note: '' },
    { id: uid(), petId: p2.id, category: 'vaccine', date: '2025-06-10', title: '狂犬疫苗', value: null, note: '' },
    { id: uid(), petId: p2.id, category: 'deworming', date: '2025-07-15', title: '体内驱虫', value: null, note: '' },
  ];
  state.posts = [
    { id: uid(), petId: p1.id, authorName: '雪球的铲屎官', text: '今天学会了新的逗猫棒姿势，直接起飞 🐾', image: '', likes: 12, liked: false, date: '2026-09-20' },
    { id: uid(), petId: p2.id, authorName: '豆豆的铲屎官', text: '周末带豆豆去公园，追着球跑了一下午，回家直接瘫倒～', image: '', likes: 8, liked: false, date: '2026-09-28' },
  ];
  save();
}

// ---------- 弹窗 & 提示 ----------
function openModal(html) {
  $('#modalBox').innerHTML = html;
  $('#modalOverlay').classList.add('show');
}
function closeModal() { $('#modalOverlay').classList.remove('show'); }
function toast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove('show'), 2200);
}

// ---------- 导航 ----------
const VIEW_TITLES = {
  dashboard: '首页', pets: '我的宠物', records: '健康档案',
  timeline: '成长时间线', community: '宠友社区', match: '附近宠友',
};
function switchView(view) {
  currentView = view;
  $$('.nav-item').forEach(el => el.classList.toggle('active', el.dataset.view === view));
  $('#viewTitle').textContent = VIEW_TITLES[view];
  $('#topbarActions').innerHTML = '';
  $('#content').innerHTML = '';
  const renderers = {
    dashboard: renderDashboard, pets: renderPets, records: renderRecords,
    timeline: renderTimeline, community: renderCommunity, match: renderMatch,
  };
  renderers[view]();
}

function petOptionsHtml(selected) {
  return state.pets.map(p =>
    `<option value="${p.id}" ${p.id === selected ? 'selected' : ''}>${p.emoji} ${p.name}</option>`
  ).join('');
}

// ================= 首页 =================
function renderDashboard() {
  const weekAgo = daysAgo(7);
  const weekRecords = state.records.filter(r => r.date >= weekAgo).length;
  const stats = [
    { label: '我的宠物', value: state.pets.length, icon: '🐾', color: '#fbcfe8' },
    { label: '健康记录', value: state.records.length, icon: '💉', color: '#a7f3d0' },
    { label: '近 7 天记录', value: weekRecords, icon: '📅', color: '#bfdbfe' },
    { label: '附近宠友', value: MOCK_NEARBY.filter(n => n.region === (state.pets[0]?.region || '上海')).length, icon: '📍', color: '#fde68a' },
  ];

  // 默认选中有体重数据的宠物
  const weightPets = state.pets.filter(p => state.records.some(r => r.petId === p.id && r.category === 'weight'));
  const chartPet = weightPets[0]?.id || state.pets[0]?.id;

  $('#content').innerHTML = `
    <div class="grid" style="margin-bottom:18px">
      <div class="grid grid-4">
        ${stats.map(s => `
          <div class="card stat">
            <div class="stat-top">
              <span class="stat-value">${s.value}</span>
              <span class="stat-ico" style="background:${s.color}">${s.icon}</span>
            </div>
            <div class="stat-label">${s.label}</div>
          </div>`).join('')}
      </div>
    </div>

    <div class="grid grid-2">
      <div class="card">
        <div class="section-title">
          <span>📈 体重趋势</span>
          <select id="chartPetSelect" style="padding:7px 10px;border-radius:10px;border:1px solid var(--border);font-size:13px">
            ${state.pets.map(p => `<option value="${p.id}" ${p.id === chartPet ? 'selected' : ''}>${p.emoji} ${p.name}</option>`).join('')}
          </select>
        </div>
        <div class="chart-wrap"><canvas id="weightChart"></canvas></div>
      </div>

      <div class="card">
        <div class="section-title"><span>🕒 最近动态</span></div>
        <div class="record-list">
          ${recentActivityHtml(5)}
        </div>
      </div>
    </div>
  `;

  $('#chartPetSelect').addEventListener('change', e => drawWeightChart($('#weightChart'), e.target.value));
  drawWeightChart($('#weightChart'), chartPet);
}

function recentActivityHtml(limit) {
  const events = buildTimelineEvents().slice(0, limit);
  if (!events.length) return `<div class="empty"><span class="big">🌱</span>还没有动态，去添加宠物和记录吧</div>`;
  return events.map(ev => {
    const color = ev.type === 'birth' ? '#fbcfe8' : ev.type === 'post' ? '#c4b5fd' : (CATEGORIES[ev.type]?.color || '#e2e8f0');
    const icon = ev.type === 'birth' ? '🎂' : ev.type === 'post' ? '💬' : (CATEGORIES[ev.type]?.icon || '📌');
    return `<div class="record-item">
      <span class="record-ico" style="background:${color}">${icon}</span>
      <div class="record-body">
        <div class="record-title">${ev.title}</div>
        <div class="record-sub">${escapeHtml(ev.desc)}</div>
      </div>
      <span class="record-date">${ev.date}</span>
    </div>`;
  }).join('');
}

// 体重趋势折线图（Canvas）
function drawWeightChart(canvas, petId) {
  if (!canvas) return;
  const recs = state.records
    .filter(r => r.petId === petId && r.category === 'weight' && r.value != null)
    .sort((a, b) => a.date.localeCompare(b.date));

  const dpr = window.devicePixelRatio || 1;
  const w = canvas.clientWidth || canvas.parentElement.clientWidth;
  const h = canvas.clientHeight || 220;
  canvas.width = w * dpr; canvas.height = h * dpr;
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, w, h);

  if (recs.length < 2) {
    ctx.fillStyle = '#94a3b8';
    ctx.font = '13px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('体重数据不足，先添加几条记录吧', w / 2, h / 2);
    return;
  }

  const pad = 28;
  const chartW = w - pad * 2;
  const chartH = h - pad * 2;
  const values = recs.map(r => Number(r.value));
  const min = Math.min(...values) - 0.5;
  const max = Math.max(...values) + 0.5;
  const px = i => pad + (i / (recs.length - 1)) * chartW;
  const py = v => pad + (1 - (v - min) / (max - min)) * chartH;

  // 网格
  ctx.strokeStyle = 'rgba(148,163,184,0.18)';
  ctx.lineWidth = 1;
  ctx.font = '11px sans-serif';
  ctx.fillStyle = '#94a3b8';
  ctx.textAlign = 'right';
  for (let g = 0; g <= 3; g++) {
    const val = min + (max - min) * (g / 3);
    const y = py(val);
    ctx.beginPath(); ctx.moveTo(pad, y); ctx.lineTo(w - pad, y); ctx.stroke();
    ctx.fillText(val.toFixed(1) + 'kg', pad - 5, y + 3);
  }
  // 日期标签
  ctx.textAlign = 'center';
  ctx.fillText(recs[0].date.slice(5), px(0), h - 8);
  ctx.fillText(recs[recs.length - 1].date.slice(5), px(recs.length - 1), h - 8);

  // 折线
  const grad = ctx.createLinearGradient(0, pad, 0, h - pad);
  grad.addColorStop(0, 'rgba(249,168,212,0.25)');
  grad.addColorStop(1, 'rgba(249,168,212,0)');
  ctx.beginPath();
  ctx.moveTo(px(0), py(values[0]));
  for (let i = 1; i < recs.length; i++) ctx.lineTo(px(i), py(values[i]));
  ctx.strokeStyle = '#f472b6';
  ctx.lineWidth = 2.5;
  ctx.lineJoin = 'round';
  ctx.stroke();

  // 面积
  ctx.lineTo(px(recs.length - 1), h - pad);
  ctx.lineTo(px(0), h - pad);
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();

  // 数据点
  recs.forEach((r, i) => {
    ctx.beginPath();
    ctx.arc(px(i), py(Number(r.value)), 4, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.strokeStyle = '#f472b6';
    ctx.lineWidth = 2;
    ctx.stroke();
  });
}

// ================= 我的宠物 =================
function renderPets() {
  $('#topbarActions').innerHTML = `<button class="btn" onclick="openAddPet()">➕ 添加宠物</button>`;
  if (!state.pets.length) {
    $('#content').innerHTML = `<div class="card empty"><span class="big">🐾</span>还没有宠物档案<br>点击右上角「添加宠物」开始记录吧</div>`;
    return;
  }
  $('#content').innerHTML = `<div class="grid grid-2">
    ${state.pets.map(petCardHtml).join('')}
    <div class="card empty" style="cursor:pointer" onclick="openAddPet()">
      <span class="big">➕</span>添加新宠物
    </div>
  </div>`;
}

function petCardHtml(p) {
  const weights = state.records.filter(r => r.petId === p.id && r.category === 'weight').sort((a, b) => b.date.localeCompare(a.date));
  const latestWeight = weights.length ? weights[0].value + ' kg' : '暂无';
  const vaccineCount = state.records.filter(r => r.petId === p.id && r.category === 'vaccine').length;
  const recCount = state.records.filter(r => r.petId === p.id).length;
  return `
    <div class="card pet-card">
      <div class="pet-card-head">
        <div class="avatar" style="background:${p.color}">${p.emoji}</div>
        <div>
          <div class="pet-name">${p.name}</div>
          <div class="pet-meta">${p.breed} · ${p.gender} · ${calcAge(p.birthDate)}</div>
          <div class="pet-meta">📍 ${p.region}</div>
        </div>
      </div>
      <div class="pet-stats">
        <span class="chip">⚖️ 体重 ${latestWeight}</span>
        <span class="chip">💉 疫苗 ${vaccineCount} 次</span>
        <span class="chip">📋 记录 ${recCount} 条</span>
      </div>
      <div class="pet-actions">
        <button class="btn sm" onclick="openAddRecord('${p.id}')">➕ 记一条</button>
        <button class="btn sm ghost" onclick="viewPetTimeline('${p.id}')">📅 时间线</button>
        <button class="btn sm ghost danger" onclick="deletePet('${p.id}')">删除</button>
      </div>
    </div>`;
}

function viewPetTimeline(petId) {
  switchView('timeline');
  renderTimeline(petId);
}

// ================= 健康档案 =================
function renderRecords() {
  $('#topbarActions').innerHTML = `<button class="btn" onclick="openAddRecord()">➕ 添加记录</button>`;
  if (!state.pets.length) {
    $('#content').innerHTML = `<div class="card empty"><span class="big">🐾</span>请先添加宠物</div>`;
    return;
  }

  let filterPet = 'all';
  let filterCat = 'all';

  $('#content').innerHTML = `
    <div class="filterbar">
      <select id="filterPet">
        <option value="all">全部宠物</option>
        ${petOptionsHtml('')}
      </select>
      <select id="filterCat">
        <option value="all">全部类型</option>
        ${Object.entries(CATEGORIES).map(([k, c]) => `<option value="${k}">${c.icon} ${c.label}</option>`).join('')}
      </select>
    </div>
    <div id="recordListWrap"></div>
  `;

  function applyFilter() {
    filterPet = $('#filterPet').value;
    filterCat = $('#filterCat').value;
    renderRecordList();
  }
  $('#filterPet').addEventListener('change', applyFilter);
  $('#filterCat').addEventListener('change', applyFilter);

  function renderRecordList() {
    let list = state.records
      .filter(r => (filterPet === 'all' || r.petId === filterPet) && (filterCat === 'all' || r.category === filterCat))
      .sort((a, b) => b.date.localeCompare(a.date));
    if (!list.length) {
      $('#recordListWrap').innerHTML = `<div class="card empty"><span class="big">🗂️</span>暂无记录</div>`;
      return;
    }
    $('#recordListWrap').innerHTML = `<div class="record-list">${list.map(recordItemHtml).join('')}</div>`;
    $$('.rec-del').forEach(btn => btn.addEventListener('click', () => deleteRecord(btn.dataset.id)));
  }
  renderRecordList();
}

function recordItemHtml(r) {
  const p = state.pets.find(x => x.id === r.petId);
  const cat = CATEGORIES[r.category];
  let sub = p ? `${p.emoji} ${p.name} · ${cat.label}` : cat.label;
  let title = r.title || (r.category === 'weight' ? '体重记录' : cat.label);
  let extra = r.category === 'weight' ? `${r.value} kg` : '';
  if (r.note) extra += (extra ? ' · ' : '') + r.note;
  return `
    <div class="record-item">
      <span class="record-ico" style="background:${cat.color}">${cat.icon}</span>
      <div class="record-body">
        <div class="record-title">${title} ${extra ? `<span class="small muted">${extra}</span>` : ''}</div>
        <div class="record-sub">${sub}</div>
      </div>
      <span class="record-date">${r.date}</span>
      <button class="btn sm ghost danger rec-del" data-id="${r.id}">删除</button>
    </div>`;
}

// ================= 成长时间线 =================
function buildTimelineEvents() {
  const events = [];
  state.pets.forEach(p => {
    events.push({ date: p.birthDate, type: 'birth', pet: p, title: `${p.name} 出生`, desc: `${p.breed} · ${p.gender}` });
  });
  state.records.forEach(r => {
    const p = state.pets.find(x => x.id === r.petId);
    if (!p) return;
    const cat = CATEGORIES[r.category];
    let desc = r.category === 'weight' ? `${r.value} kg` : (r.title || cat.label);
    if (r.note) desc += ` · ${r.note}`;
    events.push({ date: r.date, type: r.category, pet: p, title: `${p.name} · ${cat.label}`, desc });
  });
  state.posts.forEach(post => {
    const p = state.pets.find(x => x.id === post.petId);
    events.push({ date: post.date, type: 'post', pet: p, title: `${p ? p.name + ' ' : ''}分享了日常`, desc: post.text });
  });
  events.sort((a, b) => b.date.localeCompare(a.date));
  return events;
}

function renderTimeline(initialPetId = 'all') {
  $('#topbarActions').innerHTML = '';
  const all = buildTimelineEvents();
  if (!all.length) {
    $('#content').innerHTML = `<div class="card empty"><span class="big">📅</span>暂无时间线</div>`;
    return;
  }
  $('#content').innerHTML = `
    <div class="filterbar">
      <select id="timelinePetSelect">
        <option value="all">全部宠物</option>
        ${state.pets.map(p => `<option value="${p.id}" ${p.id === initialPetId ? 'selected' : ''}>${p.emoji} ${p.name}</option>`).join('')}
      </select>
    </div>
    <div id="timelineWrap"></div>
  `;
  function draw() {
    const filter = $('#timelinePetSelect').value;
    const events = filter === 'all' ? all : all.filter(e => e.pet?.id === filter);
    $('#timelineWrap').innerHTML = `<div class="timeline">${events.map(tlItemHtml).join('')}</div>`;
  }
  $('#timelinePetSelect').addEventListener('change', draw);
  draw();
}

function tlItemHtml(ev) {
  const color = ev.type === 'birth' ? '#fbcfe8' : ev.type === 'post' ? '#c4b5fd' : (CATEGORIES[ev.type]?.color || '#e2e8f0');
  const icon = ev.type === 'birth' ? '🎂' : ev.type === 'post' ? '💬' : (CATEGORIES[ev.type]?.icon || '📌');
  return `
    <div class="tl-item">
      <span class="tl-dot" style="background:${color}">${icon}</span>
      <div class="card tl-card">
        <div class="tl-date">${ev.date}</div>
        <div class="tl-title">${ev.title}</div>
        <div class="tl-desc">${escapeHtml(ev.desc)}</div>
      </div>
    </div>`;
}

// ================= 宠友社区 =================
function renderCommunity() {
  $('#topbarActions').innerHTML = `<button class="btn" onclick="openNewPost()">✍️ 发布日常</button>`;
  const posts = state.posts.slice().sort((a, b) => b.date.localeCompare(a.date));
  $('#content').innerHTML = `
    <div class="card">
      <div class="post-composer">
        <div class="avatar" style="background:#fbcfe8;width:46px;height:46px;font-size:22px">🐾</div>
        <textarea id="quickPostText" placeholder="分享你和毛孩子的日常…（Ctrl+Enter 快捷发布）"></textarea>
      </div>
      <div style="display:flex;justify-content:flex-end;margin-top:10px">
        <button class="btn sm" onclick="quickPost()">发布</button>
      </div>
    </div>
    <div class="post-list">
      ${posts.length ? posts.map(postHtml).join('') : `<div class="card empty"><span class="big">💬</span>还没有动态，来发第一条吧</div>`}
    </div>
  `;
  // 快捷发布
  $('#quickPostText').addEventListener('keydown', e => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      quickPost();
    }
  });
  $$('.like-btn').forEach(btn => btn.addEventListener('click', () => toggleLike(btn.dataset.id)));
  $$('.post-del').forEach(btn => btn.addEventListener('click', () => deletePost(btn.dataset.id)));
}

function quickPost() {
  const text = $('#quickPostText').value.trim();
  if (!text) { toast('写点内容再发布吧'); return; }
  if (!state.pets.length) { toast('请先添加宠物'); return; }
  state.posts.push({
    id: uid(), petId: state.pets[0].id, authorName: '我', text, image: '',
    likes: 0, liked: false, date: today(),
  });
  save();
  toast('发布成功 🎉');
  renderCommunity();
}

function postHtml(post) {
  const p = state.pets.find(x => x.id === post.petId);
  const avatar = p ? `<div class="post-avatar" style="background:${p.color}">${p.emoji}</div>` : `<div class="post-avatar" style="background:#e2e8f0">🐾</div>`;
  return `
    <div class="post">
      <div class="post-head">
        ${avatar}
        <div>
          <div class="post-author">${post.authorName}</div>
          <div class="post-time">${post.date}${p ? ' · ' + p.name : ''}</div>
        </div>
      </div>
      <div class="post-text">${escapeHtml(post.text)}</div>
      ${post.image ? `<img class="post-img" src="${post.image}" alt="日常照片" />` : ''}
      <div class="post-foot">
        <button class="like-btn ${post.liked ? 'liked' : ''}" data-id="${post.id}">${post.liked ? '❤️' : '🤍'} ${post.likes || 0}</button>
        <button class="btn sm ghost danger post-del" data-id="${post.id}">删除</button>
      </div>
    </div>`;
}

function toggleLike(postId) {
  const p = state.posts.find(x => x.id === postId);
  if (!p) return;
  p.liked = !p.liked;
  p.likes = (p.likes || 0) + (p.liked ? 1 : -1);
  save();
  renderCommunity();
}

// ================= 附近宠友 =================
function renderMatch() {
  $('#topbarActions').innerHTML = '';
  const refRegion = state.pets[0]?.region || '上海';
  const refPet = state.pets[0];

  $('#content').innerHTML = `
    ${state.pets.length ? `
    <div class="card" style="margin-bottom:18px">
      <div class="section-title" style="margin-bottom:8px"><span>📍 我的定位城市</span></div>
      <div style="display:flex;gap:10px;flex-wrap:wrap">
        ${state.pets.map(p => `<span class="chip">${p.emoji} ${p.name} · ${p.region}</span>`).join('')}
      </div>
    </div>` : ''}

    <div class="filterbar">
      <select id="regionFilter">
        <option value="all">全部城市</option>
        ${[...new Set(MOCK_NEARBY.map(n => n.region))].map(r => `<option value="${r}" ${r === refRegion ? 'selected' : ''}>${r}</option>`).join('')}
      </select>
      <button class="btn ghost" onclick="renderMatch()">🔍 重新匹配</button>
    </div>
    <div class="grid grid-2" id="matchWrap"></div>
  `;

  function draw() {
    const region = $('#regionFilter').value;
    const list = MOCK_NEARBY.filter(n => region === 'all' || n.region === region);
    $('#matchWrap').innerHTML = list.map(n => {
      const score = refPet ? matchScore(refPet, n) : 2;
      const badge = score >= 4 ? '<span class="match-badge" style="background:#a7f3d0;color:#065f46">高匹配</span>'
        : score >= 3 ? '<span class="match-badge" style="background:#fde68a;color:#92400e">较匹配</span>'
        : '<span class="match-badge" style="background:#e2e8f0;color:#64748b">一般</span>';
      return `
        <div class="card pet-card">
          <div class="pet-card-head">
            <div class="avatar" style="background:${n.color}">${n.emoji}</div>
            <div style="flex:1">
              <div class="pet-name" style="display:flex;align-items:center;gap:8px">${n.name} ${badge}</div>
              <div class="pet-meta">${n.breed} · ${n.gender} · ${n.ageText}</div>
              <div class="pet-meta">📍 ${n.region}${n.distanceKm ? ' · 距你 ' + n.distanceKm + ' km' : ''}</div>
            </div>
          </div>
          <div class="pet-stats">
            ${n.tags.map(t => `<span class="chip"># ${t}</span>`).join('')}
          </div>
          <div class="pet-actions">
            <button class="btn sm" onclick="toast('已发送好友申请给 ${n.name} 🐾')">👋 打招呼</button>
          </div>
        </div>`;
    }).join('');
  }
  $('#regionFilter').addEventListener('change', draw);
  draw();
}

function matchScore(refPet, other) {
  let s = 0;
  if (refPet.region === other.region) s += 2;
  if (refPet.species === other.species) s += 2;
  return Math.min(s, 4);
}

// ================= 表单（添加宠物 / 记录 / 帖子） =================
function openAddPet() {
  openModal(`
    <div class="modal-head"><h3>添加宠物</h3><button class="modal-close" onclick="closeModal()">×</button></div>
    <form class="form" id="addPetForm">
      <div class="field"><label>名字</label><input name="name" required placeholder="给 TA 取个名字" /></div>
      <div class="form-row">
        <div class="field"><label>物种</label>
          <select name="species">${SPECIES.map(s => `<option>${s}</option>`).join('')}</select>
        </div>
        <div class="field"><label>性别</label>
          <select name="gender"><option>弟弟</option><option>妹妹</option><option>未知</option></select>
        </div>
      </div>
      <div class="form-row">
        <div class="field"><label>品种</label><input name="breed" placeholder="如：英国短毛猫" /></div>
        <div class="field"><label>出生日期</label><input name="birthDate" type="date" value="${today()}" /></div>
      </div>
      <div class="field"><label>所在城市</label>
        <select name="region">${REGIONS.map(r => `<option>${r}</option>`).join('')}</select>
      </div>
      <div class="field"><label>头像</label>
        <div class="picker" id="emojiPicker">${EMOJIS.map((e, i) => `<button type="button" class="pick ${i === 0 ? 'sel' : ''}" data-emoji="${e}">${e}</button>`).join('')}</div>
        <input type="hidden" name="emoji" value="${EMOJIS[0]}" />
      </div>
      <div class="field"><label>卡片颜色</label>
        <div class="picker" id="colorPicker">${COLORS.map((c, i) => `<button type="button" class="pick color ${i === 0 ? 'sel' : ''}" style="background:${c}" data-color="${c}"></button>`).join('')}</div>
        <input type="hidden" name="color" value="${COLORS[0]}" />
      </div>
      <div class="form-actions">
        <button type="button" class="btn ghost" onclick="closeModal()">取消</button>
        <button type="submit" class="btn">保存</button>
      </div>
    </form>
  `);

  bindPicker('#emojiPicker', 'emoji', 'data-emoji');
  bindPicker('#colorPicker', 'color', 'data-color');

  $('#addPetForm').addEventListener('submit', e => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const data = {
      id: uid(),
      name: fd.get('name').trim(),
      species: fd.get('species'),
      gender: fd.get('gender'),
      breed: fd.get('breed').trim() || '未填写',
      birthDate: fd.get('birthDate'),
      region: fd.get('region'),
      emoji: fd.get('emoji'),
      color: fd.get('color'),
    };
    state.pets.push(data);
    save();
    closeModal();
    toast(`欢迎 ${data.name} 加入 🎉`);
    switchView('pets');
  });
}

function bindPicker(sel, inputName, attr) {
  const wrap = $(sel);
  const input = wrap.parentElement.querySelector(`input[name="${inputName}"]`);
  $$('.pick', wrap).forEach(btn => {
    btn.addEventListener('click', () => {
      $$('.pick', wrap).forEach(b => b.classList.remove('sel'));
      btn.classList.add('sel');
      input.value = btn.getAttribute(attr);
    });
  });
}

function openAddRecord(petId) {
  openModal(`
    <div class="modal-head"><h3>添加健康记录</h3><button class="modal-close" onclick="closeModal()">×</button></div>
    <form class="form" id="addRecordForm">
      <div class="field"><label>宠物</label>
        <select name="petId">${petOptionsHtml(petId)}</select>
      </div>
      <div class="field"><label>类型</label>
        <select name="category" id="recCategory">
          ${Object.entries(CATEGORIES).map(([k, c]) => `<option value="${k}">${c.icon} ${c.label}</option>`).join('')}
        </select>
      </div>
      <div class="form-row">
        <div class="field"><label>日期</label><input name="date" type="date" value="${today()}" /></div>
        <div class="field" id="recValueField" style="display:none"><label>体重 (kg)</label><input name="value" type="number" step="0.1" min="0" placeholder="如 3.5" /></div>
      </div>
      <div class="field" id="recTitleField"><label>名称 / 说明</label><input name="title" placeholder="如：猫三联第一针" /></div>
      <div class="field"><label>备注（可选）</label><textarea name="note" placeholder="补充说明…"></textarea></div>
      <div class="form-actions">
        <button type="button" class="btn ghost" onclick="closeModal()">取消</button>
        <button type="submit" class="btn">保存</button>
      </div>
    </form>
  `);

  function syncCat() {
    const cat = $('#recCategory').value;
    $('#recValueField').style.display = cat === 'weight' ? '' : 'none';
    $('#recTitleField').querySelector('label').textContent = cat === 'weight' ? '标题（可选）' : '名称 / 说明';
    $('#recTitleField').querySelector('input').placeholder = cat === 'weight' ? '如：绝育后复查' : '如：猫三联第一针';
  }
  $('#recCategory').addEventListener('change', syncCat);
  syncCat();

  $('#addRecordForm').addEventListener('submit', e => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const category = fd.get('category');
    const value = category === 'weight' ? parseFloat(fd.get('value')) : null;
    if (category === 'weight' && (!value || value <= 0)) { toast('请输入有效体重'); return; }
    state.records.push({
      id: uid(), petId: fd.get('petId'), category,
      date: fd.get('date'), title: fd.get('title').trim(), value, note: fd.get('note').trim(),
    });
    save();
    closeModal();
    toast('记录已保存 ✅');
    switchView('records');
  });
}

let pendingPostImage = '';
function openNewPost() {
  pendingPostImage = '';
  openModal(`
    <div class="modal-head"><h3>发布日常</h3><button class="modal-close" onclick="closeModal()">×</button></div>
    <form class="form" id="newPostForm">
      <div class="field"><label>宠物</label>
        <select name="petId">${petOptionsHtml('')}</select>
      </div>
      <div class="field"><label>内容</label><textarea name="text" required placeholder="今天和 TA 的日常…"></textarea></div>
      <div class="field"><label>照片（可选）</label>
        <button type="button" class="btn ghost" id="pickImageBtn">📷 选择照片</button>
        <img id="postImagePreview" style="display:none;width:100%;border-radius:12px;margin-top:10px" />
      </div>
      <div class="form-actions">
        <button type="button" class="btn ghost" onclick="closeModal()">取消</button>
        <button type="submit" class="btn">发布</button>
      </div>
    </form>
  `);

  const fileInput = $('#hiddenFileInput');
  $('#pickImageBtn').addEventListener('click', () => fileInput.click());
  fileInput.onchange = e => {
    const file = e.target.files[0];
    if (!file) return;
    readAndCompress(file, dataUrl => {
      pendingPostImage = dataUrl;
      const img = $('#postImagePreview');
      img.src = dataUrl;
      img.style.display = 'block';
    });
    fileInput.value = '';
  };

  $('#newPostForm').addEventListener('submit', e => {
    e.preventDefault();
    const fd = new FormData(e.target);
    state.posts.push({
      id: uid(), petId: fd.get('petId'), authorName: '我', text: fd.get('text').trim(),
      image: pendingPostImage, likes: 0, liked: false, date: today(),
    });
    save();
    closeModal();
    toast('发布成功 🎉');
    switchView('community');
  });
}

function readAndCompress(file, cb) {
  const reader = new FileReader();
  reader.onload = e => {
    const img = new Image();
    img.onload = () => {
      const maxW = 800;
      const scale = Math.min(1, maxW / img.width);
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
      cb(canvas.toDataURL('image/jpeg', 0.82));
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

// ================= 删除 =================
function deletePet(id) {
  const p = state.pets.find(x => x.id === id);
  if (!p) return;
  if (!confirm(`确定删除「${p.name}」及其所有记录吗？`)) return;
  state.pets = state.pets.filter(x => x.id !== id);
  state.records = state.records.filter(r => r.petId !== id);
  state.posts = state.posts.filter(x => x.petId !== id);
  save();
  toast('已删除');
  switchView('pets');
}
function deleteRecord(id) {
  if (!confirm('删除这条记录？')) return;
  state.records = state.records.filter(r => r.id !== id);
  save();
  toast('已删除');
  renderRecords();
}
function deletePost(id) {
  if (!confirm('删除这条动态？')) return;
  state.posts = state.posts.filter(x => x.id !== id);
  save();
  toast('已删除');
  renderCommunity();
}

// ================= 工具：HTML 转义 =================
function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

// ================= 初始化 =================
function initNav() {
  $$('.nav-item').forEach(el => el.addEventListener('click', () => switchView(el.dataset.view)));
  $('#modalOverlay').addEventListener('click', e => { if (e.target.id === 'modalOverlay') closeModal(); });
  window.addEventListener('resize', () => {
    if (currentView === 'dashboard') {
      const sel = $('#chartPetSelect');
      if (sel) drawWeightChart($('#weightChart'), sel.value);
    }
  });
}

// 暴露给内联 onclick
window.openAddPet = openAddPet;
window.openAddRecord = openAddRecord;
window.openNewPost = openNewPost;
window.closeModal = closeModal;
window.deletePet = deletePet;
window.deleteRecord = deleteRecord;
window.deletePost = deletePost;
window.renderMatch = renderMatch;
window.viewPetTimeline = viewPetTimeline;
window.toast = toast;
window.quickPost = quickPost;

load();
initNav();
switchView('dashboard');
