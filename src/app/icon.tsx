import { ImageResponse } from 'next/og'

// Route segment config
export const runtime = 'edge'

// Image metadata
export const size = {
  width: 32,
  height: 32,
}
export const contentType = 'image/png'

// Image generation
export default function Icon() {
  return new ImageResponse(
    (
      // ImageResponse JSX element
      <div
        style={{
          background: '#1A1A2E',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '50%',
          border: '2px solid #D4AF37',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            width: '2px',
            height: '100%',
            background: '#D4AF37',
            transform: 'rotate(45deg)',
          }}
        />
         <div
          style={{
            position: 'absolute',
            width: '2px',
            height: '100%',
            background: '#D4AF37',
            transform: 'rotate(-45deg)',
          }}
        />
        <div
            style={{
                width: '12px',
                height: '12px',
                background: '#66023C',
                borderRadius: '50%',
                border: '1.5px solid #D4AF37',
                zIndex: 10,
                position: 'absolute', // Center it explicitly
            }}
        />
      </div>
    ),
    // ImageResponse options
    {
      ...size,
    }
  )
}
