import { assign, createMachine, fromPromise } from 'xstate';
import { ServerErrors } from '../../types/stan';
import {
  CommentFieldsFragment,
  CostCodeFieldsFragment,
  CreateWorkMutation,
  GetWorkAllocationInfoQuery,
  OmeroProjectFieldsFragment,
  ProgramFieldsFragment,
  ProjectFieldsFragment,
  ReleaseRecipientFieldsFragment,
  WorkTypeFieldsFragment,
  WorkWithCommentFieldsFragment
} from '../../types/sdk';
import { stanCore } from '../../lib/sdk';
import { WorkAllocationUrlParams } from './WorkAllocation';

export type WorkAllocationFormValues = {
  /**
   * The Work Type for this Work
   */
  workType: string;

  /**
   * The Work Requester for this Work
   */
  workRequester: string;

  /**
   * The name of the project
   */
  project: string;

  /**
   * The name of the program
   */
  program: string;

  /**
   * The name of the Omero project, if allocated
   */
  omeroProject?: string;

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
   * Number of Samples
   */
  numOriginalSamples: number | undefined;

  /**
   *The Sequencescape study id - set to string to to init the field the empty string and prevent formik console error
   */
  ssStudyId?: string;
  /**
   *The Sequencescape study name
   */
  studyName?: string;

  /**
   * Whether or not an R&D number is being created. Will use a different prefix on call to core.
   */
  isRnD: boolean;
};

type WorkAllocationEvent =
  | { type: 'xstate.done.actor.loadWorkAllocationInfo'; output: GetWorkAllocationInfoQuery }
  | { type: 'xstate.done.actor.allocateWork'; output: CreateWorkMutation }
  | { type: 'xstate.error.actor.allocateWork'; error: ServerErrors }
  | { type: 'xstate.error.actor.loadWorkAllocationInfo'; error: ServerErrors }
  | {
      type: 'ALLOCATE_WORK';
      values: WorkAllocationFormValues;
    }
  | { type: 'UPDATE_URL_PARAMS'; urlParams: WorkAllocationUrlParams }
  | {
      type: 'UPDATE_WORK';
      workWithComment: WorkWithCommentFieldsFragment;
      rowIndex: number;
    }
  | {
      type: 'SORT_WORKS';
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
   * List of enabled Work Requesters (Release recipients)
   */
  workRequesters: Array<ReleaseRecipientFieldsFragment>;

  /**
   * List of possible projects to allocate a Work to
   */
  projects: Array<ProjectFieldsFragment>;

  /**
   * List of possible Omero projects to allocate a Work to
   */
  omeroProjects: Array<OmeroProjectFieldsFragment>;

  /**
   * List of possible programs to allocate a Work to
   */
  programs: Array<ProgramFieldsFragment>;

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
   * New work number allocated
   */
  allocatedWorkNumber?: string;

  /**
   * URL params to filter the SGP numbers on
   */
  urlParams: WorkAllocationUrlParams;

  /**
   * An error caused by a request to core
   */
  requestError?: ServerErrors;
};

type CreateWorkAllocationMachineParams = {
  urlParams: WorkAllocationUrlParams;
};

