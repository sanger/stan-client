import React, { useEffect, useRef } from 'react';
import AppShell from '../../components/AppShell';
import Warning from '../../components/notifications/Warning';
import RegistrationForm, { TextType } from './RegistrationForm';
import { Formik } from 'formik';
import ClashModal from './ClashModal';
import {
  GetRegistrationInfoQuery,
  LabwareFieldsFragment,
  LabwareType,
  RegisterResultFieldsFragment
} from '../../types/sdk';
import * as Yup from 'yup';
import { useMachine } from '@xstate/react';
import RegistrationSuccess, { LabwareContainType } from './RegistrationSuccess';
import { useConfirmLeave } from '../../lib/hooks';
import { Column } from 'react-table';
import { createRegistrationMachine } from '../../lib/machines/registration/registrationMachine';
import { motion } from '../../dependencies/motion';
import variants from '../../lib/motionVariants';
import Heading from '../../components/Heading';
import WorkNumberSelect from '../../components/WorkNumberSelect';
import PromptOnLeave from '../../components/notifications/PromptOnLeave';
import { FormikErrorMessage } from '../../components/forms';

/**
 * Expect form input interface
 */
interface FormInput<T> {
  tissues: T[];
  workNumbers: string[];
}

/**
 * Expected Tissue value interfcae
 */
export interface TissueValues<B> {
  blocks: B[];
}

interface RegistrationParams<M, T, R extends Object> {
  /**
   * Title to be displayed in the page
   * **/
  title: string;
  /**
   * Labware types available for registration
   */
  availableLabwareTypes: LabwareType[];
  /**
   * Registration information like available species,fixatives etc
   */
  registrationInfo: GetRegistrationInfoQuery;

  /**
   * Default values for Tissue
   */
  defaultFormTissueValues: T;

  /**
   * Handler to convert form input data to the format that mutation api expects
   * @param formInput
   * @param existingTissues
   */
  buildRegistrationInput: (formInput: FormInput<T>, existingTissues?: Array<string>) => Promise<M>;
  /**
   * Service to call for registration
   * @param mutationInput
   */
  registrationService: (mutationInput: M) => Promise<RegisterResultFieldsFragment>;
  /**
   * Validation schema for form input
   */
  registrationValidationSchema: Yup.ObjectSchema<any>;

  /**
   * Columns to display on succesful registration
   */
  successDisplayTableColumns: Column<R>[];

  formatSuccessData: (registrationResult: RegisterResultFieldsFragment) => R[];

  /**
   * Change in default keywords to display
   */
  keywordsMap?: Map<TextType, string>;
  isBlock?: boolean;
}

/**
 * M - Represents mutation data structure
 * T - Tissue data structure
 * B - Block data structure
 * R - Mutation result data
 **/

function Registration<M, T extends TissueValues<B>, B, R extends Required<LabwareContainType> | LabwareFieldsFragment>({
  title,
  availableLabwareTypes,
  registrationInfo,
  buildRegistrationInput,
  registrationService,
  registrationValidationSchema,
  successDisplayTableColumns,
  formatSuccessData,
  defaultFormTissueValues,
  keywordsMap,
  isBlock = false
}: RegistrationParams<M, T, R>) {
  const registrationMachine = React.useMemo(() => {
    return createRegistrationMachine<FormInput<T>, M>(buildRegistrationInput, registrationService);
  }, [buildRegistrationInput, registrationService]);
  const [current, send, service] = useMachine(registrationMachine);
  const [shouldConfirm, setShouldConfirm] = useConfirmLeave(true);
  useEffect(() => {
    const subscription = service.subscribe((state) => {
      if (state.matches('complete')) {
        setShouldConfirm(false);
      }
    });
    return subscription.unsubscribe;
  }, [service, setShouldConfirm]);

  const warningRef = useRef<HTMLDivElement>(null);
  // Scroll the error notification into view if it appears
  useEffect(() => {
    warningRef.current?.scrollIntoView({ behavior: 'smooth' });
  });

  const initialValues = {
    tissues: [defaultFormTissueValues],
    workNumbers: []
  };
  const { registrationResult, registrationErrors } = current.context;
  const formIsReady = ['ready', 'submitting', 'clashed', 'submissionError'].some((val) => current.matches(val));

  if (current.matches('complete') && registrationResult) {
    return (
      <RegistrationSuccess<R>
        successData={formatSuccessData(registrationResult)}
        columns={successDisplayTableColumns}
        labware={registrationResult.labware}
      />
    );
  }

  return (
    <AppShell>
      <AppShell.Header>
        <AppShell.Title>{title}</AppShell.Title>
      </AppShell.Header>
      <AppShell.Main>
        <div className="max-w-screen-xl mx-auto">
          <PromptOnLeave when={shouldConfirm} message={'You have unsaved changes. Are you sure you want to leave?'} />
          {registrationErrors && (
            <div ref={warningRef}>
              <Warning message={'There was a problem registering your tissues'}>
                <ul className="list-disc list-inside">
                  {registrationErrors.problems.map((problem, index) => {
                    return <li key={index}>{problem}</li>;
                  })}
                </ul>
              </Warning>
            </div>
          )}

          {formIsReady && (
            <Formik<FormInput<T>>
              initialValues={initialValues}
              validationSchema={registrationValidationSchema}
              validateOnChange={false}
              validateOnBlur={true}
              onSubmit={async (values) => send({ type: 'SUBMIT_FORM', values })}
            >
              {({ values, setFieldValue }) => (
                <>
                  <motion.div variants={variants.fadeInWithLift}>
                    <Heading level={3}>SGP Number</Heading>
                    <p className="mt-2">Please select SGP numbers to associate with all block registering operations</p>
                    <motion.div variants={variants.fadeInWithLift} className="mt-4 md:w-1/2">
                      <WorkNumberSelect
                        onWorkNumberChangeInMulti={(workNumbers) => {
                          setFieldValue('workNumbers', [...workNumbers]);
                        }}
                        onWorkNumberChange={(workNumber) => {
                          setFieldValue(
                            'tissues',
                            values.tissues.map((tissue) => ({ ...tissue, workNumber }))
                          );
                          if ('workNumber' in defaultFormTissueValues) {
                            defaultFormTissueValues.workNumber = workNumber;
                          }
                        }}
                        workNumber={values.workNumbers}
                        multiple={isBlock}
                        emptyOption={false}
                      />
                      {isBlock && values.workNumbers.length <= 0 && <FormikErrorMessage name={'workNumbers'} />}
                    </motion.div>
                  </motion.div>

                  <RegistrationForm
                    registrationInfo={registrationInfo}
                    availableLabwareTypes={availableLabwareTypes}
                    defaultFormTissueValues={defaultFormTissueValues}
                    keywordsMap={keywordsMap}
                  />

                  {current.matches('clashed') && registrationResult && (
                    <ClashModal
                      registrationResult={registrationResult}
                      onConfirm={() => send({ type: 'SUBMIT_FORM', values })}
                      onConfirmAndUnrelease={() => send({ type: 'SUBMIT_FORM', values, ignoreExistingTissues: true })}
                      onCancel={() => send({ type: 'EDIT_SUBMISSION' })}
                    />
                  )}
                </>
              )}
            </Formik>
          )}
        </div>
      </AppShell.Main>
    </AppShell>
  );
}

export default Registration;
