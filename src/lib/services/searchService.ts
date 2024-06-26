import { FindQuery, FindRequest, GridDirection } from '../../types/sdk';
import { SearchResultsType, SearchResultTableEntry } from '../../types/stan';
import _ from 'lodash';
import { addressToLocationAddress } from '../helpers/locationHelper';
import { stanCore } from '../sdk';
import { SearchServiceInterface } from './searchServiceInterface';
import { FormFindRequest } from '../../pages/Search';

export class SearchService implements SearchServiceInterface<FormFindRequest, SearchResultTableEntry> {
  /**
   * Do a find query on core. Format the response into a list of table rows
   * @param findRequest the variables that go into a Find query
   */

  search = async (findRequest: FormFindRequest): Promise<SearchResultsType<SearchResultTableEntry>> => {
    const request: FindRequest = _(findRequest)
      .omitBy((val) => (typeof val === 'number' ? val === 0 : _.isEmpty(val)))
      .mapValues((value: any, key: string) => {
        if (['tissueExternalNames', 'donorNames'].includes(key) && typeof value === 'string') {
          return value.split(',').map((v) => v.trim());
        }
        return typeof value === 'string' ? value.trim() : value;
      })
      .value();
    const response = await stanCore.Find({ request });
    return {
      numDisplayed: response.find.entries.length,
      numRecords: response.find.numRecords,
      entries: this.formatFindResult(response.find)
    };
  };

  /**
   * Convert the result of a Find query into data for the table rows
   * @param findResult the result of the search on core
   */
  formatFindResult = (findResult?: FindQuery['find']): SearchResultTableEntry[] => {
    if (!findResult) {
      return [];
    }

    const sampleMap = new Map<number, FindQuery['find']['samples'][number]>();
    const labwareMap = new Map<number, FindQuery['find']['labware'][number]>();
    const locationMap = new Map<number, FindQuery['find']['locations'][number]>();
    const labwareLocationMap = new Map<number, FindQuery['find']['labwareLocations'][number]>();

    findResult.samples.forEach((sample) => sampleMap.set(sample.id, sample));
    findResult.labware.forEach((labware) => labwareMap.set(labware.id, labware));
    findResult.locations.forEach((location) => locationMap.set(location.id, location));
    findResult.labwareLocations.forEach((ll) => labwareLocationMap.set(ll.labwareId, ll));
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
        workNumbers: entry.workNumbers ?? [],
        externalId: sample.tissue.externalName ?? '',
        donorId: sample.tissue.donor.donorName,
        tissueType: sample.tissue.spatialLocation.tissueType.name,
        location:
          location == null
            ? null
            : {
                barcode: location.barcode,
                displayName: location.qualifiedNameWithFirstBarcode ?? location.barcode,
                address:
                  labwareLocation?.address && location?.size
                    ? addressToLocationAddress(
                        labwareLocation?.address,
                        location.size,
                        location.direction ?? GridDirection.DownRight
                      )
                    : null
              },
        sectionNumber: sample.section,
        replicate: sample.tissue.replicate ?? '',
        labwareCreated: new Date(labware.created),
        embeddingMedium: sample.tissue.medium.name,
        fixative: sample.tissue.fixative.name
      };
    });
  };
}
export default SearchService;
