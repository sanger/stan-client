import React, { useEffect } from 'react';
import { useMachine, useSelector } from '@xstate/react';
import variants from '../../lib/motionVariants';
import Labware from '../labware/Labware';
import PinkButton from '../buttons/PinkButton';
import Modal, { ModalBody, ModalFooter } from '../Modal';
import Heading from '../Heading';
import BlueButton from '../buttons/BlueButton';
import { motion } from '../../dependencies/motion';
import { selectOptionValues } from '../forms';
import LayoutPlanner from '../LayoutPlanner';
import Label from '../forms/Label';
import WhiteButton from '../buttons/WhiteButton';
import { sortRightDown } from '../../lib/helpers/labwareHelper';
import LabwareComments, { SectionNumberSetting } from './LabwareComments';
import { buildSlotColor, buildSlotSecondaryText, buildSlotText } from '../../pages/sectioning';
import { createConfirmLabwareMachine } from './confirmLabware.machine';
import { LayoutPlan } from '../../lib/machines/layout/layoutContext';
import { CommentFieldsFragment, ConfirmSectionLabware, SlotRegionFieldsFragment } from '../../types/sdk';
import { selectConfirmOperationLabware } from './index';
import RemoveButton from '../buttons/RemoveButton';
import { ConfirmationModal } from '../modal/ConfirmationModal';
import { SectionNumberMode } from './SectioningConfirm';
import { LabwareTypeName } from '../../types/stan';
import CustomReactSelect, { OptionType } from '../forms/CustomReactSelect';
import { Position } from '../../lib/helpers';

interface ConfirmLabwareProps {
  /**
   * The layout plan created originally
   */
  originalLayoutPlan: LayoutPlan;

  /**
   * The list of comments that will be available for the user to choose for each section
   */
  comments: Array<CommentFieldsFragment>;

  /**
   * The list of regions in slot that will be available for the user to choose for each section.
   * Region is to specify where the user is keeping the section of a sample in a slot, if there are multiple samples(/sections)
   */
  slotRegions: Array<SlotRegionFieldsFragment>;

  /**
   * Is section number enabled?
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
   * Callback on section updates
   * @param layoutPlan : Plan in which section chnaged
   */
  onSectionUpdate?: (layoutPlan: LayoutPlan) => void;

  /**
   * Callback on section number changes
   * @param layoutPlan - Plan changed
   * @param slotAddress - Address of the slot in which the section belongs
   * @param sectionIndex - Index of section in slot
   * @param sectionNumber - New section number
   */
  onSectionNumberChange?: (
    layoutPlan: LayoutPlan,
    slotAddress: string,
    sectionIndex: number,
    sectionNumber: number
  ) => void;
}

