#!/usr/bin/env node
/**
 * GEB 文档一致性检查工具
 * 检查 L1/L2/L3 文档与代码是否保持同构
 *
 * 使用方法: node scripts/check-docs.js
 */

import { readFileSync, readdirSync, existsSync } from 'fs';
import { join } from 'path';

const ROOT = process.cwd();

// L1 检查: CLAUDE.md 是否存在且有效
function checkL1() {
  const l1Path = join(ROOT, 'CLAUDE.md');
  if (!existsSync(l1Path)) {
    console.error('❌ L1 缺失: CLAUDE.md 不存在');
    return false;
  }
  console.log('✅ L1 存在: CLAUDE.md');
  return true;
}

// L2 检查: 主要模块目录是否有 CLAUDE.md
const L2_DIRS = ['src/components', 'src/routes', 'src/lib', 'src/services'];

function checkL2() {
  let allPassed = true;
  for (const dir of L2_DIRS) {
    const l2Path = join(ROOT, dir, 'CLAUDE.md');
    if (!existsSync(l2Path)) {
      console.error(`❌ L2 缺失: ${dir}/CLAUDE.md 不存在`);
      allPassed = false;
    } else {
      console.log(`✅ L2 存在: ${dir}/CLAUDE.md`);
    }
  }
  return allPassed;
}

// L3 检查: 关键文件是否有头部注释
const L3_FILES = [
  'src/routes/+page.svelte',
  'src/components/AppCard.svelte',
  'src/components/AppSearch.svelte',
  'src/routes/api/search/+server.ts'
];

const L3_PATTERN = /\/\*\*[\s\S]*?\[INPUT\]:[\s\S]*?\[OUTPUT\]:[\s\S]*?\[POS\]:[\s\S]*?\[PROTOCOL\]:/;

function checkL3() {
  let allPassed = true;
  for (const file of L3_FILES) {
    const filePath = join(ROOT, file);
    if (!existsSync(filePath)) {
      console.warn(`⚠️  L3 跳过: ${file} 不存在`);
      continue;
    }
    const content = readFileSync(filePath, 'utf-8');
    if (!L3_PATTERN.test(content)) {
      console.error(`❌ L3 缺失: ${file} 缺少头部注释`);
      allPassed = false;
    } else {
      console.log(`✅ L3 存在: ${file}`);
    }
  }
  return allPassed;
}

// 主检查流程
console.log('🔍 开始 GEB 文档一致性检查...\n');

const l1Ok = checkL1();
console.log('');
const l2Ok = checkL2();
console.log('');
const l3Ok = checkL3();
console.log('');

if (l1Ok && l2Ok && l3Ok) {
  console.log('✅ 所有检查通过! 文档与代码保持同构');
  process.exit(0);
} else {
  console.error('❌ 检查失败! 文档与代码不同构');
  process.exit(1);
}
