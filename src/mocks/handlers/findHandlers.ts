import _ from "lodash";
import { faker } from "@faker-js/faker/locale/en";
import { graphql } from "msw";
import {
  FindEntry,
  FindQuery,
  FindQueryVariables,
  FindResult,
  GetSearchInfoQuery,
  GetSearchInfoQueryVariables,
} from "../../types/sdk";
import { findEntryFactory } from "../../lib/factories/findFactory";
import { sampleFactory } from "../../lib/factories/sampleFactory";
import labwareFactory from "../../lib/factories/labwareFactory";
import locationFactory from "../../lib/factories/locationFactory";
import tissueTypeRepository from "../repositories/tissueTypeRepository";

const findHandlers = [
  graphql.query<GetSearchInfoQuery, GetSearchInfoQueryVariables>(
    "GetSearchInfo",
    (req, res, ctx) => {
      return res(
        ctx.data({
          tissueTypes: tissueTypeRepository.findAll(),
        })
      );
    }
  ),

  graphql.query<FindQuery, FindQueryVariables>("Find", (req, res, ctx) => {
    const maxRecords = req.variables.request.maxRecords ?? 40;
    return res(ctx.data({ find: buildFindResult(10, maxRecords) }));
  }),
];

export default findHandlers;

export function buildFindResult(
  numRecords: number,
  maxRecords: number
): FindResult {
  const numRecordsReturned = numRecords < maxRecords ? numRecords : maxRecords;

  const entries: FindEntry[] = findEntryFactory.buildList(numRecordsReturned);

  const samples = entries.map((entry) =>
    sampleFactory.build({ id: entry.sampleId })
  );

  const labware = entries.map((entry) =>
    labwareFactory.build({ id: entry.labwareId })
  );

  const locationCount = _.random(numRecordsReturned);
  const locations = [...Array(locationCount)].map(() =>
    locationFactory.build({
      fixedName: faker.address.countryCode(),
      customName: _.sample([faker.address.streetName(), null]),
    })
  );

  const labwareLocations = _.sampleSize(labware, locationCount).map(
    (labware) => ({
      labwareId: labware.id,
      locationId: _.sample(locations)?.id ?? 1,
    })
  );

  return {
    numRecords: numRecords,
    entries,
    samples,
    labware,
    locations,
    labwareLocations,
  };
}
