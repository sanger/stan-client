import React, { useEffect, useRef, useState } from "react";
import Labware from "../../components/labware/Labware";
import { labwareFactories } from "../../lib/factories/labwareFactory";
import {
  FieldArray,
  Form,
  FormikErrors,
  FormikTouched,
  getIn,
  useFormikContext,
} from "formik";
import PinkButton from "../../components/buttons/PinkButton";
import FormikInput from "../../components/forms/Input";
import Heading from "../../components/Heading";
import FormikSelect, { Select } from "../../components/forms/Select";
import { optionValues } from "../../components/forms";
import Pill from "../../components/Pill";
import RadioGroup, { RadioButton } from "../../components/forms/RadioGroup";
import { enumKeys } from "../../lib/helpers";
import { GetRegistrationInfoQuery, LifeStage } from "../../types/graphql";
import { motion } from "framer-motion";
import BarcodeIcon from "../../components/icons/BarcodeIcon";
import EditIcon from "../../components/icons/EditIcon";
import LabwareIcon from "../../components/icons/LabwareIcon";
import WhiteButton from "../../components/buttons/WhiteButton";
import { LabwareTypeName } from "../../types/stan";
import SlideRegistrationPresentationModel, {
  SlideRegistrationFormValues,
} from "../../lib/presentationModels/slideRegistrationPresentationModel";
import { debounce, omit } from "lodash";
import variants from "../../lib/motionVariants";
import { useOnScreen } from "../../lib/hooks";
import MutedText from "../../components/MutedText";

interface SlideRegistrationFormProps {
  model: SlideRegistrationPresentationModel;
}

