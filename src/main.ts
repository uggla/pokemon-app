import "./style.css";
import typescriptLogo from "/typescript.svg";
import viteLogo from "/vite.svg";
import { setupCounter } from "./counter.ts";
import { Pokemons } from "./pokemons.ts";

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
              <button id="search-clear" type="button" title="Effacer la recherche">✕</button>
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
      <button id="page-prev" type="button">Précédent</button>
      <span id="page-info">Page 1 / 1</span>
      <button id="page-next" type="button">Suivant</button>
    </div>
  </div>
`;

setupCounter(document.querySelector<HTMLButtonElement>("#counter")!);

document.querySelector<HTMLDivElement>("#mypara")!.innerHTML = `<p>Here are pokemons !</p>`;

const tbody = document.querySelector<HTMLTableSectionElement>("#pokemons-body")!;
const btnSortName = document.querySelector<HTMLButtonElement>("#sort-name")!;
const btnSortCategory = document.querySelector<HTMLButtonElement>("#sort-category")!;
const btnSortHp = document.querySelector<HTMLButtonElement>("#sort-hp")!;
const btnSortAtk = document.querySelector<HTMLButtonElement>("#sort-atk")!;
const btnSortDef = document.querySelector<HTMLButtonElement>("#sort-def")!;
const btnSortSpa = document.querySelector<HTMLButtonElement>("#sort-spa")!;
const btnSortSpd = document.querySelector<HTMLButtonElement>("#sort-spd")!;
const btnSortVit = document.querySelector<HTMLButtonElement>("#sort-vit")!;
const btnPrev = document.querySelector<HTMLButtonElement>("#page-prev")!;
const btnNext = document.querySelector<HTMLButtonElement>("#page-next")!;
const pageInfo = document.querySelector<HTMLSpanElement>("#page-info")!;

const PAGE_SIZE = 100;
let currentPage = 1;
let totalPages = 1;
let allPokemons: any[] = [];
let originalPokemons: any[] = [];
// global sort state (initialized before any sorter is called)
let currentSortKey: string | null = null;
let currentSortDir: 'asc' | 'desc' | null = null;

function renderRows(pokemons: any[]) {
  tbody.innerHTML = pokemons
    .map(p => {
      const stats = p.stats;
      return `
        <tr>
          <td class="cell-image">
            <img src="${p.sprites.regular}" alt="${p.name.fr}" width="48" height="48"/>
          </td>
          <td class="cell-name">${p.name.fr}</td>
          <td>${p.category}</td>
          <td>${stats.hp}</td>
          <td>${stats.atk}</td>
          <td>${stats.def}</td>
          <td>${stats.spe_atk}</td>
          <td>${stats.spe_def}</td>
          <td>${stats.vit}</td>
        </tr>
      `;
    })
    .join("");
}

function renderPage(page: number) {
  const start = (page - 1) * PAGE_SIZE;
  const end = start + PAGE_SIZE;
  const slice = allPokemons.slice(start, end);
  if (slice.length === 0) {
    tbody.innerHTML = `<tr><td colspan="9">Aucun pokémon trouvé</td></tr>`;
  } else {
    renderRows(slice);
  }
  pageInfo.textContent = `Page ${currentPage} / ${totalPages}`;
  btnPrev.disabled = currentPage <= 1;
  btnNext.disabled = currentPage >= totalPages;
}

try {
  originalPokemons = await Pokemons.load() as any[];
  // always skip the first element (pokémon 0)
  if (originalPokemons.length > 0) originalPokemons = originalPokemons.slice(1);
  // working copy (filtered / sorted)
  allPokemons = [...originalPokemons];
  totalPages = Math.max(1, Math.ceil(allPokemons.length / PAGE_SIZE));
  currentPage = 1;
  // default sort will be applied after sort buttons are initialized

  const searchInput = document.querySelector<HTMLInputElement>("#search-name")!;
  const searchClear = document.querySelector<HTMLButtonElement>("#search-clear")!;

  // (old separate name sort handlers removed; unified toggle sort is used below)

  // Unified toggle sorting: one button per column that alternates asc/desc

  const sortButtons = Array.from(document.querySelectorAll<HTMLButtonElement>('.sort-btn'));
  function clearSortVisual() {
    sortButtons.forEach(b => {
      b.classList.remove('active', 'asc', 'desc');
      b.textContent = '↕';
    });
  }

  function applySortForKey(key: string, forceDir?: 'asc' | 'desc') {
    // determine new direction
    if (forceDir) {
      currentSortKey = key;
      currentSortDir = forceDir;
    } else {
      if (currentSortKey === key) {
        currentSortDir = currentSortDir === 'asc' ? 'desc' : 'asc';
      } else {
        currentSortKey = key;
        currentSortDir = 'asc';
      }
    }

    // perform sort
    if (key === 'name') {
      allPokemons = [...allPokemons].sort((a, b) => {
        const av = String((a.name && a.name.fr) || '');
        const bv = String((b.name && b.name.fr) || '');
        return currentSortDir === 'asc' ? av.localeCompare(bv, 'fr') : bv.localeCompare(av, 'fr');
      });
    } else if (key === 'category') {
      allPokemons = [...allPokemons].sort((a, b) => {
        const av = String(a.category || '');
        const bv = String(b.category || '');
        return currentSortDir === 'asc' ? av.localeCompare(bv, 'fr') : bv.localeCompare(av, 'fr');
      });
    } else {
      // stat keys: hp, atk, def, spe_atk, spe_def, vit
      const mapKey: Record<string, (p: any) => number> = {
        hp: p => Number(p.stats.hp || 0),
        atk: p => Number(p.stats.atk || 0),
        def: p => Number(p.stats.def || 0),
        spa: p => Number(p.stats.spe_atk || 0),
        spd: p => Number(p.stats.spe_def || 0),
        vit: p => Number(p.stats.vit || 0),
      };
      const accessor = mapKey[key];
      if (accessor) {
        allPokemons = [...allPokemons].sort((a, b) => {
          return currentSortDir === 'asc' ? accessor(a) - accessor(b) : accessor(b) - accessor(a);
        });
      }
    }

  // update visuals
  clearSortVisual();
  const btn = document.querySelector<HTMLButtonElement>(`#sort-${key}`);
  if (btn) {
    btn.classList.add('active');
    btn.classList.add(currentSortDir === 'asc' ? 'asc' : 'desc');
    btn.textContent = currentSortDir === 'asc' ? '▲' : '▼';
  }

  currentPage = 1; renderPage(currentPage);
}

  // default: sort by name ascending for predictable initial order
  applySortForKey('name', 'asc');

  // wire buttons
  btnSortName.addEventListener('click', () => applySortForKey('name'));
  btnSortCategory.addEventListener('click', () => applySortForKey('category'));
  btnSortHp.addEventListener('click', () => applySortForKey('hp'));
  btnSortAtk.addEventListener('click', () => applySortForKey('atk'));
  btnSortDef.addEventListener('click', () => applySortForKey('def'));
  btnSortSpa.addEventListener('click', () => applySortForKey('spa'));
  btnSortSpd.addEventListener('click', () => applySortForKey('spd'));
  btnSortVit.addEventListener('click', () => applySortForKey('vit'));

  // search handlers: always sort ascending by name after filtering to keep results predictable
  searchInput.addEventListener("input", () => {
    const q = searchInput.value.trim().toLowerCase();
    if (q === "") {
      allPokemons = [...originalPokemons];
    } else {
      allPokemons = originalPokemons.filter(p => {
        const fr = (p.name && p.name.fr) ? String(p.name.fr).toLowerCase() : "";
        const en = (p.name && p.name.en) ? String(p.name.en).toLowerCase() : "";
        return fr.includes(q) || en.includes(q);
      });
    }
    totalPages = Math.max(1, Math.ceil(allPokemons.length / PAGE_SIZE));
    currentPage = 1;
    applySortForKey('name', 'asc');
  });

  searchClear.addEventListener("click", () => {
    searchInput.value = "";
    allPokemons = [...originalPokemons];
    totalPages = Math.max(1, Math.ceil(allPokemons.length / PAGE_SIZE));
    currentPage = 1;
    applySortForKey('name', 'asc');
    searchInput.focus();
  });

  btnPrev.addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage -= 1;
      renderPage(currentPage);
    }
  });

  btnNext.addEventListener("click", () => {
    if (currentPage < totalPages) {
      currentPage += 1;
      renderPage(currentPage);
    }
  });
  } catch (err) {
  tbody.innerHTML = `<tr><td colspan="9">${(err as Error).message}</td></tr>`;
}
