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
import { visiumLPCytAssistFactory, visiumLPCytAssistXLFactory } from '../lib/factories/labwareFactory';
import MutedText from '../components/MutedText';
import ScanInput from '../components/scanInput/ScanInput';
import { objectKeys } from '../lib/helpers';
import Label from '../components/forms/Label';
import Table, { TableBody, TableCell, TableHead, TableHeader } from '../components/Table';
import CustomReactSelect, { OptionType } from '../components/forms/CustomReactSelect';
import { SlotCopyMode } from '../components/slotMapper/slotMapper.types';

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

/**Component to configure the output CytAssist labware**/
const CytAssistOutputlabwareScanPanel: React.FC<OutputLabwareScanPanelProps> = ({
  onChangeBarcode,
  onChangeLabwareType,
  onChangeCosting,
  onChangeLOTNumber,
  labwareType
}) => {
  /**State to store preBarcode validation errors**/
  const [preBarcodeValidationError, setPreBarcodeValidationError] = React.useState('');
  const [slideLOTNumberValidationError, setSlideLOTNumberValidationError] = React.useState('');
  const [costingValidationError, setCostingValidationError] = React.useState('');
  const [probLOTNumberValidationError, setProbeLOTNumberValidationError] = React.useState('');

  const validatePreBarcode = React.useCallback(
    (preBarcode: string) => {
      let error;
      if (preBarcode.length === 0) {
        error = 'Required field';
      } else {
        const valid = /[A-Z]\d{2}[A-Z]\d{2}-\d{7}-\d{2}-\d{2}/.test(preBarcode);
        if (!valid) {
          error = 'Invalid format';
        } else {
          error = '';
        }
      }
      setPreBarcodeValidationError(error);
      onChangeBarcode(preBarcode);
    },
    [setPreBarcodeValidationError, onChangeBarcode]
  );
  const validateLotNumber = React.useCallback(
    (slideLotNumber: string, isProbe: boolean) => {
      let error;
      if (slideLotNumber.length === 0) {
        error = 'Required field';
      } else {
        const valid = /^\d{6,7}$/.test(slideLotNumber);
        if (!valid) {
          error = 'Invalid format: Required 6-7 digit number';
        } else {
          error = '';
        }
      }
      if (isProbe) {
        setProbeLOTNumberValidationError(error);
      } else {
        setSlideLOTNumberValidationError(error);
      }
      onChangeLOTNumber(slideLotNumber, isProbe);
    },
    [setSlideLOTNumberValidationError, onChangeLOTNumber]
  );

  const validateCosting = React.useCallback(
    (costing: string) => {
      let error = '';
      if (costing.length === 0) {
        error = 'Required field';
      }
      setCostingValidationError(error);
      onChangeCosting(costing);
    },
    [setCostingValidationError, onChangeCosting]
  );
  return (
    <div className={'w-full grid grid-cols-3 gap-x-4 gap-y-4 bg-gray-200 p-4'}>
      <div data-testid="external-barcode">
        <Label name={'External barcode'} />
        <ScanInput
          onScan={validatePreBarcode}
          onBlur={(e) => validatePreBarcode(e.currentTarget.value)}
          allowEmptyValue={true}
          placeholder={'e.g V42A20-3752023-10-20'}
        />
        {preBarcodeValidationError && <MutedText className={'text-red-400'}>{preBarcodeValidationError}</MutedText>}
      </div>
      <div>
        <Label name={'Labware Type'} />
        <CustomReactSelect
          handleChange={(val) => {
            onChangeLabwareType((val as OptionType).label);
          }}
          value={labwareType}
          emptyOption={true}
          dataTestId="output-labware-type"
          options={[LabwareTypeName.VISIUM_LP_CYTASSIST, LabwareTypeName.VISIUM_LP_CYTASSIST_XL].map((key) => {
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
            validateCosting((val as OptionType).label);
          }}
          handleBlur={(val) => {
            val && validateCosting((val as OptionType).label);
          }}
          emptyOption={true}
          dataTestId="output-labware-costing"
          options={objectKeys(SlideCosting).map((key) => {
            return {
              label: SlideCosting[key],
              value: SlideCosting[key]
            };
          })}
        />
        {costingValidationError && <MutedText className={'text-red-400'}>{costingValidationError}</MutedText>}
      </div>
      <div data-testid={'lot-number'}>
        <Label name={'Slide LOT number'} />
        <ScanInput
          onScan={(val) => validateLotNumber(val, false)}
          onBlur={(e) => {
            validateLotNumber(e.currentTarget.value, false);
          }}
          allowEmptyValue={true}
        />
        {slideLOTNumberValidationError && (
          <MutedText className={'text-red-400'}>{slideLOTNumberValidationError}</MutedText>
        )}
      </div>
      <div data-testid={'probe-lot-number'}>
        <Label name={'Transcriptome Probe LOT number'} className={'whitespace-nowrap'} />
        <ScanInput
          onScan={(val) => validateLotNumber(val, true)}
          onBlur={(e) => {
            validateLotNumber(e.currentTarget.value, true);
          }}
        />
        {probLOTNumberValidationError && (
          <MutedText className={'text-red-400'}>{probLOTNumberValidationError}</MutedText>
        )}
      </div>
    </div>
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
        [LabwareTypeName.VISIUM_LP_CYTASSIST_XL]: visiumLPCytAssistXLFactory.build()
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
