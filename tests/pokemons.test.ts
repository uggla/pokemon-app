import { it, expect } from "vitest";
import { Pokemons } from "../src/pokemons";

type Pokemon = { pokedex_id: number };

it("getAllPokemons test", async () => {
  const fake: Pokemon[] = [{ pokedex_id: 0 }, { pokedex_id: 4 }];
  const fetchMock: typeof fetch = async () =>
    new Response(JSON.stringify(fake), { status: 200, headers: { "Content-Type": "application/json" } }) as any;

  const pokemons: Pokemons = await Pokemons.load(fetchMock);
  // First element returned by fetch is removed.
  expect(pokemons.getAllPokemons().map(p => p.pokedex_id)).toEqual([4]);
});

it("fails http response 404", async () => {
  const fake: Pokemon[] = [{ pokedex_id: 0 }, { pokedex_id: 4 }];
  const fetchMock: typeof fetch = async () =>
    new Response(null, { status: 404 }) as any;

  await expect(Pokemons.load(fetchMock)).rejects.toMatchObject({
    message: "HTTP 404",
  });
});

it("getPokemonById test", async () => {
  const fake: Pokemon[] = [{ pokedex_id: 0 }, { pokedex_id: 4 }];
  const fetchMock: typeof fetch = async () =>
    new Response(JSON.stringify(fake), { status: 200, headers: { "Content-Type": "application/json" } }) as any;

  const pokemons = await Pokemons.load(fetchMock);

  expect(pokemons.getPokemonById(4)?.pokedex_id).toEqual(4);
  expect(pokemons.getPokemonById(0)).toBeUndefined();

});