const SlideRegistrationForm: React.FC<SlideRegistrationFormProps> = ({
  model,
}) => {
  const { values, setFieldValue, errors, touched } = useFormikContext<
    SlideRegistrationFormValues
  >();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [scrollToSlot, setScrollToSlot] = useState<string | null>(null);
  const [currentSlotAddress, setCurrentSlotAddress] = useState<string | null>(
    null
  );
  const labwareTypeSelectRef = useRef<HTMLSelectElement>(null);

  // Derived states
  const currentLabware = values.labwares[currentIndex];
  const currentOccupiedSlots = Object.keys(currentLabware.slots);
  const errorCount = getNumErrorsPerLabware(values.labwares, errors, touched);

  const debouncedSetCurrentSlot = debounce((slotAddress) => {
    setCurrentSlotAddress(slotAddress);
    setScrollToSlot(null);
  }, 200);

  const labware = labwareFactories[currentLabware.labwareTypeName].build();

  const buildSlot = model.buildSlot;
  const handleOnSlotClick = React.useCallback(
    (address: string) => {
      // If this is a new slot, build it
      if (!currentOccupiedSlots.includes(address)) {
        setFieldValue(
          `labwares.${currentIndex}.slots`,
          Object.assign({}, currentLabware.slots, {
            [address]: buildSlot(),
          })
        );
      }
      setScrollToSlot(address);
    },
    [
      currentOccupiedSlots,
      setFieldValue,
      currentLabware.slots,
      buildSlot,
      currentIndex,
    ]
  );

  return (
    <Form>
      <div className="grid grid-cols-9 gap-2">
        <div className="col-span-2 relative">
          <motion.div
            key={currentLabware.clientId}
            variants={variants.fadeInParent}
            initial={"hidden"}
            animate={"visible"}
            className="sticky top-0"
          >
            {currentLabware?.labwareTypeName && (
              <>
                <Labware
                  name={currentLabware.labwareTypeName}
                  labware={labware}
                  selectionMode={"single"}
                  selectable={"any"}
                  slotText={(address) => {
                    const externalIdentifier =
                      currentLabware.slots[address]?.externalIdentifier ?? "";
                    return externalIdentifier !== ""
                      ? externalIdentifier
                      : undefined;
                  }}
                  slotColor={(address) => {
                    if (address === currentSlotAddress) {
                      return "bg-sp-500";
                    }
                    if (currentOccupiedSlots.includes(address)) {
                      return "bg-sdb-200";
                    }
                  }}
                  onSlotClick={handleOnSlotClick}
                />

                <MutedText>Click an empty slot to add a new section.</MutedText>
              </>
            )}

            {values.labwares.length > 1 && (
              <FieldArray name={`labwares`}>
                {(labwaresHelper) => (
                  <PinkButton
                    type={"button"}
                    action={"tertiary"}
                    onClick={() => {
                      labwaresHelper.remove(currentIndex);
                      if (currentIndex !== 0) {
                        setCurrentIndex(currentIndex - 1);
                      }
                    }}
                  >
                    - Remove Slide
                  </PinkButton>
                )}
              </FieldArray>
            )}
          </motion.div>
        </div>
        <div className="col-start-3 col-end-8 p-5 bg-gray-100">
          <motion.div
            key={`${values.labwares[currentIndex].clientId}-2`}
            variants={variants.fadeInParent}
            initial={"hidden"}
            animate={"visible"}
            className="space-y-8"
          >
            <motion.div variants={variants.fadeInWithLift}>
              <FormikInput
                label={"External Slide Barcode"}
                name={`labwares.${currentIndex}.externalSlideBarcode`}
              />
            </motion.div>

            <motion.div variants={variants.fadeInWithLift}>
              <Heading level={4}>Embedding Information</Heading>

              <FormikSelect
                emptyOption
                label="Fixative"
                className="block mt-2"
                name={`labwares.${currentIndex}.fixative`}
              >
                {optionValues(model.registrationInfo.fixatives, "name", "name")}
              </FormikSelect>

              <FormikSelect
                emptyOption
                label="Medium"
                className="block mt-2"
                name={`labwares.${currentIndex}.medium`}
              >
                {optionValues(model.registrationInfo.mediums, "name", "name")}
              </FormikSelect>
            </motion.div>

            {Object.keys(values.labwares[currentIndex].slots).map(
              (slotAddress) => (
                <SlotForm
                  key={slotAddress}
                  model={model}
                  currentIndex={currentIndex}
                  slotAddress={slotAddress}
                  scrollIntoView={slotAddress === scrollToSlot}
                  onScreen={debouncedSetCurrentSlot}
                />
              )
            )}
          </motion.div>
        </div>
        <div className="col-span-2 border-t-4 border-sp p-3 rounded-md bg-sdb-400">
          <div className="sticky top-0 space-y-3">
            <Heading level={3} showBorder={false} className="text-gray-100">
              Summary
            </Heading>

            <p className="text-gray-100">
              There {values.labwares.length === 1 ? "is" : "are"} currently{" "}
              <span className="font-bold">{values.labwares.length}</span>{" "}
              labware(s) and a total of{" "}
              <span className="font-bold">
                {getTotalSections(values.labwares)}
              </span>{" "}
              section(s).
            </p>

            <div id="labware-summaries" className="text-gray-100">
              {values.labwares.map((labware, labwareIndex) => (
                <motion.a
                  initial={{ x: -100 }}
                  animate={{ x: 0 }}
                  href={`registration/labwares/${labwareIndex}`}
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentIndex(labwareIndex);
                  }}
                  key={labware.clientId}
                  className={`group block px-2 py-1 outline-none rounded-r hover:bg-sdb-300 ${
                    labwareIndex === currentIndex &&
                    "border-l-4 border-sp pl-1 bg-sdb-500"
                  }`}
                >
                  <div className="flex flex-row items-center justify-between">
                    <div className="flex flex-row items-center justify-between">
                      <BarcodeIcon className="h-4 w-4 inline-block text-white" />
                      <span className="ml-1 text-sm">
                        {labware.externalSlideBarcode}
                      </span>
                    </div>

                    <div className="flex flex-row justify-between items-center">
                      {errorCount[labware.clientId] > 0 && (
                        <Pill color={"pink"}>
                          {errorCount[labware.clientId]} Error
                          {errorCount[labware.clientId] > 1 && "s"}
                        </Pill>
                      )}
                      <EditIcon className="group-hover:block hidden ml-2 h-4 w-4 text-white" />
                      <span className="group-hover:hidden ml-2 bg-white text-gray-900 rounded-full h-4 w-4 flex items-center justify-center font-semibold text-sm">
                        {labwareIndex + 1}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-row items-center justify-between">
                    <div className="flex flex-row items-center justify-between">
                      <LabwareIcon className="h-4 w-4 inline-block text-white" />
                      <span className="ml-1 text-sm">
                        {labware.labwareTypeName}
                      </span>
                    </div>

                    <div>
                      <span className="text-sm">
                        {Object.keys(labware.slots).length} Section(s)
                      </span>
                    </div>
                  </div>
                </motion.a>
              ))}
            </div>

            <div className="my-2 w-full py-4 px-2 bg-sdb-500 rounded-md flex flex-col space-y-2">
              <Select id="labwareTypesSelect" ref={labwareTypeSelectRef}>
                {model.availableSlides.map((labwareTypeName) => (
                  <option key={labwareTypeName} value={labwareTypeName}>
                    {labwareTypeName}
                  </option>
                ))}
              </Select>

              <FieldArray name={"labwares"}>
                {(labwareHelpers) => (
                  <WhiteButton
                    type="button"
                    action="primary"
                    className="mt-2 w-full"
                    onClick={(e) => {
                      e.preventDefault();
                      const labwareType = labwareTypeSelectRef.current?.value;
                      const numberOfLabwares = values.labwares.length;
                      labwareHelpers.push(
                        model.buildLabware(labwareType as LabwareTypeName)
                      );
                      setCurrentSlotAddress(null);
                      setCurrentIndex(numberOfLabwares);
                    }}
                  >
                    + Add Slide
                  </WhiteButton>
                )}
              </FieldArray>
            </div>

            <div className="w-full flex flex-col">
              <PinkButton
                // loading={submitting}
                type="submit"
                className="mt-4 w-full"
              >
                Register
              </PinkButton>
            </div>
          </div>
        </div>
      </div>
    </Form>
  );
};

