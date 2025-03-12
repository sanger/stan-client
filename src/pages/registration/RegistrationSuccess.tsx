import React from 'react';
import Success from '../../components/notifications/Success';
import BlueButton from '../../components/buttons/BlueButton';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from '../../dependencies/motion';
import { LabwareFieldsFragment } from '../../types/sdk';
import variants from '../../lib/motionVariants';
import DataTable from '../../components/DataTable';
import LabelPrinter from '../../components/LabelPrinter';
import PinkButton from '../../components/buttons/PinkButton';
import ButtonBar from '../../components/ButtonBar';
import AppShell from '../../components/AppShell';
import { Column } from 'react-table';
import { createSessionStorageForLabwareAwaiting } from '../../types/stan';
import { SampleDataTableRow } from '../../components/dataTableColumns/sampleColumns';

/**Represent an object containing LabwareFieldsFragment member**/
export interface LabwareContainType extends Object {
  labware: LabwareFieldsFragment;
}
/**Registration results on success should be either of LabwareContainType ( to accommodate any fields additional to LabwareFieldsFragment members) or LabwareFieldsFragment**/
type RegistrationSuccessProps<T extends Required<LabwareContainType> | LabwareFieldsFragment | SampleDataTableRow> = {
  successData: T[];
  columns: Column<T>[];
  labware: LabwareFieldsFragment[];
};

const RegistrationSuccess = <T extends Required<LabwareContainType> | LabwareFieldsFragment | SampleDataTableRow>({
  successData,
  columns,
  labware
}: RegistrationSuccessProps<T>) => {
  const navigate = useNavigate();

  return (
    <AppShell>
      <AppShell.Header>
        <AppShell.Title>Registration</AppShell.Title>
      </AppShell.Header>
      <AppShell.Main>
        <motion.div
          variants={variants.fadeInParent}
          initial={'hidden'}
          animate={'visible'}
          className="max-w-screen-xl mx-auto space-y-4"
        >
          <motion.div variants={variants.fadeInWithLift}>
            <Success message={'Registration complete'} />
          </motion.div>

          <motion.div variants={variants.fadeInWithLift} className="flex flex-col">
            <DataTable columns={columns} data={successData} />
          </motion.div>

          <div className="flex flex-row items-center sm:justify-end">
            <motion.div
              variants={variants.fadeInWithLift}
              className="sm:max-w-xl w-full border-gray-200 p-4 rounded-md bg-gray-100 shadow-md"
            >
              {<LabelPrinter labwares={labware} />}
            </motion.div>
          </div>
        </motion.div>
      </AppShell.Main>

      <ButtonBar>
        <Link to={'/store'}>
          <BlueButton
            action="secondary"
            onClick={() => {
              if (labware.length > 0) {
                createSessionStorageForLabwareAwaiting(labware);
              }
              navigate('/store');
            }}
          >
            Store
          </BlueButton>
        </Link>
        <Link to={'/'}>
          <PinkButton action="primary">Return Home</PinkButton>
        </Link>
      </ButtonBar>
    </AppShell>
  );
};

export default RegistrationSuccess;
