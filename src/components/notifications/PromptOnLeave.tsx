import React from 'react';
import * as H from 'history';
import { useConfirmLeave } from '../../lib/hooks';
import ReactRouterPrompt from 'react-router-prompt';
import Modal, { ModalBody, ModalFooter } from '../Modal';
import { useLocation, useNavigationType } from 'react-router-dom';
import BlueButton from '../buttons/BlueButton';
import Heading from '../Heading';
import WhiteButton from '../buttons/WhiteButton';

interface PromptOnLeaveProps {
  /**Should a prompt dialog be displayed?**/
  when: boolean;
  /**Message to display in prompt**/
  message: string;
  /**Extra handler to check on other conditions mainly based on the
   * - Action(e.g Go back,go forward etc) performed and
   * - Future Location going to navigate to */
  messageHandler?: (location: H.Location, action: H.Action, message: string) => string | boolean;
  /**Callback when user presses Ok in Prompt, i.e leaving from current page to another page**/
  onPromptLeave?: () => void;
  /**Callback when user presses Cancel in Prompt**/
  onPromptCancel?: () => void;
}

const PromptOnLeave: React.FC<PromptOnLeaveProps> = ({
  when,
  message,
  messageHandler,
  onPromptLeave,
  onPromptCancel
}) => {
  //User hook to prompt Refresh and Exit events as these are not handled by Prompt
  const [, setShouldConfirm] = useConfirmLeave(true);
  const navigationType = useNavigationType();
  const location = useLocation();

  React.useEffect(() => {
    setShouldConfirm(when);
  }, [when, setShouldConfirm]);
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
              className="mt-3 w-full sm:mt-0 sm:ml-3"
              onClick={() => {
                onConfirm();
                onPromptLeave?.();
                messageHandler?.(location, navigationType, message);
              }}
            >
              Ok
            </WhiteButton>
            <BlueButton
              className="w-full text-base sm:ml-3 sm:w-auto sm:text-sm"
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
