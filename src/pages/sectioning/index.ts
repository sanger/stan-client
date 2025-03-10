import { LayoutPlan } from '../../lib/machines/layout/layoutContext';

export function buildSlotText(layoutPlan: LayoutPlan, address: string) {
  const action = layoutPlan.plannedActions.get(address);
  if (action && action.length > 0 && action[0].labware) {
    return action[0].labware.barcode;
  }
}

export function buildSlotSecondaryText(layoutPlan: LayoutPlan, address: string) {
  const action = layoutPlan.plannedActions.get(address);
  if (action && action.length > 1) {
    return `\u00d7${action.length}`;
  }
}

export function buildSlotColor(layoutPlan: LayoutPlan, address: string) {
  const action = layoutPlan.plannedActions.get(address);
  if (action && action.length > 0) {
    return layoutPlan.sampleColors.get(action[0].sampleId);
  }
  return undefined;
}
