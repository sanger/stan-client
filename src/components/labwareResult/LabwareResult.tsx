import React, { useEffect } from 'react';
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
};

/**
 * Component to manage recording pass/fail results on each sample
 */
export default function LabwareResult({
  labware,
  initialLabwareResult,
  availableComments,
  onRemoveClick,
  onChange
}: LabwareResultComponentProps) {
  const labwareResultMachine = React.useMemo(() => {
    return createLabwareResultMachine({
      labwareResult: initialLabwareResult,
      availableComments
    });
  }, [initialLabwareResult, availableComments]);
  const [current, send] = useMachine(labwareResultMachine);

  const { labwareResult } = current.context;

  const sampleResults = mapify(labwareResult.sampleResults, 'address');
  const slotMeasurements = labwareResult.slotMeasurements
    ? mapify(labwareResult.slotMeasurements, 'address')
    : new Map<string, SlotMeasurementRequest>();

  useEffect(() => {
    onChange(labwareResult);
  }, [labwareResult, onChange]);

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
    const commentId = sampleResults.get(address)!.commentId;
    return commentId ? commentId + '' : '';
  };
  const slotBuilder = (slot: SlotFieldsFragment): React.ReactNode => {
    return (
      isSlotFilled(slot) && (
        <div
          className={`flex flex-col ${isMeasurementExist && labware.slots.length > 1 && 'border-b border-gray-300'}`}
        >
          <div className="flex flex-row items-center justify-between gap-x-2">
            <div>
              <div className="flex flex-row items-center justify-between">
                <PassIcon
                  data-testid={'passIcon'}
                  className={`h-6 w-6 cursor-pointer ${
                    sampleResults.get(slot.address)!.result === PassFail.Pass ? 'text-green-700' : 'text-gray-500'
                  }`}
                  onClick={() => {
                    send({ type: 'PASS', address: slot.address });
                  }}
                />

                <FailIcon
                  data-testid={'failIcon'}
                  className={`h-6 w-6 cursor-pointer ${
                    sampleResults.get(slot.address)!.result === PassFail.Fail ? 'text-red-700' : 'text-gray-500'
                  }`}
                  onClick={() => send({ type: 'FAIL', address: slot.address })}
                />
              </div>
            </div>
            <div className="w-full">
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
            </div>
          </div>
          {isMeasurementExist && (
            <div className="flex flex-row items-center  mt-3 pb-3">
              <div className="w-full font-normal">Coverage</div>
              <Input
                type="number"
                data-testid="coverage"
                min={0}
                max={100}
                value={slotMeasurements.get(slot.address)!.value}
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
        <div className="bg-blue-100" data-testid={'passFailComments'}>
          <Labware labware={labware} slotBuilder={slotBuilder} />
        </div>

        {/* Display the list of pass/fail comments */}
        <div className="mt-8 flex flex-row items-end justify-between gap-x-4">
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
          <CustomReactSelect
            dataTestId={'commentAll'}
            emptyOption
            handleChange={(val) =>
              send({
                type: 'SET_ALL_COMMENTS',
                commentId: (val as OptionType).value !== '' ? Number((val as OptionType).value) : undefined
              })
            }
            options={availableComments.map((comment) => {
              return { label: comment.text, value: comment.id + '' };
            })}
          />
        </div>
      </div>
    </div>
  );
}
