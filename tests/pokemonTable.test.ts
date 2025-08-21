import { beforeEach, describe, expect, it, vi } from 'vitest';
import { setupPokemonTable } from '../src/pokemonTable.ts';

type P = any;

function makeDOM() {
  document.body.innerHTML = '';
  const table = document.createElement('table');
  const tbody = document.createElement('tbody');
  tbody.id = 'pokemons-body';
  table.appendChild(tbody);
  document.body.appendChild(table);

  const ids = [
    'sort-name',
    'sort-category',
    'sort-hp',
    'sort-atk',
    'sort-def',
    'sort-spa',
    'sort-spd',
    'sort-vit',
  ];
  ids.forEach(id => {
    const b = document.createElement('button');
    b.id = id;
    b.className = 'sort-btn';
    b.textContent = '↕';
    document.body.appendChild(b);
  });

  const prev = document.createElement('button');
  prev.id = 'page-prev';
  document.body.appendChild(prev);
  const next = document.createElement('button');
  next.id = 'page-next';
  document.body.appendChild(next);
  const info = document.createElement('span');
  info.id = 'page-info';
  document.body.appendChild(info);

  const search = document.createElement('input');
  search.id = 'search-name';
  document.body.appendChild(search);
  const clear = document.createElement('button');
  clear.id = 'search-clear';
  document.body.appendChild(clear);

  const sel = document.createElement('select');
  sel.id = 'filter-gen';
  const optAll = document.createElement('option');
  optAll.value = '';
  optAll.text = 'All';
  sel.appendChild(optAll);
  const opt1 = document.createElement('option');
  opt1.value = '1';
  opt1.text = '1';
  sel.appendChild(opt1);
  const opt2 = document.createElement('option');
  opt2.value = '2';
  opt2.text = '2';
  sel.appendChild(opt2);
  document.body.appendChild(sel);
}

function makeMockPokemons(): P[] {
  return [
    {
      pokedex_id: 1,
      name: { fr: 'Zabra', en: 'Zabra' },
      sprites: { regular: 'zabra.png' },
      generation: 1,
      category: 'c',
      stats: { hp: 10, atk: 20, def: 30, spe_atk: 40, spe_def: 50, vit: 60 },
    },
    {
      pokedex_id: 25,
      name: { fr: 'Pikachu', en: 'Pikachu' },
      sprites: { regular: 'pika.png' },
      generation: 2,
      category: 'b',
      stats: { hp: 35, atk: 55, def: 40, spe_atk: 50, spe_def: 50, vit: 90 },
    },
    {
      pokedex_id: 2,
      name: { fr: 'Bulbi', en: 'Bulbi' },
      sprites: { regular: 'bulbi.png' },
      generation: 1,
      category: 'a',
      stats: { hp: 45, atk: 49, def: 49, spe_atk: 65, spe_def: 65, vit: 45 },
    },
  ];
}

