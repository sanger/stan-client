import { Maybe } from '../../types/sdk';

type Repository<T> = {
  save: (entity: T) => T;
  findAll: () => T[];
  find: (key: keyof T, value: string | number) => Maybe<T>;
  saveAll: (entities: Array<T>) => void;
};

export function createSessionStorageRepository<T>(storageKey: string, primaryKey: keyof T, seeds: T[]): Repository<T> {
  sessionStorage.setItem(storageKey, JSON.stringify(seeds));

  function all() {
    const allJSON = sessionStorage.getItem(storageKey);
    let entities: Array<T> = [];
    if (allJSON) {
      entities = JSON.parse(allJSON) as Array<T>;
    }
    return entities;
  }

  function findAll(): Array<T> {
    return all();
  }

  function find(key: keyof T, value: any): Maybe<T> {
    return all().find((entity) => entity[key] === value) ?? null;
  }

  function save(entity: T) {
    const newEntities = all().filter((e) => e[primaryKey] !== entity[primaryKey]);
    newEntities.push(entity);
    sessionStorage.setItem(storageKey, JSON.stringify(newEntities));
    return entity;
  }

  function saveAll(entities: Array<T>) {
    const keys = entities.map((entity) => entity[primaryKey]);
    const merged = [
      all().filter((entity) => {
        return !keys.includes(entity[primaryKey]);
      }),
      ...entities
    ];
    sessionStorage.setItem(storageKey, JSON.stringify(merged));
  }

  return {
    find,
    findAll,
    save,
    saveAll
  };
}
