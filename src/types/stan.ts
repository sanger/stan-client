import {
  GetPrintersQuery,
  LabelType,
  Labware,
  LabwareLayoutFragment as LabwareLayout,
  Maybe,
  PlanRequestAction,
  Size,
} from "./graphql";
import { ApolloError } from "@apollo/client";

/**
 * Union of STAN's {@link OperationType} names
 */
export type OperationTypeName = "Section";

/**
 * Enum for all of STAN's {@link LabwareType} names
 */
export enum LabwareTypeName {
  PROVIASETTE = "Proviasette",
  TUBE = "Tube",
  VISIUM_LP = "Visium LP",
  VISIUM_TO = "Visium TO",
  SLIDE = "Slide",
}

export type Address = string;

export type SizeInput = Omit<Size, "__typename">;

/**
 * A {@link PlanRequestAction} before it knows where it's going
 */
export type SourcePlanRequestAction = Omit<PlanRequestAction, "address">;

/**
 * Type for when a piece of labware has been created in the client, but has not
 * yet been persisted, and so will not have a barcode yet.
 */
export type NewLabwareLayout = Nullable<LabwareLayout, "barcode">;

export interface ServerErrors {
  /**
   * The error message
   */
  message: Maybe<string>;

  /**
   * A list of problems that stopped the request from succeeding
   */
  problems: string[];
}

/**
 * Builds a {@link ServerErrors} object from an ApolloError
 * @param e ApolloError
 */
export function extractServerErrors(e: ApolloError): ServerErrors {
  const matchArray = e.message.match(/^.*\s:\s(.*)$/);

  return {
    message: matchArray !== null ? matchArray[1] : null,
    problems: e.graphQLErrors.reduce<string[]>(
      (memo, graphQLError, index, original) => {
        if (!graphQLError.extensions?.hasOwnProperty("problems")) {
          return memo;
        }
        return [...memo, ...graphQLError.extensions["problems"]];
      },
      []
    ),
  };
}

/**
 * Construct a new type of {@code T} but with the keys {@code K} made nullable
 *
 * @param T the type
 * @param K the union of keys to make nullable
 */
export type Nullable<T, K extends keyof T> = Omit<T, K> &
  { [P in K]: T[P] | null };

/**
 * A piece of labware than can be printed i.e. has a label type
 */
export type PrintableLabware = Pick<Labware, "barcode"> & {
  labwareType: {
    labelType?: Maybe<Pick<LabelType, "name">>;
  };
};

export type PrintResultType = {
  successful: boolean;
  labelsPerBarcode: number;
  printer: GetPrintersQuery["printers"][number];
  labwares: Array<PrintableLabware>;
};
