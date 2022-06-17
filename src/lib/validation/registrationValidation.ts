import * as validation from "./index";
import * as Yup from "yup";
import { GetRegistrationInfoQuery, LifeStage } from "../../types/sdk";

export default class RegistrationValidation {
  private registrationInfo: GetRegistrationInfoQuery;
  private tissueSampleRegistration: boolean;

  constructor(
    registrationInfo: GetRegistrationInfoQuery,
    tissueSampleRegistration?: boolean
  ) {
    this.registrationInfo = registrationInfo;
    this.tissueSampleRegistration = tissueSampleRegistration ?? false;
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

  get solution() {
    return validation.requiredString({
      label: "Solution",
      oneOf: this.registrationInfo.solutions.map((m) => m.name),
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
        .label("HuMFre"),
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
    if (this.tissueSampleRegistration) {
      return validation.optionalString({
        label: "External Identifier",
        restrictChars: validation.DEFAULT_PERMITTED_CHARS,
      });
    } else {
      return validation.requiredString({
        label: "External Identifier",
        restrictChars: validation.DEFAULT_PERMITTED_CHARS,
      });
    }
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
    if (this.tissueSampleRegistration) {
      return validation.optionalString({
        label: "Replicate Number",
        restrictChars: /^[1-9]\d*[a-z]?$/,
        errorMessage:
          "Replicate Number must be a positive integer, optionally followed by a lower case letter.",
      });
    } else {
      return validation.requiredString({
        label: "Replicate Number",
        restrictChars: /^[1-9]\d*[a-z]?$/,
        errorMessage:
          "Replicate Number must be a positive integer, optionally followed by a lower case letter.",
      });
    }
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

  get sampleCollectionDate() {
    return Yup.date().when("lifeStage", {
      is: LifeStage.Fetal,
      then: Yup.date()
        .max(
          new Date(),
          `Please select a date on or before ${new Date().toLocaleDateString()}`
        )
        .nullable()
        .transform((curr, orig) => (orig === "" ? null : curr))
        .required(
          "Sample Collection Date is a required field for fetal samples"
        )
        .label("Sample Collection Date"),
      otherwise: Yup.date().notRequired(),
    });
  }
}
