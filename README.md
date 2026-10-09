# Badminton math

Three badminton calculators as a small static site - exact arithmetic, every borrowed
number labeled:

- **Court planner** - hall width x length -> full-size courts that fit, best orientation,
  used width and spare margin. Court 13.40 x 6.10 m (BWF doubles); clearances 1.2 m
  beside / 1.5 m behind are labeled club norms, not BWF rules.
- **Club night round robin** - players/pairs, minutes per match and courts available ->
  matches, rounds, matches per round and wall-clock time with a session band.
- **Rally score helper** - score -> points each side needs (first to 21, win by 2,
  cap 30) and the server's service box (even score right, odd left).

## Files

- `index.html` - landing page
- `app.html` - the three calculators
- `engine.js` - all arithmetic, shared by the page and the tests
- `oracle.py` - independent Python mirror of the engine; regenerates `expected.json`
- `expected.json` - 48 cases (per-card values plus error cases)
- `test.js` - runs the engine against `expected.json` (node test.js)

## Tests

```
python3 oracle.py   # regenerate expected cases
node test.js        # engine vs oracle
```
