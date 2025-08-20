import "./style.css";
import typescriptLogo from "/typescript.svg";
import viteLogo from "/vite.svg";
import { setupCounter } from "./counter.ts";
import { setupPokemonTable } from "./pokemonTable.ts";
import { setupPokemonChart } from './pokemonChart.ts';
import { setupPokemonModal } from './pokemonModal.ts';

window.addEventListener("load", () => {
  document.body.style.display = "block";
});

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  <div>
    <a href="https://vite.dev" target="_blank">
      <img src="${viteLogo}" class="logo" alt="Vite logo" />
    </a>
    <a href="https://www.typescriptlang.org/" target="_blank">
      <img src="${typescriptLogo}" class="logo vanilla" alt="TypeScript logo" />
    </a>
    <h1>Vite + TypeScript</h1>
    <div class="card">
      <button id="counter" type="button"></button>
    </div>
      Click on the Vite and TypeScript logos to learn more
    </p>
      <div id="mypara"></div>
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
  </div>
`;

setupCounter(document.querySelector<HTMLButtonElement>("#counter")!);

document.querySelector<HTMLDivElement>("#mypara")!.innerHTML = `<p>Here are pokemons !</p>`;

// initialize modal first, then chart so it can receive events
setupPokemonModal();
setupPokemonChart();
await setupPokemonTable();
