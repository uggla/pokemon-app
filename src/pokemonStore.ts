class PokemonStore {
  private all: any[] | null = null;
  setAll(list: any[]) { this.all = list; }
  getAll(): any[] | null { return this.all; }
  getById(id: number): any | undefined {
    if (!this.all) return undefined;
    return this.all.find(p => Number(p.pokedex_id) === Number(id));
  }
}

const store = new PokemonStore();
export default store;
export const setAllPokemons = (list: any[]) => store.setAll(list);
export const getAllPokemons = () => store.getAll();
export const getPokemonById = (id: number) => store.getById(id);
