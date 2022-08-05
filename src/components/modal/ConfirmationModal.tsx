import React from 'react';
import Modal, { ModalBody, ModalFooter, ModalHeader } from '../Modal';
import Success from '../notifications/Success';
import WhiteButton from '../buttons/WhiteButton';
import Warning from '../notifications/Warning';

interface ConfirmationProps {
  /**
   * Header text
   */
  header: string;
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
  message?: { type: 'Warning' | 'Success'; text: string };

  /**
   * Labels and action handlers for different options to display
   */
  confirmOptions: { label: string; action: () => void }[];
}

export const ConfirmationModal = ({
  show,
  header,
  message,
  confirmOptions,
  children
}: ConfirmationProps): JSX.Element => {
  return (
    <Modal show={show}>
      <ModalHeader>{header}</ModalHeader>
      <ModalBody>
        {message && message.type === 'Success' && <Success message={message.text} />}
        {message && message.type === 'Warning' && <Warning message={message.text} />}
        <div className="my-4">{children}</div>
      </ModalBody>
      <ModalFooter>
        {confirmOptions.map((option) => (
          <WhiteButton
            key={option.label}
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
