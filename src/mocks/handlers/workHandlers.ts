import { graphql } from 'msw';
import {
  CreateWorkMutation,
  CreateWorkMutationVariables,
  FindWorkInfoQuery,
  FindWorkInfoQueryVariables,
  FindWorkNumbersQuery,
  FindWorkNumbersQueryVariables,
  GetAllWorkInfoQuery,
  GetSuggestedLabwareForWorkQuery,
  GetSuggestedLabwareForWorkQueryVariables,
  GetWorkAllocationInfoQuery,
  GetWorkAllocationInfoQueryVariables,
  GetWorkNumbersQuery,
  GetWorkNumbersQueryVariables,
  OmeroProject,
  UpdateWorkNumBlocksMutation,
  UpdateWorkNumBlocksMutationVariables,
  UpdateWorkNumSlidesMutation,
  UpdateWorkNumSlidesMutationVariables,
  UpdateWorkOmeroProjectMutation,
  UpdateWorkOmeroProjectMutationVariables,
  UpdateWorkPriorityMutation,
  UpdateWorkPriorityMutationVariables,
  UpdateWorkStatusMutation,
  UpdateWorkStatusMutationVariables,
  WorkStatus,
  FindWorksCreatedByQuery,
  FindWorksCreatedByQueryVariables,
  DnapStudy,
  UpdateWorkDnapProjectMutation,
  UpdateWorkDnapProjectMutationVariables
} from '../../types/sdk';
import costCodeRepository from '../repositories/costCodeRepository';
import projectRepository from '../repositories/projectRepository';
import commentRepository from '../repositories/commentRepository';
import workRepository from '../repositories/workRepository';
import workFactory from '../../lib/factories/workFactory';
import { isEnabled } from '../../lib/helpers';
import workTypeRepository from '../repositories/workTypeRepository';
import { sample } from 'lodash';
import releaseRecipientRepository from '../repositories/releaseRecipientRepository';
import programRepository from '../repositories/programRepository';
import omeroProjectRepository from '../repositories/omeroProjectRepository';
import labwareFactory from '../../lib/factories/labwareFactory';
import dnapStudyRepository from '../repositories/dnapStudyRepository';

