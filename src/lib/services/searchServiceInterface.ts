import { SearchResultsType } from "../../types/stan";
export interface SearchServiceInterface<E, T> {
  search(findRequest: E): Promise<SearchResultsType<T>>;
}
