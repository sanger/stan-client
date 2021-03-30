import React from "react";
import Success from "../../components/notifications/Success";
import BlueButton from "../../components/buttons/BlueButton";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { LabwareFieldsFragment } from "../../types/graphql";
import variants from "../../lib/motionVariants";
import DataTable from "../../components/DataTable";
import LabelPrinter from "../../components/LabelPrinter";
import PinkButton from "../../components/buttons/PinkButton";
import ButtonBar from "../../components/ButtonBar";
import AppShell from "../../components/AppShell";
import { Column } from "react-table";

interface RegistrationSuccessProps {
  labware: LabwareFieldsFragment[];
  columns: Column<LabwareFieldsFragment>[];
}

const RegistrationSuccess: React.FC<RegistrationSuccessProps> = ({
  labware,
  columns,
}) => {
  return (
    <AppShell>
      <AppShell.Header>
        <AppShell.Title>Registration</AppShell.Title>
      </AppShell.Header>
      <AppShell.Main>
        <motion.div
          variants={variants.fadeInParent}
          initial={"hidden"}
          animate={"visible"}
          className="max-w-screen-xl mx-auto space-y-4"
        >
          <motion.div variants={variants.fadeInWithLift}>
            <Success message={"Registration complete"} />
          </motion.div>

          <motion.div
            variants={variants.fadeInWithLift}
            className="flex flex-col"
          >
            <DataTable columns={columns} data={labware} />
          </motion.div>

          <div className="flex flex-row items-center sm:justify-end">
            <motion.div
              variants={variants.fadeInWithLift}
              className="sm:max-w-xl w-full border-gray-200 p-4 rounded-md bg-gray-100 shadow"
            >
              <LabelPrinter labwares={labware} />
            </motion.div>
          </div>
        </motion.div>
      </AppShell.Main>

      <ButtonBar>
        <Link to={"/store"}>
          <BlueButton action="secondary">Store</BlueButton>
        </Link>
        <Link to={"/"}>
          <PinkButton action="primary">Return to Dashboard</PinkButton>
        </Link>
      </ButtonBar>
    </AppShell>
  );
};

export default RegistrationSuccess;
