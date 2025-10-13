import { cleanup, render, screen, waitFor, within } from '@testing-library/react';
import { GetRegistrationInfoQuery, LabwareType, LifeStage } from '../../../../src/types/sdk';
import solutionRepository from '../../../../src/mocks/repositories/solutionRepository';
import hmdmcRepository from '../../../../src/mocks/repositories/hmdmcRepository';
import fixativeRepository from '../../../../src/mocks/repositories/fixativeRepository';
import speciesRepository from '../../../../src/mocks/repositories/speciesRepository';
import { labwareTypes } from '../../../../src/lib/factories/labwareTypeFactory';
import { LabwareTypeName } from '../../../../src/types/stan';
import {
  getRegistrationFormTissueSample,
  RegistrationFormOriginalSample
} from '../../../../src/pages/OriginalSampleRegistration';
import { Formik } from 'formik';
import RegistrationForm from '../../../../src/pages/registration/RegistrationForm';
import React from 'react';
import { getRegistrationFormTissue, RegistrationFormTissue } from '../../../../src/pages/BlockRegistration';
import slotRegionRepository from '../../../../src/mocks/repositories/slotRegionRepository';
import '@testing-library/jest-dom';
import bioRiskRepository from '../../../../src/mocks/repositories/bioRiskRepository';
import userEvent from '@testing-library/user-event';
import { selectOption } from '../../../generic/utilities';
import cellClassRepository from '../../../../src/mocks/repositories/cellClassRepository';
import { HUMAN_NAME } from '../../../../src/lib/constants';

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
  labwareTypes: [labwareTypes[LabwareTypeName.CASSETTE].build(), labwareTypes[LabwareTypeName.PROVIASETTE].build()],
  slotRegions: slotRegionRepository.findAll(),
  bioRisks: bioRiskRepository.findAll().filter((bioRisk) => bioRisk.enabled),
  cellClasses: cellClassRepository.findAll().filter((cellClass) => cellClass.enabled)
};
const availableLabwareTypes: LabwareType[] = registrationInfo.labwareTypes;

const tissues: RegistrationFormOriginalSample = {
  clientId: Date.now(),
  donorId: '',
  species: 'HuMFre1',
  lifeStage: LifeStage.Fetal,
  hmdmc: '',
  cellClass: '',
  tissueType: 'Kidney',
  blocks: [
    {
      clientId: Date.now(),
      spatialLocation: 1,
      labwareType: 'Cassette',
      fixative: 'Formalin',
      solution: 'Ethanol',
      externalIdentifier: 'EXT-1',
      replicateNumber: '1',
      lastKnownSectionNumber: 0,
      medium: 'Medium1'
    }
  ],
  sampleCollectionDate: '',
  workNumber: '',
  bioRiskCode: ''
};

afterEach(() => {
  cleanup();
});

const renderOriginalRegistrationForm = (tissues?: RegistrationFormOriginalSample) => {
  const keywords = new Map()
    .set('Block', 'Sample')
    .set('Embedding', 'Solution')
    .set('Optional', ['Replicate Number', 'External Identifier']);
  return render(
    <div>
      <Formik
        initialValues={{
          tissues: [tissues ?? getRegistrationFormTissueSample()],
          workNumbers: []
        }}
        onSubmit={() => {}}
      >
        <RegistrationForm
          registrationInfo={registrationInfo}
          availableLabwareTypes={availableLabwareTypes}
          defaultFormTissueValues={tissues ?? getRegistrationFormTissueSample()}
          keywordsMap={keywords}
        />
      </Formik>
    </div>
  );
};
const renderBlockRegistrationForm = (tissues?: RegistrationFormTissue) => {
  return render(
    <div>
      <Formik
        initialValues={{
          tissues: [tissues ?? getRegistrationFormTissue()],
          workNumbers: []
        }}
        onSubmit={() => {}}
      >
        <RegistrationForm
          registrationInfo={registrationInfo}
          availableLabwareTypes={availableLabwareTypes}
          defaultFormTissueValues={tissues ?? getRegistrationFormTissue()}
        />
      </Formik>
    </div>
  );
};

function getSelect(dataTestId: string) {
  const selectDiv = screen.getByTestId(dataTestId);
  return within(selectDiv).getByRole('combobox', { hidden: true });
}

const mockUseFormikContext = jest.fn(() => ({
  setFieldTouched: jest.fn(),
  setFieldValue: jest.fn(),
  errors: undefined,
  values: { tissues: [getRegistrationFormTissueSample()], workNumbers: [] }
}));

jest.mock('formik', () => {
  const originalModule = jest.requireActual('formik');
  return {
    ...originalModule,
    useFormikContext: () => mockUseFormikContext()
  };
});

