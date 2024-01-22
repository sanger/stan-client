import React, { useContext } from 'react';
import {
  AddressCommentInput,
  GetCommentsQuery,
  LabwareResult as CoreLabwareResult,
  OpWithSlotCommentsRequest,
  OpWithSlotMeasurementsRequest,
  RecordOpWithSlotCommentsMutation,
  RecordOpWithSlotMeasurementsMutation,
  RecordVisiumQcMutation,
  ResultRequest,
  SlideCosting
} from '../types/sdk';
import AppShell from '../components/AppShell';
import WorkNumberSelect from '../components/WorkNumberSelect';
import LabwareScanner from '../components/labwareScanner/LabwareScanner';
import Heading from '../components/Heading';
import { objectKeys } from '../lib/helpers';
import OperationCompleteModal from '../components/modal/OperationCompleteModal';
import Warning from '../components/notifications/Warning';
import { StanCoreContext } from '../lib/sdk';
import * as Yup from 'yup';
import { Form, Formik } from 'formik';
import BlueButton from '../components/buttons/BlueButton';
import { useMachine } from '@xstate/react';
import createFormMachine from '../lib/machines/form/formMachine';
import Amplification from '../components/visiumQC/Amplification';
import SlideProcessing from '../components/visiumQC/SlideProcessing';
import Cleanup from '../components/visiumQC/Cleanup';
import CustomReactSelect, { OptionType } from '../components/forms/CustomReactSelect';
import CDNAConcentration from '../components/visiumQC/CDNAConentration';
import { useLoaderData } from 'react-router-dom';
import QPcrResults from '../components/visiumQC/QPcrResults';
import { SlotMeasurement } from '../components/slotMeasurement/SlotMeasurements';

export enum QCType {
  CDNA_AMPLIFICATION = 'Amplification',
  SLIDE_PROCESSING = 'Slide Processing',
  VISIUM_CONCENTRATION = 'Visium concentration',
  SPRI_CLEANUP = 'SPRI clean up',
  QPCR_RESULTS = 'qPCR results'
}

export interface VisiumQCFormData {
  workNumber: string;
  qcType: QCType;
  barcode: string;
  slotMeasurements?: Array<SlotMeasurement>;
  labwareResult?: CoreLabwareResult[];
  costing?: SlideCosting;
  reagentLot?: string;
  slotComments?: Array<AddressCommentInput>;
}

const validationSchema = Yup.object().shape({
  workNumber: Yup.string().required().label('SGP number'),
  barcode: Yup.string().optional(),
  qcType: Yup.string().required().label('QC Type'),
  labwareResult: Yup.array()
    .of(Yup.object())
    .when('qcType', (qcType) => {
      const val = qcType as unknown as string;
      if (val === QCType.SLIDE_PROCESSING) {
        return Yup.array().required();
      } else {
        return Yup.array().notRequired();
      }
    }),
  slotMeasurements: Yup.array()
    .of(
      Yup.object().shape({
        address: Yup.string().required(),
        name: Yup.string().required(),
        value: Yup.string().required('Positive value required')
      })
    )
    .notRequired(),

  costing: Yup.string().when('qcType', (qcType) => {
    const val = qcType[0] as unknown as string;
    if (val === QCType.SLIDE_PROCESSING) {
      return Yup.string().oneOf(Object.values(SlideCosting)).required('Slide costing is a required field');
    } else {
      return Yup.string().optional();
    }
  }),
  reagentLot: Yup.string().when('qcType', (qcType, schema) => {
    const val = qcType[0] as unknown as string;
    return val === QCType.SLIDE_PROCESSING
      ? Yup.string()
          .required('Reagent LOT number is  a required field')
          .matches(/^\d{6,7}$/, 'Reagent LOT number should be a 6-7 digits number')
      : schema;
  }),
  slotComments: Yup.array()
    .of(
      Yup.object().shape({
        address: Yup.string().required(),
        commentId: Yup.number().required()
      })
    )
    .when('qcType', (qcType, schema) => {
      const val = qcType[0] as unknown as string;
      return val === QCType.SPRI_CLEANUP ? Yup.array().required() : schema;
    })
});

