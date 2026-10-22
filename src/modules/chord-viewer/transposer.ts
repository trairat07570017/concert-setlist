// Standard popular music chromatic scale (most common chords in pop/rock/Thai songs)
const POP_SCALE = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];

const NOTE_TO_SEMITONE: Record<string, number> = {
  'C': 0, 'B#': 0,
  'C#': 1, 'Db': 1,
  'D': 2,
  'D#': 3, 'Eb': 3,
  'E': 4, 'Fb': 4,
  'F': 5, 'E#': 5,
  'F#': 6, 'Gb': 6,
  'G': 7,
  'G#': 8, 'Ab': 8,
  'A': 9,
  'A#': 10, 'Bb': 10,
  'B': 11, 'Cb': 11
};

function extractRootNote(keyStr: string): string {
  const match = keyStr.match(/^([A-G][#b]?)/);
  return match ? match[1] : 'C';
}

/**
 * Calculates the shortest semitone interval from originalKey to targetKey (-6 to +6)
 */
export function calculateSemitoneDifference(originalKey: string, targetKey: string): number {
  if (!originalKey || !targetKey) return 0;
  const origRoot = extractRootNote(originalKey);
  const targetRoot = extractRootNote(targetKey);

  const origSemi = NOTE_TO_SEMITONE[origRoot] ?? 0;
  const targetSemi = NOTE_TO_SEMITONE[targetRoot] ?? 0;

  let diff = targetSemi - origSemi;
  if (diff > 6) diff -= 12;
  if (diff <= -6) diff += 12;

  return diff;
}

/**
 * Transposes a single note by semitones
 */
function transposeNote(note: string, semitones: number): string {
  const currentSemi = NOTE_TO_SEMITONE[note];
  if (currentSemi === undefined) return note;

  const newSemi = (currentSemi + semitones + 120) % 12;
  return POP_SCALE[newSemi];
}

// Matches root note (group 1), modifier (group 2), slash bass note (group 4)
const CHORD_MATCH_REGEX = /^([A-G][#b]?)(.*?)(\/([A-G][#b]?))?$/;
const CHORD_TOKEN_REGEX = /^[A-G][#b]?(?:m|maj|min|dim|aug|sus[24]?|add[0-9]?|[0-9]+)*(?:\/[A-G][#b]?)?$/;

export function isChordToken(token: string): boolean {
  return CHORD_TOKEN_REGEX.test(token.trim());
}

/**
 * Transposes a single chord string (e.g. C, F#m7, Bbmaj7, G/B)
 */
export function transposeChord(chord: string, semitones: number): string {
  if (semitones === 0) return chord;
  const match = chord.match(CHORD_MATCH_REGEX);
  if (!match) return chord;

  const root = match[1];
  const modifier = match[2] || '';
  const slashBass = match[4];

  const newRoot = transposeNote(root, semitones);

  let newBass = '';
  if (slashBass) {
    newBass = '/' + transposeNote(slashBass, semitones);
  }

  return `${newRoot}${modifier}${newBass}`;
}

/**
 * Transposes full chord sheet text, finding chord tokens and preserving spaces/lyrics
 */
export function transposeChordSheet(text: string, semitones: number): string {
  if (!text || semitones === 0) return text;

  const lines = text.split('\n');

  const transposedLines = lines.map((line) => {
    // Preserve section headers like [Intro], [Verse], [Chorus]
    if (line.trim().startsWith('[') && line.trim().endsWith(']')) {
      return line;
    }

    return line.replace(/([A-G][#b]?(?:m|maj|min|dim|aug|sus[24]?|add[0-9]?|[0-9]+)*(?:\/[A-G][#b]?)?)/g, (match) => {
      if (isChordToken(match)) {
        return transposeChord(match, semitones);
      }
      return match;
    });
  });

  return transposedLines.join('\n');
}
