import { useFormikContext } from 'formik';
import {
  getBasicBgSourceSlotColor,
  getDestinationSlotColor,
  LibraryConRequestForm
} from './Visium3LibraryConstruction';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { stanCore } from '../../lib/sdk';
import warningToast from '../../components/notifications/WarningToast';
import { toast } from 'react-toastify';
import { maybeFindSlotByAddress } from '../../lib/helpers/slotHelper';
import DataTable from '../../components/DataTable';
import { Column, Row } from 'react-table';
import { Input } from '../../components/forms/Input';
import { LabwareFlaggedFieldsFragment, SlotFieldsFragment } from '../../types/sdk';
import Labware from '../../components/labware/Labware';
import Heading from '../../components/Heading';

/**
 * Recursively flattens a (possibly nested) Formik errors object into a flat list
 * of human readable error message strings.
 */
export const flattenErrors = (errors: unknown): string[] => {
  if (errors == null) return [];
  if (typeof errors === 'string') return [errors];
  if (Array.isArray(errors)) {
    return errors.flatMap((error) => flattenErrors(error));
  }
  if (typeof errors === 'object') {
    return Object.values(errors as Record<string, unknown>).flatMap((value) => flattenErrors(value));
  }
  return [String(errors)];
};

type CycleRecorderTableProps = {
  barcode: string;
  address: string;
  externalId: string;
  sectionNumber: string;
  cDNAConcentration: string;
  cycles: string;
};

