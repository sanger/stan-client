import { createActor, log } from 'xstate';
import { LabwareState, LifeStage } from '../../../src/types/sdk';
import { createLabwareMachine, LabwareContext } from '../../../src/lib/machines/labware/labwareMachine';
import { createFlaggedLabware } from '../../../src/mocks/handlers/flagLabwareHandlers';
import labwareFactory from '../../../src/lib/factories/labwareFactory';
import * as Yup from 'yup';
import * as sdk from '../../../src/lib/sdk';
import { cleanup } from '@testing-library/react';
import { buildLabwareFragment, convertLabwareToFlaggedLabware } from '../../../src/lib/helpers/labwareHelper';

afterAll(() => {
  jest.resetAllMocks();
});

beforeEach(() => {
  jest.restoreAllMocks();
  cleanup();
});

const mockedLabware = buildLabwareFragment(labwareFactory.build({ barcode: 'STAN-123' }));
const mockedFlaggedLabware = convertLabwareToFlaggedLabware([mockedLabware]);

const mockedLabwareContext: LabwareContext = {
  currentBarcode: '',
  foundLabware: null,
  labwares: mockedFlaggedLabware,
  removedLabware: null,
  foundLabwareCheck: undefined,
  validator: Yup.string().trim().required('Barcode is required'),
  successMessage: null,
  errorMessage: null,
  locationScan: false,
  limit: undefined
};

