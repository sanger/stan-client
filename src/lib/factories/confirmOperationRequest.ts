import {
  ConfirmOperationLabware,
  ConfirmOperationRequest,
  Labware,
} from "../../types/sdk";

/**
 * Builds an empty {@link ConfirmOperationRequest}
 */
export function buildConfirmOperationRequest(): ConfirmOperationRequest {
  return {
    labware: [],
  };
}

/**
 * Builds a {@link ConfirmOperationLabware} for a particular piece of {@link Labware}
 * @param labware the {@link Labware} to build the operation for
 */
export function buildConfirmOperationLabware(
  labware: Pick<Labware, "barcode">
): ConfirmOperationLabware {
  return {
    barcode: labware.barcode,
    cancelled: false,
    cancelledActions: [],
    addressComments: [],
  };
}
