import React, { useContext, useEffect, useRef, useState } from 'react';
import ScanInput from '../../components/scanInput/ScanInput';
import WhiteButton from '../../components/buttons/WhiteButton';
import { LocationParentContext } from '../Location';
import UnstoreBarcodeModal from './UnstoreBarcodeModal';
import { addressToLocationAddress } from '../../lib/helpers/locationHelper';
import classNames from 'classnames';
import BarcodeIcon from '../../components/icons/BarcodeIcon';
import { Authenticated } from '../../components/Authenticated';
import Table, { TableBody, TableCell, TableHead, TableHeader } from '../../components/Table';
import { getLabwareInLocation } from '../../lib/services/locationService';
import { LabwareFieldsFragment, SuggestedWorkFieldsFragment } from '../../types/sdk';
import { tissue } from '../../lib/helpers/labwareHelper';
import { stanCore } from '../../lib/sdk';

/**
 * Component for showing the stored items for a location in a grid
 */
export const ItemsGrid: React.FC = () => {
  const { location, locationAddresses, selectedAddress, addressToItemMap, storeBarcode, unstoreBarcode } =
    useContext(LocationParentContext)!;

  const [modalOpen, setModalOpen] = useState(false);
  const scanInputRef = useRef<HTMLInputElement>(null);
  const [labwareInLocation, setLabwareInLocation] = useState<LabwareFieldsFragment[]>([]);
  const [workNumbersForLabware, setWorkNumbersForLabware] = useState<SuggestedWorkFieldsFragment[]>([]);

  useEffect(() => {
    if (scanInputRef.current) {
      scanInputRef.current.value = '';
    }
  }, [selectedAddress]);

  const handleOnScan = (barcode: string) => {
    if (selectedAddress) {
      storeBarcode(barcode, selectedAddress);
    }
  };
  React.useEffect(() => {
    async function fetchLabwareInLocation() {
      const labware = await getLabwareInLocation(location.barcode);
      debugger;
      setLabwareInLocation(labware ?? []);
      if (labware && labware.length > 0) {
        const response = await stanCore.GetSuggestedWorkForLabware({ barcodes: labware.map((lw) => lw.barcode) });
        setWorkNumbersForLabware(response.suggestedWorkForLabware.suggestedWorks);
      }
    }
    fetchLabwareInLocation();
  }, [location]);

  const selectedLabware = React.useMemo(() => {
    debugger;
    if (!selectedAddress) return undefined;
    const barcodeInSelectedAddress = addressToItemMap.get(selectedAddress)?.barcode;
    if (!barcodeInSelectedAddress) return undefined;
    return labwareInLocation.find((lw) => lw.barcode === barcodeInSelectedAddress);
  }, [selectedAddress, labwareInLocation, addressToItemMap]);

  const workNumberForLabware = (workNumbers: SuggestedWorkFieldsFragment[], barcode: string) => {
    const workNumberForLabware = workNumbers.find((wrkLabware) => wrkLabware.barcode === barcode);
    return workNumberForLabware ? workNumberForLabware.workNumber : '';
  };
  return (
    <div>
      <Authenticated>
        <div className="sticky top-0 z-10 my-6 py-3 bg-white">
          <div className="ml-2 md:w-2/3 lg:w-1/2 ">
            {selectedAddress && (
              <span>
                Selected Address: {addressToLocationAddress(selectedAddress, location.size!, location.direction!)}
              </span>
            )}
            <ScanInput
              disabled={!selectedAddress || addressToItemMap.has(selectedAddress)}
              placeholder="Labware barcode..."
              ref={scanInputRef}
              onScan={handleOnScan}
            />
          </div>
          {selectedLabware && (
            <div className={'mt-4'}>
              <Table data-testid={'labware-table'}>
                <TableHead>
                  <tr>
                    <TableHeader>Address</TableHeader>
                    <TableHeader>Barcode</TableHeader>
                    <TableHeader>WorkNumber</TableHeader>
                    <TableHeader>External Identifier</TableHeader>
                    <TableHeader>Donor</TableHeader>
                    <TableHeader>Spatial Location</TableHeader>
                    <TableHeader>Replicate</TableHeader>
                    <TableHeader />
                  </tr>
                </TableHead>
                <TableBody>
                  <tr>
                    <TableCell>{selectedAddress}</TableCell>
                    <TableCell>{selectedLabware?.barcode}</TableCell>
                    <TableCell>
                      {selectedLabware ? workNumberForLabware(workNumbersForLabware, selectedLabware.barcode) : ''}
                    </TableCell>
                    <TableCell>{selectedLabware && tissue(selectedLabware)?.externalName}</TableCell>
                    <TableCell>{selectedLabware && tissue(selectedLabware)?.donor.donorName}</TableCell>
                    <TableCell>{selectedLabware && tissue(selectedLabware)?.spatialLocation.code}</TableCell>
                    <TableCell>{selectedLabware && tissue(selectedLabware)?.replicate}</TableCell>
                  </tr>
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </Authenticated>
      <div className="flex flex-col">
        <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
            <div className="p-2 shadow overflow-hidden border-b border-gray-200">
              <div
                className={`min-w-full grid justify-center grid-flow-row gap-2 grid-cols-location-${location.size?.numColumns}`}
              >
                {Array.from(locationAddresses.entries()).map((locationAddress) => (
                  <GridItem
                    storelightAddress={locationAddress[0]}
                    stanAddress={locationAddress[1]}
                    onButtonClick={() => setModalOpen(true)}
                    key={locationAddress[0]}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Authenticated>
        <UnstoreBarcodeModal
          isOpen={modalOpen}
          barcode={addressToItemMap.get(selectedAddress!)?.barcode}
          location={location}
          onClose={() => setModalOpen(false)}
          onConfirm={() => {
            const barcode = addressToItemMap.get(selectedAddress!)?.barcode;
            if (barcode) {
              unstoreBarcode(barcode);
            }
            setModalOpen(false);
          }}
        />
      </Authenticated>
    </div>
  );
};

export default ItemsGrid;

interface GridItemParams {
  storelightAddress: string;
  stanAddress: number;
  onButtonClick: () => void;
}

const GridItem: React.FC<GridItemParams> = ({ storelightAddress, stanAddress, onButtonClick }) => {
  const { addressToItemMap, selectedAddress, labwareBarcodeToAddressMap, setSelectedAddress } =
    useContext(LocationParentContext)!;

  const gridItemClassNames = classNames(
    {
      'border-2 border-blue-800 bg-sdb-100 hover:bg-sp-300 text-gray-300': labwareBarcodeToAddressMap.has(
        addressToItemMap.get(storelightAddress)?.barcode ?? ''
      ),
      'bg-blue-800 hover:bg-sp-300 text-gray-300':
        storelightAddress !== selectedAddress &&
        addressToItemMap.get(storelightAddress) != null &&
        !labwareBarcodeToAddressMap.has(addressToItemMap.get(storelightAddress)?.barcode ?? ''),
      'bg-blue-100 hover:bg-sp-300 text-gray-800':
        storelightAddress !== selectedAddress && addressToItemMap.get(storelightAddress) == null,
      'bg-sp-400': storelightAddress === selectedAddress
    },
    'p-2 h-24 box-border flex flex-col justify-between cursor-pointer text-md font-semibold hover:text-gray-800 hover:opacity-75'
  );

  return (
    <div
      data-testid={storelightAddress === selectedAddress ? 'selectedAddress' : null}
      onClick={() => setSelectedAddress(storelightAddress)}
      className={gridItemClassNames}
    >
      <div className="flex flex-row items-start justify-between">
        <span>{stanAddress}</span>

        <div>
          <Authenticated>
            {addressToItemMap.get(storelightAddress) != null && storelightAddress === selectedAddress && (
              <WhiteButton className="float-right" onClick={() => onButtonClick()}>
                X
              </WhiteButton>
            )}
          </Authenticated>
        </div>
      </div>

      <div className="flex flex-row items-center justify-center gap-1">
        {addressToItemMap.get(storelightAddress)?.barcode && <BarcodeIcon className="inline-block h-4" />}
        <div>{addressToItemMap.get(storelightAddress)?.barcode}</div>
      </div>
    </div>
  );
};
