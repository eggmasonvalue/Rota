import { ImageResponse } from 'next/og';

// Route segment config
export const runtime = 'nodejs';

// Image metadata
export const alt = 'Rota: The Roman Game';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default function Image() {
  const strokeWidth = 6;
  const dotSize = 24;

  return new ImageResponse(
    (
      <div
        style={{
          background: '#2C241B', // Dark Earth
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '40px' }}>
            {/* Game Board Graphic */}
            <div
                style={{
                    width: '300px',
                    height: '300px',
                    borderRadius: '50%',
                    border: `${strokeWidth * 2}px solid #8C8A6B`, // Light Olive
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                {/* Spokes */}
                <div style={{ position: 'absolute', width: strokeWidth, height: '100%', background: '#8C8A6B' }} />
                <div style={{ position: 'absolute', width: '100%', height: strokeWidth, background: '#8C8A6B' }} />
                <div style={{ position: 'absolute', width: strokeWidth, height: '100%', background: '#8C8A6B', transform: 'rotate(45deg)' }} />
                <div style={{ position: 'absolute', width: strokeWidth, height: '100%', background: '#8C8A6B', transform: 'rotate(-45deg)' }} />

                {/* Decorative Dots on rim */}
                <div style={{ position: 'absolute', top: -strokeWidth, width: dotSize, height: dotSize, borderRadius: '50%', background: '#8C8A6B' }} />
                <div style={{ position: 'absolute', bottom: -strokeWidth, width: dotSize, height: dotSize, borderRadius: '50%', background: '#8C8A6B' }} />
                <div style={{ position: 'absolute', left: -strokeWidth, width: dotSize, height: dotSize, borderRadius: '50%', background: '#8C8A6B' }} />
                <div style={{ position: 'absolute', right: -strokeWidth, width: dotSize, height: dotSize, borderRadius: '50%', background: '#8C8A6B' }} />

                {/* Center Piece */}
                <div style={{
                        position: 'absolute',
                        width: '60px', height: '60px',
                        borderRadius: '50%',
                        background: '#C24538', // Pompeii Red
                        border: `${strokeWidth}px solid #8C8A6B`,
                }} />
            </div>

            {/* Text Content */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <div style={{
                    fontSize: 120,
                    color: '#8C8A6B', // Light Olive
                    fontWeight: 'bold',
                    letterSpacing: '0.1em',
                    lineHeight: 1,
                    marginBottom: 20
                }}>
                    ROTA
                </div>
                <div style={{
                    fontSize: 40,
                    color: '#8C8A6B',
                    letterSpacing: '0.05em',
                    opacity: 0.8
                }}>
                    THE ROMAN GAME
                </div>
            </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
