import { ImageResponse } from 'next/og'

// Route segment config

// Image metadata
export const size = {
  width: 180,
  height: 180,
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
          // Apple icons are usually square, masked by OS.
        }}
      >
        {/* Outer Ring */}
        <div
            style={{
                width: '160px',
                height: '160px',
                borderRadius: '50%',
                border: '8px solid #D4AF37',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                boxShadow: '0 0 20px rgba(212, 175, 55, 0.4)',
            }}
        >
            {/* Spokes */}
            {/* Vertical */}
            <div style={{ position: 'absolute', width: '4px', height: '100%', background: '#D4AF37' }} />
            {/* Horizontal */}
            <div style={{ position: 'absolute', width: '100%', height: '4px', background: '#D4AF37' }} />
            {/* Diagonals */}
            <div style={{ position: 'absolute', width: '4px', height: '100%', background: '#D4AF37', transform: 'rotate(45deg)' }} />
            <div style={{ position: 'absolute', width: '4px', height: '100%', background: '#D4AF37', transform: 'rotate(-45deg)' }} />

            {/* Center Hub (Purple Piece) */}
            <div
                style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: '#66023C',
                    border: '4px solid #D4AF37',
                    zIndex: 10,
                    boxShadow: '0 0 15px rgba(102, 2, 60, 0.8)',
                }}
            />

            {/* Decorative Dots on Rim (representing placement spots) */}
            <div style={{ position: 'absolute', top: '-6px', width: '12px', height: '12px', borderRadius: '50%', background: '#D4AF37' }} />
            <div style={{ position: 'absolute', bottom: '-6px', width: '12px', height: '12px', borderRadius: '50%', background: '#D4AF37' }} />
            <div style={{ position: 'absolute', left: '-6px', width: '12px', height: '12px', borderRadius: '50%', background: '#D4AF37' }} />
            <div style={{ position: 'absolute', right: '-6px', width: '12px', height: '12px', borderRadius: '50%', background: '#D4AF37' }} />
        </div>
      </div>
    ),
    // ImageResponse options
    {
      ...size,
    }
  )
}
