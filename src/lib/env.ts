
// Environment configuration - secure access to configuration values
// Note: In Lovable, environment variables are managed through project settings

interface AppConfig {
  supabase: {
    url: string;
    anonKey: string;
  };
  app: {
    name: string;
    version: string;
  };
}

// Configuration values - these are set at build time
export const config: AppConfig = {
  supabase: {
    url: 'https://bmopoxksyvamiewogvrj.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJtb3BveGtzeXZhbWlld29ndnJqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg0ODgwODYsImV4cCI6MjA2NDA2NDA4Nn0.Ino_wm7nUx7aTZ5WamENnW79Qny6bhNokRIoZ2CBwX8',
  },
  app: {
    name: 'PortRider',
    version: '1.0.0',
  },
};

// Validate configuration on app start
export function validateConfig(): void {
  if (!config.supabase.url || !config.supabase.anonKey) {
    throw new Error('Missing required Supabase configuration');
  }

  // Log configuration status (without sensitive data)
  console.log('App configuration loaded:', {
    supabaseConfigured: !!config.supabase.url,
    appName: config.app.name,
    appVersion: config.app.version,
  });
}

// Call validation on import
validateConfig();
