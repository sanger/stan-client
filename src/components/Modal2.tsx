import React, { ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import BlueButton from './buttons/BlueButton';
import WhiteButton from './buttons/WhiteButton';
import { reload } from '../lib/sdk';

interface ModalProps {
  show?: boolean;
  children: ReactNode;
}

export const Modal2: React.FC<ModalProps> = ({ children, show }) => {
  const navigate = useNavigate();
  if (!show) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        overflowY: 'auto'
      }}
    >
      <div
        style={{
          backgroundColor: 'white',
          margin: '40px auto',
          padding: '24px',
          maxWidth: '800px'
        }}
      >
        <Link to={'/'}>
          <BlueButton type="button" className="mt-3 w-full sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
            Return Home
          </BlueButton>
        </Link>
        <WhiteButton
          type="button"
          onClick={() => {
            reload(navigate);
          }}
          className="w-full text-base sm:ml-3 sm:w-auto sm:text-sm"
        >
          Reset Form
        </WhiteButton>
        {children}
      </div>
    </div>
  );
};
