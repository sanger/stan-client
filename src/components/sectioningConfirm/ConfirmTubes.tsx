import React, { useCallback, useEffect } from 'react';
import { useMachine, useSelector } from '@xstate/react';
import classNames from 'classnames';
import Table, { TableBody, TableCell, TableHead, TableHeader } from '../Table';
import RemoveIcon from '../icons/RemoveIcon';
import { createConfirmLabwareMachine } from './confirmLabware.machine';
import { LayoutPlan } from '../../lib/machines/layout/layoutContext';
import { buildSlotColor, buildSlotSecondaryText, buildSlotText } from '../../pages/sectioning';
import { Input } from '../forms/Input';
import Modal, { ModalBody, ModalFooter } from '../Modal';
import Heading from '../Heading';
import LayoutPlanner from '../LayoutPlanner';
import BlueButton from '../buttons/BlueButton';
import PinkButton from '../buttons/PinkButton';
import Labware from '../labware/Labware';
import { CommentFieldsFragment, ConfirmSectionLabware } from '../../types/sdk';
import { ConfirmationModal } from '../modal/ConfirmationModal';
import { SectionNumberMode } from './SectioningConfirm';
import { Position } from '../../lib/helpers';
import WorkNumberSelect from '../WorkNumberSelect';
import { selectConfirmOperationLabware } from './index';

interface ConfirmTubesProps {
  layoutPlans: Array<LayoutPlan>;
  comments: Array<CommentFieldsFragment>;
  onChange: (labware: ConfirmSectionLabware) => void;
  onSectionUpdate: (layoutPlan: LayoutPlan) => void;
  onSectionNumberChange: (
    layoutPlan: LayoutPlan,
    slotAddress: string,
    sectionIndex: number,
    sectionNumber: number
  ) => void;
  onSectionThicknessChange: (
    layoutPlan: LayoutPlan,
    slotAddress: string,
    sectionIndex: number,
    sectionThickness: string
  ) => void;
  mode: SectionNumberMode;
  workNumber: string;
}

