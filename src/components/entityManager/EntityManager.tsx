import React, { useCallback, useEffect, useRef, useState } from "react";
import Table, { TableBody, TableCell, TableHead, TableHeader } from "../Table";
import { Input } from "../forms/Input";
import BlueButton from "../buttons/BlueButton";
import { DisableableEntity } from "../../types/stan";
import { useMachine } from "@xstate/react";
import { createEntityManagerMachine } from "./entityManager.machine";
import Success from "../notifications/Success";
import Warning from "../notifications/Warning";
import { capitalize } from "lodash";
import WhiteButton from "../buttons/WhiteButton";
import PinkButton from "../buttons/PinkButton";
import LoadingSpinner from "../icons/LoadingSpinner";

type EntityManagerProps<E> = {
  /**
   * The initial entities to display in the table
   */
  initialEntities: Array<E>;

  /**
   * Which property of the entity should be used to display its value
   */
  displayColumnName: keyof E;

  /**
   * Callback for when an entity has its <code>enabled</code> property toggled
   * @param entity the toggle entity
   * @param enabled true if the entity is being enabled, false if its being disabled
   */
  onToggle(entity: E, enabled: boolean): Promise<E>;

  /**
   * Callback when a new entity is to be created
   * @param value the value of the new entity
   */
  onCreate(value: string): Promise<E>;
};

export default function EntityManager<E extends DisableableEntity>({
  initialEntities,
  displayColumnName,
  onToggle,
  onCreate,
}: EntityManagerProps<E>) {
  const [current, send] = useMachine(
    createEntityManagerMachine<E>(
      initialEntities,
      displayColumnName
    ).withConfig({
      services: {
        toggleEnabled: (context, e) => {
          if (e.type !== "TOGGLE_ENABLED") return Promise.reject();
          return onToggle(e.entity, e.enabled);
        },

        createEntity: (ctx, e) => {
          if (e.type !== "CREATE_NEW_ENTITY") return Promise.reject();
          return onCreate(e.value);
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
    (entity: E, enabled: boolean) => {
      send({ type: "TOGGLE_ENABLED", entity, enabled });
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

  return (
    <div className="space-y-4">
      {successMessage && <Success message={successMessage} />}
      {error && <Warning message={"Save Failed"} error={error} />}
      <Table>
        <TableHead>
          <tr>
            <TableHeader>{displayColumnName}</TableHeader>
            <TableHeader>Enabled</TableHeader>
          </tr>
        </TableHead>
        <TableBody>
          {entities.map((entity) => (
            <EntityRow<E>
              key={String(entity[displayColumnName])}
              entity={entity}
              displayColumnName={displayColumnName}
              disable={isLoading || isDrafting}
              onChange={handleOnRowChange}
            />
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
            + Add {capitalize(displayColumnName.toString())}
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

type EntityRowParams<E extends DisableableEntity> = {
  /**
   * The entity to display in this row
   */
  entity: E;

  /**
   * The parameter of the entity to display the value of
   */
  displayColumnName: keyof E;

  /**
   * Should this row be disabled right now
   */
  disable: boolean;

  /**
   * Callback handler for when the checkbox changes value
   * @param entity the row entity
   * @param enabled true if the checkbox is checked, false otherwise
   */
  onChange: (entity: E, enabled: boolean) => void;
};

function EntityRow<E extends DisableableEntity>({
  entity,
  displayColumnName,
  disable,
  onChange,
}: EntityRowParams<E>) {
  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(entity, e.target.checked);
  };

  return (
    <tr className={`${disable && "opacity-50"}`}>
      <TableCell>{entity[displayColumnName]}</TableCell>
      <TableCell>
        <Input
          type="checkbox"
          disabled={disable}
          defaultChecked={entity.enabled}
          onChange={handleOnChange}
        />
      </TableCell>
    </tr>
  );
}
