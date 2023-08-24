import ReactRouterPrompt from 'react-router-prompt';
import Modal from '../Modal';
type PromptProps = {
  message: string;
  when: boolean;
};
const Prompt: React.FC<PromptProps> = ({ message, when }) => {
  return (
    <ReactRouterPrompt when={when}>
      {({ isActive, onConfirm, onCancel }) => (
        <Modal show={isActive}>
          <div>
            <p>{message}</p>
            <button onClick={onCancel}>Cancel</button>
            <button onClick={onConfirm}>Ok</button>
          </div>
        </Modal>
      )}
    </ReactRouterPrompt>
  );
};
export default Prompt;
