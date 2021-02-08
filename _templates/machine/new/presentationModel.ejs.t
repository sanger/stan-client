---
to: src/lib/presentationModels/<%= name %>PresentationModel.ts
---
import { MachinePresentationModel } from "./machinePresentationModel";
import {
  <%= Name %>Context,
  <%= Name %>Event,
  <%= Name %>Schema,
} from "../machines/<%= name %>/<%= name %>MachineTypes";

export default class <%= Name %>PresentationModel extends MachinePresentationModel<
  <%= Name %>Context,
  <%= Name %>Schema,
  <%= Name %>Event
> {
  init() { }
}
