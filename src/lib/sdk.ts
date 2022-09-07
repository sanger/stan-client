import { GraphQLClient } from 'graphql-request';
import Cookies from 'js-cookie';
import React from 'react';
import { getSdk } from '../types/sdk';
import { createBrowserHistory } from 'history';

export const graphQLClient = new GraphQLClient('/graphql');

const xsrf = Cookies.get('XSRF-TOKEN');
if (xsrf) {
  graphQLClient.setHeader('X-XSRF-TOKEN', xsrf);
}

export const stanCore = getSdk(graphQLClient);

export const StanCoreContext = React.createContext(stanCore);

export const history = createBrowserHistory();

/**
 * Forces react-router to refresh the current route, resetting any state that may have been set
 */
export const reload = () => {
  history.replace(history.location.pathname, {});
};