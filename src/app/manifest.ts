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
        src: '/icon',
        sizes: '32x32',
        type: 'image/png',
      },
      {
        src: '/pwa-icon/192',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/pwa-icon/512',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    screenshots: [
      {
        src: '/screenshot-mobile-dark.png',
        sizes: '1078x1983',
        type: 'image/png',
        form_factor: 'narrow',
        label: 'Rota Board - Dark Mode',
      },
      {
        src: '/screenshot-mobile-light.png',
        sizes: '1078x1983',
        type: 'image/png',
        form_factor: 'narrow',
        label: 'Rota Board - Light Mode',
      },
      {
        src: '/screenshot-desktop-dark.png',
        sizes: '928x772',
        type: 'image/png',
        form_factor: 'wide',
        label: 'Rota Board - Dark Mode',
      },
      {
        src: '/screenshot-desktop-light.png',
        sizes: '928x772',
        type: 'image/png',
        form_factor: 'wide',
        label: 'Rota Board - Light Mode',
      },
    ],
  };
}
