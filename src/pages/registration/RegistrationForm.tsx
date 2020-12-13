import React, { useRef, useState } from "react";
import {
  GetRegistrationInfoQuery,
  LifeStage,
  SpatialLocation,
} from "../../types/graphql";
import * as Yup from "yup";
import { FieldArray, Form, Formik } from "formik";
import { AnimatePresence, motion } from "framer-motion";
import Heading from "../../components/Heading";
import Input from "../../components/forms/Input";
import RadioGroup, { RadioButton } from "../../components/forms/RadioGroup";
import { enumKeys } from "../../lib/helpers";
import Select from "../../components/forms/Select";
import { optionValues } from "../../components/forms";
import PinkButton from "../../components/buttons/PinkButton";
import BlueButton from "../../components/buttons/BlueButton";
import SummaryBox from "./SummaryBox";
import variants from "../../lib/motionVariants";
import GrayBox, { Sidebar } from "../../components/layouts/GrayBox";
import { useScrollToRef } from "../../hooks";

export interface FormValues {
  tissues: FormTissueValues[];
}

export interface FormTissueValues {
  clientId: number;
  donorId: string;
  lifeStage: LifeStage;
  hmdmc: string;
  tissueType: string;
  blocks: FormBlockValues[];
}

export interface FormBlockValues {
  clientId: number;
  externalIdentifier: string;
  spatialLocation: number;
  replicateNumber: number;
  lastKnownSectionNumber: number;
  labwareType: string;
  fixative: string;
  medium: string;
  mouldSize: string;
}

function getInitialBlockValues(): FormBlockValues {
  return {
    clientId: Date.now(),
    externalIdentifier: "",
    spatialLocation: -1, // Initialise it as invalid so user has to select something
    replicateNumber: 0,
    lastKnownSectionNumber: 0,
    labwareType: "",
    fixative: "",
    medium: "",
    mouldSize: "",
  };
}

function getInitialTissueValues(): FormTissueValues {
  return {
    clientId: Date.now(),
    donorId: "",
    lifeStage: LifeStage.Fetal,
    hmdmc: "",
    tissueType: "",
    blocks: [getInitialBlockValues()],
  };
}

interface RegistrationFormParams {
  submitting: boolean;
  registrationInfo: GetRegistrationInfoQuery;
  registrationSchema: Yup.ObjectSchema;
  onSubmission: (values: FormValues) => void;
}

