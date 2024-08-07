import WhiteButton from '../buttons/WhiteButton';
import BlueButton from '../buttons/BlueButton';
import React, { useEffect } from 'react';
import { Input } from '../forms/Input';
import Label from '../forms/Label';
import warningToast from '../notifications/WarningToast';
import { extractServerErrors } from '../../types/stan';
import { toast } from 'react-toastify';
import { ClientError } from 'graphql-request';
import { Maybe } from 'yup';

export type AddNewConfigOptionProps = {
  inputRef: React.RefObject<HTMLInputElement>;
  onSuccess: (object: any) => void;
  onSubmit: (value: string) => Promise<any>;
  onFinish: () => void;
  onCancel: () => void;
  configLabel: string;
  configName: string;
  returnedDataObject: string;
  /** Reference to the main div of the component, used to detect when the user clicks outside of the component */
  mainDivRef: React.RefObject<HTMLDivElement>;
};

const AddNewConfigOption = (props: AddNewConfigOptionProps) => {
  const [serverErrors, setServerErrors] = React.useState<Maybe<ClientError> | string>(null);
  const [serverSuccess, setServerSuccess] = React.useState<Maybe<string>>(null);

  /** Notify the user about the server outcome. */
  useEffect(() => {
    if (serverErrors) {
      warningToast({
        message: serverErrors instanceof ClientError ? extractServerErrors(serverErrors).message! : serverErrors,
        position: toast.POSITION.TOP_RIGHT,
        autoClose: 5000
      });
    }
  }, [serverErrors, props]);

  useEffect(() => {
    if (serverSuccess) {
      toast.success(serverSuccess, {
        position: toast.POSITION.TOP_RIGHT,
        autoClose: 5000
      });
      props.onFinish();
    }
  }, [serverSuccess, props]);

  const handleOnSubmit = async (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    event.preventDefault();
    const value = props.inputRef.current!.value;
    if (value) {
      props
        .onSubmit(value)
        .then((data) => {
          const success = data && props.returnedDataObject in data && data[props.returnedDataObject] !== null;
          if (success) {
            props.onSuccess(data[props.returnedDataObject]);
            setServerSuccess(`Successfully added new ${props.configName}`);
          } else {
            setServerErrors(`Failed to add new ' ${props.configName}`);
          }
        })
        .catch((error: string) => {
          setServerErrors(error);
        });
    } else {
      setServerErrors(`${props.configName} is not provided`);
    }
  };

  return (
    <div className="border border-2 border-gray-200 bg-white p-3 rounded-md space-y-4" ref={props.mainDivRef}>
      <Label htmlFor={props.configName} name={props.configLabel} />
      <Input id={props.configName} type="text" ref={props.inputRef} data-testid={props.configName} />
      <div className="flex flex-row items-center justify-end space-x-2">
        <WhiteButton
          type="button"
          onClick={(event) => {
            event.preventDefault();
            props.onCancel();
          }}
        >
          Cancel
        </WhiteButton>
        <BlueButton type="submit" onClick={(event) => handleOnSubmit(event)}>
          Save
        </BlueButton>
      </div>
    </div>
  );
};

export default AddNewConfigOption;
