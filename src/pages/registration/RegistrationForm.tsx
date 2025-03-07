import React, { useEffect, useMemo, useRef, useState } from 'react';
import { GetRegistrationInfoQuery, LabwareType, LifeStage } from '../../types/sdk';
import { FieldArray, Form, useFormikContext } from 'formik';
import { AnimatePresence, motion } from '../../dependencies/motion';
import Heading from '../../components/Heading';
import FormikInput from '../../components/forms/Input';
import RadioGroup, { RadioButton } from '../../components/forms/RadioGroup';
import { objectKeys } from '../../lib/helpers';
import { selectOptionValues } from '../../components/forms';
import PinkButton from '../../components/buttons/PinkButton';
import BlueButton from '../../components/buttons/BlueButton';
import SummaryBox from './SummaryBox';
import variants from '../../lib/motionVariants';
import GrayBox, { Sidebar } from '../../components/layouts/GrayBox';
import { useScrollToRef } from '../../lib/hooks';
import { RegistrationFormValues } from '../BlockRegistration';
import { TissueValues } from './Registration';
import CustomReactSelect from '../../components/forms/CustomReactSelect';
import { RegistrationFormBlockSample } from '../OriginalSampleRegistration';
import { LifeStageMap } from './SectionForm';

export type TextType = 'Block' | 'Embedding';

interface RegistrationFormParams<T> {
  /**
   * Registration information like available species,fixatives etc
   */
  registrationInfo: GetRegistrationInfoQuery;
  /**
   * Labware types available for registration
   */
  availableLabwareTypes: LabwareType[];
  /**
   * Default values for Tissue
   */
  defaultFormTissueValues: T;
  /**
   * Change in default keywords to display
   */
  keywordsMap?: Map<TextType, string>;
}

