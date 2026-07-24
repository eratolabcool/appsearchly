declare global {
  namespace App {
    interface HyperdriveBinding {
      connectionString: string;
      host: string;
      port: number;
      user: string;
      password: string;
      database: string;
    }

    interface Platform {
      env?: {
        APP_ENV?: 'development' | 'preview' | 'production';
        DATA_SOURCE_MODE?: 'legacy' | 'dual' | 'postgres';
        ADMIN_API_TOKEN?: string;
        TURNSTILE_SECRET_KEY?: string;
        PUBLIC_TURNSTILE_SITE_KEY?: string;
        HYPERDRIVE?: HyperdriveBinding;
        ASSETS?: Fetcher;
      };
      context?: ExecutionContext;
      caches?: CacheStorage;
    }
  }

  interface Window {
    turnstile?: {
      render(container: HTMLElement, options: {
        sitekey: string;
        callback: (token: string) => void;
        'expired-callback': () => void;
        'error-callback': () => void;
      }): string;
      reset(widgetId?: string): void;
    };
  }
}

export {};
