import Heading from "../../components/Heading";
import { motion } from "framer-motion";
import GuestIcon from "../../components/icons/GuestIcon";
import EditIcon from "../../components/icons/EditIcon";
import BlockIcon from "../../components/icons/BlockIcon";
import WhiteButton from "../../components/buttons/WhiteButton";
import PinkButton from "../../components/buttons/PinkButton";
import React from "react";
import { FormikErrors, FormikTouched, FormikValues, getIn } from "formik";
import { FormTissueValues, FormValues } from "./RegistrationForm";
import Pill from "../../components/Pill";

function getNumberOfBlocks(values: FormikValues) {
  return values.tissues.reduce((memo: number, tissue: FormTissueValues) => {
    return memo + tissue.blocks.length;
  }, 0);
}

function getNumErrorsPerTissue(
  tissues: FormTissueValues[],
  errors: FormikErrors<FormValues>,
  touched: FormikTouched<FormValues>
): { [key: number]: number } {
  return tissues.reduce<{ [key: number]: number }>(
    (memo, tissue, tissueIndex) => {
      let count = 0;

      tissue.blocks.forEach((block, blockIndex) => {
        Object.keys(block).forEach((blockKey) => {
          const fieldName = `tissues[${tissueIndex}].blocks[${blockIndex}].${blockKey}`;
          if (getIn(touched, fieldName) && getIn(errors, fieldName)) {
            count++;
          }
        });
      });

      Object.keys(tissue)
        .filter((k) => k !== "blocks")
        .forEach((tissueKey) => {
          const fieldName = `tissues[${tissueIndex}].${tissueKey}`;
          if (getIn(touched, fieldName) && getIn(errors, fieldName)) {
            count++;
          }
        });

      return Object.assign(memo, { [tissue.clientId]: count });
    },
    {}
  );
}

interface SummaryBoxParams {
  submitting: boolean;
  values: FormValues;
  errors: FormikErrors<FormValues>;
  touched: FormikTouched<FormValues>;
  onNewTissueButton: () => void;
  currentFormIndex: number;
  setCurrentFormIndex: (n: number) => void;
}

const SummaryBox = ({
  submitting,
  values,
  errors,
  touched,
  onNewTissueButton,
  currentFormIndex,
  setCurrentFormIndex,
}: SummaryBoxParams) => {
  const errorCount = getNumErrorsPerTissue(values.tissues, errors, touched);

  return (
    <div className="md:w-1/3 mt-4 p-3 border-t-4 border-sp rounded-md lg:transform lg:translate-x-1/2 space-y-4 bg-sdb-400 text-gray-100">
      <div className="sticky top-0 space-y-2">
        <Heading level={3} showBorder={false}>
          Summary
        </Heading>

        <p>
          There {values.tissues.length === 1 ? "is" : "are"} currently{" "}
          <span className="font-bold">{values.tissues.length}</span> tissue(s)
          and a total of{" "}
          <span className="font-bold">{getNumberOfBlocks(values)}</span>{" "}
          block(s).
        </p>

        <div id="tissue-summaries" className="space-y-2">
          {values.tissues
            .filter((t) => t.clientId !== null)
            .map((tissue, tissueIndex) => (
              <motion.a
                layout
                initial={{ x: -100 }}
                animate={{ x: 0 }}
                href={`registration/tissues/${tissueIndex}`}
                onClick={(e) => {
                  e.preventDefault();
                  setCurrentFormIndex(tissueIndex);
                }}
                key={tissue.clientId}
                className={`group block px-2 py-1 outline-none rounded-r hover:bg-sdb-300 ${
                  tissueIndex === currentFormIndex &&
                  "border-l-4 border-sp pl-1 bg-sdb-500"
                }`}
              >
                <div className="flex flex-row items-center justify-between">
                  <div className="flex flex-row items-center justify-between">
                    <GuestIcon className="h-4 w-4 inline-block text-white" />
                    <span className="ml-1 text-sm">{tissue.donorId}</span>
                  </div>

                  <div className="flex flex-row justify-between items-center">
                    {errorCount[tissue.clientId] > 0 && (
                      <Pill color={"pink"}>
                        {errorCount[tissue.clientId]} Error
                        {errorCount[tissue.clientId] > 1 && "s"}
                      </Pill>
                    )}
                    <EditIcon className="group-hover:block hidden ml-2 h-4 w-4 text-white" />
                    <span className="group-hover:hidden ml-2 bg-white text-gray-900 rounded-full h-4 w-4 flex items-center justify-center font-semibold text-sm">
                      {tissueIndex + 1}
                    </span>
                  </div>
                </div>

                <div className="flex flex-row items-center justify-between">
                  <div>
                    <span className="text-sm">{tissue.tissueType}</span>
                  </div>

                  <div>
                    <BlockIcon className="inline-block h-4 w-4 text-white" />
                    <span className="text-sm">{tissue.blocks.length}</span>
                  </div>
                </div>
              </motion.a>
            ))}
        </div>

        <div>
          <WhiteButton
            type="button"
            action="primary"
            className="mt-2 w-full"
            onClick={(e) => {
              e.preventDefault();
              onNewTissueButton();
            }}
          >
            + Add Another Tissue
          </WhiteButton>

          <PinkButton
            loading={submitting}
            type="submit"
            className="mt-4 w-full"
          >
            Register
          </PinkButton>
        </div>
      </div>
    </div>
  );
};

export default SummaryBox;
