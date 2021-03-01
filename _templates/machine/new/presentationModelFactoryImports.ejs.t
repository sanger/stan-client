---
inject: true
to: src/lib/factories/presentationModelFactory.ts
before: HYGEN MARKER
---
import {
  <%= Name %>MachineService,
  <%= Name %>State,
} from "../machines/<%= name %>/<%= name %>MachineTypes";
import <%= Name %>PresentationModel from "../presentationModels/<%= name %>PresentationModel";