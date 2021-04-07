import { MachinePresentationModel } from "./machinePresentationModel";
import * as Yup from "yup";
import RegistrationValidation from "../validation/registrationValidation";
import {
  SlideRegistrationContext,
  SlideRegistrationEvent,
  SlideRegistrationSchema,
} from "../machines/slideRegistration/slideRegistrationMachineTypes";
import { LifeStage, SectionRegisterRequest } from "../../types/graphql";
import _, { uniqueId } from "lodash";
import { LabwareTypeName } from "../../types/stan";

type SlideRegistrationFormSection = {
  clientId: string;
  donorId: string;
  lifeStage: LifeStage;
  species: string;
  hmdmc: string;
  tissueType: string;
  externalIdentifier: string;
  spatialLocation: number;
  replicateNumber: number;
  sectionNumber: number;
  sectionThickness: number;
};

export type SlideRegistrationFormLabware = {
  clientId: string;
  labwareTypeName: LabwareTypeName;
  externalSlideBarcode: string;
  fixative: string;
  medium: string;
  slots: { [key: string]: Array<SlideRegistrationFormSection> };
};

export type SlideRegistrationFormValues = {
  labwares: Array<SlideRegistrationFormLabware>;
};

export default class SlideRegistrationPresentationModel extends MachinePresentationModel<
  SlideRegistrationContext,
  SlideRegistrationSchema,
  SlideRegistrationEvent
> {
  init() {
    this.onSubmit = this.onSubmit.bind(this);
  }

  onSubmit(values: SlideRegistrationFormValues) {
    this.send({
      type: "SUBMIT_FORM",
      values: this.buildSectionRegisterRequest(values),
    });
  }

  get showInitialLabwareTypes(): boolean {
    return this.current.matches("selectingInitialLabware");
  }

  get isSubmitting(): boolean {
    return this.current.matches("submitting");
  }

  selectInitialLabwareType(labwareType: LabwareTypeName) {
    this.send({ type: "SELECT_INITIAL_LABWARE", labwareType });
  }

  get showForm(): boolean {
    return ["ready", "submitting", "submissionError"].some((val) =>
      this.current.matches(val)
    );
  }

  get showSubmissionErrors(): boolean {
    return this.current.matches("submissionError");
  }

  get showSummary(): boolean {
    return this.current.matches("complete");
  }

  get availableSlides(): Array<LabwareTypeName> {
    return [
      LabwareTypeName.SLIDE,
      LabwareTypeName.VISIUM_LP,
      LabwareTypeName.VISIUM_TO,
    ];
  }

  get initialFormValues(): SlideRegistrationFormValues {
    return {
      labwares: [this.buildLabware(this.context.initialLabwareType)],
    };
  }

  buildLabware(labwareTypeName: LabwareTypeName): SlideRegistrationFormLabware {
    return {
      clientId: uniqueId("labware_id"),
      labwareTypeName,
      externalSlideBarcode: "",
      fixative: "",
      medium: "",
      slots: { A1: [this.buildSample()] },
    };
  }

  buildSample(): SlideRegistrationFormSection {
    return {
      clientId: uniqueId("sample_id"),
      donorId: "",
      lifeStage: LifeStage.Adult,
      species: "",
      hmdmc: "",
      tissueType: "",
      externalIdentifier: "",
      spatialLocation: 0,
      replicateNumber: 0,
      sectionNumber: 0,
      sectionThickness: 0,
    };
  }

  get registrationInfo() {
    return this.context.registrationInfo;
  }

  get validationSchema() {
    const validation = new RegistrationValidation(this.registrationInfo);

    return Yup.object().shape({
      labwares: Yup.array()
        .min(1)
        .of(
          Yup.object().shape({
            externalSlideBarcode: validation.externalSlideBarcode,
            fixative: validation.fixative,
            medium: validation.medium,
            slots: Yup.lazy((obj: any) => {
              return Yup.object(
                _.mapValues(obj, (_value, _key) =>
                  Yup.array().of(
                    Yup.object().shape({
                      donorId: validation.donorId,
                      lifeStage: validation.lifeStage,
                      species: validation.species,
                      hmdmc: validation.hmdmc,
                      tissueType: validation.tissueType,
                      externalIdentifier: validation.sectionExternalIdentifier,
                      spatialLocation: validation.spatialLocation,
                      replicateNumber: validation.replicateNumber,
                      sectionNumber: validation.sectionNumber,
                      sectionThickness: validation.sectionThickness,
                    })
                  )
                )
              );
            }),
          })
        ),
    });
  }

  private buildSectionRegisterRequest(
    values: SlideRegistrationFormValues
  ): SectionRegisterRequest {
    return {
      labware: values.labwares.map((labware) => {
        return {
          externalBarcode: labware.externalSlideBarcode.trim(),
          labwareType: labware.labwareTypeName,
          contents: Object.keys(labware.slots).flatMap((address) => {
            return labware.slots[address].map((sample) => ({
              address,
              donorIdentifier: sample.donorId.trim(),
              externalIdentifier: sample.externalIdentifier.trim(),
              fixative: labware.fixative.trim(),
              hmdmc: sample.hmdmc.trim(),
              lifeStage: sample.lifeStage,
              medium: labware.medium.trim(),
              replicateNumber: sample.replicateNumber,
              sectionNumber: sample.sectionNumber,
              sectionThickness: sample.sectionThickness,
              spatialLocation: sample.spatialLocation,
              species: sample.species.trim(),
              tissueType: sample.tissueType.trim(),
            }));
          }),
        };
      }),
    };
  }
}
