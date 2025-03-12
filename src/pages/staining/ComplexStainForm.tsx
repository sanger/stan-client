import React, { useMemo } from 'react';
import {
  ComplexStainLabware,
  ComplexStainRequest,
  LabwareFlaggedFieldsFragment,
  RecordComplexStainMutation,
  StainPanel
} from '../../types/sdk';
import { Form, Formik } from 'formik';
import GrayBox, { Sidebar } from '../../components/layouts/GrayBox';
import { motion } from '../../dependencies/motion';
import variants from '../../lib/motionVariants';
import Heading from '../../components/Heading';
import MutedText from '../../components/MutedText';
import LabwareScanPanel from '../../components/labwareScanPanel/LabwareScanPanel';
import columns from '../../components/dataTableColumns/labwareColumns';
import PinkButton from '../../components/buttons/PinkButton';
import * as Yup from 'yup';
import { useMachine } from '@xstate/react';
import createFormMachine from '../../lib/machines/form/formMachine';
import { stanCore } from '../../lib/sdk';
import { FormikLabwareScanner } from '../../components/labwareScanner/FormikLabwareScanner';
import Table, { TableBody, TableHead, TableHeader } from '../../components/Table';
import OperationCompleteModal from '../../components/modal/OperationCompleteModal';
import Warning from '../../components/notifications/Warning';
import WhiteButton from '../../components/buttons/WhiteButton';
import { FormikFieldValueArray } from '../../components/forms/FormikFieldValueArray';
import ComplexStainRow from './ComplexStainRow';
import { createSessionStorageForLabwareAwaiting } from '../../types/stan';
import { useNavigate } from 'react-router-dom';
import { extractLabwareFromFlagged } from '../../lib/helpers/labwareHelper';
import { fromPromise } from 'xstate';

type ComplexStainFormValues = ComplexStainRequest;

type ComplexStainFormProps = {
  stainType: string;
  initialLabware: LabwareFlaggedFieldsFragment[];
  onLabwareChange: (labware: LabwareFlaggedFieldsFragment[]) => void;
};

