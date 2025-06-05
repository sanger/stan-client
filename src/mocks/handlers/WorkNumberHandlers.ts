import { graphql, HttpResponse } from 'msw';
import { SetOpWorkRequestMutation, SetOpWorkRequestMutationVariables } from '../../types/sdk';
import OperationFactory from '../../lib/factories/operationFactory';

const reviseWorkNumber = [
  graphql.mutation<SetOpWorkRequestMutation, SetOpWorkRequestMutationVariables>('SetOpWorkRequest', ({ variables }) => {
    const opIds = variables.request.opIds;
    const operations = opIds.map((opId) => OperationFactory.build({ id: opId }));
    return HttpResponse.json({ data: { setOperationWork: operations } });
  })
];

export default reviseWorkNumber;
