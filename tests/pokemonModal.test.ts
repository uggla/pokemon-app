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

  it('renders types badges, various evo branches and handles clicks to open evo items', () => {
    const found = { pokedex_id: 999, name: { fr: 'Found' }, sprites: { regular: 'found.png' }, stats: {} };
    const mockStore = { getPokemonById: (id: number) => id === 999 ? found : null };
    setupPokemonModal(mockStore as any);

    // prepare a pokemon with various evo entries:
    // - pre[0] has sprites (full data)
    // - pre[1] has pokedex_id (lookup)
    // - pre[2] has neither (placeholder)
    // same for next
    const p = {
      name: { fr: 'Root' }, sprites: { regular: 'root.png' }, stats: {},
      types: [ { name: 'Fire', image: 'fire.png' } ],
      evolution: {
        pre: [ { name: 'PreFull', sprites: { regular: 'prefull.png' }, stats: {} }, { pokedex_id: 999 }, { name: 'Plain' } ],
        next: [ { name: 'NextFull', sprites: { regular: 'nextfull.png' } }, { pokedex_id: 999 }, { name: 'NextPlain' } ]
      }
    };

    window.dispatchEvent(new CustomEvent('pokemon:show', { detail: p }));
    const overlay = document.querySelector('#pokemon-modal-overlay') as HTMLElement;
    const types = overlay.querySelectorAll('.modal-types .type-badge');
    expect(types.length).toBe(1);

    // pre side should contain three evo-items and small arrows between them
    const preItems = overlay.querySelectorAll('.evo-pre .evo-item');
    expect(preItems.length).toBe(3);
    const preArrows = overlay.querySelectorAll('.evo-pre .evo-arrow-small');
    expect(preArrows.length).toBe(2);

    // next side
    const nextItems = overlay.querySelectorAll('.evo-next .evo-item');
    expect(nextItems.length).toBe(3);

    // clicking the first pre item (has full sprites) should render it in modal
    const firstPreImg = preItems[0].querySelector('img') as HTMLImageElement;
    expect(firstPreImg.src).toContain('prefull.png');
    firstPreImg.dispatchEvent(new MouseEvent('click'));
    const mainImg = overlay.querySelector('.modal-sprite') as HTMLImageElement;
    expect(mainImg.src).toContain('prefull.png');

    // clicking the second pre placeholder should use store lookup and render 'found.png'
    const secondPreImg = preItems[1].querySelector('img') as HTMLImageElement;
    expect(secondPreImg).toBeTruthy();
    secondPreImg.dispatchEvent(new MouseEvent('click'));
    expect((overlay.querySelector('.modal-sprite') as HTMLImageElement).src).toContain('found.png');

    // clicking a plain placeholder should not throw
    const thirdPreImg = preItems[2].querySelector('img') as HTMLImageElement;
    expect(thirdPreImg).toBeTruthy();
    expect(() => thirdPreImg.dispatchEvent(new MouseEvent('click'))).not.toThrow();

    // check arrows visibility for left/right
    const leftArrow = overlay.querySelector('.evo-arrow-left') as HTMLElement;
    const rightArrow = overlay.querySelector('.evo-arrow-right') as HTMLElement;
    expect(leftArrow.textContent).toBe('→');
    expect(rightArrow.textContent).toBe('→');

    // animationend shimmer: ensure shimmer class is added then removed after event
    const spriteWrap = overlay.querySelector('.modal-sprite-wrap') as HTMLElement;
    expect(spriteWrap.classList.contains('shimmer-once')).toBe(true);
    spriteWrap.dispatchEvent(new Event('animationend'));
    // after animationend, shimmer-once should be removed
    expect(spriteWrap.classList.contains('shimmer-once')).toBe(false);
  });

});