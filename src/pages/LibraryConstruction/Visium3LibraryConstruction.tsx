import React, { useEffect, useRef } from 'react';
import AppShell from '../../components/AppShell';
import { Formik } from 'formik';
import Heading from '../../components/Heading';
import {
  LabwareFieldsFragment,
  LabwareFlaggedFieldsFragment,
  LibraryConRequest,
  PerformLibraryConstructionMutation,
  ReagentTransfer,
  SlotFieldsFragment,
  SlotMeasurementRequest
} from '../../types/sdk';
import * as Yup from 'yup';
import { stanCore } from '../../lib/sdk';
import { ReagentMultiMapper } from './ReagentMultiMapper';
import ButtonBar from '../../components/ButtonBar';
import PinkButton from '../../components/buttons/PinkButton';
import { CycleRecorder } from './CycleRecorder';
import BlueButton from '../../components/buttons/BlueButton';
import createFormMachine from '../../lib/machines/form/formMachine';
import { fromPromise } from 'xstate';
import { useMachine } from '@xstate/react';
import Warning from '../../components/notifications/Warning';
import OperationCompleteModal from '../../components/modal/OperationCompleteModal';
import { find } from 'lodash';

enum LibraryConstructionStep {
  RecordCycle = 'recordCycle',
  ReagentTransfer = 'reagentTransfer'
}

export type LibraryConstForm = {
  workNumber: string;
  labware: LabwareFlaggedFieldsFragment;
  reagentTransfers: Array<ReagentTransfer>;
  slotMeasurements: Array<SlotMeasurementRequest>;
};

export type LibraryConRequestForm = {
  // to track the current destination displayed on the page labware (for paging)
  destinationLabwareOnDisplay?: LabwareFlaggedFieldsFragment;
  // to track the selected slots within the source labware (reagent plate)
  selectedSourceAddress?: string;
  reagentPlateType: string;
  reagentPlate: LabwareFieldsFragment | undefined;
  libraryConst: Array<LibraryConstForm>;
  // to track which step of the process the user is on, either recording the cycle or transferring reagents so to display the corresponding components
  step: LibraryConstructionStep;
};

const initialValues: LibraryConRequestForm = {
  reagentPlateType: '',
  reagentPlate: undefined,
  libraryConst: [],
  step: LibraryConstructionStep.ReagentTransfer
};

const libraryConRequestValidationSchema = Yup.object().shape({
  reagentPlateType: Yup.string().required('Reagent Plate Type is required'),
  reagentPlate: Yup.object().nonNullable().required('Reagent Plate is required'),
  libraryConst: Yup.array()
    .of(
      Yup.object().shape({
        workNumber: Yup.string().required('SGP Number is required for each destination labware'),
        labware: Yup.object().nonNullable(),
        reagentTransfers: Yup.array()
          .of(
            Yup.object().shape({
              reagentPlateBarcode: Yup.string().required('Reagent Plate Barcode is required'),
              reagentSlotAddress: Yup.string().required('Reagent Slot Address is required'),
              destinationAddress: Yup.string().required('Destination Address is required')
            })
          )
          .min(1, 'At least one reagent transfer is required for each destination labware'),
        slotMeasurements: Yup.array()
          .of(
            Yup.object().shape({
              address: Yup.string().required('Slot address is required'),
              name: Yup.string()
                .required('Measurement name is required')
                .oneOf(['cycles', 'cDNA concentration'], 'Slot Measurement must contain "Cycles"'),
              value: Yup.string().required('Measurement value is required')
            })
          )
          .test(
            'same-length-as-reagent-transfers',
            'Cycles must be recorded for each slot',
            (slotMeasurements, context) => {
              const cyclesCount = (slotMeasurements ?? []).filter((sm) => sm.name === 'cycles').length;
              return cyclesCount >= (context.parent.reagentTransfers?.length ?? 0);
            }
          )
      })
    )
    .min(1, 'At least one reagent transfer is required')
});

export enum ReagentPlateType {
  DualIndexTTSetA = 'Dual Index TT Set A',
  DualIndexTSSetA = 'Dual Index TS Set A'
}

export const getDestinationSlotColor = (
  libraryConst: LibraryConRequestForm['libraryConst'],
  basicBgSourceSlotColorPerPlateType: string,
  labware: LabwareFlaggedFieldsFragment,
  address: string,
  slot: SlotFieldsFragment
) => {
  const scc = find(libraryConst.find((library) => library.labware.barcode === labware.barcode)?.reagentTransfers, {
    destinationAddress: address
  });
  if (scc) {
    return `bg-${basicBgSourceSlotColorPerPlateType}-500`;
  }
  if (slot?.samples?.length) {
    return 'bg-sdb-300';
  }
};

