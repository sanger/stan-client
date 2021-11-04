import React from "react";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "../Modal";
import Success from "../notifications/Success";
import WhiteButton from "../buttons/WhiteButton";

interface ConfirmationProps {
  /**
   * Should this modal be showing
   */
  show: boolean;
  /**
   * Children to be displayed in the modal
   */
  children: React.ReactNode;

  /**
   * Message to display
   */
  message: string;

  /**
   * Labels and action handlers for different options to display
   */
  confirmOptions: { label: string; action: () => void }[];
}

export const ConfirmationModal = ({
  show,
  message,
  confirmOptions,
  children,
}: ConfirmationProps): JSX.Element => {
  return (
    <Modal show={show}>
      <ModalHeader>Operation Complete</ModalHeader>
      <ModalBody>
        {message && <Success message={message} />}
        <div className="my-4">{children}</div>
      </ModalBody>
      <ModalFooter>
        {confirmOptions.map((option) => (
          <WhiteButton
            type="button"
            onClick={option.action}
            className="w-full text-base sm:ml-3 sm:w-auto sm:text-sm"
          >
            {option.label}
          </WhiteButton>
        ))}
      </ModalFooter>
    </Modal>
  );
};
