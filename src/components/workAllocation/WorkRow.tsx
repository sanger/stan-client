import React from "react";
import { TableCell } from "../Table";
import { CommentFieldsFragment, WorkFieldsFragment } from "../../types/sdk";
import { useMachine } from "@xstate/react";
import createWorkRowMachine, { WorkRowEvent } from "./workRow.machine";
import { optionValues } from "../forms";
import WhiteButton from "../buttons/WhiteButton";
import BlueButton from "../buttons/BlueButton";
import { capitalize } from "lodash";
import FormikSelect from "../forms/Select";
import { Form, Formik } from "formik";
import PinkButton from "../buttons/PinkButton";

/**
 * The type of values for the edit form
 */
type FormValues = {
  /**
   * A union of the machine's event types
   */
  type: WorkRowEvent["type"];

  /**
   * ID of a comment about why Work status changed
   */
  commentId: number;
};

type WorkRowProps = {
  /**
   * A {@link Work} to be possibly edited
   */
  initialWork: WorkFieldsFragment;

  /**
   * The comments available for the user to select when updating Work status
   */
  availableComments: Array<CommentFieldsFragment>;
};

/**
 * Component for displaying information about Work in a table row, as well as the ability
 * to edit its status
 */
export default function WorkRow({
  initialWork,
  availableComments,
}: WorkRowProps) {
  const [current, send] = useMachine(
    createWorkRowMachine({ work: initialWork })
  );

  const { editModeEnabled, work } = current.context;

  /**
   * Should the edit button by displayed to the user right now
   */
  const showEditButton =
    !editModeEnabled && current.nextEvents.includes("EDIT");

  /**
   * List of possible events that can change the current status (excluding edit)
   */
  const nextStatuses = current.nextEvents.filter((e) => e !== "EDIT");

  /**
   * Set the initial values for the form to the first next status and first available comment
   * The comment will only be shown if the selected next status requires one
   */
  const initialValues: FormValues = {
    type: nextStatuses[0] as WorkRowEvent["type"],
    commentId: availableComments[0].id,
  };

  /**
   * Event handler for the form submission. Sends an event to the machine.
   * @param values the form values
   */
  const onFormSubmit = async (values: FormValues) => {
    send(values.type, {
      commentId: requiresComment(values.type)
        ? Number(values.commentId)
        : undefined,
    });
  };

  return (
    <tr>
      <TableCell>{work.workNumber}</TableCell>
      <TableCell>{work.workType.name}</TableCell>
      <TableCell>{work.project.name}</TableCell>
      <TableCell>{work.costCode.code}</TableCell>
      {!editModeEnabled && (
        <TableCell>
          <span className="uppercase">{work.status}</span>
        </TableCell>
      )}
      <TableCell>
        <input
          style={{ border: "none" }}
          type="text"
          min="0"
          max="200"
          step="1"
          value={work.numBlocks ?? "N/A"}
        />
      </TableCell>
      <TableCell>
        {" "}
        <input
          type="text"
          min="0"
          max="200"
          step="1"
          onInput={() => send}
          value={work.numSlides ?? "N/A"}
        />
      </TableCell>
      <TableCell colSpan={showEditButton ? 1 : 2}>
        {showEditButton && (
          <PinkButton
            action={"tertiary"}
            onClick={() => send({ type: "EDIT" })}
          >
            Edit Status
          </PinkButton>
        )}

        {editModeEnabled && (
          <Formik<FormValues>
            initialValues={initialValues}
            onSubmit={onFormSubmit}
          >
            {({ values }) => (
              <Form>
                <div className="space-y-4">
                  <FormikSelect
                    disabled={current.matches("updating")}
                    name={"type"}
                    label={"New Status"}
                  >
                    {nextStatuses.map((nextStatus) => (
                      <option key={nextStatus} value={nextStatus}>
                        {capitalize(nextStatus)}
                      </option>
                    ))}
                  </FormikSelect>

                  {requiresComment(values.type) && (
                    <FormikSelect
                      disabled={current.matches("updating")}
                      name={"commentId"}
                      label={"Comment"}
                    >
                      {optionValues(availableComments, "text", "id")}
                    </FormikSelect>
                  )}

                  <div className="flex flex-row items-center justify-end space-x-2">
                    <WhiteButton
                      type="button"
                      disabled={current.matches("updating")}
                      onClick={() => send({ type: "EDIT" })}
                    >
                      Cancel
                    </WhiteButton>
                    <BlueButton
                      type="submit"
                      disabled={current.matches("updating")}
                    >
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
function requiresComment(type: WorkRowEvent["type"]): boolean {
  return ["PAUSE", "FAIL"].includes(type);
}
