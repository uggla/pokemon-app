import "./style.css";
import typescriptLogo from "/typescript.svg";
import viteLogo from "/vite.svg";
import pokemonLogo from "/International_Pokémon_logo.svg";
import { setupPokemonTable } from "./pokemonTable.ts";
import { setupPokemonChart } from './pokemonChart.ts';
import { setupPokemonModal } from './pokemonModal.ts';
import { Pokemons } from './pokemons.ts';

window.addEventListener("load", () => {
  document.body.style.display = "block";
});

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  <div>
    <header class="page-header">
      <img src="${pokemonLogo}" alt="Pokemon logo" class="pokemon-logo" />
    </header>
    <main>
      <div id="mypara"></div>
    </main>
    <table id="pokemons-table">
      <thead>
        <tr>
          <th>Image</th>
          <th>
            Name
            <button id="sort-name" class="sort-btn" title="Trier">↕</button>
            <div>
              <input id="search-name" type="search" placeholder="Search..." />
              <button id="search-clear" type="button" title="Clear search">✕</button>
            </div>
          </th>
          <th>
            Gen
            <div>
              <select id="filter-gen" title="Filter by generation">
                <option value="">All</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
                <option value="6">6</option>
                <option value="7">7</option>
                <option value="8">8</option>
                <option value="9">9</option>
              </select>
            </div>
          </th>
          <th>
            Category
            <button id="sort-category" class="sort-btn" title="Trier">↕</button>
          </th>
          <th>
            HP
            <button id="sort-hp" class="sort-btn" title="Trier">↕</button>
          </th>
          <th>
            ATK
            <button id="sort-atk" class="sort-btn" title="Trier">↕</button>
          </th>
          <th>
            DEF
            <button id="sort-def" class="sort-btn" title="Trier">↕</button>
          </th>
          <th>
            SPA
            <button id="sort-spa" class="sort-btn" title="Trier">↕</button>
          </th>
          <th>
            SPD
            <button id="sort-spd" class="sort-btn" title="Trier">↕</button>
          </th>
          <th>
            VIT
            <button id="sort-vit" class="sort-btn" title="Trier">↕</button>
          </th>
        </tr>
      </thead>
      <tbody id="pokemons-body"></tbody>
    </table>
    <div id="pagination" class="pagination">
      <button id="page-prev" type="button">Prev</button>
      <span id="page-info">Page 1 / 1</span>
      <button id="page-next" type="button">Next</button>
    </div>
    <div id="chart-controls" style="margin-top:1rem; display:flex; gap:0.5rem; align-items:center; justify-content:center;">
      <label for="chart-stat">Statistic:</label>
      <select id="chart-stat">
        <option value="hp">HP</option>
        <option value="atk">ATK</option>
        <option value="def">DEF</option>
        <option value="spe_atk">SPA</option>
        <option value="spe_def">SPD</option>
        <option value="vit">VIT</option>
      </select>
    </div>
    <div id="pokemon-chart" style="margin-top:1rem; display:flex; justify-content:center;"></div>

    <footer class="app-footer">
      <div class="made-with">Made with ❤️ with Vite <img src="${viteLogo}" class="logo small inline" alt="Vite" /> + TypeScript <img src="${typescriptLogo}" class="logo small vanilla inline" alt="TS" /></div>
    </footer>
  </div>
`;

document.querySelector<HTMLDivElement>("#mypara")!.innerHTML = `<p>Here are pokemons !</p>`;

// create Pokemons instance
const pokemons: Pokemons = await Pokemons.load();

// initialize modal (needs instance for evolution lookups), then chart then table
setupPokemonModal(pokemons);
setupPokemonChart();
setupPokemonTable(pokemons);
