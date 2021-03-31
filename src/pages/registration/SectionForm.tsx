import React, { useEffect, useRef, useState } from "react";
import SlideRegistrationPresentationModel, {
  SlideRegistrationFormValues,
} from "../../lib/presentationModels/slideRegistrationPresentationModel";
import { FieldArray, useFormikContext } from "formik";
import { GetRegistrationInfoQuery, LifeStage } from "../../types/graphql";
import { useOnScreen } from "../../lib/hooks";
import { motion } from "framer-motion";
import variants from "../../lib/motionVariants";
import Pill from "../../components/Pill";
import Heading from "../../components/Heading";
import FormikInput from "../../components/forms/Input";
import RadioGroup, { RadioButton } from "../../components/forms/RadioGroup";
import { enumKeys } from "../../lib/helpers";
import FormikSelect from "../../components/forms/Select";
import { optionValues } from "../../components/forms";
import PinkButton from "../../components/buttons/PinkButton";

type SectionFormParams = {
  model: SlideRegistrationPresentationModel;
  /**
   * The address of this slot this section is in e.g. A1
   */
  slotAddress: string;

  /**
   * The index of this section within the slot
   */
  sectionIndex: number;

  /**
   * The index of the current labware on screen
   */
  currentIndex: number;

  /**
   * Should this section scrool into view now
   */
  scrollIntoView: boolean;

  /**
   * Should this section's "Remove Section" button be showing?
   */
  showRemoveSectionButton: boolean;

  /**
   * Callback that gets called when this section scrolls into screen
   * @param slotAddress this section's slot address
   */
  onScreen: (slotAddress: string) => void;
};

