'use strict';
const fs = require('fs');
const engine = require('./engine.js');
const cases = JSON.parse(fs.readFileSync(__dirname + '/expected.json', 'utf8'));
let pass = 0, fail = 0;
function eq(a, b) {
  if (typeof a === 'number' && typeof b === 'number') return a === b;
  return JSON.stringify(a) === JSON.stringify(b);
}
for (const c of cases) {
  const fn = engine[c.card];
  if (c.error) {
    try { fn(...c.args); fail++; console.log('FAIL expected error', c.card, c.args); }
    catch (e) { if (e.message.includes(c.error)) pass++; else { fail++; console.log('FAIL wrong error', c.card, c.args, '->', e.message); } }
    continue;
  }
  let got;
  try { got = fn(...c.args); } catch (e) { fail++; console.log('FAIL threw', c.card, c.args, e.message); continue; }
  for (const k of Object.keys(c.expect)) {
    if (eq(got[k], c.expect[k])) pass++;
    else { fail++; console.log('FAIL', c.card, JSON.stringify(c.args), k, 'expected', JSON.stringify(c.expect[k]), 'got', JSON.stringify(got[k])); }
  }
}
console.log(pass + ' checks green, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
