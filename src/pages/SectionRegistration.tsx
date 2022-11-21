import React, { useContext, useEffect, useMemo, useRef } from 'react';
import AppShell from '../components/AppShell';
import { Formik } from 'formik';
import SectionRegistrationForm from './registration/SectionRegistrationForm';
import columns from '../components/dataTableColumns/labwareColumns';
import RegistrationSuccess from './registration/RegistrationSuccess';
import Warning from '../components/notifications/Warning';
import { GetRegistrationInfoQuery, LifeStage, RegisterSectionsMutation, SectionRegisterRequest } from '../types/sdk';
import { LabwareTypeName } from '../types/stan';
import _, { uniqueId } from 'lodash';
import RegistrationValidation from '../lib/validation/registrationValidation';
import * as Yup from 'yup';
import { useMachine } from '@xstate/react';
import createFormMachine from '../lib/machines/form/formMachine';
import { parseQueryString } from '../lib/helpers';
import { history, StanCoreContext } from '../lib/sdk';
import { useLocation } from 'react-router-dom';

const availableLabware: Array<LabwareTypeName> = [
  LabwareTypeName.SLIDE,
  LabwareTypeName.VISIUM_LP,
  LabwareTypeName.VISIUM_TO,
  LabwareTypeName.FOUR_SLOT_SLIDE,
  LabwareTypeName.TUBE
];

type SectionRegistrationFormSection = {
  clientId: string;
  donorId: string;
  lifeStage: LifeStage;
  species: string;
  hmdmc: string;
  tissueType: string;
  externalIdentifier: string;
  spatialLocation: number;
  replicateNumber: string;
  sectionNumber: number;
  sectionThickness: number;
};

type SectionRegistrationFormLabware = {
  clientId: string;
  labwareTypeName: LabwareTypeName;
  externalLabwareBarcode: string;
  fixative: string;
  medium: string;
  slots: { [key: string]: Array<SectionRegistrationFormSection> };
};

export type SectionRegistrationFormValues = {
  labwares: Array<SectionRegistrationFormLabware>;
};

function buildSectionRegisterRequest(values: SectionRegistrationFormValues): SectionRegisterRequest {
  return {
    labware: values.labwares.map((labware) => {
      return {
        externalBarcode: labware.externalLabwareBarcode.trim(),
        labwareType: labware.labwareTypeName.trim(),
        contents: Object.keys(labware.slots).flatMap((address) => {
          return labware.slots[address].map((sample) => ({
            address,
            donorIdentifier: sample.donorId.trim(),
            externalIdentifier: sample.externalIdentifier.trim(),
            fixative: labware.fixative.trim(),
            hmdmc: sample.hmdmc.trim(),
            lifeStage: sample.lifeStage,
            medium: labware.medium.trim(),
            replicateNumber: sample.replicateNumber,
            sectionNumber: sample.sectionNumber,
            sectionThickness: sample.sectionThickness,
            spatialLocation: sample.spatialLocation,
            species: sample.species.trim(),
            tissueType: sample.tissueType.trim()
          }));
        })
      };
    })
  };
}

function buildInitialFormValues(initialLabwareType: LabwareTypeName) {
  return {
    labwares: [buildLabware(initialLabwareType)]
  };
}

function buildLabware(labwareTypeName: LabwareTypeName): SectionRegistrationFormLabware {
  return {
    clientId: uniqueId('labware_id'),
    labwareTypeName,
    externalLabwareBarcode: '',
    fixative: '',
    medium: '',
    slots: { A1: [buildSample()] }
  };
}

function buildSample(): SectionRegistrationFormSection {
  return {
    clientId: uniqueId('sample_id'),
    donorId: '',
    lifeStage: LifeStage.Adult,
    species: '',
    hmdmc: '',
    tissueType: '',
    externalIdentifier: '',
    spatialLocation: 0,
    replicateNumber: '',
    sectionNumber: 0,
    sectionThickness: 0
  };
}