export default function SectionForm({
  model,
  slotAddress,
  sectionIndex,
  currentIndex,
  onScreen,
  showRemoveSectionButton = false,
  scrollIntoView = false,
}: SectionFormParams) {
  const { setFieldValue, validateField, values } = useFormikContext<
    SlideRegistrationFormValues
  >();

  const [availableSpatialLocations, setAvailableSpatialLocations] = useState<
    GetRegistrationInfoQuery["tissueTypes"][number]["spatialLocations"]
  >([]);

  // HMDMC field is only enabled if "Human" is selected for Species
  const [isHMDMCEnabled, setIsHMDMCEnabled] = useState(false);

  const slotRef = useRef<HTMLDivElement>(null);
  const isOnScreen = useOnScreen(slotRef, { threshold: 0.4 });

  /**
   * Call the onScreen callback when "isOnScreen" is true
   */
  useEffect(() => {
    if (isOnScreen) {
      onScreen(slotAddress);
    }
  }, [isOnScreen, onScreen, slotAddress]);

  /**
   * Scroll this section into view on the screen if scrollIntoView is true
   */
  useEffect(() => {
    if (scrollIntoView) {
      slotRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [scrollIntoView]);

  /**
   * When the tissue type changes, update the available spatial locations
   */
  const currentTissueType =
    values.labwares[currentIndex].slots[slotAddress][sectionIndex].tissueType;
  useEffect(() => {
    setAvailableSpatialLocations(
      model.registrationInfo.tissueTypes.find(
        (tt) => tt.name === currentTissueType
      )?.spatialLocations ?? []
    );
  }, [
    setAvailableSpatialLocations,
    model.registrationInfo.tissueTypes,
    currentTissueType,
  ]);

  /**
   * When the species is "Human", enable the HMDMC field
   */
  const currentSpecies =
    values.labwares[currentIndex]?.slots[slotAddress]?.[sectionIndex].species;
  useEffect(() => {
    if (currentSpecies !== "Human") {
      setIsHMDMCEnabled(false);
      setFieldValue(
        `labwares.${currentIndex}.slots.${slotAddress}.${sectionIndex}.hmdmc`,
        "",
        true
      );
    } else {
      setIsHMDMCEnabled(true);
      validateField(
        `labwares.${currentIndex}.slots.${slotAddress}.${sectionIndex}.hmdmc`
      );
    }
  }, [
    currentSpecies,
    setFieldValue,
    currentIndex,
    sectionIndex,
    setIsHMDMCEnabled,
    validateField,
    slotAddress,
  ]);

  return (
    <motion.div
      variants={variants.fadeInWithLift}
      ref={slotRef}
      className="relative p-4 shadow-lg bg-white space-y-4"
    >
      <div className="sticky py-2 top-0 bg-white">
        <Pill color="pink">{slotAddress}</Pill>
      </div>

      <Heading level={4}>Donor Information</Heading>

      <FormikInput
        label="Donor ID"
        name={`labwares.${currentIndex}.slots.${slotAddress}.${sectionIndex}.donorId`}
      />

      <RadioGroup
        label="Life Stage"
        name={`labwares.${currentIndex}.slots.${slotAddress}.${sectionIndex}.lifeStage`}
      >
        {enumKeys(LifeStage).map((key, index) => {
          return <RadioButton key={index} name={key} value={LifeStage[key]} />;
        })}
      </RadioGroup>

      <FormikSelect
        label={"Species"}
        name={`labwares.${currentIndex}.slots.${slotAddress}.${sectionIndex}.species`}
        emptyOption
        className="mt-2"
      >
        {optionValues(model.registrationInfo.species, "name", "name")}
      </FormikSelect>

      <Heading level={4}>Tissue Information</Heading>

      <FormikSelect
        label="HMDMC"
        disabled={!isHMDMCEnabled}
        name={`labwares.${currentIndex}.slots.${slotAddress}.${sectionIndex}.hmdmc`}
        emptyOption
        className="mt-2"
      >
        {optionValues(model.registrationInfo.hmdmcs, "hmdmc", "hmdmc")}
      </FormikSelect>

      <FormikSelect
        label="Tissue Type"
        emptyOption
        name={`labwares.${currentIndex}.slots.${slotAddress}.${sectionIndex}.tissueType`}
        className="mt-2"
      >
        {optionValues(model.registrationInfo.tissueTypes, "name", "name")}
      </FormikSelect>

      <FormikSelect
        label="Spatial Location"
        name={`labwares.${currentIndex}.slots.${slotAddress}.${sectionIndex}.spatialLocation`}
      >
        {optionValues(availableSpatialLocations, "code", "code")}
      </FormikSelect>

      <FormikInput
        label="Replicate Number"
        type="number"
        name={`labwares.${currentIndex}.slots.${slotAddress}.${sectionIndex}.replicateNumber`}
      />

      <Heading level={4}>Section Information</Heading>

      <FormikInput
        label="Section External Identifier"
        name={`labwares.${currentIndex}.slots.${slotAddress}.${sectionIndex}.externalIdentifier`}
      />

      <FormikInput
        label="Section Number"
        type="number"
        name={`labwares.${currentIndex}.slots.${slotAddress}.${sectionIndex}.sectionNumber`}
      />

      <FormikInput
        label="Section Thickness"
        type="number"
        name={`labwares.${currentIndex}.slots.${slotAddress}.${sectionIndex}.sectionThickness`}
      />

      <div className="flex flex-row justify-between">
        <FieldArray name={`labwares.${currentIndex}.slots.${slotAddress}`}>
          {(samplesHelper) => (
            <>
              <PinkButton
                type="button"
                action={"tertiary"}
                onClick={() => samplesHelper.push(model.buildSample())}
              >
                + Add Another Section to {slotAddress}
              </PinkButton>
              {showRemoveSectionButton && (
                <PinkButton
                  type="button"
                  action={"tertiary"}
                  onClick={() => samplesHelper.remove(sectionIndex)}
                >
                  - Remove Section
                </PinkButton>
              )}
            </>
          )}
        </FieldArray>
      </div>
    </motion.div>
  );
}
