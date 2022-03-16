import { createMachine } from "xstate";
import { MachineServiceDone, MachineServiceError } from "../../types/stan";
import {
  CommentFieldsFragment,
  CostCodeFieldsFragment,
  CreateWorkMutation,
  GetWorkAllocationInfoQuery,
  ProjectFieldsFragment,
  WorkTypeFieldsFragment,
  WorkWithCommentFieldsFragment,
} from "../../types/sdk";
import { stanCore } from "../../lib/sdk";
import { assign } from "@xstate/immer";
import { ClientError } from "graphql-request";
import { WorkAllocationUrlParams } from "./WorkAllocation";

export enum NUMBER_TYPE_FIELD {
  BLOCKS = "Number of blocks",
  SLIDES = "Number of slides",
}

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
   * Number of blocks
   */
  numBlocks: number | undefined;
  /**
   * Number of Samples
   */
  numSlides: number | undefined;

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
    }
  | { type: "UPDATE_URL_PARAMS"; urlParams: WorkAllocationUrlParams }
  | {
      type: "UPDATE_WORK";
      workWithComment: WorkWithCommentFieldsFragment;
      rowIndex: number;
    }
  | {
      type: "SORT_WORKS";
      workWithComments: WorkWithCommentFieldsFragment[];
    };

type WorkAllocationContext = {
  /**
   * List of created Work with potential associated comment
   */
  workWithComments: Array<WorkWithCommentFieldsFragment>;

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
   * URL params to filter the SGP numbers on
   */
  urlParams: WorkAllocationUrlParams;

  /**
   * An error caused by a request to core
   */
  requestError?: ClientError;
};

type CreateWorkAllocationMachineParams = {
  urlParams: WorkAllocationUrlParams;
};

export default function createWorkAllocationMachine({
  urlParams,
}: CreateWorkAllocationMachineParams) {
  /**Hook to sort table*/
  return createMachine<WorkAllocationContext, WorkAllocationEvent>(
    {
      id: "workAllocation",
      context: {
        workWithComments: [],
        workTypes: [],
        projects: [],
        costCodes: [],
        availableComments: [],
        urlParams,
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
            UPDATE_URL_PARAMS: {
              actions: "assignUrlParams",
              target: "loading",
            },
            UPDATE_WORK: {
              actions: "updateWork",
              target: "ready",
            },
            SORT_WORKS: {
              actions: "assignSortedWorks",
            },
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
        assignUrlParams: assign((ctx, e) => {
          if (e.type !== "UPDATE_URL_PARAMS") return;
          ctx.urlParams = e.urlParams;
        }),

        assignWorkAllocationInfo: assign((ctx, e) => {
          if (e.type !== "done.invoke.loadWorkAllocationInfo") return;
          const {
            comments,
            projects,
            worksWithComments,
            workTypes,
            costCodes,
          } = e.data;
          ctx.availableComments = comments;
          ctx.projects = projects;
          ctx.workWithComments = worksWithComments;
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
          const {
            workNumber,
            workType,
            project,
            costCode,
            numBlocks,
            numSlides,
          } = e.data.createWork;
          const blockMessage = numBlocks ? `${numBlocks} blocks` : undefined;
          const slideMessage = numSlides ? `${numSlides} slides` : undefined;
          const blockSlideMsg =
            blockMessage && slideMessage
              ? `${blockMessage} and ${slideMessage}`
              : blockMessage
              ? blockMessage
              : slideMessage;
          ctx.successMessage = `Assigned ${workNumber} (${workType.name} - ${blockSlideMsg}) to project ${project.name} and cost code ${costCode.code} `;
        }),

        updateWork: assign((ctx, e) => {
          if (e.type !== "UPDATE_WORK") return;
          ctx.workWithComments.splice(e.rowIndex, 1, e.workWithComment);
        }),
        assignSortedWorks: assign((ctx, e) => {
          if (e.type !== "SORT_WORKS") return;
          e.workWithComments.forEach((workWithComment, indx) => {
            ctx.workWithComments.splice(indx, 1, workWithComment);
          });
        }),
        clearNotifications: assign((ctx) => {
          ctx.successMessage = undefined;
          ctx.requestError = undefined;
        }),
      },

      services: {
        allocateWork: (ctx, e) => {
          if (e.type !== "ALLOCATE_WORK") return Promise.reject();
          const {
            workType,
            project,
            costCode,
            isRnD,
            numBlocks,
            numSlides,
          } = e.values;

          return stanCore.CreateWork({
            workType,
            project,
            costCode,
            prefix: isRnD ? "R&D" : "SGP",
            numBlocks,
            numSlides,
          });
        },

        loadWorkAllocationInfo: (ctx) =>
          stanCore.GetWorkAllocationInfo({
            commentCategory: "Work status",
            workStatuses: ctx.urlParams.status,
          }),
      },
    }
  );
}
