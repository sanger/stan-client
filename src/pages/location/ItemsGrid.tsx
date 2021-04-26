import React, { useContext, useEffect, useRef, useState } from "react";
import ScanInput from "../../components/scanInput/ScanInput";
import WhiteButton from "../../components/buttons/WhiteButton";
import { LocationParentContext } from "../Location";
import UnstoreBarcodeModal from "./UnstoreBarcodeModal";
import { addressToLocationAddress } from "../../lib/helpers/locationHelper";
import { GridDirection } from "../../types/sdk";
import classNames from "classnames";
import BarcodeIcon from "../../components/icons/BarcodeIcon";
import { Authenticated } from "../../components/Authenticated";

/**
 * Component for showing the stored items for a location in a grid
 */
export const ItemsGrid: React.FC = () => {
  const {
    location,
    selectedAddress,
    addressToItemMap,
    storeBarcode,
    unstoreBarcode,
  } = useContext(LocationParentContext)!;

  const [modalOpen, setModalOpen] = useState(false);
  const scanInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scanInputRef.current) {
      scanInputRef.current.value = "";
    }
  }, [selectedAddress]);

  const handleOnScan = (barcode: string) => {
    if (selectedAddress) {
      storeBarcode(barcode, selectedAddress);
    }
  };

  return (
    <div>
      <Authenticated>
        <div className="sticky top-0 z-10 my-6 py-3 bg-white">
          <div className="ml-2 md:w-2/3 lg:w-1/2 ">
            {selectedAddress && (
              <span>
                Selected Address:{" "}
                {addressToLocationAddress(
                  selectedAddress,
                  location.size!,
                  location.direction!
                )}
              </span>
            )}

            <ScanInput
              disabled={addressToItemMap.get(selectedAddress!) !== null}
              placeholder="Labware barcode..."
              ref={scanInputRef}
              onScan={handleOnScan}
            />
          </div>
        </div>
      </Authenticated>
      <div className="flex flex-col">
        <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
            <div className="p-2 shadow overflow-hidden border-b border-gray-200">
              <div
                className={`min-w-full grid justify-center grid-flow-${
                  location.direction === GridDirection.RightDown ? "row" : "col"
                }
                gap-2 grid-rows-${location.size?.numRows} grid-cols-location-${
                  location.size?.numColumns
                }`}
              >
                {Array.from(addressToItemMap.keys()).map((address: string) => (
                  <GridItem
                    address={address}
                    onButtonClick={() => setModalOpen(true)}
                    key={address}
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
  address: string;
  onButtonClick: () => void;
}

const GridItem: React.FC<GridItemParams> = ({ address, onButtonClick }) => {
  const {
    addressToItemMap,
    location,
    selectedAddress,
    labwareBarcodeToAddressMap,
    setSelectedAddress,
  } = useContext(LocationParentContext)!;

  const gridItemClassNames = classNames(
    {
      "border-2 border-blue-800 bg-sdb-100 hover:bg-sp-300 text-gray-300": labwareBarcodeToAddressMap.has(
        addressToItemMap.get(address)?.barcode ?? ""
      ),
      "bg-blue-800 hover:bg-sp-300 text-gray-300":
        address !== selectedAddress &&
        addressToItemMap.get(address) != null &&
        !labwareBarcodeToAddressMap.has(
          addressToItemMap.get(address)?.barcode ?? ""
        ),
      "bg-blue-100 hover:bg-sp-300 text-gray-800":
        address !== selectedAddress && addressToItemMap.get(address) == null,
      "bg-sp-400": address === selectedAddress,
    },
    "p-2 h-24 box-border flex flex-col justify-between cursor-pointer text-md font-semibold hover:text-gray-800 hover:opacity-75"
  );

  return (
    <div
      data-testid={address === selectedAddress ? "selectedAddress" : null}
      onClick={() => setSelectedAddress(address)}
      className={gridItemClassNames}
    >
      <div className="flex flex-row items-start justify-between">
        <span>
          {addressToLocationAddress(
            address,
            location.size!,
            location.direction!
          )}
        </span>

        <div>
          <Authenticated>
            {addressToItemMap.get(address) != null &&
              address === selectedAddress && (
                <WhiteButton
                  className="float-right"
                  onClick={() => onButtonClick()}
                >
                  X
                </WhiteButton>
              )}
          </Authenticated>
        </div>
      </div>

      <div className="flex flex-row items-center justify-center gap-1">
        {addressToItemMap.get(address)?.barcode && (
          <BarcodeIcon className="inline-block h-4" />
        )}
        <div>{addressToItemMap.get(address)?.barcode}</div>
      </div>
    </div>
  );
};
