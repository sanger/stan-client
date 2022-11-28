import React, { useCallback, useEffect } from 'react';
import AppShell from '../components/AppShell';
import SlotMapper from '../components/slotMapper/SlotMapper';
import BlueButton from '../components/buttons/BlueButton';
import { LabwareTypeName, NewLabwareLayout } from '../types/stan';
import Warning from '../components/notifications/Warning';
import Success from '../components/notifications/Success';
import { toast } from 'react-toastify';
import { useScrollToRef } from '../lib/hooks';
import { useMachine } from '@xstate/react';
import { Maybe, SlideCosting, SlotCopyContent } from '../types/sdk';
import slotCopyMachine from '../lib/machines/slotCopy/slotCopyMachine';
import { Link } from 'react-router-dom';
import { reload } from '../lib/sdk';
import WorkNumberSelect from '../components/WorkNumberSelect';
import Heading from '../components/Heading';
import { visiumLPCytAssistFactory, visiumLPCytAssistXLFactory } from '../lib/factories/labwareFactory';
import MutedText from '../components/MutedText';
import ScanInput from '../components/scanInput/ScanInput';
import { Select } from '../components/forms/Select';
import { objectKeys } from '../lib/helpers';
import Label from '../components/forms/Label';
import Table, { TableBody, TableCell, TableHead, TableHeader } from '../components/Table';

/**
 * Success notification when slots have been copied
 */
const ToastSuccess = () => <Success message={'Slots copied'} />;

interface OutputLabwareScanPanelProps {
  preBarcode: Maybe<string> | undefined;
  onChangeBarcode: (barcode: string) => void;
  onChangeLabwareType: (labwareType: string) => void;
  onChangeCosting: (costing: string) => void;
}

/**Component to configure the output CytAssist labware**/
const CytAssistOutputlabwareScanPanel: React.FC<OutputLabwareScanPanelProps> = ({
  preBarcode,
  onChangeBarcode,
  onChangeLabwareType,
  onChangeCosting
}) => {
  /**State to store preBarcode validation errors**/
  const [preBarcodeValidationError, setPreBarcodeValidationError] = React.useState('');
  return (
    <div className={'w-full flex flex-row space-x-6'}>
      <div data-testid="external-barcode">
        <Label name={'External barcode'} />
        <ScanInput
          onScan={(value) => {
            if (value.length === 0) {
              setPreBarcodeValidationError('Required field');
              onChangeBarcode('');
            } else {
              const valid = /[A-Z]\d{2}[A-Z]\d{2}-\d{7}-\d{2}-\d{2}/.test(value);
              if (!valid) {
                setPreBarcodeValidationError('Invalid format');
                onChangeBarcode('');
              } else {
                setPreBarcodeValidationError('');
                onChangeBarcode(value);
              }
            }
          }}
          allowEmptyValue={true}
          placeholder={'e.g V42A20-3752023-10-20'}
        />
        {preBarcodeValidationError.length > 0 ? (
          <MutedText className={'text-red-400'}>{preBarcodeValidationError}</MutedText>
        ) : !preBarcode?.length ? (
          <MutedText>Input barcode and press 'Enter' key</MutedText>
        ) : (
          ''
        )}
      </div>
      <div>
        <Label name={'Labware Type'} />
        <Select
          onChange={(e) => {
            onChangeLabwareType(e.currentTarget.value);
          }}
          emptyOption={false}
          data-testid="output-labware-type"
        >
          {objectKeys(LabwareTypeName)
            .filter(
              (key) =>
                LabwareTypeName[key] === LabwareTypeName.VISIUM_LP_CYTASSIST ||
                LabwareTypeName[key] === LabwareTypeName.VISIUM_LP_CYTASSIST_XL
            )
            .map((key) => (
              <option key={key} value={LabwareTypeName[key]}>
                {LabwareTypeName[key]}
              </option>
            ))}
        </Select>
      </div>
      <div>
        <Label name={'Slide costings'} />
        <Select
          onChange={(e) => {
            onChangeCosting(e.currentTarget.value);
          }}
          emptyOption={true}
          data-testid="output-labware-costing"
        >
          {objectKeys(SlideCosting).map((key) => (
            <option key={key} value={SlideCosting[key]}>
              {SlideCosting[key]}
            </option>
          ))}
        </Select>
      </div>
      <div>
        <ScanInput onScan={(value) => {}} />
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
          <tr key={`${slot.sourceAddress}-${slot.sourceBarcode}`}>
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
  const initialOutputLabware = {
    labware: visiumLPCytAssistFactory.build(),
    slotCopyDetails: { labwareType: LabwareTypeName.VISIUM_LP_CYTASSIST, contents: [] }
  };

  const [current, send] = useMachine(() =>
    slotCopyMachine.withContext({
      workNumber: '',
      operationType: 'CytAssist',
      slotCopyResults: [],
      destinations: [initialOutputLabware],
      sources: []
    })
  );

  const { serverErrors, destinations } = current.context;

  const selectedDestination = React.useMemo(() => {
    if (destinations.length > 0) {
      return destinations[0];
    } else return undefined;
  }, [destinations]);

  /**Handler for changes in slot mappings**/
  const handleOnSlotMapperChange = useCallback(
    (labware: NewLabwareLayout, slotCopyContent: Array<SlotCopyContent>, anySourceMapped: boolean) => {
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

  const handleChangeOutputLabwareType = React.useCallback(
    (labwareType: string) => {
      if (!selectedDestination) return;
      let destLabware;
      if (labwareType === LabwareTypeName.VISIUM_LP_CYTASSIST) destLabware = visiumLPCytAssistFactory.build();
      else destLabware = visiumLPCytAssistXLFactory.build();
      send({
        type: 'UPDATE_DESTINATION_LABWARE_TYPE',
        labwareToReplace: selectedDestination.labware!,
        labware: destLabware
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
            onChange={handleOnSlotMapperChange}
            inputLabwareLimit={2}
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
                onChangeBarcode={handleChangeOutputLabwareBarcode}
                onChangeLabwareType={handleChangeOutputLabwareType}
                onChangeCosting={handleChangeCosting}
              />
            }
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
                !selectedDestination.slotCopyDetails.costing
              }
              onClick={onSaveAction}
            >
              Save
            </BlueButton>
          )}

          {current.matches('copied') && (
            <>
              <BlueButton onClick={reload} action="tertiary">
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
