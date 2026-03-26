import { getWeaponStats, getArmorStats } from './data.js';
import { rarityClass, optionDisplayName, formatOptionValue } from './utils.js';

const overlay = document.getElementById('modalOverlay');
const modal = document.getElementById('itemModal');
const titleEl = document.getElementById('modalTitle');
const bodyEl = document.getElementById('modalBody');
const closeBtn = document.getElementById('modalClose');

/** Initialize modal event listeners */
export function initModal() {
  closeBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !overlay.hidden) closeModal();
  });
}

/** Open modal for an item */
export function openItemDetail(item) {
  titleEl.textContent = item.한국어이름;
  titleEl.className = `modal-title rarity-text-${rarityClass(item.표시희귀도)}`;
  bodyEl.innerHTML = '';

  // English name
  const enName = document.createElement('p');
  enName.className = 'detail-en-name';
  enName.textContent = item.에디터이름;
  bodyEl.appendChild(enName);

  // Basic Info
  bodyEl.appendChild(buildBasicInfo(item));

  // Weapon stats
  if (item.타입 === '무기' || item._category === '무기') {
    const ws = getWeaponStats(item.아이템ID);
    if (ws) {
      bodyEl.appendChild(buildWeaponStats(ws));
      bodyEl.appendChild(buildDisclaimer());
    }
  }

  // Armor stats
  if (['갑옷(상의)', '투구', '장갑', '신발', '벨트'].includes(item.타입)) {
    const as = getArmorStats(item.아이템ID);
    if (as) {
      bodyEl.appendChild(buildArmorStats(as));
      bodyEl.appendChild(buildDisclaimer());
    }
  }

  // Options
  const visibleOptions = item.옵션?.filter(o => o.ID !== 0);
  if (visibleOptions?.length) {
    bodyEl.appendChild(buildOptionsSection(visibleOptions));
  }

  // Skills
  if (item.스킬?.length) {
    bodyEl.appendChild(buildSkillsSection(item.스킬));
  }

  overlay.hidden = false;
  document.body.style.overflow = 'hidden';
}

/** Close modal */
export function closeModal() {
  overlay.hidden = true;
  document.body.style.overflow = '';
}

/** Build basic info section */
function buildBasicInfo(item) {
  const section = createSection('기본 정보');
  const grid = document.createElement('div');
  grid.className = 'detail-info-grid';

  const fields = [
    ['타입', item.타입],
    ['세부타입', item.세부타입 || '-'],
    ['희귀도', item.표시희귀도],
    ['레벨', item.레벨],
    ['요구 레벨', item.요구레벨],
    ['소켓', `${item.소켓수} / ${item.최대소켓}`],
    ['보조배율', item.보조배율],
    ['아이템 ID', item.아이템ID],
  ];

  for (const [label, value] of fields) {
    const labelEl = document.createElement('span');
    labelEl.className = 'detail-label';
    labelEl.textContent = label;

    const valueEl = document.createElement('span');
    valueEl.className = 'detail-value';
    if (label === '희귀도') {
      valueEl.innerHTML = `<span class="rarity-badge rarity-${rarityClass(item.표시희귀도)}">${value}</span>`;
    } else {
      valueEl.textContent = value;
    }

    grid.append(labelEl, valueEl);
  }

  section.appendChild(grid);
  return section;
}

/** Build weapon stats section */
function buildWeaponStats(ws) {
  const section = createSection('무기 상세');
  const grid = document.createElement('div');
  grid.className = 'weapon-stats';

  const cards = [
    ['기본 피해', ws.기본피해, null],
    ['공격 속도', ws.공격속도, null],
    ['피해 범위', `${ws.최소피해} ~ ${ws.최대피해}`, `변동 ${ws.피해변동}`],
    ['속성', ws.속성 || '물리', null],
  ];

  for (const [label, value, sub] of cards) {
    const card = document.createElement('div');
    card.className = 'stat-card';

    const labelEl = document.createElement('div');
    labelEl.className = 'stat-card-label';
    labelEl.textContent = label;

    const valueEl = document.createElement('div');
    valueEl.className = 'stat-card-value';
    valueEl.textContent = value;

    card.append(labelEl, valueEl);

    if (sub) {
      const subEl = document.createElement('div');
      subEl.className = 'stat-card-sub';
      subEl.textContent = sub;
      card.appendChild(subEl);
    }

    grid.appendChild(card);
  }

  section.appendChild(grid);
  return section;
}

