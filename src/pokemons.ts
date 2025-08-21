type Pokemon = {
  pokedex_id: number;
  generation: number;
  category: string;
  name: {
    fr: string;
    en: string;
    jp: string;
  };
  sprites: {
    regular: string;
    shiny: string;
    gmax: string | null;
  };
  types: {
    name: string;
    image: string;
  }[];
  talents: {
    name: string;
    tc: boolean; // true/false toggle
  }[];
  stats: {
    hp: number;
    atk: number;
    def: number;
    spe_atk: number;
    spe_def: number;
    vit: number;
  };
};

export class Pokemons {
  // static: you can call it without `new`
  static async load(): Promise<Pokemon[]> {
    const res = await fetch("https://tyradex.vercel.app/api/v1/pokemon");
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as Pokemon[];
  }
}


// simple in-memory store previously located in `src/pokemonStore.ts`
let _allPokemons: Pokemon[] | null = null;

export function setAllPokemons(list: Pokemon[]) {
  _allPokemons = list;
}

export function getAllPokemons(): Pokemon[] | null {
  return _allPokemons;
}

export function getPokemonById(id: number): Pokemon | undefined {
  if (!_allPokemons) return undefined;
  return _allPokemons.find(p => Number(p.pokedex_id) === Number(id));
}
