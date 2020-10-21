import {
  ApolloClient,
  createHttpLink,
  from,
  InMemoryCache,
} from "@apollo/client";
import { createBrowserHistory } from "history";
import { setContext } from "@apollo/client/link/context";
import Cookies from "js-cookie";
import { onError } from "@apollo/client/link/error";
import { GraphQLError } from "graphql";

export const history = createBrowserHistory();

const httpLink = createHttpLink({
  credentials: "same-origin",
  uri: "/graphql",
});

const authLink = setContext((_, { headers }) => {
  return {
    headers: {
      ...headers,
      "X-XSRF-TOKEN": Cookies.get("XSRF-TOKEN"),
    },
  };
});

const errorLink = onError(({ operation, networkError }) => {
  if (
    networkError &&
    "statusCode" in networkError &&
    networkError.statusCode === 403
  ) {
    // Ignore if the CurrentUser query returns a 403. It means we're not logged in.
    if (operation.operationName !== "CurrentUser") {
      history.replace({
        pathname: "/login",
        state: {
          warning: "Please log in to continue.",
          loggedOut: true,
          referrer: history.location.pathname,
        },
      });
    }
  }
});

const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: from([authLink, errorLink, httpLink]),
});

export default client;

/**
 * Returns a list of all extensions.problems from a list of GraphQLError objects
 * @param graphQLErrors
 */
export function getGraphQLProblems(graphQLErrors: GraphQLError[]): string[] {
  return graphQLErrors.reduce<string[]>(
    (memo, graphQLError, index, original) => {
      if (!graphQLError.extensions?.hasOwnProperty("problems")) {
        return memo;
      }
      return [...memo, ...graphQLError.extensions["problems"]];
    },
    []
  );
}
