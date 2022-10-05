import { interpret } from 'xstate';
import createSearchMachine from '../../../src/lib/machines/search/searchMachine';
import { SearchService } from '../../../src/lib/services/searchService';
import { SearchResultsType, SearchResultTableEntry } from '../../../src/types/stan';

describe('searchMachine', () => {
  it('it transitions to ready on creation and has the correct context', (done) => {
    const mockSearchMachine = createSearchMachine(new SearchService()).withContext({
      findRequest: {
        labwareBarcode: ''
      },
      maxRecords: 10
    });

    const machine = interpret(mockSearchMachine).onTransition((state) => {
      if (state.matches('ready')) {
        expect(state.context).toEqual({
          findRequest: {
            labwareBarcode: ''
          },
          maxRecords: 10
        });
        done();
      }
    });

    expect(machine.id).toEqual('searchMachine');
    machine.start();
  });

  it('has an unknown state if created without context', (done) => {
    const mockSearchMachine = createSearchMachine(new SearchService());

    const machine = interpret(mockSearchMachine).onTransition((state) => {
      if (state.matches('unknown')) {
        expect(state.context).toEqual(undefined);
        done();
      }
      done();
    });

    machine.start();
  });

  describe('FIND', () => {
    it('calls the find query and sets state to searched', (done) => {
      const mockSearchResults = {
        numDisplayed: 2,
        numRecords: 2,
        entries: [
          {
            barcode: 'STAN-3001',
            labwareType: 'Pot',
            workNumbers: [],
            donorId: '123',
            tissueType: 'Tissue type 1',
            location: null,
            labwareCreated: new Date(),
            embeddingMedium: 'medium'
          },
          {
            barcode: 'STAN-3001',
            labwareType: 'Proviasette',
            workNumbers: [],
            donorId: '234',
            tissueType: 'Tissue type 2',
            location: null,
            labwareCreated: new Date(),
            embeddingMedium: 'none'
          }
        ]
      };
      const mockSearchMachine = createSearchMachine(new SearchService())
        .withContext({
          findRequest: {},
          maxRecords: 10
        })
        .withConfig({
          services: {
            search() {
              return new Promise<SearchResultsType<SearchResultTableEntry>>((resolve) => {
                resolve(mockSearchResults);
              });
            }
          }
        });
      const machine = interpret(mockSearchMachine).onTransition((state) => {
        if (state.matches('searched')) {
          expect(state.context).toEqual({
            findRequest: {},
            maxRecords: 10,
            serverError: null,
            searchResult: mockSearchResults
          });
          done();
        }
      });

      machine.start();
      machine.send({ type: 'FIND', request: { labwareBarcode: 'STAN-3001' } });
    });

    it('when the labwareBarcode isnt found it assigns an error', (done) => {
      const mockSearchMachine = createSearchMachine(new SearchService())
        .withContext({
          findRequest: {},
          maxRecords: 10
        })
        .withConfig({
          services: {
            search() {
              return new Promise<SearchResultsType<SearchResultTableEntry>>((_resolve, reject) => {
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
            }
          }
        });

      const machine = interpret(mockSearchMachine).onTransition((state) => {
        if (state.context.serverError !== undefined && state.context.serverError !== null) {
          expect(state.context.serverError).toEqual({
            response: {
              errors: [
                {
                  message: 'Exception while fetching data (/find) : No labware found with barcode: STAN-3001'
                }
              ]
            }
          });
          expect(state.matches('ready'));
          done();
        }
      });

      machine.start();
      machine.send({ type: 'FIND', request: { labwareBarcode: 'STAN-3001' } });
    });
  });
});
