import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const alt = 'Rota - The Ancient Roman Game of Strategy'
export const size = {
  width: 1200,
  height: 630,
}

export const contentType = 'image/png'

export default async function Image() {
  const marcellusFont = await fetch(
    new URL('https://fonts.gstatic.com/s/marcellus/v13/1yOsO9M30K3R8m0KExeu.ttf', import.meta.url)
  ).then((res) => res.arrayBuffer())

  const loraFont = await fetch(
    new URL('https://fonts.gstatic.com/s/lora/v35/0QIvMX1D_JOuMwr7.ttf', import.meta.url)
  ).then((res) => res.arrayBuffer())

  const iconSize = 400; // Smaller than height to fit
  const strokeWidth = iconSize * 0.02;
  const hubSize = iconSize * 0.22;
  const rimSize = iconSize * 0.88;
  const dotSize = iconSize * 0.06;

  return new ImageResponse(
    (
      <div
        style={{
          background: '#1A1A2E',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '40px',
        }}
      >
        {/* Imperial Wheel Icon */}
        <div
            style={{
                width: iconSize,
                height: iconSize,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
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

                {/* Center Hub */}
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
                     <div style={{
                         width: '70%',
                         height: '70%',
                         borderRadius: '50%',
                         background: 'rgba(255,255,255,0.1)',
                     }} />
                </div>

                {/* Decorative Dots */}
                <div style={{ position: 'absolute', top: -strokeWidth, width: dotSize, height: dotSize, borderRadius: '50%', background: '#D4AF37' }} />
                <div style={{ position: 'absolute', bottom: -strokeWidth, width: dotSize, height: dotSize, borderRadius: '50%', background: '#D4AF37' }} />
                <div style={{ position: 'absolute', left: -strokeWidth, width: dotSize, height: dotSize, borderRadius: '50%', background: '#D4AF37' }} />
                <div style={{ position: 'absolute', right: -strokeWidth, width: dotSize, height: dotSize, borderRadius: '50%', background: '#D4AF37' }} />
            </div>
        </div>

        {/* Text */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              fontSize: 120,
              fontFamily: 'Marcellus',
              color: '#D4AF37',
              lineHeight: 1,
            }}
          >
            ROTA
          </div>
          <div
            style={{
              fontSize: 48,
              fontFamily: 'Lora',
              color: '#D4AF37',
              marginTop: 10,
              opacity: 0.9,
            }}
          >
            Imperial Senate
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: 'Marcellus',
          data: marcellusFont,
          style: 'normal',
          weight: 400,
        },
        {
          name: 'Lora',
          data: loraFont,
          style: 'normal',
          weight: 400,
        },
      ],
    }
  )
}
