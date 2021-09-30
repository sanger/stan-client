import { GenericSearchResultsType } from "../../types/stan";
export interface GenericSearchService {
  search(findRequest: any): Promise<GenericSearchResultsType>;
}
