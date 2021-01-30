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

export function buildReleasePresentationModel(
  current: RegistrationState,
  service: RegistrationMachineService
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
