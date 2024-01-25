import { graphql, HttpResponse } from 'msw';
import { GetWorkSummaryQuery, GetWorkSummaryQueryVariables, WorkStatus } from '../../types/sdk';
import workTypeRepository from '../repositories/workTypeRepository';
import { generateRandomIntegerInRange, objectKeys } from '../../lib/helpers';

const workProgressSummaryHandlers = [
  graphql.query<GetWorkSummaryQuery, GetWorkSummaryQueryVariables>('GetWorkSummary', () => {
    return HttpResponse.json({
      data: {
        __typename: 'Query',
        worksSummary: {
          workSummaryGroups: workTypeRepository.findAll().map((workType, index) => {
            let keys = objectKeys(WorkStatus);
            keys = keys.filter((key) => key !== 'Failed');
            return {
              __typename: 'WorkSummaryGroup',
              workType: workType,
              status: WorkStatus[keys[index % keys.length]],
              numWorks: generateRandomIntegerInRange(1, 10),
              totalNumBlocks: generateRandomIntegerInRange(1, 5),
              totalNumSlides: generateRandomIntegerInRange(1, 5),
              totalNumOriginalSamples: generateRandomIntegerInRange(1, 5)
            };
          }),
          workTypes: workTypeRepository.findAll()
        }
      }
    });
  })
];

export default workProgressSummaryHandlers;
