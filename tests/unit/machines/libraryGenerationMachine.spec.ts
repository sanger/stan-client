import { createActor, getInitialSnapshot } from 'xstate';
import { libraryGenerationMachine } from '../../../src/lib/machines/libraryGenerationMachine';
import {
  LabwareState,
  ReagentTransfer,
  SlideCosting,
  SlotCopyDestination,
  SlotCopySource
} from '../../../src/types/sdk';
import { Source } from '../../../src/lib/machines/slotCopy/slotCopyMachine';
import { createFlaggedLabware } from '../../../src/mocks/handlers/flagLabwareHandlers';
import { SlotMeasurement } from '../../../src/components/slotMeasurement/SlotMeasurements';
import * as sdk from '../../../src/lib/sdk';
import { plateOutputSlotCopy } from '../../../src/components/libraryGeneration/SlotCopyComponent';
import { createLabware } from '../../../src/mocks/handlers/labwareHandlers';

const mockedMachineInput = {
  workNumber: '',
  sources: [],
  destinationLabware: plateOutputSlotCopy?.labware,
  reagentTransfers: [],
  reagentPlateType: '',
  slotMeasurements: []
};

const mockedSources: Array<Source> = [
  {
    labware: createFlaggedLabware('STAN-3245'),
    labwareState: LabwareState.Active
  },
  {
    labware: createFlaggedLabware('STAN-4245'),
    labwareState: LabwareState.Destroyed
  }
];

const mockedSlotCopySources: Array<SlotCopySource> = [
  { barcode: 'STAN-3245', labwareState: LabwareState.Active },
  { barcode: 'STAN-4245', labwareState: LabwareState.Destroyed }
];

const mockedSlotCopyContent: SlotCopyDestination = {
  labwareType: 'SLIDE',
  barcode: 'STAN-3245',
  bioState: 'FRESH',
  costing: SlideCosting.Sgp,
  lotNumber: '1234567',
  probeLotNumber: '1234567',
  preBarcode: '1234567',
  contents: [
    {
      sourceBarcode: 'STAN-3245',
      sourceAddress: 'A1',
      destinationAddress: 'A1'
    }
  ]
};

const mockedReagentTransfer: Array<ReagentTransfer> = [
  {
    reagentPlateBarcode: 'STAN-2334',
    reagentSlotAddress: 'A1',
    destinationAddress: 'A3'
  },
  {
    reagentPlateBarcode: 'STAN-5334',
    reagentSlotAddress: 'A1',
    destinationAddress: 'A4'
  }
];

