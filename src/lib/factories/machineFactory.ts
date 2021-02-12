import {
  FindRequest,
  GetPrintersQuery,
  GetRegistrationInfoQuery,
  GetReleaseInfoQuery,
  GetSearchInfoQuery,
  GetSectioningInfoQuery,
  LabelType,
  Labware,
  LocationFieldsFragment,
  Maybe,
} from "../../types/graphql";
import { RegistrationMachine } from "../machines/registration/registrationMachineTypes";
import registrationMachine from "../machines/registration/registrationMachine";
import { buildRegistrationSchema } from "../services/registrationService";
import { SectioningMachine } from "../machines/sectioning/sectioningMachineTypes";
import { sectioningMachine } from "../machines/sectioning/sectioningMachine";
import { LabwareTypeName } from "../../types/stan";
import createLocationMachine from "../machines/locations/locationMachine";
import {
  LocationMachine,
  StoredItemFragment,
} from "../machines/locations/locationMachineTypes";
import { LocationSearchParams } from "../../pages/Location";
import { genAddresses } from "../helpers";
import { ReleaseMachine } from "../machines/release/releaseMachineTypes";
import createReleaseMachine from "../machines/release/releaseMachine";
import { LabelPrinterMachine } from "../machines/labelPrinter/labelPrinterMachineTypes";
import createLabelPrinterMachine from "../machines/labelPrinter/labelPrinterMachine";
import createExtractionMachine from "../machines/extraction/extractionMachine";
import { ExtractionMachine } from "../machines/extraction/extractionMachineTypes";
import createSearchMachine from "../machines/search/searchMachine";
import { SearchMachine } from "../machines/search/searchMachineTypes";
// HYGEN MARKER

export function buildRegistrationMachine(
  registrationInfo: GetRegistrationInfoQuery
): RegistrationMachine {
  return registrationMachine.withContext(
    Object.assign({}, registrationMachine.context, {
      registrationInfo,
      registrationSchema: buildRegistrationSchema(registrationInfo),
      availableLabwareTypes: [LabwareTypeName.PROVIASETTE],
    })
  );
}

export function buildSectioningMachine(
  sectioningInfo: GetSectioningInfoQuery
): SectioningMachine {
  const inputLabwareTypeNames = [LabwareTypeName.PROVIASETTE];
  const outputLabwareTypeNames = [
    LabwareTypeName.TUBE,
    LabwareTypeName.SLIDE,
    LabwareTypeName.VISIUM_TO,
    LabwareTypeName.VISIUM_LP,
  ];

  const inputLabwareTypes = sectioningInfo.labwareTypes.filter((lt) =>
    inputLabwareTypeNames.includes(lt.name as LabwareTypeName)
  );
  const outputLabwareTypes = sectioningInfo.labwareTypes.filter((lt) =>
    outputLabwareTypeNames.includes(lt.name as LabwareTypeName)
  );
  const selectedLabwareType = outputLabwareTypes[0];
  const comments = sectioningInfo.comments;

  return sectioningMachine.withContext(
    Object.assign({}, sectioningMachine.context, {
      inputLabwareTypeNames,
      outputLabwareTypeNames,
      inputLabwareTypes,
      outputLabwareTypes,
      selectedLabwareType,
      comments,
    })
  );
}

export function buildLocationMachine(
  location: LocationFieldsFragment,
  locationSearchParams: Maybe<LocationSearchParams> | undefined
): LocationMachine {
  // Create all the possible addresses for this location if it has a size.
  const locationAddresses = location.size
    ? Array.from(genAddresses(location.size, location.direction!))
    : [];

  // Create a map of location addresses to items (or null if empty)
  const addressToItemMap = new Map<string, Maybe<StoredItemFragment>>(
    locationAddresses.map((address) => [
      address,
      location.stored.find((item) => item.address === address) ?? null,
    ])
  );

  // Get the first selected address (which is the first empty address)
  const selectedAddress =
    locationAddresses.find(
      (address) => addressToItemMap.get(address) == null
    ) ?? null;

  return createLocationMachine({
    context: {
      location,
      locationSearchParams,
      locationAddresses,
      addressToItemMap,
      selectedAddress,
    },
  });
}

/**
 * Build a {@link ReleaseMachine} using information from a {@link GetReleaseInfoQuery} request
 * @param releaseInfo the information necessary for the Release page
 */
export function buildReleaseMachine(
  releaseInfo: GetReleaseInfoQuery
): ReleaseMachine {
  return createReleaseMachine({
    context: {
      destinations: releaseInfo.releaseDestinations.map((rd) => rd.name),
      recipients: releaseInfo.releaseRecipients.map((r) => r.username),
    },
  });
}

/**
 * Build a {@link LabelPrinterMachine}
 * @param labwares the labwares to print
 * @param selectedPrinter the currently selected printer
 */
export function buildLabelPrinterMachine(
  labwares: Array<
    Pick<Labware, "barcode"> & {
      labwareType: {
        labelType?: Maybe<Pick<LabelType, "name">>;
      };
    }
  >,
  selectedPrinter: Maybe<GetPrintersQuery["printers"][number]> = null
): LabelPrinterMachine {
  return createLabelPrinterMachine({
    context: {
      selectedPrinter,
      labwares,
    },
  });
}

/**
 * Build an {@link ExtractionMachine}
 */
export function buildExtractionMachine(): ExtractionMachine {
  return createExtractionMachine({
    context: {
      labwares: [],
    },
  });
}

/**
 * Build a {@link SearchMachine}
 */
export function buildSearchMachine(
  searchInfo: GetSearchInfoQuery,
  findRequest: FindRequest
): SearchMachine {
  return createSearchMachine({
    context: {
      searchInfo,
      findRequest,
    },
  });
}
