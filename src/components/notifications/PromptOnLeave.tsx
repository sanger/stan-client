import React from "react";
import * as H from "history";
import { useConfirmLeave } from "../../lib/hooks";
import { ConfirmationNavigationModal } from "../modal/ConfirmationNavigationModal";
import {useBlocker, usePrompt} from "react-router-dom";

import React from "react";
import * as H from "history";
import { Prompt } from "react-router-dom";
import { useConfirmLeave } from "../../lib/hooks";
import {useLocation} from "react-router";

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

    const handleBlockNavigation = () => {
        const shouldDisplayPrompt =
            typeof shouldPrompt === "boolean" ? shouldPrompt : shouldPrompt()
        if (shouldDisplayPrompt) {
            openModal({
                name: "EXIT_ROUTE_CONFIRMATION",
                data: {
                    ...messageObj,
                    cb: (leaveRoute: Boolean) => {
                        if (leaveRoute) {
                            setConfirmedNavigation(true)
                            retryFn.current = retry
                        }
                    }
                }
            })
        } else {
            retry()
        }
    }

    useBlocker(handleBlockNavigation, !confirmedNavigation)

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
      <ConfirmationNavigationModal onConfirm={onPromptLeave} onCancel={onPromptCancel}/>

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
