import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const alt = 'Rota - The Ancient Roman Game of Strategy'
export const size = {
  width: 1200,
  height: 630,
}

export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#1A1A2E',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'serif',
          border: '20px solid #D4AF37',
        }}
      >
        <div
          style={{
            fontSize: 180,
            background: '#66023C',
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#D4AF37',
            textShadow: '4px 4px 8px rgba(0,0,0,0.5)',
          }}
        >
          ROTA
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
