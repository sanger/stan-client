import React from "react";
import Success from "../../components/notifications/Success";
import BlueButton from "../../components/buttons/BlueButton";
import PinkButton from "../../components/buttons/PinkButton";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { RegisterTissuesMutation } from "../../types/graphql";
import variants from "../../lib/motionVariants";
import Table, {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
} from "../../components/Table";

interface RegistrationSuccessProps {
  result: RegisterTissuesMutation;
}

const RegistrationSuccess = ({ result }: RegistrationSuccessProps) => {
  return (
    <motion.div
      variants={variants.fadeInParent}
      initial={"hidden"}
      animate={"visible"}
      className="max-w-screen-lg mx-auto space-y-4"
    >
      <motion.div variants={variants.fadeInWithLift}>
        <Success
          message={"Your tissue blocks have been successfully registered"}
        />
      </motion.div>

      <motion.div variants={variants.fadeInWithLift} className="flex flex-col">
        <Table>
          <TableHead>
            <tr>
              <TableHeader>Labware Barcode</TableHeader>
              <TableHeader>Labware Type</TableHeader>
              <TableHeader>Labware ExternalId</TableHeader>
            </tr>
          </TableHead>
          <TableBody>
            {result.register?.labware.map((labware, index) => (
              <tr key={index}>
                <TableCell>{labware.barcode}</TableCell>
                <TableCell>{labware.labwareType.name}</TableCell>
                <TableCell>
                  {labware.slots[0]?.samples[0]?.tissue.externalName}
                </TableCell>
              </tr>
            ))}
          </TableBody>
        </Table>
      </motion.div>

      <motion.div
        variants={variants.fadeInWithLift}
        className="flex flex-row items-center space-x-2"
      >
        <label className="block">
          <select className="form-select block">
            <option>cgaptestbc</option>
          </select>
        </label>

        <div>
          <PinkButton>Print</PinkButton>
        </div>
      </motion.div>

      <motion.div
        variants={variants.fadeInWithLift}
        className="flex flex-row items-center justify-end space-x-2"
      >
        <BlueButton action="secondary" disabled={true}>
          Store
        </BlueButton>

        <Link to={"/"}>
          <BlueButton>Return to Dashboard</BlueButton>
        </Link>
      </motion.div>
    </motion.div>
  );
};

export default RegistrationSuccess;
