import { MachinePresentationModel } from "./machinePresentationModel";
import {
  RegistrationContext,
  RegistrationEvent,
  RegistrationSchema,
} from "../machines/registration/registrationMachineTypes";

export default class ReleasePresentationModel extends MachinePresentationModel<
  RegistrationContext,
  RegistrationSchema,
  RegistrationEvent
> {
  init() {
    this.onClick = this.onClick.bind(this);
  }

  get title(): string {
    return String(Math.random()) + " y o o o";
  }

  isReady() {
    return this.current.matches("ready");
  }

  onClick() {
    console.log("Form submission");
  }

  currentValue() {
    return this.current.value;
  }
}
