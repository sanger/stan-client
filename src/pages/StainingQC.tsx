import React, { useCallback, useContext, useState } from 'react';
import {
  GetStainingQcInfoQuery,
  LabwareFlaggedFieldsFragment,
  LabwareResult as CoreLabwareResult,
  PassFail,
  RecordStainResultMutation,
  ResultRequest
} from '../types/sdk';
import AppShell from '../components/AppShell';
import WorkNumberSelect from '../components/WorkNumberSelect';
import LabwareScanner from '../components/labwareScanner/LabwareScanner';
import LabwareResult from '../components/labwareResult/LabwareResult';
import { StanCoreContext } from '../lib/sdk';
import createFormMachine from '../lib/machines/form/formMachine';
import { useMachine } from '@xstate/react';
import OperationCompleteModal from '../components/modal/OperationCompleteModal';
import Warning from '../components/notifications/Warning';
import BlueButton from '../components/buttons/BlueButton';
import Heading from '../components/Heading';
import Panel from '../components/Panel';
import { useCollection } from '../lib/hooks/useCollection';
import { isSlotFilled } from '../lib/helpers/slotHelper';
import CustomReactSelect, { OptionType } from '../components/forms/CustomReactSelect';
import { fromPromise } from 'xstate';

type StainingQCProps = {
  info: GetStainingQcInfoQuery;
};

export const TISSUE_COVERAGE_MEASUREMENT_NAME = 'Tissue coverage';

const STAIN_QC_TYPES = ['Stain QC', 'Tissue coverage', 'Pretreatment QC'];

