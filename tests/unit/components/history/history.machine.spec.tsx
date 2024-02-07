import { interpret } from 'xstate';
import createHistoryMachine from '../../../../src/components/history/history.machine';
import { HistoryData, HistoryTableEntry } from '../../../../src/types/stan';
import { LabwareState } from '../../../../src/types/sdk';
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
afterEach(() => {
  jest.clearAllMocks();
});

function findHistorySuccess() {
  return {
    findHistory() {
      return new Promise<HistoryData>((resolve) => {
        resolve({ entries: mockHistorySearchResults, flaggedBarcodes: [] });
      });
    }
  };
}
function findHistoryError() {
  return {
    findHistory() {
      return new Promise<HistoryData>((resolve, reject) => {
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
    }
  };
}

describe('historyMachine', () => {
  it('transitions to searching on creation and has the correct context', (done) => {
    const mockHistoryMachine = createHistoryMachine().withContext(
      Object.assign({}, createHistoryMachine().context, {
        historyProps: { workNumber: 'SGP8' },
        history: { entries: [], flaggedBarcodes: [] },
        serverError: null
      })
    );
    const machine = interpret(mockHistoryMachine).onTransition((state) => {
      if (state.matches('searching')) {
        expect(state.context).toEqual({
          historyProps: { workNumber: 'SGP8' },
          history: { entries: [], flaggedBarcodes: [] },
          serverError: null
        });
        done();
      }
    });
    machine.start();
  });

  it('has an initial state of historyProps params with all fields filled in', (done) => {
    const mockHistoryMachine = createHistoryMachine().withContext(
      Object.assign({}, createHistoryMachine().context, {
        historyProps: {
          workNumber: 'SGP8',
          barcode: 'STAN-3111',
          donorName: 'DONOR1',
          externalName: 'EXT_1',
          sampleId: 1,
          eventType: 'Event'
        },
        history: { entries: [], flaggedBarcodes: [] },
        serverError: null
      })
    );
    const machine = interpret(mockHistoryMachine).onTransition((state) => {
      if (state.matches('searching')) {
        done();
      }
    });
    machine.start();
  });
  describe('searches history on initialisation', () => {
    it('calls the findHistory query and sets state to found', (done) => {
      const mockSearchMachine = createHistoryMachine()
        .withContext({
          historyProps: { workNumber: 'SGP8' },
          history: { entries: [], flaggedBarcodes: [] },
          serverError: null
        })
        .withConfig({
          services: findHistorySuccess()
        });
      const machine = interpret(mockSearchMachine).onTransition((state) => {
        if (state.matches('found')) {
          expect(state.context).toEqual({
            historyProps: { workNumber: 'SGP8' },
            history: { entries: mockHistorySearchResults, flaggedBarcodes: [] },
            serverError: null
          });
          done();
        }
      });
      machine.start();
    });
  });
  describe('searches history again on UPDATE_HISTORY_PROPS', () => {
    it('calls the findHistory query and sets state to searching', (done) => {
      let searchCount = 0;

      const mockSearchMachine = createHistoryMachine()
        .withContext({
          historyProps: { workNumber: 'SGP8' },
          history: { entries: [], flaggedBarcodes: [] },
          serverError: null
        })
        .withConfig({
          services: findHistorySuccess()
        });
      const machine = interpret(mockSearchMachine).onTransition((state, event) => {
        if (state.matches('searching')) {
          searchCount++;
        }
        if (state.matches('found')) {
          expect(state.context).toEqual({
            historyProps: { workNumber: 'SGP8' },
            history: { entries: mockHistorySearchResults, flaggedBarcodes: [], serverError: null }
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
      const mockHistoryMachine = createHistoryMachine()
        .withContext({
          historyProps: { workNumber: 'SGP8' },
          history: { entries: [], flaggedBarcodes: [] },
          serverError: null
        })
        .withConfig({
          services: findHistoryError()
        });
      const machine = interpret(mockHistoryMachine).onTransition((state) => {
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
      let searchCount = 0;
      const mockSearchMachine = createHistoryMachine()
        .withContext({
          historyProps: { workNumber: 'SGP8' },
          history: { entries: [], flaggedBarcodes: [] },
          serverError: null
        })
        .withConfig({
          services: findHistoryError()
        });
      const machine = interpret(mockSearchMachine).onTransition((state, event) => {
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
      let searchCount = 0;
      const mockSearchMachine = createHistoryMachine()
        .withContext({
          historyProps: { workNumber: 'SGP8' },
          history: { entries: [], flaggedBarcodes: [] },
          serverError: null
        })
        .withConfig({
          services: findHistoryError()
        });
      const machine = interpret(mockSearchMachine).onTransition((state, event) => {
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
});
