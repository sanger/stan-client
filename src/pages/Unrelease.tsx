import React from 'react';
import StanForm from './StanForm';
import { stanCore } from '../lib/sdk';
import { LabwareFieldsFragment, UnreleaseMutation, UnreleaseRequest } from '../types/sdk';
import * as Yup from 'yup';
import LabwareScanner from '../components/labwareScanner/LabwareScanner';
import LabwareScanPanel from '../components/labwareScanPanel/LabwareScanPanel';
import columns from '../components/dataTableColumns/labwareColumns';
import { FormikErrorMessage } from '../components/forms';
import { motion } from 'framer-motion';
import variants from '../lib/motionVariants';
import Heading from '../components/Heading';
import MutedText from '../components/MutedText';
import { hasBlock } from '../lib/helpers/labwareHelper';
import { CellProps, Column } from 'react-table';
import FormikInput from '../components/forms/Input';
import { FieldArray } from 'formik';
import { identity } from 'lodash';
import WorkNumberSelect from '../components/WorkNumberSelect';

const validationSchema = Yup.object().shape({
  labware: Yup.array()
    .label('Labware')
    .min(1, 'Please scan in at least 1 labware')
    .of(
      Yup.object().shape({
        barcode: Yup.string().required(),
        highestSection: Yup.number().min(0, 'Section number must be greater than or equal to 0').notRequired(),
        workNumber: Yup.string().required('SGP Number is a required field')
      })
    )
});

export default function Unrelease() {
  const [workNumber, setWorkNumber] = React.useState('');
  return (
    <StanForm<UnreleaseRequest, UnreleaseMutation>
      title={'Unrelease'}
      onSubmit={(request) => stanCore.Unrelease({ request })}
      validationSchema={validationSchema}
      initialValues={{
        labware: []
      }}
      summary={(props) => (
        <p>
          <span className="font-bold">{props.values.labware.length}</span> labware scanned for Unrelease.
        </p>
      )}
    >
      {(formikProps) => (
        <motion.div variants={variants.fadeInWithLift}>
          <motion.div variants={variants.fadeInWithLift} className={'mb-8'}>
            <Heading level={3}>SGP Number</Heading>
            <p className="mt-2">Please select an SGP number to associate with all labware</p>
            <motion.div variants={variants.fadeInWithLift} className="mt-4 md:w-1/2">
              <WorkNumberSelect
                onWorkNumberChange={(workNumber) => {
                  setWorkNumber(workNumber);
                  formikProps.values.labware.forEach((lw) => (lw.workNumber = workNumber));
                }}
              />
            </motion.div>
          </motion.div>
          <motion.div variants={variants.fadeInWithLift} className="space-y-4">
            <Heading level={3}>Labware</Heading>
            <MutedText>Please scan in the labware you wish to unrelease.</MutedText>
            <FieldArray name={'labware'}>
              {(helpers) => (
                <LabwareScanner
                  onAdd={(lw) =>
                    helpers.push({
                      barcode: lw.barcode,
                      highestSection: hasBlock(lw) ? lw.slots[0].blockHighestSection : undefined,
                      workNumber: workNumber
                    })
                  }
                  onRemove={(labware, index) => helpers.remove(index)}
                >
                  <LabwareScanPanel
                    columns={[columns.barcode(), columns.externalName(), sectionNumberInputIfBlock(formikProps.values)]}
                  />
                </LabwareScanner>
              )}
            </FieldArray>
            <FormikErrorMessage name={'barcodes'} />
          </motion.div>
        </motion.div>
      )}
    </StanForm>
  );
}

/**
 * Column that will display a number input if the labware contains a block
 */
function sectionNumberInputIfBlock(unreleaseRequest: UnreleaseRequest): Column<LabwareFieldsFragment> {
  return {
    Header: 'Highest Section for Block',
    accessor: identity,
    Cell: (props: CellProps<LabwareFieldsFragment>) => {
      const labwareIndex = unreleaseRequest.labware.findIndex((lw) => lw.barcode === props.value.barcode);

      return hasBlock(props.value) ? (
        <FormikInput label={''} name={`labware.${labwareIndex}.highestSection`} type={'number'} />
      ) : null;
    }
  };
}
