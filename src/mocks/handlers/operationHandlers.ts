import {
  FindIfOpExistsQuery,
  FindIfOpExistsQueryVariables,
  GetOperationTypesQuery,
  GetOperationTypesQueryVariables
} from '../../types/sdk';
import { graphql, HttpResponse } from 'msw';
import operationRepo from '../repositories/operationRepository';

const opTypes = operationRepo
  .findAll()
  .map((operation) => operation.operationType)
  .map((opType) => opType.name);

const operationHandlers = [
  graphql.query<GetOperationTypesQuery, GetOperationTypesQueryVariables>('GetOperationTypes', () => {
    return HttpResponse.json({ data: { opTypes } }, { status: 200 });
  }),
  graphql.query<FindIfOpExistsQuery, FindIfOpExistsQueryVariables>('FindIfOpExists', ({ variables }) => {
    const opExists = variables.workNumber === 'SGP1008' && variables.run === 'Run Name 1';
    return HttpResponse.json({ data: { opExists: opExists } }, { status: 200 });
  })
];

export default operationHandlers;
