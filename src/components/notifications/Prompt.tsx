import ReactRouterPrompt from 'react-router-prompt';
import Modal, { ModalBody, ModalFooter } from '../Modal';
import React from 'react';
import BlueButton from '../buttons/BlueButton';
import WhiteButton from '../buttons/WhiteButton';
type PromptProps = {
  message: string;
  when: boolean;
};
const Prompt: React.FC<PromptProps> = ({ message, when }) => {
  return (
    <ReactRouterPrompt when={when}>
      {({ isActive, onConfirm, onCancel }) => (
        <Modal show={isActive}>
          <ModalBody>
            <div className="my-2">
              <p className="text-gray-900 leading-normal">{message}</p>
            </div>
          </ModalBody>

          <ModalFooter>
            <BlueButton onClick={onCancel}>Cancel</BlueButton>
            <WhiteButton onClick={onConfirm}>Ok</WhiteButton>
          </ModalFooter>
        </Modal>
      )}
    </ReactRouterPrompt>
  );
};
export default Prompt;