const RegistrationForm = ({
  submitting,
  registrationInfo,
  registrationSchema,
  onSubmission,
}: RegistrationFormParams) => {
  // The tissue we are currently looking at.
  const [currentTissueIndex, setCurrentTissueIndex] = useState(0);

  // Initial values provided to Formik
  const initialValues: FormValues = { tissues: [getInitialTissueValues()] };

  // The Spatial Locations available will be determined by which Tissue Type is selected
  const [availableSpatialLocations, setAvailableSpatialLocations] = useState<
    Array<
      { __typename?: "SpatialLocation" } & Pick<
        SpatialLocation,
        "name" | "code"
      >
    >
  >([]);

  // Reference to the current Tissue being registered
  const tissueRef = useRef<HTMLDivElement>(null);

  const [lastBlockRef, scrollToLatestBlock] = useScrollToRef();

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={registrationSchema}
      onSubmit={(values) => {
        onSubmission(values);
      }}
    >
      {({ values, setFieldValue, errors, touched }) => {
        return (
          <Form>
            <GrayBox>
              <AnimatePresence
                exitBeforeEnter
                onExitComplete={() => {
                  setFieldValue(
                    "tissues",
                    values.tissues.filter((t) => !!t.clientId)
                  );
                }}
              >
                <motion.div
                  ref={tissueRef}
                  variants={variants.fadeInParent}
                  initial={"hidden"}
                  animate={"visible"}
                  exit={"hidden"}
                  className="md:w-2/3 space-y-6"
                  key={values.tissues[currentTissueIndex].clientId}
                >
                  <motion.div
                    variants={variants.fadeInWithLift}
                    className="space-y-4"
                  >
                    <Heading level={3}>Donor Information</Heading>

                    <Input
                      label="Donor ID"
                      name={`tissues.${currentTissueIndex}.donorId`}
                    />

                    <RadioGroup
                      label="Life Stage"
                      name={`tissues.${currentTissueIndex}.lifeStage`}
                    >
                      {enumKeys(LifeStage).map((key, index) => {
                        return (
                          <RadioButton
                            key={index}
                            name={key}
                            value={LifeStage[key]}
                          />
                        );
                      })}
                    </RadioGroup>
                  </motion.div>

                  <motion.div
                    variants={variants.fadeInWithLift}
                    className="space-y-4"
                  >
                    <Heading level={3}>Tissue Information</Heading>

                    <Select
                      label="HMDMC"
                      name={`tissues.${currentTissueIndex}.hmdmc`}
                      emptyOption
                      className="mt-2"
                    >
                      {optionValues(registrationInfo.hmdmcs, "hmdmc", "hmdmc")}
                    </Select>

                    <Select
                      onChange={(e: React.FormEvent<HTMLSelectElement>) => {
                        // Unset any selected spatial locations in the blocks for this tissue
                        values.tissues[currentTissueIndex].blocks.forEach(
                          (_, index) => {
                            setFieldValue(
                              `tissues.${currentTissueIndex}.blocks.${index}.spatialLocation`,
                              "",
                              false
                            );
                          }
                        );

                        // Set the tissue type
                        setFieldValue(
                          `tissues.${currentTissueIndex}.tissueType`,
                          e.currentTarget.value
                        );

                        // Set the available spatial locations for this tissue type
                        setAvailableSpatialLocations(
                          registrationInfo.tissueTypes.find(
                            (tt) => tt.name === e.currentTarget.value
                          )?.spatialLocations ?? []
                        );
                      }}
                      label="Tissue Type"
                      emptyOption
                      name={`tissues.${currentTissueIndex}.tissueType`}
                      className="mt-2"
                    >
                      {optionValues(
                        registrationInfo.tissueTypes,
                        "name",
                        "name"
                      )}
                    </Select>
                  </motion.div>

                  <motion.div
                    variants={variants.fadeInWithLift}
                    className="space-y-4"
                  >
                    <Heading level={3}>Block Information</Heading>
                    <AnimatePresence
                      onExitComplete={() => {
                        setFieldValue(
                          `tissues.[${currentTissueIndex}].blocks`,
                          values.tissues[currentTissueIndex].blocks.filter(
                            (block) => block.clientId !== null
                          )
                        );
                      }}
                    >
                      {values.tissues[currentTissueIndex].blocks
                        .filter((block) => block.clientId !== null)
                        .map((block, blockIndex) => {
                          return (
                            <motion.div
                              ref={
                                blockIndex ===
                                values.tissues[currentTissueIndex].blocks
                                  .length -
                                  1
                                  ? lastBlockRef
                                  : null
                              }
                              layout
                              key={block.clientId}
                              variants={variants.fadeIn}
                              animate={"visible"}
                              exit={"hidden"}
                              className="relative p-4 shadow-lg bg-white space-y-4"
                            >
                              <Input
                                label="External Identifier"
                                name={`tissues.${currentTissueIndex}.blocks.${blockIndex}.externalIdentifier`}
                              />

                              <Select
                                disabled={
                                  availableSpatialLocations.length === 0
                                }
                                emptyOption={
                                  availableSpatialLocations.length > 0
                                }
                                label="Spatial Location"
                                name={`tissues.${currentTissueIndex}.blocks.${blockIndex}.spatialLocation`}
                              >
                                {optionValues(
                                  availableSpatialLocations,
                                  "code",
                                  "code"
                                )}
                              </Select>

                              <Input
                                label="Replicate Number"
                                type="number"
                                name={`tissues.${currentTissueIndex}.blocks.${blockIndex}.replicateNumber`}
                              />

                              <Input
                                label="Last Known Section Number"
                                type="number"
                                name={`tissues.${currentTissueIndex}.blocks.${blockIndex}.lastKnownSectionNumber`}
                              />

                              <Select
                                emptyOption
                                label="Labware Type"
                                name={`tissues.${currentTissueIndex}.blocks.${blockIndex}.labwareType`}
                              >
                                {optionValues(
                                  registrationInfo.labwareTypes,
                                  "name",
                                  "name"
                                )}
                              </Select>

                              <Heading
                                level={4}
                                showBorder={false}
                                className="mt-4"
                              >
                                Embedding Information
                              </Heading>

                              <Select
                                emptyOption
                                label="Fixative"
                                className="block mt-2"
                                name={`tissues.${currentTissueIndex}.blocks.${blockIndex}.fixative`}
                              >
                                {optionValues(
                                  registrationInfo.fixatives,
                                  "name",
                                  "name"
                                )}
                              </Select>

                              <Select
                                emptyOption
                                label="Medium"
                                className="block mt-2"
                                name={`tissues.${currentTissueIndex}.blocks.${blockIndex}.medium`}
                              >
                                {optionValues(
                                  registrationInfo.mediums,
                                  "name",
                                  "name"
                                )}
                              </Select>

                              <RadioGroup
                                label="Mould Size"
                                name={`tissues.${currentTissueIndex}.blocks.${blockIndex}.mouldSize`}
                              >
                                {registrationInfo.mouldSizes.map(
                                  (ms, index) => {
                                    return (
                                      <RadioButton
                                        key={index}
                                        name={ms.name}
                                        value={ms.name}
                                      />
                                    );
                                  }
                                )}
                              </RadioGroup>

                              {/* Only show the delete button if we've got more than 1 block */}
                              {values.tissues[currentTissueIndex].blocks
                                .length > 1 && (
                                <div className="flex justify-end">
                                  <PinkButton
                                    type="button"
                                    action="tertiary"
                                    onClick={() => {
                                      setFieldValue(
                                        `tissues[${currentTissueIndex}].blocks[${blockIndex}].clientId`,
                                        null
                                      );
                                    }}
                                  >
                                    Delete Block
                                  </PinkButton>
                                </div>
                              )}
                            </motion.div>
                          );
                        })}
                    </AnimatePresence>
                  </motion.div>

                  <motion.div
                    variants={variants.fadeInWithLift}
                    className="flex flex-row items-centre justify-between"
                  >
                    <FieldArray name={`tissues.${currentTissueIndex}.blocks`}>
                      {(blockHelpers) => (
                        <BlueButton
                          type="button"
                          action="secondary"
                          className="mt-4 inline-flex"
                          onClick={() => {
                            blockHelpers.push(getInitialBlockValues());
                            scrollToLatestBlock();
                          }}
                        >
                          + Add Another Tissue Block
                        </BlueButton>
                      )}
                    </FieldArray>

                    {/* Only show the delete button if we've got more than one Tissue */}
                    {values.tissues.length > 1 && (
                      <PinkButton
                        type="button"
                        action="secondary"
                        className="mt-4 inline-flex"
                        onClick={async () => {
                          setFieldValue(
                            `tissues[${currentTissueIndex}].clientId`,
                            null
                          );
                          if (currentTissueIndex > 0) {
                            setCurrentTissueIndex(currentTissueIndex - 1);
                          }
                          tissueRef.current?.scrollIntoView({
                            behavior: "smooth",
                          });
                        }}
                      >
                        - Remove Tissue
                      </PinkButton>
                    )}
                  </motion.div>
                </motion.div>
                )
              </AnimatePresence>

              <Sidebar>
                <FieldArray name={`tissues`}>
                  {(tissueHelpers) => (
                    <SummaryBox
                      submitting={submitting}
                      values={values}
                      errors={errors}
                      touched={touched}
                      currentFormIndex={currentTissueIndex}
                      setCurrentFormIndex={setCurrentTissueIndex}
                      onNewTissueButton={() => {
                        tissueHelpers.push(getInitialTissueValues());
                        setCurrentTissueIndex(currentTissueIndex + 1);
                        tissueRef.current?.scrollIntoView({
                          behavior: "smooth",
                        });
                      }}
                    />
                  )}
                </FieldArray>
              </Sidebar>
            </GrayBox>
          </Form>
        );
      }}
    </Formik>
  );
};

export default RegistrationForm;
