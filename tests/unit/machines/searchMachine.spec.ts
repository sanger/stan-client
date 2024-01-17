import { createActor } from 'xstate';
import createSearchMachine from '../../../src/lib/machines/search/searchMachine';
import { SearchService } from '../../../src/lib/services/searchService';

afterAll(() => {
  jest.resetAllMocks();
});

const mockSearchResults = {
  find: {
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
  }
};

jest.mock('../../../src/lib/services/searchService');
describe('searchMachine', () => {
  it('it transitions to ready on creation and has the correct context', (done) => {
    const mockSearchMachine = createSearchMachine(new SearchService(), {
      findRequest: {
        labwareBarcode: ''
      },
      maxRecords: 10
    });
    const actorMachine = createActor(mockSearchMachine);
    actorMachine.subscribe((state) => {
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
    expect(mockSearchMachine.id).toEqual('searchMachine');
    actorMachine.start();
  });

  describe('FIND', () => {
    it('calls the find query and sets state to searched', (done) => {
      const mockedSearch = jest.fn().mockResolvedValue(mockSearchResults);
      (SearchService as jest.Mock).mockImplementation(() => ({
        search: mockedSearch
      }));

      const mockSearchMachine = createSearchMachine(new SearchService(), {
        findRequest: {},
        maxRecords: 10
      });
      const machine = createActor(mockSearchMachine);
      machine.subscribe((state) => {
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

    it('when the labwareBarcode is not found it assigns an error', (done) => {
      const mockedSearch = jest.fn().mockRejectedValue({
        response: {
          errors: [
            {
              message: 'Exception while fetching data (/find) : No labware found with barcode: STAN-3001'
            }
          ]
        }
      });
      (SearchService as jest.Mock).mockImplementation(() => ({
        search: mockedSearch
      }));

      const mockSearchMachine = createSearchMachine(new SearchService(), {
        findRequest: {},
        maxRecords: 10
      });
      const machine = createActor(mockSearchMachine);
      machine.subscribe((state) => {
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
      });

      machine.start();
      machine.send({ type: 'FIND', request: { labwareBarcode: 'STAN-3001' } });
    });
  });
});
