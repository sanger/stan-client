import { MachinePresentationModel } from "./machinePresentationModel";
import {
  RegistrationContext,
  RegistrationEvent,
  RegistrationSchema,
} from "../machines/registration/registrationMachineTypes";
import { FormValues } from "../services/registrationService";

export default class RegistrationPresentationModel extends MachinePresentationModel<
  RegistrationContext,
  RegistrationSchema,
  RegistrationEvent
> {
  init() {
    this.submitForm = this.submitForm.bind(this);
  }

  get registrationResult() {
    return this.current.context.registrationResult;
  }

  get labelPrinterRef() {
    return this.current.context.labelPrinterRef;
  }

  get registrationErrors() {
    return this.current.context.registrationErrors;
  }

  get registrationInfo() {
    return this.current.context.registrationInfo;
  }

  get registrationSchema() {
    return this.current.context.registrationSchema;
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
