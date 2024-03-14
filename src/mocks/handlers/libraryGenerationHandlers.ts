import { graphql, HttpResponse } from 'msw';
import { RecordLibraryPrepMutation, RecordLibraryPrepMutationVariables } from '../../types/sdk';

export const libraryGenerationHandlers = [
  graphql.mutation<RecordLibraryPrepMutation, RecordLibraryPrepMutationVariables>('RecordLibraryPrep', () => {
    return HttpResponse.json({ data: { libraryPrep: { operations: [{ id: 12 }] } } }, { status: 200 });
  })
];
