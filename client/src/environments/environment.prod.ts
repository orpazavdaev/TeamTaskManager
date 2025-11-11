// Vercel will replace process.env['NG_APP_API_URL'] at build time
// We need to safely access process.env to avoid "process is not defined" error
// This works because Vercel replaces the value during build, but we need a runtime check
declare const process:
  | {
      env: {
        [key: string]: string | undefined;
      };
    }
  | undefined;

const getApiUrl = (): string => {
  // Check if process exists (it won't in browser, but Vercel replaces this at build time)
  try {
    if (typeof process !== 'undefined' && process.env && process.env['NG_APP_API_URL']) {
      return process.env['NG_APP_API_URL'];
    }
  } catch (e) {
    // process is not defined in browser - this is expected
  }
  // Fallback - replace this with your actual Render URL
  return 'https://YOUR_RENDER_URL.onrender.com';
};

export const environment = {
  production: true,
  apiUrl: getApiUrl(),
};
