import React from 'react';
import ReactRouterPrompt from 'react-router-prompt';
import Modal, { ModalBody, ModalFooter } from '../Modal';
import BlueButton from '../buttons/BlueButton';
import WhiteButton from '../buttons/WhiteButton';
import { BlockerFunction } from 'react-router-dom';

interface PromptOnLeaveProps {
  /**Should a prompt dialog be displayed?**/
  when: boolean | BlockerFunction;
  /**Message to display in prompt**/
  message: string;
  /**Callback when user presses Ok in Prompt, i.e leaving from current page to another page**/
  onPromptLeave?: () => void;
  /**Callback when user presses Cancel in Prompt**/
  onPromptCancel?: () => void;
}

const PromptOnLeave: React.FC<PromptOnLeaveProps> = ({ when, message, onPromptLeave, onPromptCancel }) => {
  return (
    <ReactRouterPrompt when={when}>
      {({ isActive, onConfirm, onCancel }) => (
        <Modal show={isActive}>
          <ModalBody>
            <div className="my-2 py-2">
              <p className="text-gray-900 leading-normal">{message}</p>
            </div>
          </ModalBody>
          <ModalFooter>
            <WhiteButton
              className="mt-3 sm:mt-0 sm:ml-3"
              onClick={() => {
                onConfirm();
                onPromptLeave?.();
              }}
            >
              Ok
            </WhiteButton>
            <BlueButton
              className="text-base sm:ml-3 sm:w-auto sm:text-sm"
              onClick={() => {
                onCancel();
                onPromptCancel?.();
              }}
            >
              Cancel
            </BlueButton>
          </ModalFooter>
        </Modal>
      )}
    </ReactRouterPrompt>
  );
};
export default PromptOnLeave;
