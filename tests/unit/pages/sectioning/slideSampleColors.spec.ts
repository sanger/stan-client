import { describe, expect, it } from '@jest/globals';
import { buildSlideSampleColors } from '../../../../src/pages/sectioning';
import { LayoutPlan, PlannedSectionDetails } from '../../../../src/lib/machines/layout/layoutContext';
import { SAMPLE_OVERFLOW_COLOR } from '../../../../src/lib/helpers';

// A placement of a sample in one or more slots of the slide
const placed = (sampleId: number, ...addresses: string[]): PlannedSectionDetails => ({
  addresses: new Set(addresses),
  source: { sampleId, labware: {} as any, newSection: '' }
});

const slide = (...plannedActions: PlannedSectionDetails[]) =>
  ({ sources: [], sampleColors: new Map(), plannedActions }) as unknown as LayoutPlan;

describe('buildSlideSampleColors', () => {
  it('gives each different sample the next colour, in slot order', () => {
    // Listed out of slot order, as placements can be
    const colors = buildSlideSampleColors(slide(placed(2, 'B1'), placed(1, 'A1'), placed(3, 'A2')));
    expect(colors.get(1)).toBe('bg-sample-1');
    expect(colors.get(3)).toBe('bg-sample-2');
    expect(colors.get(2)).toBe('bg-sample-3');
  });

  it('keeps one colour for a sample placed in several slots', () => {
    const colors = buildSlideSampleColors(slide(placed(1, 'A1'), placed(2, 'A2'), placed(1, 'A3')));
    expect(colors.get(1)).toBe('bg-sample-1');
    expect(colors.get(2)).toBe('bg-sample-2');
    expect(colors.size).toBe(2);
  });

  it('starts from the first colour on every slide', () => {
    expect(buildSlideSampleColors(slide(placed(1, 'A1'))).get(1)).toBe('bg-sample-1');
    expect(buildSlideSampleColors(slide(placed(2, 'A1'))).get(2)).toBe('bg-sample-1');
  });

  it('gives the samples after the 40th the shared grey', () => {
    // 41 samples in 41 slots, A1 to K1, four slots a row
    const placements = Array.from({ length: 41 }, (_, i) =>
      placed(i + 1, String.fromCharCode(65 + Math.floor(i / 4)) + ((i % 4) + 1))
    );
    const colors = buildSlideSampleColors(slide(...placements));
    expect(colors.get(40)).toBe('bg-sample-40');
    expect(colors.get(41)).toBe(SAMPLE_OVERFLOW_COLOR.bgColor);
  });
});
