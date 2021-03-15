import { SlotFieldsFragment } from "../../types/graphql";

/**
 * Find a slot by its address. Throws an error if slot can not be found.
 * @param slots list of slots
 * @param address an address
 */
export function findSlotByAddress(
  slots: Array<SlotFieldsFragment>,
  address: string
): SlotFieldsFragment {
  const slot = slots.find((slot) => slot.address === address);
  if (!slot) {
    throw new Error(`No slot could be found with address: ${address}`);
  }
  return slot;
}

/**
 * Filters out empty slots
 * @param slots list of slots
 */
export function filledSlots(
  slots: Array<SlotFieldsFragment>
): Array<SlotFieldsFragment> {
  return slots.filter(isSlotFilled);
}

/**
 * Filters out filled slots
 * @param slots list of slots
 */
export function emptySlots(
  slots: Array<SlotFieldsFragment>
): Array<SlotFieldsFragment> {
  return slots.filter(isSlotEmpty);
}

/**
 * Predicate for checking if a slot is empty i.e. does it contain no samples?
 */
export function isSlotEmpty(slot: SlotFieldsFragment): boolean {
  return slot.samples.length === 0;
}

/**
 * Predicate for checking if a slot is filled i.e. does it contain any samples?
 */
export function isSlotFilled(slot: SlotFieldsFragment): boolean {
  return !isSlotEmpty(slot);
}
