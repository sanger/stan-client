import React, { useContext, useMemo, useState } from 'react';
import Labware from '../../components/labware/Labware';
import { unregisteredLabwareFactory } from '../../lib/factories/labwareFactory';
import { FieldArray, Form, FormikErrors, FormikTouched, getIn, useFormikContext } from 'formik';
import PinkButton from '../../components/buttons/PinkButton';
import FormikInput from '../../components/forms/Input';
import Heading from '../../components/Heading';
import { selectOptionValues } from '../../components/forms';
import Pill from '../../components/Pill';
import { motion } from '../../dependencies/motion';
import BarcodeIcon from '../../components/icons/BarcodeIcon';
import EditIcon from '../../components/icons/EditIcon';
import LabwareIcon from '../../components/icons/LabwareIcon';
import WhiteButton from '../../components/buttons/WhiteButton';
import { LabwareTypeName } from '../../types/stan';
import { debounce } from 'lodash';
import variants from '../../lib/motionVariants';
import MutedText from '../../components/MutedText';
import SectionForm from './SectionForm';
import { GetRegistrationInfoQuery } from '../../types/sdk';
import { SectionRegistrationContext, SectionRegistrationFormValues } from '../SectionRegistration';
import WorkNumberSelect from '../../components/WorkNumberSelect';
import CustomReactSelect, { OptionType } from '../../components/forms/CustomReactSelect';

type SectionRegistrationFormParams = {
  registrationInfo: GetRegistrationInfoQuery;
};

