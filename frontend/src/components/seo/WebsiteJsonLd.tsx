export default function WebsiteJsonLd() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': 'https://quickmake.app/#website',
        url: 'https://quickmake.app',
        name: 'Quick Make',
        description: 'Smart recipe suggestions based on your ingredients',
        potentialAction: {
          '@type': 'SearchAction',
          target: { '@type': 'EntryPoint', urlTemplate: 'https://quickmake.app/search?q={search_term_string}' },
          'query-input': 'required name=search_term_string',
        },
        inLanguage: 'en-US',
      },
      {
        '@type': 'WebApplication',
        name: 'Quick Make',
        url: 'https://quickmake.app',
        applicationCategory: 'FoodApplication',
        operatingSystem: 'All',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        description: 'AI-powered recipe suggestion app that helps you cook with ingredients you already have.',
        aggregateRating: { '@type': 'AggregateRating', ratingValue: '4.8', reviewCount: '1250' },
      },
      {
        '@type': 'Organization',
        '@id': 'https://quickmake.app/#organization',
        name: 'Quick Make',
        url: 'https://quickmake.app',
        logo: { '@type': 'ImageObject', url: 'https://quickmake.app/logo.png' },
        sameAs: ['https://twitter.com/quickmakeapp', 'https://instagram.com/quickmakeapp'],
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
