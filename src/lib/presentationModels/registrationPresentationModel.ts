import { MachinePresentationModel } from "./machinePresentationModel";
import {
  RegistrationContext,
  RegistrationEvent,
  RegistrationSchema,
} from "../machines/registration/registrationMachineTypes";
import { FormValues } from "../services/registrationService";
import { LabwareTypeName } from "../../types/stan";

export default class RegistrationPresentationModel extends MachinePresentationModel<
  RegistrationContext,
  RegistrationSchema,
  RegistrationEvent
> {
  init() {
    this.submitForm = this.submitForm.bind(this);
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

  get registrationSchema() {
    return this.context.registrationSchema;
  }

  get availableLabwareTypes() {
    return this.context.registrationInfo.labwareTypes.filter((lt) =>
      this.context.availableLabwareTypes.includes(lt.name as LabwareTypeName)
    );
  }

  submitForm(values: FormValues) {
    this.send({ type: "SUBMIT_FORM", values });
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
    return ["ready", "submitting", "submissionError"].some((val) =>
      this.current.matches(val)
    );
  }
}
