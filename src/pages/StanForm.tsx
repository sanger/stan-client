import React from 'react';
import AppShell from '../components/AppShell';
import { Form, Formik, FormikProps, FormikValues } from 'formik';
import * as Yup from 'yup';
import { useMachine } from '@xstate/react';
import GrayBox, { Sidebar } from '../components/layouts/GrayBox';
import { motion } from '../dependencies/motion';
import variants from '../lib/motionVariants';
import Warning from '../components/notifications/Warning';
import Heading from '../components/Heading';
import PinkButton from '../components/buttons/PinkButton';
import createFormMachine from '../lib/machines/form/formMachine';
import OperationCompleteModal from '../components/modal/OperationCompleteModal';
import { fromPromise } from 'xstate';
import WhiteButton from '../components/buttons/WhiteButton';
import { createSessionStorageForLabwareAwaiting } from '../types/stan';
import { useNavigate } from 'react-router-dom';

type StanFormParams<V, R> = {
  /**
   * The title of the page
   */
  title: string;

  /**
   * Callback triggered when the form is submitted
   * @param values the form values
   */
  onSubmit: (values: V) => Promise<R>;

  /**
   * Validation schema passed to the Formik form
   */
  validationSchema: Yup.AnyObjectSchema;

  /**
   * The initial values of the form
   */
  initialValues: V;

  /**
   * React component to display in the summary box
   */
  summary: (props: FormikProps<V>) => React.ReactNode;

  /**
   * Children of StanForm should be the fields of the form
   */
  children: (props: FormikProps<V>) => React.ReactNode;

  /**
   * Used in case we need to display a "Store" redirect button once the operation is successful
   */
  displayStoreOption?: boolean;
};

/**
 * A component to act as a generic parent for a page that requires a simple form
 */
export default function StanForm<V extends FormikValues, R>({
  title,
  onSubmit,
  validationSchema,
  initialValues,
  summary,
  children,
  displayStoreOption
}: StanFormParams<V, R>) {
  const formMachine = React.useMemo(() => {
    return createFormMachine<FormikValues, R>().provide({
      actors: {
        submitForm: fromPromise(({ input }) => {
          if (input.event.type !== 'SUBMIT_FORM') return Promise.reject();
          return onSubmit(input.event.values);
        })
      }
    });
  }, [onSubmit]);
  const [current, send] = useMachine(formMachine);
  const navigate = useNavigate();
  const submitForm = async (values: V) => send({ type: 'SUBMIT_FORM', values });
  const serverError = current.context.serverError;
  const formLocked = !current.matches('fillingOutForm');

  return (
    <AppShell>
      <AppShell.Header>
        <AppShell.Title>{title}</AppShell.Title>
      </AppShell.Header>
      <AppShell.Main>
        <div className="max-w-screen-xl mx-auto">
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={submitForm}
            validateOnMount={true}
          >
            {(formikProps) => {
              return (
                <Form>
                  <GrayBox>
                    <motion.div
                      variants={variants.fadeInParent}
                      initial={'hidden'}
                      animate={'visible'}
                      exit={'hidden'}
                      className="md:w-2/3 space-y-10"
                    >
                      {serverError && <Warning error={serverError} />}

                      {children(formikProps)}
                    </motion.div>

                    <Sidebar>
                      <Heading level={3} showBorder={false}>
                        Summary
                      </Heading>

                      {summary(formikProps)}

                      <PinkButton disabled={formLocked || !formikProps.isValid} type="submit" className="sm:w-full">
                        Submit
                      </PinkButton>
                    </Sidebar>
                  </GrayBox>

                  <OperationCompleteModal
                    show={current.matches('submitted')}
                    message={'Operation Complete'}
                    additionalButtons={
                      displayStoreOption && formikProps.values.labware.length > 0 ? (
                        <WhiteButton
                          type="button"
                          style={{ marginLeft: 'auto' }}
                          className="w-full text-base md:ml-0 sm:ml-3 sm:w-auto sm:text:sm"
                          onClick={() => {
                            createSessionStorageForLabwareAwaiting(formikProps.values.labware);
                            navigate('/store');
                          }}
                        >
                          Store
                        </WhiteButton>
                      ) : (
                        <></>
                      )
                    }
                  >
                    <p>
                      If you wish to start the process again, click the "Reset Form" button. Otherwise you can return to
                      the Home screen.
                    </p>
                  </OperationCompleteModal>
                </Form>
              );
            }}
          </Formik>
        </div>
      </AppShell.Main>
    </AppShell>
  );
}
