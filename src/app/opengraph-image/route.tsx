import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const baseUrl = `${url.protocol}//${url.host}`;
    
    // Load eightbit font from public directory
    const eightbitFont = await fetch(`${baseUrl}/ColorBasic.otf`)
      .then((res) => res.ok ? res.arrayBuffer() : null)
      .catch(() => null);

    // Build fonts array
    const fonts: Array<{ name: string; data: ArrayBuffer; style: 'normal' | 'italic' }> = [];
    if (eightbitFont) {
      fonts.push({ name: 'eightbit', data: eightbitFont, style: 'normal' as const });
    }

    return new ImageResponse(
      (
        <div
          style={{
            background: 'linear-gradient(to bottom right, #000000, #0a0a0a)',
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '80px',
            color: 'white',
            fontFamily: 'eightbit',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              gap: '20px',
            }}
          >
            {/* Main title */}
            <div
              style={{
                fontSize: 96,
                fontWeight: 'bold',
                lineHeight: '1.2',
                color: '#10b981', // green-500
                letterSpacing: '2px',
              }}
            >
              MXJXN is Max Jackson
            </div>
            
            {/* Subtitle */}
            <div
              style={{
                fontSize: 48,
                fontWeight: 'normal',
                lineHeight: '1.4',
                color: '#94a3b8', // slate-400
                letterSpacing: '1px',
                display: 'flex',
                flexDirection: 'row',
                gap: '12px',
                alignItems: 'center',
              }}
            >
              <span style={{ color: '#14b8a6' }}>artist</span>
              <span style={{ color: '#64748b' }}>•</span>
              <span style={{ color: '#06b6d4' }}>developer</span>
              <span style={{ color: '#64748b' }}>•</span>
              <span style={{ color: '#a855f7' }}>musician</span>
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
        fonts: fonts.length > 0 ? fonts : undefined,
        headers: {
          'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate',
        },
      }
    );
  } catch (error) {
    console.error(`[OG Image] Fatal error in homepage OG image route:`, error);
    if (error instanceof Error) {
      console.error(`[OG Image] Error stack:`, error.stack);
    }
    
    // Return a fallback image on any error
    const url = new URL(request.url);
    const baseUrl = `${url.protocol}//${url.host}`;
    const fallbackFont = await fetch(`${baseUrl}/ColorBasic.otf`)
      .then((res) => res.ok ? res.arrayBuffer() : null)
      .catch(() => null);
    
    const fallbackFonts: Array<{ name: string; data: ArrayBuffer; style: 'normal' | 'italic' }> = [];
    if (fallbackFont) {
      fallbackFonts.push({ name: 'eightbit', data: fallbackFont, style: 'normal' as const });
    }
    
    return new ImageResponse(
      (
        <div
          style={{
            background: 'linear-gradient(to bottom right, #000000, #1a1a1a)',
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '80px',
            color: 'white',
            fontFamily: 'eightbit',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              gap: '20px',
            }}
          >
            <div
              style={{
                fontSize: 96,
                fontWeight: 'bold',
                lineHeight: '1.2',
                color: '#10b981',
                letterSpacing: '2px',
              }}
            >
              MXJXN is Max Jackson
            </div>
            <div
              style={{
                fontSize: 48,
                fontWeight: 'normal',
                lineHeight: '1.4',
                color: '#94a3b8',
                letterSpacing: '1px',
              }}
            >
              artist • developer • musician
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
        fonts: fallbackFonts.length > 0 ? fallbackFonts : undefined,
        headers: {
          'Cache-Control': 'public, max-age=300, s-maxage=300',
        },
      }
    );
  }
}












