/* Badminton math - exact arithmetic, labeled norms.
   Norms shown in the UI: BWF playing court 13.40 x 6.10 m (doubles);
   clearances 1.2 m beside / 1.5 m behind are club norms (labeled, not BWF rules). */
(function (root) {
  'use strict';

  var COURT_L = 13.40;   // m, BWF doubles court length
  var COURT_W = 6.10;    // m, BWF doubles court width
  var SIDE_CLEAR = 1.2;  // m, club-norm clear space beside each court (labeled)
  var BACK_CLEAR = 1.5;  // m, club-norm clear space behind each baseline (labeled)

  function r2(x) { return Math.round(x * 100) / 100; }
  function num(v, name) {
    if (typeof v !== 'number' || !isFinite(v)) throw new Error(name + ' must be a number');
    return v;
  }

  function orientation(hallW, hallL, courtW, courtL) {
    var needL = courtL + 2 * BACK_CLEAR;
    if (hallL < needL) return { n: 0, used: 0, margin: r2(hallW) };
    var n = Math.floor((hallW - SIDE_CLEAR) / (courtW + SIDE_CLEAR));
    if (n < 0) n = 0;
    var used = n > 0 ? n * courtW + (n + 1) * SIDE_CLEAR : 0;
    return { n: n, used: r2(used), margin: r2(hallW - used) };
  }

  function courts(hallW, hallL) {
    hallW = num(hallW, 'hall width');
    hallL = num(hallL, 'hall length');
    if (hallW <= 0 || hallL <= 0) throw new Error('hall dimensions must be positive');
    var along = orientation(hallW, hallL, COURT_W, COURT_L);
    var across = orientation(hallW, hallL, COURT_L, COURT_W);
    var best, orient, courtLen;
    if (across.n > along.n) { best = across; orient = 'across hall'; courtLen = COURT_W; }
    else { best = along; orient = 'along length'; courtLen = COURT_L; }
    var verdict = best.n >= 4 ? 'tournament hall' : best.n >= 2 ? 'club hall' : best.n === 1 ? 'single court' : 'no fit';
    if (best.n === 0) orient = 'no fit';
    return {
      courts: best.n,
      orientation: orient,
      used_width: best.used,
      margin: best.margin,
      needed_length: r2(courtLen + 2 * BACK_CLEAR),
      verdict: verdict
    };
  }

  function roundrobin(n, matchMin, courtCount) {
    if (!Number.isInteger(n)) throw new Error('players must be a whole number');
    if (n < 2) throw new Error('need at least 2 players or pairs');
    if (n > 64) throw new Error('keep it under 65 players (labeled)');
    if (!Number.isInteger(courtCount) || courtCount < 1) throw new Error('need at least 1 court');
    matchMin = num(matchMin, 'match minutes');
    if (matchMin <= 0) throw new Error('match minutes must be positive');
    var matches = n * (n - 1) / 2;
    var rounds = n % 2 === 0 ? n - 1 : n;
    var perRound = Math.floor(n / 2);
    var wall = Math.ceil(matches / courtCount) * matchMin;
    var verdict = wall <= 120 ? 'quick evening' : wall <= 240 ? 'long session' : 'marathon';
    return { matches: matches, rounds: rounds, per_round: perRound, wall_minutes: wall, verdict: verdict };
  }

  function rally(a, b) {
    if (!Number.isInteger(a) || !Number.isInteger(b)) throw new Error('scores must be whole numbers');
    if (a < 0 || b < 0 || a > 30 || b > 30) throw new Error('scores run 0 to 30 (cap 30)');
    var diff = Math.abs(a - b);
    var over = (a === 30 || b === 30) || ((a >= 21 || b >= 21) && diff >= 2);
    if (over) throw new Error("that game's already over (first to 21, win by 2, cap 30)");
    var targetA = Math.min(30, Math.max(21, b + 2));
    var targetB = Math.min(30, Math.max(21, a + 2));
    var status;
    if (a === 29 && b === 29) status = 'sudden point - next rally wins (cap 30)';
    else if (a >= 20 && b >= 20) status = 'deuce zone - cap 30';
    else if (a === 20) status = 'game point A';
    else if (b === 20) status = 'game point B';
    else status = 'mid-game';
    return {
      need_a: targetA - a,
      need_b: targetB - b,
      box_if_a_serves: a % 2 === 0 ? 'right' : 'left',
      status: status
    };
  }

  var api = { courts: courts, roundrobin: roundrobin, rally: rally,
              NORMS: { COURT_L: COURT_L, COURT_W: COURT_W, SIDE_CLEAR: SIDE_CLEAR, BACK_CLEAR: BACK_CLEAR } };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.BadmintonMath = api;
})(typeof window !== 'undefined' ? window : globalThis);
