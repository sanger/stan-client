import React from 'react';
import { LabwareFieldsFragment } from '../types/sdk';
import CopyIcon from './icons/CopyIcon';
import warningToast from './notifications/WarningToast';
import { toast } from 'react-toastify';
import Success from './notifications/Success';
import { ButtonProps } from './buttons/Button';
import classNames from 'classnames';

/**
 * Success notification when barcodes have been copied to clipboard
 */
const ToastSuccess = (barcodes: string) => <Success message={`${barcodes} copied to clipboard.`} />;
interface LabelCopyButtonProps extends ButtonProps {
  labware: Array<LabwareFieldsFragment>;
  copyButtonText?: string;
  buttonClass?: string;
  onCopyAction?: (success: boolean, barcodesCopied: string) => void;
}

const LabelCopyButton: React.FC<LabelCopyButtonProps> = ({
  labware,
  copyButtonText,
  buttonClass,
  onCopyAction,
  ...rest
}) => {
  /**Show error rror on failed clipboard copy action**/
  const onError = (barcodes: string, notifyOnCopy?: (success: boolean, barcodesCopied: string) => void) => {
    notifyOnCopy?.(false, barcodes);
    warningToast({
      message: 'Cannot copy to clipboard empty slot.',
      position: toast.POSITION.TOP_RIGHT,
      autoClose: 5000
    });
  };

  const handleCopy = async (
    labware: LabwareFieldsFragment[],
    notifyOnCopy?: (success: boolean, barcodesCopied: string) => void
  ) => {
    const barcodesToCopy = labware.map((lw) => lw.barcode).join(',');
    try {
      await navigator.clipboard
        .writeText(barcodesToCopy)
        .then(() => {
          notifyOnCopy?.(false, barcodesToCopy);
          toast(ToastSuccess(barcodesToCopy), {
            position: toast.POSITION.TOP_RIGHT,
            autoClose: 4000,
            hideProgressBar: true
          });
        })
        .catch(() => onError(barcodesToCopy, onCopyAction));
    } catch (error) {
      onError(barcodesToCopy, onCopyAction);
    }
  };

  const buttonClassName = classNames(
    'w-full inline-flex items-center justify-center space-x-1 justify-center rounded-md border border-gray-300 shadow-sm gap-x-1 px-4 py-2 bg-white text-base font-medium hover:bg-gray-100 active:opacity-75 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm',
    buttonClass
  );
  return (
    <button
      id={'copyButton'}
      disabled={labware.length <= 0}
      onClick={() => handleCopy(labware, onCopyAction)}
      type="button"
      className={buttonClassName}
      {...rest}
    >
      <CopyIcon className="h-5 w-5" />
      {copyButtonText ?? ''}
    </button>
  );
};
export default LabelCopyButton;
