import React from 'react';
import { selectOptionValues } from '../forms';
import { Comment, LabwareFieldsFragment, SlotRegionFieldsFragment } from '../../types/sdk';
import { LayoutPlan } from '../../lib/machines/layout/layoutContext';
import { Input } from '../forms/Input';
import CustomReactSelect, { OptionType } from '../forms/CustomReactSelect';
import MutedText from '../MutedText';

export enum SectionNumberSetting {
  NORMAL,
  DISABLE,
  HIDE
}
interface LabwareCommentsProps {
  slot: LabwareFieldsFragment['slots'][number];
  slotRegions: SlotRegionFieldsFragment[];
  layoutPlan: LayoutPlan;
  comments: Array<Comment>;
  value: string | number | undefined;
  disabledComment?: boolean;
  sectionNumberDisplay?: SectionNumberSetting;
  onCommentChange: (slotAddress: string, sectionIndex: number, commentIds: string[]) => void;
  onSlotRegionChange: (slotAddress: string, sectionIndex: number, slotRegion: string) => void;
  onSectionNumberChange: (slotAddress: string, sectionIndex: number, sectionNumber: number) => void;
}

const LabwareComments: React.FC<LabwareCommentsProps> = ({
  slot,
  slotRegions,
  layoutPlan,
  comments,
  value,
  onCommentChange,
  onSlotRegionChange,
  disabledComment = false,
  sectionNumberDisplay = SectionNumberSetting.NORMAL,
  onSectionNumberChange
}) => {
  const sections = layoutPlan.plannedActions.get(slot.address);

  const isRegionExists = (region: string) => {
    const regions = sections?.filter((section) => section.region === region);
    return regions && regions.length > 1;
  };

  return (
    <div className="flex flex-row items-start justify-start gap-x-2">
      <span className="font-medium text-gray-800 tracking-wide py-2">{slot.address}</span>
      <div className="flex flex-col">
        {sections?.map((source, index) => (
          <div
            className={'grid grid-cols-3 gap-x-3  gap-y-2 items-center content-center'}
            key={source.address + String(index)}
          >
            {sectionNumberDisplay !== SectionNumberSetting.HIDE && (
              <>
                <Input
                  type="number"
                  value={source.newSection === 0 ? '' : String(source.newSection)}
                  min={1}
                  disabled={sectionNumberDisplay === SectionNumberSetting.DISABLE}
                  onChange={(e) => onSectionNumberChange(slot.address, index, Number(e.target.value))}
                />

                <div className={'flex flex-col'}>
                  <CustomReactSelect
                    isDisabled={disabledComment || sections.length <= 1}
                    className={'w-full'}
                    emptyOption
                    options={selectOptionValues(slotRegions, 'name', 'name')}
                    handleChange={(option) => {
                      const region = (option as OptionType).value;
                      onSlotRegionChange(slot.address, index, region);
                    }}
                  />
                  {source.region && isRegionExists(source.region) && (
                    <MutedText className={'text-red-400'}>{'Unique value required.'}</MutedText>
                  )}
                </div>
                {layoutPlan.plannedActions.has(slot.address) && (
                  <CustomReactSelect
                    value={value}
                    isDisabled={disabledComment}
                    handleChange={(options) => {
                      const optionsValues = Array.isArray(options)
                        ? options.map((option) => option.value)
                        : [(options as OptionType).value];
                      onCommentChange(slot.address, index, optionsValues);
                    }}
                    className={'w-full'}
                    isMulti
                    options={selectOptionValues(comments, 'text', 'id')}
                  />
                )}
                {/*source.region && isRegionExists(source.region, index) && (
                  <>
                    <div />
                    <MutedText className={'text-red-400'}>{'Unique value required.'}</MutedText>
                    <div />
                  </>
                )*/}
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default LabwareComments;
