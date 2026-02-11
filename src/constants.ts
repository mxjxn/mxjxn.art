const MUSEV2_ADDRESS = "0xf806084aAa167c5B6ad9827BFDBd15E754C6d415";

// App configuration for mini-app
const getBaseUrl = (): string => {
  // Only access window during client-side execution
  if (typeof window !== 'undefined') {
    const url = window.location.origin;
    return url.endsWith('/') ? url.slice(0, -1) : url;
  }
  // Server-side: use environment variable or default
  const url = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';
  return url.endsWith('/') ? url.slice(0, -1) : url;
};

export const APP_URL: string = getBaseUrl();
export const ANALYTICS_ENABLED: boolean = true;
export const RETURN_URL: string | undefined = undefined;

// Mini-app manifest constants
export const APP_NAME: string = 'MXJXN';
export const APP_DESCRIPTION: string = 'Art by Max Jackson. Artist, developer, and musician exploring forms between dimensions.';
export const APP_SUBTITLE: string = 'Art by Max Jackson';
export const APP_TAGLINE: string = 'artist • developer • musician';
export const APP_PRIMARY_CATEGORY: string = 'art-creativity';
export const APP_TAGS: string[] = ['art', 'nft', 'cryptoart', 'music', 'creative'];
export const APP_ICON_URL: string = `${APP_URL}/icon.png`;
export const APP_OG_IMAGE_URL: string = `${APP_URL}/opengraph-image`;
export const APP_SPLASH_BACKGROUND_COLOR: string = '#000000';

export { MUSEV2_ADDRESS };