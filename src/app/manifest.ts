import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Rota - Imperial Senate',
    short_name: 'Rota',
    description: 'A classic Roman game strategy game with an Imperial aesthetic.',
    start_url: '/',
    display: 'standalone',
    background_color: '#1A1A2E',
    theme_color: '#66023C',
    icons: [
      {
        src: '/pwa-icon?size=192&v=2',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/pwa-icon?size=512&v=2',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/pwa-icon?size=512&v=2',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  }
}
