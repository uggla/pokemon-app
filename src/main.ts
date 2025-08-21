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
      <ul id="pokemons"></ul>
  </div>
`;

setupCounter(document.querySelector<HTMLButtonElement>("#counter")!);

document.querySelector<HTMLDivElement>("#mypara")!.innerHTML = `<p>Coucou !</p>`;

const pokemons = await Pokemons.load();
const list = document.querySelector<HTMLUListElement>("#pokemons")!;
list.innerHTML = pokemons.slice(1, 17).map(p => `<li><img id="pokemon" src="${p.sprites.regular}"/></li>`).join("");
