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
        src: '/theme_0.png',
        sizes: '1080x1920',
        type: 'image/png',
        form_factor: 'narrow',
        label: 'The Forum - Warm Stone Theme',
      },
      {
        src: '/theme_1.png',
        sizes: '1080x1920',
        type: 'image/png',
        form_factor: 'narrow',
        label: 'The Alabaster - Pure Marble Theme',
      },
      {
        src: '/theme_2.png',
        sizes: '1080x1920',
        type: 'image/png',
        form_factor: 'narrow',
        label: 'The Serpentine - Green Marble Theme',
      },
      {
        src: '/theme_3.png',
        sizes: '1080x1920',
        type: 'image/png',
        form_factor: 'narrow',
        label: 'The Forum (Dark) - Earth & Lapis Theme',
      },
      {
        src: '/theme_4.png',
        sizes: '1080x1920',
        type: 'image/png',
        form_factor: 'narrow',
        label: 'Vulcan\'s Forge - Amber & Cobalt Theme',
      },
      {
        src: '/theme_5.png',
        sizes: '1080x1920',
        type: 'image/png',
        form_factor: 'narrow',
        label: 'The Onyx - Obsidian & Gold Theme',
      },
      // Wide screenshots (using same images as requested)
      {
        src: '/theme_0.png',
        sizes: '1080x1920',
        type: 'image/png',
        form_factor: 'wide',
        label: 'The Forum - Warm Stone Theme',
      },
      {
        src: '/theme_1.png',
        sizes: '1080x1920',
        type: 'image/png',
        form_factor: 'wide',
        label: 'The Alabaster - Pure Marble Theme',
      },
      {
        src: '/theme_2.png',
        sizes: '1080x1920',
        type: 'image/png',
        form_factor: 'wide',
        label: 'The Serpentine - Green Marble Theme',
      },
      {
        src: '/theme_3.png',
        sizes: '1080x1920',
        type: 'image/png',
        form_factor: 'wide',
        label: 'The Forum (Dark) - Earth & Lapis Theme',
      },
      {
        src: '/theme_4.png',
        sizes: '1080x1920',
        type: 'image/png',
        form_factor: 'wide',
        label: 'Vulcan\'s Forge - Amber & Cobalt Theme',
      },
      {
        src: '/theme_5.png',
        sizes: '1080x1920',
        type: 'image/png',
        form_factor: 'wide',
        label: 'The Onyx - Obsidian & Gold Theme',
      },
    ],
  };
}