const ConfirmTubes: React.FC<ConfirmTubesProps> = ({
  layoutPlans,
  comments,
  onChange,
  onSectionNumberChange,
  onSectionThicknessChange,
  onSectionUpdate,
  mode,
  workNumber
}) => {
  return (
    <div className="p-4 rounded-lg bg-gray-100 space-y-4">
      <div>
        <p className="text-gray-800 text-sm leading-normal">
          For any tubes that were created but did not receive any sections, you can mark them as{' '}
          <span className="font-bold text-gray-900">unused</span> by clicking its cancel button.
        </p>
      </div>
      <div className="">
        <Table>
          <TableHead>
            <tr>
              <TableHeader />
              <TableHeader>Tube Barcode</TableHeader>
              <TableHeader>SGP Number</TableHeader>
              <TableHeader>Section Thickness</TableHeader>
              <TableHeader>Section Number</TableHeader>
              <TableHeader />
            </tr>
          </TableHead>
          <TableBody>
            {layoutPlans.map((layoutPlan, i) => (
              <TubeRow
                key={i}
                initialLayoutPlan={layoutPlan}
                comments={comments}
                onChange={onChange}
                onSectionUpdate={onSectionUpdate}
                onSectionNumberChange={onSectionNumberChange}
                onSectionThicknessChange={onSectionThicknessChange}
                mode={mode}
                workNumber={workNumber}
              />
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ConfirmTubes;

interface TubeRowProps {
  initialLayoutPlan: LayoutPlan;
  comments: Array<CommentFieldsFragment>;
  onChange: (labware: ConfirmSectionLabware) => void;
  onSectionUpdate: (layoutPlan: LayoutPlan) => void;
  onSectionNumberChange: (
    layoutPlan: LayoutPlan,
    slotAddress: string,
    sectionIndex: number,
    sectionNumber: number
  ) => void;
  onSectionThicknessChange: (
    layoutPlan: LayoutPlan,
    slotAddress: string,
    sectionIndex: number,
    sectionThickness: string
  ) => void;
  mode: SectionNumberMode;
  workNumber: string;
}

const TubeRow: React.FC<TubeRowProps> = ({
  initialLayoutPlan,
  comments,
  onChange,
  onSectionNumberChange,
  onSectionUpdate,
  onSectionThicknessChange,
  mode,
  workNumber
}) => {
  const confirmLabwareMachine = React.useMemo(() => {
    return createConfirmLabwareMachine(comments, initialLayoutPlan.destinationLabware, initialLayoutPlan, workNumber);
  }, [comments, initialLayoutPlan, workNumber]);
  const [current, send, service] = useMachine(confirmLabwareMachine);
  const { cancelled, layoutPlan, labware, layoutMachine } = current.context;
  const [notifyCancel, setNotifyCancel] = React.useState(false);
  const notifySectionChange = React.useRef(false);

  const confirmOperationLabware = useSelector(service, selectConfirmOperationLabware);

  useEffect(() => {
    if (confirmOperationLabware) {
      onChange(confirmOperationLabware);
    }
  }, [onChange, confirmOperationLabware]);

  /** Notify section confirm machine when increasing/decreasing the number of section  */
  useEffect(() => {
    if (
      (layoutPlan && current.context.isLayoutUpdated && notifySectionChange.current) ||
      (current.context.isCancelToggled && notifySectionChange.current)
    ) {
      notifySectionChange.current = false;
      onSectionUpdate(layoutPlan);
    }
  }, [layoutPlan, service, onSectionUpdate, current]);

  /**Update for source changes in parent**/
  useEffect(() => {
    send({ type: 'UPDATE_ALL_SOURCES', plannedActions: initialLayoutPlan.plannedActions });
  }, [initialLayoutPlan, send]);

  const rowClassnames = classNames(
    {
      'opacity-50': cancelled
    },
    'cursor-pointer hover:opacity-90 text-sm tracking-wide'
  );

  const handleOnRemoveClick = useCallback(() => {
    if (mode === SectionNumberMode.Auto) {
      notifySectionChange.current = true;
      setNotifyCancel(true);
    } else {
      send({ type: 'TOGGLE_CANCEL' });
    }
  }, [send, mode, setNotifyCancel]);

  /***Update section numbers and thickness **/
  const handleOnChange = useCallback(
    (slotAddress: string, sectionNumber: number, sectionIndex: number) => {
      /**Notify parent, so as to modify section number in original layout**/
      onSectionNumberChange(layoutPlan, slotAddress, sectionIndex, sectionNumber);
      send({
        type: 'UPDATE_SECTION_NUMBER',
        slotAddress,
        sectionNumber,
        sectionIndex
      });
    },
    [send, layoutPlan, onSectionNumberChange]
  );

  const handleSectionThicknessOnChange = useCallback(
    (slotAddress: string, sectionIndex: number, sectionThickness: string) => {
      onSectionThicknessChange(layoutPlan, slotAddress, sectionIndex, sectionThickness);
      send({
        type: 'UPDATE_SECTION_THICKNESS',
        slotAddress,
        thickness: sectionThickness,
        sectionIndex
      });
    },
    [send, layoutPlan, onSectionThicknessChange]
  );

  return (
    <>
      <ConfirmationModal
        show={notifyCancel}
        header={`${cancelled ? 'Enabling' : 'Cancelling'} tube`}
        message={{ type: 'Warning', text: 'Section number update' }}
        confirmOptions={[
          {
            label: 'Cancel',
            action: () => {
              setNotifyCancel(false);
            }
          },
          {
            label: 'Continue',
            action: () => {
              send({ type: 'TOGGLE_CANCEL' });
              setNotifyCancel(false);
            }
          }
        ]}
      >
        <p className={'font-bold mt-8'}>Planned section numbers of other labware will be updated.</p>
      </ConfirmationModal>
      <tr className={rowClassnames}>
        <TableCell>
          <div className="py-4 flex flex-col items-center justify-between space-y-8">
            <Labware
              labware={labware}
              onClick={() => {
                !cancelled && send({ type: 'EDIT_LAYOUT' });
              }}
              slotText={(address) => buildSlotText(layoutPlan, address)}
              slotSecondaryText={(address) => buildSlotSecondaryText(layoutPlan, address)}
              slotColor={(address) => buildSlotColor(layoutPlan, address)}
              barcodeInfoPosition={Position.TopRight}
            />

            <PinkButton disabled={current.matches('.done')} onClick={() => !cancelled && send({ type: 'EDIT_LAYOUT' })}>
              Edit Layout
            </PinkButton>
          </div>
        </TableCell>

        <TableCell>
          <span className={`${cancelled ? 'line-through' : ''}`}>{layoutPlan.destinationLabware.barcode}</span>
        </TableCell>
        <TableCell>
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
        </TableCell>
        <TableCell>
          {layoutPlan.plannedActions.get('A1')?.map((source, index) => (
            <div className="mb-1">
              <Input
                key={source.address + String(index)}
                data-testid={`section-thickness-tube-${layoutPlan.destinationLabware.barcode}`}
                type="number"
                value={source.sampleThickness}
                min={0.5}
                step={0.5}
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => handleSectionThicknessOnChange('A1', index, e.target.value)}
              />
            </div>
          ))}
        </TableCell>
        <TableCell>
          {layoutPlan.plannedActions.get('A1')?.map((source, index) => (
            <div className="mb-1">
              <Input
                key={source.address + String(index)}
                data-testid={`sectionnumber-tube-${layoutPlan.destinationLabware.barcode}`}
                type="number"
                value={source.newSection === 0 ? '' : String(source.newSection)}
                min={1}
                disabled={cancelled || mode === SectionNumberMode.Auto}
                // So the row click handler doesn't get triggered
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => handleOnChange('A1', Number(e.target.value), index)}
              />
            </div>
          ))}
        </TableCell>
        <TableCell onClick={handleOnRemoveClick}>
          <RemoveIcon
            data-testid={`remove-tube-${layoutPlan.destinationLabware.barcode}`}
            className="h-4 w-4 text-red-500"
          />
        </TableCell>
      </tr>
      {layoutMachine && (
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
          </ModalFooter>
        </Modal>
      )}
    </>
  );
};
