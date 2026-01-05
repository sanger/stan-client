import { LayoutPlan } from '../../lib/machines/layout/layoutContext';

function selectSourceSlotPlan(layoutPlan: LayoutPlan, addressPlanId: string) {
  const source = layoutPlan.plannedActions[addressPlanId]?.source;
  if (source) return source;
  return Object.values(layoutPlan.plannedActions).find((planned) => planned.addresses.has(addressPlanId))?.source;
}
export function buildSlotText(layoutPlan: LayoutPlan, addressPlanId: string) {
  const source = selectSourceSlotPlan(layoutPlan, addressPlanId);
  if (source) {
    return source.labware.barcode;
  }
}

export function buildSlotColor(layoutPlan: LayoutPlan, addressPlanId: string) {
  const source = selectSourceSlotPlan(layoutPlan, addressPlanId);
  if (source) return layoutPlan.sampleColors.get(source.sampleId);
}
