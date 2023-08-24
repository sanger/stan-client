import React from 'react';
import * as H from 'history';
import { useConfirmLeave } from '../../lib/hooks';
import ReactRouterPrompt from 'react-router-prompt';
import Modal from '../Modal';
import { useLocation, useNavigationType } from 'react-router-dom';

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
          <div>
            <p>{message}</p>
            <button
              onClick={() => {
                onCancel();
                onPromptCancel?.();
              }}
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onConfirm();
                onPromptLeave?.();
                messageHandler?.(location, navigationType, message);
              }}
            >
              Ok
            </button>
          </div>
        </Modal>
      )}
    </ReactRouterPrompt>
  );
};
export default PromptOnLeave;
