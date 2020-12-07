import { FormValues } from "../../../pages/registration/RegistrationForm";
import {
  GetRegistrationInfoQueryResult,
  RegisterTissuesMutationResult,
} from "../../../types/graphql";
import { ApolloError } from "@apollo/client";

type RetryEvent = { type: "RETRY" };
type SubmitFormEvent = { type: "SUBMIT_FORM"; values: FormValues };

type FetchingDoneEvent = {
  type: "done.invoke.getRegistrationInfo";
  data: GetRegistrationInfoQueryResult;
};

type FetchingErrorEvent = {
  type: "error.platform";
  data: ApolloError;
};

type SubmittingDoneEvent = {
  type: "done.invoke.submitting";
  data: RegisterTissuesMutationResult;
};

type SubmittingErrorEvent = {
  type: "error.platform.submitting";
  data: ApolloError;
};

export type RegistrationEvent =
  | RetryEvent
  | SubmitFormEvent
  | FetchingDoneEvent
  | FetchingErrorEvent
  | SubmittingDoneEvent
  | SubmittingErrorEvent;
