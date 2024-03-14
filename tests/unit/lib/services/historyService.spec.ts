import {
  FindHistoryForSampleIdQuery,
  FindHistoryGraphQuery,
  FindHistoryQuery,
  FindHistoryQueryVariables
} from '../../../../src/types/sdk';
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
  describe('runs the right query depending of the selected result format ', () => {
    const findHistoryMock = jest.fn(() => {
      return new Promise<FindHistoryQuery>((resolve) => {
        resolve({
          history: buildHistory()
        });
      });
    });
    const findHistoryGraphMock = jest.fn(() => {
      return new Promise<FindHistoryGraphQuery>((resolve) => {
        resolve({
          historyGraph: { svg: 'svg' }
        });
      });
    });
    beforeEach(() => {
      jest.spyOn(sdk.stanCore, 'FindHistory').mockImplementation(findHistoryMock);
      jest.spyOn(sdk.stanCore, 'FindHistoryGraph').mockImplementation(findHistoryGraphMock);
    });
    it('runs findHistory query when result format is set to Table ', async () => {
      await findHistory({ resultFormat: 'table', workNumber: 'SGP1008' });
      expect(findHistoryMock).toHaveBeenCalledTimes(1);
      expect(findHistoryMock).toHaveBeenCalledWith({ workNumber: 'SGP1008' });
    });
    it('runs findHistoryGraph query when result format is set to Graph ', async () => {
      await findHistory({ resultFormat: 'graph', workNumber: 'SGP1008' });
      expect(findHistoryGraphMock).toHaveBeenCalledTimes(1);
      expect(findHistoryGraphMock).toHaveBeenCalledWith({
        workNumber: 'SGP1008',
        fontSize: 16,
        zoom: 1
      });
    });
  });
  describe('On success', () => {
    describe('When result format is set to Table', () => {
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
        expect(results.history.entries).toEqual([]);
        expect(results.history.flaggedBarcodes).toEqual([]);
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
        expectSuccesResult(results.history.entries);
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
        expectSuccesResult(results.history.entries);
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
    describe('When result format is set to Plot', () => {
      const findHistoryGraphMock = jest.fn(() => {
        return new Promise<FindHistoryGraphQuery>((resolve) => {
          resolve({
            historyGraph: { svg: 'svg' }
          });
        });
      });
      beforeEach(() => {
        jest.spyOn(sdk.stanCore, 'FindHistoryGraph').mockImplementation(findHistoryGraphMock);
      });
      it('does not run the query when the request is empty ', async () => {
        const results = await findHistory({
          resultFormat: 'graph'
        });
        expect(findHistoryGraphMock).toHaveBeenCalledTimes(0);
        expect(results.historyGraph).toEqual(undefined);
      });
      it('returns an svg string when the request is valid', async () => {
        const results = await findHistory({
          resultFormat: 'graph',
          workNumber: 'SGP1008'
        });
        expect(results.historyGraph).toBeDefined();
      });
      it('resets previous Table result format result', async () => {
        const results = await findHistory({
          resultFormat: 'graph',
          workNumber: 'SGP1008'
        });
        expect(results.historyGraph).toBeDefined();
        expect(results.history.entries.length).toEqual(0);
        expect(results.history.flaggedBarcodes.length).toEqual(0);
      });
    });
  });
  describe('On failure', () => {
    describe('When result format is set to Table', () => {
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
    describe('When result format is set to Graph', () => {
      const findHistoryGraphMock = jest.fn(() => {
        return new Promise<FindHistoryGraphQuery>((resolve, reject) => {
          reject({
            response: {
              errors: [
                {
                  message: 'Exception while fetching data (/findHistoryGraph)'
                }
              ]
            }
          });
        });
      });
      beforeEach(() => {
        jest.spyOn(sdk.stanCore, 'FindHistoryGraph').mockImplementation(findHistoryGraphMock);
      });
      it('returns an error if the findHistoryGraph request fails ', async () => {
        try {
          await findHistory({
            resultFormat: 'graph',
            workNumber: 'SGP1008',
            donorName: 'Donor1',
            externalName: 'Ext1',
            barcode: 'STAN-3001'
          });
        } catch (e) {
          expect(e).toEqual({
            response: {
              errors: [
                {
                  message: 'Exception while fetching data (/findHistoryGraph)'
                }
              ]
            }
          });
        }
      });
    });
  });
});
