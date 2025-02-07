import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Labware, { LabwareImperativeRef } from '../labware/Labware';
import { OutputSlotCopyData, SlotCopyMode, SlotMapperProps } from './slotMapper.types';
import LabwareScanner from '../labwareScanner/LabwareScanner';
import { LabwareFlaggedFieldsFragment, SlotFieldsFragment, SlotPassFailFieldsFragment } from '../../types/sdk';
import Heading from '../Heading';
import MutedText from '../MutedText';
import { useMachine } from '@xstate/react';
import { ConfirmationModal } from '../modal/ConfirmationModal';
import Table, { TableBody, TableCell, TableHead, TableHeader } from '../Table';
import createSlotMapperMachine from './slotMapper.machine';
import RadioGroup, { RadioButtonInput } from '../forms/RadioGroup';
import { isSlotFilled } from '../../lib/helpers/slotHelper';
import { GridDirection, LabwareDirection } from '../../lib/helpers';
import RemoveButton from '../buttons/RemoveButton';
import Label from '../forms/Label';
import CustomReactSelect, { OptionType } from '../forms/CustomReactSelect';
import { LabwareTypeName } from '../../types/stan';
import { find } from 'lodash';
import WhiteButton from '../buttons/WhiteButton';
import SlotMapperTable, { SlotMapperTableProps } from './SlotMapperTable';
import Warning from '../notifications/Warning';
import { useFormikContext } from 'formik';
import { CytAssistOutputLabwareForm } from '../../pages/CytAssist';
import { flaggedLabwareLayout } from '../../lib/factories/labwareFactory';
import { eventBus } from '../../eventBus';
import { SavedDraft } from '../../lib/machines/slotCopy/slotCopyMachine';

type SelectedSlots = {
  labware: LabwareFlaggedFieldsFragment;
  addresses: string[];
};

type SelectedSlot = {
  labware: LabwareFlaggedFieldsFragment;
  address: string;
};

type SlotPassFail = Map<string, Set<SlotPassFailFieldsFragment>>; // key labware barcode, failedSlots array of failed slots

const validatePreBarcode = (preBarcode: string, labwareType: string) => {
  if (labwareType === LabwareTypeName.VISIUM_LP_CYTASSIST_HD) {
    const isValid = /^[A-Z0-9]{2}-[A-Z0-9]{7}$/.test(preBarcode);
    return {
      valid: isValid,
      errorMessage: isValid ? undefined : 'Invalid format for VISIUM LP CYTASSIST HD. Example: H1-9D8VN2V'
    };
  }
  const isValid = /^[A-Z]\d{2}[A-Z]\d{2}-\d{7}-\d{2}-\d{2}$/.test(preBarcode);
  return {
    valid: isValid,
    errorMessage: isValid ? undefined : 'Invalid format. Example: V42A20-3752023-10-20'
  };
};

/**
 * A component to map slots between multiple input labware and multiple output labware without using pagination.
 * - Input and output labware are displayed within the same view.
 * - Currently, multiple output labware is not fully developed, but the implementation can be easily extended to handle multiple output labware.
 * - Supports "One-to-One" and "Many-to-One" slot mapping, with the possibility of extending to other mapping types.
 * - In "Many-to-One" slot mapping, slots can only be mapped to the output labware if they originate from the same input labware.
 */

