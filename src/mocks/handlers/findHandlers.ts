import _ from 'lodash';
import { faker } from '@faker-js/faker';
import { graphql, HttpResponse } from 'msw';
import {
  FindEntry,
  FindQuery,
  FindQueryVariables,
  FindResult,
  GetSearchInfoQuery,
  GetSearchInfoQueryVariables
} from '../../types/sdk';
import { findEntryFactory } from '../../lib/factories/findFactory';
import { sampleFactory } from '../../lib/factories/sampleFactory';
import labwareFactory from '../../lib/factories/labwareFactory';
import locationFactory from '../../lib/factories/locationFactory';
import tissueTypeRepository from '../repositories/tissueTypeRepository';
import { labwareTypeInstances } from '../../lib/factories/labwareTypeFactory';

const findHandlers = [
  graphql.query<GetSearchInfoQuery, GetSearchInfoQueryVariables>('GetSearchInfo', () => {
    return HttpResponse.json(
      { data: { tissueTypes: tissueTypeRepository.findAll(), labwareTypes: labwareTypeInstances } },
      { status: 200 }
    );
  }),

  graphql.query<FindQuery, FindQueryVariables>('Find', ({ variables }) => {
    const maxRecords = variables.request.maxRecords ?? 40;
    return HttpResponse.json({ data: { find: buildFindResult(10, maxRecords) } }, { status: 200 });
  })
];

export default findHandlers;

export function buildFindResult(numRecords: number, maxRecords: number): FindResult {
  const numRecordsReturned = numRecords < maxRecords ? numRecords : maxRecords;

  const entries: FindEntry[] = findEntryFactory.buildList(numRecordsReturned);

  const samples = entries.map((entry) => sampleFactory.build({ id: entry.sampleId }));

  const labware = entries.map((entry) => labwareFactory.build({ id: entry.labwareId }));

  const locationCount = _.random(numRecordsReturned);
  const locations = [...Array(locationCount)].map(() =>
    locationFactory.build({
      fixedName: faker.location.countryCode(),
      customName: _.sample([faker.location.street(), null])
    })
  );

  const labwareLocations = _.sampleSize(labware, locationCount).map((labware) => ({
    labwareId: labware.id,
    locationId: _.sample(locations)?.id ?? 1
  }));

  return {
    numRecords: numRecords,
    entries,
    samples,
    labware,
    locations,
    labwareLocations
  };
}