afterEach(() => {
  jest.clearAllMocks();
  cleanup();
});

beforeAll(() => {
  window.HTMLElement.prototype.scrollIntoView = jest.fn();
});

describe('RegistrationForm', () => {
  describe('Original registration', () => {
    describe('on Mount', () => {
      beforeAll(() => {
        renderOriginalRegistrationForm();
      });
      it('displays all required fields', async () => {
        expect(screen.getByText('Donor Information')).toBeInTheDocument();
        expect(screen.getByLabelText('Donor ID')).toBeInTheDocument();

        //Fetal should be selected by default in life stage
        expect(screen.getByText('Life Stage')).toBeInTheDocument();
        expect(screen.getByTestId('n/a')).toBeInTheDocument();
        expect(screen.getByTestId('adult')).toBeChecked();

        expect(screen.getByRole('combobox', { name: 'Species' })).toBeInTheDocument();

        expect(screen.getByRole('combobox', { name: 'Cellular Classification' })).toBeInTheDocument();

        //Tissue Information
        expect(screen.getByText('Tissue Information')).toBeInTheDocument();
        expect(screen.getByRole('combobox', { name: 'Biological Risk Assessment Numbers' })).toBeInTheDocument();

        await waitFor(() => screen.getByText('HuMFre'));
        expect(screen.getByText('HuMFre')).toBeInTheDocument();

        //humfre is disabled
        const humfre = getSelect('HuMFre');
        expect(humfre).toBeDisabled();

        expect(screen.getByTestId('Tissue Type')).toBeInTheDocument();

        //Sample information
        expect(screen.getByText('Sample Information')).toBeInTheDocument();

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

    describe('field properties change', () => {
      describe('when life stage is set to Fetal', () => {
        beforeAll(() => {
          const fetalTissue = getRegistrationFormTissueSample();
          fetalTissue.lifeStage = LifeStage.Fetal;
          mockUseFormikContext.mockReturnValue({
            setFieldTouched: jest.fn(),
            setFieldValue: jest.fn(),
            errors: undefined,
            values: { tissues: [fetalTissue], workNumbers: [] }
          });
          renderOriginalRegistrationForm();
        });
        it('displays sample collection date field on fetal life stage', async () => {
          await userEvent.click(screen.getByTestId('fetal'));
          expect(screen.getByTestId('fetal')).toBeChecked();
          expect(screen.getByText('Sample Collection Date')).toBeInTheDocument();
        });
      });
      describe('when Species is set to Human', () => {
        beforeAll(() => {
          const humanTissue = getRegistrationFormTissueSample();
          humanTissue.species = HUMAN_NAME;
          mockUseFormikContext.mockReturnValue({
            setFieldTouched: jest.fn(),
            setFieldValue: jest.fn(),
            errors: undefined,
            values: { tissues: [humanTissue], workNumbers: [] }
          });
          renderOriginalRegistrationForm();
        });
        it('enables HumFre field', async () => {
          await selectOption('Species', HUMAN_NAME);
          expect(getSelect('HuMFre')).toBeEnabled();
        });
      });
    });

    describe('Add Identical Tissue button click', () => {
      beforeAll(() => {
        tissues.blocks = [tissues.blocks[0], tissues.blocks[0]];
        mockUseFormikContext.mockReturnValue({
          setFieldTouched: jest.fn(),
          setFieldValue: jest.fn(),
          errors: undefined,
          values: { tissues: [tissues], workNumbers: [] }
        });
        renderOriginalRegistrationForm(tissues);
      });
      it('creates another identical  sample', async () => {
        //Two sample pages
        expect(screen.getAllByTestId('sample-info-div')).toHaveLength(2);
        //Displays Delete sample button'
        expect(screen.getAllByRole('button', { name: 'Delete Sample' })).toHaveLength(2);
        //Populates the value of Spatial location from the tissue sample created'
        const sampleDiv = screen.getAllByTestId('sample-info-div')[1];
        const slDiv = within(sampleDiv).getAllByTestId('Spatial Location');
        expect(slDiv[0]).toHaveTextContent('1 - Cortex');
        //Populates the value of LabwareType from the tissue sample created
        const lwDiv = within(sampleDiv).getAllByTestId('Labware Type');
        expect(lwDiv[0]).toHaveTextContent('Cassette');
        //Should display all other fields as empty'
        const extId = within(sampleDiv).getByTestId('External Identifier');
        expect(extId).toHaveTextContent('');
        const replicateDiv = within(sampleDiv).getByTestId('Replicate Number');
        expect(replicateDiv).toHaveTextContent('');
        const fixativeDiv = within(sampleDiv).getAllByTestId('Fixative');
        expect(fixativeDiv[0]).toHaveTextContent('Formalin');
        const solutionDiv = within(sampleDiv).getAllByTestId('Solution');
        expect(solutionDiv[0]).toHaveTextContent('Ethanol');
      });
    });

    describe('On "Delete Sample" button click', () => {
      beforeAll(() => {
        tissues.blocks = [tissues.blocks[0]];
        mockUseFormikContext.mockReturnValue({
          setFieldTouched: jest.fn(),
          setFieldValue: jest.fn(),
          errors: undefined,
          values: { tissues: [tissues], workNumbers: [] }
        });
        renderOriginalRegistrationForm(tissues);
      });
      it('removes the sample', async () => {
        expect(screen.getAllByTestId('sample-info-div')).toHaveLength(1);
        expect(screen.queryByRole('button', { name: 'Delete Sample' })).not.toBeInTheDocument();
      });
    });
  });

  describe('Block registration', () => {
    describe('on Mount', () => {
      beforeAll(() => {
        renderBlockRegistrationForm();
      });
      it('displays all required fields', () => {
        //Donor Information
        expect(screen.getByText('Donor Information')).toBeInTheDocument();
        expect(screen.getByLabelText('Donor ID')).toBeInTheDocument();
        //Fetal should be selected by default in life stage
        expect(screen.getByText('Life Stage')).toBeInTheDocument();
        expect(screen.getByTestId('adult')).toBeChecked();
        expect(screen.getByRole('combobox', { name: 'Species' })).toBeInTheDocument();

        //Tissue Information
        expect(screen.getByText('Tissue Information')).toBeInTheDocument();
        expect(screen.getByText('HuMFre')).toBeInTheDocument();
        expect(screen.getByRole('combobox', { name: 'Biological Risk Assessment Numbers' })).toBeInTheDocument();

        //humfre
        expect(screen.getByTestId('HuMFre')).toBeInTheDocument();
        //humfre is disabled
        const humfre = getSelect('HuMFre');
        expect(humfre).toBeDisabled();

        expect(screen.getByTestId('Tissue Type')).toBeInTheDocument();
        expect(screen.getByText('Block Information')).toBeInTheDocument();

        //Sample information
        //only one sample page
        expect(screen.getAllByTestId('sample-info-div')).toHaveLength(1);
        expect(screen.getByTestId('External Identifier')).toBeInTheDocument();

        expect(screen.getByTestId('Spatial Location')).toBeInTheDocument();
        //spatial location is disabled
        expect(screen.getByTestId('Spatial Location')).toBeEnabled();

        expect(screen.getByTestId('Replicate Number')).toBeInTheDocument();
        expect(screen.getByTestId('Last Known Section Number')).toBeInTheDocument();
        expect(screen.getByTestId('Labware Type')).toBeInTheDocument();

        //Embedding Information
        expect(screen.getByText('Embedding Information')).toBeInTheDocument();
        expect(screen.getByTestId('Fixative')).toBeInTheDocument();
        expect(screen.getByTestId('Medium')).toBeInTheDocument();

        //buttons
        expect(screen.getByRole('button', { name: '+ Add Another Tissue Block' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: '+ Add Another Tissue' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Register' })).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Delete Block' })).not.toBeInTheDocument();
      });
    });

    describe('Button clicks', () => {
      beforeAll(() => {
        tissues.blocks = [tissues.blocks[0], tissues.blocks[0]];
        mockUseFormikContext.mockReturnValue({
          setFieldTouched: jest.fn(),
          setFieldValue: jest.fn(),
          errors: undefined,
          values: { tissues: [tissues], workNumbers: [] }
        });
        renderBlockRegistrationForm();
      });
      it('creates another block', async () => {
        await waitFor(() => screen.getByRole('button', { name: '+ Add Another Tissue Block' }).click());

        //Two sample pages
        expect(screen.getAllByTestId('sample-info-div')).toHaveLength(2);
        expect(screen.getAllByRole('button', { name: 'Delete Block' })).toHaveLength(2);
        //Check for newly created sample values
        const sampleDiv = screen.getAllByTestId('sample-info-div')[1];

        const slDiv = within(sampleDiv).getAllByTestId('Spatial Location');
        expect(slDiv[0]).toHaveTextContent('Cortex');

        const extId = within(sampleDiv).getByTestId('External Identifier');
        expect(extId).toHaveTextContent('');

        const lwTypeDiv = within(sampleDiv).getAllByTestId('Labware Type');
        expect(lwTypeDiv[0]).toHaveTextContent('Cassette');

        const mediumDiv = within(sampleDiv).getByTestId('Medium');
        expect(mediumDiv).not.toHaveTextContent('OCT');
      });
    });
  });
});
