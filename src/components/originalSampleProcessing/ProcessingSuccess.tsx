import React from 'react';
import Success from '../notifications/Success';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LabwareFieldsFragment } from '../../types/sdk';
import variants from '../../lib/motionVariants';
import DataTable from '../DataTable';
import LabelPrinter from '../LabelPrinter';
import ButtonBar from '../ButtonBar';
import { Column } from 'react-table';
import Heading from '../Heading';
import { ModalBody } from '../Modal';
import BlueButton from '../buttons/BlueButton';
interface ProcessingSuccessProps {
  labware: LabwareFieldsFragment[];
  columns: Column<LabwareFieldsFragment>[];
  successMessage: string;
}

const ProcessingSuccess: React.FC<ProcessingSuccessProps> = ({ labware, columns, successMessage }) => {
  return (
    <div className="space-y-6">
      <Heading level={2}>{'Operation Complete'}</Heading>
      <ModalBody>{<Success message={successMessage} />}</ModalBody>
      <motion.div variants={variants.fadeInWithLift} className="flex flex-col">
        <DataTable columns={columns} data={labware} />
      </motion.div>
      <div className="flex flex-row items-center sm:justify-end">
        <motion.div
          variants={variants.fadeInWithLift}
          className="sm:max-w-xl w-full border-gray-200 p-4 rounded-md bg-gray-100 shadow"
        >
          <LabelPrinter
            labwares={labware.filter(
              (lw) => lw.labwareType.labelType !== null && lw.labwareType.labelType !== undefined
            )}
          />
        </motion.div>
      </div>

      <ButtonBar>
        <Link to={'/'}>
          <BlueButton action="primary">Return Home</BlueButton>
        </Link>
      </ButtonBar>
    </div>
  );
};

export default ProcessingSuccess;