const mockedSlotMeasurement: Array<SlotMeasurement> = [
  { address: 'A3', name: 'cycle', value: '10' },
  { address: 'A4', name: 'cycle', value: '2' }
];
describe('libraryGenerationMachine', () => {
  it('has an initial state of sampleTransfer', () => {
    const initialSnapshot = getInitialSnapshot(libraryGenerationMachine, { ...mockedMachineInput });
    expect(initialSnapshot.value).toEqual('sampleTransfer');
  });

  describe('Sample Transfer Step', () => {
    describe('Go to reagent transfer step (step 2) from sample transfer step (step 1)', () => {
      it('transitions to reagentTransfer state', (done) => {
        const actor = createActor(libraryGenerationMachine, {
          input: mockedMachineInput
        });
        actor.subscribe((state) => {
          if (state.matches('reagentTransfer')) {
            actor.stop();
            done();
          }
        });
        actor.start();
        actor.send({
          type: 'GO_TO_REAGENT_TRANSFER',
          destinationLabware: plateOutputSlotCopy?.labware
        });
      });
      it('updates destination labware', (done) => {
        const actor = createActor(libraryGenerationMachine, {
          input: mockedMachineInput
        });
        actor.subscribe((state) => {
          if (state.matches('reagentTransfer')) {
            expect(state.context.destinationLabware).toEqual(plateOutputSlotCopy?.labware);
            actor.stop();
            done();
          }
        });
        actor.start();
        actor.send({
          type: 'GO_TO_REAGENT_TRANSFER',
          destinationLabware: plateOutputSlotCopy?.labware
        });
      });

      it('updates sources', (done) => {
        const actor = createActor(libraryGenerationMachine, {
          input: mockedMachineInput
        });
        actor.subscribe((state) => {
          if (state.matches('reagentTransfer')) {
            expect(state.context.sources).toEqual(mockedSlotCopySources);
            actor.stop();
            done();
          }
        });
        actor.start();
        actor.send({
          type: 'GO_TO_REAGENT_TRANSFER',
          slotCopyDetails: mockedSlotCopyContent,
          sources: mockedSources
        });
      });

      it('updates destination', (done) => {
        const actor = createActor(libraryGenerationMachine, {
          input: mockedMachineInput
        });
        actor.subscribe((state) => {
          if (state.matches('reagentTransfer')) {
            expect(state.context.destination).toEqual(mockedSlotCopyContent);
            actor.stop();
            done();
          }
        });
        actor.start();
        actor.send({
          type: 'GO_TO_REAGENT_TRANSFER',
          slotCopyDetails: mockedSlotCopyContent,
          sources: mockedSources
        });
      });

      it('updates destination labware', (done) => {
        const actor = createActor(libraryGenerationMachine, {
          input: mockedMachineInput
        });
        actor.subscribe((state) => {
          if (state.matches('reagentTransfer')) {
            expect(state.context.destinationLabware).not.toEqual(plateOutputSlotCopy?.labware);
            actor.stop();
            done();
          }
        });
        actor.start();
        actor.send({
          type: 'GO_TO_REAGENT_TRANSFER',
          slotCopyDetails: mockedSlotCopyContent,
          sources: mockedSources
        });
      });
      describe('update work number from sample transfer step', () => {
        it('updates the work number', (done) => {
          const actor = createActor(libraryGenerationMachine, {
            input: mockedMachineInput
          });
          actor.subscribe((state) => {
            if (state.context.workNumber === 'SGP106') {
              actor.stop();
              done();
            }
          });
          actor.start();
          actor.send({
            type: 'UPDATE_WORK_NUMBER',
            workNumber: 'SGP106'
          });
        });
      });
    });

    describe('Reagent Transfer Step', () => {
      describe('Go back to sample transfer step (step 1) from reagent transfer step (step 2)', () => {
        it('updates reagent transfers', (done) => {
          const actor = createActor(libraryGenerationMachine, {
            input: mockedMachineInput,
            snapshot: libraryGenerationMachine.resolveState({
              value: 'reagentTransfer',
              context: {
                workNumber: 'SGP106',
                sources: mockedSlotCopySources,
                destinationLabware: plateOutputSlotCopy?.labware,
                reagentTransfers: [],
                reagentPlateType: '',
                slotMeasurements: []
              }
            })
          });
          actor.subscribe((state) => {
            if (state.matches('sampleTransfer')) {
              expect(state.context.reagentTransfers).toEqual(mockedReagentTransfer);
              actor.stop();
              done();
            }
          });
          actor.start();
          actor.send({
            type: 'GO_TO_SAMPLE_TRANSFER',
            reagentTransfers: mockedReagentTransfer
          });
        });
      });

      describe('update work number at the reagent transfer step', () => {
        it('updates the work number', (done) => {
          const actor = createActor(libraryGenerationMachine, {
            input: mockedMachineInput,
            snapshot: libraryGenerationMachine.resolveState({
              value: 'reagentTransfer',
              context: {
                workNumber: 'SGP106',
                sources: mockedSlotCopySources,
                destinationLabware: plateOutputSlotCopy?.labware,
                reagentTransfers: [],
                reagentPlateType: '',
                slotMeasurements: []
              }
            })
          });
          actor.subscribe((state) => {
            if (state.context.workNumber === 'SGP108') {
              actor.stop();
              done();
            }
          });
          actor.start();
          actor.send({
            type: 'UPDATE_WORK_NUMBER',
            workNumber: 'SGP108'
          });
        });
      });
      describe('Go to amplification step (step 3) from reagent transfer step (step 2)', () => {
        it('updates reagent transfers', (done) => {
          const actor = createActor(libraryGenerationMachine, {
            input: mockedMachineInput,
            snapshot: libraryGenerationMachine.resolveState({
              value: 'reagentTransfer',
              context: {
                workNumber: 'SGP106',
                sources: mockedSlotCopySources,
                destinationLabware: plateOutputSlotCopy?.labware,
                reagentTransfers: [],
                reagentPlateType: '',
                slotMeasurements: []
              }
            })
          });
          actor.subscribe((state) => {
            if (state.matches('amplification')) {
              expect(state.context.reagentTransfers).toEqual(mockedReagentTransfer);
              actor.stop();
              done();
            }
          });
          actor.start();
          actor.send({
            type: 'GO_TO_AMPLIFICATION',
            reagentTransfers: mockedReagentTransfer
          });
        });
      });
    });

    describe('Amplification Step', () => {
      describe('update work number at the amplification step', () => {
        it('updates the work number', (done) => {
          const actor = createActor(libraryGenerationMachine, {
            input: mockedMachineInput,
            snapshot: libraryGenerationMachine.resolveState({
              value: 'amplification',
              context: {
                workNumber: 'SGP108',
                sources: mockedSlotCopySources,
                destinationLabware: plateOutputSlotCopy?.labware,
                reagentTransfers: mockedReagentTransfer,
                reagentPlateType: '',
                slotMeasurements: [
                  { address: 'A3', name: 'Cq value', value: '10' },
                  { address: 'A4', name: 'Cq value', value: '2' }
                ]
              }
            })
          });
          actor.subscribe((state) => {
            if (state.context.workNumber === 'SGP110') {
              actor.stop();
              done();
            }
          });
          actor.start();
          actor.send({
            type: 'UPDATE_WORK_NUMBER',
            workNumber: 'SGP110'
          });
        });
      });
      describe('Go back to reagent transfer step (step 2) from amplification step (step 3)', () => {
        it('updates slot measurements', (done) => {
          const actor = createActor(libraryGenerationMachine, {
            input: mockedMachineInput,
            snapshot: libraryGenerationMachine.resolveState({
              value: 'amplification',
              context: {
                workNumber: 'SGP106',
                sources: mockedSlotCopySources,
                destinationLabware: plateOutputSlotCopy?.labware,
                reagentTransfers: mockedReagentTransfer,
                reagentPlateType: '',
                slotMeasurements: [
                  { address: 'A3', name: 'Cq value', value: '10' },
                  { address: 'A4', name: 'Cq value', value: '2' }
                ]
              }
            })
          });
          actor.subscribe((state) => {
            if (state.matches('reagentTransfer')) {
              expect(state.context.slotMeasurements).toEqual(mockedSlotMeasurement);
              actor.stop();
              done();
            }
          });
          actor.start();
          actor.send({
            type: 'GO_TO_REAGENT_TRANSFER',
            slotMeasurements: mockedSlotMeasurement
          });
        });
      });
      describe('On Save', () => {
        describe('When request succeed', () => {
          it('assign server success message', (done) => {
            jest.spyOn(sdk.stanCore, 'RecordLibraryPrep').mockResolvedValueOnce({
              libraryPrep: { operations: [{ id: 1 }], labware: [createLabware('STAN-5123')] }
            });
            const actor = createActor(libraryGenerationMachine, {
              input: mockedMachineInput,
              snapshot: libraryGenerationMachine.resolveState({
                value: 'amplification',
                context: {
                  workNumber: 'SGP106',
                  sources: mockedSlotCopySources,
                  destinationLabware: plateOutputSlotCopy?.labware,
                  reagentTransfers: mockedReagentTransfer,
                  reagentPlateType: '',
                  slotMeasurements: []
                }
              })
            });
            actor.subscribe((state) => {
              if (state.matches('recorded')) {
                expect(state.context.serverSuccess).not.toBeNull();
                actor.stop();
                done();
              }
            });
            actor.start();
            actor.send({
              type: 'SAVE',
              slotMeasurements: mockedSlotMeasurement
            });
          });
        });
        describe('When request fails', () => {
          it('assign server error message', (done) => {
            jest.spyOn(sdk.stanCore, 'RecordLibraryPrep').mockRejectedValueOnce({
              response: {
                errors: [
                  {
                    message: 'The request could not be validated : The labware is been discarded.'
                  }
                ]
              }
            });
            const actor = createActor(libraryGenerationMachine, {
              input: mockedMachineInput,
              snapshot: libraryGenerationMachine.resolveState({
                value: 'amplification',
                context: {
                  workNumber: 'SGP106',
                  sources: mockedSlotCopySources,
                  destinationLabware: plateOutputSlotCopy?.labware,
                  reagentTransfers: mockedReagentTransfer,
                  reagentPlateType: '',
                  slotMeasurements: []
                }
              })
            });
            actor.subscribe((state) => {
              if (state.matches('amplification') && state.context.serverErrors) {
                expect(state.context.serverErrors).toHaveProperty('message');
                actor.stop();
                done();
              }
            });
            actor.start();
            actor.send({
              type: 'SAVE',
              slotMeasurements: mockedSlotMeasurement
            });
          });
        });
      });
    });
  });
});
