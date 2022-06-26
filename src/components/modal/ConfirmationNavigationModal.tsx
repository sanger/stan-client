import React from "react";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "../Modal";
import WhiteButton from "../buttons/WhiteButton";

interface ConfirmationNavigationProps {
  onConfirm?: () => void;
  onCancel?: () => void;
  message?: string;
}

export const ConfirmationNavigationModal = ({
  onConfirm,
  onCancel,
  message,
}: ConfirmationNavigationProps): JSX.Element => {
  return (
    <Modal show={true}>
      <ModalHeader>{}</ModalHeader>
      <ModalBody>
        {message ?? "You have unsaved changes. Are you sure you want to leave?"}
      </ModalBody>
      <ModalFooter>
        <WhiteButton
          type="button"
          onClick={onCancel}
          className="w-full text-base sm:ml-3 sm:w-auto sm:text-sm"
        >
          Cancel
        </WhiteButton>
        <WhiteButton
          type="button"
          onClick={onConfirm}
          className="w-full text-base sm:ml-3 sm:w-auto sm:text-sm"
        >
          Ok
        </WhiteButton>
      </ModalFooter>
    </Modal>
  );
};
