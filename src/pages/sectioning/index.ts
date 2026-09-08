import { LayoutPlan } from '../../lib/machines/layout/layoutContext';
import { joinUnique } from '../../components/dataTableColumns';

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

export function buildSlotColor(layoutPlan: LayoutPlan, addressPlanId: string) {
  const sources = selectSourceSlotPlan(layoutPlan, addressPlanId);
  if (sources && sources.length === 1) return layoutPlan.sampleColors.get(sources[0].sampleId);
  //default background color used for a multisample slot within the labware layout component
  if (sources && sources.length > 1) return 'bg-linear-to-r from-purple-400 via-pink-500 to-red-500';
}
