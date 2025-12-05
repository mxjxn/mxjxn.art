const MUSEV2_ADDRESS = "0xf806084aAa167c5B6ad9827BFDBd15E754C6d415";

// App configuration for mini-app
const getBaseUrl = (): string => {
  const url = process.env.NEXT_PUBLIC_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
  return url.endsWith('/') ? url.slice(0, -1) : url;
};

export const APP_URL: string = getBaseUrl();
export const ANALYTICS_ENABLED: boolean = true;
export const RETURN_URL: string | undefined = undefined;

export { MUSEV2_ADDRESS };