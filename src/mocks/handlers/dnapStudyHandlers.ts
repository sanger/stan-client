import { graphql } from 'msw';
import {
  GetDnapStudyQuery,
  GetDnapStudyQueryVariables,
  UpdateDnapStudiesMutation,
  UpdateDnapStudiesMutationVariables
} from '../../types/sdk';
import dnapStudyRepository from '../repositories/dnapStudyRepository';
import dnapStudyFactory from '../../lib/factories/dnapStudyFactory';

const dnapStudyHandlers = [
  graphql.mutation<UpdateDnapStudiesMutation, UpdateDnapStudiesMutationVariables>(
    'UpdateDnapStudies',
    (req, res, ctx) => {
      const dnapStudies = dnapStudyRepository.findAll();
      dnapStudies.push(dnapStudyFactory.build({ ssId: 1234, name: 'new Sequencescape study', enabled: true }));
      return res(ctx.data({ updateDnapStudies: dnapStudies }));
    }
  ),
  graphql.query<GetDnapStudyQuery, GetDnapStudyQueryVariables>('GetDnapStudy', (req, res, ctx) => {
    const study = dnapStudyRepository.find('ssId', req.variables.ssId);
    if (!study) {
      return res(
        ctx.errors([
          {
            message: `Unknown Sequencescape study id: ${req.variables.ssId}`
          }
        ])
      );
    }
    return res(
      ctx.data({
        dnapStudy: study
      })
    );
  })
];

export default dnapStudyHandlers;
