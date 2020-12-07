import {
  GetRegistrationInfoQuery,
  RegisterTissuesMutation,
} from "../../../types/graphql";
import * as Yup from "yup";
import { ServerErrors } from "../../../types/stan";

export interface RegistrationContext {
  loadingError: string;
  registrationInfo: GetRegistrationInfoQuery;
  registrationSchema: Yup.ObjectSchema;
  registrationResult: RegisterTissuesMutation;
  registrationErrors: ServerErrors;
}
