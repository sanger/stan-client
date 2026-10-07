import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { LabwareFieldsFragment, LabwareFlaggedFieldsFragment, SlotFieldsFragment } from '../../types/sdk';
import { useFormikContext } from 'formik';
import {
  getBasicBgSourceSlotColor,
  getDestinationSlotColor,
  LibraryConRequestForm,
  ReagentPlateType
} from './Visium3LibraryConstruction';
import Labware, { LabwareImperativeRef } from '../../components/labware/Labware';
import Pager from '../../components/pagination/Pager';
import { usePager } from '../../lib/hooks/usePager';
import { find } from 'lodash';
import Panel from '../../components/Panel';
import RemoveButton from '../../components/buttons/RemoveButton';
import { findSlotByAddress, isSlotEmpty } from '../../lib/helpers/slotHelper';
import warningToast from '../../components/notifications/WarningToast';
import { toast } from 'react-toastify';
import Heading from '../../components/Heading';
import Table, { TableBody, TableCell, TableHead, TableHeader } from '../../components/Table';
import LabwareScanner from '../../components/labwareScanner/LabwareScanner';
import Label from '../../components/forms/Label';
import CustomReactSelect from '../../components/forms/CustomReactSelect';
import { PLATE_TYPES } from '../../components/libraryGeneration/DualIndexPlateComponent';
import MutedText from '../../components/MutedText';
import ScanInput from '../../components/scanInput/ScanInput';
import WorkNumberSelect from '../../components/WorkNumberSelect';
import { stanCore } from '../../lib/sdk';
import { labwareTypeInstances } from '../../lib/factories/labwareTypeFactory';
import { LabwareTypeName } from '../../types/stan';
import labwareFactory from '../../lib/factories/labwareFactory';

