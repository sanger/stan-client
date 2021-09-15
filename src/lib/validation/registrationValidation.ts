import * as validation from "./index";
import * as Yup from "yup";
import { GetRegistrationInfoQuery, LifeStage } from "../../types/sdk";

export default class RegistrationValidation {
  private registrationInfo: GetRegistrationInfoQuery;

  constructor(registrationInfo: GetRegistrationInfoQuery) {
    this.registrationInfo = registrationInfo;
  }

  get externalSlideBarcode() {
    return validation.requiredString({
      label: "External Slide Barcode",
    });
  }

  get fixative() {
    return validation.requiredString({
      label: "Fixative",
      oneOf: this.registrationInfo.fixatives.map((fixative) => fixative.name),
    });
  }

  get medium() {
    return validation.requiredString({
      label: "Medium",
      oneOf: this.registrationInfo.mediums.map((m) => m.name),
    });
  }

  get donorId() {
    return validation.requiredString({
      label: "Donor ID",
      // Don't allow contiguous spaces
      restrictChars: /^(?!.*\s\s)[a-z0-9_ .\\/,:;-]+$/i,
      errorMessage:
        "Donor ID contains invalid characters. Only letters, numbers, spaces, hyphens, slashes, backslashes, commas, colons, semicolons, full stops and underscores are permitted.",
    });
  }

  get lifeStage() {
    return validation.requiredString({
      label: "Life Stage",
      oneOf: Object.values(LifeStage),
    });
  }

  get species() {
    return validation.requiredString({
      label: "Species",
      oneOf: this.registrationInfo.species.map((s) => s.name),
    });
  }

  get hmdmc() {
    return Yup.string().when("species", {
      is: "Human",
      then: Yup.string()
        .oneOf(this.registrationInfo.hmdmcs.map((h) => h.hmdmc))
        .required()
        .label("HMDMC"),
      otherwise: Yup.string().length(0),
    });
  }

  get tissueType() {
    return validation.requiredString({
      label: "Tissue Type",
      oneOf: this.registrationInfo.tissueTypes.map((tt) => tt.name),
    });
  }

  get externalIdentifier() {
    return validation.requiredString({
      label: "External Identifier",
      restrictChars: validation.DEFAULT_PERMITTED_CHARS,
    });
  }

  get sectionExternalIdentifier() {
    return validation.requiredString({
      label: "Section External Identifier",
      restrictChars: validation.DEFAULT_PERMITTED_CHARS,
    });
  }

  get spatialLocation() {
    return validation.requiredNumber({
      label: "Spatial Location",
      min: 0,
    });
  }

  get replicateNumber() {
    return validation.requiredNumber({
      label: "Replicate Number",
      min: 1,
    });
  }

  get lastKnownSectionNumber() {
    return validation.requiredNumber({
      label: "Last Known Section Number",
      min: 0,
    });
  }

  get sectionNumber() {
    return validation.requiredNumber({
      label: "Section Number",
      min: 0,
    });
  }

  get sectionThickness() {
    return Yup.number().integer().min(0).label("Section Thickness");
  }

  get labwareType() {
    return validation.requiredString({
      label: "Labware Type",
      oneOf: this.registrationInfo.labwareTypes.map((lt) => lt.name),
    });
  }

  get mouldSize() {
    return validation.requiredString({
      label: "Mould Size",
      oneOf: this.registrationInfo.mouldSizes.map((ms) => ms.name),
    });
  }
}
