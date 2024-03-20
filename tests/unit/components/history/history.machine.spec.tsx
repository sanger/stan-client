import { createActor } from 'xstate';
import createHistoryMachine from '../../../../src/components/history/history.machine';
import { HistoryTableEntry } from '../../../../src/types/stan';
import { LabwareState } from '../../../../src/types/sdk';
import { findHistory } from '../../../../src/lib/services/historyService';

afterEach(() => {
  jest.clearAllMocks();
});

afterAll(() => {
  jest.resetAllMocks();
});

jest.mock('../../../../src/lib/services/historyService', () => ({
  findHistory: jest.fn()
}));

const mockHistorySearchResults: HistoryTableEntry[] = [
  {
    eventId: 1,
    date: '01/01/2021',
    sourceBarcode: 'STAN-3111',
    destinationBarcode: 'STAN-123',
    labwareType: 'Slide',
    sampleID: 1,
    donorName: 'Donor 1',
    externalName: 'External 1',
    sectionNumber: 1,
    eventType: 'Event 1',
    biologicalState: 'Tissue',
    labwareState: LabwareState.Active,
    username: 'User 1',
    workNumber: 'SGP1008',
    details: ['A1: Pass', 'Foo:Fail'],
    address: 'A1',
    sectionPosition: '2'
  }
];

const initialContext = {
  historyProps: { workNumber: 'SGP8' },
  history: { entries: [], flaggedBarcodes: [] },
  serverError: null,
  historyGraph: '',
  historyGraphZoom: 1,
  historyGraphFontSize: 16
};

