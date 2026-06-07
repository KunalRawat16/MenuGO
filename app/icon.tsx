import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'MenuGO';
export const size = {
  width: 32,
  height: 32,
};
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 14,
          background: 'linear-gradient(135deg, #22c55e 0%, #10b981 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          borderRadius: '8px',
          fontWeight: 900,
          fontFamily: 'sans-serif',
        }}
      >
        MG
      </div>
    ),
    {
      ...size,
    }
  );
}
