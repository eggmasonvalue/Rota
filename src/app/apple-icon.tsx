import { ImageResponse } from 'next/og'

// Route segment config
export const runtime = 'edge'

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
          fontSize: 120,
          background: '#66023C',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#D4AF37',
          borderRadius: '20%', // Apple icons usually have rounded corners, but iOS applies mask. PWA maskable icons should be square?
          // Apple touch icon is usually square, iOS adds effects.
          // But let's just make it full square with background.
          // border: '4px solid #D4AF37',
        }}
      >
        <div style={{
            position: 'absolute',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            borderRadius: '0',
            border: '8px solid #D4AF37',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
        }}>
           R
        </div>
      </div>
    ),
    // ImageResponse options
    {
      // For convenience, we can re-use the exported icons size metadata
      // config to also set the ImageResponse's width and height.
      ...size,
    }
  )
}
