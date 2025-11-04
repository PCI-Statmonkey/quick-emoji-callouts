# Quick Emoji Callouts

**Quick Emoji Callouts** is a lightweight Obsidian plugin that adds a **right-click “Callouts” menu** for inserting emoji icons (colored squares or circles) with optional tags — perfect for GM notes, world-building, or any kind of structured note-taking. You can thank reddit for this and my new obession - StatMonkey

---

## Features

- 🟥🟦🟩🟨 **Right-click menu** → Callouts → pick a favorite emoji + tag combo.
- **Customizable favorites** (up to 12): choose your own emoji, tag, and menu label.
- **Settings UI** to manage favorites, order, and insert style:
  - Inline (`🟥 #tag`) or Markdown bullet (`- 🟥 #tag`)
  - Same-line or new-line insertion
  - Option to wrap selected text
- **Built-in palette** of colored squares and circles for quick copying.

---

## Use Cases

- TTRPG / GM session notes (🟥 `#threat`, 🟦 `#clue`, 🟩 `#npc`)
- Writing projects (🔴 `#idea`, 🟡 `#todo`)
- Study or research highlighting
- Quick visual tagging in markdown

---

## ⚙️ Installation

### Manual
1. Open your Obsidian vault folder.
2. Create (if not already):  
   `.obsidian/plugins/quick-emoji-callouts/`
3. Copy these files into it:
4. Restart or reload plugins in Obsidian.
5. Enable **Quick Emoji Callouts** under *Settings → Community Plugins*.

---

## Usage

- Right-click anywhere in the editor → **Callouts** → choose an item.
- To customize:
- Go to *Settings → Quick Emoji Callouts*.
- Edit or add favorites.
- Use the built-in palette to copy emojis.

---

## For Developers

This plugin is intentionally no-build (plain `main.js`).  
You can fork it and modify easily without any Node toolchain.

If you prefer TypeScript, you can rebuild using a standard `esbuild` setup — the logic is the same.

---

## License

MIT License © 2025 StatMonkey Productions.
Feel free to modify or distribute under the terms of the MIT license.

---

## Credits

Created by **StatMonkey Productions** with debugging assistance from **Coxdex**.  
Inspired by the needs of GMs everywhere who love fast, visual note-taking.
