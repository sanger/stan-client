import React, { useCallback, useEffect } from 'react';
import AppShell from '../components/AppShell';
import BlueButton from '../components/buttons/BlueButton';
import { LabwareTypeName, NewFlaggedLabwareLayout } from '../types/stan';
import Warning from '../components/notifications/Warning';
import Success from '../components/notifications/Success';
import { toast } from 'react-toastify';
import { useScrollToRef } from '../lib/hooks';
import { useMachine } from '@xstate/react';
import { Maybe, SlideCosting, SlotCopyContent } from '../types/sdk';
import slotCopyMachine, { Destination } from '../lib/machines/slotCopy/slotCopyMachine';
import { Link, useNavigate } from 'react-router-dom';
import { reload } from '../lib/sdk';
import WorkNumberSelect from '../components/WorkNumberSelect';
import Heading from '../components/Heading';
import { visiumLPCytAssistFactory } from '../lib/factories/labwareFactory';
import MutedText from '../components/MutedText';
import ScanInput from '../components/scanInput/ScanInput';
import { slideCostingOptions } from '../lib/helpers';
import Label from '../components/forms/Label';
import CustomReactSelect, { OptionType } from '../components/forms/CustomReactSelect';
import { SlotCopyMode } from '../components/slotMapper/slotMapper.types';
import { Form, Formik } from 'formik';
import * as Yup from 'yup';
import LabelPrinter from '../components/LabelPrinter';
import ButtonBar from '../components/ButtonBar';
import MultipleLabwareSlotMapper from '../components/slotMapper/MultipleLabwareSlotMapper';
import { selectOptionValues } from '../components/forms';

interface OutputLabwareScanPanelProps {
  preBarcode: Maybe<string> | undefined;
  onChangeBarcode: (barcode: string) => void;
  onChangeCosting: (costing: string) => void;
  onChangeLOTNumber: (lotNumber: string, isProbe: boolean) => void;
  onChangeLpNumber: (lpNumber: string) => void;
  draftedValues: CytAssistOutputLabwareForm;
  children?: React.ReactNode;
}

export type CytAssistOutputLabwareForm = {
  preBarcode: string;
  labwareType: string;
  costing: string;
  slideLotNumber: string;
  probeLotNumber: string;
  lpNumber: string;
};

const lotNumberRegex = /^\d{6,7}$/;

const LP_NUMBERS = Array.from({ length: 20 }, (_, i) => `LP${i + 1}`);

const validationSchema = () => {
  return Yup.object().shape({
    labwareType: Yup.string().required('Required field'),
    preBarcode: Yup.string().when('labwareType', (labwareType, schema) => {
      const val = labwareType[0] as unknown as string;
      return val === LabwareTypeName.VISIUM_LP_CYTASSIST_HD
        ? Yup.string()
            .required('Required field')
            .matches(/[A-Z0-9]{2}-[A-Z0-9]{7}/, 'Invalid format for a labware type of VISIUM_LP_CYTASSIST_HD')
        : Yup.string()
            .required('Required field')
            .matches(/[A-Z]\d{2}[A-Z]\d{2}-\d{7}-\d{2}-\d{2}/, 'Invalid format for this labware type');
    }),
    lpNumber: Yup.string().oneOf(LP_NUMBERS).required('Required field'),
    costing: Yup.string().required('Required field'),
    probeLotNumber: Yup.string()
      .required('Required field')
      .matches(lotNumberRegex, 'Invalid format: Required 6-7 digit number'),
    slideLotNumber: Yup.string()
      .required('Required field')
      .matches(lotNumberRegex, 'Invalid format: Required 6-7 digit number')
  });
};

