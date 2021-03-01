import React from "react";

interface ModalProps {
  show?: boolean;
}

const Modal: React.FC<ModalProps> = ({ children, show }) => {
  if (!show) {
    return null;
  }
  return (
    <div className="fixed z-20 inset-0 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block xl:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75" />
        </div>

        <span
          className="hidden sm:inline-block sm:align-middle sm:h-screen"
          aria-hidden="true"
        >
          &#8203;
        </span>

        <div
          className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-screen-md sm:w-full"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-headline"
        >
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;

export const ModalHeader: React.FC = ({ children }) => {
  return (
    <h3
      className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4 text-lg leading-6 font-medium text-gray-900"
      id="modal-headline"
    >
      {children}
    </h3>
  );
};

export const ModalBody: React.FC = ({ children }) => {
  return (
    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">{children}</div>
  );
};

export const ModalFooter: React.FC = ({ children }) => {
  return (
    <div className="bg-gray-100 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
      {children}
    </div>
  );
};
