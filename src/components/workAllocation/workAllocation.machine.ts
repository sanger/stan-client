import { assign, createMachine, fromPromise } from 'xstate';
import {
  CommentFieldsFragment,
  CostCode,
  CostCodeFieldsFragment,
  CreateWorkMutation,
  CurrentUserQuery,
  GetWorkAllocationInfoQuery,
  OmeroProjectFieldsFragment,
  ProgramFieldsFragment,
  ProjectFieldsFragment,
  ReleaseRecipientFieldsFragment,
  UserRole,
  WorkStatus,
  WorkTypeFieldsFragment,
  WorkWithCommentFieldsFragment
} from '../../types/sdk';
import { stanCore } from '../../lib/sdk';
import { WorkAllocationUrlParams } from './WorkAllocation';
import { ClientError } from 'graphql-request';
import { produce } from '../../dependencies/immer';

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
   * Whether an R&D number is being created. Will use a different prefix on call to core.
   */
  isRnD: boolean;
};

type WorkAllocationEvent =
  | {
      type: 'xstate.done.actor.loadWorkAllocationInfo';
      output: { workAllocation: GetWorkAllocationInfoQuery; currentUser: CurrentUserQuery };
    }
  | { type: 'xstate.done.actor.allocateWork'; output: CreateWorkMutation }
  | { type: 'xstate.error.actor.allocateWork'; error: ClientError }
  | { type: 'xstate.error.actor.loadWorkAllocationInfo'; error: ClientError }
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
    }
  | {
      type: 'ADD_NEWLY_CREATED_PROJECT';
      project: ProjectFieldsFragment;
    }
  | {
      type: 'ADD_NEWLY_CREATED_COST_CODE';
      costCode: CostCode;
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
  requestError?: ClientError;
};

type CreateWorkAllocationMachineParams = {
  urlParams: WorkAllocationUrlParams;
};

const getWorkAllocationInfo = ({ input }: { input: { status: WorkStatus } }) =>
  stanCore.GetWorkAllocationInfo({
    commentCategory: 'Work status',
    workStatuses: input.status
  });

const getCurrentUser = () => stanCore.CurrentUser();

const fetchWorkAllocationAndCurrentUser = ({ input }: { input: { status: WorkStatus } }) =>
  Promise.all([getWorkAllocationInfo({ input }), getCurrentUser()]).then(([workAllocationInfo, currentUser]) => {
    return { workAllocation: workAllocationInfo, currentUser };
  });

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
            src: fromPromise(({ input }) => fetchWorkAllocationAndCurrentUser({ input })),
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
            },
            ADD_NEWLY_CREATED_PROJECT: {
              actions: 'addNewlyCreatedProject'
            },
            ADD_NEWLY_CREATED_COST_CODE: {
              actions: 'addNewlyCreatedCostCode'
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
          return { ...context, urlParams: event.urlParams };
        }),

        assignWorkAllocationInfo: assign(({ context, event }) => {
          if (event.type !== 'xstate.done.actor.loadWorkAllocationInfo') return context;
          const { workAllocation, currentUser } = event.output;
          const {
            comments,
            projects,
            programs,
            omeroProjects,
            worksWithComments,
            workTypes,
            costCodes,
            releaseRecipients
          } = workAllocation;
          if (currentUser.user && currentUser.user.role === UserRole.Enduser) {
            releaseRecipients.push({
              username: currentUser.user!.username,
              fullName: currentUser.user!.username,
              enabled: true
            });
          }
          return {
            ...context,
            availableComments: comments,
            projects,
            programs,
            omeroProjects,
            workWithComments: worksWithComments,
            workTypes,
            costCodes,
            workRequesters: releaseRecipients
          };
        }),

        assignServerError: assign(({ context, event }) => {
          if (
            event.type !== 'xstate.error.actor.loadWorkAllocationInfo' &&
            event.type !== 'xstate.error.actor.allocateWork'
          ) {
            return context;
          }
          return { ...context, requestError: event.error };
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

          return produce(context, (draft) => {
            draft.allocatedWorkNumber = workNumber;
            draft.successMessage = `Assigned ${workNumber} (${
              workType.name
            } - ${blockSlideSampleMsg}) to project (cost code description) ${project.name.trim()}${
              omeroProject ? `, Omero project ${omeroProject.name}` : ''
            }${dnapStudy ? `, DNAP study name '${dnapStudy.name}'` : ''} and program ${program.name} using cost code ${
              costCode.code
            } with the work requester ${workRequester?.username}`;
          });
        }),

        updateWork: assign(({ context, event }) => {
          if (event.type !== 'UPDATE_WORK') return context;
          return produce(context, (draft) => {
            draft.workWithComments.splice(event.rowIndex, 1, event.workWithComment);
          });
        }),
        assignSortedWorks: assign(({ context, event }) => {
          if (event.type !== 'SORT_WORKS') return context;
          return produce(context, (draft) => {
            event.workWithComments.forEach((workWithComment, indx) => {
              draft.workWithComments.splice(indx, 1, workWithComment);
            });
          });
        }),
        clearNotifications: assign(({ context }) => {
          return { ...context, successMessage: undefined, requestError: undefined };
        }),
        addNewlyCreatedProject: assign(({ context, event }) => {
          if (event.type !== 'ADD_NEWLY_CREATED_PROJECT') return context;
          return produce(context, (draft) => {
            draft.projects.push(event.project);
          });
        }),
        addNewlyCreatedCostCode: assign(({ context, event }) => {
          if (event.type !== 'ADD_NEWLY_CREATED_COST_CODE') return context;
          return produce(context, (draft) => {
            draft.costCodes.push(event.costCode);
          });
        })
      }
    }
  );
}
