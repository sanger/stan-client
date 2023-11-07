import React, { useEffect, useState } from 'react';
import Labware from '../labware/Labware';
import BlueButton from '../buttons/BlueButton';
import PinkButton from '../buttons/PinkButton';
import createLabwareResultMachine from './labwareResult.machine';
import { useMachine } from '@xstate/react';
import {
  CommentFieldsFragment,
  LabwareFieldsFragment,
  LabwareResult as CoreLabwareResult,
  PassFail,
  SamplePositionFieldsFragment,
  SampleResult,
  SlotFieldsFragment,
  SlotMeasurementRequest
} from '../../types/sdk';
import { isSlotFilled } from '../../lib/helpers/slotHelper';
import RemoveButton from '../buttons/RemoveButton';
import { mapify } from '../../lib/helpers';
import PassIcon from '../icons/PassIcon';
import FailIcon from '../icons/FailIcon';
import { Input } from '../forms/Input';
import CustomReactSelect, { OptionType } from '../forms/CustomReactSelect';
import { stanCore } from '../../lib/sdk';

type LabwareResultComponentProps = {
  labware: LabwareFieldsFragment;
  initialLabwareResult: CoreLabwareResult;
  availableComments: Array<CommentFieldsFragment>;

  /**
   * Callback to be called when the remove button is clicked
   * @param barcode the barcode of the labware
   */
  onRemoveClick: (barcode: string) => void;

  /**
   * Callback that is called whenever the labware results change e.g. pass/fail
   * Slots will default to pass.
   * @param labwareResult a {@code LabwareResult}
   */
  onChange: (labwareResult: CoreLabwareResult) => void;

  /**
   * Is it required to select comments for each section in slot?
   */
  commentsForSlotSections?: boolean;

  /**Display pass fail buttons? */
  displayPassFail?: boolean;

  /**Display comments? */
  displayComments?: boolean;

  /**Display measurement? */
  displayMeasurement?: boolean;
};

/**
 * Component to manage recording pass/fail results on each sample
 */
