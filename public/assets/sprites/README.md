# Sprites opcionais

Podes substituir os personaxes procedurais por PNG. Se falta un ficheiro, o xogo usa texturas xeradas automaticamente.

## Ficheiros

| Ficheiro | Uso |
|----------|-----|
| `player.png` | O teu personaxe (spritesheet 64×24, igual que os demais) |
| `bot.png` | Bots que andan polas ruas |
| `npc.png` | Rivais de combate |
| `remote.png` | Outros xogadores en liña |

## Xerar exemplos incluídos

```bash
npm run sprites
```

Crea `player.png`, `bot.png`, `npc.png` e `remote.png` con pixel art de exemplo.

## Spritesheet (todos os personaxes)

- Tamaño por frame: **16×24** píxeles
- Disposición horizontal: **4 frames** (animación de andar)
- Exemplo: imaxe 64×24 = 4 columnas

## Notas

- O mesmo `bot.png` serve para bots de rúa e pode reutilizarse como base visual.
- Todos os PNG de personaxe usan o mesmo formato de 4 frames en fila.
- Despois de engadir PNG, recarga a páxina (Ctrl+F5).