function buildValidationSchema(registrationInfo: GetRegistrationInfoQuery) {
  const validation = new RegistrationValidation(registrationInfo);
  return Yup.object().shape({
    labwares: Yup.array()
      .min(1)
      .of(
        Yup.object().shape({
          externalLabwareBarcode: validation.externalLabwareBarcode,
          fixative: validation.fixative,
          medium: validation.medium,
          slots: Yup.lazy((obj: any) => {
            return Yup.object(
              _.mapValues(obj, (_value, _key) =>
                Yup.array().of(
                  Yup.object().shape({
                    donorId: validation.donorId,
                    lifeStage: validation.lifeStage,
                    species: validation.species,
                    hmdmc: validation.hmdmc,
                    tissueType: validation.tissueType,
                    externalIdentifier: validation.sectionExternalIdentifier,
                    spatialLocation: validation.spatialLocation,
                    replicateNumber: validation.replicateNumber,
                    sectionNumber: validation.sectionNumber,
                    sectionThickness: validation.sectionThickness
                  })
                )
              )
            );
          })
        })
      )
  });
}

const defaultSectionRegistrationContext = {
  buildSample,
  buildLabware,
  availableLabware: availableLabware,
  isSubmitting: false
};

export const SectionRegistrationContext = React.createContext(defaultSectionRegistrationContext);

interface PageParams {
  registrationInfo: GetRegistrationInfoQuery;
}

export const SectionRegistration: React.FC<PageParams> = ({ registrationInfo }) => {
  const location = useLocation();
  const stanCore = useContext(StanCoreContext);

  const formMachine = React.useMemo(() => {
    return createFormMachine<SectionRegisterRequest, RegisterSectionsMutation>().withConfig({
      services: {
        submitForm: (ctx, e) => {
          if (e.type !== 'SUBMIT_FORM') return Promise.reject();
          return stanCore.RegisterSections({ request: e.values });
        }
      }
    });
  }, [stanCore]);
  const [current, send] = useMachine(() => formMachine);

  const initialLabware = useMemo(() => {
    const queryString = parseQueryString(location.search);
    if (
      typeof queryString['initialLabware'] === 'string' &&
      availableLabware.includes(queryString['initialLabware'] as LabwareTypeName)
    ) {
      return queryString['initialLabware'] as LabwareTypeName;
    }
  }, [location]);

  const initialValues = useMemo(() => {
    if (initialLabware) {
      return buildInitialFormValues(initialLabware);
    }
  }, [initialLabware]);

  const validationSchema = useMemo(() => buildValidationSchema(registrationInfo), [registrationInfo]);

  const warningRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    warningRef.current?.scrollIntoView({ behavior: 'smooth' });
  });

  const { serverError, submissionResult } = current.context;
  const submitForm = async (values: SectionRegistrationFormValues) =>
    send({ type: 'SUBMIT_FORM', values: buildSectionRegisterRequest(values) });
  const isSubmitting = !current.matches('fillingOutForm');

  if (current.matches('submitted') && submissionResult) {
    return (
      <RegistrationSuccess
        successData={submissionResult.registerSections.labware}
        columns={[columns.barcode(), columns.labwareType()]}
      />
    );
  }

  return (
    <AppShell>
      <AppShell.Header>
        <AppShell.Title>Section Registration</AppShell.Title>
      </AppShell.Header>
      <AppShell.Main>
        <div className="max-w-screen-xl mx-auto">
          {!initialLabware && (
            <div className="my-4 mx-4 max-w-screen-sm sm:mx-auto p-4 rounded-md bg-gray-100">
              <p className="my-3 text-gray-800 text-sm leading-normal">Pick a type of labware to begin:</p>

              <div className="flex flex-row items-center justify-center gap-4">
                <select
                  onChange={(e) =>
                    history.replace({
                      search: `?initialLabware=${e.target.value}`
                    })
                  }
                  className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-sdb-100 focus:border-sdb-100 md:w-1/2"
                >
                  <option value="" />
                  {availableLabware.map((labwareTypeName) => (
                    <option key={labwareTypeName} value={labwareTypeName}>
                      {labwareTypeName}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {serverError && (
            <div className="my-4" ref={warningRef}>
              <Warning error={serverError} message={'There was a problem registering your slides'} />
            </div>
          )}

          {initialValues && (
            <SectionRegistrationContext.Provider value={{ ...defaultSectionRegistrationContext, isSubmitting }}>
              <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                validateOnChange={false}
                validateOnBlur={true}
                onSubmit={submitForm}
              >
                <SectionRegistrationForm registrationInfo={registrationInfo} />
              </Formik>
            </SectionRegistrationContext.Provider>
          )}
        </div>
      </AppShell.Main>
    </AppShell>
  );
};

export default SectionRegistration;
