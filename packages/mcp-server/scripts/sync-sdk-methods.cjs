#!/usr/bin/env node
// Rebuilds the MCP server's SDK method lists from the generated api.md.
//
// packages/mcp-server is custom code that stlc does not generate, so its method
// catalog drifts whenever SDK resources are added or removed. The MCP build runs
// this script before compiling. Suggestions and filters both consume sdkMethods.
// Pass --check to fail instead of writing when the catalog is out of date.

const fs = require('fs');
const path = require('path');

const packageDir = path.resolve(__dirname, '..');
const apiMdPath = path.resolve(packageDir, '..', '..', 'api.md');
const methodsPath = path.join(packageDir, 'src', 'methods.ts');

const METHOD_LINE =
  /<code title="(get|post|put|patch|delete|query) ([^"]+)">(client(?:\.[A-Za-z0-9_]+)+)\.<a href="[^"]*">([A-Za-z0-9_]+)<\/a>/;

function parseApiMd(text) {
  const methods = [];
  const seen = new Set();
  for (const line of text.split('\n')) {
    const match = METHOD_LINE.exec(line);
    if (!match) {
      if (line.includes('<code title=') && line.includes('client.')) {
        throw new Error(`unrecognized SDK method in api.md: ${line}`);
      }
      continue;
    }
    const [, httpMethod, httpPath, resourcePath, name] = match;
    const clientCallName = `${resourcePath}.${name}`;
    if (seen.has(clientCallName)) {
      throw new Error(`duplicate method in api.md: ${clientCallName}`);
    }
    seen.add(clientCallName);
    methods.push({
      clientCallName,
      fullyQualifiedName: clientCallName.slice('client.'.length),
      httpMethod,
      httpPath,
    });
  }
  if (methods.length === 0) {
    throw new Error(`no SDK methods found in ${apiMdPath}`);
  }
  return methods;
}

function replaceBetween(text, startMarker, endMarker, replacement, file) {
  const start = text.indexOf(startMarker);
  if (start === -1) throw new Error(`${file}: missing "${startMarker}"`);
  const bodyStart = start + startMarker.length;
  const end = text.indexOf(endMarker, bodyStart);
  if (end === -1) throw new Error(`${file}: missing "${endMarker}" after "${startMarker}"`);
  return text.slice(0, bodyStart) + replacement + text.slice(end);
}

function renderSdkMethods(methods) {
  const entries = methods.map(
    (m) =>
      `  {\n` +
      `    clientCallName: '${m.clientCallName}',\n` +
      `    fullyQualifiedName: '${m.fullyQualifiedName}',\n` +
      `    httpMethod: '${m.httpMethod}',\n` +
      `    httpPath: '${m.httpPath}',\n` +
      `  },\n`,
  );
  return '\n' + entries.join('');
}

function main() {
  const check = process.argv.includes('--check');
  const methods = parseApiMd(fs.readFileSync(apiMdPath, 'utf8'));

  const updates = [
    [
      methodsPath,
      (text) =>
        replaceBetween(
          text,
          'export const sdkMethods: SdkMethod[] = [',
          '];',
          renderSdkMethods(methods),
          methodsPath,
        ),
    ],
  ];

  let stale = false;
  for (const [file, update] of updates) {
    const current = fs.readFileSync(file, 'utf8');
    const next = update(current);
    if (next === current) continue;
    stale = true;
    if (check) {
      console.error(`${path.relative(process.cwd(), file)} is out of date with api.md`);
    } else {
      fs.writeFileSync(file, next);
      console.log(`updated ${path.relative(process.cwd(), file)}`);
    }
  }
  console.log(`${methods.length} SDK methods`);
  if (check && stale) {
    console.error('run: node packages/mcp-server/scripts/sync-sdk-methods.cjs');
    process.exit(1);
  }
}

module.exports = { parseApiMd };
if (require.main === module) main();
