import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Formik } from 'formik';
import { LabwareFlaggedFieldsFragment } from '../../../../src/types/sdk';
import { enableMapSet } from 'immer';
import Amplification, { CDNAProps } from '../../../../src/components/visiumQC/Amplification';
import { createFlaggedLabware } from '../../../../src/mocks/handlers/flagLabwareHandlers';
import { forEach } from 'lodash';
afterEach(() => {
  cleanup();
  jest.resetModules();
});
beforeEach(() => {
  enableMapSet();
});
const FormikProps = {
  onSubmit: () => {},
  initialValues: {}
};

const mockedRemoveLabwareFct = jest.fn();
const renderAmplification = () => {
  const labware: LabwareFlaggedFieldsFragment = createFlaggedLabware('STAN-2134');
  const initialProps: CDNAProps = {
    slotMeasurements: [],
    labware: labware,
    removeLabware: mockedRemoveLabwareFct
  };
  return render(
    <Formik {...FormikProps}>
      <Amplification {...initialProps} />
    </Formik>
  );
};

describe('Amplification', () => {
  describe('when the scanned labware slots contain Cq values', () => {
    it('renders Amplification', async () => {
      renderAmplification();
      await waitFor(() => {
        expect(screen.getByTestId('labware')).toBeInTheDocument();
        const cqTable: HTMLTableElement | null = screen.queryByRole('table');
        expect(cqTable).toBeVisible();
        expect(cqTable).toHaveTextContent('External ID');
        expect(cqTable).toHaveTextContent('Section Number');
        expect(cqTable).toHaveTextContent('CQ VALUE');
        expect(screen.getAllByTestId('Cycles-input')).toHaveLength(6);
        // validate labware slots have CQ value
        forEach(cqTable!.rows, (row) => {
          expect(row.cells[3]).not.toHaveTextContent('');
        });
      });
    });
  });

  it('invokes remove function when labware is removed', () => {
    renderAmplification();
    fireEvent.click(screen.getByTestId('remove'));
    expect(mockedRemoveLabwareFct).toHaveBeenCalled();
  });
});