export default function createWorkAllocationMachine({ urlParams }: CreateWorkAllocationMachineParams) {
  /**Hook to sort table*/
  return createMachine(
    {
      id: 'workAllocation',
      types: {} as {
        context: WorkAllocationContext;
        events: WorkAllocationEvent;
      },
      context: {
        workWithComments: [],
        workTypes: [],
        workRequesters: [],
        projects: [],
        programs: [],
        costCodes: [],
        omeroProjects: [],
        availableComments: [],
        urlParams
      },
      initial: 'loading',
      states: {
        loading: {
          invoke: {
            id: 'loadWorkAllocationInfo',
            src: fromPromise(({ input }) =>
              stanCore.GetWorkAllocationInfo({
                commentCategory: 'Work status',
                workStatuses: input.status
              })
            ),
            input: ({ context }) => ({ status: context.urlParams.status }),
            onDone: { actions: 'assignWorkAllocationInfo', target: 'ready' },
            onError: { actions: 'assignServerError', target: 'ready' }
          }
        },
        ready: {
          exit: ['clearNotifications'],
          on: {
            ALLOCATE_WORK: 'allocating',
            UPDATE_URL_PARAMS: {
              actions: 'assignUrlParams',
              target: 'loading'
            },
            UPDATE_WORK: {
              actions: 'updateWork',
              target: 'ready'
            },
            SORT_WORKS: {
              actions: 'assignSortedWorks'
            }
          }
        },
        allocating: {
          invoke: {
            id: 'allocateWork',
            src: fromPromise(({ input }) => {
              const {
                workType,
                workRequester,
                project,
                program,
                omeroProject,
                costCode,
                isRnD,
                numBlocks,
                numSlides,
                numOriginalSamples,
                ssStudyId
              } = input.values;
              return stanCore.CreateWork({
                workType,
                workRequester,
                project,
                program,
                costCode,
                prefix: isRnD ? 'R&D' : 'SGP',
                numBlocks,
                numSlides,
                numOriginalSamples,
                omeroProject,
                ssStudyId: ssStudyId ? Number(ssStudyId) : null
              });
            }),
            input: ({ event }) => {
              if (event.type !== 'ALLOCATE_WORK') return {};
              return {
                values: event.values
              };
            },
            onDone: { actions: 'assignSuccessMessage', target: 'loading' },
            onError: { actions: 'assignServerError', target: 'loading' }
          }
        }
      }
    },
    {
      actions: {
        assignUrlParams: assign(({ context, event }) => {
          if (event.type !== 'UPDATE_URL_PARAMS') return context;
          context.urlParams = event.urlParams;
          return context;
        }),

        assignWorkAllocationInfo: assign(({ context, event }) => {
          if (event.type !== 'xstate.done.actor.loadWorkAllocationInfo') return context;
          const {
            comments,
            projects,
            programs,
            omeroProjects,
            worksWithComments,
            workTypes,
            costCodes,
            releaseRecipients
          } = event.output;
          context.availableComments = comments;
          context.projects = projects;
          context.programs = programs;
          context.workWithComments = worksWithComments;
          context.workTypes = workTypes;
          context.costCodes = costCodes;
          context.omeroProjects = omeroProjects;
          context.workRequesters = releaseRecipients;
          return context;
        }),

        assignServerError: assign(({ context, event }) => {
          if (
            event.type !== 'xstate.error.actor.loadWorkAllocationInfo' &&
            event.type !== 'xstate.error.actor.allocateWork'
          ) {
            return context;
          }
          context.requestError = event.error;
          return context;
        }),

        assignSuccessMessage: assign(({ context, event }) => {
          if (event.type !== 'xstate.done.actor.allocateWork') return context;
          const {
            workNumber,
            workRequester,
            workType,
            project,
            program,
            costCode,
            numBlocks,
            numSlides,
            numOriginalSamples,
            omeroProject,
            dnapStudy
          } = event.output.createWork;
          const blockSlideSampleMsg = [
            numBlocks ? `${numBlocks} blocks` : undefined,
            numSlides ? `${numSlides} slides` : undefined,
            numOriginalSamples ? `${numOriginalSamples} original samples` : undefined
          ]
            .filter((msg) => msg)
            .join(' and ');
          context.allocatedWorkNumber = workNumber;
          context.successMessage = `Assigned ${workNumber} (${
            workType.name
          } - ${blockSlideSampleMsg}) to project (cost code description) ${project.name.trim()}${
            omeroProject ? `, Omero project ${omeroProject.name}` : ''
          }${dnapStudy ? `, DNAP study name '${dnapStudy.name}'` : ''} and program ${program.name} using cost code ${
            costCode.code
          } with the work requester ${workRequester?.username}`;
          return context;
        }),

        updateWork: assign(({ context, event }) => {
          if (event.type !== 'UPDATE_WORK') return context;
          context.workWithComments.splice(event.rowIndex, 1, event.workWithComment);
          return context;
        }),
        assignSortedWorks: assign(({ context, event }) => {
          if (event.type !== 'SORT_WORKS') return context;
          event.workWithComments.forEach((workWithComment, indx) => {
            context.workWithComments.splice(indx, 1, workWithComment);
          });
          return context;
        }),
        clearNotifications: assign(({ context }) => {
          context.successMessage = undefined;
          context.requestError = undefined;
          return context;
        })
      }
    }
  );
}
