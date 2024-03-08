import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Formik } from 'formik';
import AddNewConfigOption, {
  AddNewConfigOptionProps
} from '../../../../src/components/workAllocation/AddNewConfigOption';
import React from 'react';
import WarningToast from '../../../../src/components/notifications/WarningToast';
import { toast } from 'react-toastify';
import clearAllMocks = jest.clearAllMocks;
function mockedRandomResolvedFc() {
  return new Promise((resolve, reject) => {
    resolve({ object: 'new config ' });
  });
}

function mockedRandomRejectedFc() {
  return new Promise((resolve, reject) => {
    reject('Error to add a new config option');
  });
}

const onSuccess = jest.fn();
const onSubmitResolved = jest.fn(mockedRandomResolvedFc);
const onSubmitRejected = jest.fn(mockedRandomRejectedFc);
const onCancel = jest.fn();
const onFinish = jest.fn();

const formOptions = (resolved: boolean): AddNewConfigOptionProps => {
  return {
    inputRef: React.createRef<HTMLInputElement>(),
    onSuccess,
    // onSubmit: jest.fn(() => (resolved ? mockedRandomResolvedFc() : mockedRandomRejectedFc())),
    onSubmit: resolved ? onSubmitResolved : onSubmitRejected,
    onCancel,
    onFinish,
    configLabel: 'Add New Config Option',
    configName: 'Config-X',
    returnedDataObject: 'object',
    mainDivRef: React.createRef<HTMLDivElement>()
  };
};

// Mock the toast module
jest.spyOn(toast, 'success');
jest.mock('../../../../src/components/notifications/WarningToast', () => ({
  __esModule: true,
  default: jest.fn() // Mock warningToast function
}));

const formikValues = {};
const formikProps = {
  onSubmit: () => {},
  initialValues: {},
  values: formikValues
};

const renderAddNewConfigOption = (resolved: boolean) => {
  const props = formOptions(resolved);
  return render(
    <Formik {...formikProps}>
      <AddNewConfigOption {...props} />
    </Formik>
  );
};

describe('AddNewConfigOption', () => {
  afterEach(() => {
    cleanup();
    clearAllMocks();
  });
  describe('when the onSubmit function is resolved', () => {
    beforeEach(() => {
      renderAddNewConfigOption(true);
    });
    it('renders AddNewConfigOption with the correct fields', () => {
      expect(screen.getByText('Add New Config Option')).toBeVisible();
      expect(screen.getByText('Save')).toBeVisible();
      expect(screen.getByText('Cancel')).toBeVisible();
    });
    describe('when the form is not filled', () => {
      it('displays an error notification', () => {
        act(() => {
          fireEvent.click(screen.getByText('Save'));
        });
        expect(WarningToast).toHaveBeenCalled();
      });
    });
    describe('when "CancelCancel" is clicked', () => {
      it('calls onCancel', () => {
        act(() => {
          fireEvent.click(screen.getByText('Cancel'));
        });
        expect(onCancel).toHaveBeenCalled();
      });
    });
    describe('when the form is correctly filled', () => {
      it('calls onSubmit resolved function', async () => {
        act(() => {
          fireEvent.change(screen.getByTestId('Config-X'), { target: { value: 'new option' } });
          fireEvent.click(screen.getByText('Save'));
        });
        await waitFor(() => {
          expect(onSubmitResolved).toHaveBeenCalled();
        });
      });
      describe('when the onSubmit function is successful', () => {
        beforeEach(() => {});
        it('calls onSuccess function', async () => {
          act(() => {
            fireEvent.change(screen.getByTestId('Config-X'), { target: { value: 'new option' } });
            fireEvent.click(screen.getByText('Save'));
          });
          await waitFor(() => {
            expect(onSuccess).toHaveBeenCalled();
          });
        });
        it('displays a successful message', async () => {
          act(() => {
            fireEvent.change(screen.getByTestId('Config-X'), { target: { value: 'new option' } });
            fireEvent.click(screen.getByText('Save'));
          });
          await waitFor(() => {
            expect(require('react-toastify').toast.success).toHaveBeenCalledWith('Successfully added new Config-X', {
              position: 'top-right',
              autoClose: 5000
            });
          });
        });
        it('calls onFinish function', async () => {
          act(() => {
            fireEvent.change(screen.getByTestId('Config-X'), { target: { value: 'new option' } });
            fireEvent.click(screen.getByText('Save'));
          });
          await waitFor(() => {
            expect(onFinish).toHaveBeenCalled();
          });
        });
      });
    });
  });
  describe('when the onSubmit function is rejected', () => {
    beforeEach(() => {
      renderAddNewConfigOption(false);
    });
    it('calls onSubmit rejected function', async () => {
      act(() => {
        fireEvent.change(screen.getByTestId('Config-X'), { target: { value: 'new option' } });
        fireEvent.click(screen.getByText('Save'));
      });
      await waitFor(() => {
        expect(onSubmitRejected).toHaveBeenCalled();
      });
    });
    it('displays a notification error', async () => {
      act(() => {
        fireEvent.change(screen.getByTestId('Config-X'), { target: { value: 'new option' } });
        fireEvent.click(screen.getByText('Save'));
      });
      await waitFor(() => {
        expect(WarningToast).toHaveBeenCalledWith({
          autoClose: 5000,
          message: 'Error to add a new config option',
          position: 'top-right'
        });
      });
    });
    it('does not call onSuccess function', async () => {
      act(() => {
        fireEvent.change(screen.getByTestId('Config-X'), { target: { value: 'new option' } });
        fireEvent.click(screen.getByText('Save'));
      });
      await waitFor(() => {
        expect(onSuccess).not.toHaveBeenCalled();
      });
    });
    it('does not call onFinish function', async () => {
      act(() => {
        fireEvent.change(screen.getByTestId('Config-X'), { target: { value: 'new option' } });
        fireEvent.click(screen.getByText('Save'));
      });
      await waitFor(() => {
        expect(onFinish).not.toHaveBeenCalled();
      });
    });
  });
});
