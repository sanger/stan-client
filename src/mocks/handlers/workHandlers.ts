import { graphql, HttpResponse } from 'msw';
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
  UpdateWorkDnapStudyMutation,
  UpdateWorkDnapStudyMutationVariables,
  GetAllWorkInfoQueryVariables
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
    ({ variables }) => {
      const comments = commentRepository
        .findAll()
        .filter((comment) => comment.category === variables.commentCategory && isEnabled(comment));
      let works = workRepository.findAll();

      if (variables.workStatuses) {
        let workStatuses = Array.isArray(variables.workStatuses) ? variables.workStatuses : [variables.workStatuses];

        if (workStatuses.length > 0) {
          works = works.filter((work) => workStatuses.includes(work.status));
        }
      }
      return HttpResponse.json({
        data: {
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
        }
      });
    }
  ),
  graphql.query<FindWorkInfoQuery, FindWorkInfoQueryVariables>('FindWorkInfo', ({ variables }) => {
    return HttpResponse.json({
      data: {
        works: workRepository
          .findAll()
          .filter((w) => w.status === variables.status)
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
      }
    });
  }),

  graphql.query<FindWorksCreatedByQuery, FindWorksCreatedByQueryVariables>('FindWorksCreatedBy', () => {
    return HttpResponse.json({ data: { worksCreatedBy: workRepository.findAll() } });
  }),

  graphql.mutation<CreateWorkMutation, CreateWorkMutationVariables>('CreateWork', ({ variables }) => {
    const workType = workTypeRepository.find('name', variables.workType);
    const costCode = costCodeRepository.find('code', variables.costCode);
    const project = projectRepository.find('name', variables.project);
    const program = programRepository.find('name', variables.program) ?? undefined;
    const omeroProject = variables.omeroProject
      ? omeroProjectRepository.find('name', variables.omeroProject)
      : undefined;
    const dnapStudy = variables.ssStudyId ? dnapStudyRepository.find('ssId', variables.ssStudyId) : undefined;
    const workRequester = releaseRecipientRepository.find('username', variables.workRequester);

    if (!workType) {
      return HttpResponse.json({ errors: [{ message: `Work type ${variables.workType} not found` }] }, { status: 404 });
    }

    if (!costCode) {
      return HttpResponse.json({ errors: [{ message: `Cost code ${variables.costCode} not found` }] }, { status: 404 });
    }

    if (!project) {
      return HttpResponse.json({ errors: [{ message: `Project ${variables.project} not found` }] }, { status: 404 });
    }

    if (!workRequester) {
      return HttpResponse.json(
        { errors: [{ message: `Work requester ${variables.workRequester} not found` }] },
        { status: 404 }
      );
    }

    const createWork = workFactory.build(
      {
        numSlides: variables.numSlides,
        numBlocks: variables.numBlocks,
        numOriginalSamples: variables.numOriginalSamples
      },
      {
        associations: { workType, costCode, project, program, workRequester, omeroProject, dnapStudy },
        transient: { isRnD: variables.prefix === 'R&D' }
      }
    );

    workRepository.save(createWork);
    return HttpResponse.json({ data: { createWork } }, { status: 200 });
  }),

  graphql.mutation<UpdateWorkStatusMutation, UpdateWorkStatusMutationVariables>('UpdateWorkStatus', ({ variables }) => {
    const work = workRepository.find('workNumber', variables.workNumber);

    let comment = null;

    if (variables.commentId) {
      comment = commentRepository.find('id', variables.commentId)?.text;
    }

    if (!work) {
      return HttpResponse.json({ errors: [{ message: `Work ${variables.workNumber} not found` }] }, { status: 404 });
    }

    work.status = variables.status;
    workRepository.save(work);

    return HttpResponse.json({ data: { updateWorkStatus: { work, comment } } }, { status: 200 });
  }),
  graphql.mutation<UpdateWorkNumBlocksMutation, UpdateWorkNumBlocksMutationVariables>(
    'UpdateWorkNumBlocks',
    ({ variables }) => {
      const work = workRepository.find('workNumber', variables.workNumber);
      if (!work) {
        return HttpResponse.json({ errors: [{ message: `Work ${variables.workNumber} not found` }] }, { status: 404 });
      }
      work.numBlocks = variables.numBlocks;
      workRepository.save(work);
      return HttpResponse.json({ data: { updateWorkNumBlocks: work } }, { status: 200 });
    }
  ),

  graphql.mutation<UpdateWorkNumSlidesMutation, UpdateWorkNumSlidesMutationVariables>(
    'UpdateWorkNumSlides',
    ({ variables }) => {
      const work = workRepository.find('workNumber', variables.workNumber);
      if (!work) {
        return HttpResponse.json({ errors: [{ message: `Work ${variables.workNumber} not found` }] }, { status: 404 });
      }
      work.numSlides = variables.numSlides;
      workRepository.save(work);
      return HttpResponse.json({ data: { updateWorkNumSlides: work } }, { status: 200 });
    }
  ),

  graphql.mutation<UpdateWorkPriorityMutation, UpdateWorkPriorityMutationVariables>(
    'UpdateWorkPriority',
    ({ variables }) => {
      const work = workRepository.find('workNumber', variables.workNumber);
      if (!work) {
        return HttpResponse.json({ errors: [{ message: `Work ${variables.workNumber} not found` }] }, { status: 404 });
      }
      work.priority = variables.priority;
      workRepository.save(work);
      return HttpResponse.json({ data: { updateWorkPriority: work } }, { status: 200 });
    }
  ),

  graphql.mutation<UpdateWorkOmeroProjectMutation, UpdateWorkOmeroProjectMutationVariables>(
    'UpdateWorkOmeroProject',
    ({ variables }) => {
      const work = workRepository.find('workNumber', variables.workNumber);
      if (!work) {
        return HttpResponse.json({ errors: [{ message: `Work ${variables.workNumber} not found` }] }, { status: 404 });
      }
      let omeroProject: OmeroProject | null = null;
      if (variables.omeroProject) {
        omeroProject = omeroProjectRepository.find('name', variables.omeroProject);
      }
      if (!omeroProject) {
        return HttpResponse.json(
          { errors: [{ message: `Omero project ${variables.omeroProject} not found` }] },
          { status: 404 }
        );
      }
      work.omeroProject = omeroProject;
      workRepository.save(work);
      return HttpResponse.json({ data: { updateWorkOmeroProject: work } }, { status: 200 });
    }
  ),
  graphql.mutation<UpdateWorkDnapStudyMutation, UpdateWorkDnapStudyMutationVariables>(
    'UpdateWorkDnapStudy',
    ({ variables }) => {
      const work = workRepository.find('workNumber', variables.workNumber);
      if (!work) {
        return HttpResponse.json({ errors: [{ message: `Work ${variables.workNumber} not found` }] }, { status: 404 });
      }
      let dnapStudy: DnapStudy | null = null;
      if (variables.ssStudyId) {
        dnapStudy = dnapStudyRepository.find('ssId', variables.ssStudyId);
      }
      if (!dnapStudy) {
        return HttpResponse.json(
          { errors: [{ message: `Unknown Sequencescape study id: ${variables.ssStudyId}` }] },
          { status: 404 }
        );
      }
      work.dnapStudy = dnapStudy;
      workRepository.save(work);
      return HttpResponse.json({ data: { updateWorkDnapStudy: work } }, { status: 200 });
    }
  ),
  graphql.query<FindWorkNumbersQuery, FindWorkNumbersQueryVariables>('FindWorkNumbers', ({ variables }) => {
    return HttpResponse.json({
      data: { works: workRepository.findAll().filter((w) => w.status === variables.status) }
    });
  }),

  graphql.query<GetWorkNumbersQuery, GetWorkNumbersQueryVariables>('GetWorkNumbers', () => {
    return HttpResponse.json({ data: { works: workRepository.findAll() } });
  }),
  graphql.query<GetAllWorkInfoQuery, GetAllWorkInfoQueryVariables>('GetAllWorkInfo', () => {
    return HttpResponse.json({
      data: {
        works: [
          ...workRepository.findAll(),
          {
            workNumber: 'SGP1001',
            workRequester: { username: 'Requestor 1' },
            status: WorkStatus.Withdrawn,
            project: { name: 'Project 1' }
          }
        ]
      }
    });
  }),
  graphql.query<GetSuggestedLabwareForWorkQuery, GetSuggestedLabwareForWorkQueryVariables>(
    'GetSuggestedLabwareForWork',
    () => {
      return HttpResponse.json({ data: { suggestedLabwareForWork: labwareFactory.buildList(2) } });
    }
  )
];

export default workHandlers;
