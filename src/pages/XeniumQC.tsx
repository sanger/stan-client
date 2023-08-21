import React, { useContext } from 'react';
import { GetXeniumQcInfoQuery, QcLabware, QcLabwareRequest, RecordQcLabwareMutation } from '../types/sdk';
import * as Yup from 'yup';
import { StanCoreContext } from '../lib/sdk';
import createFormMachine from '../lib/machines/form/formMachine';
import { useMachine } from '@xstate/react';
import AppShell from '../components/AppShell';
import Warning from '../components/notifications/Warning';
import { Form, Formik } from 'formik';
import Heading from '../components/Heading';
import LabwareScanner from '../components/labwareScanner/LabwareScanner';
import { XeniumLabwareQC } from '../components/xeniumQC/XeniumLabwareQC';
import WorkNumberSelect from '../components/WorkNumberSelect';
import BlueButton from '../components/buttons/BlueButton';

type XeniumQCProps = {
  info: GetXeniumQcInfoQuery;
};

export type XeniumQCFormData = {
  workNumberAll: string;
  labware: Array<QcLabware>;
};
const validationSchema = Yup.object().shape({
  workNumberAll: Yup.string().optional(),
  labware: Yup.array().of(
    Yup.object().shape({
      barcode: Yup.string().required(),
      workNumber: Yup.string().required().label('SGP Number'),
      completion: Yup.date()
        .max(new Date(), 'Please select a date and time on or before current time')
        .required('Completion time is a required field')
        .label('Completion Time'),
      comments: Yup.array().min(0).optional()
    })
  )
});

const XeniumQC: React.FC<XeniumQCProps> = ({ info }) => {
  const stanCore = useContext(StanCoreContext);
  const formMachine = React.useMemo(() => {
    return createFormMachine<QcLabwareRequest, RecordQcLabwareMutation>().withConfig({
      services: {
        submitForm: (ctx, e) => {
          if (e.type !== 'SUBMIT_FORM') return Promise.reject();
          return stanCore.RecordQCLabware({
            // Stan-core's graphql schema describes the format of a timestamp as yyyy-mm-dd HH:MM:SS
            request: { ...e.values }
          });
        }
      }
    });
  }, [stanCore]);
  const [current, send] = useMachine(formMachine);
  const { serverError, submissionResult } = current.context;

  const initialValues: XeniumQCFormData = {
    workNumberAll: '',
    labware: []
  };
  return (
    <AppShell>
      <AppShell.Header>
        <AppShell.Title>Xenium QC</AppShell.Title>
      </AppShell.Header>
      <AppShell.Main>
        <div className="max-w-screen-xl mx-auto">
          {serverError && <Warning error={serverError} />}
          <Formik<XeniumQCFormData>
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={async (values) => {}}
          >
            {({ values, setFieldValue, isValid }) => (
              <Form>
                <div className="mt-8 space-y-2">
                  <Heading level={2}>Labware</Heading>
                  <p>Please scan in any labware you wish to QC.</p>
                  <LabwareScanner limit={2}>
                    {({ labwares, removeLabware }) => (
                      <>
                        {labwares.length > 0 && (
                          <div className={'w-full border-b-2'}>
                            <div className={'w-1/2 py-6 '}>
                              <WorkNumberSelect
                                label={'SGP Number'}
                                name={`workNumberAll`}
                                dataTestId={'workNumber'}
                                onWorkNumberChange={(workNumber) => {
                                  setFieldValue('workNumberAll', workNumber);
                                  labwares.forEach((lw, index) => {
                                    setFieldValue(`labware.${index}.workNumber`, workNumber);
                                  });
                                }}
                              />
                            </div>
                          </div>
                        )}
                        {labwares.map((lw, index) => (
                          <XeniumLabwareQC key={lw.barcode} labware={lw} comments={info.comments} index={index} />
                        ))}
                        <div className={'sm:flex mt-4 sm:flex-row justify-end'}>
                          <BlueButton type="submit" disabled={!isValid}>
                            Save
                          </BlueButton>
                        </div>
                      </>
                    )}
                  </LabwareScanner>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </AppShell.Main>
    </AppShell>
  );
};
export default XeniumQC;
