import { beforeEach, describe, expect, it, vi } from 'vitest';
import { setupPokemonModal } from '../src/pokemonModal.ts';

function makeDOM() {
  document.body.innerHTML = '';
}

describe('setupPokemonModal', () => {
  beforeEach(() => makeDOM());

  it('opens modal on pokemon:show and closes on overlay click / escape / close button', () => {
    const mockStore = { getPokemonById: (id: number) => null };
    setupPokemonModal(mockStore as any);

    const p = { name: { fr: 'X', en: 'X' }, sprites: { regular: 'x.png' }, generation: 1, category: 'cat', stats: {} };
    window.dispatchEvent(new CustomEvent('pokemon:show', { detail: p }));

    const overlay = document.querySelector('#pokemon-modal-overlay') as HTMLElement;
    expect(overlay).toBeTruthy();
    expect(overlay.classList.contains('hidden')).toBe(false);
    const card = overlay.querySelector('.modal-card') as HTMLElement;
    expect(card.getAttribute('aria-hidden')).toBe('false');
    expect(document.body.style.overflow).toBe('hidden');

    // close by clicking close button
    const closeBtn = card.querySelector('.modal-close') as HTMLButtonElement;
    expect(document.activeElement === closeBtn).toBe(true);
    closeBtn.click();
    expect(overlay.classList.contains('hidden')).toBe(true);
    expect(card.getAttribute('aria-hidden')).toBe('true');

    // reopen
    window.dispatchEvent(new CustomEvent('pokemon:show', { detail: p }));
    expect(overlay.classList.contains('hidden')).toBe(false);
    // close by clicking overlay background
    overlay.click();
    expect(overlay.classList.contains('hidden')).toBe(true);

    // reopen and close by Escape key
    window.dispatchEvent(new CustomEvent('pokemon:show', { detail: p }));
    const ev = new KeyboardEvent('keydown', { key: 'Escape' });
    window.dispatchEvent(ev);
    expect(overlay.classList.contains('hidden')).toBe(true);
  });

  it('renders evolution placeholders and fills from store.getPokemonById', () => {
    const found = { pokedex_id: 999, name: { fr: 'Found' }, sprites: { regular: 'found.png' }, stats: {} };
    const mockStore = { getPokemonById: (id: number) => id === 999 ? found : null };
    setupPokemonModal(mockStore as any);

    const p = {
      name: { fr: 'Root' }, sprites: { regular: 'root.png' }, stats: {}, evolution: { pre: [{ pokedex_id: 999 }] , next: [] }
    };
    window.dispatchEvent(new CustomEvent('pokemon:show', { detail: p }));
    const overlay = document.querySelector('#pokemon-modal-overlay') as HTMLElement;
    const placeholder = overlay.querySelector('.evo-pre .evo-item');
    expect(placeholder).toBeTruthy();
    const img = placeholder!.querySelector('img') as HTMLImageElement;
    // after render, placeholder img src should be updated from store
    expect(img.src).toContain('found.png');

    // clicking evo item with full data should render that pokemon in modal
    const p2 = { name: { fr: 'P2' }, sprites: { regular: 'p2.png' }, stats: {} };
    // create an evo item with full data via dispatching show on p2
    window.dispatchEvent(new CustomEvent('pokemon:show', { detail: p2 }));
    const mainImg = overlay.querySelector('.modal-sprite') as HTMLImageElement;
    expect(mainImg.src).toContain('p2.png');
  });
});
