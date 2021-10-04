import { Key } from "react";
import { useImmer } from "use-immer";
import { castDraft } from "immer";
import { Maybe } from "../../types/sdk";

interface Collection<T> {
  /**
   * The current list of items
   */
  items: T[];

  /**
   * Append an item to the collection
   * @param item an item
   */
  append: (item: T) => void;

  /**
   * Remove an item from the collection
   * @param key the item to remove's key
   */
  remove: (key: Key) => void;

  /**
   * Update an item in the collection
   * @param item the item to update
   */
  update: (item: T) => void;

  /**
   * Get an item by its key
   * @param key the key of the item to get
   * @return the found item; null if not found
   */
  getItem: (key: Key) => Maybe<T>;
}

type UseCollectionParams<T> = {
  /**
   * A function to retrieve the unique key for an item
   * @param item the item to get the key for
   */
  getKey: (item: T) => Key;

  /**
   * The initial items in the collection
   */
  initialItems?: T[];
};

export function useCollection<T>({
  initialItems = [],
  getKey,
}: UseCollectionParams<T>): Collection<T> {
  const [items, updateItems] = useImmer(() => {
    // Convert the list of items into a map for internal use
    const items = new Map<Key, T>();
    for (let item of initialItems) {
      items.set(getKey(item), item);
    }
    return items;
  });

  return {
    items: Array.from(items.values()),

    append: (item) => {
      updateItems((draft) => {
        draft.set(getKey(item), castDraft(item));
      });
    },

    remove: (key) => {
      updateItems((draft) => {
        draft.delete(key);
      });
    },

    update: (item) => {
      updateItems((draft) => {
        draft.set(getKey(item), castDraft(item));
      });
    },

    getItem: (key) => items.get(key) ?? null,
  };
}
