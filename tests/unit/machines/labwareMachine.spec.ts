import { interpret } from 'xstate';
import { FindLabwareQuery, GetLabwareInLocationQuery, LabwareState, LifeStage } from '../../../src/types/sdk';
import { log } from 'xstate/lib/actions';
import { createLabwareMachine, LabwareContext } from '../../../src/lib/machines/labware/labwareMachine';

describe('labwareMachine', () => {
  it('has an initial state of idle.normal', (done) => {
    const machine = interpret(createLabwareMachine([])).onTransition((state) => {
      if (state.matches('idle.normal')) {
        done();
      }
    });
    machine.start();
  });

  describe('UPDATE_CURRENT_BARCODE', () => {
    it('updates the current barcode', (done) => {
      const machine = interpret(createLabwareMachine()).onTransition((state) => {
        if (
          state.matches('idle.normal') &&
          state.context.currentBarcode === 'STAN-123' &&
          !state.context.locationScan
        ) {
          done();
        }
      });
      machine.start();
      machine.send({ type: 'UPDATE_CURRENT_BARCODE', value: 'STAN-123' });
    });
  });

  describe('UPDATE_CURRENT_BARCODE for Location scan', () => {
    it('updates the current barcode for location', (done) => {
      const machine = interpret(createLabwareMachine()).onTransition((state) => {
        if (state.matches('idle.normal') && state.context.currentBarcode === 'STO-123' && state.context.locationScan) {
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
        const mockLabwareTableMachine = createLabwareMachine().withContext(
          Object.assign({}, createLabwareMachine().context, {
            labwares: [
              {
                barcode: 'STAN-123'
              }
            ]
          })
        );

        const machine = interpret(mockLabwareTableMachine).onTransition((state) => {
          if (state.matches('idle.error')) {
            expect(state.context.errorMessage).toEqual('"STAN-123" has already been scanned');
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
          const machine = interpret(createLabwareMachine()).onTransition((state) => {
            if (state.matches('idle.error')) {
              expect(state.context.errorMessage).toEqual('Barcode is required');
              done();
            }
          });
          machine.start();
          machine.send({ type: 'SUBMIT_BARCODE' });
        });
      });

      describe('when barcode is valid', () => {
        it('will look up the labware via a service', (done) => {
          const labwareMachine = createLabwareMachine();
          const mockLTMachine = labwareMachine.withConfig({
            actions: {
              notifyParent: log('stubbed update labwares')
            },
            services: {
              findLabwareByBarcode: (_ctx: LabwareContext) => {
                return new Promise<FindLabwareQuery>((resolve) => {
                  resolve({
                    labware: {
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
                      barcode: 'STAN-123',
                      externalBarcode: 'EXTERNAL-1',
                      slots: [
                        {
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
                    }
                  });
                });
              }
            }
          });
          const machine = interpret(mockLTMachine).onTransition((state) => {
            if (state.matches('idle.normal') && state.context.labwares.length > 0) {
              expect(state.context.labwares.length).toEqual(1);
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
          const mockLTMachine = createLabwareMachine().withConfig({
            services: {
              findLabwareByBarcode: (_ctx: LabwareContext) => {
                return new Promise<FindLabwareQuery>((_resolve, reject) => {
                  reject({
                    response: {
                      errors: [
                        {
                          message: 'Exception while fetching data (/labware) : No labware found with barcode: STAN-321'
                        }
                      ]
                    }
                  });
                });
              }
            }
          });

          const machine = interpret(mockLTMachine).onTransition((state) => {
            if (state.matches('idle.error')) {
              expect(state.context.errorMessage).toEqual('No labware found with barcode: STAN-321');
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
  });

  describe('BARCODE_SCANNED FOR LOCATION', () => {
    describe('when barcode is valid for location scan', () => {
      it('will look up for labware in location via a service', (done) => {
        const labwareMachine = createLabwareMachine();
        const mockLTMachine = labwareMachine.withConfig({
          actions: {
            notifyParent: log('stubbed update labwares')
          },
          services: {
            findLabwareInLocation: (_ctx: LabwareContext) => {
              return new Promise<GetLabwareInLocationQuery>((resolve) => {
                resolve({
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
              });
            }
          }
        });
        const machine = interpret(mockLTMachine).onTransition((state) => {
          if (state.matches('idle.normal') && state.context.labwares.length > 0) {
            expect(state.context.labwares.length).toEqual(2);
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
      const mockLabwareTableMachine = createLabwareMachine()
        .withConfig({
          actions: {
            notifyParent: log('stubbed notify parent')
          }
        })
        .withContext(
          Object.assign({}, createLabwareMachine().context, {
            labwares: [
              {
                barcode: 'STAN-123'
              }
            ]
          })
        );

      const machine = interpret(mockLabwareTableMachine).onTransition((state) => {
        if (state.matches('idle.success')) {
          expect(state.context.successMessage).toEqual('"STAN-123" removed');
          expect(state.context.labwares.length).toEqual(0);
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
      const machine = interpret(createLabwareMachine()).onTransition((state) => {
        if (state.matches('locked')) {
          wasLocked = true;
        }
        if (wasLocked && state.matches('idle.normal')) {
          done();
        }
      });
      machine.start();
      machine.send({ type: 'LOCK' });
      machine.send({ type: 'UNLOCK' });
    });
  });
});
