import React, { useEffect } from 'react';
import { useMachine, useSelector } from '@xstate/react';
import variants from '../../lib/motionVariants';
import Labware from '../labware/Labware';
import PinkButton from '../buttons/PinkButton';
import Modal, { ModalBody, ModalFooter } from '../Modal';
import Heading from '../Heading';
import BlueButton from '../buttons/BlueButton';
import { motion } from 'framer-motion';
import { optionValues } from '../forms';
import LayoutPlanner from '../LayoutPlanner';
import Label from '../forms/Label';
import WhiteButton from '../buttons/WhiteButton';
import { sortRightDown } from '../../lib/helpers/labwareHelper';
import { Select } from '../forms/Select';
import LabwareComments, { SectionNumberSetting } from './LabwareComments';
import classNames from 'classnames';
import { buildSlotColor, buildSlotSecondaryText, buildSlotText } from '../../pages/sectioning';
import { createConfirmLabwareMachine } from './confirmLabware.machine';
import { LayoutPlan } from '../../lib/machines/layout/layoutContext';
import { CommentFieldsFragment, ConfirmSectionLabware } from '../../types/sdk';
import { selectConfirmOperationLabware } from './index';
import RemoveButton from '../buttons/RemoveButton';
import { ConfirmationModal } from '../modal/ConfirmationModal';
import { SectionNumberMode } from './SectioningConfirm';
import { LabwareTypeName } from '../../types/stan';

interface ConfirmLabwareProps {
  originalLayoutPlan: LayoutPlan;
  comments: Array<CommentFieldsFragment>;
  onChange: (labware: ConfirmSectionLabware) => void;
  sectionNumberEnabled?: boolean;
  onSectionUpdate?: (layoutPlan: LayoutPlan) => void;
  onSectionNumberChange?: (
    layoutPlan: LayoutPlan,
    slotAddress: string,
    sectionIndex: number,
    sectionNumber: number
  ) => void;
  removePlan: (barcode: string) => void;
  mode: SectionNumberMode;
}

const ConfirmLabware: React.FC<ConfirmLabwareProps> = ({
  originalLayoutPlan,
  comments,
  onChange,
  sectionNumberEnabled = true,
  onSectionUpdate,
  onSectionNumberChange,
  removePlan,
  mode
}) => {
  const [current, send, service] = useMachine(
    createConfirmLabwareMachine(comments, originalLayoutPlan.destinationLabware, originalLayoutPlan)
  );
  const confirmOperationLabware = useSelector(service, selectConfirmOperationLabware);

  const { addressToCommentMap, labware, layoutPlan } = current.context;
  const { layoutMachine } = current.children;
  const [notifyDelete, setNotifyDelete] = React.useState(false);
  const notifySectionChange = React.useRef(false);

  const gridClassNames = classNames(
    {
      'sm:grid-cols-1': labware.labwareType.numColumns === 1,
      'sm:grid-cols-2': labware.labwareType.numColumns === 2
    },
    'grid grid-cols-1 gap-x-8 gap-y-2'
  );

  useEffect(() => {
    if (confirmOperationLabware) {
      onChange(confirmOperationLabware);
    }
  }, [onChange, confirmOperationLabware]);

  useEffect(() => {
    //Notify parent only for layout changes
    if (layoutPlan && current.event.type === 'done.invoke.layoutMachine' && notifySectionChange.current) {
      notifySectionChange.current = false;

      onSectionUpdate && onSectionUpdate(layoutPlan);
    }
  }, [layoutPlan, current.event, onSectionUpdate]);

  /***Update sources whenever there is an update in a source in parent**/
  useEffect(() => {
    if (originalLayoutPlan) {
      send('UPDATE_ALL_SOURCES', originalLayoutPlan);
    }
  }, [originalLayoutPlan, send]);

  const handleRemovePlan = React.useCallback(() => {
    if (mode === SectionNumberMode.Auto && sectionNumberEnabled) {
      setNotifyDelete(true);
    } else {
      removePlan(layoutPlan.destinationLabware.barcode!);
    }
  }, [mode, setNotifyDelete, removePlan, layoutPlan.destinationLabware.barcode, sectionNumberEnabled]);

  return (
    <motion.div
      variants={variants.fadeInWithLift}
      initial={'hidden'}
      animate={'visible'}
      className={`relative p-3 shadow ${!sectionNumberEnabled && 'lg:w-2/3 lg:mx-auto rounded-lg'}`}
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
          />
          {sectionNumberEnabled && (
            <PinkButton disabled={current.matches('done')} onClick={() => send({ type: 'EDIT_LAYOUT' })}>
              Edit Layout
            </PinkButton>
          )}
        </div>
        {sectionNumberEnabled && (
          <div className="p-4 space-y-8 space-x-2 bg-gray-100">
            <Heading level={3} showBorder={false}>
              Comments
            </Heading>

            <div className="w-full space-y-4">
              <div data-testid="labware-comments" className={gridClassNames}>
                {sortRightDown(labware.slots).map((slot) => (
                  <LabwareComments
                    key={slot.address}
                    slot={slot}
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
                    onCommentChange={(e) => {
                      send({
                        type: 'SET_COMMENT_FOR_ADDRESS',
                        address: slot.address,
                        commentId: e.currentTarget.value
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
            <Label name={'All slots:'}>
              <Select
                disabled={current.matches('done')}
                onChange={(e) =>
                  send({
                    type: 'SET_COMMENT_FOR_ALL',
                    commentId: e.currentTarget.value
                  })
                }
              >
                <option />
                {optionValues(comments, 'text', 'id')}
              </Select>
            </Label>
          </div>
        )}
      </div>

      <Modal show={current.matches('editingLayout')}>
        <ModalBody>
          <Heading level={3}>Set Layout</Heading>
          {layoutMachine && (
            <LayoutPlanner actor={layoutMachine}>
              <div className="my-2">
                <p className="text-gray-900 text-sm leading-normal">
                  Click a slot to increase the number of sections in that slot.
                </p>
                <p>To reduce the number of sections in a slot, use Ctrl-Click.</p>
              </div>
            </LayoutPlanner>
          )}
        </ModalBody>
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
          <WhiteButton onClick={() => layoutMachine.send({ type: 'CANCEL' })} className="mt-3 w-full sm:mt-0 sm:ml-3">
            Cancel
          </WhiteButton>
        </ModalFooter>
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