const RegistrationForm = <T extends TissueValues<B>, B>({
  registrationInfo,
  availableLabwareTypes,
  defaultFormTissueValues,
  keywordsMap
}: RegistrationFormParams<T>) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { setFieldValue, values, errors, touched, isSubmitting } = useFormikContext<RegistrationFormValues>();

  const keywords = keywordsMap ?? new Map();
  const optionalFields = keywords.has('Optional') && keywords.get('Optional');

  // Available spatial locations are determined by the current tissue type
  const availableSpatialLocations: GetRegistrationInfoQuery['tissueTypes'][number]['spatialLocations'] = useMemo(() => {
    return (
      registrationInfo.tissueTypes.find((tt) => tt.name === values.tissues[currentIndex]?.tissueType)
        ?.spatialLocations ?? []
    );
  }, [registrationInfo.tissueTypes, values.tissues, currentIndex]);

  // Only enable HMDMC when the species is Human
  const isHMDMCEnabled = values.tissues[currentIndex].species === 'Human';
  useEffect(() => {
    if (!isHMDMCEnabled) {
      setFieldValue(`tissues.${currentIndex}.hmdmc`, '', true);
    }
  }, [isHMDMCEnabled, setFieldValue, currentIndex]);

  // Reference to the current Tissue being registered
  const tissueRef = useRef<HTMLDivElement>(null);

  const [lastBlockRef, scrollToLatestBlock] = useScrollToRef();

  const getOptionalTag = (fieldName: string) =>
    optionalFields && optionalFields.includes(fieldName) ? 'Optional' : undefined;

  return (
    <Form>
      <GrayBox>
        <AnimatePresence
          mode="wait"
          onExitComplete={async () => {
            await setFieldValue(
              'tissues',
              values.tissues.filter((t) => !!t.clientId)
            );
          }}
        >
          <motion.div
            ref={tissueRef}
            variants={variants.fadeInParent}
            initial={'hidden'}
            animate={'visible'}
            exit={'hidden'}
            className="md:w-2/3 space-y-6"
            key={values.tissues[currentIndex].clientId}
          >
            <motion.div variants={variants.fadeInWithLift} className="space-y-4">
              <Heading level={3}>Donor Information</Heading>

              <FormikInput label="Donor ID" name={`tissues.${currentIndex}.donorId`} />

              <RadioGroup label="Life Stage" name={`tissues.${currentIndex}.lifeStage`}>
                {objectKeys(LifeStageMap).map((key, index) => {
                  return <RadioButton key={index} name={key} value={LifeStageMap[key]} />;
                })}
              </RadioGroup>

              {values.tissues[currentIndex].lifeStage === LifeStage.Fetal && (
                <FormikInput
                  type="date"
                  name={`tissues.${currentIndex}.sampleCollectionDate`}
                  label={'Sample Collection Date'}
                  max={new Date()}
                  value={values.tissues[currentIndex].sampleCollectionDate}
                />
              )}

              <CustomReactSelect
                label={'Species'}
                name={`tissues.${currentIndex}.species`}
                emptyOption
                className="mt-2"
                dataTestId="Species"
                options={selectOptionValues(registrationInfo.species, 'name', 'name')}
                value={values.tissues[currentIndex].species}
              />
            </motion.div>

            <motion.div variants={variants.fadeInWithLift} className="space-y-4">
              <Heading level={3}>Tissue Information</Heading>
              <CustomReactSelect
                label="HuMFre"
                name={`tissues.${currentIndex}.hmdmc`}
                isDisabled={!isHMDMCEnabled}
                emptyOption
                className="mt-2"
                dataTestId="HuMFre"
                options={selectOptionValues(registrationInfo.hmdmcs, 'hmdmc', 'hmdmc')}
                value={values.tissues[currentIndex].hmdmc}
              />
              <CustomReactSelect
                label="Tissue Type"
                emptyOption
                name={`tissues.${currentIndex}.tissueType`}
                className="mt-2"
                dataTestId="Tissue Type"
                options={selectOptionValues(registrationInfo.tissueTypes, 'name', 'name')}
                value={values.tissues[currentIndex].tissueType}
              />
              <CustomReactSelect
                label="Biological Risk Assessment Numbers"
                emptyOption
                name={`tissues.${currentIndex}.bioRiskCode`}
                className="mt-2"
                dataTestId="bioRiskCode"
                options={selectOptionValues(registrationInfo.bioRisks, 'code', 'code')}
                value={values.tissues[currentIndex].bioRiskCode}
              />
            </motion.div>

            <motion.div variants={variants.fadeInWithLift} className="space-y-4">
              <Heading level={3}>{`${keywords.get('Block') ?? 'Block'} Information`}</Heading>
              <AnimatePresence
                onExitComplete={() => {
                  setFieldValue(
                    `tissues.[${currentIndex}].blocks`,
                    values.tissues[currentIndex].blocks.filter((block) => block.clientId !== null)
                  );
                }}
              >
                {values.tissues[currentIndex].blocks
                  .filter((block) => block.clientId !== null)
                  .flatMap((block, blockIndex) => {
                    return (
                      <motion.div
                        ref={blockIndex === values.tissues[currentIndex].blocks.length - 1 ? lastBlockRef : null}
                        key={blockIndex}
                        variants={variants.fadeIn}
                        animate={'visible'}
                        exit={'hidden'}
                        data-testid={'sample-info-div'}
                        className="relative p-4 shadow-lg bg-white space-y-4"
                      >
                        <FormikInput
                          label="External Identifier"
                          name={`tissues.${currentIndex}.blocks.${blockIndex}.externalIdentifier`}
                          displayTag={getOptionalTag('External Identifier')}
                          value={values.tissues[currentIndex].blocks[blockIndex].externalIdentifier}
                        />

                        <CustomReactSelect
                          isDisabled={availableSpatialLocations.length === 0}
                          emptyOption={availableSpatialLocations.length > 0}
                          label="Spatial Location"
                          dataTestId="Spatial Location"
                          name={`tissues.${currentIndex}.blocks.${blockIndex}.spatialLocation`}
                          options={availableSpatialLocations.map((spatialLocation) => {
                            return {
                              label: spatialLocation.code + ' - ' + spatialLocation.name,
                              value: spatialLocation.code.toString()
                            };
                          })}
                          valueAsNumber
                          value={values.tissues[currentIndex].blocks[blockIndex].spatialLocation}
                        />

                        <FormikInput
                          label="Replicate Number"
                          name={`tissues.${currentIndex}.blocks.${blockIndex}.replicateNumber`}
                          displayTag={getOptionalTag('Replicate Number')}
                          value={values.tissues[currentIndex].blocks[blockIndex].replicateNumber}
                        />
                        {'lastKnownSectionNumber' in values.tissues[currentIndex].blocks[blockIndex] && (
                          <FormikInput
                            label="Last Known Section Number"
                            type="number"
                            name={`tissues.${currentIndex}.blocks.${blockIndex}.lastKnownSectionNumber`}
                            value={values.tissues[currentIndex].blocks[blockIndex].lastKnownSectionNumber}
                          />
                        )}

                        <CustomReactSelect
                          emptyOption
                          label="Labware Type"
                          dataTestId="Labware Type"
                          name={`tissues.${currentIndex}.blocks.${blockIndex}.labwareType`}
                          options={selectOptionValues(availableLabwareTypes, 'name', 'name')}
                          value={values.tissues[currentIndex].blocks[blockIndex].labwareType}
                        />

                        <Heading level={4} showBorder={false} className="mt-4">
                          {`${keywords.get('Embedding') ?? 'Embedding'} Information`}
                        </Heading>

                        <CustomReactSelect
                          emptyOption
                          label="Fixative"
                          dataTestId="Fixative"
                          className="block mt-2"
                          name={`tissues.${currentIndex}.blocks.${blockIndex}.fixative`}
                          value={values.tissues[currentIndex].blocks[blockIndex].fixative}
                          options={selectOptionValues(registrationInfo.fixatives, 'name', 'name')}
                        />
                        {'medium' in block && (
                          <CustomReactSelect
                            emptyOption
                            label="Medium"
                            dataTestId="Medium"
                            className="block mt-2"
                            name={`tissues.${currentIndex}.blocks.${blockIndex}.medium`}
                            value={values.tissues[currentIndex].blocks[blockIndex].medium}
                            options={selectOptionValues(registrationInfo.mediums, 'name', 'name')}
                          />
                        )}
                        {'solution' in block && (
                          <CustomReactSelect
                            emptyOption
                            label="Solution"
                            dataTestId="Solution"
                            className="block mt-2"
                            name={`tissues.${currentIndex}.blocks.${blockIndex}.solution`}
                            value={
                              (
                                values.tissues[currentIndex].blocks[
                                  blockIndex
                                ] as unknown as RegistrationFormBlockSample
                              ).solution
                            }
                            options={selectOptionValues(registrationInfo.solutions, 'name', 'name')}
                          />
                        )}
                        <div className={'flex flex-row justify-end'}>
                          {'solution' in block && (
                            <FieldArray name={`tissues.${currentIndex}.blocks`}>
                              {(blockHelpers) => (
                                <BlueButton
                                  type="button"
                                  action="secondary"
                                  className="mt-4 inline-flex"
                                  onClick={() => {
                                    //Create new duplicate sample with sample fields refilled using the sample from which it is created.
                                    //Reset Solution,Fixative and Replicate Number,External Identifier fields
                                    blockHelpers.push(block);
                                    setFieldValue(
                                      `tissues[${currentIndex}].blocks[${values.tissues[currentIndex].blocks.length}].solution`,
                                      ''
                                    );
                                    setFieldValue(
                                      `tissues[${currentIndex}].blocks[${values.tissues[currentIndex].blocks.length}].fixative`,
                                      ''
                                    );
                                    setFieldValue(
                                      `tissues[${currentIndex}].blocks[${values.tissues[currentIndex].blocks.length}].replicateNumber`,
                                      ''
                                    );
                                    setFieldValue(
                                      `tissues[${currentIndex}].blocks[${values.tissues[currentIndex].blocks.length}].externalIdentifier`,
                                      ''
                                    );
                                    scrollToLatestBlock();
                                  }}
                                >
                                  {`+ Add Identical Tissue ${keywords.get('Block') ?? 'Block'}`}
                                </BlueButton>
                              )}
                            </FieldArray>
                          )}

                          {/* Only show the delete button if we've got more than 1 block */}
                          {values.tissues[currentIndex].blocks.length > 1 && (
                            <div className="flex justify-end">
                              <FieldArray name={`tissues.${currentIndex}.blocks`}>
                                {(blockHelpers) => (
                                  <PinkButton
                                    type="button"
                                    action="tertiary"
                                    onClick={() => {
                                      blockHelpers.remove(blockIndex);
                                    }}
                                  >
                                    {`Delete ${keywords.get('Block') ?? 'Block'}`}
                                  </PinkButton>
                                )}
                              </FieldArray>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
              </AnimatePresence>
            </motion.div>

            <motion.div variants={variants.fadeInWithLift} className="flex flex-row items-centre justify-between">
              <FieldArray name={`tissues.${currentIndex}.blocks`}>
                {(blockHelpers) => (
                  <BlueButton
                    type="button"
                    action="secondary"
                    className="mt-4 inline-flex"
                    onClick={() => {
                      blockHelpers.push(defaultFormTissueValues.blocks[0]);
                      scrollToLatestBlock();
                    }}
                  >
                    {`+ Add Another Tissue ${keywords.get('Block') ?? 'Block'}`}
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
                      behavior: 'smooth'
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
                submitting={isSubmitting}
                values={values}
                errors={errors}
                touched={touched}
                currentFormIndex={currentIndex}
                setCurrentFormIndex={setCurrentIndex}
                onNewTissueButton={() => {
                  tissueHelpers.push(defaultFormTissueValues);
                  setCurrentIndex(currentIndex + 1);
                  tissueRef.current?.scrollIntoView({
                    behavior: 'smooth'
                  });
                }}
                //Only add identical tissue button for original sample registration
                onIdenticalTissueButton={
                  'solution' in values.tissues[0].blocks[0]
                    ? () => {
                        tissueHelpers.push(values.tissues[currentIndex]);
                        values.tissues[currentIndex].blocks.forEach((block, indx) => {
                          setFieldValue(`tissues[${currentIndex + 1}].blocks[${indx}].solution`, '');
                          setFieldValue(`tissues[${currentIndex + 1}].blocks[${indx}].fixative`, '');
                          setFieldValue(`tissues[${currentIndex + 1}].blocks[${indx}].replicateNumber`, '');
                          setFieldValue(`tissues[${currentIndex + 1}].blocks[${indx}].externalIdentifier`, '');
                          setFieldValue(
                            `tissues[${currentIndex + 1}].blocks[${indx}].spatialLocation`,
                            values.tissues[currentIndex].blocks[indx].spatialLocation
                          );
                        });

                        setCurrentIndex(currentIndex + 1);
                        tissueRef.current?.scrollIntoView({
                          behavior: 'smooth'
                        });
                      }
                    : undefined
                }
                keywordsMap={keywordsMap}
              />
            )}
          </FieldArray>
        </Sidebar>
      </GrayBox>
    </Form>
  );
};

export default RegistrationForm;
