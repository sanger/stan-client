import { createMachine } from "xstate";
import { MachineServiceDone, MachineServiceError } from "../../types/stan";
import {
  CommentFieldsFragment,
  CostCodeFieldsFragment,
  CreateWorkMutation,
  GetWorkAllocationInfoQuery,
  ProjectFieldsFragment,
  WorkFieldsFragment,
  WorkTypeFieldsFragment,
} from "../../types/sdk";
import { stanCore } from "../../lib/sdk";
import { assign } from "@xstate/immer";
import { ClientError } from "graphql-request";

export type WorkAllocationFormValues = {
  /**
   * The Work Type for this Work
   */
  workType: string;

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

type WorkAllocationEvent =
  | MachineServiceDone<"loadWorkAllocationInfo", GetWorkAllocationInfoQuery>
  | MachineServiceDone<"allocateWork", CreateWorkMutation>
  | MachineServiceError<"loadWorkAllocationInfo">
  | MachineServiceError<"allocateWork">
  | {
      type: "ALLOCATE_WORK";
      values: WorkAllocationFormValues;
    };

type WorkAllocationContext = {
  /**
   * List of created Work
   */
  works: Array<WorkFieldsFragment>;

  /**
   * List of enabled Work Types
   */
  workTypes: Array<WorkTypeFieldsFragment>;

  /**
   * List of possible projects to allocate a Work to
   */
  projects: Array<ProjectFieldsFragment>;

  /**
   * List of cost codes to to allocate Work to
   */
  costCodes: Array<CostCodeFieldsFragment>;

  /**
   * List of possible reasons Work state changed
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

export default function createWorkAllocationMachine() {
  return createMachine<WorkAllocationContext, WorkAllocationEvent>(
    {
      id: "workAllocation",
      context: {
        works: [],
        workTypes: [],
        projects: [],
        costCodes: [],
        availableComments: [],
      },
      initial: "loading",
      states: {
        loading: {
          invoke: {
            src: "loadWorkAllocationInfo",
            onDone: { actions: "assignWorkAllocationInfo", target: "ready" },
            onError: { actions: "assignServerError", target: "ready" },
          },
        },
        ready: {
          exit: "clearNotifications",
          on: {
            ALLOCATE_WORK: "allocating",
          },
        },
        allocating: {
          invoke: {
            src: "allocateWork",
            onDone: { actions: "assignSuccessMessage", target: "loading" },
            onError: { actions: "assignServerError", target: "loading" },
          },
        },
      },
    },
    {
      actions: {
        assignWorkAllocationInfo: assign((ctx, e) => {
          if (e.type !== "done.invoke.loadWorkAllocationInfo") return;
          const { comments, projects, works, workTypes, costCodes } = e.data;
          ctx.availableComments = comments;
          ctx.projects = projects;
          ctx.works = works;
          ctx.workTypes = workTypes;
          ctx.costCodes = costCodes;
        }),

        assignServerError: assign((ctx, e) => {
          if (
            e.type !== "error.platform.loadWorkAllocationInfo" &&
            e.type !== "error.platform.allocateWork"
          ) {
            return;
          }
          ctx.requestError = e.data;
        }),

        assignSuccessMessage: assign((ctx, e) => {
          if (e.type !== "done.invoke.allocateWork") return;
          const { workNumber, workType, project, costCode } = e.data.createWork;
          ctx.successMessage = `Assigned ${workNumber} (${workType.name}) to project ${project.name} and cost code ${costCode.code}`;
        }),

        clearNotifications: assign((ctx) => {
          ctx.successMessage = undefined;
          ctx.requestError = undefined;
        }),
      },

      services: {
        allocateWork: (ctx, e) => {
          if (e.type !== "ALLOCATE_WORK") return Promise.reject();
          const { workType, project, costCode, isRnD } = e.values;
          return stanCore.CreateWork({
            workType,
            project,
            costCode,
            prefix: isRnD ? "R&D" : "SGP",
          });
        },

        loadWorkAllocationInfo: () =>
          stanCore.GetWorkAllocationInfo({ commentCategory: "Work status" }),
      },
    }
  );
}
