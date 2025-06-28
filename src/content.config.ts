// Define el esquema para las colecciones de contenido
import { defineCollection, z } from 'astro:content';
import { file } from 'astro/loaders'; 

const cards = defineCollection({
  loader: file("src/data/cards.json"),
  schema: z.object({
    id: z.string(),
    name: z.string(),
    title: z.string(),
    card_class: z.string(),
    expansion: z.string(),
    number_in_series: z.string(),
    artist: z.string(),
    pixels_cost: z.number(),
    strength: z.number(),
    health: z.number(),
    ability: z.string(),
    ability_description : z.string(),
    game: z.string(),
    quote: z.string(),
    rarity: z.string(),
    rarity_level: z.number(),
    language: z.string(),
    image: z.string(),
  }),
});

export const collections = {
  cards
};