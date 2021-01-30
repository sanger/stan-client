import {
  GetRegistrationInfoQuery,
  GetSectioningInfoQuery,
} from "../../types/graphql";
import { RegistrationMachine } from "../machines/registration/registrationMachineTypes";
import registrationMachine from "../machines/registration/registrationMachine";
import { buildRegistrationSchema } from "../services/registrationService";
import { SectioningMachine } from "../machines/sectioning/sectioningMachineTypes";
import { sectioningMachine } from "../machines/sectioning/sectioningMachine";
import { LabwareTypeName } from "../../types/stan";

export function buildRegistrationMachine(
  registrationInfo: GetRegistrationInfoQuery
): RegistrationMachine {
  return registrationMachine.withContext(
    Object.assign({}, registrationMachine.context, {
      registrationInfo,
      registrationSchema: buildRegistrationSchema(registrationInfo),
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
