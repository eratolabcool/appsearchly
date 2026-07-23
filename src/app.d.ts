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
        HYPERDRIVE?: HyperdriveBinding;
        ASSETS?: Fetcher;
      };
      context?: ExecutionContext;
      caches?: CacheStorage;
    }
  }
}

export {};