describe('labwareMachine', () => {
  it('has an initial state of idle.normal', (done) => {
    const machine = createActor(createLabwareMachine(), { input: mockedLabwareContext });
    machine.subscribe((state) => {
      if (state.matches('idle.normal')) {
        machine.stop();
        done();
      }
    });
    machine.start();
  });

  describe('UPDATE_CURRENT_BARCODE', () => {
    it('updates the current barcode', (done) => {
      const machine = createActor(createLabwareMachine(), { input: mockedLabwareContext });
      machine.subscribe((state) => {
        if (
          state.matches('idle.normal') &&
          state.context.currentBarcode === 'STAN-123' &&
          !state.context.locationScan
        ) {
          machine.stop();
          done();
        }
      });
      machine.start();
      machine.send({ type: 'UPDATE_CURRENT_BARCODE', value: 'STAN-123' });
    });
  });

  describe('UPDATE_CURRENT_BARCODE for Location scan', () => {
    it('updates the current barcode for location', (done) => {
      const machine = createActor(createLabwareMachine(), { input: mockedLabwareContext });
      machine.subscribe((state) => {
        if (state.matches('idle.normal') && state.context.currentBarcode === 'STO-123' && state.context.locationScan) {
          machine.stop();
          done();
        }
      });
      machine.start();
      machine.send({
        type: 'UPDATE_CURRENT_BARCODE',
        value: 'STO-123',
        locationScan: true
      });
    });
  });

  describe('BARCODE_SCANNED', () => {
    describe('when the labware with this barcode is already in the table', () => {
      it('transitions to idle.error with an error message', (done) => {
        const machine = createActor(createLabwareMachine(), { input: mockedLabwareContext });
        machine.subscribe((state) => {
          if (state.matches('idle.error')) {
            expect(state.context.errorMessage).toEqual('"STAN-123" has already been scanned');
            machine.stop();
            done();
          }
        });
        machine.start();
        machine.send({
          type: 'UPDATE_CURRENT_BARCODE',
          value: 'STAN-123',
          locationScan: false
        });
        machine.send({ type: 'SUBMIT_BARCODE' });
      });
    });

    describe('when the barcode is not in the table', () => {
      describe('when the barcode is empty', () => {
        it('assigns an error message', (done) => {
          const machine = createActor(createLabwareMachine(), { input: mockedLabwareContext });
          machine.subscribe((state) => {
            if (state.matches('idle.error')) {
              expect(state.context.errorMessage).toEqual('Barcode is required');
              machine.stop();
              done();
            }
          });
          machine.start();
          machine.send({ type: 'SUBMIT_BARCODE' });
        });
      });

      describe('when barcode is valid', () => {
        it('will look up the labware via a service', (done) => {
          jest.spyOn(sdk.stanCore, 'FindLabware').mockResolvedValueOnce({
            labware: mockedLabware
          });
          const machine = createActor(
            createLabwareMachine().provide({
              actions: {
                notifyParent: log('stubbed update labwares')
              }
            }),
            { input: mockedLabwareContext }
          );
          machine.subscribe((state) => {
            if (state.matches('idle.normal') && state.context.labwares.length > 0) {
              expect(state.context.labwares.length).toEqual(1);
              machine.stop();
              done();
            }
          });
          machine.start();
          machine.send({
            type: 'UPDATE_CURRENT_BARCODE',
            value: 'STAN-123',
            locationScan: false
          });
          machine.send({ type: 'SUBMIT_BARCODE' });
        });
      });

      describe("when barcode can't be found", () => {
        it('assigns an error message', (done) => {
          jest.spyOn(sdk.stanCore, 'FindLabware').mockRejectedValueOnce({
            response: {
              errors: [
                {
                  message: 'Exception while fetching data (/labware) : No labware found with barcode: STAN-321'
                }
              ]
            }
          });
          const machine = createActor(createLabwareMachine(), { input: mockedLabwareContext });
          machine.subscribe((state) => {
            if (state.matches('idle.error')) {
              expect(state.context.errorMessage).toEqual('No labware found with barcode: STAN-321');
              machine.stop();
              done();
            }
          });
          machine.start();
          machine.send({
            type: 'UPDATE_CURRENT_BARCODE',
            value: 'STAN-321',
            locationScan: false
          });
          machine.send({ type: 'SUBMIT_BARCODE' });
        });
      });
    });

    describe('BARCODE_SCANNED FOR LOCATION', () => {
      describe('when barcode is valid for location scan', () => {
        it('will look up for labware in location via a service', (done) => {
          jest.spyOn(sdk.stanCore, 'GetLabwareInLocation').mockResolvedValueOnce({
            labwareInLocation: ['STAN-1111', 'STAN-2222'].map((barcode) => {
              return {
                id: 1,
                destroyed: false,
                discarded: false,
                released: false,
                created: new Date().toISOString(),
                state: LabwareState.Active,
                __typename: 'Labware',
                labwareType: {
                  __typename: 'LabwareType',
                  name: 'Proviasette',
                  numRows: 1,
                  numColumns: 1
                },
                barcode: `${barcode}`,
                slots: [
                  {
                    id: 1,
                    address: 'A1',
                    labwareId: 1,
                    block: false,
                    samples: [
                      {
                        __typename: 'Sample',
                        id: 1,
                        bioState: {
                          name: 'Blah'
                        },
                        tissue: {
                          __typename: 'Tissue',
                          externalName: 'External 1',
                          replicate: '5',
                          donor: {
                            donorName: 'Donor 3',
                            lifeStage: LifeStage.Adult
                          },
                          medium: {
                            name: 'None'
                          },
                          fixative: {
                            name: 'None',
                            enabled: false
                          },
                          spatialLocation: {
                            name: 'Upper pole',
                            code: 3,
                            tissueType: {
                              name: 'Lung'
                            }
                          }
                        }
                      }
                    ]
                  }
                ]
              };
            })
          });

          const machine = createActor(
            createLabwareMachine().provide({
              actions: {
                notifyParent: log('stubbed update labwares')
              }
            }),
            { input: mockedLabwareContext }
          );
          machine.subscribe((state) => {
            if (state.matches('idle.normal') && state.context.labwares.length > 1) {
              expect(state.context.labwares.length).toEqual(3);
              machine.stop();
              done();
            }
          });
          machine.start();
          machine.send({
            type: 'UPDATE_CURRENT_BARCODE',
            value: 'STO-123',
            locationScan: true
          });
          machine.send({ type: 'SUBMIT_BARCODE' });
        });
      });
    });

    describe('REMOVE_LABWARE', () => {
      it('transitions to idle.success', (done) => {
        const machine = createActor(
          createLabwareMachine().provide({
            actions: {
              notifyParent: log('stubbed notify parent')
            }
          }),
          { input: mockedLabwareContext }
        );
        machine.subscribe((state) => {
          if (state.matches('idle.success')) {
            expect(state.context.successMessage).toEqual('"STAN-123" removed');
            expect(state.context.labwares.length).toEqual(0);
            machine.stop();
            done();
          }
        });
        machine.start();
        machine.send({ type: 'REMOVE_LABWARE', value: 'STAN-123' });
      });
    });

    describe('LOCK/UNLOCK', () => {
      it('transitions to locked and back to idle.normal', (done) => {
        let wasLocked = false;
        const machine = createActor(createLabwareMachine(), { input: mockedLabwareContext });
        machine.subscribe((state) => {
          if (state.matches('locked')) {
            wasLocked = true;
          }
          if (wasLocked && state.matches('idle.normal')) {
            machine.stop();
            done();
          }
        });
        machine.start();
        machine.send({ type: 'LOCK' });
        machine.send({ type: 'UNLOCK' });
      });
    });
    describe('When enableFlaggedLabwareCheck is true', () => {
      describe('when a flagged labware barcode is scanned', () => {
        it('runs FindFlaggedLabware query', (done) => {
          jest.spyOn(sdk.stanCore, 'FindFlaggedLabware').mockResolvedValueOnce({
            labwareFlagged: createFlaggedLabware('STAN-12300')
          });
          const labwareMachine = createLabwareMachine().provide({
            actions: {
              notifyParent: log('stubbed update labwares')
            }
          });
          const stateMachine = createActor(labwareMachine, {
            input: { ...mockedLabwareContext, enableFlaggedLabwareCheck: true }
          });
          stateMachine.subscribe((state) => {
            if (state.matches('idle.normal') && state.context.labwares.length > 1) {
              expect(state.context.labwares.length).toEqual(2);
              expect(state.context.labwares[1].flagged).toEqual(true);
              stateMachine.stop();
              done();
            }
          });
          stateMachine.start();
          stateMachine.send({
            type: 'UPDATE_CURRENT_BARCODE',
            value: 'STO-12300',
            locationScan: false
          });
          stateMachine.send({ type: 'SUBMIT_BARCODE' });
          expect(stateMachine.getSnapshot().context.enableFlaggedLabwareCheck).toEqual(true);
        });
      });
    });
  });
});
