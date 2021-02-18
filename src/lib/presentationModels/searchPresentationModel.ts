import * as Yup from "yup";
import { MachinePresentationModel } from "./machinePresentationModel";
import {
  SearchContext,
  SearchEvent,
  SearchSchema,
} from "../machines/search/searchMachineTypes";
import { FindRequest } from "../../types/graphql";
import { history } from "../client";
import { stringify } from "../helpers";

export default class SearchPresentationModel extends MachinePresentationModel<
  SearchContext,
  SearchSchema,
  SearchEvent
> {
  init() {
    this.onFormSubmit = this.onFormSubmit.bind(this);
  }

  get defaultFindRequest(): FindRequest {
    return this.context.findRequest;
  }

  get validationSchema(): Yup.ObjectSchema {
    return Yup.object()
      .shape({
        labwareBarcode: Yup.string().ensure(),
        tissueExternalName: Yup.string().ensure(),
        donorName: Yup.string().ensure(),
      })
      .test({
        name: "atLeastOneRequired",
        test: function (value) {
          const isValid = !!(
            value?.labwareBarcode.trim() ||
            value?.tissueExternalName.trim() ||
            value?.donorName.trim()
          );

          if (isValid) return true;
          return this.createError({
            path: "labwareBarcode | tissueExternalName | donorName",
            message:
              "At least one of STAN Barcode, External Identifier, or Donor ID must not be empty.",
          });
        },
      });
  }

  get tissueTypes() {
    return this.context.searchInfo.tissueTypes;
  }

  get isButtonDisabled(): boolean {
    return this.current.matches("searching");
  }

  get showLoadingSpinner(): boolean {
    return this.current.matches("searching");
  }

  get showResults(): boolean {
    return this.current.matches("searched") && this.searchResult.numRecords > 0;
  }

  get showServerError(): boolean {
    return this.context.serverError != null;
  }

  get serverError() {
    return this.context.serverError;
  }

  get showEmptyNotification(): boolean {
    return (
      this.current.matches("searched") && this.searchResult.numRecords === 0
    );
  }

  get showWarning(): boolean {
    if (!this.searchResult) {
      return false;
    }
    return this.searchResult.numRecords > this.searchResult.numDisplayed;
  }

  get showEmptyResults(): boolean {
    return (
      this.current.matches("searched") && this.searchResult.numRecords === 0
    );
  }

  get defaultSort() {
    return [{ id: "donorId" }];
  }

  get searchResult() {
    return this.context.searchResult;
  }

  onFormSubmit(request: FindRequest) {
    this.send({ type: "FIND", request });
    // Replace instead of push so user doesn't have to go through a load of old searches when going back
    history.replace(`/search?${stringify(request)}`);
  }
}