export default SlideRegistrationForm;

interface SlotFormParams {
  model: SlideRegistrationPresentationModel;
  slotAddress: string;
  currentIndex: number;
  scrollIntoView: boolean;
  onScreen: (slotAddress: string) => void;
}

const SlotForm: React.FC<SlotFormParams> = ({
  model,
  slotAddress,
  currentIndex,
  onScreen,
  scrollIntoView = false,
}) => {
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

  useEffect(() => {
    if (isOnScreen) {
      onScreen(slotAddress);
    }
  }, [isOnScreen, onScreen, slotAddress]);

  useEffect(() => {
    if (scrollIntoView) {
      slotRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [scrollIntoView]);

  const currentTissueType =
    values.labwares[currentIndex]?.slots[slotAddress]?.tissueType;
  useEffect(() => {
    setFieldValue(
      `labwares.${currentIndex}.slots.${slotAddress}.spatialLocation`,
      "",
      false
    );

    setAvailableSpatialLocations(
      model.registrationInfo.tissueTypes.find(
        (tt) => tt.name === currentTissueType
      )?.spatialLocations ?? []
    );
  }, [
    currentIndex,
    slotAddress,
    currentTissueType,
    model.registrationInfo.tissueTypes,
    setAvailableSpatialLocations,
    setFieldValue,
  ]);

  const currentSpecies =
    values.labwares[currentIndex]?.slots[slotAddress]?.species;
  useEffect(() => {
    if (currentSpecies !== "Human") {
      setIsHMDMCEnabled(false);
      setFieldValue(
        `labwares.${currentIndex}.slots.${slotAddress}.hmdmc`,
        "",
        true
      );
    } else {
      setIsHMDMCEnabled(true);
      validateField(`labwares.${currentIndex}.slots.${slotAddress}.hmdmc`);
    }
  }, [
    currentSpecies,
    setFieldValue,
    currentIndex,
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
        name={`labwares.${currentIndex}.slots.${slotAddress}.donorId`}
      />

      <RadioGroup
        label="Life Stage"
        name={`labwares.${currentIndex}.slots.${slotAddress}.lifeStage`}
      >
        {enumKeys(LifeStage).map((key, index) => {
          return <RadioButton key={index} name={key} value={LifeStage[key]} />;
        })}
      </RadioGroup>

      <FormikSelect
        label={"Species"}
        name={`labwares.${currentIndex}.slots.${slotAddress}.species`}
        emptyOption
        className="mt-2"
      >
        {optionValues(model.registrationInfo.species, "name", "name")}
      </FormikSelect>

      <Heading level={4}>Tissue Information</Heading>

      <FormikSelect
        label="HMDMC"
        disabled={!isHMDMCEnabled}
        name={`labwares.${currentIndex}.slots.${slotAddress}.hmdmc`}
        emptyOption
        className="mt-2"
      >
        {optionValues(model.registrationInfo.hmdmcs, "hmdmc", "hmdmc")}
      </FormikSelect>

      <FormikSelect
        label="Tissue Type"
        emptyOption
        name={`labwares.${currentIndex}.slots.${slotAddress}.tissueType`}
        className="mt-2"
      >
        {optionValues(model.registrationInfo.tissueTypes, "name", "name")}
      </FormikSelect>

      <FormikSelect
        label="Spatial Location"
        name={`labwares.${currentIndex}.slots.${slotAddress}.spatialLocation`}
      >
        {optionValues(availableSpatialLocations, "code", "code")}
      </FormikSelect>

      <FormikInput
        label="Replicate Number"
        type="number"
        name={`labwares.${currentIndex}.slots.${slotAddress}.replicateNumber`}
      />

      <Heading level={4}>Section Information</Heading>

      <FormikInput
        label="Section External Identifier"
        name={`labwares.${currentIndex}.slots.${slotAddress}.externalIdentifier`}
      />

      <FormikInput
        label="Section Number"
        type="number"
        name={`labwares.${currentIndex}.slots.${slotAddress}.sectionNumber`}
      />

      <FormikInput
        label="Section Thickness"
        type="number"
        name={`labwares.${currentIndex}.slots.${slotAddress}.sectionThickness`}
      />

      <div className="flex flex-row justify-end">
        {Object.keys(values.labwares[currentIndex].slots).length > 1 && (
          <PinkButton
            type="button"
            action={"tertiary"}
            onClick={() =>
              setFieldValue(
                `labwares.${currentIndex}.slots`,
                omit(values.labwares[currentIndex].slots, slotAddress)
              )
            }
          >
            - Remove Section
          </PinkButton>
        )}
      </div>
    </motion.div>
  );
};

function getNumErrorsPerLabware(
  labwares: SlideRegistrationFormValues["labwares"],
  errors: FormikErrors<SlideRegistrationFormValues>,
  touched: FormikTouched<SlideRegistrationFormValues>
): { [key: string]: number } {
  return labwares.reduce<{ [key: number]: number }>(
    (memo, labware, labwareIndex) => {
      let count = 0;

      Object.keys(labware.slots).forEach((slotAddress) => {
        Object.keys(labware.slots[slotAddress]).forEach((slotKey) => {
          const fieldName = `labwares.${labwareIndex}.slots.${slotAddress}.${slotKey}`;
          if (getIn(touched, fieldName) && getIn(errors, fieldName)) {
            count++;
          }
        });
      });

      Object.keys(labware)
        .filter((k) => k !== "slots")
        .forEach((labwareKey) => {
          const fieldName = `labwares.${labwareIndex}.${labwareKey}`;
          if (getIn(touched, fieldName) && getIn(errors, fieldName)) {
            count++;
          }
        });

      return Object.assign(memo, { [labware.clientId]: count });
    },
    {}
  );
}

function getTotalSections(labwares: SlideRegistrationFormValues["labwares"]) {
  return labwares.reduce((memo, labware) => {
    memo += Object.keys(labware.slots).length;
    return memo;
  }, 0);
}
