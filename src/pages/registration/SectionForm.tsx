import React, { useContext, useEffect, useMemo, useRef } from 'react';
import { FieldArray, useFormikContext } from 'formik';
import { GetRegistrationInfoQuery, LifeStage } from '../../types/sdk';
import { useOnScreen } from '../../lib/hooks';
import { motion } from '../../dependencies/motion';
import variants from '../../lib/motionVariants';
import Pill from '../../components/Pill';
import Heading from '../../components/Heading';
import FormikInput from '../../components/forms/Input';
import RadioGroup, { RadioButton } from '../../components/forms/RadioGroup';
import { objectKeys } from '../../lib/helpers';
import { selectOptionValues } from '../../components/forms';
import PinkButton from '../../components/buttons/PinkButton';
import { SectionRegistrationContext, SectionRegistrationFormValues } from '../SectionRegistration';
import CustomReactSelect from '../../components/forms/CustomReactSelect';

type SectionFormParams = {
  registrationInfo: GetRegistrationInfoQuery;
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

export const LifeStageMap: Record<string, string> = {
  ...Object.entries(LifeStage).reduce(
    (acc, [key, value]) => {
      acc[key] = value;
      return acc;
    },
    {} as Record<string, string>
  ),
  'N/A': 'n/a'
};
export default function SectionForm({
  registrationInfo,
  slotAddress,
  sectionIndex,
  currentIndex,
  onScreen,
  showRemoveSectionButton = false,
  scrollIntoView = false
}: SectionFormParams) {
  const { buildSample } = useContext(SectionRegistrationContext);
  const { setFieldValue, values } = useFormikContext<SectionRegistrationFormValues>();
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
      slotRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [scrollIntoView]);

  const selectedTissueType = values.labwares[currentIndex].slots[slotAddress][sectionIndex].tissueType;

  const availableSpatialLocations: GetRegistrationInfoQuery['tissueTypes'][number]['spatialLocations'] = useMemo(() => {
    return registrationInfo.tissueTypes.find((tt) => tt.name === selectedTissueType)?.spatialLocations ?? [];
  }, [registrationInfo.tissueTypes, selectedTissueType]);

  /**
   * Only when the species is "Human", should the HMDMC field be enabled
   */
  const isHMDMCEnabled = values.labwares[currentIndex]?.slots[slotAddress]?.[sectionIndex].species === 'Human';
  const hmdmcField = `labwares.${currentIndex}.slots.${slotAddress}.${sectionIndex}.hmdmc`;

  /**
   * When HMDMC fields is disabled, make sure to also unset its value
   */
  useEffect(() => {
    if (!isHMDMCEnabled) {
      setFieldValue(hmdmcField, '', true);
    }
  }, [isHMDMCEnabled, hmdmcField, setFieldValue]);

  return (
    <motion.div variants={variants.fadeInWithLift} ref={slotRef} className="relative p-4 shadow-lg bg-white space-y-4">
      <div className="sticky py-2 top-0 bg-white">
        <Pill color="pink">{slotAddress}</Pill>
      </div>

      <Heading level={4}>Donor Information</Heading>

      <FormikInput label="Donor ID" name={`labwares.${currentIndex}.slots.${slotAddress}.${sectionIndex}.donorId`} />

      <RadioGroup label="Life Stage" name={`labwares.${currentIndex}.slots.${slotAddress}.${sectionIndex}.lifeStage`}>
        {objectKeys(LifeStageMap).map((key, index) => {
          return <RadioButton key={index} name={key} value={LifeStageMap[key]} />;
        })}
      </RadioGroup>

      <CustomReactSelect
        label="Species"
        dataTestId="Species"
        name={`labwares.${currentIndex}.slots.${slotAddress}.${sectionIndex}.species`}
        emptyOption
        className="mt-2"
        options={selectOptionValues(registrationInfo.species, 'name', 'name')}
        value={values.labwares[currentIndex].slots[slotAddress][sectionIndex].species}
      />

      <Heading level={4}>Tissue Information</Heading>

      <CustomReactSelect
        label="HuMFre"
        dataTestId="HuMFre"
        isDisabled={!isHMDMCEnabled}
        name={`labwares.${currentIndex}.slots.${slotAddress}.${sectionIndex}.hmdmc`}
        value={values.labwares[currentIndex].slots[slotAddress][sectionIndex].hmdmc}
        emptyOption
        className="mt-2"
        options={selectOptionValues(registrationInfo.hmdmcs, 'hmdmc', 'hmdmc')}
      />

      <CustomReactSelect
        label="Tissue Type"
        dataTestId="Tissue Type"
        emptyOption
        name={`labwares.${currentIndex}.slots.${slotAddress}.${sectionIndex}.tissueType`}
        value={values.labwares[currentIndex].slots[slotAddress][sectionIndex].tissueType}
        className="mt-2"
        options={selectOptionValues(registrationInfo.tissueTypes, 'name', 'name')}
      />

      <CustomReactSelect
        label="Spatial Location"
        dataTestId="Spatial Location"
        name={`labwares.${currentIndex}.slots.${slotAddress}.${sectionIndex}.spatialLocation`}
        value={values.labwares[currentIndex].slots[slotAddress][sectionIndex].spatialLocation}
        options={availableSpatialLocations.map((spatialLocation) => {
          return {
            label: spatialLocation.code + ' - ' + spatialLocation.name,
            value: spatialLocation.code.toString()
          };
        })}
      />

      <FormikInput
        label="Replicate Number"
        name={`labwares.${currentIndex}.slots.${slotAddress}.${sectionIndex}.replicateNumber`}
      />

      <CustomReactSelect
        label="Biological Risk Assessment Numbers"
        dataTestId="bioRiskCode"
        name={`labwares.${currentIndex}.slots.${slotAddress}.${sectionIndex}.bioRiskCode`}
        value={values.labwares[currentIndex].slots[slotAddress][sectionIndex].bioRiskCode}
        options={registrationInfo.bioRisks.map((bioRisk) => {
          return {
            label: bioRisk.code,
            value: bioRisk.code
          };
        })}
      />

      <Heading level={4}>Section Information</Heading>

      <FormikInput
        label="Section External Identifier"
        name={`labwares.${currentIndex}.slots.${slotAddress}.${sectionIndex}.externalIdentifier`}
      />
      <motion.div variants={variants.fadeInWithLift}>
        <FormikInput
          type="date"
          name={`labwares.${currentIndex}.slots.${slotAddress}.${sectionIndex}.dateSectioned`}
          label={'Sectioned Date'}
        />
      </motion.div>

      <FormikInput
        label="Section Number"
        type="number"
        name={`labwares.${currentIndex}.slots.${slotAddress}.${sectionIndex}.sectionNumber`}
      />

      <CustomReactSelect
        label="Section position in slot - for multiple sections in a slot"
        dataTestId="region"
        emptyOption
        name={`labwares.${currentIndex}.slots.${slotAddress}.${sectionIndex}.region`}
        value={values.labwares[currentIndex].slots[slotAddress][sectionIndex].region}
        options={registrationInfo.slotRegions.map((region) => {
          return {
            label: region.name,
            value: region.name
          };
        })}
      />

      <FormikInput
        label="Section Thickness"
        type="number"
        name={`labwares.${currentIndex}.slots.${slotAddress}.${sectionIndex}.sectionThickness`}
        step="0.5"
      />

      <div className="flex flex-row justify-between">
        <FieldArray name={`labwares.${currentIndex}.slots.${slotAddress}`}>
          {(samplesHelper) => (
            <>
              <PinkButton type="button" action={'tertiary'} onClick={() => samplesHelper.push(buildSample())}>
                + Add Another Section to {slotAddress}
              </PinkButton>
              {showRemoveSectionButton && (
                <PinkButton type="button" action={'tertiary'} onClick={() => samplesHelper.remove(sectionIndex)}>
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
