import React from 'react';
import { GetProbePanelsQuery, LabwareFieldsFragment, ProbeLot, ProbeOperationLabware } from '../types/sdk';
import AppShell from '../components/AppShell';
import { Form, Formik } from 'formik';
import * as Yup from 'yup';
import variants from '../lib/motionVariants';
import { motion } from 'framer-motion';
import Heading from '../components/Heading';
import LabwareScanner from '../components/labwareScanner/LabwareScanner';
import LabwareScanPanel from '../components/labwareScanPanel/LabwareScanPanel';
import columns from '../components/dataTableColumns/labwareColumns';
import WorkNumberSelect from '../components/WorkNumberSelect';
import ProbeTable from '../components/probeHybridisation/ProbeTable';
import PinkButton from '../components/buttons/PinkButton';
import Table, { TableBody, TableCell, TableHead, TableHeader } from '../components/Table';
import { Input } from '../components/forms/Input';
import { useMachine } from '@xstate/react';
import probeHybridisationMachine from '../lib/machines/probeHybridisation/probeHybridisationMachine';
import MutedText from '../components/MutedText';
import BlueButton from '../components/buttons/BlueButton';
import WhiteButton from '../components/buttons/WhiteButton';
import AddIcon from '../components/icons/AddIcon';
type ProbeHybridisationXeniumProps = {
  probePanelInfo: GetProbePanelsQuery;
};

type ProbeHybridisationXeniumFormValues = {
  labware: ProbeOperationLabware[];
};
const formInitialValues = {
  labware: []
};

