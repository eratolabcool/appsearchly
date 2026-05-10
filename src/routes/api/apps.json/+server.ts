/**
 * [INPUT]: 依赖 @sveltejs/kit, @sveltejs/kit, fs, path
 * [OUTPUT]: 对外提供 GET
 * [POS]: src/routes/api/apps.json/+server 的工具模块
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { readFileSync } from 'fs';
import { join } from 'path';

export const GET: RequestHandler = async () => {
  try {
    // 读取 apps.json 文件
    const appsPath = join(process.cwd(), 'data', 'apps.json');
    const fileContent = readFileSync(appsPath, 'utf-8');
    const apps = JSON.parse(fileContent);

    return json(apps, {
      headers: {
        'Cache-Control': 'public, max-age=3600', // 缓存1小时
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error reading apps.json:', error);
    return json(
      { error: 'Failed to load apps data' },
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
};