import React from 'react';
import { GetProbePanelsQuery, ProbeOperationLabware } from '../types/sdk';
import AppShell from '../components/AppShell';
import { Form, Formik } from 'formik';
import * as Yup from 'yup';
import variants from '../lib/motionVariants';
import { motion } from 'framer-motion';
import Heading from '../components/Heading';
import { FormikErrorMessage } from '../components/forms';
import LabwareScanner from '../components/labwareScanner/LabwareScanner';
import LabwareScanPanel from '../components/labwareScanPanel/LabwareScanPanel';
import columns from '../components/dataTableColumns/labwareColumns';
import WorkNumberSelect from '../components/WorkNumberSelect';
import Panel from '../components/Panel';
import ProbeTable from '../components/probeHybridisation/ProbeTable';
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
  /**
   * Validation schema for the form
   */
  const validationSchema = Yup.object().shape({
    labware: Yup.array()
      .of(
        Yup.object().shape({
          barcode: Yup.string().required().label('Barcode'),
          workNumber: Yup.string().required().label('SGP Number'),
          probes: Yup.array()
            .of(
              Yup.object().shape({
                name: Yup.string()
                  .required()
                  .oneOf(probePanelInfo.probePanels.map((panel) => panel.name)),
                lot: Yup.string()
                  .required()
                  .max(20)
                  .matches(
                    /^\[A-Z][0-9]_{1,20}$/,
                    'LOT number should be a string of maximum length 20 of capital letters, numbers and undersores.'
                  ),
                plex: Yup.number().required().min(0, 'Plex number should be a positive integer.')
              })
            )
            .min(1)
            .required()
        })
      )
      .min(1)
      .required()
  });

  return (
    <AppShell>
      <AppShell.Header>
        <AppShell.Title>Probe Hybrodisation Xenium</AppShell.Title>
      </AppShell.Header>
      <AppShell.Main>
        <div className="max-w-screen-xl mx-auto">
          <Formik<ProbeHybridisationXeniumFormValues>
            initialValues={formInitialValues}
            validationSchema={validationSchema}
            onSubmit={async (values) => {}}
          >
            {({ values, setFieldValue }) => (
              <Form>
                {/**serverError && <Warning error={serverError} />**/}

                <div className={'flex flex-col space-y-6'}>
                  <motion.div variants={variants.fadeInWithLift} className="space-y-4 mb-4">
                    <Heading level={3}>Labware</Heading>

                    <LabwareScanner
                      onChange={(labwares) =>
                        setFieldValue(
                          'barcodes',
                          labwares.map((lw) => lw.barcode)
                        )
                      }
                    >
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
                    <FormikErrorMessage name={'barcodes'} />
                  </motion.div>
                  <motion.div variants={variants.fadeInWithLift} className="space-y-4">
                    <Heading level={3}>Probe Settings</Heading>
                    <div className={'grid grid-cols-2 gap-x-6'}>
                      <WorkNumberSelect label={'SGP Number'} onWorkNumberChange={(workNumber) => {}} />
                      <Panel>
                        <ProbeTable probePanels={probePanelInfo.probePanels} enableAddRows={true} probeLotData={[]} />
                      </Panel>
                    </div>
                  </motion.div>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </AppShell.Main>
    </AppShell>
  );
};

export default ProbeHybridisationXenium;
