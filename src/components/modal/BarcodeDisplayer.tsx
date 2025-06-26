import Modal, { ModalBody, ModalHeader } from '../Modal';
import React, { useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';
import FailIcon from '../icons/FailIcon';

interface DisplayerProps {
  /**
   * Header text
   */
  header: string;
  /**
   * Should this modal be showing
   */
  show: boolean;
  /**
   * barcode to render
   */
  barcode: string;

  /**
   * user warning message, if any
   */
  warningMessage?: string;

  /**
   * Function to close the modal
   */
  onClose: () => void;
}

export const BarcodeDisplayer = ({ show, header, barcode, warningMessage, onClose }: DisplayerProps) => {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    JsBarcode(svgRef.current, barcode, {
      format: 'CODE128',
      displayValue: true,
      lineColor: '#000',
      width: 2,
      height: 40
    });
  }, [barcode]);

  return (
    <Modal show={show}>
      <ModalHeader>
        <div className="flex flex-row justify-between items-center">
          {header}
          <FailIcon
            data-testid="closeBarcodeDisplayer"
            onClick={onClose}
            className={'w-5 h-5 cursor-pointer hover:text-red-500 text-red-400  items-end justify-end'}
          />
        </div>
      </ModalHeader>
      <ModalBody>
        {warningMessage && <div className="flex flex-row text-orange-800 font-medium text-md ">{warningMessage}</div>}
        <div className="my-4 flex justify-center">
          <svg data-testid="2d-barcode" ref={svgRef}></svg>
        </div>
      </ModalBody>
    </Modal>
  );
};
