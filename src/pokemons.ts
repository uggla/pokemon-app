const URL = "https://tyradex.app/api/v1/pokemon";

export type Pokemon = {
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
  private _all: Pokemon[] = [];

  // static loader: creates an instance, fetches data and
  // returns both the instance and the "original" list
  static async load(fetchFn: typeof fetch = fetch): Promise<Pokemons> {
    const inst = new Pokemons();
    const res = await fetchFn(URL);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const loaded = (await res.json()) as Pokemon[];
    inst._all = loaded.slice(1);
    return inst;
  }

  getAllPokemons(): Pokemon[] {
    return this._all;
  }

  getPokemonById(id: number): Pokemon | undefined {
    return this._all.find(p => Number(p.pokedex_id) === Number(id));
  }
}
