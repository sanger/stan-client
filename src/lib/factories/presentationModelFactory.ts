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
import {
  SearchMachineService,
  SearchState,
} from "../machines/search/searchMachineTypes";
import SearchPresentationModel from "../presentationModels/searchPresentationModel";
import {
  DestroyMachineService,
  DestroyState,
} from "../machines/destroy/destroyMachineTypes";
import DestroyPresentationModel from "../presentationModels/destroyPresentationModel";
import {
  SlideRegistrationMachineService,
  SlideRegistrationState,
} from "../machines/slideRegistration/slideRegistrationMachineTypes";
import SlideRegistrationPresentationModel from "../presentationModels/slideRegistrationPresentationModel";
import {
  SlotCopyMachineService,
  SlotCopyState,
} from "../machines/slotCopy/slotCopyMachineTypes";
import SlotCopyPresentationModel from "../presentationModels/slotCopyPresentationModel";
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

export function buildSlideRegistrationPresentationModel(
  current: SlideRegistrationState,
  service: SlideRegistrationMachineService
) {
  return new SlideRegistrationPresentationModel(current, service);
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
export function buildSearchPresentationModel(
  current: SearchState,
  service: SearchMachineService
): SearchPresentationModel {
  return new SearchPresentationModel(current, service);
}
export function buildDestroyPresentationModel(
  current: DestroyState,
  service: DestroyMachineService
): DestroyPresentationModel {
  return new DestroyPresentationModel(current, service);
}
export function buildSlotCopyPresentationModel(
  current: SlotCopyState,
  service: SlotCopyMachineService
): SlotCopyPresentationModel {
  return new SlotCopyPresentationModel(current, service);
}
