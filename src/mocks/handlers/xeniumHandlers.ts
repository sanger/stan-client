import { graphql, HttpResponse } from 'msw';
import commentRepository from '../repositories/commentRepository';
import {
  GetAnalyserScanDataQuery,
  GetAnalyserScanDataQueryVariables,
  GetRunNamesQuery,
  RecordAnalyserMutation,
  RecordAnalyserMutationVariables
} from '../../types/sdk';
import { faker } from '@faker-js/faker';

const xeniumHandlers = [
  //Get Xenium QC Info
  graphql.query('GetXeniumQCInfo', () => {
    return HttpResponse.json({
      data: {
        comments: commentRepository
          .findAll()
          .filter((comment) => comment.category === 'Xenium analyser QC' && comment.enabled)
      }
    });
  }),
  //Record Analyser mutatio
  graphql.mutation<RecordAnalyserMutation, RecordAnalyserMutationVariables>('RecordAnalyser', () => {
    return HttpResponse.json({ data: { recordAnalyser: { operations: [{ id: 1 }] } } });
  }),
  //Record QC Labware mutation
  graphql.mutation('RecordQCLabware', () => {
    return HttpResponse.json({ data: { recordQcLabware: { operations: [{ id: 1 }] } } });
  }),

  graphql.query<GetAnalyserScanDataQuery, GetAnalyserScanDataQueryVariables>('GetAnalyserScanData', ({ variables }) => {
    return HttpResponse.json(
      {
        data: {
          analyserScanData: {
            barcode: variables.barcode,
            workNumbers: ['SGP1008'],
            probes: [
              faker.string.alphanumeric({ length: { min: 5, max: 8 } }),
              faker.string.alphanumeric({ length: { min: 5, max: 8 } })
            ],
            cellSegmentationRecorded: faker.datatype.boolean({ probability: 0.5 })
          }
        }
      },
      { status: 200 }
    );
  }),

  graphql.query<GetRunNamesQuery, GetAnalyserScanDataQueryVariables>('GetRunNames', () => {
    return HttpResponse.json({
      data: {
        runNames: [
          faker.string.alphanumeric({ length: { min: 5, max: 8 } }),
          faker.string.alphanumeric({ length: { min: 5, max: 8 } }),
          faker.string.alphanumeric({ length: { min: 5, max: 8 } })
        ]
      }
    });
  })
];

export default xeniumHandlers;
