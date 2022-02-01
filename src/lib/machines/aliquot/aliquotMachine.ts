import {
  AliquotMutation,
  LabwareFieldsFragment,
  LabwareFieldsFragmentDoc,
} from "../../../types/sdk";
import { ClientError } from "graphql-request";

export interface AliquotingContext {
  /**The barcode of the source labware.**/
  workNumber?: string;

  /**The barcode of the source labware.**/
  labware: LabwareFieldsFragment;

  /**The number of destination labware to create.**/
  numLabware: number;

  /**The result returned by aliquot api*/
  aliquot?: AliquotMutation;

  /**Error returned from server**/
  serverErrors?: ClientError;
}

type UpdateLabwareEvent = {
  type: "UPDATE_LABWARE";
  labware: LabwareFieldsFragment;
};

type AliquotEvent = {
  type: "ALIQUOT";
};
type AliquotDoneEvent = {
  type: "done.invoke.aliquot";
  data: AliquotMutation;
};
type AliquotErrorEvent = {
  type: "error.platform.aliquot";
  data: ClientError;
};

export type ALIQUOT_EVENT =
  | { type: "UPDATE_WORK_NUMBER"; workNumber?: string }
  | AliquotEvent
  | AliquotDoneEvent
  | AliquotErrorEvent
  | UpdateLabwareEvent;
