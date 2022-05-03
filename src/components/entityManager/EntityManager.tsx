import React, { useCallback, useEffect, useRef, useState } from "react";
import Table, { TableBody, TableCell, TableHead, TableHeader } from "../Table";
import { Input } from "../forms/Input";
import BlueButton from "../buttons/BlueButton";
import { useMachine } from "@xstate/react";
import Success from "../notifications/Success";
import Warning from "../notifications/Warning";
import { capitalize } from "lodash";
import WhiteButton from "../buttons/WhiteButton";
import PinkButton from "../buttons/PinkButton";
import LoadingSpinner from "../icons/LoadingSpinner";
import { SelectEntityRow } from "./SelectEntityRow";
import { BooleanEntityRow } from "./BooleanEntityRow";
import { createEntityManagerMachine } from "./entityManager.machine";

export type EntityValueType = boolean | string | number;

/**Component type to display in value field**/
type ValueFieldComponentInfo = {
  type: "CHECKBOX" | "SELECT";
  valueOptions?: string[];
};

type EntityManagerProps<E> = {
  /**
   * The initial entities to display in the table
   */
  initialEntities: Array<E>;

  /**
   * Which property of the entity should be used to display its value as key
   */
  displayKeyColumnName: keyof E;

  /**
   * This can be used to display a name (on table column and add button) different from displayColumnName (which is a field name in graphql schema).
   * One use case is to accommodate changes in field names in future (like HMDMC to HuMFre)
   * because schema fields cannot be changed as it can bring major impact on db
   */
  alternateKeyColumnName?: string;

  /**
   * Which property of the entity should be used to display as value
   */
  valueColumnName: keyof E;

  /***
   * How to display in Value field
   */
  valueFieldComponentInfo: ValueFieldComponentInfo;

  /**
   * Callback when a new entity is to be created
   * @param value the value of the new entity
   */
  onCreate(value: string): Promise<E>;

  /**
   * Callback when value changes
   */
  onChangeValue(entity: E, value: EntityValueType): Promise<E>;
};

export default function EntityManager<
  E extends Record<string, EntityValueType>
>({
  initialEntities,
  displayKeyColumnName,
  alternateKeyColumnName,
  valueColumnName,
  valueFieldComponentInfo,
  onCreate,
  onChangeValue,
}: EntityManagerProps<E>) {
  const [current, send] = useMachine(
    createEntityManagerMachine<E>(
      initialEntities,
      displayKeyColumnName,
      valueColumnName
    ).withConfig({
      services: {
        createEntity: (ctx, e) => {
          if (e.type !== "CREATE_NEW_ENTITY") return Promise.reject();
          return onCreate(e.value);
        },
        valueChanged: (context, e) => {
          if (e.type !== "VALUE_CHANGE") return Promise.reject();
          return onChangeValue(e.entity, e.value);
        },
      },
    })
  );

  /**
   * The value of the input used for creating new entities
   */
  const [draftValue, setDraftValue] = useState("");

  /**
   * The ref to the input element used for creating new entities.
   * Will receive focus when it appears on screen.
   */
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (current.matches("draftCreation")) {
      inputRef.current?.select();
    }
  }, [current]);

  /**
   * Callback handler for clicking the "Save" button
   */
  const handleOnSave = useCallback(() => {
    const value = draftValue.trim();
    if (value === "") {
      return;
    }
    send({ type: "CREATE_NEW_ENTITY", value });
    setDraftValue("");
  }, [draftValue, setDraftValue, send]);

  /**
   * Callback handler for when an EntityRow changes (i.e. enabled property is toggled)
   */
  const handleOnRowChange = useCallback(
    (entity: E, value: EntityValueType) => {
      send({ type: "VALUE_CHANGE", entity, value });
    },
    [send]
  );

  /**
   * Callback handler for the draft input
   */
  const handleOnInputChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setDraftValue(e.target.value);

  /**
   * Callback handler for when the draft is discarded
   */
  const handleOnCancel = () => send({ type: "DISCARD_DRAFT" });

  const { entities, successMessage, error } = current.context;

  const isLoading = current.matches("loading");
  const isDrafting = current.matches("draftCreation");
  const isCreatingEntity = current.matches({ loading: "creatingEntity" });
  const showDraft = isDrafting || isCreatingEntity;

  const getValueFieldComponent = (
    valueFieldComponentInfo: ValueFieldComponentInfo,
    entity: E,
    keyColumn: string,
    valueColumn: string
  ) => {
    switch (valueFieldComponentInfo.type) {
      case "SELECT": {
        return (
          <SelectEntityRow
            key={keyColumn}
            value={String(entity[valueColumn])}
            valueFieldOptions={valueFieldComponentInfo.valueOptions ?? []}
            onChange={(val) => handleOnRowChange(entity, val)}
          />
        );
      }
      case "CHECKBOX": {
        return (
          <BooleanEntityRow
            disable={isLoading || isDrafting}
            value={Boolean(entity[valueColumn])}
            onChange={(enabled) => handleOnRowChange(entity, enabled)}
          />
        );
      }
      default:
        return <></>;
    }
  };

  return (
    <div className="space-y-4">
      {successMessage && <Success message={successMessage} />}
      {error && <Warning message={"Save Failed"} error={error} />}
      <Table>
        <TableHead>
          <tr>
            <TableHeader>{displayKeyColumnName}</TableHeader>
            <TableHeader>{valueColumnName}</TableHeader>
          </tr>
        </TableHead>
        <TableBody>
          {entities.map((entity) => (
            <tr>
              <TableCell>{entity[displayKeyColumnName]}</TableCell>
              {getValueFieldComponent(
                valueFieldComponentInfo,
                entity,
                String(displayKeyColumnName),
                String(valueColumnName)
              )}
            </tr>
          ))}
          {showDraft && (
            <tr>
              <TableCell colSpan={2}>
                <Input
                  ref={inputRef}
                  type="text"
                  disabled={isCreatingEntity}
                  onChange={handleOnInputChange}
                  onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                    if (e.key === "Enter") {
                      handleOnSave();
                    } else if (e.key === "Escape") {
                      handleOnCancel();
                    }
                  }}
                />
              </TableCell>
            </tr>
          )}
        </TableBody>
      </Table>
      <div className="flex flex-row justify-end items-center space-x-3">
        {isLoading && <LoadingSpinner />}

        {!showDraft && (
          <BlueButton
            disabled={isLoading}
            onClick={() => send({ type: "DRAFT_NEW_ENTITY" })}
          >
            + Add{" "}
            {capitalize(
              alternateKeyColumnName
                ? alternateKeyColumnName.toString()
                : displayKeyColumnName.toString()
            )}
          </BlueButton>
        )}

        {showDraft && (
          <>
            <PinkButton disabled={isCreatingEntity} onClick={handleOnCancel}>
              Cancel
            </PinkButton>
            <WhiteButton disabled={isCreatingEntity} onClick={handleOnSave}>
              Save
            </WhiteButton>
          </>
        )}
      </div>
    </div>
  );
}
