import { act, screen, render, cleanup, waitFor, fireEvent } from '@testing-library/react';
import { GetRegistrationInfoQuery, LabwareType } from '../../../../src/types/sdk';
import solutionRepository from '../../../../src/mocks/repositories/solutionRepository';
import hmdmcRepository from '../../../../src/mocks/repositories/hmdmcRepository';
import fixativeRepository from '../../../../src/mocks/repositories/fixativeRepository';
import speciesRepository from '../../../../src/mocks/repositories/speciesRepository';
import tissueTypeRepository from '../../../../src/mocks/repositories/tissueTypeRepository';
import { labwareTypes } from '../../../../src/lib/factories/labwareTypeFactory';
import { LabwareTypeName } from '../../../../src/types/stan';
import { getRegistrationFormTissueSample } from '../../../../src/pages/OriginalSampleRegistration';
import { Formik } from 'formik';
import RegistrationForm from '../../../../src/pages/registration/RegistrationForm';
import React from 'react';

const registrationInfo: GetRegistrationInfoQuery = {
  solutions: solutionRepository.findAll(),
  hmdmcs: hmdmcRepository.findAll(),
  fixatives: fixativeRepository.findAll(),
  mediums: [{ name: 'Medium1' }, { name: 'Medium2' }],
  species: speciesRepository.findAll(),
  tissueTypes: tissueTypeRepository.findAll(),
  labwareTypes: [labwareTypes[LabwareTypeName.CASSETTE].build(), labwareTypes[LabwareTypeName.PROVIASETTE].build()]
};
const availableLabwareTypes: LabwareType[] = registrationInfo.labwareTypes;
const keywords = new Map()
  .set('Block', 'Sample')
  .set('Embedding', 'Solution')
  .set('Optional', ['Replicate Number', 'External Identifier']);

afterEach(() => {
  cleanup();
});
const renderOriginalRegistrationForm = () => {
  return render(
    <div>
      <Formik
        initialValues={{
          tissues: [getRegistrationFormTissueSample()],
          workNumbers: []
        }}
        onSubmit={() => {}}
      >
        <RegistrationForm
          registrationInfo={registrationInfo}
          availableLabwareTypes={availableLabwareTypes}
          defaultFormTissueValues={getRegistrationFormTissueSample()}
          keywordsMap={keywords}
        />
      </Formik>
    </div>
  );
};

function selectOption(comboBox: HTMLElement, optionText: string) {
  // Opens the dropdown options list
  fireEvent.keyDown(comboBox, { keyCode: 40 });

  //Selects the dropdown option and close the dropdown options list
  const option = screen.getByText(optionText);
  fireEvent.click(option);
}
async function fillInForm() {
  await waitFor(() => {
    fireEvent.change(screen.getByLabelText('Donor ID'), { target: { value: 'Donor1' } });
    fireEvent.click(screen.getByTestId('adult'));
    const comboBox = screen.getByRole('combobox', { name: 'Species' });
    selectOption(comboBox, 'Human');
  });
}
describe('RegistrationForm', () => {
  describe('Original registration', () => {
    beforeEach(() => {
      jest.mock('formik', () => ({
        useFormikContext: jest.fn().mockImplementation(() => {
          return {
            setFieldValue: jest.fn(),
            errors: undefined,
            values: { tissues: [getRegistrationFormTissueSample()], workNumbers: [] }
          };
        })
      }));
    });
    describe('on Mount', () => {
      it('displays all required fields', async () => {
        act(() => {
          renderOriginalRegistrationForm();
        });
        await waitFor(() => {
          //Donor Information
          expect(screen.getByText('Donor Information')).toBeInTheDocument();
          expect(screen.getByLabelText('Donor ID')).toBeInTheDocument();
          //Fetal should be selected by default in life stage
          expect(screen.getByText('Life Stage')).toBeInTheDocument();
          expect(screen.getByTestId('fetal')).toBeChecked();
          expect(screen.getByText('Sample Collection Date')).toBeInTheDocument();
          expect(screen.getByRole('combobox', { name: 'Species' })).toBeInTheDocument();

          //Tissue Information
          expect(screen.getByText('Tissue Information')).toBeInTheDocument();
          expect(screen.getByText('HuMFre')).toBeInTheDocument();
          expect(screen.getByRole('combobox', { name: 'Tissue Type' })).toBeInTheDocument();
          expect(screen.getByText('Sample Information')).toBeInTheDocument();

          //Sample information
          //only one sample page
          expect(screen.getAllByTestId('sample-info-div')).toHaveLength(1);
          expect(screen.getByTestId('External Identifier')).toBeInTheDocument();
          expect(screen.getByTestId('Spatial Location')).toBeInTheDocument();
          expect(screen.getByTestId('Replicate Number')).toBeInTheDocument();
          expect(screen.getByRole('combobox', { name: 'Labware Type' })).toBeInTheDocument();

          //Solution Information
          expect(screen.getByText('Solution Information')).toBeInTheDocument();
          expect(screen.getByRole('combobox', { name: 'Fixative' })).toBeInTheDocument();
          expect(screen.getByRole('combobox', { name: 'Solution' })).toBeInTheDocument();

          //buttons
          expect(screen.getByRole('button', { name: '+ Add Identical Tissue Sample' })).toBeInTheDocument();
          expect(screen.getByRole('button', { name: '+ Add Another Tissue Sample' })).toBeInTheDocument();
          expect(screen.getByRole('button', { name: '+ Add Another Tissue' })).toBeInTheDocument();
          expect(screen.getByRole('button', { name: '+ Add Identical Tissue' })).toBeInTheDocument();
          expect(screen.getByRole('button', { name: 'Register' })).toBeInTheDocument();
          expect(screen.queryByRole('button', { name: 'Delete Sample' })).not.toBeInTheDocument();
        });
      });
    });
    describe('field properties change', () => {
      beforeEach(() => {
        act(() => {
          renderOriginalRegistrationForm();
        });
      });

      it('removes sample collection date field on adult life stage', async () => {
        await waitFor(() => {
          fireEvent.click(screen.getByTestId('adult'));
          expect(screen.queryByText('Sample Collection Date')).not.toBeInTheDocument();
        });
      });
      it('removes sample collection date field on paediatric life stage', async () => {
        await waitFor(() => {
          fireEvent.click(screen.getByTestId('paediatric'));
          expect(screen.queryByText('Sample Collection Date')).not.toBeInTheDocument();
        });
      });
      it('removes sample collection date field on fetal life stage', async () => {
        await waitFor(() => {
          fireEvent.click(screen.getByTestId('fetal'));
          expect(screen.queryByText('Sample Collection Date')).toBeInTheDocument();
        });
      });
      it('fills correct information', () => {
        //fillInForm();
      });
    });
    /*describe('Button clicks', () => {
      beforeEach(() => {
        window.HTMLElement.prototype.scrollIntoView = jest.fn();

        jest.mock('../../../../src/lib/hooks', () => ({
          useScrollToRef: jest.fn().mockImplementation(() => {
            return {
              scrollToRef: jest.fn(),
              ref: null
            };
          })
        }));
      });
      it('On "Add Identical Tissue Sample" button click', async () => {
        act(() => {
          renderOriginalRegistrationForm();
        });
        await screen.getByRole('button', { name: '+ Add Identical Tissue Sample' }).click();
        //Two sample pages
        expect(screen.getAllByTestId('sample-info-div')).toHaveLength(2);
        expect(screen.getAllByRole('button', { name: 'Delete Sample' })).toHaveLength(2);
      });
    });*/
  });
});
