/**
 * Inlines MB_PROD_API_BASE_URL, MB_PROD_WS_BASE_URL and MB_RELEASE_CLEARTEXT
 * as string literals. A release bundle therefore contains the URLs supplied to
 * that build. An empty value stays empty and the Android release task refuses
 * to package it (scripts/require-prod-urls.mjs).
 */
function inlineMbProdUrls({ types: t }) {
  const values = {
    MB_PROD_API_BASE_URL: process.env.MB_PROD_API_BASE_URL ?? '',
    MB_PROD_WS_BASE_URL: process.env.MB_PROD_WS_BASE_URL ?? '',
    MB_RELEASE_CLEARTEXT: process.env.MB_RELEASE_CLEARTEXT ?? '',
  };
  return {
    name: 'inline-mb-prod-urls',
    visitor: {
      Identifier(path) {
        const name = path.node.name;
        if (!Object.prototype.hasOwnProperty.call(values, name)) return;
        const parent = path.parent;
        if (!parent) return;
        if (parent.type === 'TSTypeReference' || parent.type === 'TSTypeQuery') return;
        if (parent.type === 'VariableDeclarator' && parent.id === path.node) return;
        if (parent.type === 'FunctionDeclaration' && parent.id === path.node) return;
        path.replaceWith(t.stringLiteral(values[name]));
      },
    },
  };
}

module.exports = function babelConfig(api) {
  api.cache.using(() =>
    [
      process.env.MB_PROD_API_BASE_URL ?? '',
      process.env.MB_PROD_WS_BASE_URL ?? '',
      process.env.MB_RELEASE_CLEARTEXT ?? '',
    ].join('\n'),
  );
  return {
    presets: ['module:@react-native/babel-preset'],
    plugins: [inlineMbProdUrls],
  };
};
