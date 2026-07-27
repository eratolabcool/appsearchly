import { githubConnector } from './github';
import { hackerNewsConnector } from './hackernews';
import { productHuntConnector } from './producthunt';
import { rssConnector } from './rss';
import type { ToolSourceConnector } from './types';

export { type RawTool, type ToolSourceConnector } from './types';

export function connectorFor(type: string): ToolSourceConnector | null {
  switch (type) {
    case 'product_hunt':
      return productHuntConnector;
    case 'github':
      return githubConnector;
    case 'hacker_news':
      return hackerNewsConnector;
    case 'rss':
    case 'ai_directory':
    case 'manual_import':
      return rssConnector;
    default:
      return null;
  }
}