/**Component to configure the output CytAssist labware**/
const CytAssistOutputlabwareScanPanel: React.FC<OutputLabwareScanPanelProps> = ({
  onChangeBarcode,
  onChangeCosting,
  onChangeLOTNumber,
  onChangeLpNumber,
  draftedValues,
  children
}) => {
  return (
    <Formik<CytAssistOutputLabwareForm>
      initialValues={draftedValues}
      onSubmit={() => {}}
      validationSchema={validationSchema}
      validateOnChange={true}
      validateOnMount={true}
      enableReinitialize={true}
    >
      {({ errors, values }) => (
        <Form>
          <div className={'grid grid-cols-3 gap-x-4 gap-y-4 bg-gray-200 p-4'}>
            <div>
              <Label name="LP number" />
              <CustomReactSelect
                handleChange={(val) => {
                  onChangeLpNumber((val as OptionType).label);
                }}
                name="lpNumber"
                emptyOption={true}
                dataTestId="lpNumber"
                options={LP_NUMBERS.map((lp) => ({
                  label: lp,
                  value: lp
                }))}
              />
            </div>

            <div>
              <Label name={'Slide costings'} />
              <CustomReactSelect
                handleChange={(val) => {
                  onChangeCosting((val as OptionType).label);
                }}
                handleBlur={(val) => {
                  val && onChangeCosting((val as OptionType).label);
                }}
                value={draftedValues.costing}
                name={'costing'}
                emptyOption={true}
                dataTestId="output-labware-costing"
                options={selectOptionValues(slideCostingOptions, 'label', 'value')}
              />
            </div>
            <div data-testid={'lot-number'}>
              <Label name={'Slide LOT number'} />
              <ScanInput
                onScan={(val) => onChangeLOTNumber(val, false)}
                onBlur={(e) => {
                  onChangeLOTNumber(e.currentTarget.value, false);
                }}
                allowEmptyValue={true}
                name={'slideLotNumber'}
              />
              {errors.slideLotNumber && <MutedText className={'text-red-400'}>{errors.slideLotNumber}</MutedText>}
            </div>
            <div data-testid={'probe-lot-number'}>
              <Label name="Transcriptome Probe LOT number" />
              <ScanInput
                name="probeLotNumber"
                onScan={(val) => onChangeLOTNumber(val, true)}
                onBlur={(e) => {
                  onChangeLOTNumber(e.currentTarget.value, true);
                }}
              />
              {errors.probeLotNumber && <MutedText className={'text-red-400'}>{errors.probeLotNumber}</MutedText>}
            </div>
            <div data-testid="external-barcode">
              <Label name={'External barcode'} />
              <ScanInput
                onScan={(barcode) => onChangeBarcode(barcode)}
                onBlur={(e) => onChangeBarcode(e.currentTarget.value)}
                allowEmptyValue={true}
                placeholder={
                  values.labwareType === LabwareTypeName.VISIUM_LP_CYTASSIST_HD ? 'H1-9D8VN2V' : 'V42A20-3752023-10-20'
                }
                name={'preBarcode'}
              />
              {errors.preBarcode && <MutedText className={'text-red-400'}>{errors.preBarcode}</MutedText>}
            </div>
          </div>

          {children}
        </Form>
      )}
    </Formik>
  );
};

const initialOutputLabwarePlaceHolder = visiumLPCytAssistFactory.build() as NewFlaggedLabwareLayout;
initialOutputLabwarePlaceHolder.labwareType.name = '';

export const initialOutputLabware: Destination = {
  labware: initialOutputLabwarePlaceHolder,
  slotCopyDetails: {
    labwareType: '',
    contents: []
  }
};

