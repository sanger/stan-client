import { createMachine } from "xstate";
import { MachineServiceDone, MachineServiceError } from "../../types/stan";
import {
  CommentFieldsFragment,
  CostCodeFieldsFragment,
  CreateSasNumberMutation,
  GetSasAllocationInfoQuery,
  ProjectFieldsFragment,
  SasNumberFieldsFragment,
} from "../../types/sdk";
import { stanCore } from "../../lib/sdk";
import { assign } from "@xstate/immer";
import { ClientError } from "graphql-request";

export type SasAllocationFormValues = {
  /**
   * The name of the project
   */
  project: string;

  /**
   * Cost code
   */
  costCode: string;

  /**
   * Whether or not an R&D number is being created. Will use a different prefix on call to core.
   */
  isRnD: boolean;
};

type SasAllocationEvent =
  | MachineServiceDone<"loadSasAllocationInfo", GetSasAllocationInfoQuery>
  | MachineServiceDone<"allocateSasNumber", CreateSasNumberMutation>
  | MachineServiceError<"loadSasAllocationInfo">
  | MachineServiceError<"allocateSasNumber">
  | {
      type: "ALLOCATE_SAS";
      values: SasAllocationFormValues;
    };

type SasAllocationContext = {
  /**
   * List of created SAS numbers
   */
  sasNumbers: Array<SasNumberFieldsFragment>;

  /**
   * List of possible projects to allocate an SAS to
   */
  projects: Array<ProjectFieldsFragment>;

  /**
   * List of cost codes to to allocate an SAS to
   */
  costCodes: Array<CostCodeFieldsFragment>;

  /**
   * List of possible reasons an SAS changed state
   */
  availableComments: Array<CommentFieldsFragment>;

  /**
   * Notification to show to the user when something good happens
   */
  successMessage?: string;

  /**
   * An error caused by a request to core
   */
  requestError?: ClientError;
};

export default function createSasAllocationMachine() {
  return createMachine<SasAllocationContext, SasAllocationEvent>(
    {
      id: "sasAllocation",
      context: {
        sasNumbers: [],
        projects: [],
        costCodes: [],
        availableComments: [],
      },
      initial: "loading",
      states: {
        loading: {
          invoke: {
            src: "loadSasAllocationInfo",
            onDone: { actions: "assignSasAllocationInfo", target: "ready" },
            onError: { actions: "assignServerError", target: "ready" },
          },
        },
        ready: {
          exit: "clearNotifications",
          on: {
            ALLOCATE_SAS: "allocating",
          },
        },
        allocating: {
          invoke: {
            src: "allocateSasNumber",
            onDone: { actions: "assignSuccessMessage", target: "loading" },
            onError: { actions: "assignServerError", target: "loading" },
          },
        },
      },
    },
    {
      actions: {
        assignSasAllocationInfo: assign((ctx, e) => {
          if (e.type !== "done.invoke.loadSasAllocationInfo") return;
          const { comments, projects, sasNumbers, costCodes } = e.data;
          ctx.availableComments = comments;
          ctx.projects = projects;
          ctx.sasNumbers = sasNumbers;
          ctx.costCodes = costCodes;
        }),

        assignServerError: assign((ctx, e) => {
          if (
            e.type !== "error.platform.loadSasAllocationInfo" &&
            e.type !== "error.platform.allocateSasNumber"
          ) {
            return;
          }
          ctx.requestError = e.data;
        }),

        assignSuccessMessage: assign((ctx, e) => {
          if (e.type !== "done.invoke.allocateSasNumber") return;
          const { sasNumber, project, costCode } = e.data.createSasNumber;
          ctx.successMessage = `Assigned ${sasNumber} to project ${project.name} and cost code ${costCode.code}`;
        }),

        clearNotifications: assign((ctx) => {
          ctx.successMessage = undefined;
          ctx.requestError = undefined;
        }),
      },

      services: {
        allocateSasNumber: (ctx, e) => {
          if (e.type !== "ALLOCATE_SAS") return Promise.reject();
          const { project, costCode, isRnD } = e.values;
          return stanCore.CreateSasNumber({
            project,
            costCode,
            prefix: isRnD ? "R&D" : "SAS",
          });
        },

        loadSasAllocationInfo: () =>
          stanCore.GetSasAllocationInfo({ commentCategory: "SAS status" }),
      },
    }
  );
}
