// Next.js App Router sitemap convention — auto-discovered at /sitemap.xml
const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://carloha-marketing-hub.vercel.app';

export default function sitemap() {
  const staticRoutes = [
    { path: '', changeFrequency: 'weekly', priority: 1.0 },
    { path: '/vehicles', changeFrequency: 'weekly', priority: 0.9 },
    { path: '/general', changeFrequency: 'weekly', priority: 0.8 },
    { path: '/request', changeFrequency: 'monthly', priority: 0.7 },
    { path: '/guidelines', changeFrequency: 'monthly', priority: 0.7 },
    { path: '/updates', changeFrequency: 'weekly', priority: 0.8 },
  ];

  return staticRoutes.map(({ path, changeFrequency, priority }) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency,
    priority,
    alternates: {
      languages: {
        en: `${baseUrl}${path}`,
        'zh-CN': `${baseUrl}${path}`,
      },
    },
  }));
}
