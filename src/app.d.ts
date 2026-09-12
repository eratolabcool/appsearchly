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

    // 最小接口：仅声明 cron 中用到的 run 方法，避免引入 workers-types 依赖
    interface WorkersAIBinding {
      run(model: string, input: unknown): Promise<unknown>;
    }

    interface Platform {
      env?: {
        APP_ENV?: 'development' | 'preview' | 'production';
        DATA_SOURCE_MODE?: 'legacy' | 'dual' | 'postgres';
        ADMIN_API_TOKEN?: string;
        TURNSTILE_SECRET_KEY?: string;
        PUBLIC_TURNSTILE_SITE_KEY?: string;
        PUBLIC_SITE_URL?: string;
        AI_EXTRACTOR_ENDPOINT?: string;
        AI_EXTRACTOR_API_KEY?: string;
        LARK_WEBHOOK_URL?: string;
        AUTO_APPROVE_MIN_SCORE?: string;
        PENDING_ALERT_THRESHOLD?: string;
        AUTO_APPROVE_MAX_PER_DAY?: string;
        ARTICLE_MODEL?: string;
        ARTICLE_TOP_N?: string;
        AI?: WorkersAIBinding;
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
