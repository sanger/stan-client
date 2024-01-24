import { graphql, HttpResponse } from 'msw';
import { UnreleaseMutation, UnreleaseMutationVariables } from '../../types/sdk';

const unreleaseHandlers = [
  graphql.mutation<UnreleaseMutation, UnreleaseMutationVariables>('Unrelease', () => {
    return HttpResponse.json({ data: { unrelease: { operations: [{ id: 1 }] } } });
  })
];

export default unreleaseHandlers;
