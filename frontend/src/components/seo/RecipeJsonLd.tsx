export default function RecipeJsonLd({ recipe }: { recipe: any }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Recipe',
    name: recipe.title,
    description: recipe.description,
    image: recipe.image?.url ? [recipe.image.url] : [],
    author: {
      '@type': 'Person',
      name: recipe.author?.name || 'Quick Make Chef',
    },
    datePublished: recipe.createdAt,
    dateModified: recipe.updatedAt,
    prepTime: `PT${recipe.cookingTime?.prep || 0}M`,
    cookTime: `PT${recipe.cookingTime?.cook || 0}M`,
    totalTime: `PT${recipe.cookingTime?.total || 0}M`,
    recipeYield: `${recipe.servings} servings`,
    recipeCategory: recipe.cuisine,
    recipeCuisine: recipe.cuisine,
    keywords: recipe.tags?.join(', '),
    suitableForDiet: recipe.dietType === 'veg'
      ? 'https://schema.org/VegetarianDiet'
      : recipe.dietType === 'vegan'
      ? 'https://schema.org/VeganDiet'
      : undefined,
    recipeIngredient: recipe.ingredients?.map((ing: any) =>
      `${ing.amount} ${ing.unit} ${ing.name}`.trim()
    ),
    recipeInstructions: recipe.steps?.map((step: any) => ({
      '@type': 'HowToStep',
      text: step.instruction,
      name: `Step ${step.stepNumber}`,
    })),
    nutrition: recipe.nutrition ? {
      '@type': 'NutritionInformation',
      calories: `${recipe.nutrition.calories} calories`,
      proteinContent: `${recipe.nutrition.protein}g`,
      carbohydrateContent: `${recipe.nutrition.carbs}g`,
      fatContent: `${recipe.nutrition.fat}g`,
      fiberContent: `${recipe.nutrition.fiber}g`,
    } : undefined,
    aggregateRating: recipe.totalRatings > 0 ? {
      '@type': 'AggregateRating',
      ratingValue: recipe.averageRating,
      reviewCount: recipe.totalRatings,
      bestRating: 5,
      worstRating: 1,
    } : undefined,
    publisher: {
      '@type': 'Organization',
      name: 'Quick Make',
      url: 'https://quickmake.app',
      logo: {
        '@type': 'ImageObject',
        url: 'https://quickmake.app/logo.png',
      },
    },
  };

  // Remove undefined fields
  const cleanJsonLd = JSON.parse(JSON.stringify(jsonLd));

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(cleanJsonLd, null, 2) }}
    />
  );
}
