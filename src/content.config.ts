// Define el esquema para las colecciones de contenido
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders'; 

const cards = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/cards" }),
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
    published: z.boolean().default(true),
  }),
});

export const collections = {
  cards
};