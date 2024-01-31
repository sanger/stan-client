import { graphql, HttpResponse } from 'msw';
import {
  GetDnapStudyQuery,
  GetDnapStudyQueryVariables,
  UpdateDnapStudiesMutation,
  UpdateDnapStudiesMutationVariables
} from '../../types/sdk';
import dnapStudyRepository from '../repositories/dnapStudyRepository';
import dnapStudyFactory from '../../lib/factories/dnapStudyFactory';

const dnapStudyHandlers = [
  graphql.mutation<UpdateDnapStudiesMutation, UpdateDnapStudiesMutationVariables>('UpdateDnapStudies', () => {
    const dnapStudies = dnapStudyRepository.findAll();
    dnapStudies.push(dnapStudyFactory.build({ ssId: 1234, name: 'new Sequencescape study', enabled: true }));
    return HttpResponse.json({ data: { updateDnapStudies: dnapStudies } }, { status: 200 });
  }),
  graphql.query<GetDnapStudyQuery, GetDnapStudyQueryVariables>('GetDnapStudy', ({ variables }) => {
    const study = dnapStudyRepository.find('ssId', variables.ssId);
    if (!study) {
      return HttpResponse.json(
        { errors: [{ message: `Unknown Sequencescape study id:  ${variables.ssId}` }] },
        { status: 404 }
      );
    }
    return HttpResponse.json({ data: { dnapStudy: study } }, { status: 200 });
  })
];

export default dnapStudyHandlers;
