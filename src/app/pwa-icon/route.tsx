import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sizeParam = searchParams.get('size');
  const size = sizeParam ? parseInt(sizeParam) : 512;

  return new ImageResponse(
    (
        <div
            style={{
            fontSize: size * 0.6,
            background: '#66023C',
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#D4AF37',
            // PWA icons should be square; the OS handles masking (squircle etc)
            borderRadius: '0',
            border: `${size * 0.05}px solid #D4AF37`,
            }}
        >
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                height: '100%',
            }}>
               R
            </div>
        </div>
    ),
    {
      width: size,
      height: size,
    }
  );
}