export default function ComplexStainForm({ stainType, initialLabware, onLabwareChange }: ComplexStainFormProps) {
  const formMachine = React.useMemo(() => {
    return createFormMachine<ComplexStainRequest, RecordComplexStainMutation>().provide({
      actors: {
        submitForm: fromPromise(({ input }) => {
          if (input.event.type !== 'SUBMIT_FORM') return Promise.reject();
          return stanCore.RecordComplexStain({ request: input.event.values });
        })
      }
    });
  }, []);

  const [current, send] = useMachine(formMachine);

  const { serverError } = current.context;

  const navigate = useNavigate();

  const plexMin = 1;
  const plexMax = 100;
  const stainTypes = stainType === 'RNAscope & IHC' ? stainType.split('&').map((val) => val.trim()) : [stainType];

  const labwareValidationSchema = Yup.object().shape({
    barcode: Yup.string().required().label('Barcode'),
    bondBarcode: Yup.string().required().label('Bond Barcode').min(4).max(8),
    bondRun: Yup.number().integer().positive().label('Bond Run'),
    workNumber: Yup.string().required().label('SGP Number'),
    panel: Yup.string().oneOf(Object.values(StainPanel)).required().label('Experimental Panel'),
    plexRNAscope: Yup.number().when('stainTypes', () => {
      if (stainType !== 'IHC') {
        return Yup.number().integer().min(plexMin).max(plexMax).required().label('RNAScope Plex Number');
      } else {
        return Yup.number().notRequired();
      }
    }),
    plexIHC: Yup.number().when('stainTypes', () => {
      if (stainType !== 'RNAscope') {
        return Yup.number().required().integer().min(plexMin).max(plexMax).label('IHC Plex Number');
      } else {
        return Yup.number().notRequired();
      }
    })
  });
  const validationSchema = Yup.object().shape({
    stainTypes: Yup.array().required().label('Stain Type'),
    labware: Yup.array().of(labwareValidationSchema).min(1).required().label('Labware')
  });

  const initialLabwareFields = useMemo(() => {
    return extractLabwareFromFlagged(initialLabware);
  }, [initialLabware]);

  return (
    <Formik<ComplexStainFormValues>
      initialValues={{
        stainTypes: [stainType],
        labware: initialLabware.map(buildLabware)
      }}
      validationSchema={validationSchema}
      onSubmit={async (values) => {
        //Make sure the submitting values do not contain fields that are not required for the selected stain type
        if (!values.stainTypes.includes('RNAscope')) {
          values.labware.forEach((val) => delete val.plexRNAscope);
        }
        if (!values.stainTypes.includes('IHC')) {
          values.labware.forEach((val) => delete val.plexIHC);
        }
        send({ type: 'SUBMIT_FORM', values });
      }}
    >
      {({ values: stainFormValues, setFieldValue: setStainTableFieldValue }) => (
        <Form>
          <FormikFieldValueArray field={'stainTypes'} values={stainTypes} />
          <GrayBox>
            <motion.div
              variants={variants.fadeInParent}
              initial={'hidden'}
              animate={'visible'}
              exit={'hidden'}
              className="md:w-2/3 space-y-10"
            >
              {serverError && <Warning error={serverError} />}

              <motion.div variants={variants.fadeInWithLift} className="space-y-4">
                <Heading level={3}>Labware</Heading>
                <MutedText>Please scan in the slides you wish to stain.</MutedText>

                <FormikLabwareScanner
                  initialLabwares={initialLabware}
                  onChange={onLabwareChange}
                  buildLabware={buildLabware}
                  locked={current.matches('submitted')}
                  enableFlaggedLabwareCheck
                >
                  <LabwareScanPanel
                    columns={[columns.barcode(), columns.donorId(), columns.labwareType(), columns.externalName()]}
                  />
                </FormikLabwareScanner>
              </motion.div>

              {stainFormValues.labware.length > 0 && (
                <motion.div variants={variants.fadeInWithLift} className="space-y-4">
                  <Heading level={3}>Stain Information</Heading>

                  <Table data-testid={'stain-info-table'}>
                    <TableHead fixed={true}>
                      <tr>
                        <TableHeader>Slide Barcode</TableHeader>
                        <TableHeader>Bond Barcode</TableHeader>
                        <TableHeader>Bond Run Number</TableHeader>
                        <TableHeader>SGP Number</TableHeader>
                        <TableHeader>Experimental panel</TableHeader>
                        <TableHeader>RNAScope Plex Number</TableHeader>
                        <TableHeader>IHC Plex Number</TableHeader>
                      </tr>
                    </TableHead>
                    <TableHead>
                      <Formik<ComplexStainLabware>
                        initialValues={{
                          panel: StainPanel.Marker,
                          bondRun: 0,
                          bondBarcode: '',
                          plexIHC: undefined,
                          plexRNAscope: undefined,
                          workNumber: '',
                          barcode: ''
                        }}
                        onSubmit={() => {}}
                      >
                        {({ values: stainLabwareValues, setFieldValue }) => (
                          <ComplexStainRow
                            barcode={'Apply to all'}
                            stainType={stainType}
                            plexMin={plexMin}
                            plexMax={plexMax}
                            stainFormValues={stainFormValues}
                            setFieldValue={setFieldValue}
                            stainRowApplyAllSettings={{
                              stainValuesToAll: stainLabwareValues,
                              setValueToAllStainRows: setStainTableFieldValue
                            }}
                          />
                        )}
                      </Formik>
                    </TableHead>
                    <TableBody>
                      {stainFormValues.labware.map((lw, i) => (
                        <ComplexStainRow
                          key={lw.barcode}
                          barcode={lw.barcode}
                          stainType={stainType}
                          plexMin={plexMin}
                          plexMax={plexMax}
                          rowID={i}
                          stainFormValues={stainFormValues}
                          setFieldValue={setStainTableFieldValue}
                        />
                      ))}
                    </TableBody>
                  </Table>
                </motion.div>
              )}
            </motion.div>

            <Sidebar>
              <Heading level={3} showBorder={false}>
                Summary
              </Heading>

              {stainFormValues.labware.length > 0 && (
                <p>
                  <span className="font-semibold">{stainFormValues.labware.length}</span> piece(s) of labware will be
                  stained using <span className="font-semibold">{stainFormValues.stainTypes.join(' and ')}</span>.
                </p>
              )}

              <PinkButton
                disabled={current.matches('submitted')}
                loading={current.matches('submitting')}
                type="submit"
                className="sm:w-full"
              >
                Submit
              </PinkButton>
            </Sidebar>
          </GrayBox>
          <OperationCompleteModal
            show={current.matches('submitted')}
            message={'Staining Successful'}
            additionalButtons={
              <div className={'flex flex-row gap-x-3'}>
                <WhiteButton
                  type="button"
                  style={{ marginRight: 'auto' }}
                  className="w-full text-base md:ml-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => send({ type: 'RESET' })}
                >
                  Stain Again
                </WhiteButton>
                <WhiteButton
                  type="button"
                  style={{ marginLeft: 'auto' }}
                  className="w-full text-base md:ml-0 sm:ml-3 sm:w-auto sm:text:sm"
                  onClick={() => {
                    if (initialLabware.length > 0) {
                      createSessionStorageForLabwareAwaiting(initialLabwareFields);
                    }
                    navigate('/store');
                  }}
                >
                  Store
                </WhiteButton>
              </div>
            }
          >
            <p>
              If you wish to start the process again, click the "Reset Form" button. Otherwise you can return to the
              Home screen.
            </p>
          </OperationCompleteModal>
        </Form>
      )}
    </Formik>
  );
}

function buildLabware(labware: LabwareFlaggedFieldsFragment) {
  return {
    barcode: labware.barcode,
    bondBarcode: '',
    bondRun: 0,
    workNumber: '',
    panel: StainPanel.Marker,
    plexRNAscope: 0,
    plexIHC: 0
  };
}
