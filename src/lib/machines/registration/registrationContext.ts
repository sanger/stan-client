import {
  GetRegistrationInfoQuery,
  RegisterTissuesMutation,
} from "../../../types/graphql";
import * as Yup from "yup";
import { LabwareTypeName, ServerErrors } from "../../../types/stan";
import { LabelPrinterActorRef } from "../labelPrinter";

export interface RegistrationContext {
  loadingError: string;
  registrationInfo: GetRegistrationInfoQuery;
  registrationSchema: Yup.ObjectSchema;
  registrationResult: RegisterTissuesMutation;
  registrationErrors: ServerErrors;
  labelPrinterRef: LabelPrinterActorRef;
}
