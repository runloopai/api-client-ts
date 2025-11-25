const fs = require('fs');
const path = require('path');

const sdkJs =
  process.env['DIST_PATH'] ?
    path.resolve(process.env['DIST_PATH'], 'sdk.js')
  : path.resolve(__dirname, '..', '..', 'dist', 'sdk.js');

let before = fs.readFileSync(sdkJs, 'utf8');
// Match exports.default = <anything> and preserve all existing exports
// by ensuring module.exports points to the exports object instead of replacing it
let after = before.replace(
  /^\s*exports\.default\s*=\s*([^;]+);/m,
  'module.exports = exports;\nexports.default = $1;',
);
fs.writeFileSync(sdkJs, after, 'utf8');
