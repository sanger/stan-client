import { LabwareFieldsFragment, Maybe } from "../../../types/sdk";
import { Address, NewLabwareLayout } from "../../../types/stan";

export interface LayoutPlan {
  /**
   * List of all the available source actions
   */
  sources: Array<Source>;

  /**
   * The labware we're laying out onto
   */
  destinationLabware: NewLabwareLayout;

  /**
   * Map of sample ID to hex color
   */
  sampleColors: Map<number, string>;

  /**
   * Map of destination slot friendly address to planned source
   */
  plannedActions: Map<Address, Array<Source>>;
}

export interface Source {
  sampleId: number;
  labware: LabwareFieldsFragment;
  newSection: number;
  address?: Maybe<Address>;
}

export interface LayoutContext {
  layoutPlan: LayoutPlan;
  possibleActions?: LayoutPlan["plannedActions"];
  selected: Maybe<Source>;
}

export function addressToSourceLabwareMap(layoutPlan: LayoutPlan) {
  const addressToLabwareMap: Map<string, LabwareFieldsFragment> = new Map();
  Array.from(layoutPlan.plannedActions.entries()).forEach(
    ([address, sources]) => {
      const sourcesArr = Array.from(sources.values());
      if (sourcesArr.length > 0) {
        addressToLabwareMap.set(address, sourcesArr[0].labware);
      }
    }
  );
  return addressToLabwareMap;
}
