import { GetOperationTypesQuery, GetOperationTypesQueryVariables } from '../../types/sdk';
import { graphql, HttpResponse } from 'msw';
import operationRepo from '../repositories/operationRepository';

const opTypes = operationRepo
  .findAll()
  .map((operation) => operation.operationType)
  .map((opType) => opType.name);

const operationHandlers = [
  graphql.query<GetOperationTypesQuery, GetOperationTypesQueryVariables>('GetOperationTypes', () => {
    return HttpResponse.json({ data: { opTypes } }, { status: 200 });
  })
];

export default operationHandlers;
