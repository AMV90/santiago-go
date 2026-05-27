import { THROW_ITEMS, PICKUP_TYPES } from './items.js';

export function ensureInventory(player) {
  if (!player.inventory) player.inventory = {};
  for (const id of PICKUP_TYPES) {
    if (player.inventory[id] == null) player.inventory[id] = 0;
  }
  if (!player.dog) {
    player.dog = { captured: false, companionName: 'Champú', affection: {} };
  }
  return player;
}

export function addItem(player, itemId, count = 1) {
  ensureInventory(player);
  player.inventory[itemId] = (player.inventory[itemId] || 0) + count;
  return true;
}

export function removeItem(player, itemId, count = 1) {
  ensureInventory(player);
  if ((player.inventory[itemId] || 0) < count) return false;
  player.inventory[itemId] -= count;
  return true;
}

export function countItem(player, itemId) {
  ensureInventory(player);
  return player.inventory[itemId] || 0;
}

export function totalItems(player) {
  ensureInventory(player);
  return PICKUP_TYPES.reduce((n, id) => n + (player.inventory[id] || 0), 0);
}

export function inventoryList(player) {
  ensureInventory(player);
  return PICKUP_TYPES.filter((id) => player.inventory[id] > 0).map((id) => ({
    id,
    count: player.inventory[id],
    ...THROW_ITEMS[id],
  }));
}
