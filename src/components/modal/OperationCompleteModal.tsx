import React from "react";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "../Modal";
import Success from "../notifications/Success";
import { Link } from "react-router-dom";
import BlueButton from "../buttons/BlueButton";
import WhiteButton from "../buttons/WhiteButton";

type OperationCompleteModalProps = {
  /**
   * Should this modal be showing
   */
  show: boolean;

  /**
   * Handler for when the "Reset Form" button is clicked
   */
  onReset: () => void;

  /**
   * Optional success message
   */
  message?: string;

  /**
   * Additional buttons to display in the button bar
   */
  additionalButtons?: React.ReactNode;

  /**
   * Children to be displayed in the modal
   */
  children: React.ReactNode;
};

/**
 * Specialized modal for display at the end of a process. Gives the option of either
 * resetting the form, or returning to the home screen
 */
export default function OperationCompleteModal({
  children,
  message,
  show,
  additionalButtons,
  onReset,
}: OperationCompleteModalProps) {
  return (
    <Modal show={show}>
      <ModalHeader>Operation Complete</ModalHeader>
      <ModalBody>
        {message && <Success message={message} />}
        <div className="my-4">{children}</div>
      </ModalBody>
      <ModalFooter>
        <Link to={"/"}>
          <BlueButton
            type="button"
            className="mt-3 w-full sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
          >
            Return Home
          </BlueButton>
        </Link>
        <WhiteButton
          type="button"
          onClick={onReset}
          className="w-full text-base sm:ml-3 sm:w-auto sm:text-sm"
        >
          Reset Form
        </WhiteButton>
        {additionalButtons}
      </ModalFooter>
    </Modal>
  );
}