/**
 * Maps a reagent plate type to its basic background source slot colour.
 * Exported so it can be reused (e.g. in ReagentMultiMapper) instead of duplicating the logic.
 */
export const getBasicBgSourceSlotColor = (reagentPlateType?: string): string => {
  switch (reagentPlateType) {
    case ReagentPlateType.DualIndexTTSetA:
      return 'green';
    case ReagentPlateType.DualIndexTSSetA:
      return 'blue';
    default:
      return 'gray';
  }
};

export const Visium3LibraryConstruction = () => {
  const formMachine = React.useMemo(() => {
    return createFormMachine<Array<LibraryConRequest>, PerformLibraryConstructionMutation>().provide({
      actors: {
        submitForm: fromPromise(({ input }) => {
          if (input.event.type !== 'SUBMIT_FORM') return Promise.reject();
          return stanCore.PerformLibraryConstruction({
            request: { ...input.event.values }
          });
        })
      }
    });
  }, []);

  const [current, send] = useMachine(formMachine);
  const { serverError, submissionResult } = current.context;
  const warningRef = useRef<HTMLDivElement>(null);
  // Scroll the error notification into view if it appears
  useEffect(() => {
    warningRef.current?.scrollIntoView({ behavior: 'smooth' });
  });
  return (
    <AppShell>
      <AppShell.Header>
        <AppShell.Title>Visium 3' Library Construction </AppShell.Title>
      </AppShell.Header>
      <AppShell.Main>
        <div className="mx-auto">
          <div className="mb-8">
            {serverError && (
              <div ref={warningRef}>
                <Warning error={serverError} />
              </div>
            )}
            <Formik
              initialValues={initialValues}
              onSubmit={async (values) => {
                const libraryConstRequests: Array<LibraryConRequest> = values.libraryConst.map((lc) => {
                  return {
                    reagentPlateType: values.reagentPlateType,
                    workNumber: lc.workNumber,
                    labwareBarcode: lc.labware.barcode,
                    reagentTransfers: lc.reagentTransfers,
                    slotMeasurements: lc.slotMeasurements
                      .filter((sm) => sm.name === 'cycles')
                      .map((sm) => {
                        return {
                          address: sm.address,
                          name: sm.name,
                          value: sm.value
                        };
                      })
                  };
                });
                send({ type: 'SUBMIT_FORM', values: libraryConstRequests });
              }}
              validationSchema={libraryConRequestValidationSchema}
            >
              {({ values, setFieldValue, isValid, handleSubmit }) => (
                <form onSubmit={handleSubmit}>
                  {values.step === LibraryConstructionStep.ReagentTransfer && (
                    <div>
                      <Heading level={3} className="mb-8">
                        Transfer Reagents
                      </Heading>
                      <ReagentMultiMapper />
                    </div>
                  )}
                  {values.step === LibraryConstructionStep.RecordCycle && <CycleRecorder />}
                  {values.libraryConst.length > 0 && (
                    <div className="mt-6">
                      {values.step === LibraryConstructionStep.ReagentTransfer && (
                        <ButtonBar>
                          <PinkButton
                            data-testid="record-cycle-button"
                            disabled={values.libraryConst.flatMap((lc) => lc.reagentTransfers).length === 0}
                            action="primary"
                            onClick={async () => {
                              await setFieldValue('step', LibraryConstructionStep.RecordCycle);
                            }}
                          >
                            Record Cycle {'>'}
                          </PinkButton>
                        </ButtonBar>
                      )}
                      {values.step === LibraryConstructionStep.RecordCycle && (
                        <ButtonBar className="flex flex-row justify-between">
                          <PinkButton
                            data-testid="reagent-transfer-button"
                            action="primary"
                            onClick={async () => {
                              await setFieldValue('step', LibraryConstructionStep.ReagentTransfer);
                            }}
                          >
                            {'<'} Reagent Transfer
                          </PinkButton>
                          <BlueButton disabled={!isValid} action="primary" type={'submit'} data-testid="submit-button">
                            Submit
                          </BlueButton>
                        </ButtonBar>
                      )}
                    </div>
                  )}
                </form>
              )}
            </Formik>
          </div>
          <OperationCompleteModal
            show={submissionResult !== undefined}
            message={'Library Construction operation completed successfully'}
          >
            <p>
              If you wish to start the process again, click the "Reset Form" button. Otherwise you can return to the
              Home screen.
            </p>
          </OperationCompleteModal>
        </div>
      </AppShell.Main>
    </AppShell>
  );
};
