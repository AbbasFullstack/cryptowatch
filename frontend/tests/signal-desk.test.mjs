import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const page = readFileSync(new URL('../app/page.tsx', import.meta.url), 'utf8');
const styles = readFileSync(new URL('../app/globals.css', import.meta.url), 'utf8');
const layout = readFileSync(new URL('../app/layout.tsx', import.meta.url), 'utf8');

test('Signal Desk retains market-data and non-advisory positioning', () => {
  assert.match(page, /Not trading, custody, or investment advice/);
  assert.match(page, /Movement labels describe current data; they are not recommendations/);
  assert.doesNotMatch(page, /Buy now|Guaranteed return|Trading signal/);
});

test('Signal Desk includes searchable, sortable, and resilient market behavior', () => {
  assert.match(page, /Search loaded assets by name or ticker/);
  assert.match(page, /Top mover/);
  assert.match(page, /Reconnecting/);
  assert.match(page, /Math\.min\(1000 \* 2 \*\* attempts, 16000\)/);
});

test('Signal Desk carries motion accessibility and project-specific metadata', () => {
  assert.match(styles, /prefers-reduced-motion: reduce/);
  assert.match(layout, /CryptoWatch Signal Desk/);
  assert.doesNotMatch(layout, /Create Next App/);
});
