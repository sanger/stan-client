import React, { useCallback } from 'react';
import { TableCell } from '../Table';
import {
  CommentFieldsFragment,
  OmeroProjectFieldsFragment,
  WorkStatus,
  WorkWithCommentFieldsFragment
} from '../../types/sdk';
import { useMachine } from '@xstate/react';
import createWorkRowMachine, { WorkRowEvent } from './workRow.machine';
import { selectOptionValues } from '../forms';
import WhiteButton from '../buttons/WhiteButton';
import BlueButton from '../buttons/BlueButton';
import { capitalize } from 'lodash';
import { Form, Formik } from 'formik';
import PinkButton from '../buttons/PinkButton';
import { MAX_NUM_BLOCKANDSLIDES } from './WorkAllocation';
import FormikInput from '../forms/Input';
import CustomReactSelect, { OptionType } from '../forms/CustomReactSelect';

/**
 * The type of values for the edit form
 */
type FormValues = {
  /**
   * A union of the machine's event types
   */
  type: WorkRowEvent['type'];

  /**
   * ID of a comment about why Work status changed
   */
  commentId: number;
};

type WorkRowProps = {
  /**
   * A {@link WorkWithCommentFieldsFragment} to be possibly edited
   */
  initialWork: WorkWithCommentFieldsFragment;

  /**
   * The comments available for the user to select when updating Work status
   */
  availableComments: Array<CommentFieldsFragment>;
  /**
   * The comments available for the user to select when updating Work status
   */
  availableOmeroProjects: Array<OmeroProjectFieldsFragment>;

  rowIndex: number;
  onWorkFieldUpdate: (index: number, work: WorkWithCommentFieldsFragment) => void;
};

/**
 * Component for displaying information about Work in a table row, as well as the ability
 * to edit its status
 */
