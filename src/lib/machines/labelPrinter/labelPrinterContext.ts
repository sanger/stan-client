import { GetPrintersQuery, LabelType, Labware } from "../../../types/graphql";
import { Maybe } from "graphql/jsutils/Maybe";

export interface LabelPrinter {
  /**
   * Printers from the GetPrinters query
   */
  printers: GetPrintersQuery["printers"];

  /**
   * The currently selected printer
   */
  selectedPrinter: Maybe<GetPrintersQuery["printers"][number]>;

  /**
   * The list of labwares with their labware types, and their labware type's label type (if they have one)
   */
  labwares: Array<
    Pick<Labware, "barcode"> & {
      labwareType: {
        labelType?: Maybe<Pick<LabelType, "name">>;
      };
    }
  >;
}

export interface LabelPrinterOptions {
  /**
   * Should this machine go fetch the printers from the API
   */
  fetchPrinters: boolean;

  /**
   * Should the Label Printer component show notifications
   */
  showNotifications: boolean;
}

export interface LabelPrinterContext {
  /**
   * Label Printer
   */
  labelPrinter: LabelPrinter;

  /**
   * Options for the machine
   */
  options: LabelPrinterOptions;

  /**
   * Message if a print has been successful
   */
  successMessage?: string;

  /**
   * Message if a print failed
   */
  errorMessage?: string;
}
