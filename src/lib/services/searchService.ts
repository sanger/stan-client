import {
  FindDocument,
  FindQuery,
  FindQueryVariables,
  FindRequest,
  GetSearchInfoDocument,
  GetSearchInfoQuery,
} from "../../types/graphql";
import client from "../client";
import { SearchResultsType, SearchResultTableEntry } from "../../types/stan";
import { SearchMachine } from "../machines/search/searchMachineTypes";
import { buildSearchMachine } from "../factories/machineFactory";
import { RouteComponentProps } from "react-router-dom";
import { cleanParams, parseQueryString } from "../helpers";
import { ParsedQuery } from "query-string";
import _ from "lodash";

const findRequestKeys: (keyof FindRequest)[] = [
  "labwareBarcode",
  "tissueExternalName",
  "donorName",
  "tissueType",
];

export async function getSearchMachine(
  routeProps: RouteComponentProps
): Promise<SearchMachine> {
  const searchInfo = await getSearchInfo();
  const params: ParsedQuery = parseQueryString(routeProps.location.search);
  const findRequest: FindRequest = _.merge(
    buildFindRequestInitialValues(),
    cleanParams(params, findRequestKeys)
  );
  return buildSearchMachine(searchInfo, findRequest);
}

function buildFindRequestInitialValues(): FindRequest {
  return {
    labwareBarcode: "",
    tissueExternalName: "",
    donorName: "",
    tissueType: "",
  };
}

/**
 * Fetch data necessary for the Search page
 */
export async function getSearchInfo(): Promise<GetSearchInfoQuery> {
  const response = await client.query<GetSearchInfoQuery>({
    query: GetSearchInfoDocument,
  });
  return response.data;
}

/**
 * Do a find query on core. Format the response into a list of table rows
 * @param findRequest the variables that go into a Find query
 */
export async function search(
  findRequest: FindRequest
): Promise<SearchResultsType> {
  // Have a default of 40 records is max isn't supplied
  const request = _.defaults(
    { maxRecords: 40 },
    // Strip any empty string values from the provided request
    _.omitBy(findRequest, _.isEmpty)
  );
  const response = await client.query<FindQuery, FindQueryVariables>({
    query: FindDocument,
    fetchPolicy: "network-only",
    variables: {
      request,
    },
  });
  return {
    numDisplayed: response.data.find.entries.length,
    numRecords: response.data.find.numRecords,
    entries: formatFindResult(response.data.find),
  };
}

/**
 * Convert the result of a Find query into data for the table rows
 * @param findResult the result of the search on core
 */
export function formatFindResult(
  findResult?: FindQuery["find"]
): SearchResultTableEntry[] {
  if (!findResult) {
    return [];
  }

  const sampleMap = new Map();
  const labwareMap = new Map();
  const locationMap = new Map();
  const labwareToLocationMap = new Map();

  findResult.samples.forEach((sample) => sampleMap.set(sample.id, sample));
  findResult.labware.forEach((labware) => labwareMap.set(labware.id, labware));
  findResult.locations.forEach((location) =>
    locationMap.set(location.id, location)
  );
  findResult.labwareLocations.forEach((ll) =>
    labwareToLocationMap.set(ll.labwareId, locationMap.get(ll.locationId))
  );

  return findResult.entries.map((entry) => {
    const { labwareId, sampleId } = entry;
    const labware = labwareMap.get(labwareId)!;
    const sample = sampleMap.get(sampleId)!;

    let location = null;
    if (labwareToLocationMap.has(labwareId)) {
      location = labwareToLocationMap.get(labwareId);
    }

    return {
      barcode: labware.barcode,
      externalId: sample.tissue.externalName,
      donorId: sample.tissue.donor.donorName,
      tissueType: sample.tissue.spatialLocation.tissueType.name,
      location:
        location == null
          ? null
          : {
              barcode: location.barcode,
              displayName: location.customName || location.name,
            },
      sectionNumber: sample.section,
      replicate: sample.tissue.replicate,
    };
  });
}
