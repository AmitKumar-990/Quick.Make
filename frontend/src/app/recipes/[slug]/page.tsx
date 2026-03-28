import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { getRecipeBySlug } from '@/lib/api/recipes';
import RecipeJsonLd from '@/components/seo/RecipeJsonLd';
import RecipeDetailClient from '@/components/recipe/RecipeDetailClient';

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { recipe } = await getRecipeBySlug(params.slug);
    if (!recipe) return { title: 'Recipe Not Found' };

    const title = recipe.seoTitle || `${recipe.title} Recipe — Quick Make`;
    const description = recipe.seoDescription ||
      `${recipe.description} Ready in ${recipe.cookingTime.total} minutes. ${recipe.difficulty} difficulty. ${recipe.cuisine} cuisine.`;

    return {
      title,
      description,
      keywords: [
        recipe.title, recipe.cuisine, recipe.dietType,
        ...recipe.tags,
        'recipe', 'cooking', 'how to make', `${recipe.title.toLowerCase()} recipe`,
      ],
      openGraph: {
        title,
        description,
        type: 'article',
        url: `https://quickmake.app/recipes/${params.slug}`,
        images: recipe.image?.url
          ? [{ url: recipe.image.url, alt: recipe.image.alt || recipe.title, width: 1200, height: 630 }]
          : [],
        publishedTime: recipe.createdAt,
        modifiedTime: recipe.updatedAt,
        section: 'Recipes',
        tags: recipe.tags,
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: recipe.image?.url ? [recipe.image.url] : [],
      },
      alternates: {
        canonical: `https://quickmake.app/recipes/${params.slug}`,
      },
    };
  } catch {
    return { title: 'Recipe Not Found' };
  }
}

export default async function RecipePage({ params }: Props) {
  let recipe;
  try {
    const data = await getRecipeBySlug(params.slug);
    recipe = data.recipe;
  } catch {
    notFound();
  }

  if (!recipe) notFound();

  return (
    <>
      <RecipeJsonLd recipe={recipe} />
      <RecipeDetailClient recipe={recipe} />
    </>
  );
}