/** Build armor stats section */
function buildArmorStats(as) {
  const section = createSection('방어구 상세');
  const grid = document.createElement('div');
  grid.className = 'weapon-stats';

  const cards = [
    ['방어력', as.방어력, null],
    ['방어 범위', `${as.최소방어력} ~ ${as.최대방어력}`, `변동 ${as.방어변동}`],
    ['장비 종류', as.장비종류, as.장비세부종류 || null],
  ];

  for (const [label, value, sub] of cards) {
    const card = document.createElement('div');
    card.className = 'stat-card';

    const labelEl = document.createElement('div');
    labelEl.className = 'stat-card-label';
    labelEl.textContent = label;

    const valueEl = document.createElement('div');
    valueEl.className = 'stat-card-value';
    valueEl.textContent = value;

    card.append(labelEl, valueEl);

    if (sub) {
      const subEl = document.createElement('div');
      subEl.className = 'stat-card-sub';
      subEl.textContent = sub;
      card.appendChild(subEl);
    }

    grid.appendChild(card);
  }

  section.appendChild(grid);
  return section;
}

/** Build options table */
function buildOptionsSection(options) {
  const section = createSection(`옵션 (${options.length})`);
  const table = document.createElement('table');
  table.className = 'option-table';

  const thead = document.createElement('thead');
  thead.innerHTML = `<tr><th>옵션</th><th>값</th><th>유형</th></tr>`;
  table.appendChild(thead);

  const tbody = document.createElement('tbody');
  for (const opt of options) {
    const tr = document.createElement('tr');

    const tdName = document.createElement('td');
    tdName.className = 'option-name';
    tdName.textContent = optionDisplayName(opt);

    const tdValue = document.createElement('td');
    tdValue.className = 'option-value';
    if (opt.최소값 !== opt.최대값) {
      tdValue.textContent = `${opt.최소값} ~ ${opt.최대값}`;
    } else {
      tdValue.textContent = formatOptionValue(opt);
    }

    const tdType = document.createElement('td');
    const typeBadge = document.createElement('span');
    typeBadge.className = `option-type-badge ${opt.유형 === '변동' ? 'option-type-variable' : 'option-type-fixed'}`;
    typeBadge.textContent = opt.유형;
    tdType.appendChild(typeBadge);

    tr.append(tdName, tdValue, tdType);
    tbody.appendChild(tr);
  }

  table.appendChild(tbody);
  section.appendChild(table);
  return section;
}

/** Build skills section */
function buildSkillsSection(skills) {
  const section = createSection(`스킬 (${skills.length})`);

  for (const skill of skills) {
    const card = document.createElement('div');
    card.className = 'skill-card';

    const name = document.createElement('div');
    name.className = 'skill-name';
    name.textContent = skill['이름(한국어)'] || skill.이름;

    const meta = document.createElement('div');
    meta.className = 'skill-meta';

    const lvl = document.createElement('span');
    lvl.textContent = skill.최소레벨 === skill.최대레벨
      ? `Lv.${skill.최소레벨}`
      : `Lv.${skill.최소레벨}~${skill.최대레벨}`;

    const prob = document.createElement('span');
    prob.textContent = skill['최소확률%'] !== undefined
      ? (skill['최소확률%'] === skill['최대확률%']
        ? `확률 ${skill['최소확률%']}%`
        : `확률 ${skill['최소확률%']}%~${skill['최대확률%']}%`)
      : '';

    const trigger = document.createElement('span');
    trigger.textContent = skill.발동조건 || '';

    const type = document.createElement('span');
    type.textContent = skill.타입;
    type.style.color = 'var(--text-muted)';
    type.style.fontSize = '0.75rem';

    meta.append(lvl, prob, trigger, type);
    card.append(name, meta);
    section.appendChild(card);
  }

  return section;
}

/** Build disclaimer notice */
function buildDisclaimer() {
  const p = document.createElement('p');
  p.className = 'detail-disclaimer';
  p.textContent = '* 인게임 데이터와 다를 수 있습니다';
  return p;
}

/** Helper: create a detail section with title */
function createSection(title) {
  const section = document.createElement('div');
  section.className = 'detail-section';

  const titleEl = document.createElement('h3');
  titleEl.className = 'detail-section-title';
  titleEl.textContent = title;
  section.appendChild(titleEl);

  return section;
}
