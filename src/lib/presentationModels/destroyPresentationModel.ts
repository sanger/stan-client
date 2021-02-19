import { MachinePresentationModel } from "./machinePresentationModel";
import {
  DestroyContext,
  DestroyEvent,
  DestroySchema,
} from "../machines/destroy/destroyMachineTypes";
import * as Yup from "yup";
import { DestroyRequest } from "../../types/graphql";

export default class DestroyPresentationModel extends MachinePresentationModel<
  DestroyContext,
  DestroySchema,
  DestroyEvent
> {
  init() {
    this.onSubmit = this.onSubmit.bind(this);
  }

  get formSchema(): Yup.ObjectSchema {
    return Yup.object().shape({
      barcodes: Yup.array()
        .label("Labware")
        .min(1, "Please scan in at least 1 labware")
        .of(Yup.string().required()),
      reasonId: Yup.number()
        .required()
        .oneOf(this.destructionReasonIds, "Please choose a reason")
        .label("Reason"),
    });
  }

  get initialFormValues(): DestroyRequest {
    return {
      barcodes: [],
      reasonId: -1,
    };
  }

  get isDestroyed(): boolean {
    return this.current.matches("destroyed");
  }

  get isDestroying(): boolean {
    return this.current.matches("destroying");
  }

  get showWarning(): boolean {
    return this.current.matches("ready") && !!this.context.serverError;
  }

  get formLocked(): boolean {
    return !this.current.matches("ready");
  }

  onSubmit(request: DestroyRequest) {
    this.send({ type: "SUBMIT", request });
  }

  private get destructionReasonIds(): Array<number> {
    return this.context.destroyInfo.destructionReasons.map((dr) => dr.id);
  }

  private get destructionReasons(): Array<string> {
    return this.context.destroyInfo.destructionReasons.map((dr) => dr.text);
  }
}
