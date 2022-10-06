import { SearchService } from '../../../src/lib/services/searchService';
import { buildFindResult } from '../../../src/mocks/handlers/findHandlers';
import { FindQuery, FindResult } from '../../../src/types/sdk';

const findResults = buildFindResult(2, 2);
jest.mock('../../../src/lib/sdk', () => ({
  stanCore: {
    Find: jest
      .fn()
      .mockImplementationOnce(() => {
        return new Promise<FindQuery>((resolve) => {
          resolve({
            find: findResults
          });
        });
      })
      .mockImplementationOnce(() => {
        return new Promise<FindResult>((_resolve, reject) => {
          reject({
            response: {
              errors: [
                {
                  message: 'Exception while fetching data (/find) : No labware found with barcode: STAN-3001'
                }
              ]
            }
          });
        });
      })
  }
}));

describe('searchService.ts', () => {
  describe('search', () => {
    const findRequest = {
      createdMin: '',
      createdMax: '',
      donorName: '',
      labwareBarcode: 'STAN-3000',
      tissueExternalName: '',
      tissueTypeName: '',
      workNumber: ''
    };

    it('returns numDisplayed, numRecords and entries when given a valid request', async () => {
      const searchService = new SearchService();
      /*
        Entries returned from search are formatted by formatFindResult so we
        need to run formatFindResult on our expected results
      */
      const resultsEntries = searchService.formatFindResult(findResults);
      const results = await searchService.search(findRequest);
      expect(results).toEqual({
        numRecords: findResults.numRecords,
        numDisplayed: findResults.entries.length,
        entries: resultsEntries
      });
    });

    it('returns an error if the find request fails', async () => {
      const searchService = new SearchService();
      try {
        await searchService.search(findRequest);
      } catch (e) {
        expect(e).toEqual({
          response: {
            errors: [
              {
                message: 'Exception while fetching data (/find) : No labware found with barcode: STAN-3001'
              }
            ]
          }
        });
      }
    });
  });

  describe('formatFindResult', () => {
    it('returns an empty array if findResult is not given', () => {
      const searchService = new SearchService();
      const results = searchService.formatFindResult();
      expect(results).toEqual([]);
    });

    it('returns a formatted findRequest with the correct attributes', () => {
      const findResult = buildFindResult(1, 1);
      const expectedResult = [
        {
          barcode: findResult.labware[0].barcode,
          labwareType: findResult.labware[0].labwareType.name,
          workNumbers: findResult.entries[0].workNumbers,
          externalId: findResult.samples[0].tissue.externalName,
          donorId: findResult.samples[0].tissue.donor.donorName,
          tissueType: findResult.samples[0].tissue.spatialLocation.tissueType.name,
          location:
            findResult.locations[0] == null
              ? null
              : {
                  barcode: findResult.locations[0].barcode,
                  displayName: findResult.locations[0].qualifiedNameWithFirstBarcode,
                  address: null
                },
          sectionNumber: findResult.samples[0].section,
          replicate: findResult.samples[0].tissue.replicate,
          labwareCreated: new Date(findResult.labware[0].created),
          embeddingMedium: findResult.samples[0].tissue.medium.name
        }
      ];

      const searchService = new SearchService();
      const results = searchService.formatFindResult(findResult);
      expect(results).toEqual(expectedResult);
    });
  });
});
