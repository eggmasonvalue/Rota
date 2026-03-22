import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'nodejs';

/**
 * Pre-render PWA icons at build time for better performance and reliability.
 * Next.js will generate static image files for these specified sizes.
 */
export async function generateStaticParams() {
  return [{ size: '192' }, { size: '512' }];
}

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ size: string }> }
) {
    const { size: sizeParam } = await params;
    const size = parseInt(sizeParam) || 512;

    const strokeWidth = Math.max(2, size / 40);
    const dotSize = Math.max(4, size / 15);
    const centerSize = Math.max(10, size / 6);

    return new ImageResponse(
        (
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    background: '#2C241B', // Dark Earth
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <div
                    style={{
                        width: '80%',
                        height: '80%',
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

                {/* Diagonal Decorative Dots */}
                <div style={{ position: 'absolute', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: 'rotate(45deg)' }}>
                    <div style={{ position: 'absolute', top: -strokeWidth, width: dotSize, height: dotSize, borderRadius: '50%', background: '#8C8A6B' }} />
                    <div style={{ position: 'absolute', bottom: -strokeWidth, width: dotSize, height: dotSize, borderRadius: '50%', background: '#8C8A6B' }} />
                    <div style={{ position: 'absolute', left: -strokeWidth, width: dotSize, height: dotSize, borderRadius: '50%', background: '#8C8A6B' }} />
                    <div style={{ position: 'absolute', right: -strokeWidth, width: dotSize, height: dotSize, borderRadius: '50%', background: '#8C8A6B' }} />
                </div>

                {/* Center Piece */}
                <div style={{
                        position: 'absolute',
                        width: centerSize, height: centerSize,
                        borderRadius: '50%',
                        background: '#C24538', // Pompeii Red
                        border: `${strokeWidth}px solid #8C8A6B`,
                }} />
                </div>
            </div>
        ),
        {
            width: size,
            height: size,
        }
    );
}
