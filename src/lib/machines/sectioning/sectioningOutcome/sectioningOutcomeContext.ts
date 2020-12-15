import {
  ConfirmOperationLabware,
  LabwareLayoutFragment as LabwareLayout,
} from "../../../../types/graphql";
import { LayoutPlan } from "../../layout/layoutContext";

export interface SectioningOutcomeContext {
  layoutPlan: LayoutPlan;
  labware: LabwareLayout;
  comments: Array<Comment>;
}
