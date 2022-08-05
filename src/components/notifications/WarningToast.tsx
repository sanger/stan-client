import React from 'react';
import { toast, ToastPosition } from 'react-toastify';
import Warning from './Warning';
import { ClientError } from 'graphql-request';

interface WarningToastProps extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> {
  message?: string;
  error?: ClientError | null;
  position?: ToastPosition;
  autoClose?: number;
}

const warningToast = ({ message, error, position, autoClose }: WarningToastProps) => {
  const WarningComp = () => <Warning message={message} error={error} />;
  return toast(<WarningComp />, {
    position: position,
    autoClose: autoClose,
    hideProgressBar: true
  });
};

export default warningToast;
