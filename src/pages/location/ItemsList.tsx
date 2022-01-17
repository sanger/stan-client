import React, { useContext, useRef, useState } from "react";
import ScanInput from "../../components/scanInput/ScanInput";
import Table, {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
} from "../../components/Table";
import RemoveButton from "../../components/buttons/RemoveButton";
import { LocationParentContext } from "../Location";
import UnstoreBarcodeModal from "./UnstoreBarcodeModal";
import { Maybe } from "../../types/sdk";
import { StoredItemFragment } from "../../lib/machines/locations/locationMachineTypes";
import MutedText from "../../components/MutedText";
import { addressToLocationAddress } from "../../lib/helpers/locationHelper";
import { Authenticated } from "../../components/Authenticated";

interface ItemsListParams {
  freeformAddress?: boolean;
}

/**
 * Component for showing the stored items in a location as a list
 */
export const ItemsList: React.FC<ItemsListParams> = () => {
  const { location, storeBarcode, unstoreBarcode } = useContext(
    LocationParentContext
  )!;

  const [selectedItem, setSelectedItem] = useState<Maybe<StoredItemFragment>>(
    null
  );

  const scanInputRef = useRef<HTMLInputElement>(null);

  const handleOnScan = (barcode: string) => {
    storeBarcode(barcode);
    if (scanInputRef.current) {
      scanInputRef.current.value = "";
    }
  };

  return (
    <div>
      <Authenticated>
        <MutedText>
          To store an item, first select the destination address (if required),
          then scan the piece of labware.
        </MutedText>

        <div className="my-6 space-y-2 md:space-y-0 md:flex md:flex-row items-center justify-start md:gap-4">
          <div className="md:w-1/2">
            <ScanInput
              ref={scanInputRef}
              placeholder="Labware barcode..."
              onScan={handleOnScan}
            />
          </div>
        </div>
      </Authenticated>

      <Table>
        <TableHead>
          <tr>
            <TableHeader>Address</TableHeader>
            <TableHeader>Barcode</TableHeader>
            <TableHeader />
          </tr>
        </TableHead>
        <TableBody>
          {location.stored.length === 0 && (
            <tr>
              <td colSpan={3}>
                <div className="my-3 flex flex-col items-center justify-center">
                  <MutedText>Location is empty</MutedText>
                  <p className="my-2 text-gray-900 text-sm">
                    Scan a labware barcode in to the input above to add it to
                    this Location.
                  </p>
                </div>
              </td>
            </tr>
          )}
          {location.stored.map((item, index) => (
            <tr key={index}>
              <TableCell>
                {item.address ? (
                  <span className="font-bold">
                    {location.size && location.direction
                      ? addressToLocationAddress(
                          item.address,
                          location.size!,
                          location.direction!
                        )
                      : item.address}
                  </span>
                ) : (
                  <span className="italic text-sm">None</span>
                )}
              </TableCell>
              <TableCell>{item.barcode}</TableCell>
              <TableCell>
                <Authenticated>
                  <RemoveButton
                    onClick={() => {
                      setSelectedItem(item);
                    }}
                  />
                </Authenticated>
              </TableCell>
            </tr>
          ))}
        </TableBody>
      </Table>

      <Authenticated>
        <UnstoreBarcodeModal
          isOpen={!!selectedItem}
          barcode={selectedItem?.barcode}
          location={location}
          onClose={() => setSelectedItem(null)}
          onConfirm={() => {
            const barcode = selectedItem?.barcode;
            if (barcode) {
              unstoreBarcode(barcode);
            }
            setSelectedItem(null);
          }}
        />
      </Authenticated>
    </div>
  );
};

export default ItemsList;
