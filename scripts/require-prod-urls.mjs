/**
 * Release gate. A store release must carry non-empty https/wss endpoints.
 * MB_RELEASE_CLEARTEXT=true allows an isolated test artifact (http/ws) and nothing else.
 *
 * Reads process env, then android/prod-endpoints.properties for any name still unset.
 * Exit 0 prints the accepted endpoints. Any other exit refuses the release build.
 */
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const propsFile = path.join(root, 'android', 'prod-endpoints.properties');

function loadProps(file) {
  if (!existsSync(file)) return {};
  const out = {};
  for (const line of readFileSync(file, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq <= 0) continue;
    out[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim();
  }
  return out;
}

const props = loadProps(propsFile);
const read = (name) => {
  const fromEnv = process.env[name];
  if (fromEnv != null && fromEnv.trim() !== '') return fromEnv.trim();
  return (props[name] ?? '').trim();
};

const api = read('MB_PROD_API_BASE_URL');
const ws = read('MB_PROD_WS_BASE_URL');
const cleartext = read('MB_RELEASE_CLEARTEXT') === 'true';

const PLACEHOLDERS = ['api.mineralbridge.com', 'example.com', 'localhost', '10.0.2.2', '127.0.0.1'];

function hostOf(url) {
  const m = /^[a-z][a-z0-9+.-]*:\/\/([^/?#]+)/i.exec(url);
  if (!m) return '';
  return m[1].replace(/^.*@/, '').replace(/:\d+$/, '').toLowerCase();
}

function isPlaceholder(host) {
  return PLACEHOLDERS.some((p) => host === p || host.endsWith(`.${p}`));
}

const failures = [];
if (!api) failures.push('MB_PROD_API_BASE_URL is empty. Set it to the deployed https://<host>/v2 URL.');
if (!ws) failures.push('MB_PROD_WS_BASE_URL is empty. Set it to the deployed wss://<host> origin.');

if (cleartext) {
  if (api && !/^https?:\/\/.+/i.test(api)) failures.push('MB_RELEASE_CLEARTEXT requires MB_PROD_API_BASE_URL to be an absolute http(s) URL.');
  if (api && !/\/v2\/?$/i.test(api.split('?')[0])) failures.push('MB_PROD_API_BASE_URL must end with /v2.');
  if (ws && !/^wss?:\/\/.+/i.test(ws)) failures.push('MB_RELEASE_CLEARTEXT requires MB_PROD_WS_BASE_URL to be an absolute ws(s) origin.');
  if (ws && /\/v\d/i.test(ws)) failures.push('MB_PROD_WS_BASE_URL must be an origin only (no /v1 or /v2 path).');
} else {
  if (api && !/^https:\/\/.+/i.test(api)) failures.push('Store release MB_PROD_API_BASE_URL must start with https://.');
  if (api && !/\/v2\/?$/i.test(api.split('?')[0])) failures.push('MB_PROD_API_BASE_URL must end with /v2.');
  if (ws && !/^wss:\/\/.+/i.test(ws)) failures.push('Store release MB_PROD_WS_BASE_URL must start with wss://.');
  if (ws && /\/v\d/i.test(ws)) failures.push('MB_PROD_WS_BASE_URL must be an origin only (no /v1 or /v2 path).');
  for (const [label, url] of [['MB_PROD_API_BASE_URL', api], ['MB_PROD_WS_BASE_URL', ws]]) {
    if (!url) continue;
    const host = hostOf(url);
    if (!host || isPlaceholder(host)) {
      failures.push(`${label} host "${host || '(missing)'}" is a placeholder. Use the real deployed host.`);
    }
  }
}

if (failures.length) {
  console.error('Refusing to build a release with empty or invalid production endpoints:');
  for (const line of failures) console.error(`- ${line}`);
  console.error(cleartext
    ? 'MB_RELEASE_CLEARTEXT=true is only for an isolated test artifact.'
    : 'Leave MB_RELEASE_CLEARTEXT unset for a store release. Put the URLs in the environment or android/prod-endpoints.properties.');
  process.exit(2);
}

console.log(cleartext
  ? `ISOLATED TEST RELEASE (not a store build)\nAPI ${api}\nWS  ${ws}`
  : `STORE RELEASE ENDPOINTS\nAPI ${api}\nWS  ${ws}`);
