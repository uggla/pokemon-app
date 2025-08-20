let ALL_POKEMONS: any[] | null = null;

export function setAllPokemons(list: any[]) {
  ALL_POKEMONS = list;
}

export function getAllPokemons(): any[] | null {
  return ALL_POKEMONS;
}

export function getPokemonById(id: number): any | undefined {
  if (!ALL_POKEMONS) return undefined;
  return ALL_POKEMONS.find(p => Number(p.pokedex_id) === Number(id));
}
