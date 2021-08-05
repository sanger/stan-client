import React from "react";
import { TableCell } from "../Table";
import {
  CommentFieldsFragment,
  SasNumberFieldsFragment,
} from "../../types/sdk";
import { useMachine } from "@xstate/react";
import createSasRowMachine, { SasRowEvent } from "./sasRow.machine";
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
  type: SasRowEvent["type"];

  /**
   * ID of a comment about why a SAS number was changed
   */
  commentId: number;
};

type SasRowProps = {
  /**
   * An SAS number
   */
  initialSasNumber: SasNumberFieldsFragment;

  /**
   * The comments available for the user to select when updating an SAS number's status
   */
  availableComments: Array<CommentFieldsFragment>;
};

/**
 * Component for displaying information about an SAS number in a table row, as well as the ability
 * to edit its status
 */
export default function SasRow({
  initialSasNumber,
  availableComments,
}: SasRowProps) {
  const [current, send] = useMachine(
    createSasRowMachine({ sasNumber: initialSasNumber })
  );

  const { editModeEnabled, sasNumber } = current.context;

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
    type: nextStatuses[0] as SasRowEvent["type"],
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
      <TableCell>{sasNumber.sasNumber}</TableCell>
      <TableCell>{sasNumber.project.name}</TableCell>
      <TableCell>{sasNumber.costCode.code}</TableCell>
      {!editModeEnabled && (
        <TableCell>
          <span className="uppercase">{sasNumber.status}</span>
        </TableCell>
      )}

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
 * @param type an {@link SasRowEvent} type
 */
function requiresComment(type: SasRowEvent["type"]): boolean {
  return ["PAUSE", "FAIL"].includes(type);
}
