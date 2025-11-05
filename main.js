'use strict';

const { Plugin, Notice, PluginSettingTab, Setting } = require('obsidian');

/** @typedef {{emoji:string, tag:string, label:string}} Callout */
/** @typedef {{
 *  favorites: Callout[],
 *  insertFormat: 'inline'|'bullet',
 *  lineBehavior: 'same'|'new',
 *  wrapSelection: boolean
 * }} QESettings
 */

const PALETTE_SQUARES = ["🟥","🟧","🟨","🟩","🟦","🟪"];
const PALETTE_CIRCLES = ["🔴","🟠","🟡","🟢","🔵","🟣"];

/** @type {QESettings} */
const DEFAULTS = {
  favorites: [
    { emoji: "🟥", tag: "#threat", label: "Threat (Red)" },
    { emoji: "🟦", tag: "#clue",   label: "Clue (Blue)" },
    { emoji: "🟩", tag: "#npc",    label: "NPC (Green)" },
    { emoji: "🟨", tag: "#lead",   label: "Lead (Yellow)" },
    { emoji: "🟪", tag: "#lore",   label: "Lore (Purple)" }
  ],
  insertFormat: "inline",
  lineBehavior: "same",
  wrapSelection: false
};

module.exports = class QuickEmojiCallouts extends Plugin {
  /** @type {QESettings} */
  settings = DEFAULTS;

  async onload() {
    await this.loadSettings();
    this.addSettingTab(new QESettingsTab(this.app, this));

    // Right-click (editor) context menu
    this.registerEvent(this.app.workspace.on('editor-menu', (menu, editor, view) => {
      if (!view || !editor) return;

      menu.addItem((item) => {
        item.setTitle('Callouts')
          .setIcon('list'); // safe built-in icon

        const sub = item.setSubmenu();

        if (!this.settings.favorites || this.settings.favorites.length === 0) {
          sub.addItem(i => i.setTitle("No favorites yet (open settings)")
            .onClick(() => new Notice("Open Settings → Quick Emoji Callouts to add favorites.")));
          return;
        }

        for (const c of this.settings.favorites) {
          const title = `${c.emoji} ${c.label}`;
          sub.addItem((subItem) => {
            subItem.setTitle(title).onClick(() => {
              const sel = editor.getSelection();
              const insert = this.buildInsert(c, sel);

              if (this.settings.lineBehavior === 'new') {
                const cursor = editor.getCursor();
                const lineText = editor.getLine(cursor.line);
                editor.setCursor({ line: cursor.line, ch: lineText.length });
                editor.replaceRange("\n", editor.getCursor());
              }

              if (this.settings.wrapSelection && sel) {
                const prefix = this.prefix(c);
                editor.replaceSelection(`${prefix}${sel}`);
              } else {
                if (sel) editor.replaceSelection(insert);
                else editor.replaceRange(insert, editor.getCursor());
              }
            });
          });
        }
      });
    }));
  }

  prefix(c) {
    return this.settings.insertFormat === 'bullet'
      ? `- ${c.emoji} ${c.tag} `
      : `${c.emoji} ${c.tag} `;
  }

  buildInsert(c, selection) {
    const base = this.prefix(c);
    if (this.settings.wrapSelection && selection) return `${base}${selection}`;
    return base;
  }

  async loadSettings() {
    const data = await this.loadData();
    this.settings = Object.assign({}, DEFAULTS, data || {});
    // normalize just in case
    if (!Array.isArray(this.settings.favorites)) this.settings.favorites = DEFAULTS.favorites.slice();
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
};

class QESettingsTab extends PluginSettingTab {
  /** @param {QuickEmojiCallouts} plugin */
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display() {
    const { containerEl } = this;
    containerEl.empty();

    containerEl.createEl('h2', { text: 'Quick Emoji Callouts' });

    new Setting(containerEl)
      .setName('Insert format')
      .setDesc('Insert inline or as a Markdown bullet')
      .addDropdown(dd => {
        dd.addOption('inline', 'Inline (🟥 #tag )');
        dd.addOption('bullet', 'Bullet (- 🟥 #tag )');
        dd.setValue(this.plugin.settings.insertFormat);
        dd.onChange(async (v) => {
          this.plugin.settings.insertFormat = (v === 'bullet') ? 'bullet' : 'inline';
          await this.plugin.saveSettings();
        });
      });

    new Setting(containerEl)
      .setName('Line behavior')
      .setDesc('Place on the same line or start on a new line before inserting')
      .addDropdown(dd => {
        dd.addOption('same', 'Same line');
        dd.addOption('new', 'New line');
        dd.setValue(this.plugin.settings.lineBehavior);
        dd.onChange(async (v) => {
          this.plugin.settings.lineBehavior = (v === 'new') ? 'new' : 'same';
          await this.plugin.saveSettings();
        });
      });

    new Setting(containerEl)
      .setName('Wrap selection')
      .setDesc('If text is selected, prefix the selection with emoji + tag instead of inserting separately')
      .addToggle(tg => {
        tg.setValue(this.plugin.settings.wrapSelection);
        tg.onChange(async (val) => {
          this.plugin.settings.wrapSelection = !!val;
          await this.plugin.saveSettings();
        });
      });

    // Quick-pick palettes
    const pal = containerEl.createDiv();
    pal.createEl('h3', { text: 'Quick-pick palettes' });
    const row1 = pal.createDiv({ cls: 'qe-palette-row' });
    PALETTE_SQUARES.forEach(e => this.renderPaletteButton(row1, e));
    const row2 = pal.createDiv({ cls: 'qe-palette-row' });
    PALETTE_CIRCLES.forEach(e => this.renderPaletteButton(row2, e));
    pal.createEl('p', { text: "Click an emoji to copy it, then paste into any Favorite's Emoji field." });

    containerEl.createEl('h3', { text: 'Favorites (up to 12)' });

    if (!Array.isArray(this.plugin.settings.favorites)) this.plugin.settings.favorites = [];
    this.plugin.settings.favorites.forEach((fav, idx) => this.renderFavorite(containerEl, fav, idx));

    if (this.plugin.settings.favorites.length < 12) {
      new Setting(containerEl).addButton(btn =>
        btn.setButtonText('Add favorite').onClick(async () => {
          this.plugin.settings.favorites.push({ emoji: '🟦', tag: '#tag', label: 'New Favorite' });
          await this.plugin.saveSettings();
          this.display();
        })
      );
    }

    // quick style
    const style = document.createElement('style');
    style.textContent = `
      .qe-palette-row { display:flex; gap:.5rem; margin-bottom:.5rem; }
      .qe-palette-btn { padding:.25rem .5rem; border:1px solid var(--background-modifier-border);
        border-radius:6px; cursor:pointer; }
    `;
    containerEl.appendChild(style);
  }

  renderPaletteButton(parent, emoji) {
    const b = parent.createEl('button', { text: emoji, cls: 'qe-palette-btn' });
    b.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(emoji);
        new Notice(`Copied ${emoji} to clipboard`);
      } catch {
        new Notice(`Copy failed. Manually select and copy: ${emoji}`);
      }
    });
  }

  renderFavorite(containerEl, fav, idx) {
    const block = new Setting(containerEl)
      .setName(`Favorite ${idx + 1}`)
      .setDesc('Emoji + tag + menu label');

    block.addText(t =>
      t.setPlaceholder('Emoji (e.g., 🟥 or 🔵)')
        .setValue(fav.emoji || '')
        .onChange(async (v) => {
          this.plugin.settings.favorites[idx].emoji = (v || '').trim();
          await this.plugin.saveSettings();
        })
    );

    block.addText(t =>
      t.setPlaceholder('#tag')
        .setValue(fav.tag || '')
        .onChange(async (v) => {
          this.plugin.settings.favorites[idx].tag = (v || '').trim();
          await this.plugin.saveSettings();
        })
    );

    block.addText(t =>
      t.setPlaceholder('Menu label')
        .setValue(fav.label || '')
        .onChange(async (v) => {
          this.plugin.settings.favorites[idx].label = (v || '').trim();
          await this.plugin.saveSettings();
        })
    );

    block.addExtraButton(btn =>
      btn.setIcon('arrow-up').setTooltip('Move up').onClick(async () => {
        if (idx === 0) return;
        const a = this.plugin.settings.favorites;
        [a[idx - 1], a[idx]] = [a[idx], a[idx - 1]];
        await this.plugin.saveSettings();
        this.display();
      })
    );
    block.addExtraButton(btn =>
      btn.setIcon('arrow-down').setTooltip('Move down').onClick(async () => {
        const a = this.plugin.settings.favorites;
        if (idx >= a.length - 1) return;
        [a[idx + 1], a[idx]] = [a[idx], a[idx + 1]];
        await this.plugin.saveSettings();
        this.display();
      })
    );
    block.addExtraButton(btn =>
      btn.setIcon('trash').setTooltip('Remove').onClick(async () => {
        this.plugin.settings.favorites.splice(idx, 1);
        await this.plugin.saveSettings();
        this.display();
      })
    );
  }
}
