import { ImageResponse } from 'next/og';

// Route segment config
export const runtime = 'nodejs';

// Image metadata
export const size = {
  width: 180,
  height: 180,
};
export const contentType = 'image/png';

// Image generation
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#2C241B', // Dark Earth
          borderRadius: '22%', // Apple icon shape
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Outer Ring */}
        <div style={{
             position: 'absolute',
             width: '140px',
             height: '140px',
             borderRadius: '50%',
             border: '8px solid #8C8A6B', // Light Olive
        }} />

        {/* Spokes */}
        <div style={{ position: 'absolute', width: '140px', height: '140px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ position: 'absolute', width: '4px', height: '100%', background: '#8C8A6B' }} />
            <div style={{ position: 'absolute', width: '100%', height: '4px', background: '#8C8A6B' }} />
            <div style={{ position: 'absolute', width: '4px', height: '100%', background: '#8C8A6B', transform: 'rotate(45deg)' }} />
            <div style={{ position: 'absolute', width: '4px', height: '100%', background: '#8C8A6B', transform: 'rotate(-45deg)' }} />
        </div>

        {/* Pieces (Decorative) */}
        <div style={{ position: 'absolute', width: '140px', height: '140px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
             {/* Center */}
            <div style={{
                position: 'absolute',
                top: '50%', left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '30px', height: '30px',
                borderRadius: '50%',
                background: '#C24538', // Pompeii Red
                border: '4px solid #8C8A6B',
                zIndex: 10
            }} />

            {/* Cardinal Points */}
            <div style={{ position: 'absolute', top: '-6px', width: '12px', height: '12px', borderRadius: '50%', background: '#8C8A6B' }} />
            <div style={{ position: 'absolute', bottom: '-6px', width: '12px', height: '12px', borderRadius: '50%', background: '#8C8A6B' }} />
            <div style={{ position: 'absolute', left: '-6px', width: '12px', height: '12px', borderRadius: '50%', background: '#8C8A6B' }} />
            <div style={{ position: 'absolute', right: '-6px', width: '12px', height: '12px', borderRadius: '50%', background: '#8C8A6B' }} />
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