export default function LabwareResult({
  labware,
  initialLabwareResult,
  availableComments,
  onRemoveClick,
  onChange,
  commentsForSlotSections = false,
  displayPassFail = true,
  displayComments = true,
  displayMeasurement = true
}: LabwareResultComponentProps) {
  const labwareResultMachine = React.useMemo(() => {
    return createLabwareResultMachine({
      labwareResult: initialLabwareResult,
      availableComments
    });
  }, [initialLabwareResult, availableComments]);
  const [current, send] = useMachine(labwareResultMachine);
  const [samplePositions, setSamplePositions] = useState<SamplePositionFieldsFragment[]>([]);
  const { labwareResult } = current.context;
  const [allComments, setAllComments] = React.useState<Array<string>>([]);
  const sampleResults = labwareResult.sampleResults
    ? mapify(labwareResult.sampleResults, 'address')
    : new Map<string, SampleResult>();
  const slotMeasurements = labwareResult.slotMeasurements
    ? mapify(labwareResult.slotMeasurements, 'address')
    : new Map<string, SlotMeasurementRequest>();

  useEffect(() => {
    onChange(labwareResult);
  }, [labwareResult, onChange]);

  useEffect(() => {
    if (!labware) return;
    async function setSamplePositionData() {
      const response = await stanCore.FindSamplePositions({ labwareBarcode: labware.barcode });
      setSamplePositions(response.samplePositions);
    }
    setSamplePositionData();
  }, [labware, setSamplePositions]);

  const isMeasurementExist = 'slotMeasurements' in labwareResult;

  /**Ensure Tissue Coverage value is in the range 0 to 100 inclusive**/
  const validateMeasurementField = (value: string) => {
    if (value.length === 0) return true;
    const regEx = /^[0-9]+$/;
    const val = regEx.test(value);
    if (val) {
      const coverage = Number(value);
      if (coverage >= 0 && coverage <= 100) return true;
    }
    return false;
  };
  const getComment = (address: string) => {
    const commentId = sampleResults.get(address)?.commentId;
    return commentId ? commentId + '' : '';
  };
  const getSampleRegion = (address: string, sampleId: number) => {
    const samplePosition = samplePositions.find(
      (position) => position.address === address && position.sampleId === sampleId
    );
    return samplePosition ? samplePosition.region : '';
  };
  const getCommentsForSample = (address: string, sampleId: number) => {
    /**Get all comments belonging to the sample result for the given address**/
    const sampleComments = sampleResults.get(address)!.sampleComments;

    /**If sample comments exist, get all sample comments belonging to the given sample id
     * Multiple comments can be saved for a sample and each one is saved as a {@link SampleIdCommentId} object
     */
    if (sampleComments) {
      return sampleComments.filter((sc) => sc.sampleId === sampleId).map((sc) => sc.commentId + '');
    } else return [];
  };
  const slotBuilder = (slot: SlotFieldsFragment): React.ReactNode => {
    return (
      isSlotFilled(slot) && (
        <div
          className={'flex flex-col w-full mx-auto space-y-4 py-2 border-b-2 border-gray-300 mb-2'}
          data-testid={'Filled'}
        >
          <div className={'flex flex-row w-full'}>
            {isMeasurementExist && displayMeasurement && (
              <div className={'flex flex-row space-x-3 w-1/2 mt-2'}>
                <div className="flex mb-4">Coverage</div>
                <div className="flex flex-row items-center h-8">
                  <Input
                    type="number"
                    data-testid="coverage"
                    min={0}
                    max={100}
                    value={slotMeasurements.get(slot.address)?.value}
                    className={'rounded rounded-md w-20'}
                    onChange={(e) => {
                      if (validateMeasurementField(e.currentTarget.value)) {
                        send({
                          type: 'SET_TISSUE_COVERAGE',
                          address: slot.address,
                          value: e.currentTarget.value
                        });
                      }
                    }}
                  />
                  <div className="text-xs font-normal ml-1">%</div>
                </div>
              </div>
            )}
            {displayPassFail && (
              <div className={'flex flex-row w-1/2 space-x-2'}>
                <div className={`flex justify-center ${displayMeasurement ? 'ml-8 mb-4' : 'mb-2 mt-2'}`}>Pass/Fail</div>
                <div className={`flex flex-row justify-center  ${!displayMeasurement && 'mb-2 mt-2'}`}>
                  <PassIcon
                    data-testid={'passIcon'}
                    className={`h-6 w-6 cursor-pointer ${
                      sampleResults.get(slot.address)?.result === PassFail.Pass ? 'text-green-700' : 'text-gray-500'
                    }`}
                    onClick={() => {
                      send({ type: 'PASS', address: slot.address });
                    }}
                  />
                  <FailIcon
                    data-testid={'failIcon'}
                    className={`h-6 w-6 cursor-pointer ${
                      sampleResults.get(slot.address)?.result === PassFail.Fail ? 'text-red-700' : 'text-gray-500'
                    }`}
                    onClick={() => send({ type: 'FAIL', address: slot.address })}
                  />
                </div>
              </div>
            )}
          </div>
          {displayComments && (
            <div className={`flex ${slot.samples.length > 1 ? 'flex-col' : 'flex-row space-x-2'}`}>
              <div className="flex mb-4 justify-start">Comments</div>
              <div className={'flex flex-col space-y-2'}>
                {
                  /** Is it required to display comments for every section in sample **/
                  commentsForSlotSections ? (
                    slot.samples.map((sample) => (
                      <div
                        key={sample.section}
                        className={'flex flex-row justify-end'}
                        data-testid={'commentsSlotSections'}
                      >
                        {slot.samples.length > 1 && (
                          <label className={'justify-start'}>{getSampleRegion(slot.address, sample.id)}</label>
                        )}
                        <div className={`flex ml-2 `}>
                          <CustomReactSelect
                            dataTestId={'comment'}
                            value={getCommentsForSample(slot.address, sample.id)}
                            handleChange={(val) => {
                              send({
                                type: 'SET_SAMPLE_COMMENTS',
                                address: slot.address,
                                sampleId: sample.id,
                                commentIds: (val as OptionType[]).map((option) => Number(option.value))
                              });
                            }}
                            emptyOption
                            isMulti
                            options={availableComments.map((comment) => {
                              return { label: comment.text, value: comment.id + '' };
                            })}
                            fixedWidth={200}
                          />
                        </div>
                      </div>
                    ))
                  ) : (
                    <CustomReactSelect
                      value={getComment(slot.address) ?? ''}
                      dataTestId={'comment'}
                      handleChange={(val) =>
                        send({
                          type: 'SET_COMMENT',
                          address: slot.address,
                          commentId: (val as OptionType).value !== '' ? Number((val as OptionType).value) : undefined
                        })
                      }
                      emptyOption
                      options={availableComments.map((comment) => {
                        return { label: comment.text, value: comment.id + '' };
                      })}
                    />
                  )
                }
              </div>
            </div>
          )}
        </div>
      )
    );
  };

  return (
    <div>
      <div className="flex flex-row items-center justify-end">
        {<RemoveButton data-testid={'remove'} type="button" onClick={() => onRemoveClick(labware.barcode)} />}
      </div>
      <div className="flex flex-col items-center justify-around">
        {/* Display the layout of the labware */}
        <div className="flex bg-blue-100" data-testid={'passFailComments'}>
          <Labware labware={labware} slotBuilder={slotBuilder} />
        </div>

        {/* Display the list of pass/fail comments */}
        <div className="mt-8 flex flex-row items-end justify-between gap-x-4">
          {displayPassFail && (
            <>
              <BlueButton
                className="flex-shrink-0"
                data-testid={'passAll'}
                type="button"
                onClick={() => send({ type: 'PASS_ALL' })}
              >
                Pass All
              </BlueButton>
              <PinkButton
                className="flex-shrink-0"
                data-testid={'failAll'}
                type="button"
                onClick={() => send({ type: 'FAIL_ALL' })}
              >
                Fail All
              </PinkButton>
            </>
          )}
          {displayComments && (
            <CustomReactSelect
              dataTestId={'commentAll'}
              emptyOption
              value={allComments}
              handleChange={(val) => {
                if (Array.isArray(val)) {
                  setAllComments((val as OptionType[]).map((option) => option.value));
                  send({
                    type: 'SET_ALL_COMMENTS',
                    commentId: (val as OptionType[]).map((val) => Number(val.value)),
                    slots: labware.slots
                  });
                } else {
                  setAllComments([(val as OptionType).value]);
                  send({
                    type: 'SET_ALL_COMMENTS',
                    commentId: Number((val as OptionType).value),
                    slots: labware.slots
                  });
                }
              }}
              options={availableComments.map((comment) => {
                return { label: comment.text, value: comment.id + '' };
              })}
              isMulti={commentsForSlotSections}
              fixedWidth={400}
            />
          )}
        </div>
      </div>
    </div>
  );
}