describe('setupPokemonTable', () => {
  let pokemons: P[];
  let store: { getAllPokemons: () => P[] };

  beforeEach(() => {
    makeDOM();
    pokemons = makeMockPokemons();
    store = {
      getAllPokemons: () => pokemons,
    };
  });

  it('renders all rows and page info', () => {
    setupPokemonTable(store as any);
    const rows = document.querySelectorAll('#pokemons-body tr');
    expect(rows.length).toBe(3);
    const pageInfo = document.querySelector('#page-info')!;
    expect(pageInfo.textContent).toContain('Page 1 / 1');
  });

  it('sorts by name desc when clicking sort button twice', () => {
    setupPokemonTable(store as any);
    // initial is asc (Bulbi, Pikachu, Zabra)
    let first = document.querySelectorAll('#pokemons-body .cell-name')[0].textContent?.trim();
    expect(first).toBe('Bulbi');

    const btn = document.querySelector('#sort-name') as HTMLButtonElement;
    // click once -> toggles to desc (since initial was set to asc on init, first click makes desc)
    btn.click();
    first = document.querySelectorAll('#pokemons-body .cell-name')[0].textContent?.trim();
    expect(first).toBe('Zabra');
    // click again -> asc
    btn.click();
    first = document.querySelectorAll('#pokemons-body .cell-name')[0].textContent?.trim();
    expect(first).toBe('Bulbi');
  });

  it('filters by search input', () => {
    setupPokemonTable(store as any);
    const input = document.querySelector('#search-name') as HTMLInputElement;
    input.value = 'Pika';
    input.dispatchEvent(new Event('input'));
    const rows = document.querySelectorAll('#pokemons-body tr');
    expect(rows.length).toBe(1);
    const name = document.querySelector('#pokemons-body .cell-name')!.textContent!.trim();
    expect(name).toBe('Pikachu');
  });

  it('filters by generation select', () => {
    setupPokemonTable(store as any);
    const sel = document.querySelector('#filter-gen') as HTMLSelectElement;
    sel.value = '1';
    sel.dispatchEvent(new Event('change'));
    const rows = document.querySelectorAll('#pokemons-body tr');
    // two pokemons have generation 1 in our mock
    expect(rows.length).toBe(2);
  });

  it('dispatches pokemon:show when clicking image', () => {
    setupPokemonTable(store as any);
    const handler = vi.fn();
    window.addEventListener('pokemon:show', (e: any) => handler(e.detail));
    const img = document.querySelector('#pokemons-body td.cell-image img') as HTMLImageElement;
    expect(img).toBeTruthy();
    img.click();
    expect(handler).toHaveBeenCalled();
    const calledWith = handler.mock.calls[0][0];
    expect(calledWith.name.fr).toBeDefined();
  });

  it('emits pokemons:visible on render with the visible slice', () => {
    const vis = vi.fn();
    window.addEventListener('pokemons:visible', (e: any) => vis(e.detail));
    setupPokemonTable(store as any);
    expect(vis).toHaveBeenCalled();
    const payload = vis.mock.calls[0][0];
    expect(Array.isArray(payload)).toBe(true);
    expect(payload.length).toBe(3);
  });

  it('handles empty store gracefully', () => {
    store = { getAllPokemons: () => [] };
    setupPokemonTable(store as any);
    const cell = document.querySelector('#pokemons-body td')!;
    expect(cell.textContent).toContain('No pokemons found');
  });

  it('paginates when there are more pokemons than page size', () => {
    // create 60 pokemons to force 2 pages (PAGE_SIZE = 50)
    const many: P[] = Array.from({ length: 60 }).map((_, i) => ({
      pokedex_id: 1000 + i,
      name: { fr: `P${i}`, en: `P${i}` },
      sprites: { regular: `p${i}.png` },
      generation: 1,
      category: 'x',
      stats: { hp: i, atk: i, def: i, spe_atk: i, spe_def: i, vit: i },
    }));
    store = { getAllPokemons: () => many };
    setupPokemonTable(store as any);
    const info = document.querySelector('#page-info')!;
    expect(info.textContent).toContain('Page 1 / 2');
    const btnNext = document.querySelector('#page-next') as HTMLButtonElement;
    const btnPrev = document.querySelector('#page-prev') as HTMLButtonElement;
    expect(btnPrev.disabled).toBe(true);
    expect(btnNext.disabled).toBe(false);
    btnNext.click();
    expect(info.textContent).toContain('Page 2 / 2');
    expect(btnPrev.disabled).toBe(false);
    expect(btnNext.disabled).toBe(true);
    // click prev to go back to page 1
    btnPrev.click();
    expect(info.textContent).toContain('Page 1 / 2');
  });

  it('sorts by hp and updates button classes and arrow', () => {
    setupPokemonTable(store as any);
    const btnHp = document.querySelector('#sort-hp') as HTMLButtonElement;
    btnHp.click();
    // after clicking once, hp sort should be active and asc
    expect(btnHp.classList.contains('active')).toBe(true);
    expect(btnHp.classList.contains('asc')).toBe(true);
    expect(btnHp.textContent).toBe('▲');
    // verify first row has lowest hp (10)
    const firstHp = Number(document.querySelectorAll('#pokemons-body tr td')[4].textContent);
    expect(firstHp).toBe(10);
  });

  it('sorts by category and orders rows accordingly', () => {
    setupPokemonTable(store as any);
    const btnCat = document.querySelector('#sort-category') as HTMLButtonElement;
    btnCat.click();
    expect(btnCat.classList.contains('active')).toBe(true);
    expect(btnCat.classList.contains('asc')).toBe(true);
    // first row category should be 'a' (Bulbi)
    const firstCategory = document.querySelector('#pokemons-body tr td:nth-child(4)')!.textContent!.trim();
    expect(firstCategory).toBe('a');
    // click again to toggle desc
    btnCat.click();
    expect(btnCat.classList.contains('desc')).toBe(true);
  });

  it('search input empty branch restores all pokemons', () => {
    setupPokemonTable(store as any);
    const input = document.querySelector('#search-name') as HTMLInputElement;
    input.value = '';
    input.dispatchEvent(new Event('input'));
    const rows = document.querySelectorAll('#pokemons-body tr');
    expect(rows.length).toBe(3);
  });

  it('clears search and focuses input when clicking clear', () => {
    setupPokemonTable(store as any);
    const input = document.querySelector('#search-name') as HTMLInputElement;
    const clear = document.querySelector('#search-clear') as HTMLButtonElement;
    input.value = 'bul';
    input.dispatchEvent(new Event('input'));
    // ensure filtered
    expect(document.querySelectorAll('#pokemons-body tr').length).toBe(1);
    // spy on focus
    const focusSpy = vi.spyOn(input, 'focus');
    clear.click();
    expect(input.value).toBe('');
    expect(focusSpy).toHaveBeenCalled();
  });

  it('gen select empty option restores all pokemons', () => {
    setupPokemonTable(store as any);
    const sel = document.querySelector('#filter-gen') as HTMLSelectElement;
    sel.value = '1';
    sel.dispatchEvent(new Event('change'));
    expect(document.querySelectorAll('#pokemons-body tr').length).toBe(2);
    sel.value = '';
    sel.dispatchEvent(new Event('change'));
    expect(document.querySelectorAll('#pokemons-body tr').length).toBe(3);
  });

  it('swallows errors thrown by window.dispatchEvent in image click and pokemons:visible', () => {
    // make dispatchEvent throw to exercise the catch blocks
    const orig = window.dispatchEvent;
    window.dispatchEvent = (() => { throw new Error('boom'); }) as any;
    try {
      setupPokemonTable(store as any);
      // clicking image should not throw because internal handler swallows
      const img = document.querySelector('#pokemons-body td.cell-image img') as HTMLImageElement;
      expect(() => img.click()).not.toThrow();
      // also ensure render did not crash and page-info exists
      expect(document.querySelector('#page-info')!.textContent).toBeTruthy();
    } finally {
      window.dispatchEvent = orig;
    }
  });

  it('clicking different sort buttons clears previous visual state', () => {
    setupPokemonTable(store as any);
    const btnHp = document.querySelector('#sort-hp') as HTMLButtonElement;
    const btnAtk = document.querySelector('#sort-atk') as HTMLButtonElement;
    btnHp.click();
    expect(btnHp.classList.contains('active')).toBe(true);
    btnAtk.click();
    // previous should be cleared
    expect(btnHp.classList.contains('active')).toBe(false);
    expect(btnAtk.classList.contains('active')).toBe(true);
  });

  it('sorts by other stats (atk, def, spa, spd, vit)', () => {
    setupPokemonTable(store as any);
    const keys = ['atk', 'def', 'spa', 'spd', 'vit'];
    for (const k of keys) {
      const btn = document.querySelector(`#sort-${k}`) as HTMLButtonElement;
      btn.click();
      expect(btn.classList.contains('active')).toBe(true);
      // arrow should be present
      expect(['▲', '▼'].includes(btn.textContent || '')).toBe(true);
    }
  });

});