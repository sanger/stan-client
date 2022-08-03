import { Maybe, SlotFieldsFragment } from '../../types/sdk';

/**
 * Find a slot by its address. Throws an error if slot can not be found.
 * @param slots list of slots to search in
 * @param address the address of the slot to find
 */
export function findSlotByAddress(slots: Array<SlotFieldsFragment>, address: string): SlotFieldsFragment {
  const slot = maybeFindSlotByAddress(slots, address);
  if (slot == null) {
    throw new Error(`Address ${address} could not be found in slots: ${slots.map((slot) => slot.address)}`);
  }
  return slot;
}

/**
 * Attempts to find a slot by its address. Returns null if slot can not be found
 * @param slots list of slots to search in
 * @param address the address of the slot to find
 */
export function maybeFindSlotByAddress(slots: Array<SlotFieldsFragment>, address: string): Maybe<SlotFieldsFragment> {
  return slots.find((slot) => slot.address === address) ?? null;
}

/**
 * Filters out empty slots
 * @param slots list of slots
 */
export function filledSlots(slots: Array<SlotFieldsFragment>): Array<SlotFieldsFragment> {
  return slots.filter(isSlotFilled);
}

/**
 * Filters out filled slots
 * @param slots list of slots
 */
export function emptySlots(slots: Array<SlotFieldsFragment>): Array<SlotFieldsFragment> {
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

/**
 * Predicate for checking if a slot has multiple samples.
 */
export function hasMultipleSamples(slot: SlotFieldsFragment): boolean {
  return slot.samples.length > 1;
}