export default function WorkRow({
  initialWork,
  availableComments,
  availableOmeroProjects,
  rowIndex,
  onWorkFieldUpdate
}: WorkRowProps) {
  const workRowMachine = React.useMemo(() => {
    return createWorkRowMachine({ workWithComment: initialWork });
  }, [initialWork]);
  const [current, send] = useMachine(workRowMachine);

  const {
    editModeEnabled,
    workWithComment: { work, comment }
  } = current.context;

  /**Notify the changes in work fields*/
  React.useEffect(() => {
    debugger;
    if (
      current.event.type === 'done.invoke.updateWorkPriority' ||
      current.event.type === 'done.invoke.updateWorkNumSlides' ||
      current.event.type === 'done.invoke.updateWorkNumBlocks' ||
      current.event.type === 'done.invoke.updateWorkStatus' ||
      current.event.type === 'done.invoke.updateWorkOmeroProject'
    ) {
      onWorkFieldUpdate(rowIndex, { work: work, comment: comment });
    }
  }, [work, comment, onWorkFieldUpdate, rowIndex, current]);
  /**
   * Should the edit button by displayed to the user right now
   */
  const showEditButton = !editModeEnabled && current.nextEvents.includes('EDIT');

  /**
   * List of possible events that can change the current status (excluding edit)
   */
  const nextStatuses = current.nextEvents.filter(
    (e) => e !== 'EDIT' && e !== 'UPDATE_NUM_SLIDES' && e !== 'UPDATE_NUM_BLOCKS' && e !== 'UPDATE_PRIORITY'
  );

  /**
   * Set the initial values for the form to the first next status and first available comment
   * The comment will only be shown if the selected next status requires one
   */
  const initialValues: FormValues = {
    type: nextStatuses[0] as WorkRowEvent['type'],
    commentId: availableComments[0].id
  };

  React.useEffect(() => {});

  /**
   * Event handler for the form submission. Sends an event to the machine.
   * @param values the form values
   */
  const onFormSubmit = async (values: FormValues) => {
    send(values.type, {
      commentId: requiresComment(values.type) ? Number(values.commentId) : undefined
    });
  };

  /**
   * Callback for when the user edits Number of blocks or slides in the table/>
   */
  const handleWorkNumValueChange = useCallback(
    (workNumValue: string | number, workNumValueType: string) => {
      let value = workNumValue === '' ? undefined : Number(workNumValue);
      if (value && value > MAX_NUM_BLOCKANDSLIDES) value = MAX_NUM_BLOCKANDSLIDES;
      if (workNumValueType === 'block') {
        send({ type: 'UPDATE_NUM_BLOCKS', numBlocks: value });
      } else if (workNumValueType === 'slide') {
        send({ type: 'UPDATE_NUM_SLIDES', numSlides: value });
      } else if (workNumValueType === 'originalSamples') {
        send({
          type: 'UPDATE_NUM_ORIGINAL_SAMPLES',
          numOriginalSamples: value
        });
      }
    },
    [send]
  );

  const renderWorkNumValueField = (workNumber: string, workNumValue: number | undefined, workNumValueType: string) => {
    return (
      <input
        data-testid={workNumber + '-' + workNumValueType}
        className={'border-0 border-gray-100'}
        type="number"
        min="0"
        max={MAX_NUM_BLOCKANDSLIDES}
        step="1"
        onChange={(e) => {
          handleWorkNumValueChange(e.currentTarget.value, workNumValueType);
        }}
        defaultValue={workNumValue ?? ''}
      />
    );
  };
  const rendeWorkOmeroProjectField = (workNumber: string, omeroProjectName: string | undefined) => {
    return (
      <CustomReactSelect
        dataTestId={workNumber + '-' + omeroProjectName}
        handleChange={(val) => {
          send({
            type: 'UPDATE_OMERO_PROJECT',
            omeroProject: (val as OptionType).label
          });
        }}
        value={omeroProjectName}
        options={selectOptionValues(availableOmeroProjects, 'name', 'name')}
      />
    );
  };

  const validateWorkPriority = (priority: string) => {
    let errorMessage = '';
    if (priority.length === 0) return errorMessage;
    if (priority.length > 3) {
      errorMessage = 'Invalid format';
    }
    const priorityRegEx = /^[A-Z]\d+$/;
    if (!priorityRegEx.test(priority.toUpperCase())) {
      errorMessage = 'Invalid format';
    }
    return errorMessage;
  };

  const isEditEnabledForStatus = (status: WorkStatus) => {
    return status !== WorkStatus.Failed && status !== WorkStatus.Completed && status !== WorkStatus.Withdrawn;
  };
  return (
    <tr>
      <TableCell>
        {
          /**Once workrequest is failed or completed then priority need to be cleared**/
          isEditEnabledForStatus(work.status) ? (
            <Formik initialValues={{ priority: work.priority ?? '' }} onSubmit={() => {}}>
              {({ setFieldValue }) => {
                return (
                  <Form>
                    <FormikInput
                      style={{ width: '100%' }}
                      label={''}
                      name={'priority'}
                      data-testid={`${work.workNumber}-priority`}
                      className={`border-0 border-gray-100`}
                      onChange={(e: React.FormEvent<HTMLInputElement>) => {
                        const priority = e.currentTarget.value.toUpperCase();
                        setFieldValue('priority', priority);
                        if (validateWorkPriority(priority).length === 0) {
                          send({
                            type: 'UPDATE_PRIORITY',
                            priority: e.currentTarget.value.toUpperCase()
                          });
                        }
                      }}
                      validate={validateWorkPriority}
                    />
                  </Form>
                );
              }}
            </Formik>
          ) : (
            <div />
          )
        }
      </TableCell>
      <TableCell>{work.workNumber}</TableCell>
      <TableCell>{work.workType.name}</TableCell>
      <TableCell>{work.workRequester?.username}</TableCell>
      <TableCell>{work.project.name}</TableCell>
      <TableCell>{rendeWorkOmeroProjectField(work.workNumber, work.omeroProject?.name)}</TableCell>
      <TableCell>{work.program.name}</TableCell>
      <TableCell>{work.costCode.code}</TableCell>
      <TableCell>
        {isEditEnabledForStatus(work.status) &&
          renderWorkNumValueField(work.workNumber, work.numBlocks ?? undefined, 'block')}
      </TableCell>
      <TableCell>
        {isEditEnabledForStatus(work.status) &&
          renderWorkNumValueField(work.workNumber, work.numSlides ?? undefined, 'slide')}
      </TableCell>
      <TableCell>
        {isEditEnabledForStatus(work.status) &&
          renderWorkNumValueField(work.workNumber, work.numOriginalSamples ?? undefined, 'originalSamples')}
      </TableCell>
      {!editModeEnabled && (
        <TableCell>
          <div className="uppercase">{work.status}</div>
          {comment && <div className="font-medium">{comment}</div>}
        </TableCell>
      )}
      <TableCell colSpan={showEditButton ? 1 : 2}>
        {showEditButton && (
          <PinkButton action={'tertiary'} onClick={() => send({ type: 'EDIT' })}>
            Edit Status
          </PinkButton>
        )}
        {editModeEnabled && (
          <Formik<FormValues> initialValues={initialValues} onSubmit={onFormSubmit}>
            {({ values }) => (
              <Form>
                <div className="space-y-4">
                  <CustomReactSelect
                    isDisabled={current.matches('updating')}
                    name={'type'}
                    label={'New Status'}
                    options={nextStatuses.map((nextStatus) => {
                      return { label: capitalize(nextStatus), value: nextStatus };
                    })}
                  />

                  {requiresComment(values.type) && (
                    <CustomReactSelect
                      isDisabled={current.matches('updating')}
                      name={'commentId'}
                      label={'Comment'}
                      options={selectOptionValues(availableComments, 'text', 'id')}
                    />
                  )}
                  <div className="flex flex-row items-center justify-end space-x-2">
                    <WhiteButton
                      type="button"
                      disabled={current.matches('updating')}
                      onClick={() => send({ type: 'EDIT' })}
                    >
                      Cancel
                    </WhiteButton>
                    <BlueButton type="submit" disabled={current.matches('updating')}>
                      Save
                    </BlueButton>
                  </div>
                </div>
              </Form>
            )}
          </Formik>
        )}
      </TableCell>
    </tr>
  );
}

/**
 * Determines if the type of event requires a comment
 * @param type an {@link WorkRowEvent} type
 */
function requiresComment(type: WorkRowEvent['type']): boolean {
  return ['PAUSE', 'FAIL', 'WITHDRAW'].includes(type);
}
