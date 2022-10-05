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
  describe('find', () => {
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
                run formatFindResult on our expected results
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
      expect(await searchService.search(findRequest)).toEqual({
        response: {
          errors: [
            {
              message: 'Exception while fetching data (/find) : No labware found with barcode: STAN-3001'
            }
          ]
        }
      });
    });
  });
});
