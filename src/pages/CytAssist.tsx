import React, { useCallback, useEffect } from 'react';
import AppShell from '../components/AppShell';
import SlotMapper from '../components/slotMapper/SlotMapper';
import BlueButton from '../components/buttons/BlueButton';
import { LabwareTypeName, NewFlaggedLabwareLayout, NewLabwareLayout } from '../types/stan';
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
import {
  visiumLPCytAssistFactory,
  visiumLPCytAssistHDFactory,
  visiumLPCytAssistXLFactory
} from '../lib/factories/labwareFactory';
import MutedText from '../components/MutedText';
import ScanInput from '../components/scanInput/ScanInput';
import { objectKeys } from '../lib/helpers';
import Label from '../components/forms/Label';
import Table, { TableBody, TableCell, TableHead, TableHeader } from '../components/Table';
import CustomReactSelect, { OptionType } from '../components/forms/CustomReactSelect';
import { SlotCopyMode } from '../components/slotMapper/slotMapper.types';
import { Form, Formik } from 'formik';
import * as Yup from 'yup';

/**
 * Success notification when slots have been copied
 */
const ToastSuccess = () => <Success message={'Slots copied'} />;

interface OutputLabwareScanPanelProps {
  preBarcode: Maybe<string> | undefined;
  labwareType: string;
  onChangeBarcode: (barcode: string) => void;
  onChangeLabwareType: (labwareType: string) => void;
  onChangeCosting: (costing: string) => void;
  onChangeLOTNumber: (lotNumber: string, isProbe: boolean) => void;
}

type CytAssistOutputLabwareForm = {
  preBarcode: string;
  labwareType: string;
  costing: string;
  slideLotNumber: string;
  probeLotNumber: string;
};

const lotNumberRegex = /^\d{6,7}$/;

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
          .matches(/[A-Z]\d{2}[A-Z]\d{2}-\d{7}-\d{2}-\d{2}/, 'Invalid format');
    }),
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
  onChangeLabwareType,
  onChangeCosting,
  onChangeLOTNumber,
  labwareType
}) => {
  const initialValues: CytAssistOutputLabwareForm = {
    preBarcode: '',
    labwareType: labwareType,
    costing: '',
    slideLotNumber: '',
    probeLotNumber: ''
  };

  return (
    <Formik<CytAssistOutputLabwareForm>
      initialValues={initialValues}
      onSubmit={() => {
      }}
      validationSchema={validationSchema}
      validateOnChange={true}
    >
      {({ setFieldValue, errors, setTouched, values }) => (
        <Form>
          <div className={'w-full grid lg:grid-cols-3 grid-cols-2 gap-x-4 gap-y-4 bg-gray-200 p-4'}>
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
            <div>
              <Label name={'Labware Type'} />
              <CustomReactSelect
                handleChange={async (val) => {
                  await setTouched({ preBarcode: true });
                  onChangeLabwareType((val as OptionType).label);
                }}
                name={'labwareType'}
                value={values.labwareType}
                emptyOption={true}
                dataTestId="output-labware-type"
                options={[
                  LabwareTypeName.VISIUM_LP_CYTASSIST,
                  LabwareTypeName.VISIUM_LP_CYTASSIST_XL,
                  LabwareTypeName.VISIUM_LP_CYTASSIST_HD
                ].map((key) => {
                  return {
                    label: key,
                    value: key
                  };
                })}
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
                name={'costing'}
                emptyOption={true}
                dataTestId="output-labware-costing"
                options={objectKeys(SlideCosting).map((key) => {
                  return {
                    label: SlideCosting[key],
                    value: SlideCosting[key]
                  };
                })}
              />
            </div>
            <div data-testid={'lot-number'}>
              <Label name={'Slide LOT number'} />
              <ScanInput
                onScan={(val) => setFieldValue('slideLotNumber', val)}
                onBlur={(e) => {
                  setFieldValue('slideLotNumber', e.currentTarget.value);
                  onChangeLOTNumber(e.currentTarget.value, false);
                }}
                allowEmptyValue={true}
                name={'slideLotNumber'}
              />
              {errors.slideLotNumber && <MutedText className={'text-red-400'}>{errors.slideLotNumber}</MutedText>}
            </div>
            <div data-testid={'probe-lot-number'}>
              <Label name={'Transcriptome Probe LOT number'} className={'whitespace-nowrap'} />
              <ScanInput
                name="probeLotNumber"
                onScan={(val) => onChangeLOTNumber(val, true)}
                onBlur={(e) => {
                  onChangeLOTNumber(e.currentTarget.value, true);
                }}
              />
              {errors.probeLotNumber && <MutedText className={'text-red-400'}>{errors.probeLotNumber}</MutedText>}
            </div>
          </div>
        </Form>
      )}
    </Formik>
  );
};

