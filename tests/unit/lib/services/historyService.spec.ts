import { FindHistoryForSampleIdQuery, FindHistoryQuery, FindHistoryQueryVariables } from '../../../../src/types/sdk';
import { buildHistory } from '../../../../src/mocks/handlers/historyHandlers';
import * as sdk from '../../../../src/lib/sdk';
import { findHistory } from '../../../../src/lib/services/historyService';
import { HistoryTableEntry } from '../../../../src/types/stan';
import { cleanup } from '@testing-library/react';

const expectSuccesResult = (results: HistoryTableEntry[]) => {
  expect(results.length).toEqual(1);
  expect(results[0].workNumber).toEqual('SGP1008');
  expect(results[0].details).toEqual(['Taste: Great', 'Monkey: Foo']);
  expect(results[0].address).toEqual('A1');
  expect(results[0].sectionPosition).toEqual('Bottom right');
  expect(results[0].eventType).toEqual('Eat');
};
afterEach(() => {
  jest.clearAllMocks();
  cleanup();
});
describe('historyService.ts', () => {
  describe('On success', () => {
    const findHistoryMock = jest.fn(() => {
      return new Promise<FindHistoryQuery>((resolve) => {
        resolve({
          history: buildHistory()
        });
      });
    });
    const findHistoryForSampleIdMock = jest.fn(() => {
      return new Promise<FindHistoryForSampleIdQuery>((resolve) => {
        resolve({
          historyForSampleId: buildHistory()
        });
      });
    });
    beforeEach(() => {
      jest.spyOn(sdk.stanCore, 'FindHistory').mockImplementation(findHistoryMock);
      jest.spyOn(sdk.stanCore, 'FindHistoryForSampleId').mockImplementation(findHistoryForSampleIdMock);
    });

    it('returns empty array when request is empty ', async () => {
      const results = await findHistory({});
      expect(results).toEqual([]);
    });

    const testProps = [
      { barcode: 'STAN-3001' },
      { donorName: 'Donor1' },
      { eventType: 'Event1' },
      { workNumber: 'SGP1008' },
      { donorName: 'Donor1,Donor2' },
      { externalName: 'Ext1' },
      { externalName: 'Ext1,Ext2' },
      {
        workNumber: 'SGP1008',
        eventType: 'Event1',
        donorName: 'Donor1',
        externalName: 'Ext1',
        barcode: 'STAN-3001'
      }
    ];
    test.each(testProps)('returns results when request has %p', async (props) => {
      const results = await findHistory(props);
      expectSuccesResult(results);
      let expectedProps: FindHistoryQueryVariables = props;
      if (props.donorName) {
        expectedProps = { ...props, donorName: props.donorName.split(',') };
      }
      if (props.externalName) {
        expectedProps = { ...expectedProps, externalName: props.externalName.split(',') };
      }
      expect(findHistoryMock).toHaveBeenCalledWith(expectedProps);
    });
    it('returns results when request has sampleId', async () => {
      const results = await findHistory({ sampleId: '1' });
      expectSuccesResult(results);
      expect(findHistoryForSampleIdMock).toHaveBeenCalledWith({ sampleId: 1 });
    });
    it('calls the findHistoryForSampleId query when sampleId is provided even other fields are given', async () => {
      await findHistory({
        sampleId: '1',
        workNumber: 'SGP1008',
        eventType: 'Event1',
        donorName: 'Donor1',
        externalName: 'Ext1',
        barcode: 'STAN-3001'
      });
      expect(findHistoryForSampleIdMock).toHaveBeenCalledWith({ sampleId: 1 });
    });
  });
  describe('On failure', () => {
    const findHistoryMock = jest.fn(() => {
      return new Promise<FindHistoryQuery>((resolve, reject) => {
        reject({
          response: {
            errors: [
              {
                message: 'Exception while fetching data (/findHistory) : No History entries found'
              }
            ]
          }
        });
      });
    });
    const findHistoryForSampleIdMock = jest.fn(() => {
      return new Promise<FindHistoryForSampleIdQuery>((resolve, reject) => {
        reject({
          response: {
            errors: [
              {
                message: 'Exception while fetching data (/findHistory) : No History entries found'
              }
            ]
          }
        });
      });
    });
    beforeEach(() => {
      jest.spyOn(sdk.stanCore, 'FindHistory').mockImplementation(findHistoryMock);
      jest.spyOn(sdk.stanCore, 'FindHistoryForSampleId').mockImplementation(findHistoryForSampleIdMock);
    });

    it('returns an error if the findHistory request fails', async () => {
      try {
        await findHistory({
          workNumber: 'SGP1008',
          eventType: 'Event1',
          donorName: 'Donor1',
          externalName: 'Ext1',
          barcode: 'STAN-3001'
        });
      } catch (e) {
        expect(e).toEqual({
          response: {
            errors: [
              {
                message: 'Exception while fetching data (/findHistory) : No History entries found'
              }
            ]
          }
        });
      }
    });
    it('returns an error if the findHistory request  with sampleId fails ', async () => {
      try {
        await findHistory({
          workNumber: 'SGP1008',
          eventType: 'Event1',
          donorName: 'Donor1',
          externalName: 'Ext1',
          barcode: 'STAN-3001'
        });
      } catch (e) {
        expect(e).toEqual({
          response: {
            errors: [
              {
                message: 'Exception while fetching data (/findHistory) : No History entries found'
              }
            ]
          }
        });
      }
    });
  });
});
