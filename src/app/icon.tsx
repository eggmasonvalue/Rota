import { ImageResponse } from 'next/og';

// Route segment config
export const runtime = 'nodejs'; // Use Node.js runtime to avoid Edge limitations

// Image metadata
export const size = {
  width: 32,
  height: 32,
};
export const contentType = 'image/png';

// Image generation
export default function Icon() {
  return new ImageResponse(
    (
      // ImageResponse JSX element
      <div
        style={{
          fontSize: 24,
          background: '#2C241B', // Dark Earth
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          borderRadius: '50%',
          border: '2px solid #8C8A6B', // Light Olive
          position: 'relative',
        }}
      >
        {/* Wheel spokes */}
        <div style={{ position: 'absolute', width: '2px', height: '100%', background: '#8C8A6B' }} />
        <div style={{ position: 'absolute', width: '100%', height: '2px', background: '#8C8A6B' }} />
        <div style={{ position: 'absolute', width: '2px', height: '100%', background: '#8C8A6B', transform: 'rotate(45deg)' }} />
        <div style={{ position: 'absolute', width: '2px', height: '100%', background: '#8C8A6B', transform: 'rotate(-45deg)' }} />

        {/* Decorative Dots on rim (Orthogonal) */}
        <div style={{ position: 'absolute', top: '-3px', width: '6px', height: '6px', borderRadius: '50%', background: '#8C8A6B' }} />
        <div style={{ position: 'absolute', bottom: '-3px', width: '6px', height: '6px', borderRadius: '50%', background: '#8C8A6B' }} />
        <div style={{ position: 'absolute', left: '-3px', width: '6px', height: '6px', borderRadius: '50%', background: '#8C8A6B' }} />
        <div style={{ position: 'absolute', right: '-3px', width: '6px', height: '6px', borderRadius: '50%', background: '#8C8A6B' }} />

        {/* Decorative Dots on rim (Diagonal) */}
        <div style={{ position: 'absolute', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: 'rotate(45deg)' }}>
            <div style={{ position: 'absolute', top: '-3px', width: '6px', height: '6px', borderRadius: '50%', background: '#8C8A6B' }} />
            <div style={{ position: 'absolute', bottom: '-3px', width: '6px', height: '6px', borderRadius: '50%', background: '#8C8A6B' }} />
            <div style={{ position: 'absolute', left: '-3px', width: '6px', height: '6px', borderRadius: '50%', background: '#8C8A6B' }} />
            <div style={{ position: 'absolute', right: '-3px', width: '6px', height: '6px', borderRadius: '50%', background: '#8C8A6B' }} />
        </div>

        {/* Center piece */}
        <div style={{
            position: 'absolute',
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            background: '#C24538', // Pompeii Red
            border: '1.5px solid #8C8A6B',
        }} />
      </div>
    ),
    // ImageResponse options
    {
      ...size,
    }
  );
}
