/**
 * [INPUT]: 无运行时依赖
 * [OUTPUT]: 对外提供 normalizeEntityKey/normalizeTitle/slugifyTitle，及 parseReleaseDate/daysSince/formatAgeLabel 日期工具
 * [POS]: src/lib/server/radar 的实体归并与日期归一化基础层，被 score/sources/pipeline 消费
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

// ==================== 实体归并 ====================

/** 信号分组键：小写、非字母数字折叠为空格、截断 64 字符 */
export function normalizeEntityKey(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .slice(0, 64);
}

/** 规范化标题：NFKD 去音标、分隔符转空格、去标点、压缩空白 */
export function normalizeTitle(rawTitle: string): string {
  if (!rawTitle) return '';
  return rawTitle
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[:\-–—_]/g, ' ')
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function slugifyTitle(title: string): string {
  const norm = normalizeTitle(title);
  return norm.replace(/\s+/g, '-').slice(0, 64) || 'game';
}

// ==================== 日期归一化 ====================

const MONTHS: Record<string, string> = {
  jan: '01', january: '01', feb: '02', february: '02', mar: '03', march: '03',
  apr: '04', april: '04', may: '05', jun: '06', june: '06', jul: '07', july: '07',
  aug: '08', august: '08', sep: '09', sept: '09', september: '09', oct: '10',
  october: '10', nov: '11', november: '11', dec: '12', december: '12'
};

/** 解析 Steam "26 Feb, 2025" / ISO / 常见变体 → YYYY-MM-DD（避免时区日偏移） */
export function parseReleaseDate(input?: string | null): string | undefined {
  if (!input?.trim()) return undefined;
  const raw = input.trim();

  const iso = raw.match(/^(\d{4}-\d{2}-\d{2})/);
  if (iso) return iso[1];

  const dmy = raw.match(/^(\d{1,2})\s+([A-Za-z]+)[.,]?\s+(\d{4})$/);
  if (dmy) {
    const month = MONTHS[dmy[2].toLowerCase()];
    if (month) return `${dmy[3]}-${month}-${dmy[1].padStart(2, '0')}`;
  }

  const mdy = raw.match(/^([A-Za-z]+)\s+(\d{1,2})[.,]?\s+(\d{4})$/);
  if (mdy) {
    const month = MONTHS[mdy[1].toLowerCase()];
    if (month) return `${mdy[3]}-${month}-${mdy[2].padStart(2, '0')}`;
  }

  const parsed = new Date(raw);
  if (!Number.isNaN(parsed.getTime())) {
    const y = parsed.getFullYear();
    const m = String(parsed.getMonth() + 1).padStart(2, '0');
    const d = String(parsed.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  return undefined;
}

export function daysSince(isoDate?: string, now = new Date()): number | undefined {
  if (!isoDate) return undefined;
  const then = new Date(`${isoDate}T00:00:00.000Z`);
  if (Number.isNaN(then.getTime())) return undefined;
  return Math.floor((now.getTime() - then.getTime()) / 86_400_000);
}

export function formatAgeLabel(days?: number, comingSoon?: boolean): string | undefined {
  if (comingSoon) return 'Coming soon';
  if (typeof days !== 'number') return undefined;
  if (days < 0) return `Launches in ${Math.abs(days)}d`;
  if (days === 0) return 'Launched today';
  if (days < 30) return `${days}d old`;
  if (days < 365) return `${Math.max(1, Math.round(days / 30))}mo old`;
  return `${(days / 365).toFixed(1).replace(/\.0$/, '')}y old`;
}
