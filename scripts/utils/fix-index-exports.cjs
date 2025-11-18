const fs = require('fs');
const path = require('path');

const sdkJs =
  process.env['DIST_PATH'] ?
    path.resolve(process.env['DIST_PATH'], 'sdk.js')
  : path.resolve(__dirname, '..', '..', 'dist', 'sdk.js');

let before = fs.readFileSync(sdkJs, 'utf8');
let after = before.replace(
  /^\s*exports\.default\s*=\s*(\w+)/m,
  'exports = module.exports = $1;\nexports.default = $1',
);
fs.writeFileSync(sdkJs, after, 'utf8');