describe('historyMachine', () => {
  it('transitions to searching on creation and has the correct context', (done) => {
    const mockHistoryMachine = createHistoryMachine();
    const machine = createActor(mockHistoryMachine, { input: initialContext });
    machine.subscribe((state) => {
      if (state.matches('searching')) {
        expect(state.context).toEqual(initialContext);
        done();
      }
    });
    machine.start();
  });

  it('has an initial state of historyProps params with all fields filled in', (done) => {
    const mockHistoryMachine = createHistoryMachine();
    const machine = createActor(mockHistoryMachine, {
      input: {
        historyProps: {
          workNumber: 'SGP8',
          barcode: 'STAN-3111',
          donorName: 'DONOR1',
          externalName: 'EXT_1',
          sampleId: '1',
          eventType: 'Event'
        },
        history: { entries: [], flaggedBarcodes: [] },
        serverError: null,
        historyGraph: '',
        historyGraphZoom: 1,
        historyGraphFontSize: 16
      }
    });
    machine.subscribe((state) => {
      if (state.matches('searching')) {
        done();
      }
    });
    machine.start();
  });
  describe('searches history on initialisation', () => {
    describe('When Result Format is set to Table', () => {
      it('calls the findHistory query and sets state to found', (done) => {
        (findHistory as jest.MockedFunction<typeof findHistory>).mockResolvedValueOnce({
          history: {
            entries: mockHistorySearchResults,
            flaggedBarcodes: []
          },
          historyGraph: undefined,
          fontSize: 16,
          zoom: 1
        });

        const actor = createActor(createHistoryMachine(), { input: initialContext });
        actor.subscribe((state) => {
          if (state.matches('searching')) {
            expect(jest.fn()).toHaveBeenCalledTimes(1);
          }
          if (state.matches('found')) {
            expect(state.context).toEqual({
              historyProps: { workNumber: 'SGP8' },
              history: { entries: mockHistorySearchResults, flaggedBarcodes: [] },
              serverError: null,
              historyGraph: undefined,
              historyGraphFontSize: 16,
              historyGraphZoom: 1
            });
            done();
          }
        });
        actor.start();
      });
    });
    describe('When Result Format is set to Graph', () => {
      it('calls FindHistoryGraph query and sets state to found', (done) => {
        (findHistory as jest.MockedFunction<typeof findHistory>).mockResolvedValueOnce({
          history: {
            entries: [],
            flaggedBarcodes: []
          },
          historyGraph: 'mockGraph',
          fontSize: 16,
          zoom: 1
        });

        const actor = createActor(createHistoryMachine(), {
          input: {
            history: { entries: [], flaggedBarcodes: [] },
            serverError: null,
            historyGraph: '',
            historyGraphZoom: 1,
            historyGraphFontSize: 16,
            historyProps: { resultFormat: 'graph', workNumber: 'SGP8' }
          }
        });
        actor.subscribe((state) => {
          if (state.matches('found')) {
            expect(state.context).toEqual({
              historyProps: { workNumber: 'SGP8', resultFormat: 'graph' },
              history: { entries: [], flaggedBarcodes: [] },
              serverError: null,
              historyGraph: 'mockGraph',
              historyGraphFontSize: 16,
              historyGraphZoom: 1
            });
            done();
          }
        });
        actor.start();
      });
    });
  });
  describe('searches history again on UPDATE_HISTORY_PROPS', () => {
    it('calls the findHistory query and sets state to searching', (done) => {
      let searchCount = 0;
      (findHistory as jest.MockedFunction<typeof findHistory>).mockResolvedValue({
        history: {
          entries: mockHistorySearchResults,
          flaggedBarcodes: []
        },
        historyGraph: undefined,
        fontSize: 16,
        zoom: 1
      });
      const mockSearchMachine = createHistoryMachine();
      const machine = createActor(mockSearchMachine, { input: initialContext });
      machine.subscribe((state) => {
        if (state.matches('searching')) {
          searchCount++;
        }
        if (state.matches('found')) {
          expect(state.context).toEqual({
            historyProps: { workNumber: 'SGP8' },
            history: { entries: mockHistorySearchResults, flaggedBarcodes: [] },
            serverError: null,
            historyGraph: undefined,
            historyGraphFontSize: 16,
            historyGraphZoom: 1
          });
          expect(searchCount).toEqual(2);
          done();
        }
      });
      machine.start();
      machine.send({ type: 'UPDATE_HISTORY_PROPS', props: { workNumber: 'SGP8' } });
    });
  });

  describe('when error is returned by findHistory ', () => {
    it('goes to error state when the history search returns an error', (done) => {
      (findHistory as jest.MockedFunction<typeof findHistory>).mockRejectedValue({
        response: {
          errors: [
            {
              message: 'Exception while fetching data (/findHistory) : No History entries found'
            }
          ]
        }
      });
      const mockHistoryMachine = createHistoryMachine();
      const machine = createActor(mockHistoryMachine, { input: initialContext });
      machine.subscribe((state) => {
        if (state.context.serverError !== undefined && state.context.serverError !== null) {
          expect(state.context.serverError).toEqual({
            response: {
              errors: [
                {
                  message: 'Exception while fetching data (/findHistory) : No History entries found'
                }
              ]
            }
          });
          expect(state.matches('error'));
          done();
        }
      });
      machine.start();
    });
  });
  describe('searches history again on UPDATE_HISTORY_PROPS on error', () => {
    it('calls the findHistory query and sets state to searching', (done) => {
      (findHistory as jest.MockedFunction<typeof findHistory>).mockRejectedValue({
        response: {
          errors: [
            {
              message: 'Exception while fetching data (/findHistory) : No History entries found'
            }
          ]
        }
      });
      let searchCount = 0;
      const mockSearchMachine = createHistoryMachine();
      const machine = createActor(mockSearchMachine, { input: initialContext });
      machine.subscribe((state) => {
        if (state.matches('searching')) {
          searchCount++;
        }
        if (state.matches('error')) {
          expect(state.context.serverError).toEqual({
            response: {
              errors: [
                {
                  message: 'Exception while fetching data (/findHistory) : No History entries found'
                }
              ]
            }
          });
          expect(searchCount).toEqual(2);
          done();
        }
      });
      machine.start();
      machine.send({ type: 'UPDATE_HISTORY_PROPS', props: { workNumber: 'SGP8' } });
    });
  });
  describe('searches history again on RETRY on error', () => {
    it('calls the findHistory query and sets state to searching', (done) => {
      (findHistory as jest.MockedFunction<typeof findHistory>).mockRejectedValue({
        response: {
          errors: [
            {
              message: 'Exception while fetching data (/findHistory) : No History entries found'
            }
          ]
        }
      });

      let searchCount = 0;
      const mockSearchMachine = createHistoryMachine();
      const machine = createActor(mockSearchMachine, { input: initialContext });
      machine.subscribe((state) => {
        if (state.matches('searching')) {
          searchCount++;
        }
        if (state.matches('error')) {
          expect(state.context.serverError).toEqual({
            response: {
              errors: [
                {
                  message: 'Exception while fetching data (/findHistory) : No History entries found'
                }
              ]
            }
          });
          expect(searchCount).toEqual(2);
          done();
        }
      });
      machine.start();
      machine.send({ type: 'RETRY' });
    });
  });

  describe('when updating the font size', () => {
    it('keeps the same history results between re-render ', (done) => {
      (findHistory as jest.MockedFunction<typeof findHistory>).mockResolvedValueOnce({
        history: {
          entries: [],
          flaggedBarcodes: []
        },
        historyGraph: 'mockGraph',
        fontSize: 8,
        zoom: 1
      });

      const actor = createActor(createHistoryMachine(), {
        input: {
          history: { entries: [], flaggedBarcodes: [] },
          serverError: null,
          historyGraph: 'mockGraph',
          historyGraphZoom: 1,
          historyGraphFontSize: 16,
          historyProps: { resultFormat: 'graph', workNumber: 'SGP8' }
        }
      });
      actor.subscribe((state) => {
        if (state.matches('found')) {
          expect(state.context).toEqual({
            historyProps: { workNumber: 'SGP8', resultFormat: 'graph' },
            history: { entries: [], flaggedBarcodes: [] },
            serverError: null,
            historyGraph: 'mockGraph',
            historyGraphFontSize: 8,
            historyGraphZoom: 1
          });
          done();
        }
      });
      actor.start();
      actor.send({ type: 'UPDATE_HISTORY_PROPS', props: { fontSize: 8 } });
    });
  });
  describe('when zooming in/out', () => {
    it('keeps the same history results between re-render ', (done) => {
      (findHistory as jest.MockedFunction<typeof findHistory>).mockResolvedValueOnce({
        history: {
          entries: [],
          flaggedBarcodes: []
        },
        historyGraph: 'mockGraph',
        fontSize: 8,
        zoom: 3
      });

      const actor = createActor(createHistoryMachine(), {
        input: {
          history: { entries: [], flaggedBarcodes: [] },
          serverError: null,
          historyGraph: 'mockGraph',
          historyGraphZoom: 1,
          historyGraphFontSize: 8,
          historyProps: { resultFormat: 'graph', workNumber: 'SGP8' }
        }
      });
      actor.subscribe((state) => {
        if (state.matches('found')) {
          expect(state.context).toEqual({
            historyProps: { workNumber: 'SGP8', resultFormat: 'graph' },
            history: { entries: [], flaggedBarcodes: [] },
            serverError: null,
            historyGraph: 'mockGraph',
            historyGraphFontSize: 8,
            historyGraphZoom: 3
          });
          done();
        }
      });
      actor.start();
      actor.send({ type: 'UPDATE_HISTORY_PROPS', props: { zoom: 3 } });
    });
  });
});
