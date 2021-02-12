import {
  RegistrationMachineService,
  RegistrationState,
} from "../machines/registration/registrationMachineTypes";
import ReleasePresentationModel from "../presentationModels/releasePresentationModel";
import RegistrationPresentationModel from "../presentationModels/registrationPresentationModel";
import {
  SectioningMachineService,
  SectioningState,
} from "../machines/sectioning/sectioningMachineTypes";
import SectioningPresentationModel from "../presentationModels/sectioningPresentationModel";
import {
  LocationMachineService,
  LocationState,
} from "../machines/locations/locationMachineTypes";
import LocationPresentationModel from "../presentationModels/locationPresentationModel";
import {
  ReleaseMachineService,
  ReleaseState,
} from "../machines/release/releaseMachineTypes";
import {
  ExtractionMachineService,
  ExtractionState,
} from "../machines/extraction/extractionMachineTypes";
import ExtractionPresentationModel from "../presentationModels/extractionPresentationModel";
// HYGEN MARKER

export function buildReleasePresentationModel(
  current: ReleaseState,
  service: ReleaseMachineService
) {
  return new ReleasePresentationModel(current, service);
}

export function buildRegistrationPresentationModel(
  current: RegistrationState,
  service: RegistrationMachineService
) {
  return new RegistrationPresentationModel(current, service);
}

export function buildSectioningModel(
  current: SectioningState,
  service: SectioningMachineService
): SectioningPresentationModel {
  return new SectioningPresentationModel(current, service);
}

export function buildLocationPresentationModel(
  current: LocationState,
  service: LocationMachineService
): LocationPresentationModel {
  return new LocationPresentationModel(current, service);
}
export function buildExtractionPresentationModel(
  current: ExtractionState,
  service: ExtractionMachineService
): ExtractionPresentationModel {
  return new ExtractionPresentationModel(current, service);
}