const MultipleLabwareSlotMapper: React.FC<SlotMapperProps> = ({
  onChange,
  locked,
  inputLabwareLimit,
  slotCopyModes,
  onOutputLabwareChange
}) => {
  const slotMapperMachine = createSlotMapperMachine;
  const [current, send] = useMachine(slotMapperMachine, {
    input: {
      inputLabware: [],
      outputSlotCopies: [],
      failedSlotsCheck: true,
      cleanedOutInputAddresses: new Map()
    }
  });

  const { inputLabware, outputSlotCopies, colorByBarcode, failedSlots, errors, cleanedOutInputAddresses } =
    current.context;

  const currentOutput = outputSlotCopies[0];
  const slotCopyContent = React.useMemo(() => {
    return outputSlotCopies[0] ? outputSlotCopies[0].slotCopyContent : [];
  }, [outputSlotCopies]);

  /**Memoise whether any source is mapped**/
  const anySourceMapped = useMemo(() => {
    if (inputLabware.length === 0) {
      return false;
    }
    if (!currentOutput) {
      return false;
    }
    return currentOutput.slotCopyContent.length > 0;
  }, [currentOutput, inputLabware]);

  useEffect(() => {
    const handler = (savedDraft: SavedDraft) => {
      send({
        type: 'SET_FROM_DRAFT',
        labware: savedDraft.sources.map((source) => source.labware),
        cleanedOutInputAddresses: new Map(
          savedDraft.sources.map((source) => {
            return [source.labware.id, source.cleanedOutAddresses ?? []];
          })
        ),
        outputSlotCopyContent: [
          {
            labware: savedDraft.destination.labware,
            slotCopyContent: savedDraft.destination.slotCopyDetails.contents,
            cleanedOutAddresses: []
          }
        ]
      });
    };

    eventBus.on('updateUiFromDraft', handler);

    // Cleanup function to remove the listener when component unmounts or updates
    return () => {
      eventBus.off('updateUiFromDraft', handler);
    };
  }, [send]);

  useEffect(() => {
    if (!currentOutput?.slotCopyContent) return;
    console.log(' === ON CHANGE  ');
    onChange?.(currentOutput.labware, currentOutput?.slotCopyContent, anySourceMapped);
  }, [onChange, currentOutput, anySourceMapped]);

  const { setFieldValue, values, setFieldError } = useFormikContext<CytAssistOutputLabwareForm>();

  const disabledOutputSlotAddresses = React.useMemo(() => {
    return currentOutput?.labware && currentOutput?.labware.labwareType.name === LabwareTypeName.VISIUM_LP_CYTASSIST
      ? ['B1', 'C1']
      : [];
  }, [currentOutput]);

  /**
   * State to track the currently selected input and output addresses
   */
  const [selectedInputAddresses, setSelectedInputAddresses] = useState<SelectedSlots>();
  const [selectedOutputAddresses, setSelectedOutputAddresses] = useState<SelectedSlot>();

  const slotsTableProps: SlotMapperTableProps | undefined = React.useMemo(() => {
    if (
      (selectedInputAddresses && selectedInputAddresses.addresses.length > 0) ||
      (selectedInputAddresses && slotCopyContent.length > 0)
    ) {
      return {
        labware: selectedInputAddresses.labware,
        slots: selectedInputAddresses.labware.slots.filter((slot) =>
          selectedInputAddresses.addresses.includes(slot.address)
        ),
        slotCopyContent
      };
    }
    if (selectedOutputAddresses && slotCopyContent.length > 0) {
      const copySlots = slotCopyContent.filter((copy) => copy.destinationAddress === selectedOutputAddresses.address);
      if (copySlots && copySlots.length > 0) {
        const labware = inputLabware.find((labware) => labware.barcode === copySlots[0].sourceBarcode);
        if (labware) {
          return {
            slots: labware.slots.filter((slot) => copySlots.map((copy) => copy.sourceAddress).includes(slot.address)),
            labware: labware,
            slotCopyContent
          };
        }
      }
    }
    return undefined;
  }, [slotCopyContent, selectedOutputAddresses, inputLabware, selectedInputAddresses]);

  /**
   * State to track the failed ones in selected input slots
   */
  const [failedSelectSlots, setFailedSelectSlots] = useState<SlotPassFail>(new Map());

  const [selectedCopyMode, setSelectedCopyMode] = useState<SlotCopyMode>(SlotCopyMode.ONE_TO_ONE);

  /**
   * These refs are passed into the Labware components so we can imperatively
   * change their state e.g. deselecting all slots
   */
  const inputLabwareRefs = useRef(new Map<number, LabwareImperativeRef>());
  const outputLabwareRefs = useRef(new Map<number, LabwareImperativeRef>());

  const deselectOutputLabware = React.useCallback(() => {
    outputLabwareRefs.current.forEach((ref) => {
      ref?.deselectAll();
    });
  }, [outputLabwareRefs]);

  /**
   * Deselects all input labware except the one at the specified index (labwareIndex).
   * If no labwareIndex is provided, all input labware will be deselected.
   */
  const deselectInputLabware = React.useCallback(
    (labwareIndex?: number) => {
      inputLabwareRefs.current.forEach((ref, index) => {
        if (index !== labwareIndex) {
          ref?.deselectAll();
        }
      });
    },
    [inputLabwareRefs]
  );

  const deselectAll = React.useCallback(() => {
    deselectOutputLabware();
    deselectInputLabware();
  }, [deselectInputLabware, deselectOutputLabware]);

  /**
   * If `locked` changes, tell the model
   */
  useEffect(() => {
    locked ? send({ type: 'LOCK' }) : send({ type: 'UNLOCK' });
  }, [locked, send]);

  /**
   * Whenever the SlotCopyContent map changes, or the current output labware changes,
   * deselect any selected output slots
   */
  useEffect(() => {
    deselectOutputLabware();
  }, [currentOutput?.slotCopyContent, deselectOutputLabware]);

  /**
   * When the current input labware changes, unset the selected input addresses
   */
  useEffect(() => {
    deselectInputLabware();
    setSelectedInputAddresses(undefined);
  }, [deselectInputLabware, inputLabware]);

  const handleChangeOutputLabwareType = React.useCallback(
    (labwareType: string) => {
      const newLabwareLayout = flaggedLabwareLayout(labwareType);
      if (!newLabwareLayout) return;
      send({
        type: 'UPDATE_OUTPUT_LABWARE',
        outputSlotCopyContent: [
          {
            labware: newLabwareLayout,
            cleanedOutAddresses: [],
            slotCopyContent: []
          }
        ]
      });
      onOutputLabwareChange?.([newLabwareLayout]);
      deselectAll();
    },
    [send, deselectAll, onOutputLabwareChange]
  );

  /**Address of all slots copied between current selected source and destination labware
   * other than currently selected one (these will displayed as disabled)
   */
  const memoInputAddressesDisabled = React.useMemo(() => {
    if (!currentOutput || !currentOutput.labware) return [];
    const outputSlotCopiesFromNotSelected = outputSlotCopies.filter(
      (osc) => osc.labware.id !== currentOutput.labware.id
    );
    const selectedLabwareBarcodes = slotCopyContent.map((copyContent) => copyContent.sourceBarcode);
    const slots = outputSlotCopiesFromNotSelected
      .flatMap((item) => item.slotCopyContent)
      .filter((scc) => selectedLabwareBarcodes.includes(scc.sourceBarcode));
    return slots.map((slot) => slot.sourceAddress);
  }, [currentOutput, outputSlotCopies, slotCopyContent]);

  const getSourceSlotColor = useCallback(
    (labware: LabwareFlaggedFieldsFragment, address: string, slot: SlotFieldsFragment) => {
      //Slots copied between current selected source and destination labware
      const slotCopy = find(slotCopyContent, {
        sourceBarcode: labware.barcode,
        sourceAddress: address
      });
      if (slotCopy) {
        return `bg-${colorByBarcode.get(labware.barcode)}-200  ${
          selectedInputAddresses?.labware.barcode === slotCopy.sourceBarcode &&
          selectedInputAddresses?.addresses.includes(address)
            ? 'ring ring-blue ring-offset-2'
            : ''
        }`;
      }
      //This input slot address has got mapping to a different output labware
      if (memoInputAddressesDisabled.includes(address)) {
        return `bg-gray-300 ring-0 ring-offset-0 text-white border-0 border-gray-300`;
      }
      if (slot?.samples?.length) {
        return `bg-${colorByBarcode.get(labware.barcode)}-500`;
      }
    },
    [colorByBarcode, memoInputAddressesDisabled, selectedInputAddresses, slotCopyContent]
  );

  const getDestinationSlotColor = useCallback(
    (outputSlotCopyData: OutputSlotCopyData, address: string) => {
      if (!outputSlotCopyData.labware) return '';
      if (currentOutput?.labware.barcode) {
        const slot = currentOutput.labware.slots.find((s) => s.address === address);
        if (slot && isSlotFilled(slot)) {
          return 'bg-gray-300 ring-0 ring-offset-0 text-gray-300 border-0 border-gray-300';
        }
      }
      //Is this slot specified as disabled in props given?
      if (disabledOutputSlotAddresses?.includes(address)) {
        return 'bg-gray-300 ring-0 ring-offset-0 text-gray-300 border-0 border-gray-300';
      }
      const scc = find(outputSlotCopyData.slotCopyContent, {
        destinationAddress: address
      });

      if (scc) {
        if (
          selectedInputAddresses &&
          selectedInputAddresses.labware.barcode === scc.sourceBarcode &&
          selectedInputAddresses.addresses.includes(scc.sourceAddress)
        ) {
          return `bg-${colorByBarcode.get(scc.sourceBarcode)}-500 ring ring-blue-600 ring-offset-2`;
        }
        return `bg-${colorByBarcode.get(scc.sourceBarcode)}-500`;
      }
    },
    [colorByBarcode, disabledOutputSlotAddresses, selectedInputAddresses, currentOutput]
  );

  /**
   * Callback for sending the actual copy slots event
   */
  const handleCopySlots = React.useCallback(
    (givenDestinationAddress?: string) => {
      setFailedSelectSlots(new Map());
      const address = givenDestinationAddress ?? (currentOutput && selectedOutputAddresses?.address);
      if (address && selectedInputAddresses) {
        send({
          type: 'COPY_ONE_TO_ONE_SLOTS',
          inputLabwareId: selectedInputAddresses.labware.id,
          inputAddresses: selectedInputAddresses.addresses,
          outputLabwareId: currentOutput.labware?.id,
          outputAddress: address
        });
        setSelectedInputAddresses(undefined);
        setSelectedOutputAddresses(undefined);
        deselectAll();
      }
    },
    [currentOutput, send, selectedInputAddresses, selectedOutputAddresses, deselectAll]
  );

  /**
   * Handle one to one copy action
   */
  const handleOneToOneCopy = React.useCallback(
    (outputAddress: string) => {
      if (!selectedInputAddresses || disabledOutputSlotAddresses?.includes(outputAddress)) return;
      //Check whether it is a scanned labware, if so allow copting to empty slots
      if (currentOutput?.labware?.barcode) {
        const slot = currentOutput?.labware?.slots.find((slot) => slot.address === outputAddress);
        if (slot && isSlotFilled(slot)) {
          return;
        }
      }
      //Check whether any selected input slots are failed in QC
      let failedSelectedSlots: SlotPassFail = new Map();
      const slotFails = failedSlots.get(selectedInputAddresses.labware.barcode);
      if (slotFails) {
        const failed = new Set(slotFails.filter((slot) => selectedInputAddresses.addresses.includes(slot.address)));
        if (failed.size > 0)
          failedSelectedSlots.set(
            selectedInputAddresses.labware.barcode,
            new Set([...(failedSelectedSlots.get(selectedInputAddresses.labware.barcode) || []), ...failed])
          );
      }

      if (failedSelectedSlots.size > 0) {
        setFailedSelectSlots(failedSelectedSlots);
        return;
      }
      handleCopySlots(outputAddress);
    },
    [handleCopySlots, failedSlots, disabledOutputSlotAddresses, currentOutput?.labware, selectedInputAddresses]
  );

  const handleManyToOneCopy = React.useCallback(
    (outputAddress: string) => {
      if (disabledOutputSlotAddresses?.includes(outputAddress)) return;
      setFailedSelectSlots(new Map());
      const address = outputAddress ?? selectedOutputAddresses?.address;

      if (currentOutput?.labware?.id && address && selectedInputAddresses) {
        send({
          type: 'COPY_MANY_TO_ONE_SLOTS',
          inputLabwareId: selectedInputAddresses.labware?.id,
          inputAddresses: selectedInputAddresses.addresses,
          outputLabwareId: currentOutput?.labware?.id,
          outputAddress: address
        });
        deselectAll();
        setSelectedInputAddresses(undefined);
        setSelectedOutputAddresses(undefined);
      }
      return;
    },
    [selectedOutputAddresses, send, currentOutput, disabledOutputSlotAddresses, selectedInputAddresses, deselectAll]
  );

  /**
   * Callback to handle click on destination address for transferring slots
   */
  const handleOnOutputLabwareSlotClick = React.useCallback(
    (outputAddress: string) => {
      switch (selectedCopyMode) {
        case SlotCopyMode.ONE_TO_ONE:
          handleOneToOneCopy(outputAddress);
          break;
        case SlotCopyMode.MANY_TO_ONE:
          handleManyToOneCopy(outputAddress);
          break;
      }
    },
    [handleOneToOneCopy, handleManyToOneCopy, selectedCopyMode]
  );

  /**
   * Callback to handle click on source address for transferring slots
   */
  const handleOnInputLabwareSlotClick = React.useCallback(
    (labwareIndex: number, labware: LabwareFlaggedFieldsFragment, inputAddress: string[]) => {
      deselectOutputLabware();
      deselectInputLabware(labwareIndex);
      setSelectedInputAddresses({
        labware: labware,
        addresses: inputAddress.filter((address) => !memoInputAddressesDisabled.includes(address))
      });
    },
    [setSelectedInputAddresses, memoInputAddressesDisabled, deselectOutputLabware, deselectInputLabware]
  );

  /**
   * Handler for the "Clear" button to clear the mapping in selected slot
   */
  const handleOnClickClear = React.useCallback(() => {
    if (currentOutput?.labware?.id) {
      deselectAll();
      send({
        type: 'CLEAR_SLOTS',
        outputLabwareId: currentOutput?.labware?.id,
        outputAddresses: selectedOutputAddresses ? [selectedOutputAddresses.address] : []
      });
      deselectOutputLabware();
    }
  }, [send, currentOutput, selectedOutputAddresses, deselectOutputLabware, deselectAll]);

  /**
   * Handler for the "Clear all" button to clear all mappings between selected source and selected destination
   */
  const handleOnClickClearAll = React.useCallback(() => {
    if (currentOutput?.labware?.id) {
      outputSlotCopies
        .find((output) => output.labware.id === currentOutput?.labware?.id)
        ?.slotCopyContent.forEach((slotCopy) => {
          send({
            type: 'CLEAR_ALL_SLOT_MAPPINGS_BETWEEN',
            outputLabwareId: currentOutput?.labware?.id,
            inputLabwareBarcode: slotCopy.sourceBarcode
          });
        });
      deselectAll();
    }
  }, [send, currentOutput, deselectAll, outputSlotCopies]);

  /**
   * Callback whenever the input labware is added or removed by the labware scanner
   */
  const onLabwareScannerChange = React.useCallback(
    (labware: LabwareFlaggedFieldsFragment[], cleanedOutAddresses?: Map<number, string[]>) => {
      send({ type: 'UPDATE_INPUT_LABWARE', labware, cleanedOutAddresses });
    },
    [send]
  );

  /**
   * Callback when the copy mode changes
   */
  const handleCopyModeChange = React.useCallback(
    (mode: SlotCopyMode) => {
      setSelectedCopyMode(mode);
    },
    [setSelectedCopyMode]
  );

  return (
    <div className="space-y-8 mt-10">
      <div className="grid grid-cols-2 auto-rows-auto">
        <Heading level={4}>Input Labware</Heading>
        <Heading level={4}>Output Labware</Heading>
        {slotCopyModes && slotCopyModes.length > 1 && (
          <>
            <div>
              <RadioGroup label="Select transfer mode" name={'sectionNumber'} withFormik={false}>
                {slotCopyModes.map((mode) => (
                  <RadioButtonInput
                    key={mode}
                    data-testid={`copyMode-${mode}`}
                    name={'copyMode'}
                    value={mode}
                    checked={selectedCopyMode === mode}
                    onChange={() => handleCopyModeChange(mode)}
                    label={mode}
                  />
                ))}
              </RadioGroup>
            </div>
            <div className={'flex flex-row w-full my-2 '}>
              <div className={'flex flex-col my-2 text-gray-700 lg:text-xs italic'}>
                <p>For selection of multiple slots :</p>
                <p>Hold 'Shift' key to select consecutive items</p>
                <p>Hold 'Ctrl' (Cmd for Mac) key to select non-consecutive items</p>
              </div>
            </div>
          </>
        )}

        <div id="inputLabwares" className="bg-gray-100 p-4">
          <LabwareScanner
            onChange={onLabwareScannerChange}
            limit={inputLabwareLimit}
            enableFlaggedLabwareCheck
            checkForCleanedOutAddresses
            initialLabwares={inputLabware}
          >
            {({ removeLabware, cleanedOutAddresses }) => {
              if (inputLabware.length === 0) {
                return <MutedText>Add labware using the scan input above</MutedText>;
              }
              return (
                <div className={`grid grid-cols-${inputLabware.length}`} data-testid="input-labware-div">
                  {inputLabware.map((labware, index) => (
                    <div key={labware.barcode} className="flex flex-row" data-testid={labware.barcode}>
                      <Labware
                        labware={labware}
                        selectable={'non_empty'}
                        selectionMode={selectedCopyMode !== SlotCopyMode.ONE_TO_MANY ? 'multi' : 'single'}
                        labwareRefCallback={(el: LabwareImperativeRef) => {
                          if (el) {
                            inputLabwareRefs.current.set(index, el);
                          } else {
                            inputLabwareRefs.current.delete(index);
                          }
                        }}
                        slotColor={(address, slot) => {
                          return getSourceSlotColor(labware, address, slot);
                        }}
                        name={labware.labwareType.name}
                        onSelect={(selected) => handleOnInputLabwareSlotClick(index, labware, selected)}
                        cleanedOutAddresses={
                          current.context.cleanedOutInputAddresses?.get(labware.id) ??
                          cleanedOutAddresses?.get(labware.id)
                        }
                      />
                      <div>
                        <RemoveButton
                          onClick={() => {
                            removeLabware(labware.barcode);
                            send({
                              type: 'UPDATE_INPUT_LABWARE',
                              labware: inputLabware.filter((lw) => lw.barcode !== labware.barcode),
                              cleanedOutAddresses: new Map(
                                Array.from(cleanedOutInputAddresses || []).filter(([key]) => key !== labware.id)
                              )
                            });
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              );
            }}
          </LabwareScanner>
        </div>
        <div id="outputLabwares" data-testid="outputLabwares" className="flex flex-col bg-gray-100 border-l-2">
          <div>
            <div className="grid grid-cols-3 mb-10 m-4">
              <Label name={'Labware Type'} />
              <CustomReactSelect
                name="labwareType"
                handleChange={async (val) => {
                  const selectedType = (val as OptionType).value;
                  handleChangeOutputLabwareType(selectedType);
                  await setFieldValue('labwareType', selectedType, true);
                  if (values.preBarcode) {
                    const isValid = validatePreBarcode(values.preBarcode, selectedType);
                    if (!isValid.valid) setFieldError('preBarcode', isValid.errorMessage);
                  }
                }}
                value={values.labwareType}
                className="col-span-2"
                emptyOption={true}
                dataTestId="output-labware-type"
                options={[
                  LabwareTypeName.VISIUM_LP_CYTASSIST,
                  LabwareTypeName.VISIUM_LP_CYTASSIST_XL,
                  LabwareTypeName.VISIUM_LP_CYTASSIST_HD,
                  LabwareTypeName.STRIP_TUBE
                ].map((key) => {
                  return {
                    label: key,
                    value: key
                  };
                })}
              />
            </div>
          </div>
          <div className={'flex items-center justify-center'} data-testid="cytassist-labware">
            {outputSlotCopies.length > 0 &&
              outputSlotCopies.map((output, index) => (
                <div className="flex flex-2  space-y-2" key={index}>
                  {output.labware && output.labware.labwareType.name && (
                    <Labware
                      labware={output.labware}
                      selectable="any"
                      selectionMode="multi"
                      labwareRefCallback={(el: LabwareImperativeRef) => {
                        if (el) {
                          outputLabwareRefs.current.set(index, el);
                        } else {
                          outputLabwareRefs.current.delete(index);
                        }
                      }}
                      name={output.labware.labwareType.name}
                      onSlotClick={handleOnOutputLabwareSlotClick}
                      onSelect={(selected) =>
                        setSelectedOutputAddresses({
                          labware: output.labware as LabwareFlaggedFieldsFragment,
                          address: selected[0]
                        })
                      }
                      slotColor={(address) => getDestinationSlotColor(output, address)}
                      cleanedOutAddresses={output.cleanedOutAddresses}
                      gridDirection={GridDirection.LeftUp}
                      labwareDirection={LabwareDirection.Horizontal}
                    />
                  )}
                </div>
              ))}
          </div>
        </div>
      </div>

      {!locked && (
        <div className="border-gray-300 border-t-2 p-4 flex flex-row  bg-gray-200 justify-end space-x-4">
          <WhiteButton onClick={handleOnClickClear}>Clear</WhiteButton>
          <WhiteButton data-testid={'clearAll'} onClick={handleOnClickClearAll}>
            Clear all
          </WhiteButton>
        </div>
      )}
      {slotsTableProps && (
        <div className="space-y-4" data-testid={'mapping-div'}>
          <Heading level={4}>Slot(s) Table</Heading>
          <SlotMapperTable
            labware={slotsTableProps.labware}
            slots={slotsTableProps.slots}
            slotCopyContent={slotsTableProps.slotCopyContent}
          />
        </div>
      )}
      <ConfirmationModal
        show={failedSelectSlots.size > 0}
        header={'Slot transfer'}
        message={{ type: 'Warning', text: 'Failed slot(s)' }}
        confirmOptions={[
          {
            label: 'Cancel',
            action: () => {
              setFailedSelectSlots(new Map());
            }
          },
          { label: 'Continue', action: () => handleCopySlots() }
        ]}
      >
        <p className={'font-bold mt-8'}>{`Following slot(s) failed in slide processing : `}</p>
        <Table className={'mt-4 w-full'}>
          <TableHead>
            <tr>
              <TableHeader>Barcode</TableHeader>
              <TableHeader>Address</TableHeader>
              <TableHeader>Comment</TableHeader>
            </tr>
          </TableHead>
          <TableBody>
            {Array.from(failedSelectSlots.keys()).map((barcode) =>
              Array.from(failedSelectSlots.get(barcode) || []).map((slot, index) => (
                <tr key={`${barcode}-${index}`}>
                  <TableCell>{barcode}</TableCell>
                  <TableCell>{slot.address}</TableCell>
                  <TableCell>{slot.comment}</TableCell>
                </tr>
              ))
            )}
          </TableBody>
        </Table>

        <p className={'mt-6 font-bold'}>Do you wish to continue or cancel?</p>
      </ConfirmationModal>

      <div className={'flex flex-col w-full'}>
        {errors.size > 0 && (
          <Warning message={`There is an error while fetching pass/fail status for the slots in ${errors.keys()}.`} />
        )}
      </div>
    </div>
  );
};

export default MultipleLabwareSlotMapper;
