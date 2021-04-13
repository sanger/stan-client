import {
  FindDocument,
  FindQuery,
  FindQueryVariables,
  FindRequest,
} from "../../types/graphql";
import client from "../client";
import { SearchResultsType, SearchResultTableEntry } from "../../types/stan";
import _ from "lodash";
import { addressToLocationAddress } from "../helpers/locationHelper";

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
    _(findRequest)
      .omitBy(_.isEmpty)
      .mapValues((value: string) => value.trim())
      .value()
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

  const sampleMap = new Map<number, FindQuery["find"]["samples"][number]>();
  const labwareMap = new Map<number, FindQuery["find"]["labware"][number]>();
  const locationMap = new Map<number, FindQuery["find"]["locations"][number]>();
  const labwareLocationMap = new Map<
    number,
    FindQuery["find"]["labwareLocations"][number]
  >();

  findResult.samples.forEach((sample) => sampleMap.set(sample.id, sample));
  findResult.labware.forEach((labware) => labwareMap.set(labware.id, labware));
  findResult.locations.forEach((location) =>
    locationMap.set(location.id, location)
  );
  findResult.labwareLocations.forEach((ll) =>
    labwareLocationMap.set(ll.labwareId, ll)
  );

  return findResult.entries.map((entry) => {
    const { labwareId, sampleId } = entry;
    const labware = labwareMap.get(labwareId)!;
    const sample = sampleMap.get(sampleId)!;
    const labwareLocation = labwareLocationMap.get(labwareId);

    let location = null;
    if (labwareLocation) {
      location = locationMap.get(labwareLocation.locationId);
    }

    return {
      barcode: labware.barcode,
      labwareType: labware.labwareType.name,
      externalId: sample.tissue.externalName,
      donorId: sample.tissue.donor.donorName,
      tissueType: sample.tissue.spatialLocation.tissueType.name,
      location:
        location == null
          ? null
          : {
              barcode: location.barcode,
              displayName:
                location.customName ?? location.fixedName ?? location.barcode,
              address:
                labwareLocation?.address &&
                location?.direction &&
                location?.size
                  ? addressToLocationAddress(
                      labwareLocation?.address,
                      location.size,
                      location.direction
                    )
                  : null,
            },
      sectionNumber: sample.section,
      replicate: sample.tissue.replicate,
    };
  });
}
