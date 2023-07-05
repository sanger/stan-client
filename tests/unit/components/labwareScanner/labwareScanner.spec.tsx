import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import ScanInput from '../../../../src/components/scanInput/ScanInput';
import { Formik } from 'formik';
import LabwareScanner, { useLabwareContext } from '../../../../src/components/labwareScanner/LabwareScanner';
import { getById } from '../../generic/utilities';
import React from 'react';

afterEach(() => {
  cleanup();
});
describe('LabwareScannaer', () => {
  describe('Labware Scanner with location', () => {
    describe('On Mount', () => {
      it('displays location and labware scan inputs', async () => {
        let { container } = render(<LabwareScanner enableLocationScanner={true}>{}</LabwareScanner>);

        expect(screen.getByText('Location:')).toBeVisible();
        expect(screen.getByText('Labware:')).toBeVisible();
        expect(getById(container, 'locationScanInput')).toBeVisible();
        expect(getById(container, 'labwareScanInput')).toBeVisible();
        expect(screen.getAllByTestId('input')).toHaveLength(2);
      });
      it('does not displays location scan inputs', async () => {
        let { container } = render(<LabwareScanner enableLocationScanner={false}>{}</LabwareScanner>);

        //expect(screen.getByText('Labware:')).not.toBeInTheDocument();
        //expect(screen.getByText('Location:')).not.toBeInTheDocument();
        expect(getById(container, 'locationScanInput')).not.toBeInTheDocument();
        expect(getById(container, 'labwareScanInput')).toBeVisible();
        expect(screen.getAllByTestId('input')).toHaveLength(1);
      });
      it('displays entered value in location scanner', async () => {
        act(() => {
          render(<LabwareScanner enableLocationScanner={true}>{}</LabwareScanner>);
        });
        expect(screen.getAllByTestId('input')).toHaveLength(2);
        const input = screen.getAllByTestId('input')[0] as HTMLInputElement;
        await waitFor(() => {
          fireEvent.change(input, { target: { value: '123' } });
        });
        expect(input).toHaveValue('123');
      });
    });
  });
  /*describe('Formik Input component', () => {
        describe('On Mount', () => {
            it('displays input component with scan icon', async () => {
                act(() => {
                    render(
                        <Formik {...FormikProps}>
                            <ScanInput name={'testing'} label={'Label'} />
                        </Formik>
                    );
                });
                const input = (await screen.findByTestId('formInput')) as HTMLInputElement;
                //Shows the formik input component
                expect(input).toBeInTheDocument();
                //Displays empty value
                expect(input).toHaveValue('');
                //Show the label
                expect(screen.getByText('Label')).toBeVisible();
            });
        });
        describe('on Entering value', () => {
            it('displays entered value', async () => {
                act(() => {
                    render(
                        <Formik {...FormikProps}>
                            <ScanInput name={'testing'} label={'Label'} />
                        </Formik>
                    );
                });
                const input = (await screen.findByTestId('formInput')) as HTMLInputElement;
                await waitFor(() => {
                    fireEvent.change(input, { target: { value: '123' } });
                });
                expect(input).toHaveValue('123');
            });
        });
    });*/
});
