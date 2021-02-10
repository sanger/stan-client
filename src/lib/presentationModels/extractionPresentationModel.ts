import { MachinePresentationModel } from "./machinePresentationModel";
import {
  ExtractionContext,
  ExtractionEvent,
  ExtractionSchema,
} from "../machines/extraction/extractionMachineTypes";
import { Labware } from "../../types/graphql";
import { buildSampleColors } from "../helpers/labwareHelper";

export default class ExtractionPresentationModel extends MachinePresentationModel<
  ExtractionContext,
  ExtractionSchema,
  ExtractionEvent
> {
  init() {
    this.extract = this.extract.bind(this);
    this.updateLabwares = this.updateLabwares.bind(this);
  }

  get isLabwareScanPanelLocked(): boolean {
    return (
      !this.current.matches("ready") &&
      !this.current.matches("extractionFailed")
    );
  }

  get sampleColors(): Map<number, string> {
    if (!this.context.labwares) {
      return new Map();
    }
    return buildSampleColors(this.context.labwares);
  }

  get isExtractBtnEnabled(): boolean {
    return (
      (this.current.matches("ready") ||
        this.current.matches("extractionFailed")) &&
      this.context.labwares.length > 0
    );
  }

  get showExtractionTubes(): boolean {
    return this.current.matches("extracted");
  }

  get showGrayPanel(): boolean {
    return (
      this.current.matches("ready") || this.current.matches("extractionFailed")
    );
  }

  get showServerErrors(): boolean {
    return this.current.matches("extractionFailed");
  }

  get destinationLabwares() {
    return this.context.extraction.extract.labware;
  }

  get extractionTableData() {
    if (!this.context.extraction) {
      return [];
    }
    const sourceLabwares = this.context.labwares;
    const destinationLabwares = this.destinationLabwares;
    const sampleColors = buildSampleColors(destinationLabwares);

    return this.context.extraction.extract.operations[0].planActions.map(
      (action) => {
        return {
          sampleColor: sampleColors.get(action.sample.id),
          sourceLabware: sourceLabwares.find(
            (lw) => lw.id === action.source.labwareId
          ),
          destinationLabware: destinationLabwares.find(
            (lw) => lw.id === action.destination.labwareId
          ),
        };
      }
    );
  }

  updateLabwares(labwares: Labware[]) {
    this.send({ type: "UPDATE_LABWARES", labwares });
  }

  extract() {
    this.send({ type: "EXTRACT" });
  }
}
