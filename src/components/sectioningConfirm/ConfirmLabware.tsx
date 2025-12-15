import React, { useEffect } from 'react';
import { useMachine, useSelector } from '@xstate/react';
import variants from '../../lib/motionVariants';
import Labware from '../labware/Labware';
import Heading from '../Heading';
import { motion } from '../../dependencies/motion';
import { selectOptionValues } from '../forms';
import Label from '../forms/Label';
import LabwareComments, { SectionNumberSetting } from './LabwareComments';
import { buildSlotColor, buildSlotText } from '../../pages/sectioning';
import { createConfirmLabwareMachine } from './confirmLabware.machine';
import { LayoutPlan } from '../../lib/machines/layout/layoutContext';
import { CommentFieldsFragment, ConfirmSectionLabware } from '../../types/sdk';
import RemoveButton from '../buttons/RemoveButton';
import CustomReactSelect, { OptionType } from '../forms/CustomReactSelect';
import { Position } from '../../lib/helpers';
import WorkNumberSelect from '../WorkNumberSelect';
import { selectConfirmOperationLabware } from './index';
import { SectionNumberMode } from './SectioningConfirm';
import { LabwareTypeName } from '../../types/stan';
import { ConfirmationModal } from '../modal/ConfirmationModal';

interface ConfirmLabwareProps {
  /**
   * The work number associated with the sectioning plan.
   */
  workNumber: string;
  /**
   * The layout plan created originally
   */
  originalLayoutPlan: LayoutPlan;

  /**
   * The list of comments that will be available for the user to choose for each section
   */
  comments: Array<CommentFieldsFragment>;

  /* Is section number enabled?
   */
  sectionNumberEnabled?: boolean;

  /**
   * The numbering mode for section numbers - Auto or Manual
   */
  mode: SectionNumberMode;

  /**Callback on change in labware**/
  onChange: (labware: ConfirmSectionLabware) => void;

  /**
   * Callback on removing plan
   * @param barcode - Barcode of labware plan removed
   */
  removePlan: (barcode: string) => void;

  /**
   * Callback on section number changes
   * @param layoutPlan - Plan changed
   * @param slotAddress - Address of the slot in which the section belongs
   * @param sectionNumber - New section number
   */
  onSectionNumberChange?: (layoutPlan: LayoutPlan, sectionGroupId: string, sectionNumber: number) => void;

  onSectionThicknessChange?: (layoutPlan: LayoutPlan, sectionGroupId: string, sectionThickness: string) => void;
}

