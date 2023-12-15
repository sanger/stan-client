import React, { useState } from 'react';
import AppShell from '../components/AppShell';
import Heading from '../components/Heading';
import WorkNumberSelect from '../components/WorkNumberSelect';
import LabwareScanner, { useLabwareContext } from '../components/labwareScanner/LabwareScanner';
import LabwareScannerSlotsTable from '../components/labwareScanner/LabwareScannerSlotsTable';
import { FieldArray, Form, Formik, useFormikContext } from 'formik';
import { useMachine } from '@xstate/react';
import createFormMachine from '../lib/machines/form/formMachine';
import {
  ControlType,
  LabwareFieldsFragment,
  RecordPermMutation,
  RecordPermRequest,
  SlotFieldsFragment
} from '../types/sdk';
import Labware from '../components/labware/Labware';
import PermDataField from '../components/forms/PermDataField';
import FormikInput from '../components/forms/Input';
import BlueButton from '../components/buttons/BlueButton';
import { stanCore } from '../lib/sdk';
import * as Yup from 'yup';
import { FormikErrorMessage } from '../components/forms';
import Warning from '../components/notifications/Warning';
import OperationCompleteModal from '../components/modal/OperationCompleteModal';
import { emptySlots, isSlotEmpty, isSlotFilled } from '../lib/helpers/slotHelper';
import columns from '../components/dataTableColumns/labwareColumns';
import LabwareScanPanel from '../components/labwareScanPanel/LabwareScanPanel';
import PermPositiveControl from '../components/forms/PermPositiveControl';
import { ConfirmationModal } from '../components/modal/ConfirmationModal';
import { extractLabwareFromFlagged } from '../lib/helpers/labwareHelper';

const validationSchema = Yup.object().shape({
  workNumber: Yup.string().required().label('SGP number'),
  barcode: Yup.string().required().label('Barcode'),
  permData: Yup.array()
    .min(1)
    .of(
      Yup.object().shape({
        address: Yup.string().required().label('Address'),
        seconds: Yup.number().integer().positive().optional().label('Perm time'),
        controlType: Yup.string().optional().oneOf(Object.values(ControlType)).label('Control type'),
        controlBarcode: Yup.string().optional().label('Control barcode')
      })
    )
});

export default function VisiumPerm() {
  const formMachine = React.useMemo(() => {
    return createFormMachine<RecordPermRequest, RecordPermMutation>().withConfig({
      services: {
        submitForm: (ctx, e) => {
          if (e.type !== 'SUBMIT_FORM') return Promise.reject();
          return stanCore.RecordPerm({ request: e.values });
        }
      }
    });
  }, []);

  const [current, send] = useMachine(formMachine);
  const [warnBeforeSave, setWarnBeforeSave] = React.useState(false);
  const { serverError } = current.context;

  const onSubmit = async (values: RecordPermRequest) => {
    const isLabwareStained = await stanCore
      .GetLabwareOperations({
        barcode: values.barcode,
        operationType: 'Stain'
      })
      .then((r) => r.labwareOperations?.length);

    if (!!isLabwareStained) {
      handleSave(values);
    } else {
      setWarnBeforeSave(true);
    }
  };

  const handleSave = (values: RecordPermRequest) => {
    setWarnBeforeSave(false);

    const submitPermData = [...values.permData]
      .map((pm) => {
        if (pm.seconds) {
          // Form actually displays time as minutes, so we need to convert to seconds.
          return Object.assign({}, pm, { seconds: pm.seconds * 60 });
        } else {
          return pm;
        }
      })
      .filter((pm) => pm.seconds || pm.controlType);

    //Clone data so as to not alter the form data
    const submitValues = { ...values, permData: submitPermData };

    send({
      type: 'SUBMIT_FORM',
      values: submitValues
    });
  };

  return (
    <AppShell>
      <AppShell.Header>
        <AppShell.Title>Visium Permeabilisation</AppShell.Title>
      </AppShell.Header>
      <AppShell.Main>
        <div className="max-w-screen-xl mx-auto">
          <Formik<RecordPermRequest>
            initialValues={{ barcode: '', workNumber: '', permData: [] }}
            validationSchema={validationSchema}
            onSubmit={onSubmit}
          >
            {({ values, setFieldValue }) => (
              <Form>
                <div className="space-y-2">
                  <Heading level={2}>SGP Number</Heading>

                  <p>Select an SGP number to associate with this operation.</p>

                  <div className="mt-4 md:w-1/2">
                    <WorkNumberSelect
                      name={'workNumber'}
                      onWorkNumberChange={(workNumber) => setFieldValue('workNumber', workNumber)}
                    />
                  </div>
                </div>

                <div className="mt-8 space-y-2">
                  <Heading level={2}>Labware</Heading>

                  <p>Please scan in the slide you wish to add permeabilisation times for.</p>

                  <FieldArray name={'permData'}>
                    {({ push, remove }) => (
                      <LabwareScanner
                        onAdd={(labware) => {
                          setFieldValue('barcode', labware.barcode);
                          labware.slots.forEach((slot) =>
                            push(
                              isSlotFilled(slot)
                                ? {
                                    address: slot.address,
                                    seconds: 1
                                  }
                                : { address: slot.address }
                            )
                          );
                        }}
                        onRemove={() => {
                          setFieldValue('barcode', '');
                          values.permData.forEach((value, i) => remove(i));
                        }}
                        limit={1}
                        enableFlaggedLabwareCheck={true}
                      >
                        <LabwareScannerSlotsTable />
                        <VisiumPermForm />
                      </LabwareScanner>
                    )}
                  </FieldArray>

                  <FormikErrorMessage name={'barcode'} />
                </div>

                {serverError && <Warning message={'Failed to record perm times'} error={serverError} />}

                <div className="flex flex-row items-center justify-end">
                  <BlueButton type="submit">Submit</BlueButton>
                </div>

                <ConfirmationModal
                  show={warnBeforeSave}
                  header={'Save visium permeabilisation'}
                  message={{
                    type: 'Warning',
                    text: 'Labware has not been stained'
                  }}
                  confirmOptions={[
                    {
                      label: 'Cancel',
                      action: () => {
                        setWarnBeforeSave(false);
                      }
                    },
                    {
                      label: 'Continue',
                      action: () => {
                        handleSave(values);
                      }
                    }
                  ]}
                >
                  <p className="mt-8 my-3 text-gray-800 text-center text-sm  leading-normal">
                    If you wish to cancel this operation, click the
                    <span className="font-bold text-gray-900"> Cancel </span>
                    button.
                  </p>{' '}
                  <p className="my-3 text-gray-800 text-center text-sm  leading-normal">
                    Otherwise click <span className="font-bold text-gray-900">Continue</span> to record this operation
                  </p>
                </ConfirmationModal>
              </Form>
            )}
          </Formik>
        </div>
        <OperationCompleteModal show={current.matches('submitted')} message={'Visium Permeabilisation complete'}>
          <p>
            If you wish to start the process again, click the "Reset Form" button. Otherwise you can return to the Home
            screen.
          </p>
        </OperationCompleteModal>
      </AppShell.Main>
    </AppShell>
  );
}