export default function StainingQC({ info }: StainingQCProps) {
  const [workNumber, setWorkNumber] = useState<string>('');
  const [qcType, setQCType] = useState<string>('');

  const labwareResults = useCollection<CoreLabwareResult>({
    getKey: (item) => item.barcode
  });

  const stanCore = useContext(StanCoreContext);

  const formMachine = React.useMemo(() => {
    return createFormMachine<ResultRequest, RecordStainResultMutation>().provide({
      actors: {
        submitForm: fromPromise(({ input }) => {
          if (input.event.type !== 'SUBMIT_FORM') return Promise.reject();
          let newLabwareResults: CoreLabwareResult[] = [];
          if (input.event.values.operationType === STAIN_QC_TYPES[0]) {
            //Remove slotMeasurements from labwareResults if qcType is Stain QC
            newLabwareResults = input.event.values.labwareResults.map((labwareResult: CoreLabwareResult) => {
              return {
                barcode: labwareResult.barcode,
                sampleResults: labwareResult.sampleResults
              };
            });
          }
          //Remove sampleResults from labwareResults if qcType is Tissue coverage
          if (input.event.values.operationType === STAIN_QC_TYPES[1]) {
            /**Omit all measurements for which the tissue coverage is not specified**/
            newLabwareResults = input.event.values.labwareResults.map((labwareResult: CoreLabwareResult) => {
              const slotMeasurements = labwareResult.slotMeasurements?.filter(
                (sm) => sm.value !== '' && sm.name === TISSUE_COVERAGE_MEASUREMENT_NAME
              );
              return slotMeasurements && slotMeasurements.length > 0
                ? { barcode: labwareResult.barcode, slotMeasurements }
                : {
                    barcode: labwareResult.barcode
                  };
            });
          }
          if (input.event.values.operationType === STAIN_QC_TYPES[2]) {
            //Remove slotMeasurements from labwareResults and passFail from each sampleResult if qcType is Pretreatment QC
            newLabwareResults = input.event.values.labwareResults.map((labwareResult: CoreLabwareResult) => {
              return {
                barcode: labwareResult.barcode,
                sampleResults: labwareResult.sampleResults?.map((sampleResult) => {
                  return {
                    ...sampleResult,
                    result: undefined
                  };
                })
              };
            });
          }
          return stanCore.RecordStainResult({
            request: {
              labwareResults: newLabwareResults,
              workNumber: input.event.values.workNumber,
              operationType: input.event.values.operationType
            }
          });
        })
      }
    });
  }, [stanCore]);
  const [current, send] = useMachine(formMachine);

  const { serverError } = current.context;
  const onAddLabware = useCallback(
    (labware: LabwareFlaggedFieldsFragment) => {
      labwareResults.append(buildLabwareResult(labware));
    },
    [labwareResults]
  );

  const onRemoveLabware = useCallback(
    (labware: LabwareFlaggedFieldsFragment) => {
      labwareResults.remove(labware.barcode);
    },
    [labwareResults]
  );

  const blueButtonDisabled = labwareResults.items.length <= 0 || workNumber === '' || qcType === '';

  return (
    <AppShell>
      <AppShell.Header>
        <AppShell.Title>Staining QC</AppShell.Title>
      </AppShell.Header>
      <AppShell.Main>
        <div className="max-w-screen-xl mx-auto">
          <div className="space-y-2">
            <Heading level={2}>SGP Number</Heading>

            <p>Select an SGP number to associate with this operation.</p>

            <div className="mt-4 md:w-1/2">
              <WorkNumberSelect onWorkNumberChange={setWorkNumber} />
            </div>
          </div>
          <div className="space-y-2">
            <Heading level={2}>QC Type</Heading>

            <p>Select QC Type.</p>

            <div className="mt-4 md:w-1/2">
              <CustomReactSelect
                dataTestId={'qcType'}
                handleChange={(value) => {
                  setQCType((value as OptionType).value);
                }}
                options={STAIN_QC_TYPES.map((qcType) => ({
                  label: qcType,
                  value: qcType
                }))}
                emptyOption
              />
            </div>
          </div>

          <div className="mt-8 space-y-2">
            <Heading level={2}>Slides</Heading>

            <p>Please scan in any slides you wish to QC.</p>

            <LabwareScanner onAdd={onAddLabware} onRemove={onRemoveLabware} enableFlaggedLabwareCheck>
              {({ labwares, removeLabware }) =>
                labwares.map(
                  (labware) =>
                    labwareResults.getItem(labware.barcode) && (
                      <Panel key={labware.barcode}>
                        <LabwareResult
                          initialLabwareResult={labwareResults.getItem(labware.barcode)!}
                          labware={labware}
                          availableComments={info.comments}
                          onRemoveClick={removeLabware}
                          commentsForSlotSections
                          onChange={(labwareResult) => labwareResults.update(labwareResult)}
                          displayComments={qcType === STAIN_QC_TYPES[0] || qcType === STAIN_QC_TYPES[2]}
                          displayPassFail={qcType === STAIN_QC_TYPES[0]}
                          displayMeasurement={qcType === STAIN_QC_TYPES[1]}
                        />
                      </Panel>
                    )
                )
              }
            </LabwareScanner>
          </div>

          {serverError && <Warning message={'Failed to record Staining QC'} error={serverError} />}

          <div className={'mt-4 flex flex-row items-center justify-end'}>
            <BlueButton
              disabled={blueButtonDisabled}
              onClick={() =>
                send({
                  type: 'SUBMIT_FORM',
                  values: {
                    operationType: qcType,
                    workNumber,
                    labwareResults: labwareResults.items
                  }
                })
              }
            >
              Save
            </BlueButton>
          </div>
        </div>

        <OperationCompleteModal show={current.matches('submitted')} message={`${qcType} complete`}>
          <p>
            If you wish to start the process again, click the "Reset Form" button. Otherwise you can return to the Home
            screen.
          </p>
        </OperationCompleteModal>
      </AppShell.Main>
    </AppShell>
  );
}

function buildLabwareResult(labware: LabwareFlaggedFieldsFragment): CoreLabwareResult {
  return {
    barcode: labware.barcode,
    sampleResults: labware.slots.filter(isSlotFilled).map((slot) => ({
      address: slot.address,
      result: PassFail.Pass
    })),
    slotMeasurements: labware.slots.filter(isSlotFilled).map((slot) => ({
      address: slot.address,
      name: TISSUE_COVERAGE_MEASUREMENT_NAME,
      value: ''
    }))
  };
}
