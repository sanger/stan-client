import { ConfirmSectionLabware, ConfirmSectionRequest, Labware } from '../../types/sdk';

/**
 * Builds an empty {@link ConfirmSectionRequest}
 */
export function buildConfirmSectionRequest(): ConfirmSectionRequest {
  return {
    labware: [],
    workNumber: ''
  };
}

/**
 * Builds a {@link ConfirmSectionLabware} for a particular piece of {@link Labware}
 * @param labware the {@link Labware} to build the confirmation for
 */
export function buildConfirmSectionLabware(labware: Pick<Labware, 'barcode'>): ConfirmSectionLabware {
  return {
    barcode: labware.barcode,
    cancelled: false,
    confirmSections: [],
    addressComments: []
  };
}
