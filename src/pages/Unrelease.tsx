import React from 'react';
import StanForm from './StanForm';
import { stanCore } from '../lib/sdk';
import {
  LabwareFieldsFragment,
  LabwareFlaggedFieldsFragment,
  UnreleaseLabware,
  UnreleaseMutation,
  UnreleaseRequest
} from '../types/sdk';
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
import { parseQueryString } from '../lib/helpers';
import { useLocation } from 'react-router-dom';
import LoadingSpinner from '../components/icons/LoadingSpinner';

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

const toUnreleaseLabware = (labware: LabwareFlaggedFieldsFragment, workNumber: string): UnreleaseLabware => ({
  barcode: labware.barcode,
  highestSection: hasBlock(labware) ? labware.slots[0].blockHighestSection : undefined,
  workNumber
});

const fetchInitialLabware = async (initialBarcodes: string[]) => {
  if (initialBarcodes.length === 0) return [];
  return await Promise.all(
    initialBarcodes.map((barcode) => stanCore.FindFlaggedLabware({ barcode }).then((labware) => labware.labwareFlagged))
  );
};

export default function Unrelease() {
  const workNumberRef = React.useRef('');

  const location = useLocation();

  const initialBarcodes: string[] = React.useMemo(() => {
    const queryString = parseQueryString(location.search);
    if (!queryString['barcode']) return [];
    return Array.isArray(queryString['barcode'])
      ? queryString['barcode'].map((barcode: string) => decodeURIComponent(barcode))
      : [decodeURIComponent(queryString['barcode'])];
  }, [location.search]);

  const [isFetching, setIsFetching] = React.useState(true);
  const initialLabware = React.useRef<LabwareFlaggedFieldsFragment[]>([]);
  fetchInitialLabware(initialBarcodes)
    .then((labwares) => {
      initialLabware.current = labwares;
      setIsFetching(false);
    })
    .catch((error) => {
      console.error(error);
    })
    .finally(() => {
      setIsFetching(false);
    });

  if (isFetching) {
    return <LoadingSpinner />;
  }
  return (
    <StanForm<UnreleaseRequest, UnreleaseMutation>
      title={'Unrelease'}
      onSubmit={(request) => stanCore.Unrelease({ request })}
      validationSchema={validationSchema}
      initialValues={{
        labware: initialLabware.current.map((lw) => toUnreleaseLabware(lw, workNumberRef.current))
      }}
      summary={(props) => (
        <p>
          <span className="font-bold">{props.values.labware.length}</span> labware scanned for Unrelease.
        </p>
      )}
    >
      {(formikProps) => {
        return (
          <motion.div variants={variants.fadeInWithLift}>
            <motion.div variants={variants.fadeInWithLift} className={'mb-8'}>
              <Heading level={3}>SGP Number</Heading>
              <p className="mt-2">Please select an SGP number to associate with all labware</p>
              <motion.div variants={variants.fadeInWithLift} className="mt-4 md:w-1/2">
                <WorkNumberSelect
                  onWorkNumberChange={(workNumber) => {
                    workNumberRef.current = workNumber;
                    formikProps.values.labware.forEach((lw) => (lw.workNumber = workNumber));
                  }}
                />
              </motion.div>
            </motion.div>

            <motion.div variants={variants.fadeInWithLift} className="space-y-4">
              <Heading level={3}>Labware</Heading>
              <MutedText>Please scan in the labware you wish to unrelease.</MutedText>
              <FieldArray name={'labware'}>
                {(helpers) => {
                  return (
                    <LabwareScanner
                      initialLabwares={initialLabware.current}
                      onAdd={(lw) => helpers.push(toUnreleaseLabware(lw, workNumberRef.current))}
                      onRemove={(labware, index) => helpers.remove(index)}
                    >
                      <LabwareScanPanel
                        columns={[
                          columns.barcode(),
                          columns.externalName(),
                          sectionNumberInputIfBlock(formikProps.values)
                        ]}
                      />
                    </LabwareScanner>
                  );
                }}
              </FieldArray>
              <FormikErrorMessage name={'barcodes'} />
            </motion.div>
          </motion.div>
        );
      }}
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