const ConfirmLabware: React.FC<ConfirmLabwareProps> = ({
  originalLayoutPlan,
  comments,
  slotRegions,
  onChange,
  sectionNumberEnabled = true,
  onSectionUpdate,
  onSectionNumberChange,
  removePlan,
  mode
}) => {
  const confirmLabwareMachine = React.useMemo(() => {
    return createConfirmLabwareMachine(comments, originalLayoutPlan.destinationLabware, originalLayoutPlan);
  }, [comments, originalLayoutPlan]);
  const [current, send, service] = useMachine(confirmLabwareMachine);
  const confirmOperationLabware = useSelector(service, selectConfirmOperationLabware);

  const { addressToCommentMap, labware, layoutPlan, commentsForAllSections } = current.context;
  const { layoutMachine } = current.context;
  const [notifyDelete, setNotifyDelete] = React.useState(false);
  const notifySectionChange = React.useRef(false);

  useEffect(() => {
    if (confirmOperationLabware) {
      onChange(confirmOperationLabware);
    }
  }, [onChange, confirmOperationLabware]);

  useEffect(() => {
    //Notify parent only for layout changes
    if (layoutPlan && current.matches('editableMode') && notifySectionChange.current) {
      notifySectionChange.current = false;
      onSectionUpdate && onSectionUpdate(layoutPlan);
    }
  }, [layoutPlan, service, onSectionUpdate, current, layoutMachine]);

  /***Update sources whenever there is an update in a source in parent**/
  useEffect(() => {
    if (originalLayoutPlan) {
      send({ type: 'UPDATE_ALL_SOURCES', plannedActions: originalLayoutPlan.plannedActions });
    }
  }, [originalLayoutPlan, send]);

  const handleRemovePlan = React.useCallback(() => {
    if (mode === SectionNumberMode.Auto && sectionNumberEnabled) {
      setNotifyDelete(true);
    } else {
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
      <RemoveButton data-testid={`remove-slide-${labware.barcode}`} onClick={handleRemovePlan} />
      <div
        data-testid={`div-slide-${labware.barcode}`}
        className={`${sectionNumberEnabled && 'md:grid md:grid-cols-2'}`}
      >
        <div className="py-4 flex flex-col items-center justify-between space-y-8">
          <Labware
            labware={labware}
            onClick={() => sectionNumberEnabled && send({ type: 'EDIT_LAYOUT' })}
            slotText={(address) => buildSlotText(layoutPlan, address)}
            slotSecondaryText={(address) => buildSlotSecondaryText(layoutPlan, address)}
            slotColor={(address) => buildSlotColor(layoutPlan, address)}
            barcodeInfoPosition={Position.TopRight}
          />
          {sectionNumberEnabled && (
            <PinkButton disabled={current.matches('done')} onClick={() => send({ type: 'EDIT_LAYOUT' })}>
              Edit Layout
            </PinkButton>
          )}
        </div>
        {sectionNumberEnabled && (
          <div className="p-4 space-y-2 space-x-2 bg-gray-100">
            <Heading level={3} showBorder={false}>
              Comments
            </Heading>
            <div className={'grid grid-cols-3 py-2 text-gray-500 text-center'}>
              <div>Section number</div>
              <div>Region</div>
              <div>Comment</div>
            </div>
            <div className="w-full space-y-4">
              <div data-testid="labware-comments" className={'flex flex-col space-y-4'}>
                {sortRightDown(labware.slots).map((slot) => (
                  <LabwareComments
                    key={slot.address}
                    slot={slot}
                    slotRegions={slotRegions}
                    value={addressToCommentMap.get(slot.address) ?? ''}
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
                    onSlotRegionChange={(slotAddress, sectionIndex, region) =>
                      send({
                        type: 'SET_REGION_FOR_SECTION',
                        address: slot.address,
                        sectionIndex,
                        region
                      })
                    }
                    onCommentChange={(slotAddress, sectionIndex, commentIds) => {
                      send({
                        type: 'SET_COMMENT_FOR_ADDRESS',
                        address: slot.address,
                        commentId: commentIds.length > 0 ? commentIds[0] : ''
                      });
                      send({
                        type: 'SET_COMMENTS_FOR_SECTION',
                        address: slot.address,
                        sectionIndex,
                        commentIds
                      });
                    }}
                    onSectionNumberChange={(slotAddress, sectionIndex, sectionNumber) => {
                      /**Notify parent, so as to modify section number in original layout*/
                      onSectionNumberChange &&
                        onSectionNumberChange(layoutPlan, slotAddress, sectionIndex, sectionNumber);
                      send({
                        type: 'UPDATE_SECTION_NUMBER',
                        slotAddress,
                        sectionIndex,
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

      <Modal show={current.matches('editingLayout')}>
        <ModalBody>
          <Heading level={3}>Set Layout</Heading>
          {layoutMachine && (
            <LayoutPlanner actor={layoutMachine}>
              <div className="my-2 text-gray-900 text-sm leading-normal">
                <p>Click a slot to increase the number of sections in that slot.</p>
                <p>To reduce the number of sections in a slot, use Ctrl-Click.</p>
              </div>
            </LayoutPlanner>
          )}
        </ModalBody>
        {layoutMachine && (
          <ModalFooter>
            <BlueButton
              onClick={() => {
                notifySectionChange.current = true;
                layoutMachine.send({ type: 'DONE' });
              }}
              className="w-full text-base sm:ml-3 sm:w-auto sm:text-sm"
            >
              Done
            </BlueButton>
            <WhiteButton onClick={() => layoutMachine.send({ type: 'CANCEL' })} className="mt-3 sm:mt-0 sm:ml-3">
              Cancel
            </WhiteButton>
          </ModalFooter>
        )}
      </Modal>
      {
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
                layoutPlan &&
                  layoutPlan.destinationLabware.barcode &&
                  removePlan(layoutPlan.destinationLabware.barcode);
                setNotifyDelete(false);
              }
            }
          ]}
        >
          <p className={'font-bold mt-8'}>Planned section numbers of other labware will be updated.</p>
        </ConfirmationModal>
      }
    </motion.div>
  );
};

export default ConfirmLabware;
