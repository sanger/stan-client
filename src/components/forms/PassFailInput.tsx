import React, { useCallback } from "react";
import PassIcon from "../icons/PassIcon";
import { PassFail } from "../../types/sdk";
import FailIcon from "../icons/FailIcon";
import { useFormikContext } from "formik";

type PassFailInputProps = {
  /**
   * The current {@link PassFail} value
   */
  value: PassFail;

  /**
   * Optional callback to be called when the {@link PassFail} value is changed
   * @param newPassFail the new {@link PassFail} value
   */
  onChange?: (newPassFail: PassFail) => void;
};

export function PassFailInput({ value, onChange }: PassFailInputProps) {
  const handleOnPassClick = () =>
    value === PassFail.Fail && onChange?.(PassFail.Pass);
  const handleOnFailClick = () =>
    value === PassFail.Pass && onChange?.(PassFail.Fail);

  return (
    <span>
      <PassIcon
        onClick={handleOnPassClick}
        className={`inline-block h-8 w-8 cursor-pointer ${
          value === PassFail.Pass
            ? "text-green-700"
            : "text-gray-400 hover:text-green-300"
        }`}
      />
      <FailIcon
        onClick={handleOnFailClick}
        className={`inline-block h-8 w-8 cursor-pointer ${
          value === PassFail.Fail
            ? "text-red-600"
            : "text-gray-400 hover:text-red-300"
        }`}
      />
    </span>
  );
}

type FormikPassFailInputProps = PassFailInputProps & {
  /**
   * The name of the Formik field. Will be used in Formik's {@code setFieldValue}.
   */
  name: string;
};

export function FormikPassPailInput({ value, name }: FormikPassFailInputProps) {
  const { setFieldValue } = useFormikContext();

  const handleOnChange = useCallback(
    (newPassValue: PassFail) => {
      setFieldValue(name, newPassValue);
    },
    [setFieldValue, name]
  );

  return <PassFailInput value={value} onChange={handleOnChange} />;
}