function VisiumPermForm() {
  const { labwares } = useLabwareContext();
  const { values, setFieldValue } = useFormikContext<RecordPermRequest>();
  const [controlTube, setControlTube] = useState<LabwareFieldsFragment | undefined>(undefined);

  /**
   * Initialize the control tube when there is no labware scanned (Removing a labware)
   */

  React.useEffect(() => {
    if (labwares.length === 0) {
      setControlTube(undefined);
    }
  }, [labwares, setControlTube]);

  if (values.permData.length === 0 || labwares.length === 0) {
    return null;
  }

  const addressToIndexMap: Map<string, number> = new Map(
    values.permData.map((pd, index) => [pd.address, index] as const)
  );

  const onPositiveControlSelection = (name: string) => {
    /**Remove permData from  all other empty slots **/
    values.permData.forEach((permData, indx) => {
      if (
        indx !== Number(name) &&
        permData.controlType === ControlType.Positive &&
        permData.controlBarcode !== undefined
      ) {
        setFieldValue(`permData.${indx}`, {
          address: permData.address,
          controlType: undefined,
          controlBarcode: undefined
        });
      }
    });
  };

  return (
    <div data-testid={'controltubeDiv'} className={'space-y-2'}>
      <FormikInput label={''} name={'barcode'} type={'hidden'} value={labwares[0].barcode} />
      {labwares[0] && emptySlots(labwares[0].slots).length !== 0 && (
        <>
          <div className="flex flex-row" />
          <Heading level={2}>Control Tube</Heading>
          <p>Please scan in the tube you wish to assign as a control tube.</p>
          <div className="flex flex-row" />
          <LabwareScanner
            onAdd={(labware) => {
              setControlTube(extractLabwareFromFlagged([labware])[0]);
            }}
            onRemove={() => {
              setControlTube(undefined);
            }}
            limit={1}
            enableFlaggedLabwareCheck={true}
          >
            <LabwareScanPanel columns={[columns.barcode()]} />
          </LabwareScanner>
          <div className="flex flex-row" />
        </>
      )}

      <div className="flex flex-row items-center justify-around">
        <Labware
          labware={labwares[0]}
          slotBuilder={(slot: SlotFieldsFragment) => {
            if (addressToIndexMap.has(slot.address)) {
              return isSlotEmpty(slot) ? (
                <PermPositiveControl
                  name={`permData.${addressToIndexMap.get(slot.address)}`}
                  controlTube={controlTube}
                  onPositiveControlSelection={onPositiveControlSelection}
                />
              ) : (
                <PermDataField name={`permData.${addressToIndexMap.get(slot.address)}`} />
              );
            } else {
              return null;
            }
          }}
        />
      </div>
    </div>
  );
}