function SectionRegistrationForm({ registrationInfo }: SectionRegistrationFormParams) {
  const { availableLabware, buildLabware, buildSample, isSubmitting } = useContext(SectionRegistrationContext);
  const { values, setFieldValue, errors, touched } = useFormikContext<SectionRegistrationFormValues>();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [scrollToSlot, setScrollToSlot] = useState<string | null>(null);
  const [currentSlotAddress, setCurrentSlotAddress] = useState<string | null>(null);
  const [labwareTypeSelect, setLabwareTypeSelect] = useState<string>(values.labwares[currentIndex].labwareTypeName);

  // Derived states
  const currentLabware = values.labwares[currentIndex];
  const currentLabwareSectionCount = useMemo(() => getSectionsCount(currentLabware), [currentLabware]);
  const errorCount = useMemo(
    () => getNumErrorsPerLabware(values.labwares, errors, touched),
    [values.labwares, errors, touched]
  );
  const totalSections = useMemo(() => getTotalSectionsCount(values.labwares), [values.labwares]);
  const labware = useMemo(() => {
    const labwareType = registrationInfo.labwareTypes.find((lt) => lt.name === currentLabware.labwareTypeName);
    return unregisteredLabwareFactory.build(undefined, {
      associations: { labwareType }
    });
  }, [currentLabware.labwareTypeName, registrationInfo.labwareTypes]);

  const debouncedSetCurrentSlot = debounce((slotAddress) => {
    setCurrentSlotAddress(slotAddress);
    setScrollToSlot(null);
  }, 200);

  const handleOnSlotClick = React.useCallback(
    (address: string) => {
      // If this slot has zero samples, build an initial one
      if (!currentLabware.slots.hasOwnProperty(address) || currentLabware.slots[address].length === 0) {
        setFieldValue(
          `labwares.${currentIndex}.slots`,
          Object.assign({}, currentLabware.slots, {
            [address]: [buildSample()]
          })
        );
      }
      setScrollToSlot(address);
    },
    [setFieldValue, currentLabware.slots, buildSample, currentIndex]
  );

  return (
    <Form>
      <motion.div variants={variants.fadeInWithLift} className="mb-10">
        <Heading level={3}>SGP Number</Heading>
        <p className="mt-2">Please select an SGP number to associate with all section registering operations</p>
        <motion.div variants={variants.fadeInWithLift} className="mt-4 md:w-1/2">
          <WorkNumberSelect
            onWorkNumberChange={(workNumber) => {
              setFieldValue('workNumber', workNumber);
            }}
          />
        </motion.div>
      </motion.div>
      <div className="grid grid-cols-9 gap-2">
        <div className="col-span-2 relative">
          <motion.div
            key={currentLabware.clientId}
            variants={variants.fadeInParent}
            initial={'hidden'}
            animate={'visible'}
            className="sticky top-0"
          >
            {currentLabware?.labwareTypeName && (
              <>
                <Labware
                  name={currentLabware.labwareTypeName}
                  labware={labware}
                  selectionMode={'single'}
                  selectable={'any'}
                  slotText={(address) => address}
                  slotSecondaryText={(address) => {
                    const slotSampleLength = currentLabware.slots[address]?.length;
                    if (slotSampleLength > 1) {
                      return `\u00d7${slotSampleLength}`;
                    }
                  }}
                  slotColor={(address) => {
                    if (address === currentSlotAddress) {
                      return 'bg-sp-500';
                    } else if (currentLabware.slots?.[address]?.length > 0) {
                      return 'bg-sdb-200';
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
                    type={'button'}
                    action={'tertiary'}
                    onClick={() => {
                      labwaresHelper.remove(currentIndex);
                      if (currentIndex !== 0) {
                        setCurrentIndex(currentIndex - 1);
                      }
                    }}
                  >
                    {`- Remove ${currentLabware.labwareTypeName}`}
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
            initial={'hidden'}
            animate={'visible'}
            className="space-y-8"
          >
            <motion.div variants={variants.fadeInWithLift}>
              <FormikInput
                label={'External Labware Barcode'}
                name={`labwares.${currentIndex}.externalLabwareBarcode`}
              />
            </motion.div>
            {currentLabware.labwareTypeName === LabwareTypeName.XENIUM && (
              <motion.div variants={variants.fadeInWithLift}>
                <FormikInput label={'Xenium Slide Barcode'} name={`labwares.${currentIndex}.xeniumBarcode`} />
              </motion.div>
            )}

            <motion.div variants={variants.fadeInWithLift}>
              <Heading level={4}>Embedding Information</Heading>

              <CustomReactSelect
                emptyOption
                label="Fixative"
                dataTestId="Fixative"
                className="block mt-2"
                name={`labwares.${currentIndex}.fixative`}
                value={values.labwares[currentIndex].fixative}
                options={selectOptionValues(registrationInfo.fixatives, 'name', 'name')}
              />

              <CustomReactSelect
                emptyOption
                label="Medium"
                dataTestId="Medium"
                className="block mt-2"
                name={`labwares.${currentIndex}.medium`}
                value={values.labwares[currentIndex].medium}
                options={selectOptionValues(registrationInfo.mediums, 'name', 'name')}
              />
            </motion.div>

            {Object.keys(values.labwares[currentIndex].slots).flatMap((slotAddress) =>
              values.labwares[currentIndex].slots[slotAddress].map((sample, slotIndex) => (
                <SectionForm
                  key={sample.clientId}
                  sectionIndex={slotIndex}
                  registrationInfo={registrationInfo}
                  currentIndex={currentIndex}
                  slotAddress={slotAddress}
                  scrollIntoView={slotAddress === scrollToSlot}
                  showRemoveSectionButton={currentLabwareSectionCount > 1}
                  onScreen={debouncedSetCurrentSlot}
                />
              ))
            )}
          </motion.div>
        </div>
        <div className="col-span-2 border-t-4 border-sp p-3 rounded-md bg-sdb-400">
          <div className="sticky top-0 space-y-3">
            <Heading level={3} showBorder={false} className="text-gray-100">
              Summary
            </Heading>

            <p className="text-gray-100">
              There {values.labwares.length === 1 ? 'is' : 'are'} currently{' '}
              <span className="font-bold">{values.labwares.length}</span> labware(s) and a total of{' '}
              <span className="font-bold">{totalSections}</span> section(s).
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
                  className={`group block px-2 py-1 outline-hidden rounded-r hover:bg-sdb-300 ${
                    labwareIndex === currentIndex && 'border-l-4 border-sp pl-1 bg-sdb-500'
                  }`}
                >
                  <div className="flex flex-row items-center justify-between">
                    <div className="flex flex-row items-center justify-between">
                      <BarcodeIcon className="h-4 w-4 inline-block text-white" />
                      <span className="ml-1 text-sm">{labware.externalLabwareBarcode}</span>
                    </div>

                    <div className="flex flex-row justify-between items-center">
                      {errorCount[labware.clientId] > 0 && (
                        <Pill color={'pink'}>
                          {errorCount[labware.clientId]} Error
                          {errorCount[labware.clientId] > 1 && 's'}
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
                      <span className="ml-1 text-sm">{labware.labwareTypeName}</span>
                    </div>

                    <div>
                      <span className="text-sm">{getSectionsCount(labware)} Section(s)</span>
                    </div>
                  </div>
                </motion.a>
              ))}
            </div>

            <div className="my-2 w-full py-4 px-2 bg-sdb-500 rounded-md flex flex-col space-y-2">
              <CustomReactSelect
                id="labwareTypesSelect"
                dataTestId="labwareTypesSelect"
                handleChange={(value) => setLabwareTypeSelect((value as OptionType).value)}
                value={labwareTypeSelect}
                options={availableLabware.map((labwareTypeName) => {
                  return {
                    value: labwareTypeName.toString(),
                    label: labwareTypeName.toString()
                  };
                })}
              />

              <FieldArray name={'labwares'}>
                {(labwareHelpers) => (
                  <WhiteButton
                    type="button"
                    action="primary"
                    className="mt-2 w-full"
                    onClick={(e) => {
                      e.preventDefault();
                      const labwareType = labwareTypeSelect;
                      const numberOfLabwares = values.labwares.length;
                      labwareHelpers.push(buildLabware(labwareType as LabwareTypeName));
                      setCurrentSlotAddress(null);
                      setCurrentIndex(numberOfLabwares);
                    }}
                  >
                    {`+ Add  ${labwareTypeSelect}`}
                  </WhiteButton>
                )}
              </FieldArray>
            </div>

            <div className="w-full flex flex-col">
              <PinkButton disabled={isSubmitting} type="submit" className="mt-4 w-full">
                Register
              </PinkButton>
            </div>
          </div>
        </div>
      </div>
    </Form>
  );
}

export default SectionRegistrationForm;

function getNumErrorsPerLabware(
  labwares: SectionRegistrationFormValues['labwares'],
  errors: FormikErrors<SectionRegistrationFormValues>,
  touched: FormikTouched<SectionRegistrationFormValues>
): { [key: string]: number } {
  return labwares.reduce<{ [key: number]: number }>((memo, labware, labwareIndex) => {
    let count = 0;

    // For each slot in the labware, look at each sample, and then look at each field and
    // check for any validation errors
    Object.keys(labware.slots).forEach((slotAddress) => {
      labware.slots[slotAddress].forEach((section, sectionIndex) => {
        Object.keys(section).forEach((sectionKey) => {
          const fieldName = `labwares.${labwareIndex}.slots.${slotAddress}.${sectionIndex}.${sectionKey}`;
          if (getIn(touched, fieldName) && getIn(errors, fieldName)) {
            count++;
          }
        });
      });
    });

    Object.keys(labware)
      .filter((k) => k !== 'slots')
      .forEach((labwareKey) => {
        const fieldName = `labwares.${labwareIndex}.${labwareKey}`;
        if (getIn(touched, fieldName) && getIn(errors, fieldName)) {
          count++;
        }
      });

    return Object.assign(memo, { [labware.clientId]: count });
  }, {});
}

/**
 * Return the number of sections in this labware
 */
function getSectionsCount(labware: SectionRegistrationFormValues['labwares'][number]): number {
  return Object.values(labware.slots).reduce((memo, sections) => {
    memo += sections.length;
    return memo;
  }, 0);
}

/**
 * Return the number of sections for a list of labware
 */
function getTotalSectionsCount(labwares: SectionRegistrationFormValues['labwares']): number {
  return labwares.reduce<number>((memo, labware) => {
    memo += getSectionsCount(labware);
    return memo;
  }, 0);
}
