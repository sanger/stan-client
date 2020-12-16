import { Labware, Maybe } from "../../../types/graphql";
import * as Yup from "yup";

/**
 * Context for a {@link labwareMachine}.
 */
export interface LabwareContext {
  /**
   * The current barcode we're working with
   */
  currentBarcode: string;

  /**
   * The list of sourceLabwares fetched so far
   */
  labwares: Labware[];

  /**
   * A {@link https://github.com/jquense/yup#string Yup string schema} to validate the barcode on submission
   */
  validator: Yup.StringSchema;

  /**
   * The current success message
   */
  successMessage: Maybe<string>;

  /**
   * The current error message
   */
  errorMessage: Maybe<string>;
}