const workHandlers = [
  graphql.query<GetWorkAllocationInfoQuery, GetWorkAllocationInfoQueryVariables>(
    'GetWorkAllocationInfo',
    (req, res, ctx) => {
      const comments = commentRepository
        .findAll()
        .filter((comment) => comment.category === req.variables.commentCategory && isEnabled(comment));
      let works = workRepository.findAll();

      if (req.variables.workStatuses) {
        let workStatuses = Array.isArray(req.variables.workStatuses)
          ? req.variables.workStatuses
          : [req.variables.workStatuses];

        if (workStatuses.length > 0) {
          works = works.filter((work) => workStatuses.includes(work.status));
        }
      }

      return res(
        ctx.data({
          costCodes: costCodeRepository.findAll().filter(isEnabled),
          omeroProjects: omeroProjectRepository.findAll().filter(isEnabled),
          projects: projectRepository.findAll().filter(isEnabled),
          programs: programRepository.findAll().filter(isEnabled),
          comments,
          worksWithComments: works.map((work) => {
            return {
              work,
              comment: [WorkStatus.Failed, WorkStatus.Paused, WorkStatus.Withdrawn].includes(work.status)
                ? sample(comments)?.text
                : undefined
            };
          }),
          workTypes: workTypeRepository.findAll().filter(isEnabled),
          releaseRecipients: releaseRecipientRepository.findAll().filter(isEnabled),
          dnapStudies: dnapStudyRepository.findAll().filter(isEnabled)
        })
      );
    }
  ),
  graphql.query<FindWorkInfoQuery, FindWorkInfoQueryVariables>('FindWorkInfo', (req, res, ctx) => {
    return res(
      ctx.data({
        works: workRepository
          .findAll()
          .filter((w) => w.status === req.variables.status)
          .map((work) => {
            return {
              __typename: 'Work',
              workNumber: work.workNumber,
              project: {
                __typename: 'Project',
                name: work.project.name
              },
              program: {
                __typename: 'Program',
                name: work.program.name
              },
              workRequester: {
                __typename: 'ReleaseRecipient',
                username: work.workRequester ? work.workRequester.username : ''
              },
              omeroProject: {
                __typename: 'OmeroProject',
                name: work.omeroProject?.name
              }
            };
          })
      })
    );
  }),

  graphql.query<FindWorksCreatedByQuery, FindWorksCreatedByQueryVariables>('FindWorksCreatedBy', (req, res, ctx) => {
    return res(
      ctx.data({
        worksCreatedBy: workRepository.findAll()
      })
    );
  }),

  graphql.mutation<CreateWorkMutation, CreateWorkMutationVariables>('CreateWork', (req, res, ctx) => {
    const workType = workTypeRepository.find('name', req.variables.workType);
    const costCode = costCodeRepository.find('code', req.variables.costCode);
    const project = projectRepository.find('name', req.variables.project);
    const program = programRepository.find('name', req.variables.program) ?? undefined;
    const omeroProject = req.variables.omeroProject
      ? omeroProjectRepository.find('name', req.variables.omeroProject)
      : undefined;
    const dnapStudy = req.variables.dnapStudy ? dnapStudyRepository.find('name', req.variables.dnapStudy) : undefined;
    const workRequester = releaseRecipientRepository.find('username', req.variables.workRequester);

    if (!workType) {
      return res(ctx.errors([{ message: `Work type ${req.variables.workType} not found` }]));
    }

    if (!costCode) {
      return res(
        ctx.errors([
          {
            message: `Cost code ${req.variables.costCode} not found`
          }
        ])
      );
    }

    if (!project) {
      return res(
        ctx.errors([
          {
            message: `Project ${req.variables.project} not found`
          }
        ])
      );
    }

    if (!workRequester) {
      return res(
        ctx.errors([
          {
            message: `Work requester ${req.variables.workRequester} not found`
          }
        ])
      );
    }

    const createWork = workFactory.build(
      {
        numSlides: req.variables.numSlides,
        numBlocks: req.variables.numBlocks,
        numOriginalSamples: req.variables.numOriginalSamples
      },
      {
        associations: { workType, costCode, project, program, workRequester, omeroProject, dnapStudy },
        transient: { isRnD: req.variables.prefix === 'R&D' }
      }
    );

    workRepository.save(createWork);

    return res(
      ctx.data({
        createWork
      })
    );
  }),

  graphql.mutation<UpdateWorkStatusMutation, UpdateWorkStatusMutationVariables>('UpdateWorkStatus', (req, res, ctx) => {
    const work = workRepository.find('workNumber', req.variables.workNumber);

    let comment = null;

    if (req.variables.commentId) {
      comment = commentRepository.find('id', req.variables.commentId)?.text;
    }

    if (!work) {
      return res(
        ctx.errors([
          {
            message: `Work ${req.variables.workNumber} not found`
          }
        ])
      );
    }

    work.status = req.variables.status;
    workRepository.save(work);

    return res(
      ctx.data({
        updateWorkStatus: {
          work,
          comment
        }
      })
    );
  }),
  graphql.mutation<UpdateWorkNumBlocksMutation, UpdateWorkNumBlocksMutationVariables>(
    'UpdateWorkNumBlocks',
    (req, res, ctx) => {
      const work = workRepository.find('workNumber', req.variables.workNumber);
      if (!work) {
        return res(
          ctx.errors([
            {
              message: `Work ${req.variables.workNumber} not found`
            }
          ])
        );
      }
      work.numBlocks = req.variables.numBlocks;
      workRepository.save(work);
      return res(
        ctx.data({
          updateWorkNumBlocks: work
        })
      );
    }
  ),

  graphql.mutation<UpdateWorkNumSlidesMutation, UpdateWorkNumSlidesMutationVariables>(
    'UpdateWorkNumSlides',
    (req, res, ctx) => {
      const work = workRepository.find('workNumber', req.variables.workNumber);
      if (!work) {
        return res(
          ctx.errors([
            {
              message: `Work ${req.variables.workNumber} not found`
            }
          ])
        );
      }
      work.numSlides = req.variables.numSlides;
      workRepository.save(work);
      return res(
        ctx.data({
          updateWorkNumSlides: work
        })
      );
    }
  ),

  graphql.mutation<UpdateWorkPriorityMutation, UpdateWorkPriorityMutationVariables>(
    'UpdateWorkPriority',
    (req, res, ctx) => {
      const work = workRepository.find('workNumber', req.variables.workNumber);
      if (!work) {
        return res(
          ctx.errors([
            {
              message: `Work ${req.variables.workNumber} not found`
            }
          ])
        );
      }
      work.priority = req.variables.priority;
      workRepository.save(work);
      return res(
        ctx.data({
          updateWorkPriority: work
        })
      );
    }
  ),

  graphql.mutation<UpdateWorkOmeroProjectMutation, UpdateWorkOmeroProjectMutationVariables>(
    'UpdateWorkOmeroProject',
    (req, res, ctx) => {
      const work = workRepository.find('workNumber', req.variables.workNumber);
      if (!work) {
        return res(
          ctx.errors([
            {
              message: `Work ${req.variables.workNumber} not found`
            }
          ])
        );
      }
      let omeroProject: OmeroProject | null = null;
      if (req.variables.omeroProject) {
        omeroProject = omeroProjectRepository.find('name', req.variables.omeroProject);
      }
      if (!omeroProject) {
        return res(
          ctx.errors([
            {
              message: `Omero project ${req.variables.omeroProject} not found`
            }
          ])
        );
      }
      work.omeroProject = omeroProject;
      workRepository.save(work);
      return res(
        ctx.data({
          updateWorkOmeroProject: work
        })
      );
    }
  ),
  graphql.mutation<UpdateWorkDnapProjectMutation, UpdateWorkDnapProjectMutationVariables>(
    'UpdateWorkDnapProject',
    (req, res, ctx) => {
      const work = workRepository.find('workNumber', req.variables.workNumber);
      if (!work) {
        return res(
          ctx.errors([
            {
              message: `Work ${req.variables.workNumber} not found`
            }
          ])
        );
      }
      let dnapStudy: DnapStudy | null = null;
      if (req.variables.dnapStudy) {
        dnapStudy = dnapStudyRepository.find('name', req.variables.dnapStudy);
      }
      if (!dnapStudy) {
        return res(
          ctx.errors([
            {
              message: `DNAP Study ID and description ${req.variables.dnapStudy} not found`
            }
          ])
        );
      }
      work.dnapStudy = dnapStudy;
      workRepository.save(work);
      return res(
        ctx.data({
          updateWorkDnapProject: work
        })
      );
    }
  ),
  graphql.query<FindWorkNumbersQuery, FindWorkNumbersQueryVariables>('FindWorkNumbers', (req, res, ctx) => {
    return res(
      ctx.data({
        works: workRepository.findAll().filter((w) => w.status === req.variables.status)
      })
    );
  }),

  graphql.query<GetWorkNumbersQuery, GetWorkNumbersQueryVariables>('GetWorkNumbers', (req, res, ctx) => {
    return res(
      ctx.data({
        works: workRepository.findAll()
      })
    );
  }),
  graphql.query<GetAllWorkInfoQuery, GetAllWorkInfoQuery>('GetAllWorkInfo', (req, res, ctx) => {
    return res(
      ctx.data({
        works: [
          ...workRepository.findAll(),
          {
            workNumber: 'SGP1001',
            workRequester: { username: 'Requestor 1' },
            status: WorkStatus.Withdrawn,
            project: { name: 'Project 1' }
          }
        ]
      })
    );
  }),
  graphql.query<GetSuggestedLabwareForWorkQuery, GetSuggestedLabwareForWorkQueryVariables>(
    'GetSuggestedLabwareForWork',
    (req, res, ctx) => {
      return res(
        ctx.data({
          suggestedLabwareForWork: labwareFactory.buildList(2)
        })
      );
    }
  )
];

export default workHandlers;
