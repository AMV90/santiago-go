const BUBBLE_MS = 4500;

export function showChatBubble(scene, playerId, text, x, y, opts = {}) {
  if (!text?.trim()) return;
  const msg = text.trim().slice(0, 120);
  scene.chatBubbles = scene.chatBubbles || new Map();

  const prev = scene.chatBubbles.get(playerId);
  if (prev?.timer) clearTimeout(prev.timer);
  prev?.text?.destroy();

  const bubble = scene.add.text(x, y - 28, msg, {
    fontFamily: 'Segoe UI, system-ui, Arial, sans-serif',
    fontSize: opts.fontSize || '11px',
    color: opts.color || '#1a2332',
    backgroundColor: opts.backgroundColor || '#f4d35e',
    padding: { x: 6, y: 4 },
    align: 'center',
    wordWrap: { width: opts.wordWrapWidth || 160 },
  });
  bubble.setOrigin(0.5, 1);
  bubble.setDepth(30);

  const timer = setTimeout(() => {
    bubble.destroy();
    scene.chatBubbles.delete(playerId);
  }, BUBBLE_MS);

  scene.chatBubbles.set(playerId, { text: bubble, timer });
}

export function updateChatBubblePositions(scene) {
  if (!scene.chatBubbles?.size) return;

  if (scene.player && scene.chatBubbles.has('local')) {
    const b = scene.chatBubbles.get('local');
    if (b?.text?.active) b.text.setPosition(scene.player.x, scene.player.y - 28);
  }

  if (scene.remoteSprites) {
    for (const [id, spr] of scene.remoteSprites) {
      const b = scene.chatBubbles.get(id);
      if (b?.text?.active) b.text.setPosition(spr.x, spr.y - 28);
    }
  }

  if (scene.walkBotSprites) {
    for (const spr of scene.walkBotSprites) {
      const bot = spr.getData('bot');
      if (!bot) continue;
      const b = scene.chatBubbles.get(`citizen-${bot.id}`);
      if (b?.text?.active) b.text.setPosition(spr.x, spr.y - 30);
    }
  }
}

export function clearChatBubbles(scene) {
  if (!scene?.chatBubbles) return;
  for (const [, b] of scene.chatBubbles) {
    if (b.timer) clearTimeout(b.timer);
    b.text?.destroy();
  }
  scene.chatBubbles.clear();
}
