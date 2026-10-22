import { describe, it, expect } from 'vitest';
import { transposeChord, transposeChordSheet, calculateSemitoneDifference } from './transposer';

describe('transposer', () => {
  describe('calculateSemitoneDifference', () => {
    it('calculates semitone difference correctly', () => {
      expect(calculateSemitoneDifference('C', 'D')).toBe(2);
      expect(calculateSemitoneDifference('C', 'C#')).toBe(1);
      expect(calculateSemitoneDifference('C', 'B')).toBe(-1);
      expect(calculateSemitoneDifference('G', 'G')).toBe(0);
      expect(calculateSemitoneDifference('Am', 'Bm')).toBe(2);
      expect(calculateSemitoneDifference('Em', 'Dm')).toBe(-2);
    });
  });

  describe('transposeChord', () => {
    it('transposes single root chords', () => {
      expect(transposeChord('C', 2)).toBe('D');
      expect(transposeChord('G', 1)).toBe('Ab');
      expect(transposeChord('F', -1)).toBe('E');
      expect(transposeChord('B', 1)).toBe('C');
    });

    it('transposes complex chords (minor, 7th, maj7, sus4, dim)', () => {
      expect(transposeChord('Am', 2)).toBe('Bm');
      expect(transposeChord('F#m7', 1)).toBe('Gm7');
      expect(transposeChord('Bbmaj7', 2)).toBe('Cmaj7');
      expect(transposeChord('Dsus4', -2)).toBe('Csus4');
      expect(transposeChord('C#dim', 1)).toBe('Ddim');
    });

    it('transposes slash chords correctly for both root and bass note', () => {
      expect(transposeChord('G/B', 2)).toBe('A/C#');
      expect(transposeChord('C/E', 2)).toBe('D/F#');
      expect(transposeChord('Am/G', 2)).toBe('Bm/A');
    });
  });

  describe('transposeChordSheet', () => {
    it('transposes chord lines while preserving non-chord lines and formatting', () => {
      const input = `[Intro]
C  Em  Am  F

[Verse]
C           Em
คงเก็บเอาไว้แต่ความทรงจำ`;

      const expected = `[Intro]
D  F#m  Bm  G

[Verse]
D           F#m
คงเก็บเอาไว้แต่ความทรงจำ`;

      expect(transposeChordSheet(input, 2)).toBe(expected);
    });
  });
});