const ConfirmLabware: React.FC<ConfirmLabwareProps> = ({
  workNumber,
  originalLayoutPlan,
  comments,
  onChange,
  sectionNumberEnabled = true,
  // onSectionUpdate,
  onSectionNumberChange,
  removePlan,
  mode,
  onSectionThicknessChange
}) => {
  const confirmLabwareMachine = React.useMemo(() => {
    return createConfirmLabwareMachine(comments, originalLayoutPlan.destinationLabware, originalLayoutPlan, workNumber);
  }, [comments, originalLayoutPlan, workNumber]);
  const [current, send, service] = useMachine(confirmLabwareMachine);
  const confirmOperationLabware = useSelector(service, selectConfirmOperationLabware);

  const { labware, layoutPlan, commentsForAllSections } = current.context;
  const [notifyDelete, setNotifyDelete] = React.useState(false);
  const notifySectionChange = React.useRef(false);

  useEffect(() => {
    if (confirmOperationLabware) {
      onChange(confirmOperationLabware);
    }
  }, [onChange, confirmOperationLabware]);

  //
  // useEffect(() => {
  //   //Notify parent only for layout changes
  //   if (layoutPlan && current.matches('editableMode') && notifySectionChange.current) {
  //     notifySectionChange.current = false;
  //     onSectionUpdate && onSectionUpdate(layoutPlan);
  //   }
  // }, [layoutPlan, service, onSectionUpdate, current, layoutMachine]);

  const handleRemovePlan = React.useCallback(() => {
    console.log('==================== Handle Remove Plan ==================== 1');
    if (mode === SectionNumberMode.Auto && sectionNumberEnabled) {
      setNotifyDelete(true);
    } else {
      console.log('==================== Handle Remove Plan ====================');
      console.log(layoutPlan.destinationLabware.barcode);
      notifySectionChange.current = true;
      removePlan(layoutPlan.destinationLabware.barcode!);
    }
  }, [mode, setNotifyDelete, removePlan, layoutPlan.destinationLabware.barcode, sectionNumberEnabled]);

  return (
    <motion.div
      variants={variants.fadeInWithLift}
      initial={'hidden'}
      animate={'visible'}
      className={`relative p-3 shadow-md ${!sectionNumberEnabled && 'lg:w-2/3 lg:mx-auto rounded-lg'}`}
    >
      <div className="flex flex-row items-center justify-end">
        <RemoveButton data-testid={`remove-slide-${labware.barcode}`} onClick={handleRemovePlan} />
      </div>

      <div>
        <p className="ml-1">SGP number to associate with this sectioning plan</p>
        <div className="mt-4 mb-4 md:w-1/3">
          <WorkNumberSelect
            dataTestId={`sectionnumber-worknumber-${layoutPlan.destinationLabware.barcode}`}
            onWorkNumberChange={(_workNumber) => {
              send({
                type: 'UPDATE_SECTION_WORK_NUMBER',
                labware: confirmOperationLabware!,
                workNumber: _workNumber
              });
            }}
            workNumber={confirmOperationLabware?.workNumber ?? workNumber}
          />
        </div>
      </div>
      <div
        data-testid={`div-slide-${labware.barcode}`}
        className={`${sectionNumberEnabled && 'md:grid md:grid-cols-2'}`}
      >
        <div className="py-4 flex flex-col items-center justify-between space-y-8">
          <Labware
            labware={labware}
            slotText={(address) => buildSlotText(layoutPlan, address)}
            slotColor={(address) => buildSlotColor(layoutPlan, address)}
            barcodeInfoPosition={Position.TopRight}
            sectionGroups={layoutPlan.plannedActions}
          />
        </div>
        {sectionNumberEnabled && (
          <div className="p-4 space-y-2 space-x-2 bg-gray-100">
            <Heading level={3} showBorder={false}>
              Comments
            </Heading>
            <div className={'grid grid-cols-4 gap-x-1 py-2 text-gray-500 text-center'}>
              <div>Section number</div>
              <div>Address(es)</div>
              <div>Section Thickness</div>
              <div>Comment</div>
            </div>
            <div className="w-full space-y-4">
              <div data-testid="labware-comments" className={'flex flex-col space-y-4'}>
                {Object.keys(layoutPlan.plannedActions).map((sectionGroupId) => (
                  <LabwareComments
                    key={sectionGroupId}
                    sectionGroupId={sectionGroupId}
                    disabledComment={current.matches('done')}
                    sectionNumberDisplay={
                      labware.labwareType.name === LabwareTypeName.FETAL_WASTE_CONTAINER
                        ? SectionNumberSetting.HIDE
                        : mode === SectionNumberMode.Auto || current.matches('done')
                          ? SectionNumberSetting.DISABLE
                          : SectionNumberSetting.NORMAL
                    }
                    comments={comments}
                    layoutPlan={layoutPlan}
                    onCommentChange={(commentIds) => {
                      send({
                        type: 'SET_COMMENTS_FOR_SECTION',
                        sectionGroupId,
                        commentIds
                      });
                    }}
                    onSectionThicknessChange={(sectionGroupId, thickness) => {
                      onSectionThicknessChange && onSectionThicknessChange(layoutPlan, sectionGroupId, thickness);
                      send({
                        type: 'UPDATE_SECTION_THICKNESS',
                        sectionGroupId,
                        thickness
                      });
                    }}
                    onSectionNumberChange={(sectionGroupId, sectionNumber) => {
                      /**Notify parent, so as to modify section number in original layout*/
                      onSectionNumberChange && onSectionNumberChange(layoutPlan, sectionGroupId, sectionNumber);
                      send({
                        type: 'UPDATE_SECTION_NUMBER',
                        sectionGroupId,
                        sectionNumber
                      });
                    }}
                  />
                ))}
              </div>
            </div>
            <div className={'border-2 border-gray-300'} />
            <Label name={'Set comments in all sections:'} className={'flex whitespace-nowrap py-4'}>
              <CustomReactSelect
                isDisabled={current.matches('done')}
                handleChange={(comments) => {
                  const commentIds = (comments as OptionType[]).map((val) => val.value);
                  send({
                    type: 'SET_COMMENT_FOR_ALL',
                    commentIds
                  });
                }}
                value={commentsForAllSections}
                isMulti
                options={selectOptionValues(comments, 'text', 'id')}
              />
            </Label>
          </div>
        )}
      </div>
      <ConfirmationModal
        show={notifyDelete}
        header={'Removing labware'}
        message={{ type: 'Warning', text: 'Section number update' }}
        confirmOptions={[
          {
            label: 'Cancel',
            action: () => {
              setNotifyDelete(false);
            }
          },
          {
            label: 'Continue',
            action: () => {
              layoutPlan && layoutPlan.destinationLabware.barcode && removePlan(layoutPlan.destinationLabware.barcode);
              setNotifyDelete(false);
            }
          }
        ]}
      >
        <p className={'font-bold mt-8'}>Planned section numbers of other labware will be updated.</p>
      </ConfirmationModal>
    </motion.div>
  );
};

export default ConfirmLabware;
