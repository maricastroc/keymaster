/**
 * A bank of common, lowercase English words used to synthesize targeted
 * practice passages (see `features/results/keys/logic/generatePractice.ts`).
 * `data/texts.ts` only holds a handful of long paragraphs, which can't be
 * weighted toward specific letters — hence this dedicated word list. Kept
 * deliberately varied in letter coverage (including j/q/x/z-heavy words) so a
 * drill can target any weak key.
 */
export const practiceWords: string[] = [
  'the', 'and', 'for', 'you', 'with', 'this', 'that', 'have', 'from', 'they',
  'would', 'there', 'their', 'what', 'about', 'which', 'when', 'make', 'like',
  'time', 'just', 'know', 'take', 'people', 'into', 'year', 'your', 'good',
  'some', 'could', 'them', 'other', 'than', 'then', 'look', 'only', 'come',
  'over', 'think', 'also', 'back', 'after', 'work', 'first', 'well', 'even',
  'want', 'because', 'these', 'give', 'most', 'thing', 'place', 'where', 'right',
  'through', 'world', 'still', 'should', 'never', 'while', 'those', 'again',
  'today', 'water', 'small', 'large', 'point', 'sound', 'great', 'little',
  'found', 'study', 'story', 'night', 'light', 'house', 'money', 'group',
  'music', 'field', 'order', 'young', 'north', 'south', 'white', 'black',
  'quick', 'brown', 'jumps', 'lazy', 'zebra', 'quilt', 'quiet', 'quite',
  'quest', 'queen', 'quote', 'squad', 'equal', 'jazz', 'juice', 'joker',
  'jolly', 'major', 'enjoy', 'joint', 'eject', 'ninja', 'banjo', 'jewel',
  'extra', 'exact', 'exams', 'exist', 'expel', 'boxes', 'mixed', 'fixed',
  'proxy', 'toxic', 'sixty', 'maxim', 'relax', 'index', 'axiom', 'vixen',
  'fizzy', 'dizzy', 'pizza', 'buzzy', 'fuzzy', 'prize', 'seize', 'gauze',
  'blaze', 'graze', 'crazy', 'dozen', 'frozen', 'amaze', 'zones', 'zesty',
  'value', 'vivid', 'vowel', 'verse', 'voice', 'vague', 'venue', 'valve',
  'kayak', 'khaki', 'knack', 'knots', 'knife', 'knock', 'kneel', 'kiosk',
  'wharf', 'while', 'whale', 'wheat', 'wheel', 'whirl', 'which', 'whisk',
  'yacht', 'yield', 'yeast', 'young', 'yearn', 'yummy', 'youth', 'yodel',
  'gypsy', 'foggy', 'buggy', 'nudge', 'gauge', 'guild', 'gruff', 'gloom',
  'happy', 'hatch', 'harsh', 'hutch', 'hydro', 'hover', 'hyphen', 'humid',
  'flick', 'fluff', 'flock', 'flute', 'frost', 'fresh', 'flint', 'frame',
  'crisp', 'crumb', 'crown', 'creek', 'craft', 'cliff', 'clasp', 'chunk',
  'brisk', 'bloom', 'blend', 'brave', 'brick', 'broke', 'blunt', 'blush',
  'plumb', 'plush', 'proud', 'prowl', 'plaid', 'prism', 'plank', 'preen',
  'swirl', 'sworn', 'sweep', 'stalk', 'stump', 'stomp', 'sturdy', 'shrug',
  'thumb', 'theft', 'thorn', 'thick', 'tramp', 'trout', 'twist', 'tweak',
  'dwarf', 'drift', 'draft', 'dodge', 'ditch', 'dwell', 'druid', 'debug',
  'nymph', 'nerdy', 'north', 'noble', 'nudge', 'newer', 'nasty', 'nomad',
  'mirth', 'mimic', 'moldy', 'mocha', 'moody', 'mound', 'mulch', 'mango',
  'lucky', 'lymph', 'lodge', 'latch', 'ledge', 'limbo', 'lofty', 'linen',
  'ozone', 'oxide', 'onion', 'olive', 'ought', 'opera', 'orbit', 'ovals',
  'ridge', 'rhyme', 'roast', 'rusty', 'ruddy', 'realm', 'ranch', 'robin',
  'pouch', 'punch', 'perky', 'porch', 'pluck', 'pesky', 'proof', 'pupil',
  'chirp', 'charm', 'chalk', 'chess', 'chord', 'chime', 'churn', 'cheap',
  'ghost', 'gnome', 'goose', 'grasp', 'greet', 'grind', 'gully', 'guava',
];
