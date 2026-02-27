import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Rota: The Roman Game',
    short_name: 'Rota',
    description: 'Play the ancient Roman game of Rota against AI or friends.',
    start_url: '/',
    display: 'standalone',
    background_color: '#2C241B', // Dark Earth (Warm Stone Theme)
    theme_color: '#C24538', // Pompeii Red (Warm Stone Theme)
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
      {
        src: '/pwa-icon?size=192',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/pwa-icon?size=512',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
