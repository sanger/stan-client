import React from "react";
import * as H from "history";
import { Prompt } from "react-router-dom";
import { useConfirmLeave } from "../../lib/hooks";

interface PromptOnLeaveProps {
  /**Should a prompt dialog be displayed?**/
  when: boolean;
  /**Message to display in prompt**/
  message: string;
  /**Extra handler to check on other conditions mainly based on the
   * - Action(e.g Go back,go forward etc) performed and
   * - Future Location going to navigate to */
  messageHandler?: (
    location: H.Location,
    action: H.Action,
    message: string
  ) => string | boolean;
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
  onPromptCancel,
}) => {
  //User hook to prompt Refresh and Exit events as these are not handled by Prompt
  const [, setShouldConfirm] = useConfirmLeave(true);

  React.useEffect(() => {
    setShouldConfirm(when);
  }, [when, setShouldConfirm]);

  /**Ok/Cancel status for Prompt dialog*/
  const promptReturnStatus = React.useRef(false);

  /**Call appropriate callback before unmounting this component*/
  React.useEffect(() => {
    return () => {
      if (promptReturnStatus.current && onPromptLeave) {
        onPromptLeave();
      } else if (onPromptCancel) {
        onPromptCancel();
      }
    };
  }, [onPromptLeave, onPromptCancel]);

  return (
    <Prompt
      when={when}
      message={(location, action) => {
        const ret = messageHandler
          ? messageHandler(location, action, message)
          : message;
        promptReturnStatus.current = typeof ret === "string";
        return ret;
      }}
    />
  );
};
export default PromptOnLeave;
