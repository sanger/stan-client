import React from 'react';
import AppShell from '../components/AppShell';
import Heading from '../components/Heading';
import LabwareScanner from '../components/labwareScanner/LabwareScanner';
import LabwareScanTable from '../components/labwareScanPanel/LabwareScanPanel';
import labwareScanTableColumns from '../components/dataTableColumns/labwareColumns';
import OperationCompleteModal from '../components/modal/OperationCompleteModal';
import { FormikErrorMessage } from '../components/forms';
import PinkButton from '../components/buttons/PinkButton';
import Warning from '../components/notifications/Warning';
import { motion } from '../dependencies/motion';
import variants from '../lib/motionVariants';
import { Form, Formik } from 'formik';
import * as Yup from 'yup';
import { useMachine } from '@xstate/react';
import createFormMachine from '../lib/machines/form/formMachine';
import { stanCore } from '../lib/sdk';
import { AddExternalIdsMutation, AddExternalIdsRequest } from '../types/sdk';
import { fromPromise } from 'xstate';
import { CellProps, Column } from 'react-table';
import DataTable from '../components/DataTable';
import FormikInput from '../components/forms/Input';
import { sectionGroupsBySample } from '../lib/helpers/labwareHelper';

type SectionsExternalName = {
  addresses: Array<string>;
  externalName: string;
};

type AddExternalIdsRequestForm = {
  sectionExternalNames: Array<SectionsExternalName>;
  labwareBarcode: string;
};

export default function AddExternalID() {
  const formMachine = React.useMemo(() => {
    return createFormMachine<AddExternalIdsRequest, AddExternalIdsMutation>().provide({
      actors: {
        submitForm: fromPromise(({ input }) => {
          if (input.event.type !== 'SUBMIT_FORM') return Promise.reject();
          return stanCore.AddExternalIds({ request: input.event.values });
        })
      }
    });
  }, []);
  const [current, send] = useMachine(formMachine);

  function buildValidationSchema(): Yup.AnyObjectSchema {
    return Yup.object().shape({
      labwareBarcode: Yup.string().required('A labware must be scanned in'),
      addressNames: Yup.array()
        .of(
          Yup.object().shape({
            address: Yup.string(),
            externalId: Yup.string()
          })
        )
        .min(1, 'At least one external id must be provided')
    });
  }

  const serverError = current.context.serverError;

  const externalIdsTableColumns: Column<SectionsExternalName>[] = React.useMemo(
    () => [
      {
        Header: 'Addresses',
        accessor: (section: SectionsExternalName) => section.addresses?.join(', ')
      },
      {
        Header: 'External Id',
        accessor: (section: SectionsExternalName) => section.externalName,
        Cell: (props: CellProps<SectionsExternalName>) => {
          return <FormikInput label={''} name={`sectionExternalNames[${props.row.index}].externalName`} />;
        }
      }
    ],
    []
  );

  return (
    <AppShell>
      <AppShell.Header>
        <AppShell.Title>Add External ID</AppShell.Title>
      </AppShell.Header>
      <AppShell.Main>
        <Formik<AddExternalIdsRequestForm>
          initialValues={{
            sectionExternalNames: [],
            labwareBarcode: ''
          }}
          onSubmit={async (values) => {
            send({
              type: 'SUBMIT_FORM',
              values: {
                labwareBarcode: values.labwareBarcode,
                addressNames: values.sectionExternalNames
                  .filter((section) => section.externalName && section.externalName.trim() !== '')
                  .flatMap((section) =>
                    section.addresses.flatMap((address) => ({
                      address: address,
                      externalName: section.externalName
                    }))
                  )
              }
            });
          }}
          validationSchema={buildValidationSchema()}
        >
          {({ setValues, values }) => (
            <Form>
              <div className="grid grid-cols-11 gap-4 mt-4 p-3 bg-gray-100 rounded-md">
                <motion.div
                  variants={variants.fadeInParent}
                  initial={'hidden'}
                  animate={'visible'}
                  exit={'hidden'}
                  className="col-span-8 space-y-5"
                >
                  {serverError && <Warning error={serverError} />}
                  <Heading level={3}>Labware</Heading>
                  <LabwareScanner
                    limit={1}
                    labwareCheckFunction={async (labwares, foundLabware) => {
                      const sectionExternalNames = Object.values(sectionGroupsBySample(foundLabware)).map(
                        (section) => ({
                          addresses: Array.from(section.addresses),
                          externalName: ''
                        })
                      );

                      if (sectionExternalNames.length === 0) {
                        return [
                          `${foundLabware.barcode} is invalid because it either has no filled slots or contains multiple samples in its filled slots.`
                        ];
                      } else {
                        await setValues({
                          labwareBarcode: foundLabware.barcode,
                          sectionExternalNames
                        });
                        return [];
                      }
                    }}
                    onRemove={async () => {
                      await setValues({
                        labwareBarcode: '',
                        sectionExternalNames: []
                      });
                    }}
                    enableFlaggedLabwareCheck
                  >
                    <motion.div variants={variants.fadeInWithLift}>
                      <LabwareScanTable
                        columns={[
                          labwareScanTableColumns.barcode(),
                          labwareScanTableColumns.donorId(),
                          labwareScanTableColumns.tissueType(),
                          labwareScanTableColumns.spatialLocation(),
                          labwareScanTableColumns.replicate(),
                          labwareScanTableColumns.labwareType(),
                          labwareScanTableColumns.fixative(),
                          labwareScanTableColumns.medium()
                        ]}
                      />
                    </motion.div>
                    <FormikErrorMessage name={'labwareBarcode'} />
                  </LabwareScanner>
                  <Heading level={3}>External ID(s)</Heading>
                  <motion.div>
                    <DataTable
                      columns={externalIdsTableColumns}
                      data={values.sectionExternalNames}
                      fixedHeader={true}
                      cellClassName="whitespace-normal"
                    />
                    <FormikErrorMessage name={'addressNames'} />
                  </motion.div>
                </motion.div>

                <div className="col-span-3 mt-4 p-3 border-t-4 border-sp rounded-md space-y-5 bg-sdb-400 text-gray-100">
                  <Heading level={3} showBorder={false}>
                    Summary
                  </Heading>
                  <div className="my-4 mx-4 sm:mx-auto p-1 rounded-md bg-sdb-400 italic">
                    <p className="my-3 text-white-800 text-xs leading-normal">
                      Once <span className="font-bold text-white-800">a labware</span> has been scanned in and{' '}
                      <span className="font-bold text-white-800">a valid external id</span> is given, click
                      <span className="font-bold text-white-800"> Submit</span> to record the external id on the sample.
                    </p>
                  </div>
                  <PinkButton type="submit" className="sm:w-full">
                    Submit
                  </PinkButton>
                </div>

                <OperationCompleteModal
                  show={current.matches('submitted')}
                  message={'External ID(s) successfully added'}
                >
                  <p>
                    If you wish to start the process again, click the "Reset Form" button. Otherwise you can return to
                    the Home screen.
                  </p>
                </OperationCompleteModal>
              </div>
            </Form>
          )}
        </Formik>
      </AppShell.Main>
    </AppShell>
  );
}