export const CycleRecorder = () => {
  const { values, setValues, errors } = useFormikContext<LibraryConRequestForm>();

  // Keeps track of barcodes we've already queried so we don't re-fetch / re-toast on every render
  const processedBarcodes = useRef<Set<string>>(new Set());

  useEffect(() => {
    values.libraryConst.forEach((libraryConst) => {
      // Skip if cDNA concentration measurements already loaded for this labware
      if (libraryConst.reagentTransfers.length === 0) return;
      const alreadyLoaded = libraryConst.slotMeasurements.some((m) => m.name === 'cDNA concentration');
      if (alreadyLoaded) return;
      // Skip if we've already queried this barcode (avoids duplicate toasts)
      if (processedBarcodes.current.has(libraryConst.labware.barcode)) return;
      processedBarcodes.current.add(libraryConst.labware.barcode);
      stanCore
        .FindMeasurementByBarcodeAndName({
          barcode: libraryConst.labware.barcode,
          measurementName: 'cDNA concentration'
        })
        .then(async (result) => {
          if (
            result &&
            result.measurementValueFromLabwareOrParent &&
            result.measurementValueFromLabwareOrParent.length > 0
          ) {
            await setValues((prevValues) => ({
              ...prevValues,
              libraryConst: prevValues.libraryConst.map((prevLibrary) => {
                if (prevLibrary.labware.barcode === libraryConst.labware.barcode) {
                  return {
                    ...prevLibrary,
                    slotMeasurements: [
                      ...prevLibrary.slotMeasurements,
                      ...result.measurementValueFromLabwareOrParent.map((measurement) => ({
                        address: measurement.address,
                        value: measurement.string,
                        name: 'cDNA concentration'
                      }))
                    ]
                  };
                } else return prevLibrary;
              })
            }));
          } else {
            warningToast({
              message: 'No cDNA concentration measurement found for barcode: ' + libraryConst.labware.barcode,
              position: toast.POSITION.TOP_RIGHT,
              autoClose: 5000
            });
            return;
          }
        });
    });
  }, [values.libraryConst, setValues]);

  const recordCycleDataTableColumns: Array<Column<CycleRecorderTableProps>> = [
    {
      Header: 'Address',
      accessor: 'address'
    },
    {
      Header: 'External ID',
      accessor: 'externalId'
    },
    {
      Header: 'Section Number',
      accessor: 'sectionNumber'
    },
    {
      Header: 'cDNA Concentration',
      accessor: 'cDNAConcentration'
    },
    {
      Header: 'Cycles',
      Cell: ({ row }: { row: Row<CycleRecorderTableProps> }) => {
        return (
          <Input
            data-testid="cycles-input"
            type="number"
            step={1}
            value={row.original.cycles}
            onChange={async (e) => {
              await setValues((prevValues) => ({
                ...prevValues,
                libraryConst: prevValues.libraryConst.map((prevLibrary) => {
                  if (prevLibrary.labware.barcode === row.original.barcode) {
                    return {
                      ...prevLibrary,
                      slotMeasurements: prevLibrary.slotMeasurements
                        .filter(
                          (measurement) =>
                            !(measurement.name === 'cycles' && measurement.address === row.original.address)
                        )
                        .concat({
                          name: 'cycles',
                          address: row.original.address,
                          value: e.currentTarget.value
                        })
                    };
                  } else return prevLibrary;
                })
              }));
            }}
          />
        );
      }
    }
  ];

  const constructRecordCycleDataTableData = useMemo((): Map<
    LabwareFlaggedFieldsFragment,
    Array<CycleRecorderTableProps>
  > => {
    const data: Map<LabwareFlaggedFieldsFragment, Array<CycleRecorderTableProps>> = new Map();
    values.libraryConst.forEach((libraryConst) => {
      const labwareMeasurement: Array<CycleRecorderTableProps> = [];
      if (libraryConst.reagentTransfers.length === 0) return;
      libraryConst.reagentTransfers.forEach((transfer) => {
        const slot = maybeFindSlotByAddress(libraryConst.labware.slots, transfer.destinationAddress)!;
        labwareMeasurement.push({
          barcode: libraryConst.labware.barcode,
          address: transfer.destinationAddress,
          externalId: slot.samples.map((sample) => sample.tissue.externalName).join(', '),
          sectionNumber: slot.samples.map((sample) => sample.section).join(', '),
          cDNAConcentration:
            libraryConst.slotMeasurements.find(
              (measurement) =>
                measurement.address === transfer.destinationAddress && measurement.name === 'cDNA concentration'
            )?.value || '',
          cycles:
            libraryConst.slotMeasurements.find(
              (measurement) => measurement.address === transfer.destinationAddress && measurement.name === 'cycles'
            )?.value || ''
        });
      });
      data.set(libraryConst.labware, labwareMeasurement);
    });

    return data;
  }, [values.libraryConst]);

  const basicBgSourceSlotColorPerPlateType = useMemo(
    () => getBasicBgSourceSlotColor(values.reagentPlateType),
    [values.reagentPlateType]
  );
  const getDestinationSlotColorCb = useCallback(
    (labware: LabwareFlaggedFieldsFragment, address: string, slot: SlotFieldsFragment) =>
      getDestinationSlotColor(values.libraryConst, basicBgSourceSlotColorPerPlateType, labware, address, slot),
    [values.libraryConst, basicBgSourceSlotColorPerPlateType]
  );

  return (
    <div className="mt-3 space-y-8">
      <Heading level={3}>Record Cycles</Heading>
      {Array.from(constructRecordCycleDataTableData.entries()).map(([labware, labwareMeasurement], index) => (
        <div key={labware.barcode} className="border border-gray-300 rounded-lg p-4">
          <div className="grid grid-cols-2 gap-4">
            <Labware
              labware={labware}
              slotColor={(address, slot) => getDestinationSlotColorCb(labware, address, slot)}
            />
            <DataTable columns={recordCycleDataTableColumns} data={labwareMeasurement} />
          </div>
        </div>
      ))}
      {Object.keys(errors).length > 0 && (
        <div className="rounded-md bg-red-50 border border-red-200 p-4">
          <Heading level={4} className="text-red-800">
            Please fix the following errors to be able to submit the form:
          </Heading>
          <ul className="mt-2 list-disc list-inside text-sm text-red-700 space-y-1">
            {Array.from(new Set(flattenErrors(errors))).map((message, index) => (
              <li key={index}>{message}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
