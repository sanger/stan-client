import { MachinePresentationModel } from "./machinePresentationModel";
import {
  RegistrationContext,
  RegistrationEvent,
  RegistrationSchema,
} from "../machines/registration/registrationMachineTypes";
import { FormValues } from "../services/registrationService";
import { LabwareTypeName } from "../../types/stan";
import * as Yup from "yup";
import RegistrationValidation from "../validation/registrationValidation";

export default class RegistrationPresentationModel extends MachinePresentationModel<
  RegistrationContext,
  RegistrationSchema,
  RegistrationEvent
> {
  init() {
    this.submitForm = this.submitForm.bind(this);
    this.editSubmission = this.editSubmission.bind(this);
  }

  get registrationResult() {
    return this.context.registrationResult;
  }

  get registrationErrors() {
    return this.context.registrationErrors;
  }

  get registrationInfo() {
    return this.context.registrationInfo;
  }

  get availableLabwareTypes() {
    return this.registrationInfo.labwareTypes.filter((lt) =>
      [LabwareTypeName.PROVIASETTE].includes(lt.name as LabwareTypeName)
    );
  }

  get registrationSchema(): Yup.ObjectSchema {
    const validation = new RegistrationValidation(this.registrationInfo);

    return Yup.object().shape({
      tissues: Yup.array()
        .min(1)
        .of(
          Yup.object().shape({
            donorId: validation.donorId,
            lifeStage: validation.lifeStage,
            species: validation.species,
            hmdmc: validation.hmdmc,
            tissueType: validation.tissueType,
            blocks: Yup.array()
              .min(1)
              .of(
                Yup.object().shape({
                  externalIdentifier: validation.externalIdentifier,
                  spatialLocation: validation.spatialLocation,
                  replicateNumber: validation.replicateNumber,
                  lastKnownSectionNumber: validation.lastKnownSectionNumber,
                  labwareType: validation.labwareType,
                  fixative: validation.fixative,
                  medium: validation.medium,
                  mouldSize: validation.mouldSize,
                })
              ),
          })
        ),
    });
  }

  submitForm(values: FormValues, existingTissue: boolean = false) {
    this.send({ type: "SUBMIT_FORM", values, existingTissue });
  }

  editSubmission() {
    this.send({ type: "EDIT_SUBMISSION" });
  }

  isComplete(): boolean {
    return this.current.matches("complete");
  }

  isSubmissionError(): boolean {
    return this.current.matches("submissionError");
  }

  isSubmitting(): boolean {
    return this.current.matches("submitting");
  }

  isReady(): boolean {
    return ["ready", "submitting", "clashed", "submissionError"].some((val) =>
      this.current.matches(val)
    );
  }

  submissionHasClash(): boolean {
    return this.current.matches("clashed");
  }
}
