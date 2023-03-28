import { act, screen, render, cleanup, waitFor, fireEvent, within } from '@testing-library/react';
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
import userEvent from '@testing-library/user-event';
import { getRegistrationFormTissue } from '../../../../src/pages/BlockRegistration';

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

afterEach(() => {
  cleanup();
});
const renderOriginalRegistrationForm = () => {
  const keywords = new Map()
    .set('Block', 'Sample')
    .set('Embedding', 'Solution')
    .set('Optional', ['Replicate Number', 'External Identifier']);
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
const renderBlockRegistrationForm = () => {
  return render(
    <div>
      <Formik
        initialValues={{
          tissues: [getRegistrationFormTissue()],
          workNumbers: []
        }}
        onSubmit={() => {}}
      >
        <RegistrationForm
          registrationInfo={registrationInfo}
          availableLabwareTypes={availableLabwareTypes}
          defaultFormTissueValues={getRegistrationFormTissue()}
        />
      </Formik>
    </div>
  );
};

async function fillInOriginalRegistrationForm() {
  //fireEvent.change(screen.getByLabelText('Donor ID'), { target: { value: 'Donor1' } });
  //fireEvent.click(screen.getByTestId('adult'));
  //userEvent.type(getSelect('Species'), 'Human{enter}');
  //userEvent.type(getSelect('HuMFre'), 'HuMFre1{enter}');
  //userEvent.type(getSelect('Tissue Type'), 'Liver{enter}');
  //fireEvent.change(screen.getByTestId('External Identifier'), { target: { value: 'EXT-1' } });
  await userEvent.type(getSelect('Spatial Location'), '2 - Surface cranial region{enter}');
  userEvent.type(getSelect('Labware Type'), 'Pot{enter}');
  userEvent.type(getSelect('Fixative'), 'None{enter}');
  userEvent.type(getSelect('Solution'), 'Ethanol{enter}');
}
function getSelect(dataTestId: string) {
  const selectDiv = screen.getByTestId(dataTestId);
  return within(selectDiv).getByRole('combobox', { hidden: true });
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

          //humfre
          expect(screen.getByTestId('HuMFre')).toBeInTheDocument();
          //humfre is disabled
          const humfre = getSelect('HuMFre');
          expect(humfre).toBeDisabled();

          expect(screen.getByRole('combobox', { name: 'Tissue Type' })).toBeInTheDocument();
          expect(screen.getByText('Sample Information')).toBeInTheDocument();

          //Sample information
          //only one sample page
          expect(screen.getAllByTestId('sample-info-div')).toHaveLength(1);
          expect(screen.getByTestId('External Identifier')).toBeInTheDocument();

          expect(screen.getByTestId('Spatial Location')).toBeInTheDocument();
          //spatial location is disabled
          const spatialLocation = getSelect('Spatial Location');
          expect(spatialLocation).toBeDisabled();

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
      beforeEach(async () => {
        await act(async () => {
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
      it('displays sample collection date field on fetal life stage', async () => {
        await waitFor(() => {
          fireEvent.click(screen.getByTestId('fetal'));
          expect(screen.queryByText('Sample Collection Date')).toBeInTheDocument();
        });
      });
      it('enables HumFre field on entering Species', async () => {
        await waitFor(async () => {
          const speciesCombo = getSelect('Species');
          await userEvent.type(speciesCombo, 'Human{enter}');
          const humFreCombo = getSelect('HuMFre');
          expect(humFreCombo).toBeEnabled();
        });
      });
    });

    describe('Button clicks', () => {
      beforeEach(async () => {
        window.HTMLElement.prototype.scrollIntoView = jest.fn();

        jest.mock('../../../../src/lib/hooks', () => ({
          useScrollToRef: jest.fn().mockImplementation(() => {
            return {
              scrollToRef: jest.fn(),
              ref: null
            };
          })
        }));
        await act(async () => {
          renderOriginalRegistrationForm();
          await userEvent.type(getSelect('Tissue Type'), 'Liver{enter}');
          //await userEvent.type(getSelect('Spatial Location'), '1 - Cortex{enter}');
          fireEvent.keyDown(getSelect('Spatial Location'), { keyCode: 40 });

          //Selects the dropdown option and close the dropdown options list
          const option = screen.getByText('1 - Cortex');
          expect(option).toBeInTheDocument();
          fireEvent.click(option);
          await screen.getByRole('button', { name: '+ Add Identical Tissue Sample' }).click();
        });
      });
      it('On "Add Identical Tissue Sample" button click', async () => {
        await waitFor(async () => {
          //Two sample pages
          expect(screen.getAllByTestId('sample-info-div')).toHaveLength(2);
          const sampleDiv = screen.getAllByTestId('sample-info-div')[0];
          const spatialLocationDiv = within(sampleDiv).getByTestId('Spatial Location');
          const saptialDropDown = within(spatialLocationDiv).getByRole('combobox', { hidden: true });
          expect(saptialDropDown).toHaveTextContent('1 - Cortex');
          expect(screen.getAllByRole('button', { name: 'Delete Sample' })).toHaveLength(2);
        });
      });
      it('On "Delete Sample" button click', async () => {
        await screen.getAllByRole('button', { name: 'Delete Sample' })[0].click();
        //One sample pages
        await waitFor(async () => {
          expect(screen.getAllByTestId('sample-info-div')).toHaveLength(1);
          expect(screen.queryByRole('button', { name: 'Delete Sample' })).not.toBeInTheDocument();
        });
      });
    });
  });
  /*describe('Block registration', () => {
    beforeEach(() => {
      jest.mock('formik', () => ({
        useFormikContext: jest.fn().mockImplementation(() => {
          return {
            setFieldValue: jest.fn(),
            errors: undefined,
            values: { tissues: [getRegistrationFormTissue()], workNumbers: [] }
          };
        })
      }));
    });
    describe('on Mount', () => {
      it('displays all required fields', async () => {
        act(() => {
          renderBlockRegistrationForm();
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

          //humfre
          expect(screen.getByTestId('HuMFre')).toBeInTheDocument();
          //humfre is disabled
          const humfre = getSelect('HuMFre');
          expect(humfre).toBeDisabled();

          expect(screen.getByRole('combobox', { name: 'Tissue Type' })).toBeInTheDocument();
          expect(screen.getByText('Block Information')).toBeInTheDocument();

          //Sample information
          //only one sample page
          expect(screen.getAllByTestId('sample-info-div')).toHaveLength(1);
          expect(screen.getByTestId('External Identifier')).toBeInTheDocument();

          expect(screen.getByTestId('Spatial Location')).toBeInTheDocument();
          //spatial location is disabled
          const spatialLocation = getSelect('Spatial Location');
          expect(spatialLocation).toBeDisabled();

          expect(screen.getByTestId('Replicate Number')).toBeInTheDocument();
          expect(screen.getByRole('combobox', { name: 'Labware Type' })).toBeInTheDocument();

          //Embedding Information
          expect(screen.getByText('Embedding Information')).toBeInTheDocument();
          expect(screen.getByRole('combobox', { name: 'Fixative' })).toBeInTheDocument();
          expect(screen.getByRole('combobox', { name: 'Medium' })).toBeInTheDocument();

          //buttons
          expect(screen.getByRole('button', { name: '+ Add Another Tissue Block' })).toBeInTheDocument();
          expect(screen.getByRole('button', { name: '+ Add Another Tissue' })).toBeInTheDocument();
          expect(screen.getByRole('button', { name: 'Register' })).toBeInTheDocument();
          expect(screen.queryByRole('button', { name: 'Delete Block' })).not.toBeInTheDocument();
        });
      });
    });
    describe('field properties change', () => {
      beforeEach(async () => {
        await act(async () => {
          renderBlockRegistrationForm();
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
      it('displays sample collection date field on fetal life stage', async () => {
        await waitFor(() => {
          fireEvent.click(screen.getByTestId('fetal'));
          expect(screen.queryByText('Sample Collection Date')).toBeInTheDocument();
        });
      });
      it('enables HumFre field on entering Species', async () => {
        await waitFor(async () => {
          const speciesCombo = getSelect('Species');
          await userEvent.type(speciesCombo, 'Human{enter}');
          const humFreCombo = getSelect('HuMFre');
          expect(humFreCombo).toBeEnabled();
        });
      });
    });

    describe('Button clicks', () => {
      beforeEach(async () => {
        window.HTMLElement.prototype.scrollIntoView = jest.fn();

        jest.mock('../../../../src/lib/hooks', () => ({
          useScrollToRef: jest.fn().mockImplementation(() => {
            return {
              scrollToRef: jest.fn(),
              ref: null
            };
          })
        }));
        await act(async () => {
          renderBlockRegistrationForm();
          await screen.getByRole('button', { name: '+ Add Another Tissue Block' }).click();
        });
      });
      it('On "Add Identical Tissue Block" button click', async () => {
        await waitFor(async () => {
          //Two sample pages
          expect(screen.getAllByTestId('sample-info-div')).toHaveLength(2);
          expect(screen.getAllByRole('button', { name: 'Delete Block' })).toHaveLength(2);
        });
      });
      it('On "Delete Block" button click', async () => {
        await screen.getAllByRole('button', { name: 'Delete Block' })[0].click();
        //Two sample pages
        await waitFor(async () => {
          expect(screen.getAllByTestId('sample-info-div')).toHaveLength(1);
          expect(screen.queryByRole('button', { name: 'Delete Block' })).not.toBeInTheDocument();
        });
      });
    });
  });*/
});
