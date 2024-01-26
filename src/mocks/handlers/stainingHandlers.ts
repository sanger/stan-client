import { graphql, HttpResponse } from 'msw';
import {
  GetStainInfoQuery,
  GetStainInfoQueryVariables,
  RecordComplexStainMutation,
  RecordComplexStainMutationVariables,
  StainMutation,
  StainMutationVariables
} from '../../types/sdk';
import stainTypeRepository from '../repositories/stainTypeRepository';

const stainingHandlers = [
  graphql.query<GetStainInfoQuery, GetStainInfoQueryVariables>('GetStainInfo', () => {
    return HttpResponse.json(
      {
        data: {
          stainTypes: stainTypeRepository.findAll()
        }
      },
      { status: 200 }
    );
  }),

  graphql.mutation<StainMutation, StainMutationVariables>('Stain', () => {
    return HttpResponse.json({
      data: {
        stain: {
          operations: [
            {
              id: 1
            }
          ]
        }
      }
    });
  }),

  graphql.mutation<RecordComplexStainMutation, RecordComplexStainMutationVariables>('RecordComplexStain', () => {
    return HttpResponse.json({ data: { recordComplexStain: { operations: [{ id: 1 }] } } });
  })
];

export default stainingHandlers;
