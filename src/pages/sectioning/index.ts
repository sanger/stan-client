import { LayoutPlan } from '../../lib/machines/layout/layoutContext';
import { joinUnique } from '../../components/dataTableColumns';
import { SAMPLE_COLORS, SAMPLE_OVERFLOW_COLOR } from '../../lib/helpers';
import { alphaNumericSortDefault } from '../../types/stan';

function selectSourceSlotPlan(layoutPlan: LayoutPlan, addressPlanId: string) {
  return layoutPlan.plannedActions
    .filter((planned) => planned.addresses.has(addressPlanId))
    .map((planned) => planned.source);
}
export function buildSlotText(layoutPlan: LayoutPlan, address: string) {
  const sources = selectSourceSlotPlan(layoutPlan, address);
  if (sources.length > 0) {
    return joinUnique(sources.map((source) => source.labware.barcode));
  }
}

/**
 * Colours for the samples on one slide. Each different sample, taken in
 * slot order, gets the next of SAMPLE_COLORS, so every slide starts again
 * from the first colour. Samples after the last colour share
 * SAMPLE_OVERFLOW_COLOR.
 */
export function buildSlideSampleColors(layoutPlan: LayoutPlan): Map<number, string> {
  const firstAddress = (addresses: Set<string>) => [...addresses].sort((a, b) => alphaNumericSortDefault(a, b))[0];
  const inSlotOrder = layoutPlan.plannedActions
    .filter((planned) => planned.addresses.size > 0)
    .sort((a, b) => alphaNumericSortDefault(firstAddress(a.addresses), firstAddress(b.addresses)));
  const colors = new Map<number, string>();
  inSlotOrder.forEach(({ source }) => {
    if (!colors.has(source.sampleId)) {
      colors.set(source.sampleId, SAMPLE_COLORS[colors.size]?.bgColor ?? SAMPLE_OVERFLOW_COLOR.bgColor);
    }
  });
  return colors;
}

export function buildSlotColor(layoutPlan: LayoutPlan, addressPlanId: string) {
  const sources = selectSourceSlotPlan(layoutPlan, addressPlanId);
  if (sources && sources.length === 1) return buildSlideSampleColors(layoutPlan).get(sources[0].sampleId);
  //default background color used for a multisample slot within the labware layout component
  if (sources && sources.length > 1) return 'bg-linear-to-r from-purple-400 via-pink-500 to-red-500';
}
