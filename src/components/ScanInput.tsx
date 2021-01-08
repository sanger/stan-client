import React from "react";
import BarcodeIcon from "./icons/BarcodeIcon";
import LockIcon from "./icons/LockIcon";
import classNames from "classnames";

interface ScanInputProps
  extends React.DetailedHTMLProps<
    React.InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  > {
  /**
   * Should the {@link ScanInput} display as locked
   * @default false
   */
  locked?: boolean;

  /**
   * Callback for when a barcode is scanned into the {@link ScanINput}
   * @param value the current value of the input
   */
  onScan?: (value: string) => void;
}

const ScanInput: React.FC<ScanInputProps> = ({
  locked = false,
  onScan = (_value) => {},
  ...inputProps
}) => {
  const inputClassNames = classNames(
    {
      "rounded-r-md": !locked,
      "border-r-0 disabled:bg-gray-100": locked,
    },
    "flex-grow-0 focus:ring-sdb-100 focus:border-sdb-100 block w-full border-gray-300 rounded-none transition duration-150 ease-in-out"
  );

  return (
    <div className="mt-3 flex rounded-md shadow-sm md:w-1/2">
      <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
        <BarcodeIcon className="block h-5 w-5" />
      </span>
      <input
        {...inputProps}
        onKeyDown={(e) => {
          if (["Tab", "Enter"].some((triggerKey) => triggerKey === e.key)) {
            e.preventDefault();
            onScan(e.currentTarget.value);
          }
        }}
        className={inputClassNames}
      />
      {locked && (
        <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-100 transition duration-150 ease-in-out text-sm">
          <LockIcon className="block h-5 w-5 text-sp-300 transition duration-150 ease-in-out" />
        </span>
      )}
    </div>
  );
};

export default ScanInput;