export const ReagentMultiMapper = () => {
  const { setFieldValue, values, setValues } = useFormikContext<LibraryConRequestForm>();
  const [userInputWarnings, setUserInputWarnings] = React.useState<string | undefined>(undefined);
  /**
   * Hook for tracking state for Pager component for input
   */
  const {
    currentPage: currentInputPage,
    numberOfPages: numberOfInputPages,
    setNumberOfPages: setNumberOfInputPages,
    setCurrentPage: setCurrentInputPage,
    goToLastPage: goToLastInputPage,
    ...pagerRestInput
  } = usePager({
    initialCurrentPage: 1,
    initialNumberOfPages: values.libraryConst.length
  });

  /**
   * Whenever the number of input labwares changes, set the number of pages on the pager
   */
  useEffect(() => {
    setNumberOfInputPages(values.libraryConst.length);
    goToLastInputPage();
  }, [values.libraryConst.length, setNumberOfInputPages, goToLastInputPage]);

  /**
   * Whenever the current page changes, set the current input labware and also
   * notify parent using callback function
   */
  useEffect(() => {
    if (
      values.libraryConst.length === 0 ||
      currentInputPage <= 0 ||
      values.libraryConst.length <= currentInputPage - 1
    ) {
      setFieldValue('destinationLabwareOnDisplay', undefined);
      return;
    }
    setFieldValue('destinationLabwareOnDisplay', values.libraryConst[currentInputPage - 1].labware);
  }, [currentInputPage, values.libraryConst, setFieldValue]);

  const basicBgSourceSlotColorPerPlateType = useMemo(
    () => getBasicBgSourceSlotColor(values.reagentPlateType),
    [values.reagentPlateType]
  );

  const getSourceSlotColor = useCallback(
    (address: string, slot: SlotFieldsFragment) => {
      if (
        find(
          values.libraryConst.flatMap((lc) => lc.reagentTransfers),
          {
            reagentSlotAddress: address
          }
        )
      ) {
        return `bg-${basicBgSourceSlotColorPerPlateType}-300`;
      }

      if (slot?.samples?.length > 0) {
        return `bg-${basicBgSourceSlotColorPerPlateType}-500`;
      }
    },
    [values.libraryConst, basicBgSourceSlotColorPerPlateType]
  );

  const getDestinationSlotColorCb = useCallback(
    (labware: LabwareFlaggedFieldsFragment, address: string, slot: SlotFieldsFragment) =>
      getDestinationSlotColor(values.libraryConst, basicBgSourceSlotColorPerPlateType, labware, address, slot),
    [values.libraryConst, basicBgSourceSlotColorPerPlateType]
  );

  const deselectSelectedSlots = useCallback(async () => {
    inputLabwareRef.current?.deselectAll();
    outputLabwareRef.current?.deselectAll();
    await setValues((prevValues) => ({
      ...prevValues,
      selectedDestinationAddress: undefined
    }));
  }, [setValues]);

  /**
   * Callback for sending the actual copy slots event
   */
  const handleTransferringReagent = React.useCallback(
    async (destinationAddress: string) => {
      // Don't transfer if the destination address is already mapped to a source address
      const matchedDestinations = values.libraryConst
        .find((lc) => lc.labware.barcode === values.destinationLabwareOnDisplay?.barcode)
        ?.reagentTransfers.map((rt) => rt.destinationAddress)
        .includes(destinationAddress);
      if (matchedDestinations) {
        setUserInputWarnings(
          'Destination address contains already some reagent, please select another destination address'
        );
        return;
      }

      const mappedSourceAddresses = values.libraryConst.flatMap((lc) =>
        lc.reagentTransfers.map((rt) => rt.reagentSlotAddress)
      );

      // Don't transfer if the source address is already mapped to a destination address
      const matchedSourceAddress = mappedSourceAddresses.includes(values.selectedSourceAddress!);
      if (matchedSourceAddress) {
        setUserInputWarnings(
          'Reagent from this source address has already been transferred, please select another source address'
        );

        return;
      }
      await setValues((prevValues) => ({
        ...prevValues,
        libraryConst: prevValues.libraryConst.map((lc) => {
          if (lc.labware.barcode === prevValues.destinationLabwareOnDisplay?.barcode) {
            return {
              ...lc,
              reagentTransfers: [
                ...lc.reagentTransfers,
                {
                  destinationAddress,
                  reagentPlateBarcode: prevValues.reagentPlate!.barcode,
                  reagentSlotAddress: prevValues.selectedSourceAddress!
                }
              ]
            };
          }
          return lc;
        })
      }));
    },
    [values, setValues]
  );

  const handleOnRemoveMapping = React.useCallback(
    async (destinationLabwareBarcode: string, destinationAddress: string) => {
      const matched = values.libraryConst
        .find((lc) => lc.labware.barcode === destinationLabwareBarcode)
        ?.reagentTransfers.find((rt) => rt.destinationAddress === destinationAddress);
      if (!matched) {
        setUserInputWarnings('No mapping found for the selected destination address');
        return;
      }
      await setValues((prevValues) => ({
        ...prevValues,
        libraryConst: prevValues.libraryConst.map((lc) => {
          if (lc.labware.barcode === destinationLabwareBarcode) {
            return {
              ...lc,
              reagentTransfers: lc.reagentTransfers.filter((rt) => rt.destinationAddress !== destinationAddress)
            };
          }
          return lc;
        })
      }));
    },
    [setValues, values.libraryConst]
  );

  /**
   * Callback to handle click on destination address for transferring reagents
   */
  const handleOnDestinationLabwareSlotClick = React.useCallback(
    async (destinationAddress: string) => {
      if (
        !values.selectedSourceAddress ||
        isSlotEmpty(findSlotByAddress(values.destinationLabwareOnDisplay!.slots, destinationAddress))
      ) {
        return;
      }
      await handleTransferringReagent(destinationAddress);
      await deselectSelectedSlots();
    },
    [values.destinationLabwareOnDisplay, values.selectedSourceAddress, handleTransferringReagent, deselectSelectedSlots]
  );

  const getReagentPlate = async (barcode: string): Promise<LabwareFieldsFragment> => {
    let { reagentPlate } = await stanCore.FindReagentPlate({ barcode });
    const dualIndexPlateType = labwareTypeInstances.find((lt) => lt.name === LabwareTypeName.DUAL_INDEX_PLATE)!;
    if (!reagentPlate) {
      setUserInputWarnings(`Reagent plate with barcode ${barcode} not found`);
    } else if (reagentPlate.plateType !== ReagentPlateType.DualIndexTTSetA) {
      setUserInputWarnings(
        `Reagent plate with barcode ${barcode} is not of type Dual Index TT Set A. Found ${reagentPlate.plateType} instead.`
      );
    }
    const labware = labwareFactory.build({
      barcode: reagentPlate?.barcode ?? barcode,
      labwareType: dualIndexPlateType,
      numColumns: reagentPlate?.numColumns ?? dualIndexPlateType.numColumns,
      numRows: reagentPlate?.numRows ?? dualIndexPlateType.numRows
    });

    if (reagentPlate) {
      labware.slots.forEach((slot) => {
        const reagentSlot = reagentPlate.slots.find((s) => s.address === slot.address);
        if (!reagentSlot || reagentSlot.used) {
          slot.samples = [];
        }
      });
    }

    return labware;
  };

  useEffect(() => {
    if (userInputWarnings) {
      warningToast({
        message: userInputWarnings,
        position: toast.POSITION.TOP_RIGHT,
        autoClose: 5000
      });
    }
    setUserInputWarnings(undefined);
  }, [userInputWarnings]);

  /**
   * These refs are passed into the Labware components so we can imperatively
   * change their state e.g. deselecting all slots
   */
  const inputLabwareRef = useRef<LabwareImperativeRef>(null);
  const outputLabwareRef = useRef<LabwareImperativeRef>(null);
  return (
    <div className="mt-3 space-y-8">
      <div className="grid grid-cols-2 auto-rows-auto">
        <div>
          <div className="space-y-4">
            <Heading level={4}>Dual Index Plate</Heading>
            <div className="w-1/2 mt-4 mb-4">
              <Label name="Plate Type">
                <CustomReactSelect
                  emptyOption
                  dataTestId={'source-plate-type'}
                  name="reagentPlateType"
                  options={PLATE_TYPES.map((plateType) => {
                    return {
                      label: plateType,
                      value: plateType
                    };
                  })}
                />
              </Label>
              <MutedText>Select a dual index plate type to start</MutedText>
            </div>
            <div className="w-1/2">
              <Label name="Dual Index Plate">
                <ScanInput
                  dataTestId="source-scan-input"
                  onScan={async (value) => {
                    await setFieldValue('reagentPlate', await getReagentPlate(value));
                  }}
                  disabled={values.reagentPlateType === '' || values.reagentPlate !== undefined}
                />
                <MutedText>Add source labware using the scan input above</MutedText>
              </Label>
            </div>
          </div>

          {values.reagentPlate && (
            <Panel>
              <div className="flex flex-row items-center justify-end" data-testid="reagent-plate-div">
                <RemoveButton
                  onClick={async () => {
                    await setValues((prevValues) => ({
                      ...prevValues,

                      selectedSourceAddress: undefined,
                      reagentPlate: undefined,
                      libraryConst: prevValues.libraryConst.map((lc) => ({
                        ...lc,
                        reagentTransfers: [],
                        slotMeasurements: []
                      }))
                    }));
                  }}
                />
              </div>
              <Labware
                labware={values.reagentPlate}
                selectable="non_empty"
                selectionMode="single"
                labwareRef={inputLabwareRef}
                slotColor={(address, slot) => {
                  return getSourceSlotColor(address, slot);
                }}
                name={values.reagentPlate.labwareType.name}
                onSelect={async (selectedAddresses) => {
                  await setFieldValue('selectedSourceAddress', selectedAddresses[0]); // support single selection only
                }}
              />
            </Panel>
          )}
        </div>

        <div className="ml-4">
          <Heading level={4}>Destination Labware</Heading>
          <div className="mt-4 mb-4 ml-4" data-testid="destination-labware-div">
            <span className="text-gray-800 mr-3 flex flex-row gap-x-1">Destination Labware</span>
            <LabwareScanner
              onAdd={async (labware, cleanedOutAddresses) => {
                await setValues((prevValues) => ({
                  ...prevValues,
                  destinationLabwareOnDisplay: labware,
                  libraryConst: [
                    ...prevValues.libraryConst,
                    {
                      workNumber: '',
                      labware,
                      reagentTransfers: [],
                      slotMeasurements: []
                    }
                  ]
                }));
              }}
              checkForCleanedOutAddresses
            >
              {({ cleanedOutAddresses, removeLabware }) => {
                return (
                  <>
                    <div className="w-1/2">
                      <Label name="SGP Number">
                        <WorkNumberSelect
                          disabled={!values.destinationLabwareOnDisplay}
                          workNumber={
                            values.libraryConst.find(
                              (lc) => lc.labware.barcode === values.destinationLabwareOnDisplay?.barcode
                            )?.workNumber
                          }
                          onWorkNumberChange={async (workNumber) => {
                            if (values.destinationLabwareOnDisplay) {
                              await setValues((prevValues) => ({
                                ...prevValues,
                                libraryConst: prevValues.libraryConst.map((lc) => {
                                  if (lc.labware.barcode === prevValues.destinationLabwareOnDisplay?.barcode) {
                                    return {
                                      ...lc,
                                      workNumber
                                    };
                                  }
                                  return lc;
                                })
                              }));
                            }
                          }}
                        />
                        <MutedText>Select an SGP number to associate with this labware </MutedText>
                      </Label>
                    </div>

                    {values.destinationLabwareOnDisplay && (
                      <>
                        <Panel>
                          <div className="flex flex-row items-center justify-end">
                            <RemoveButton
                              onClick={async () => {
                                await setValues((prevValues) => ({
                                  ...prevValues,
                                  libraryConst: [
                                    ...prevValues.libraryConst.filter(
                                      (lc) => lc.labware.barcode !== prevValues.destinationLabwareOnDisplay!.barcode
                                    )
                                  ]
                                }));
                                removeLabware(values.destinationLabwareOnDisplay!.barcode);
                              }}
                            />
                          </div>
                          <Labware
                            labware={values.destinationLabwareOnDisplay}
                            selectable="non_empty"
                            selectionMode="single"
                            labwareRef={outputLabwareRef}
                            name={values.destinationLabwareOnDisplay.labwareType.name}
                            onSlotClick={handleOnDestinationLabwareSlotClick}
                            slotColor={(address, slot) =>
                              getDestinationSlotColorCb(values.destinationLabwareOnDisplay!, address, slot)
                            }
                            cleanedOutAddresses={cleanedOutAddresses?.get(values.destinationLabwareOnDisplay.id) ?? []}
                          />
                        </Panel>

                        {values.libraryConst.length > 0 && (
                          <div className="border-gray-300 border-t-2 mt-5 p-4 flex flex-row items-center justify-between bg-gray-200">
                            <Pager
                              currentPage={currentInputPage}
                              numberOfPages={values.libraryConst.length}
                              {...pagerRestInput}
                            />
                          </div>
                        )}
                      </>
                    )}
                  </>
                );
              }}
            </LabwareScanner>
          </div>
        </div>
      </div>

      {values.libraryConst.flatMap((lc) => lc.reagentTransfers).length > 0 && (
        <div className="flex flex-col p-4 bg-gray-100 space-y-8">
          <Heading level={4}>Reagent Transfer Table</Heading>
          <Table data-testid="reagent-transfer-table">
            <TableHead>
              <tr>
                <TableHeader>Source - Dual index plate Slot Address</TableHeader>
                <TableHeader>Destination Plate Barcode</TableHeader>
                <TableHeader>Destination Slot Address</TableHeader>
                <TableHeader></TableHeader>
              </tr>
            </TableHead>
            <TableBody>
              {values.libraryConst.map((lc, lcIndex) =>
                lc.reagentTransfers.map((rt, rtIndex) => (
                  <tr key={`lc-${lcIndex}-rt-${rtIndex}`}>
                    <TableCell>{rt.reagentSlotAddress}</TableCell>
                    <TableCell>{lc.labware.barcode}</TableCell>
                    <TableCell>{rt.destinationAddress}</TableCell>
                    <TableCell>
                      <RemoveButton
                        data-testid={`remove-mapping-${lc.labware.barcode}-${rt.destinationAddress}`}
                        type="button"
                        onClick={() => handleOnRemoveMapping(lc.labware.barcode, rt.destinationAddress)}
                      />
                    </TableCell>
                  </tr>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};
