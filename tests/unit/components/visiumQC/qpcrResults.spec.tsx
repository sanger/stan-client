import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

import { Formik } from 'formik';
import { superFrostPlusFactory } from '../../../../src/lib/factories/labwareFactory';
import { LabwareFlaggedFieldsFragment } from '../../../../src/types/sdk';
import { enableMapSet } from 'immer';
import { NewFlaggedLabwareLayout } from '../../../../src/types/stan';
import QPcrResults from '../../../../src/components/visiumQC/QPcrResults';
import { sampleFactory, tissueFactory } from '../../../../src/lib/factories/sampleFactory';
afterEach(() => {
  cleanup();
});
beforeEach(() => {
  enableMapSet();
});

const formikValues = {};
const FormikProps = {
  onSubmit: () => {},
  initialValues: {},
  values: formikValues
};

const mockRemoveLabware = jest.fn();

const renderQpcrResults = () => {
  const inputLabware = superFrostPlusFactory.build() as NewFlaggedLabwareLayout;
  const labware: LabwareFlaggedFieldsFragment = { ...inputLabware, barcode: inputLabware.barcode ?? '' };
  const tissue = [tissueFactory.build({ externalName: 'test 1' }), tissueFactory.build({ externalName: 'test 2' })];
  const initialProps = {
    slotMeasurements: [
      {
        address: 'A1',
        name: 'Cq value',
        value: '0',
        samples: [
          sampleFactory.build({ section: 2, tissue: tissue[1] }),
          sampleFactory.build({ section: 1, tissue: tissue[0] })
        ]
      },
      { address: 'A2', name: 'Cq value', value: '0', samples: [] }
    ],
    labware: labware,
    removeLabware: mockRemoveLabware
  };
  return render(
    <Formik {...FormikProps}>
      <QPcrResults {...initialProps} />
    </Formik>
  );
};

describe('QPcrResults', () => {
  it('renders QPcrResults with the correct values', async () => {
    renderQpcrResults();
    await waitFor(() => {
      expect(screen.getByTestId('labware')).toBeVisible();
      const cqTable = screen.queryByRole('table');
      expect(cqTable).toBeVisible();
      expect(cqTable).toHaveTextContent('test 1');
      expect(cqTable).toHaveTextContent('test 2');
      expect(cqTable).toHaveTextContent('1');
      expect(cqTable).toHaveTextContent('2');
    });
  });
  it('invokes remove function when labware is removed', async () => {
    renderQpcrResults();
    await waitFor(() => {
      const removeButton = screen.getByTestId('remove');
      fireEvent.click(removeButton);
    });
    expect(mockRemoveLabware).toHaveBeenCalled();
  });
});
