import { SearchService } from '../../../../src/lib/services/searchService';
import { buildFindResult } from '../../../../src/mocks/handlers/findHandlers';
import { FindHistoryQuery, FindQuery, FindResult } from '../../../../src/types/sdk';
import { buildHistory } from '../../../../src/mocks/handlers/historyHandlers';
import * as sdk from '../../../src/lib/sdk';
import { HistoryUrlParams } from '../../../../src/pages/History';
import { findHistory } from '../../../../src/lib/services/historyService';
import { HistoryTableEntry } from '../../../../src/types/stan';

/*const getExpectedHistorySearchEntries:Array<HistoryTableEntry> = () => {
  const historySearchResult = buildHistory();
  //Convert to HistoryTableEntry
    const historySearchEntries:Array<HistoryTableEntry> = [];
    historySearchResult.entries.map((entry) => {
        return ({
          eventId: entry.eventId,
          eventType: entry.type,
            date: new Date(entry.time).toLocaleDateString(),
            sourceBarcode: entry.sourceLabwareId,
            destinationBarcode: entry.destinationLabwareId,
            labwareType: entry.labwareType.name,


        })
    })
}*/
/*jest.mock('../../../src/lib/sdk', () => ({
  stanCore: {
    Find: jest
      .fn()
      .mockImplementationOnce(() => {
        return new Promise<FindHistoryQuery>((resolve) => {
          resolve({
            history: buildHistory()
          });
        });
      })
      .mockImplementationOnce(() => {
        return new Promise<FindHistoryQuery>((_resolve, reject) => {
          reject({
            response: {
              errors: [
                {
                  message: 'Exception while fetching data (/history) : No labware found with barcode: STAN-3001'
                }
              ]
            }
          });
        });
      })
  }
}));

describe('historyService.ts', () => {
  describe('Searching history for empty values', () => {
    beforeEach(() => {
      jest.spyOn(sdk.stanCore, 'FindHistory').mockImplementation(() => {
        return new Promise<FindHistoryQuery>((resolve) => {
          resolve({
            history: buildHistory()
          });
        });
      })
    })
    const historyRequest: HistoryUrlParams = {};
    it('emptyValues', async () => {
      const results = await findHistory(historyRequest);
      expect(results).toEqual({
        [e]
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


});*/
