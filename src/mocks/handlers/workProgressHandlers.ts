import { graphql } from 'msw';
import {
  FindWorkProgressQuery,
  FindWorkProgressQueryVariables,
  GetWorkProgressInputsQuery,
  GetWorkProgressInputsQueryVariables,
  Work,
  WorkProgressTimestamp,
  WorkStatus
} from '../../types/sdk';
import workRepository from '../repositories/workRepository';
import programRepository from '../repositories/programRepository';
import workTypeRepository from '../repositories/workTypeRepository';
import { generateRandomIntegerInRange } from '../../lib/helpers';

function buildWorkProgressTimeStamps(): Array<WorkProgressTimestamp> {
  return [
    { type: 'Section', timestamp: new Date().toISOString() },
    { type: 'Stain', timestamp: new Date().toISOString() },
    { type: 'Extract', timestamp: new Date().toISOString() },
    { type: 'Visium cDNA', timestamp: new Date().toISOString() },
    { type: 'Stain Visium TO', timestamp: new Date().toISOString() },
    { type: 'Stain Visium LP', timestamp: new Date().toISOString() },
    { type: 'RNAscope/IHC stain', timestamp: new Date().toISOString() },
    { type: 'Visium ADH H&E stain', timestamp: new Date().toISOString() },
    { type: 'Image', timestamp: new Date().toISOString() },
    { type: 'Release 96 well plate', timestamp: new Date().toISOString() },
    { type: 'Analysis', timestamp: new Date().toISOString() }
  ];
}

function buildWorkComment(work: Work) {
  switch (work.status) {
    case WorkStatus.Paused:
      return 'This work is paused';
    case WorkStatus.Failed:
      return 'This work is failed';
    case WorkStatus.Withdrawn:
      return 'This work is withdrawn';
    default:
      return '';
  }
}

const workProgressHandlers = [
  graphql.query<GetWorkProgressInputsQuery, GetWorkProgressInputsQueryVariables>(
    'GetWorkProgressInputs',
    (req, res, ctx) => {
      return res(
        ctx.data({
          workTypes: workTypeRepository.findAll(),
          programs: programRepository.findAll()
        })
      );
    }
  ),
  graphql.query<FindWorkProgressQuery, FindWorkProgressQueryVariables>('FindWorkProgress', (req, res, ctx) => {
    const { workNumber, workTypes, statuses, programs } = req.variables;
    const works = workRepository.findAll().map((work, indx) => {
      const status = indx % 2 === 0 ? WorkStatus.Active : indx % 3 === 1 ? WorkStatus.Completed : WorkStatus.Paused;
      return { ...work, status: status };
    });

    let filteredWorks = [...works];
    if (workTypes) {
      filteredWorks = Array.isArray(workTypes)
        ? works.filter((work) => workTypes.findIndex((workType) => workType === work.workType.name) !== -1)
        : works.filter((work) => work.workType.name === workTypes);
    }
    if (statuses) {
      filteredWorks = Array.isArray(statuses)
        ? filteredWorks.filter((work) => statuses.findIndex((status) => status === work.status) !== -1)
        : filteredWorks.filter((work) => work.status === statuses);
    }
    return res(
      ctx.data({
        __typename: 'Query',
        workProgress: filteredWorks.map((work) => {
          return {
            __typename: 'WorkProgress',
            work: {
              ...work,
              workNumber: workNumber ?? work.workNumber,
              program: {
                name: programs
                  ? programs.length > 1
                    ? programs[generateRandomIntegerInRange(0, programs.length - 1)]
                    : programs[0]
                  : '',
                enabled: true
              }
            },
            timestamps: buildWorkProgressTimeStamps(),
            workComment: buildWorkComment(work)
          };
        })
      })
    );
  })
];

export default workProgressHandlers;