const CytAssist = () => {
  const [current, send] = useMachine(slotCopyMachine, {
    input: {
      workNumber: '',
      operationType: 'CytAssist',
      slotCopyResults: [],
      destinations: [initialOutputLabware],
      sources: []
    }
  });

  const { serverErrors, destinations } = current.context;
  const navigate = useNavigate();

  const selectedDestination = React.useMemo(() => {
    if (destinations.length > 0) {
      return destinations[0];
    } else return undefined;
  }, [destinations]);

  /**Handler for changes in slot mappings**/
  const handleOnSlotMapperChange = useCallback(
    (labware: NewFlaggedLabwareLayout, slotCopyContent: Array<SlotCopyContent>, anySourceMapped: boolean) => {
      send({
        type: 'UPDATE_SLOT_COPY_CONTENT',
        labware,
        slotCopyContent,
        anySourceMapped
      });
    },
    [send]
  );

  const handleWorkNumberChange = useCallback(
    (workNumber: string) => {
      if (current.context.workNumber === workNumber) return;
      send({ type: 'UPDATE_WORK_NUMBER', workNumber });
      if (workNumber && current.context.destinations[0].slotCopyDetails.lpNumber) {
        send({
          type: 'RELOAD_DRAFTED_CYTASSIST',
          workNumber: workNumber,
          lpNumber: current.context.destinations[0].slotCopyDetails.lpNumber
        });
      }
    },
    [send, current.context.workNumber, current.context.destinations]
  );

  const handleChangeOutputLabwareBarcode = React.useCallback(
    (preBarcode: string) => {
      if (!selectedDestination) return;
      send({ type: 'UPDATE_DESTINATION_PRE_BARCODE', preBarcode, labware: selectedDestination.labware });
    },
    [send, selectedDestination]
  );
  const handleChangeCosting = React.useCallback(
    (costing: string) => {
      if (!selectedDestination) return;
      send({
        type: 'UPDATE_DESTINATION_COSTING',
        labware: selectedDestination.labware,
        labwareCosting: costing.length === 0 ? undefined : (costing as unknown as SlideCosting)
      });
    },
    [send, selectedDestination]
  );

  const handleChangeLOTNumber = React.useCallback(
    (lotNumber: string, isProbe: boolean) => {
      if (!selectedDestination) return;
      send({
        type: 'UPDATE_DESTINATION_LOT_NUMBER',
        labware: selectedDestination.labware,
        lotNumber: lotNumber,
        isProbe: isProbe
      });
    },
    [send, selectedDestination]
  );

  const handleChangeLpNumber = React.useCallback(
    (lpNumber: string) => {
      if (!selectedDestination) return;
      send({
        type: 'UPDATE_DESTINATION_LP_NUMBER',
        labware: selectedDestination.labware,
        lpNumber: lpNumber
      });
      if (lpNumber !== selectedDestination?.slotCopyDetails.lpNumber && current.context.workNumber.length > 0) {
        send({
          type: 'RELOAD_DRAFTED_CYTASSIST',
          workNumber: current.context.workNumber,
          lpNumber: lpNumber
        });
      }
    },
    [send, selectedDestination, current.context.workNumber]
  );

  const handleChangeLabwareType = React.useCallback(
    (destLabware: NewFlaggedLabwareLayout[]) => {
      if (!selectedDestination) return;
      const newDestLabware = destLabware && destLabware[0] ? destLabware[0] : initialOutputLabwarePlaceHolder;
      send({
        type: 'UPDATE_DESTINATION_LABWARE_TYPE',
        labwareToReplace: selectedDestination.labware!,
        labware: newDestLabware
      });
    },
    [send, selectedDestination]
  );

  /**
   * Save action invoked, so check whether a warning to be given to user if any labware with no perm done is copied
   ***/
  const onSaveAction = React.useCallback(() => {
    send({ type: 'SAVE' });
  }, [send]);

  const onSaveDraftAction = React.useCallback(() => {
    send({ type: 'SAVE_DRAFT' });
  }, [send]);

  /**
   * On "copied" or "drafted" state, show a success message
   */

  useEffect(() => {
    const ToastSuccess = () => <Success message={current.context.successMessage} />;
    if (current.context.successMessage && current.context.successMessage.length > 0) {
      toast(ToastSuccess, {
        position: toast.POSITION.TOP_RIGHT,
        autoClose: 4000,
        hideProgressBar: true
      });
    }
  }, [current.value, current.context.successMessage]);

  /**
   * When there's an error returned from the server, scroll to it
   */
  const [ref, scrollToRef] = useScrollToRef();
  useEffect(() => {
    if (serverErrors != null) {
      scrollToRef();
    }
  }, [serverErrors, scrollToRef]);
  return (
    <AppShell>
      <AppShell.Header>
        <AppShell.Title>CytAssist</AppShell.Title>
      </AppShell.Header>
      <AppShell.Main>
        <div className="mx-auto">
          {serverErrors && (
            <div ref={ref} className="mb-4">
              <Warning error={serverErrors} />
            </div>
          )}

          <div className="mb-8">
            <Heading level={3}>SGP Number</Heading>
            <p className="mt-2">Select an SGP number to associate with this operation.</p>
            <div className="my-4 md:w-1/2">
              <WorkNumberSelect onWorkNumberChange={handleWorkNumberChange} />
            </div>
          </div>

          <div className="mb-8">
            <Heading level={4}>CytAssist Slide</Heading>
            <CytAssistOutputlabwareScanPanel
              preBarcode={selectedDestination && selectedDestination.slotCopyDetails.preBarcode}
              onChangeBarcode={handleChangeOutputLabwareBarcode}
              onChangeCosting={handleChangeCosting}
              onChangeLOTNumber={handleChangeLOTNumber}
              onChangeLpNumber={handleChangeLpNumber}
              draftedValues={{
                preBarcode: selectedDestination ? selectedDestination.slotCopyDetails.preBarcode ?? '' : '',
                labwareType: selectedDestination ? selectedDestination.slotCopyDetails.labwareType ?? '' : '',
                costing: selectedDestination ? selectedDestination.slotCopyDetails.costing ?? '' : '',
                slideLotNumber: selectedDestination ? selectedDestination.slotCopyDetails.lotNumber ?? '' : '',
                probeLotNumber: selectedDestination ? selectedDestination.slotCopyDetails.probeLotNumber ?? '' : '',
                lpNumber: selectedDestination ? selectedDestination.slotCopyDetails.lpNumber ?? '' : ''
              }}
            >
              <MultipleLabwareSlotMapper
                locked={current.matches('copied')}
                slotCopyModes={[SlotCopyMode.ONE_TO_ONE, SlotCopyMode.MANY_TO_ONE]}
                onChange={handleOnSlotMapperChange}
                inputLabwareLimit={2}
                onOutputLabwareChange={handleChangeLabwareType}
              />
            </CytAssistOutputlabwareScanPanel>
          </div>
        </div>
      </AppShell.Main>

      <div className="border border-t-2 border-gray-200 w-full py-4 px-4 sm:px-6 lg:px-8 bg-gray-100 shrink-0">
        <div className="flex flex-row items-center justify-end space-x-2">
          {!current.matches('copied') && (
            <>
              <BlueButton
                disabled={
                  !current.matches('readyToCopy') ||
                  current.context.workNumber === '' ||
                  !selectedDestination ||
                  !selectedDestination.slotCopyDetails.preBarcode ||
                  !selectedDestination.slotCopyDetails.costing ||
                  !selectedDestination.slotCopyDetails.lotNumber ||
                  !selectedDestination.slotCopyDetails.probeLotNumber
                }
                onClick={onSaveAction}
              >
                Save
              </BlueButton>
              <BlueButton
                disabled={!current.context.workNumber || !selectedDestination?.slotCopyDetails.lpNumber}
                onClick={onSaveDraftAction}
              >
                Save Draft
              </BlueButton>
            </>
          )}
        </div>
        {current.matches('copied') && (
          <div className="flex flex-col items-end">
            {selectedDestination &&
              selectedDestination.slotCopyDetails.labwareType === LabwareTypeName.VISIUM_LP_CYTASSIST_HD && (
                <div className="w-1/2 py-4">
                  <LabelPrinter labwares={current.context.slotCopyResults} />
                </div>
              )}
            <ButtonBar>
              <BlueButton onClick={() => reload(navigate)} action="tertiary">
                Reset Form
              </BlueButton>
              <Link to={'/'}>
                <BlueButton action="primary">Return Home</BlueButton>
              </Link>
            </ButtonBar>
          </div>
        )}
      </div>
    </AppShell>
  );
};

export default CytAssist;
