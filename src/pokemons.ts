const URL = "https://tyradex.app/api/v1/pokemon";
const CACHE_KEY = "pokemon-app:all-pokemons:v1";
const CACHE_TTL_MS = 1000 * 60 * 60 * 24;

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

  private static readCache(): Pokemon[] | null {
    try {
      const raw = window.localStorage.getItem(CACHE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as { savedAt?: number; data?: Pokemon[] };
      if (!parsed.savedAt || !Array.isArray(parsed.data)) return null;
      if (Date.now() - parsed.savedAt > CACHE_TTL_MS) return null;
      return parsed.data;
    } catch {
      return null;
    }
  }

  private static readStaleCache(): Pokemon[] | null {
    try {
      const raw = window.localStorage.getItem(CACHE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as { data?: Pokemon[] };
      return Array.isArray(parsed.data) ? parsed.data : null;
    } catch {
      return null;
    }
  }

  private static writeCache(data: Pokemon[]): void {
    try {
      window.localStorage.setItem(
        CACHE_KEY,
        JSON.stringify({
          savedAt: Date.now(),
          data,
        }),
      );
    } catch {
      // Ignore storage failures and keep the network response in memory only.
    }
  }

  // static loader: creates an instance, fetches data and
  // returns both the instance and the "original" list
  static async load(fetchFn: typeof fetch = fetch): Promise<Pokemons> {
    const inst = new Pokemons();
    const cached = Pokemons.readCache();
    if (cached) {
      inst._all = cached.slice(1);
      return inst;
    }

    try {
      const res = await fetchFn(URL);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const loaded = (await res.json()) as Pokemon[];
      Pokemons.writeCache(loaded);
      inst._all = loaded.slice(1);
    } catch (error) {
      const staleCached = Pokemons.readStaleCache();
      if (!staleCached) throw error;
      inst._all = staleCached.slice(1);
    }

    return inst;
  }

  getAllPokemons(): Pokemon[] {
    return this._all;
  }

  getPokemonById(id: number): Pokemon | undefined {
    return this._all.find(p => Number(p.pokedex_id) === Number(id));
  }
}