const ProbeHybridisationXenium: React.FC<ProbeHybridisationXeniumProps> = ({
  probePanelInfo
}: ProbeHybridisationXeniumProps) => {
  const [current, send] = useMachine(() =>
    probeHybridisationMachine.withContext({
      operationType: 'Probe hybridisation Xenium',
      probeLabware: [],
      performed: new Date().toISOString().split('T')[0],
      serverErrors: undefined,
      labware: [],
      recordProbeOperationResult: undefined,
      workNumberAll: '',
      probeLotAll: { lot: '', name: '', plex: -1 }
    })
  );

  const { serverErrors, labware, probeLabware, performed, probeLotAll, dateValidationError } = current.context;
  /**
   * Validation schema for the form
   */
  const probeLotSchema = Yup.object().shape({
    panel: Yup.string().required('Probe panel is a required field'),
    lot: Yup.string()
      .required('Lot number is a required field')
      .max(20)
      .matches(
        /^[A-Z0-9_]{1,20}$/,
        'LOT number should be a string of maximum length 20 of capital letters, numbers and undersores.'
      ),
    plex: Yup.number().required('Plex is a required field').min(0, 'Plex number should be a positive integer.')
  });
  const validationSchema = Yup.object().shape({
    labware: Yup.array()
      .of(
        Yup.object().shape({
          barcode: Yup.string().required().label('Barcode'),
          workNumber: Yup.string().required().label('SGP Number'),
          probes: Yup.array().of(probeLotSchema).min(1).required()
        })
      )
      .min(1)
      .required()
  });

  const handleScannedLabwareChange = React.useCallback(
    (labware: LabwareFieldsFragment[]) => {
      send({ type: 'UPDATE_LABWARE', labware });
    },
    [send]
  );
  const handleWorkNumberChangeForAll = React.useCallback(
    (workNumber: string) => {
      send({ type: 'SET_WORK_NUMBER_ALL', workNumber });
    },
    [send]
  );
  const handleAddProbeLotForAll = React.useCallback(
    (probeLot: ProbeLot) => {
      send({ type: 'ADD_PROBE_LOT_ALL', probe: probeLot });
    },
    [send]
  );
  const handleRemoveProbeLotAction = React.useCallback(
    (barcode: string, probeLotIndex: number) => {
      if (barcode.length === 0) return;
      send({ type: 'REMOVE_PROBE_LOT', barcode, probeLotIndex });
    },
    [send]
  );
  const handleAddProbeLotAction = React.useCallback(
    (barcode: string) => {
      if (barcode.length === 0) return;
      send({ type: 'ADD_PROBE_LOT', barcode });
    },
    [send]
  );
  const handleUpdateProbeLotAction = React.useCallback(
    (barcode: string, index: number, probeLot: ProbeLot) => {
      if (barcode.length === 0) return;
      send({ type: 'UPDATE_PROBE_LOT', barcode, index, probeLot });
    },
    [send]
  );
  const handleUpdateProbeLotForAllAction = React.useCallback(
    (probeLot: ProbeLot) => {
      send({ type: 'UPDATE_PROBE_LOT_ALL', probeLot });
    },
    [send]
  );
  const handleStartDateChange = React.useCallback(
    (date: string) => {
      // Compare entered date with the current date
      send({ type: 'SET_START_DATE', date });
    },
    [send]
  );

  return (
    <AppShell>
      <AppShell.Header>
        <AppShell.Title>Probe Hybrodisation Xenium</AppShell.Title>
      </AppShell.Header>
      <AppShell.Main>
        <div className="max-w-screen-xl mx-auto">
          {/**serverError && <Warning error={serverError} />**/}

          <div className={'flex flex-col space-y-6'}>
            <motion.div variants={variants.fadeInWithLift} className="space-y-4 mb-4">
              <Heading level={3}>Labware</Heading>

              <LabwareScanner onChange={(labware) => handleScannedLabwareChange(labware)}>
                <LabwareScanPanel
                  columns={[
                    columns.barcode(),
                    columns.donorId(),
                    columns.labwareType(),
                    columns.externalName(),
                    columns.bioState()
                  ]}
                />
              </LabwareScanner>
            </motion.div>
            {labware.length > 0 && (
              <>
                <motion.div variants={variants.fadeInWithLift} className="space-y-4">
                  <Heading level={3}>Probe Settings</Heading>
                  <div className={'flex flex-col w-1/2'}>
                    <label>Start Time</label>
                    <Input
                      type="date"
                      name={'performed'}
                      max={new Date().toISOString().split('T')[0]}
                      value={performed}
                      onInput={(e) => handleStartDateChange(e.currentTarget.value)}
                    />
                    {dateValidationError && (
                      <MutedText className={'text-red-500'}>
                        Please select today's date or a date from the past.
                      </MutedText>
                    )}
                  </div>
                  <div className={'flex flex-col mt-4'}>
                    <label className={'mb-2 mt-2'}>Apply to all:</label>
                    <div className={'w-full border-2 border-gray-100 mb-4'} />
                    <div className={'grid grid-cols-2 gap-x-6'}>
                      <div>
                        <WorkNumberSelect
                          label={'SGP Number'}
                          onWorkNumberChange={handleWorkNumberChangeForAll}
                          requiredField={false}
                        />
                      </div>
                      <div>
                        <label>Probe</label>
                        <div className={'flex flex-col bg-gray-100 p-3 shadow justify-end'}>
                          <Formik
                            initialValues={{ panel: '', lot: '', plex: -1 }}
                            validationSchema={probeLotSchema}
                            onSubmit={async (values) => {
                              handleAddProbeLotForAll({
                                name: values.panel,
                                plex: values.plex,
                                lot: values.lot
                              });
                            }}
                          >
                            {({ values, setFieldValue }) => (
                              <Form>
                                <ProbeTable
                                  probePanels={probePanelInfo.probePanels}
                                  probeLotData={[probeLotAll]}
                                  onProbLotDataChange={(barcode, rowIndx, probLot) =>
                                    handleUpdateProbeLotForAllAction(probLot)
                                  }
                                />
                                <div className="sm:flex sm:flex-row mt-2 items-center justify-end">
                                  <WhiteButton type={'submit'} disabled={labware.length <= 0}>
                                    <AddIcon className="inline-block text-green-500 h-4 w-4 mt-1 mr-2" />
                                    Add to all
                                  </WhiteButton>
                                </div>
                              </Form>
                            )}
                          </Formik>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>

                <Formik<ProbeHybridisationXeniumFormValues>
                  initialValues={formInitialValues}
                  validationSchema={validationSchema}
                  onSubmit={async (values) => {}}
                >
                  {({ values, setFieldValue }) => (
                    <Form>
                      <motion.div variants={variants.fadeInWithLift} className="space-y-4 w-full">
                        <Table>
                          <TableHead>
                            <tr>
                              <TableHeader>Barcode</TableHeader>
                              <TableHeader>SGP Number</TableHeader>
                              <TableHeader>Probe</TableHeader>
                              <TableHeader />
                            </tr>
                          </TableHead>

                          <TableBody>
                            {probeLabware.map((probeLw, indx) => (
                              <tr key={probeLw.barcode}>
                                <TableCell>{probeLw.barcode}</TableCell>
                                <TableCell>
                                  <WorkNumberSelect
                                    name={`labware.${indx}workNumber`}
                                    onWorkNumberChange={(workNumber) => {
                                      setFieldValue(`labware.${indx}workNumber`, workNumber);
                                    }}
                                    workNumber={probeLw.workNumber}
                                  />
                                </TableCell>
                                <TableCell>
                                  <ProbeTable
                                    probePanels={probePanelInfo.probePanels}
                                    barcode={probeLw.barcode}
                                    probeLotData={probeLw.probes}
                                    multiRowEdit={{
                                      formSuffixName: `labware.${indx}.probes`,
                                      onRemove: handleRemoveProbeLotAction,
                                      onAdd: handleAddProbeLotAction
                                    }}
                                    onProbLotDataChange={handleUpdateProbeLotAction}
                                  />
                                </TableCell>
                              </tr>
                            ))}
                          </TableBody>
                        </Table>
                      </motion.div>
                      <div className={'sm:flex mt-4 sm:flex-row justify-end'}>
                        <BlueButton type="submit">Save</BlueButton>
                      </div>
                    </Form>
                  )}
                </Formik>
              </>
            )}
          </div>
        </div>
      </AppShell.Main>
    </AppShell>
  );
};

export default ProbeHybridisationXenium;
