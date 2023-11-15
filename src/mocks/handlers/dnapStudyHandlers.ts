import { graphql } from 'msw';
import { UpdateDnapStudiesMutation, UpdateDnapStudiesMutationVariables } from '../../types/sdk';
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
  )
];

export default dnapStudyHandlers;