export default function VisiumQC() {
  const visiumQcInfo = useLoaderData() as GetCommentsQuery;
  const stanCore = useContext(StanCoreContext);
  const formMachine = React.useMemo(() => {
    return createFormMachine<ResultRequest, RecordVisiumQcMutation>().withConfig({
      services: {
        submitForm: (ctx, e) => {
          if (e.type !== 'SUBMIT_FORM') return Promise.reject();
          return stanCore.RecordVisiumQC({
            request: e.values
          });
        }
      }
    });
  }, [stanCore]);
  const [currentSlideProcessing, sendSlideProcessing] = useMachine(formMachine);

  const slideProcessingComments = React.useMemo(() => {
    return visiumQcInfo.comments.filter((comment) => comment.category === 'Visium QC');
  }, [visiumQcInfo]);

  const concentrationComments = React.useMemo(() => {
    return visiumQcInfo.comments.filter((comment) => comment.category === 'Concentration');
  }, [visiumQcInfo]);

  const cleanupComments = React.useMemo(() => {
    return visiumQcInfo.comments.filter((comment) => comment.category === 'clean up');
  }, [visiumQcInfo]);

  const [currentCDNA, sendCDNA] = useMachine(
    createFormMachine<OpWithSlotMeasurementsRequest, RecordOpWithSlotMeasurementsMutation>().withConfig({
      services: {
        submitForm: (ctx, e) => {
          if (e.type !== 'SUBMIT_FORM') return Promise.reject();
          return stanCore.RecordOpWithSlotMeasurements({
            request: e.values
          });
        }
      }
    })
  );

  const [labwareLimit, setLabwareLimit] = React.useState(2);

  const [currentRecordOpWithSlotComments, sendRecordOpWithSlotComments] = useMachine(
    createFormMachine<OpWithSlotCommentsRequest, RecordOpWithSlotCommentsMutation>().withConfig({
      services: {
        submitForm: (ctx, e) => {
          if (e.type !== 'SUBMIT_FORM') return Promise.reject();
          const labware = e.values.labware.map((lw) => {
            return { ...lw, addressComments: lw.addressComments.filter((ac) => ac.commentId !== -1) };
          });
          return stanCore.RecordOpWithSlotComments({
            request: { ...e.values, labware: labware }
          });
        }
      }
    })
  );

  const { serverError: serverErrorSlideProcessing } = currentSlideProcessing.context;
  const { serverError: serverErrorCDNA } = currentCDNA.context;
  const { serverError: serverErrorRecordOpWithSlotComments } = currentRecordOpWithSlotComments.context;

  const onSubmit = (values: VisiumQCFormData) => {
    if (values.qcType === QCType.SLIDE_PROCESSING && values.labwareResult) {
      sendSlideProcessing({
        type: 'SUBMIT_FORM',
        values: {
          workNumber: values.workNumber,
          labwareResults: values.labwareResult,
          operationType: QCType.SLIDE_PROCESSING
        }
      });
    }
    if (
      values.qcType === QCType.VISIUM_CONCENTRATION ||
      values.qcType === QCType.QPCR_RESULTS ||
      (values.qcType === QCType.CDNA_AMPLIFICATION && values.slotMeasurements)
    ) {
      sendCDNA({
        type: 'SUBMIT_FORM',
        values: {
          workNumber: values.workNumber,
          barcode: values.barcode,
          slotMeasurements: values.slotMeasurements?.map(({ externalName, sectionNumber, ...rest }) => rest) ?? [],
          operationType: values.qcType
        }
      });
    }
    if (values.qcType === QCType.SPRI_CLEANUP && values.slotComments) {
      sendRecordOpWithSlotComments({
        type: 'SUBMIT_FORM',
        values: {
          workNumber: values.workNumber,
          labware: [{ barcode: values.barcode, addressComments: values.slotComments }],
          operationType: QCType.SPRI_CLEANUP
        }
      });
    }
  };

  const isEnableSubmit = (value: VisiumQCFormData) => {
    if (value.workNumber === '') {
      return false;
    }
    if (
      value.qcType === QCType.CDNA_AMPLIFICATION ||
      value.qcType === QCType.VISIUM_CONCENTRATION ||
      QCType.QPCR_RESULTS
    ) {
      if (value.slotMeasurements) {
        const val = value.slotMeasurements.filter((measurement) => measurement.value === '');
        return val.length <= 0;
      } else return false;
    }
    if (value.qcType === QCType.SLIDE_PROCESSING) {
      return !!value.labwareResult;
    }
    if (value.qcType === QCType.SPRI_CLEANUP) {
      return value.slotComments && value.slotComments.some((sc) => sc.commentId >= 0);
    }
    return false;
  };

  const getServerError = (value: VisiumQCFormData) => {
    if (
      value.qcType === QCType.CDNA_AMPLIFICATION ||
      value.qcType === QCType.VISIUM_CONCENTRATION ||
      value.qcType === QCType.QPCR_RESULTS
    ) {
      return value.slotMeasurements && value.slotMeasurements.length > 0 ? serverErrorCDNA : undefined;
    }
    if (value.qcType === QCType.SLIDE_PROCESSING) {
      return value.labwareResult ? serverErrorSlideProcessing : undefined;
    }
    if (value.qcType === QCType.SPRI_CLEANUP) {
      return value.slotComments && value.slotComments.length > 0 ? serverErrorRecordOpWithSlotComments : undefined;
    }
    return undefined;
  };

  return (
    <AppShell>
      <AppShell.Header>
        <AppShell.Title>Visium QC</AppShell.Title>
      </AppShell.Header>
      <AppShell.Main>
        <div className="max-w-screen-xl mx-auto mb-4">
          <Formik<VisiumQCFormData>
            initialValues={{
              barcode: '',
              workNumber: '',
              qcType: QCType.SLIDE_PROCESSING,
              slotMeasurements: [],
              labwareResult: undefined,
              slotComments: []
            }}
            onSubmit={onSubmit}
            validationSchema={validationSchema}
          >
            {({ setFieldValue, values, isValid }) => (
              <Form>
                <div className="space-y-2 mb-8 ">
                  <Heading level={2}>SGP Number</Heading>
                  <p>Select an SGP number to associate with this operation.</p>

                  <div className="mt-4 md:w-1/2">
                    <WorkNumberSelect
                      onWorkNumberChange={(workNumber) => setFieldValue('workNumber', workNumber)}
                      name={'workNumber'}
                    />
                  </div>
                </div>
                <Heading level={2}>QC Type</Heading>
                <div className="mt-4 md:w-1/2">
                  <CustomReactSelect
                    handleChange={(val) => {
                      setFieldValue('qcType', (val as OptionType).label);
                      setLabwareLimit(() => {
                        return (val as OptionType).label === QCType.SLIDE_PROCESSING ? 2 : 1;
                      });
                    }}
                    dataTestId={'qcType'}
                    emptyOption={true}
                    label={''}
                    value={values.qcType}
                    name={'qcType'}
                    options={objectKeys(QCType)
                      .sort()
                      .map((qcType) => {
                        return { label: QCType[qcType], value: QCType[qcType] };
                      })}
                  />
                </div>

                <div className="mt-8 space-y-2">
                  <Heading level={2}>Labware</Heading>
                  <p>Please scan in any labware you wish to QC.</p>
                  <div key={`labware-scanner-${labwareLimit}`}>
                    <LabwareScanner limit={labwareLimit} enableFlaggedLabwareCheck>
                      {({ labwares, removeLabware }) => {
                        switch (values.qcType) {
                          case QCType.SLIDE_PROCESSING:
                            return (
                              <SlideProcessing
                                labware={labwares}
                                removeLabware={removeLabware}
                                comments={slideProcessingComments}
                                labwaresResultsProps={values.labwareResult}
                              />
                            );
                          case QCType.SPRI_CLEANUP:
                            return (
                              <Cleanup labware={labwares[0]} comments={cleanupComments} removeLabware={removeLabware} />
                            );

                          case QCType.CDNA_AMPLIFICATION:
                            return (
                              <Amplification
                                slotMeasurements={values.slotMeasurements}
                                labware={labwares[0]}
                                removeLabware={removeLabware}
                              />
                            );
                          case QCType.VISIUM_CONCENTRATION:
                            return (
                              <CDNAConcentration
                                slotMeasurements={values.slotMeasurements}
                                labware={labwares[0]}
                                removeLabware={removeLabware}
                                concentrationComments={concentrationComments}
                              />
                            );
                          case QCType.QPCR_RESULTS:
                            return (
                              <QPcrResults
                                slotMeasurements={values.slotMeasurements}
                                labware={labwares[0]}
                                removeLabware={removeLabware}
                              />
                            );
                        }
                      }}
                    </LabwareScanner>
                  </div>
                </div>

                {getServerError(values) && (
                  <Warning
                    className={'mt-4'}
                    message={`Failed to record ${values.qcType}`}
                    error={getServerError(values)}
                  />
                )}
                <div className={'sm:flex mt-4 sm:flex-row justify-end'}>
                  <BlueButton disabled={!isEnableSubmit(values) || !isValid} type="submit">
                    Save
                  </BlueButton>
                </div>
                <OperationCompleteModal
                  show={
                    currentSlideProcessing.matches('submitted') ||
                    currentCDNA.matches('submitted') ||
                    currentRecordOpWithSlotComments.matches('submitted')
                  }
                  message={`${values.qcType} complete`}
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
