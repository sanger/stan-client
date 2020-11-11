import React from "react";
import Success from "../../components/notifications/Success";
import BlueButton from "../../components/buttons/BlueButton";
import PinkButton from "../../components/buttons/PinkButton";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { RegisterTissuesMutation } from "../../types/graphql";
import variants from "../../lib/motionVariants";

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
        <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
            <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                      Labware Barcode
                    </th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                      Labware Type
                    </th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                      External ID
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {result.register?.labware.map((labware, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-no-wrap">
                        {labware.barcode}
                      </td>
                      <td className="px-6 py-4 whitespace-no-wrap">
                        {labware.labwareType.name}
                      </td>
                      <td className="px-6 py-4 whitespace-no-wrap">
                        {labware.slots[0]?.samples[0]?.tissue.externalName}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
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
