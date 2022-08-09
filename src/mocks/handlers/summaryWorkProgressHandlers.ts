import { graphql } from 'msw';
import { GetWorkSummaryQuery, GetWorkSummaryQueryVariables, WorkStatus } from '../../types/sdk';
import workTypeRepository from '../repositories/workTypeRepository';
import { generateRandomIntegerInRange, objectKeys } from '../../lib/helpers';

const workProgressSummaryHandlers = [
  graphql.query<GetWorkSummaryQuery, GetWorkSummaryQueryVariables>('GetWorkSummary', (req, res, ctx) => {
    return res(
      ctx.data({
        __typename: 'Query',
        worksSummary: workTypeRepository
          .findAll()
          .filter((type) => type.enabled)
          .map((workType) => {
            const keys = objectKeys(WorkStatus);
            return {
              __typename: 'WorkSummaryGroup',
              workType: workType,
              status: WorkStatus[keys[generateRandomIntegerInRange(0, keys.length)]],
              numWorks: generateRandomIntegerInRange(1, 10),
              totalLabwareRequired: generateRandomIntegerInRange(1, 5)
            };
          })
      })
    );
  })
];

export default workProgressSummaryHandlers;
