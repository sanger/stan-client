import React from 'react';
import StanForm from './StanForm';
import { stanCore } from '../lib/sdk';
import { LabwareFieldsFragment, LabwareFlaggedFieldsFragment, UnreleaseMutation } from '../types/sdk';
import * as Yup from 'yup';
import LabwareScanner from '../components/labwareScanner/LabwareScanner';
import LabwareScanPanel from '../components/labwareScanPanel/LabwareScanPanel';
import columns from '../components/dataTableColumns/labwareColumns';
import { FormikErrorMessage } from '../components/forms';
import { motion } from '../dependencies/motion';
import variants from '../lib/motionVariants';
import Heading from '../components/Heading';
import MutedText from '../components/MutedText';
import { hasBlock } from '../lib/helpers/labwareHelper';
import { CellProps, Column } from 'react-table';
import FormikInput from '../components/forms/Input';
import { identity } from 'lodash';
import WorkNumberSelect from '../components/WorkNumberSelect';
import { parseQueryString } from '../lib/helpers';
import { useLocation } from 'react-router-dom';
import LoadingSpinner from '../components/icons/LoadingSpinner';
import { FieldArray } from 'formik';

type UnreleaseLabwareForm = LabwareFlaggedFieldsFragment & { blockHighestSection?: number | null };

type UnreleaseRequestForm = {
  workNumber: string;
  labware: Array<UnreleaseLabwareForm>;
};

const validationSchema = Yup.object().shape({
  workNumber: Yup.string().required('SGP Number is a required field'),
  labware: Yup.array()
    .label('Labware')
    .min(1, 'Please scan in at least 1 labware')
    .of(
      Yup.object().shape({
        barcode: Yup.string().required(),
        blockHighestSection: Yup.number().min(0, 'Section number must be greater than or equal to 0').notRequired()
      })
    )
});

const fetchInitialLabware = async (initialBarcodes: string[]) => {
  if (initialBarcodes.length === 0) return [];
  return await Promise.all(
    initialBarcodes.map((barcode) => stanCore.FindFlaggedLabware({ barcode }).then((labware) => labware.labwareFlagged))
  );
};

const blockHighestSection = (labware: LabwareFlaggedFieldsFragment) => {
  if (hasBlock(labware)) {
    return labware.slots[0].blockHighestSection;
  }
  return undefined;
};

export default function Unrelease() {
  const location = useLocation();

  const initialBarcodes: string[] = React.useMemo(() => {
    const queryString = parseQueryString(location.search);
    if (!queryString['barcode']) return [];
    return Array.isArray(queryString['barcode'])
      ? queryString['barcode'].map((barcode: string) => decodeURIComponent(barcode))
      : [decodeURIComponent(queryString['barcode'])];
  }, [location.search]);
  const [isFetching, setIsFetching] = React.useState(true);
  const initialLabware = React.useRef<UnreleaseLabwareForm[]>([]);

  if (isFetching) {
    fetchInitialLabware(initialBarcodes)
      .then((labwares) => {
        initialLabware.current = labwares.map((lw) => ({ ...lw, blockHighestSection: blockHighestSection(lw) }));
        setIsFetching(false);
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {
        setIsFetching(false);
      });

    return <LoadingSpinner />;
  }
  return (
    <StanForm<UnreleaseRequestForm, UnreleaseMutation>
      title={'Unrelease'}
      onSubmit={(request) => {
        return stanCore.Unrelease({
          request: {
            labware: request.labware.map((lw) => ({
              barcode: lw.barcode,
              highestSection: lw.blockHighestSection,
              workNumber: request.workNumber
            }))
          }
        });
      }}
      validationSchema={validationSchema}
      initialValues={{ workNumber: '', labware: initialLabware.current }}
      summary={(props) => (
        <p>
          <span className="font-bold">{props.values.labware.length}</span> labware scanned for Unrelease.
        </p>
      )}
      displayStoreOption={true}
    >
      {({ setFieldValue }) => (
        <motion.div variants={variants.fadeInWithLift}>
          <motion.div variants={variants.fadeInWithLift} className={'mb-8'}>
            <Heading level={3}>SGP Number</Heading>
            <p className="mt-2">Please select an SGP number to associate with all labware</p>
            <motion.div variants={variants.fadeInWithLift} className="mt-4 md:w-1/2">
              <WorkNumberSelect
                onWorkNumberChange={async (workNumber) => {
                  await setFieldValue('workNumber', workNumber);
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
                  initialLabwares={initialLabware.current}
                  onAdd={(lw) => helpers.push({ ...lw, blockHighestSection: blockHighestSection(lw) })}
                  onRemove={(labware, index) => helpers.remove(index)}
                >
                  <LabwareScanPanel
                    columns={[
                      columns.barcode(),
                      columns.externalName(),
                      sectionNumberInputIfBlock(helpers.form.values.labware)
                    ]}
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
function sectionNumberInputIfBlock(labware: UnreleaseLabwareForm[]): Column<LabwareFieldsFragment> {
  return {
    Header: 'Highest Section for Block',
    accessor: identity,
    Cell: (props: CellProps<LabwareFieldsFragment>) => {
      const labwareIndex = labware.findIndex((lw) => lw.barcode === props.value.barcode);
      if (labwareIndex > -1 && labware[labwareIndex].blockHighestSection !== undefined) {
        return <FormikInput label={''} name={`labware.${labwareIndex}.blockHighestSection`} type={'number'} />;
      }
      return '-';
    }
  };
}
