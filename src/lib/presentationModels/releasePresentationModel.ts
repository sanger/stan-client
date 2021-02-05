import { MachinePresentationModel } from "./machinePresentationModel";
import {
  ReleaseContext,
  ReleaseEvent,
  ReleaseSchema,
} from "../machines/release/releaseMachineTypes";
import * as Yup from "yup";
import { ReleaseRequest } from "../../types/graphql";

export default class ReleasePresentationModel extends MachinePresentationModel<
  ReleaseContext,
  ReleaseSchema,
  ReleaseEvent
> {
  init() {
    this.onSubmit = this.onSubmit.bind(this);
  }

  /**
   * Create the validation schema for the release form
   */
  get formSchema(): Yup.ObjectSchema {
    return Yup.object().shape({
      barcodes: Yup.array()
        .label("Labware")
        .min(1, "Please scan in at least 1 labware")
        .of(Yup.string().required()),
      destination: Yup.string().required().label("Group/Team"),
      recipient: Yup.string().required().label("Contact"),
    });
  }

  get initialFormValues(): ReleaseRequest {
    return {
      barcodes: [],
      destination: "",
      recipient: "",
    };
  }

  get formLocked(): boolean {
    return this.current.matches("submitted");
  }

  get isSubmitting(): boolean {
    return this.current.matches("submitting");
  }

  get isSubmitted(): boolean {
    return this.current.matches("submitted");
  }

  get showWarning(): boolean {
    return !!this.context.serverError;
  }

  get releaseFilePath(): string | undefined {
    if (!this.isSubmitted) {
      return undefined;
    }
    const releaseIds = this.context.releaseResult.release.releases.map(
      (r) => r.id
    );
    return `/release?id=${releaseIds.join(",")}`;
  }

  onSubmit(formValues: ReleaseRequest) {
    this.send({ type: "SUBMIT", formValues });
  }
}
