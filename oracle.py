#!/usr/bin/env python3
# Oracle for badmintonmath. Mirrors engine.js float ops exactly (IEEE 754 doubles).
import math, json, os

COURT_L = 13.40
COURT_W = 6.10
SIDE_CLEAR = 1.2
BACK_CLEAR = 1.5

def r2(x):  # == JS Math.round(x*100)/100 for our positive magnitudes
    return math.floor(x * 100 + 0.5) / 100

def orientation(hallW, hallL, courtW, courtL):
    needL = courtL + 2 * BACK_CLEAR
    if hallL < needL:
        return {'n': 0, 'used': 0, 'margin': r2(hallW)}
    n = math.floor((hallW - SIDE_CLEAR) / (courtW + SIDE_CLEAR))
    if n < 0: n = 0
    used = n * courtW + (n + 1) * SIDE_CLEAR if n > 0 else 0
    return {'n': n, 'used': r2(used), 'margin': r2(hallW - used)}

def courts(hallW, hallL):
    along = orientation(hallW, hallL, COURT_W, COURT_L)
    across = orientation(hallW, hallL, COURT_L, COURT_W)
    if across['n'] > along['n']:
        best, orient, courtLen = across, 'across hall', COURT_W
    else:
        best, orient, courtLen = along, 'along length', COURT_L
    verdict = ('tournament hall' if best['n'] >= 4 else 'club hall' if best['n'] >= 2
               else 'single court' if best['n'] == 1 else 'no fit')
    if best['n'] == 0: orient = 'no fit'
    return {'courts': best['n'], 'orientation': orient, 'used_width': best['used'],
            'margin': best['margin'], 'needed_length': r2(courtLen + 2 * BACK_CLEAR), 'verdict': verdict}

def roundrobin(n, matchMin, courtCount):
    matches = n * (n - 1) // 2
    rounds = n - 1 if n % 2 == 0 else n
    perRound = n // 2
    wall = math.ceil(matches / courtCount) * matchMin
    verdict = 'quick evening' if wall <= 120 else 'long session' if wall <= 240 else 'marathon'
    return {'matches': matches, 'rounds': rounds, 'per_round': perRound,
            'wall_minutes': wall, 'verdict': verdict}

def rally(a, b):
    targetA = min(30, max(21, b + 2))
    targetB = min(30, max(21, a + 2))
    if a == 29 and b == 29: status = 'sudden point - next rally wins (cap 30)'
    elif a >= 20 and b >= 20: status = 'deuce zone - cap 30'
    elif a == 20: status = 'game point A'
    elif b == 20: status = 'game point B'
    else: status = 'mid-game'
    return {'need_a': targetA - a, 'need_b': targetB - b,
            'box_if_a_serves': 'right' if a % 2 == 0 else 'left', 'status': status}

CASES = [
  {'card':'courts','args':[20,30]}, {'card':'courts','args':[10,30]},
  {'card':'courts','args':[30,30]}, {'card':'courts','args':[50,30]},
  {'card':'courts','args':[8,20]},  {'card':'courts','args':[30,15]},
  {'card':'courts','args':[15.8,20]},{'card':'courts','args':[15.79,20]},
  {'card':'courts','args':[7.3,16.4]},{'card':'courts','args':[7.5,16.5]},
  {'card':'courts','args':[8.5,16.4]},{'card':'courts','args':[100,20]},
  {'card':'courts','args':[0,30],'error':'positive'},
  {'card':'courts','args':[-5,30],'error':'positive'},
  {'card':'courts','args':[20,0],'error':'positive'},
  {'card':'courts','args':[20,-1],'error':'positive'},
  {'card':'roundrobin','args':[8,40,2]}, {'card':'roundrobin','args':[4,30,1]},
  {'card':'roundrobin','args':[2,30,1]}, {'card':'roundrobin','args':[5,20,2]},
  {'card':'roundrobin','args':[6,25,3]}, {'card':'roundrobin','args':[10,45,1]},
  {'card':'roundrobin','args':[3,15,1]}, {'card':'roundrobin','args':[12,20,4]},
  {'card':'roundrobin','args':[16,30,8]},{'card':'roundrobin','args':[7,20,7]},
  {'card':'roundrobin','args':[1,30,1],'error':'at least 2'},
  {'card':'roundrobin','args':[65,30,1],'error':'under 65'},
  {'card':'roundrobin','args':[8,0,2],'error':'positive'},
  {'card':'roundrobin','args':[8,40,0],'error':'at least 1 court'},
  {'card':'roundrobin','args':[2.5,30,1],'error':'whole'},
  {'card':'roundrobin','args':[64,60,1]},
  {'card':'rally','args':[20,19]}, {'card':'rally','args':[19,20]},
  {'card':'rally','args':[29,29]}, {'card':'rally','args':[20,20]},
  {'card':'rally','args':[28,27]}, {'card':'rally','args':[0,0]},
  {'card':'rally','args':[14,14]}, {'card':'rally','args':[15,20]},
  {'card':'rally','args':[21,20]}, {'card':'rally','args':[25,26]},
  {'card':'rally','args':[21,19],'error':'already over'},
  {'card':'rally','args':[30,28],'error':'already over'},
  {'card':'rally','args':[29,30],'error':'already over'},
  {'card':'rally','args':[-1,5],'error':'0 to 30'},
  {'card':'rally','args':[31,0],'error':'0 to 30'},
  {'card':'rally','args':[20.5,19],'error':'whole'},
]

out = []
for c in CASES:
    row = {'card': c['card'], 'args': c['args']}
    if 'error' in c:
        row['error'] = c['error']
    else:
        row['expect'] = globals()[c['card']](*c['args'])
    out.append(row)
path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'expected.json')
with open(path, 'w') as f:
    json.dump(out, f, indent=1)
    f.write('\n')
print('wrote', len(out), 'cases')
