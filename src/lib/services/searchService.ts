import { FindQuery, FindRequest } from "../../types/sdk";
import { SearchResultsType, SearchResultTableEntry } from "../../types/stan";
import _ from "lodash";
import { addressToLocationAddress } from "../helpers/locationHelper";
import { stanCore } from "../sdk";

/**
 * Do a find query on core. Format the response into a list of table rows
 * @param findRequest the variables that go into a Find query
 */
export async function search(
  findRequest: FindRequest
): Promise<SearchResultsType> {
  // Tidy up the search parameters e.g. removing undefined and null values
  const request: FindRequest = _(findRequest)
    .omitBy(_.isEmpty)
    .mapValues((value: any) =>
      typeof value === "string" ? value.trim() : value
    )
    .value();
  const response = await stanCore.Find({ request });
  return {
    numDisplayed: response.find.entries.length,
    numRecords: response.find.numRecords,
    entries: formatFindResult(response.find),
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
              displayName: location.qualifiedNameWithFirstBarcode,
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
      labwareCreated: new Date(labware.created),
      embeddingMedium: sample.tissue.medium.name,
    };
  });
}
