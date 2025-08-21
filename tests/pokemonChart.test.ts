import { beforeEach, describe, expect, it, vi } from 'vitest';
import { setupPokemonChart } from '../src/pokemonChart.ts';

function makeDOM() {
  document.body.innerHTML = '';
  const container = document.createElement('div');
  container.id = 'pokemon-chart';
  document.body.appendChild(container);

  const select = document.createElement('select');
  select.id = 'chart-stat';
  const opt = document.createElement('option'); opt.value = 'hp'; opt.text = 'HP'; select.appendChild(opt);
  const opt2 = document.createElement('option'); opt2.value = 'atk'; opt2.text = 'ATK'; select.appendChild(opt2);
  document.body.appendChild(select);

  // optional table to influence width logic
  const table = document.createElement('table');
  table.id = 'pokemons-table';
  // jsdom exposes clientWidth as a getter-only property; define it explicitly
  Object.defineProperty(table, 'clientWidth', { value: 800, configurable: true });
  document.body.appendChild(table);
}

function makePokemons() {
  return [
    { name: { fr: 'A' }, sprites: { regular: 'a.png' }, stats: { hp: 10, atk: 5 } },
    { name: { fr: 'B' }, sprites: { regular: 'b.png' }, stats: { hp: 20, atk: 15 } },
    { name: { fr: 'C' }, sprites: { regular: 'c.png' }, stats: { hp: 5, atk: 25 } },
  ];
}

describe('setupPokemonChart', () => {
  beforeEach(() => makeDOM());

  it('renders svg and polyline when pokemons:visible is dispatched', () => {
    setupPokemonChart();
    const pokes = makePokemons();
    const ev = new CustomEvent('pokemons:visible', { detail: pokes });
    window.dispatchEvent(ev);
    const svg = document.querySelector('#pokemon-chart svg');
    expect(svg).toBeTruthy();
    const poly = svg!.querySelector('polyline');
    expect(poly).toBeTruthy();
    const imgs = svg!.querySelectorAll('image.chart-point-image');
    expect(imgs.length).toBe(3);
  });

  it('image click emits pokemon:show', () => {
    setupPokemonChart();
    const pokes = makePokemons();
    const listener = vi.fn();
    window.addEventListener('pokemon:show', (e: any) => listener(e.detail));
    window.dispatchEvent(new CustomEvent('pokemons:visible', { detail: pokes }));
    const img = document.querySelector('#pokemon-chart svg image.chart-point-image') as HTMLElement;
    expect(img).toBeTruthy();
    img.click();
    expect(listener).toHaveBeenCalled();
  });

  it('re-renders when select changes and reflects new stat key in titles', () => {
    setupPokemonChart();
    const pokes = makePokemons();
    window.dispatchEvent(new CustomEvent('pokemons:visible', { detail: pokes }));
    const select = document.querySelector('#chart-stat') as HTMLSelectElement;
    select.value = 'atk';
    select.dispatchEvent(new Event('change'));
    const titles = Array.from(document.querySelectorAll('#pokemon-chart svg image title')).map(t => t.textContent || '');
    // each title should contain 'atk'
    expect(titles.every(t => t.toLowerCase().includes('atk'))).toBe(true);
  });

  it('renders nothing when visible list is empty', () => {
    setupPokemonChart();
    window.dispatchEvent(new CustomEvent('pokemons:visible', { detail: [] }));
    const svg = document.querySelector('#pokemon-chart svg');
    expect(svg).toBeNull();
  });
});
