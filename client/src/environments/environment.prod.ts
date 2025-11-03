// Vercel will replace process.env['NG_APP_API_URL'] at build time
declare const process: {
  env: {
    [key: string]: string | undefined;
  };
};

export const environment = {
  production: true,
  apiUrl: (process.env as any)['NG_APP_API_URL'] || 'https://YOUR_RAILWAY_URL.railway.app',
};
