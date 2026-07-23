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
        HYPERDRIVE?: HyperdriveBinding;
      };
      context?: {
        waitUntil(promise: Promise<unknown>): void;
        passThroughOnException(): void;
      };
      caches?: CacheStorage;
    }
  }
}

export {};
