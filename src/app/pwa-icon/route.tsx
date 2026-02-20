import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sizeParam = searchParams.get('size');
  const size = sizeParam ? parseInt(sizeParam) : 512;

  // Scaling factors
  const strokeWidth = size * 0.02; // e.g., ~10px for 512
  const hubSize = size * 0.22;     // e.g., ~112px for 512
  const rimSize = size * 0.88;     // e.g., ~450px for 512
  const dotSize = size * 0.06;

  return new ImageResponse(
    (
        <div
            style={{
            width: '100%',
            height: '100%',
            background: '#1A1A2E',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            }}
        >
            {/* Outer Ring */}
            <div
                style={{
                    width: rimSize,
                    height: rimSize,
                    borderRadius: '50%',
                    border: `${strokeWidth * 2}px solid #D4AF37`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                }}
            >
                {/* Spokes */}
                <div style={{ position: 'absolute', width: strokeWidth, height: '100%', background: '#D4AF37' }} />
                <div style={{ position: 'absolute', width: '100%', height: strokeWidth, background: '#D4AF37' }} />
                <div style={{ position: 'absolute', width: strokeWidth, height: '100%', background: '#D4AF37', transform: 'rotate(45deg)' }} />
                <div style={{ position: 'absolute', width: strokeWidth, height: '100%', background: '#D4AF37', transform: 'rotate(-45deg)' }} />

                {/* Center Hub (Purple Piece) */}
                <div
                    style={{
                        width: hubSize,
                        height: hubSize,
                        borderRadius: '50%',
                        background: '#66023C',
                        border: `${strokeWidth}px solid #D4AF37`,
                        zIndex: 10,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                     {/* Inner highlight for 3D effect */}
                     <div style={{
                         width: '70%',
                         height: '70%',
                         borderRadius: '50%',
                         background: 'rgba(255,255,255,0.1)',
                     }} />
                </div>

                {/* Decorative Dots on Rim */}
                <div style={{ position: 'absolute', top: -strokeWidth, width: dotSize, height: dotSize, borderRadius: '50%', background: '#D4AF37' }} />
                <div style={{ position: 'absolute', bottom: -strokeWidth, width: dotSize, height: dotSize, borderRadius: '50%', background: '#D4AF37' }} />
                <div style={{ position: 'absolute', left: -strokeWidth, width: dotSize, height: dotSize, borderRadius: '50%', background: '#D4AF37' }} />
                <div style={{ position: 'absolute', right: -strokeWidth, width: dotSize, height: dotSize, borderRadius: '50%', background: '#D4AF37' }} />
            </div>
        </div>
    ),
    {
      width: size,
      height: size,
    }
  );
}
