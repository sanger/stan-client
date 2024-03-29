import { GraphQLClient } from 'graphql-request';
import Cookies from 'js-cookie';
import React from 'react';
import { getSdk } from '../types/sdk';
import { NavigateFunction } from 'react-router-dom';

const endpoint = process.env.NODE_ENV === 'test' ? 'http://localhost:3000/graphql' : '/graphql';
export const graphQLClient = new GraphQLClient(endpoint);

const xsrf = Cookies.get('XSRF-TOKEN');
if (xsrf) {
  graphQLClient.setHeader('X-XSRF-TOKEN', xsrf);
}

export const stanCore = getSdk(graphQLClient);

export const StanCoreContext = React.createContext(stanCore);

//export const history = createBrowserHistory();

/**
 * Forces react-router to refresh the current route, resetting any state that may have been set
 */
export const reload = (navigate: NavigateFunction) => {
  navigate(0);
};
