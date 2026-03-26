import { categoryOf } from './utils.js';

/** Loaded database */
let db = null;

/** Load JSON and build indices */
export async function loadData() {
  const resp = await fetch('json/Oniro_ItemDB_1.4.4.json');
  const raw = await resp.json();

  const items = raw['아이템 옵션+스킬 DB'] || [];
  const weaponStats = raw['무기 피해 DB'] || [];
  const armorStats = raw['방어구 방어력 DB'] || [];
  const legend = raw['범례'] || [];

  // Build lookup maps
  const weaponMap = new Map();
  for (const w of weaponStats) {
    weaponMap.set(w.ID, w);
  }

  const armorMap = new Map();
  for (const a of armorStats) {
    armorMap.set(a.ID, a);
  }

  // Add category field to items
  for (const item of items) {
    item._category = categoryOf(item.타입);
  }

  // Collect unique subtypes per category
  const subtypesByCategory = {};
  for (const item of items) {
    if (!item.세부타입) continue;
    const cat = item._category;
    if (!subtypesByCategory[cat]) subtypesByCategory[cat] = new Set();
    subtypesByCategory[cat].add(item.세부타입);
  }

  // Category counts
  const categoryCounts = { all: items.length };
  for (const item of items) {
    categoryCounts[item._category] = (categoryCounts[item._category] || 0) + 1;
  }

  db = {
    items,
    weaponMap,
    armorMap,
    legend,
    subtypesByCategory,
    categoryCounts,
  };

  return db;
}

/** Get loaded db */
export function getDB() {
  return db;
}

/** Get weapon stats for item ID */
export function getWeaponStats(id) {
  return db?.weaponMap.get(id) || null;
}

/** Get armor stats for item ID */
export function getArmorStats(id) {
  return db?.armorMap.get(id) || null;
}
