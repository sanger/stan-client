import React from "react";
import Modal, {
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "../../components/Modal";
import PinkButton from "../../components/buttons/PinkButton";
import WhiteButton from "../../components/buttons/WhiteButton";
import { FindLocationByBarcodeQuery } from "../../types/sdk";

interface UnstoreBarcodeModalProps {
  isOpen: boolean;
  location: FindLocationByBarcodeQuery["location"];
  barcode: string | undefined;
  onConfirm: () => void;
  onClose: () => void;
}

const UnstoreBarcodeModal: React.FC<UnstoreBarcodeModalProps> = ({
  isOpen,
  location,
  barcode,
  onConfirm,
  onClose,
}) => {
  return (
    <Modal show={isOpen}>
      <ModalHeader>Unstore Barcode</ModalHeader>
      <ModalBody>
        <p className="text-sm text-gray-700">
          Are you sure you want to remove{" "}
          <span className="font-semibold">{barcode}</span> from{" "}
          <span className="font-semibold">
            {location.customName || location.fixedName || location.barcode}
          </span>
          ?
        </p>
      </ModalBody>
      <ModalFooter>
        <PinkButton className="sm:ml-3" onClick={onConfirm}>
          Unstore Barcode
        </PinkButton>
        <WhiteButton className="sm:ml-3 mt-1" onClick={onClose}>
          Close
        </WhiteButton>
      </ModalFooter>
    </Modal>
  );
};

export default UnstoreBarcodeModal;
