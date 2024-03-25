import { graphql, HttpResponse } from 'msw';
import { RecordLibraryPrepMutation, RecordLibraryPrepMutationVariables } from '../../types/sdk';
import { createLabware } from './labwareHandlers';

export const libraryGenerationHandlers = [
  graphql.mutation<RecordLibraryPrepMutation, RecordLibraryPrepMutationVariables>('RecordLibraryPrep', () => {
    return HttpResponse.json(
      {
        data: {
          libraryPrep: { operations: [{ id: 12 }, { id: 13 }, { id: 13 }], labware: [createLabware('STAN-5123')] }
        }
      },
      { status: 200 }
    );
  })
];
