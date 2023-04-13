import { act, screen, render, cleanup, waitFor, fireEvent, within } from '@testing-library/react';
import { GetRegistrationInfoQuery, LabwareType } from '../../../../src/types/sdk';
import solutionRepository from '../../../../src/mocks/repositories/solutionRepository';
import hmdmcRepository from '../../../../src/mocks/repositories/hmdmcRepository';
import fixativeRepository from '../../../../src/mocks/repositories/fixativeRepository';
import speciesRepository from '../../../../src/mocks/repositories/speciesRepository';
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
  tissueTypes: [
    {
      name: 'Kidney',
      spatialLocations: [
        { name: 'Cortex', code: 1 },
        { name: 'Medulla', code: 2 }
      ]
    }
  ],
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

    describe('Add Identical Tissue button click', () => {
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
          //Fill the form before adding identical tissue
          await userEvent.click(screen.getByTestId('adult'));
          await userEvent.type(getSelect('Species'), 'Human{enter}');
          await userEvent.type(getSelect('HuMFre'), 'HuMFre1{enter}');
          await userEvent.type(screen.getByTestId('External Identifier'), 'EXT-1{enter}');
          await userEvent.type(getSelect('Tissue Type'), 'Kidney{enter}');
          await userEvent.type(getSelect('Spatial Location'), 'Cortex{enter}');
          await userEvent.type(getSelect('Labware Type'), 'Cassette{enter}');
          await userEvent.type(screen.getByTestId('Replicate Number'), '1');
          await userEvent.type(getSelect('Fixative'), 'Formalin{enter}');
          await userEvent.type(getSelect('Solution'), 'Ethanol{enter}');
          await screen.getByRole('button', { name: '+ Add Identical Tissue Sample' }).click();
        });
      });
      it('creates another identical  sample', () => {
        //Two sample pages
        expect(screen.getAllByTestId('sample-info-div')).toHaveLength(2);
      });
      it('displays Delete sample button', async () => {
        expect(screen.getAllByRole('button', { name: 'Delete Sample' })).toHaveLength(2);
      });
      it('populates the value of Spatial location from the tissue sample created', () => {
        const sampleDiv = screen.getAllByTestId('sample-info-div')[1];
        const slDiv = within(sampleDiv).getAllByTestId('Spatial Location');
        expect(slDiv[0]).toHaveTextContent('1 - Cortex');
      });
      it('populates the value of LabwareType from the tissue sample created', () => {
        const sampleDiv = screen.getAllByTestId('sample-info-div')[1];
        const slDiv = within(sampleDiv).getAllByTestId('Labware Type');
        expect(slDiv[0]).toHaveTextContent('Cassette');
      });
      it('should display all other fields as empty', () => {
        const sampleDiv = screen.getAllByTestId('sample-info-div')[1];
        const extId = within(sampleDiv).getByTestId('External Identifier');
        expect(extId).toHaveTextContent('');

        const replicateDiv = within(sampleDiv).getByTestId('Replicate Number');
        expect(replicateDiv).toHaveTextContent('');

        const fixativeDiv = within(sampleDiv).getAllByTestId('Fixative');
        expect(fixativeDiv[0]).not.toHaveTextContent('Formalin');

        const solutionDiv = within(sampleDiv).getAllByTestId('Solution');
        expect(solutionDiv[0]).not.toHaveTextContent('Ethanol');
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
  describe('Block registration', () => {
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
          expect(screen.getByTestId('Last Known Section Number')).toBeInTheDocument();
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
          //Fill the form before adding tissue
          await userEvent.click(screen.getByTestId('adult'));
          await userEvent.type(getSelect('Species'), 'Human{enter}');
          await userEvent.type(getSelect('HuMFre'), 'HuMFre1{enter}');
          await userEvent.type(screen.getByTestId('External Identifier'), 'EXT-1{enter}');
          await userEvent.type(getSelect('Tissue Type'), 'Kidney{enter}');
          await userEvent.type(getSelect('Spatial Location'), 'Cortex{enter}');
          await userEvent.type(getSelect('Labware Type'), 'Cassette{enter}');
          await userEvent.type(screen.getByTestId('Replicate Number'), '1');
          await userEvent.type(getSelect('Fixative'), 'Formalin{enter}');
          await userEvent.type(getSelect('Medium'), 'OCT{enter}');
          await screen.getByRole('button', { name: '+ Add Another Tissue Block' }).click();
        });
      });
      it('creates another block', () => {
        //Two sample pages
        expect(screen.getAllByTestId('sample-info-div')).toHaveLength(2);
      });
      it('displays Delete block button', async () => {
        expect(screen.getAllByRole('button', { name: 'Delete Block' })).toHaveLength(2);
      });
      it('should display all fields in new block as empty', () => {
        const sampleDiv = screen.getAllByTestId('sample-info-div')[1];

        const slDiv = within(sampleDiv).getAllByTestId('Spatial Location');
        expect(slDiv[0]).not.toHaveTextContent('Cortex');

        const extId = within(sampleDiv).getByTestId('External Identifier');
        expect(extId).toHaveTextContent('');

        const lwTypeDiv = within(sampleDiv).getAllByTestId('Labware Type');
        expect(lwTypeDiv[0]).not.toHaveTextContent('Cassette');

        const replicateDiv = within(sampleDiv).getByTestId('Replicate Number');
        expect(replicateDiv).toHaveTextContent('');

        const fixativeDiv = within(sampleDiv).getAllByTestId('Fixative');
        expect(fixativeDiv[0]).not.toHaveTextContent('Formalin');

        const mediumDiv = within(sampleDiv).getAllByTestId('Medium');
        expect(mediumDiv[0]).not.toHaveTextContent('OCT');
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
  });
});