/**Table component to display all mappings made between slots in input and output labware**/
const SlotMappingContentTable = ({ slotCopyContent }: { slotCopyContent: SlotCopyContent[] }) => {
  return (
    <Table data-testid="mapped_table">
      <TableHead>
        <tr>
          <TableHeader>Source Barcode</TableHeader>
          <TableHeader>Source Address</TableHeader>
          <TableHeader>Destination Address</TableHeader>
        </tr>
      </TableHead>

      <TableBody>
        {slotCopyContent.map((slot) => (
          <tr key={`${slot.destinationAddress}-${slot.sourceBarcode}`}>
            <TableCell>{slot.sourceBarcode}</TableCell>
            <TableCell>{slot.sourceAddress}</TableCell>
            <TableCell>{slot.destinationAddress}</TableCell>
          </tr>
        ))}
      </TableBody>
    </Table>
  );
};

const CytAssist = () => {
  const initialOutputLabwarePlaceHolder = visiumLPCytAssistFactory.build() as NewFlaggedLabwareLayout;
  initialOutputLabwarePlaceHolder.labwareType.name = '';

  const initialOutputLabware: Destination = {
    labware: initialOutputLabwarePlaceHolder,
    slotCopyDetails: {
      labwareType: '',
      contents: []
    }
  };

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
      send({ type: 'UPDATE_WORK_NUMBER', workNumber });
    },
    [send]
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

  const handleChangeOutputLabwareType = React.useCallback(
    (labwareType: string) => {
      const labwareFactories: Record<string, NewLabwareLayout> = {
        [LabwareTypeName.VISIUM_LP_CYTASSIST]: visiumLPCytAssistFactory.build(),
        [LabwareTypeName.VISIUM_LP_CYTASSIST_XL]: visiumLPCytAssistXLFactory.build(),
        [LabwareTypeName.VISIUM_LP_CYTASSIST_HD]: visiumLPCytAssistHDFactory.build()
      };
      if (!selectedDestination) return;
      const destLabware = (labwareFactories[labwareType] as NewFlaggedLabwareLayout) || initialOutputLabwarePlaceHolder;
      send({
        type: 'UPDATE_DESTINATION_LABWARE_TYPE',
        labwareToReplace: selectedDestination.labware!,
        labware: destLabware
      });
    },
    [send, selectedDestination, initialOutputLabwarePlaceHolder]
  );

  /**
   * Save action invoked, so check whether a warning to be given to user if any labware with no perm done is copied
   ***/
  const onSaveAction = React.useCallback(() => {
    send({ type: 'SAVE' });
  }, [send]);

  /**
   * When we get into the "copied" state, show a success message
   */
  useEffect(() => {
    if (current.value === 'copied') {
      toast(ToastSuccess, {
        position: toast.POSITION.TOP_RIGHT,
        autoClose: 4000,
        hideProgressBar: true
      });
    }
  }, [current.value]);

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

          <SlotMapper
            locked={current.matches('copied')}
            initialOutputLabware={
              selectedDestination
                ? [
                    {
                      labware: selectedDestination.labware,
                      slotCopyContent: selectedDestination.slotCopyDetails.contents
                    }
                  ]
                : []
            }
            slotCopyModes={[SlotCopyMode.ONE_TO_ONE, SlotCopyMode.MANY_TO_ONE]}
            onChange={handleOnSlotMapperChange}
            inputLabwareLimit={2}
            displayMappedTable={false}
            failedSlotsCheck={false}
            disabledOutputSlotAddresses={
              destinations.length > 0 &&
              destinations[0].labware.labwareType.name === LabwareTypeName.VISIUM_LP_CYTASSIST
                ? ['B1', 'C1']
                : []
            }
            outputLabwareConfigPanel={
              <CytAssistOutputlabwareScanPanel
                preBarcode={selectedDestination && selectedDestination.slotCopyDetails.preBarcode}
                labwareType={selectedDestination ? selectedDestination.slotCopyDetails.labwareType ?? '' : ''}
                onChangeBarcode={handleChangeOutputLabwareBarcode}
                onChangeLabwareType={handleChangeOutputLabwareType}
                onChangeCosting={handleChangeCosting}
                onChangeLOTNumber={handleChangeLOTNumber}
              />
            }
            labwareType={selectedDestination ? selectedDestination.slotCopyDetails.labwareType ?? '' : ''}
          />

          {selectedDestination && selectedDestination.slotCopyDetails.contents.length > 0 && (
            <div className="space-y-4">
              <Heading level={4}>Mapped slots</Heading>
              <SlotMappingContentTable slotCopyContent={selectedDestination.slotCopyDetails.contents} />
            </div>
          )}
        </div>
      </AppShell.Main>

      <div className="border border-t-2 border-gray-200 w-full py-4 px-4 sm:px-6 lg:px-8 bg-gray-100 flex-shrink-0">
        <div className="flex flex-row items-center justify-end space-x-2">
          {!current.matches('copied') && (
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
          )}

          {current.matches('copied') && (
            <>
              <BlueButton onClick={() => reload(navigate)} action="tertiary">
                Reset Form
              </BlueButton>
              <Link to={'/'}>
                <BlueButton action="primary">Return Home</BlueButton>
              </Link>
            </>
          )}
        </div>
      </div>
    </AppShell>
  );
};

export default CytAssist;
