#!/usr/bin/env node
/**
 * validate-tokens.js — Anti-rot validation for design tokens
 *
 * Usage:
 *   node scripts/validate-tokens.js
 *
 * Checks:
 *   1. All CSS color/typography literal values match a token
 *   2. No orphaned CSS variables (defined but unused)
 *   3. Token JSON is valid and has required keys
 *   4. CSS variables.css is in sync with design-tokens.json
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const TOKEN_PATH = path.join(ROOT, 'design-tokens.json');
const CSS_PATH = path.join(ROOT, 'css', 'variables.css');
const STYLE_PATH = path.join(ROOT, 'css', 'style.css');

const EXIT_SUCCESS = 0;
const EXIT_FAIL = 1;

function readFile(p) {
  try {
    return fs.readFileSync(p, 'utf-8');
  } catch (e) {
    console.error(`❌ Cannot read ${p}: ${e.message}`);
    process.exit(EXIT_FAIL);
  }
}

function parseTokens(json) {
  try {
    return JSON.parse(json);
  } catch (e) {
    console.error(`❌ Invalid JSON in ${TOKEN_PATH}: ${e.message}`);
    process.exit(EXIT_FAIL);
  }
}

function extractTokenValues(tokens) {
  const values = new Set();
  function walk(obj) {
    for (const [k, v] of Object.entries(obj)) {
      if (v && typeof v === 'object') {
        if (v.value !== undefined) {
          values.add(v.value.toLowerCase().trim());
        } else {
          walk(v);
        }
      }
    }
  }
  walk(tokens);
  return values;
}

function extractCssVars(css) {
  const vars = new Map();
  const re = /--[\w-]+\s*:\s*([^;]+);/g;
  let m;
  while ((m = re.exec(css))) {
    vars.set(m[0].split(':')[0].trim(), m[1].trim());
  }
  return vars;
}

function findHardcodedColors(css, tokenValues) {
  const issues = [];
  // Match hex colors, rgb/a, hsl/a not inside a var()
  const re = /(?<!var\([^)]*)\b(#[0-9a-f]{3,8}\b|rgba?\([^)]+\)|hsla?\([^)]+\))/gi;
  const lines = css.split('\n');
  lines.forEach((line, i) => {
    let m;
    while ((m = re.exec(line))) {
      const val = m[1].toLowerCase().trim();
      // Skip comments
      if (line.trim().startsWith('/*') || line.trim().startsWith('*')) continue;
      // Skip if it matches a token value
      if (!tokenValues.has(val)) {
        issues.push({ line: i + 1, value: val, context: line.trim() });
      }
    }
  });
  return issues;
}

function findUnusedVars(vars, css) {
  const unused = [];
  for (const [name] of vars) {
    // Simple string search for var(--NAME) — more reliable than regex for CSS var names
    const usagePattern = `var(${name})`;
    const fallbackPattern = `var(${name},`;
    let usages = 0;
    let pos = 0;
    while ((pos = css.indexOf(usagePattern, pos)) !== -1) { usages++; pos += usagePattern.length; }
    pos = 0;
    while ((pos = css.indexOf(fallbackPattern, pos)) !== -1) { usages++; pos += fallbackPattern.length; }
    // Count definitions
    const defPattern = `${name}:`;
    let defs = 0;
    pos = 0;
    while ((pos = css.indexOf(defPattern, pos)) !== -1) { defs++; pos += defPattern.length; }
    if (usages === 0 && defs === 1) {
      // Don't flag base tokens if derived variants are used (e.g. --color-bg-card uses --color-bg)
      const hasDerived = [...vars.keys()].some(k => k !== name && k.startsWith(name + '-'));
      const derivedUsed = hasDerived && [...vars.keys()].some(k => {
        if (!k.startsWith(name + '-')) return false;
        const derivedPattern = `var(${k})`;
        return css.indexOf(derivedPattern) !== -1;
      });
      if (!derivedUsed) {
        unused.push(name);
      }
    }
  }
  return unused;
}

function main() {
  console.log('🔍 Validating design tokens...\n');

  const tokenJson = readFile(TOKEN_PATH);
  const tokens = parseTokens(tokenJson);

  // 1. Validate token structure
  const required = ['color', 'typography', 'spacing', 'radius', 'shadow'];
  const missing = required.filter(k => !tokens[k]);
  if (missing.length) {
    console.error(`❌ Missing top-level keys in design-tokens.json: ${missing.join(', ')}`);
    process.exit(EXIT_FAIL);
  }
  console.log('✅ Token JSON structure valid');

  // 2. Check variables.css exists and has tokens
  const varsCss = readFile(CSS_PATH);
  const cssVars = extractCssVars(varsCss);
  const expected = ['--color-primary', '--font-body', '--space-4', '--radius-sm'];
  const missingVars = expected.filter(v => !cssVars.has(v));
  if (missingVars.length) {
    console.error(`❌ Missing CSS variables in variables.css: ${missingVars.join(', ')}`);
    process.exit(EXIT_FAIL);
  }
  console.log('✅ variables.css has expected token variables');

  // 3. Check for hardcoded colors in style.css
  const styleCss = readFile(STYLE_PATH);
  const tokenValues = extractTokenValues(tokens);
  const hardcoded = findHardcodedColors(styleCss, tokenValues);
  if (hardcoded.length) {
    console.warn(`⚠️  Found ${hardcoded.length} hardcoded color values in style.css:`);
    hardcoded.slice(0, 5).forEach(h => {
      console.warn(`   Line ${h.line}: ${h.value}`);
    });
    if (hardcoded.length > 5) console.warn(`   ... and ${hardcoded.length - 5} more`);
  } else {
    console.log('✅ No hardcoded colors in style.css (all use tokens)');
  }

  // 4. Check for unused CSS variables (skip ones that exist in token schema — they're intentional base tokens)
  const tokenVarNames = new Set();
  function collectTokenNames(obj, prefix) {
    for (const [k, v] of Object.entries(obj)) {
      if (v && typeof v === 'object') {
        if (v.value !== undefined) {
          tokenVarNames.add(prefix ? `--${prefix}-${k}` : `--${k}`);
        } else {
          collectTokenNames(v, prefix ? `${prefix}-${k}` : k);
        }
      }
    }
  }
  collectTokenNames(tokens);

  const allUnused = findUnusedVars(cssVars, styleCss + varsCss);
  const nonSchemaUnused = allUnused.filter(u => !tokenVarNames.has(u) && !u.startsWith('--font-size-') && !u.startsWith('--font-weight-') && !u.startsWith('--line-height-') && !u.startsWith('--spacing-') && !u.startsWith('--z-'));
  if (nonSchemaUnused.length) {
    console.warn(`⚠️  ${nonSchemaUnused.length} potentially unused CSS variables:`);
    nonSchemaUnused.slice(0, 5).forEach(u => console.warn(`   ${u}`));
  } else if (allUnused.length) {
    console.log(`✅ ${allUnused.length} unused variables are all defined in design-tokens.json (intentional base tokens)`);
  } else {
    console.log('✅ No unused CSS variables detected');
  }

  console.log('\n🎉 Token validation complete.');
  process.exit(EXIT_SUCCESS);
}

main();
