import { graphql, HttpResponse } from 'msw';
import {
  FindHistoryForDonorNameQuery,
  FindHistoryForDonorNameQueryVariables,
  FindHistoryForExternalNameQuery,
  FindHistoryForExternalNameQueryVariables,
  FindHistoryForLabwareBarcodeQuery,
  FindHistoryForLabwareBarcodeQueryVariables,
  FindHistoryForSampleIdQuery,
  FindHistoryForSampleIdQueryVariables,
  FindHistoryForWorkNumberQuery,
  FindHistoryForWorkNumberQueryVariables,
  FindHistoryGraphQuery,
  FindHistoryGraphQueryVariables,
  FindHistoryQuery,
  FindHistoryQueryVariables,
  GetEventTypesQuery,
  GetEventTypesQueryVariables,
  HistoryEntry,
  HistoryFieldsFragment
} from '../../types/sdk';
import labwareFactory from '../../lib/factories/labwareFactory';
import { buildLabwareFragment } from '../../lib/helpers/labwareHelper';
import { sampleFactory } from '../../lib/factories/sampleFactory';
import { HistorySvgPlot } from '../../static/HistorySvgPlot';

export function buildHistory(workNumber?: string, flagged?: boolean): HistoryFieldsFragment {
  const sourceLabware = labwareFactory.build();
  const destinationLabware = labwareFactory.build();
  const sample = sampleFactory.build();
  if (flagged) {
    sourceLabware.barcode = 'STAN-1000';
  }
  const entries: Array<HistoryEntry> = [
    {
      __typename: 'HistoryEntry',
      destinationLabwareId: destinationLabware.id,
      sourceLabwareId: sourceLabware.id,
      eventId: 1,
      sampleId: sample.id,
      time: new Date().toISOString(),
      type: 'Eat',
      username: 'user1',
      details: ['Taste: Great', 'Monkey: Foo'],
      workNumber: workNumber ?? 'SGP1008',
      address: 'A1',
      region: 'Bottom right'
    }
  ];

  return {
    __typename: 'History',
    samples: [sample],
    labware: [sourceLabware, destinationLabware].map(buildLabwareFragment),
    flagBarcodes: [],
    entries
  };
}

const historyHandlers = [
  graphql.query<FindHistoryQuery, FindHistoryQueryVariables>('FindHistory', () => {
    return HttpResponse.json({ data: { __typename: 'Query', history: buildHistory() } }, { status: 200 });
  }),

  graphql.query<FindHistoryForDonorNameQuery, FindHistoryForDonorNameQueryVariables>('FindHistoryForDonorName', () => {
    return HttpResponse.json({ data: { __typename: 'Query', historyForDonorName: buildHistory() } }, { status: 200 });
  }),

  graphql.query<FindHistoryForExternalNameQuery, FindHistoryForExternalNameQueryVariables>(
    'FindHistoryForExternalName',
    () => {
      return HttpResponse.json(
        { data: { __typename: 'Query', historyForExternalName: buildHistory() } },
        { status: 200 }
      );
    }
  ),

  graphql.query<FindHistoryForLabwareBarcodeQuery, FindHistoryForLabwareBarcodeQueryVariables>(
    'FindHistoryForLabwareBarcode',
    () => {
      return HttpResponse.json(
        { data: { __typename: 'Query', historyForLabwareBarcode: buildHistory() } },
        { status: 200 }
      );
    }
  ),

  graphql.query<FindHistoryForSampleIdQuery, FindHistoryForSampleIdQueryVariables>('FindHistoryForSampleId', () => {
    return HttpResponse.json({ data: { __typename: 'Query', historyForSampleId: buildHistory() } }, { status: 200 });
  }),

  graphql.query<FindHistoryForWorkNumberQuery, FindHistoryForWorkNumberQueryVariables>(
    'FindHistoryForWorkNumber',
    () => {
      return HttpResponse.json(
        { data: { __typename: 'Query', historyForWorkNumber: buildHistory() } },
        { status: 200 }
      );
    }
  ),
  graphql.query<GetEventTypesQuery, GetEventTypesQueryVariables>('GetEventTypes', () => {
    return HttpResponse.json({ data: { __typename: 'Query', eventTypes: ['Event 1', 'Event 2'] } }, { status: 200 });
  }),
  graphql.query<FindHistoryGraphQuery, FindHistoryGraphQueryVariables>('FindHistoryGraph', () => {
    return HttpResponse.json({ data: { historyGraph: { svg: HistorySvgPlot } } }, { status: 200 });
  })
];

export default historyHandlers;
