import React from 'react';
import AppShell from '../components/AppShell';
import { Form, Formik, FormikProps } from 'formik';
import * as Yup from 'yup';
import { useMachine } from '@xstate/react';
import GrayBox, { Sidebar } from '../components/layouts/GrayBox';
import { motion } from 'framer-motion';
import variants from '../lib/motionVariants';
import Warning from '../components/notifications/Warning';
import Heading from '../components/Heading';
import PinkButton from '../components/buttons/PinkButton';
import createFormMachine from '../lib/machines/form/formMachine';
import { reload } from '../lib/sdk';
import OperationCompleteModal from '../components/modal/OperationCompleteModal';

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
};

/**
 * A component to act as a generic parent for a page that requires a simple form
 */
export default function StanForm<V, R>({
  title,
  onSubmit,
  validationSchema,
  initialValues,
  summary,
  children
}: StanFormParams<V, R>) {
  const formMachine = React.useMemo(() => {
    return createFormMachine<V, R>().withConfig({
      services: {
        submitForm: (ctx, e) => {
          if (e.type !== 'SUBMIT_FORM') return Promise.reject();
          return onSubmit(e.values);
        },
      },
    });
  }, [onSubmit]);
  const [current, send] = useMachine(() => formMachine);

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
          <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={submitForm}>
            {(formikProps) => (
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

                    <PinkButton disabled={formLocked} type="submit" className="sm:w-full">
                      Submit
                    </PinkButton>
                  </Sidebar>
                </GrayBox>

                <OperationCompleteModal
                  show={current.matches('submitted')}
                  message={'Operation Complete'}
                  onReset={reload}
                >
                  <p>
                    If you wish to start the process again, click the "Reset Form" button. Otherwise you can return to
                    the Home screen.
                  </p>
                </OperationCompleteModal>
              </Form>
            )}
          </Formik>
        </div>
      </AppShell.Main>
    </AppShell>
  );
}
