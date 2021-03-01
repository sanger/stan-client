import React, { useEffect, useRef, useState } from "react";
import { GetRegistrationInfoQuery, LifeStage } from "../../types/graphql";
import { FieldArray, Form, useFormikContext } from "formik";
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
  const [currentIndex, setCurrentIndex] = useState(0);

  // The Spatial Location available will be determined by which Tissue Type is selected
  const [availableSpatialLocations, setAvailableSpatialLocations] = useState<
    GetRegistrationInfoQuery["tissueTypes"][number]["spatialLocations"]
  >([]);

  // HMDMC field is only enabled if "Human" is selected for Species
  const [isHMDMCEnabled, setIsHMDMCEnabled] = useState(false);

  const {
    setFieldValue,
    validateField,
    values,
    errors,
    touched,
  } = useFormikContext<FormValues>();

  const currentTissueType = values.tissues[currentIndex].tissueType;
  useEffect(() => {
    setAvailableSpatialLocations(
      model.registrationInfo.tissueTypes.find(
        (tt) => tt.name === currentTissueType
      )?.spatialLocations ?? []
    );
  }, [
    currentTissueType,
    model.registrationInfo.tissueTypes,
    setAvailableSpatialLocations,
  ]);

  const currentSpecies = values.tissues[currentIndex].species;
  useEffect(() => {
    if (currentSpecies !== "Human") {
      setIsHMDMCEnabled(false);
      setFieldValue(`tissues.${currentIndex}.hmdmc`, "", true);
    } else {
      setIsHMDMCEnabled(true);
      validateField(`tissues.${currentIndex}.hmdmc`);
    }
  }, [
    currentSpecies,
    setFieldValue,
    currentIndex,
    setIsHMDMCEnabled,
    validateField,
  ]);

  // Reference to the current Tissue being registered
  const tissueRef = useRef<HTMLDivElement>(null);

  const [lastBlockRef, scrollToLatestBlock] = useScrollToRef();

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
            key={values.tissues[currentIndex].clientId}
          >
            <motion.div
              variants={variants.fadeInWithLift}
              className="space-y-4"
            >
              <Heading level={3}>Donor Information</Heading>

              <FormikInput
                label="Donor ID"
                name={`tissues.${currentIndex}.donorId`}
              />

              <RadioGroup
                label="Life Stage"
                name={`tissues.${currentIndex}.lifeStage`}
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

              <FormikSelect
                label={"Species"}
                name={`tissues.${currentIndex}.species`}
                emptyOption
                className="mt-2"
              >
                {optionValues(model.registrationInfo.species, "name", "name")}
              </FormikSelect>
            </motion.div>

            <motion.div
              variants={variants.fadeInWithLift}
              className="space-y-4"
            >
              <Heading level={3}>Tissue Information</Heading>

              <FormikSelect
                label="HMDMC"
                name={`tissues.${currentIndex}.hmdmc`}
                disabled={!isHMDMCEnabled}
                emptyOption
                className="mt-2"
              >
                {optionValues(model.registrationInfo.hmdmcs, "hmdmc", "hmdmc")}
              </FormikSelect>

              <FormikSelect
                label="Tissue Type"
                emptyOption
                name={`tissues.${currentIndex}.tissueType`}
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
                    `tissues.[${currentIndex}].blocks`,
                    values.tissues[currentIndex].blocks.filter(
                      (block) => block.clientId !== null
                    )
                  );
                }}
              >
                {values.tissues[currentIndex].blocks
                  .filter((block) => block.clientId !== null)
                  .map((block, blockIndex) => {
                    return (
                      <motion.div
                        ref={
                          blockIndex ===
                          values.tissues[currentIndex].blocks.length - 1
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
                          name={`tissues.${currentIndex}.blocks.${blockIndex}.externalIdentifier`}
                        />

                        <FormikSelect
                          disabled={availableSpatialLocations.length === 0}
                          emptyOption={availableSpatialLocations.length > 0}
                          label="Spatial Location"
                          name={`tissues.${currentIndex}.blocks.${blockIndex}.spatialLocation`}
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
                          name={`tissues.${currentIndex}.blocks.${blockIndex}.replicateNumber`}
                        />

                        <FormikInput
                          label="Last Known Section Number"
                          type="number"
                          name={`tissues.${currentIndex}.blocks.${blockIndex}.lastKnownSectionNumber`}
                        />

                        <FormikSelect
                          emptyOption
                          label="Labware Type"
                          name={`tissues.${currentIndex}.blocks.${blockIndex}.labwareType`}
                        >
                          {optionValues(
                            model.availableLabwareTypes,
                            "name",
                            "name"
                          )}
                        </FormikSelect>

                        <Heading level={4} showBorder={false} className="mt-4">
                          Embedding Information
                        </Heading>

                        <FormikSelect
                          emptyOption
                          label="Fixative"
                          className="block mt-2"
                          name={`tissues.${currentIndex}.blocks.${blockIndex}.fixative`}
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
                          name={`tissues.${currentIndex}.blocks.${blockIndex}.medium`}
                        >
                          {optionValues(
                            model.registrationInfo.mediums,
                            "name",
                            "name"
                          )}
                        </FormikSelect>

                        <RadioGroup
                          label="Mould Size"
                          name={`tissues.${currentIndex}.blocks.${blockIndex}.mouldSize`}
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
                        {values.tissues[currentIndex].blocks.length > 1 && (
                          <div className="flex justify-end">
                            <PinkButton
                              type="button"
                              action="tertiary"
                              onClick={() => {
                                setFieldValue(
                                  `tissues[${currentIndex}].blocks[${blockIndex}].clientId`,
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
              <FieldArray name={`tissues.${currentIndex}.blocks`}>
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
                    setFieldValue(`tissues[${currentIndex}].clientId`, null);
                    if (currentIndex > 0) {
                      setCurrentIndex(currentIndex - 1);
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
                currentFormIndex={currentIndex}
                setCurrentFormIndex={setCurrentIndex}
                onNewTissueButton={() => {
                  tissueHelpers.push(getInitialTissueValues());
                  setCurrentIndex(currentIndex + 1);
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
};

export default RegistrationForm;
