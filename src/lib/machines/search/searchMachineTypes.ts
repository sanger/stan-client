import { Interpreter, State, StateNode } from "xstate";
import { FindRequest, GetSearchInfoQuery, Maybe } from "../../../types/graphql";
import { SearchResultsType } from "../../../types/stan";
import { ApolloError } from "@apollo/client";

/**
 * Context for Search Machine
 */
export interface SearchContext {
  findRequest: FindRequest;
  searchInfo: GetSearchInfoQuery;
  searchResult: SearchResultsType;
  serverError: Maybe<ApolloError>;
}

/**
 * State Schema for Search Machine
 */
export interface SearchSchema {
  states: {
    unknown: {};
    ready: {};
    searching: {};
    searched: {};
  };
}

type FindEvent = { type: "FIND"; request: FindRequest };
type SearchDoneEvent = {
  type: "done.invoke.search";
  data: SearchResultsType;
};
type SearchErrorEvent = { type: "error.platform.search"; data: ApolloError };

export type SearchEvent = FindEvent | SearchDoneEvent | SearchErrorEvent;

/**
 * The type of an interpreted Search Machine
 */
export type SearchMachineService = Interpreter<
  SearchContext,
  SearchSchema,
  SearchEvent
>;

/**
 * Search Machine type
 */
export type SearchMachine = StateNode<SearchContext, SearchSchema, SearchEvent>;

/**
 * The type of an individual state (i.e. current returned from useMachine())
 */
export type SearchState = State<SearchContext, SearchEvent, SearchSchema>;
