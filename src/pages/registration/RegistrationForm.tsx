import React, { useRef, useState } from "react";
import { LifeStage, SpatialLocation } from "../../types/graphql";
import { FieldArray, Form, Formik } from "formik";
import { AnimatePresence, motion } from "framer-motion";
import Heading from "../../components/Heading";
import FormikInput from "../../components/forms/Input";
import RadioGroup, { RadioButton } from "../../components/forms/RadioGroup";
import { enumKeys } from "../../lib/helpers";
import FormikSelect from "../../components/forms/Select";
import { optionValues } from "../../components/forms";
import PinkButton from "../../components/buttons/PinkButton";
import BlueButton from "../../components/buttons/BlueButton";
import SummaryBox from "./SummaryBox";
import variants from "../../lib/motionVariants";
import GrayBox, { Sidebar } from "../../components/layouts/GrayBox";
import { useScrollToRef } from "../../lib/hooks";
import {
  FormValues,
  getInitialBlockValues,
  getInitialTissueValues,
} from "../../lib/services/registrationService";
import RegistrationPresentationModel from "../../lib/presentationModels/registrationPresentationModel";

interface RegistrationFormParams {
  model: RegistrationPresentationModel;
}

const RegistrationForm = ({ model }: RegistrationFormParams) => {
  // The tissue we are currently looking at.
  const [currentTissueIndex, setCurrentTissueIndex] = useState(0);

  // Initial values provided to Formik
  const initialValues: FormValues = { tissues: [getInitialTissueValues()] };

  // The Spatial Location available will be determined by which Tissue Type is selected
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
      validationSchema={model.context.registrationSchema}
      onSubmit={(values) => {
        model.submitForm(values);
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

                    <FormikInput
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

                    <FormikSelect
                      label="HMDMC"
                      name={`tissues.${currentTissueIndex}.hmdmc`}
                      emptyOption
                      className="mt-2"
                    >
                      {optionValues(
                        model.registrationInfo.hmdmcs,
                        "hmdmc",
                        "hmdmc"
                      )}
                    </FormikSelect>

                    <FormikSelect
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
                          model.registrationInfo.tissueTypes.find(
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
                        model.registrationInfo.tissueTypes,
                        "name",
                        "name"
                      )}
                    </FormikSelect>
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
                              <FormikInput
                                label="External Identifier"
                                name={`tissues.${currentTissueIndex}.blocks.${blockIndex}.externalIdentifier`}
                              />

                              <FormikSelect
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
                              </FormikSelect>

                              <FormikInput
                                label="Replicate Number"
                                type="number"
                                name={`tissues.${currentTissueIndex}.blocks.${blockIndex}.replicateNumber`}
                              />

                              <FormikInput
                                label="Last Known Section Number"
                                type="number"
                                name={`tissues.${currentTissueIndex}.blocks.${blockIndex}.lastKnownSectionNumber`}
                              />

                              <FormikSelect
                                emptyOption
                                label="Labware Type"
                                name={`tissues.${currentTissueIndex}.blocks.${blockIndex}.labwareType`}
                              >
                                {optionValues(
                                  model.availableLabwareTypes,
                                  "name",
                                  "name"
                                )}
                              </FormikSelect>

                              <Heading
                                level={4}
                                showBorder={false}
                                className="mt-4"
                              >
                                Embedding Information
                              </Heading>

                              <FormikSelect
                                emptyOption
                                label="Fixative"
                                className="block mt-2"
                                name={`tissues.${currentTissueIndex}.blocks.${blockIndex}.fixative`}
                              >
                                {optionValues(
                                  model.registrationInfo.fixatives,
                                  "name",
                                  "name"
                                )}
                              </FormikSelect>

                              <FormikSelect
                                emptyOption
                                label="Medium"
                                className="block mt-2"
                                name={`tissues.${currentTissueIndex}.blocks.${blockIndex}.medium`}
                              >
                                {optionValues(
                                  model.registrationInfo.mediums,
                                  "name",
                                  "name"
                                )}
                              </FormikSelect>

                              <RadioGroup
                                label="Mould Size"
                                name={`tissues.${currentTissueIndex}.blocks.${blockIndex}.mouldSize`}
                              >
                                {model.registrationInfo.mouldSizes.map(
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
                      submitting={model.isSubmitting()}
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
