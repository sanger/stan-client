import { GetPrintersQuery, Labware } from "../../../types/graphql";
import { Maybe } from "graphql/jsutils/Maybe";
import { Actor } from "xstate";

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
   * The list of barcodes available to print
   */
  labwareBarcodes: Array<Labware["barcode"]>;
}

export interface LabelPrinterOptions {
  /**
   * Should this machine go fetch the printers from the API
   */
  fetchPrinters: boolean;
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
}
