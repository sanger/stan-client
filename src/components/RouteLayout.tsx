import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from 'react-router-dom';
import Store from '../pages/Store';
import DataFetcher from './DataFetcher';
import { stanCore, StanCoreContext } from '../lib/sdk';
import WorkProgress from '../pages/WorkProgress';
import React, { useContext } from 'react';

const RouteLayout = () => {
  const stanCore = useContext(StanCoreContext);
  const routes = createBrowserRouter(
    createRoutesFromElements(
      <Route>
        <Route path="store" element={<Store />} />
        <Route
          path="/"
          element={
            <DataFetcher dataFetcher={stanCore.GetWorkProgressInputs}>
              {(dataFetcher) => {
                return (
                  <WorkProgress
                    workTypes={dataFetcher.workTypes.map((val) => val.name)}
                    programs={dataFetcher.programs.map((val) => val.name)}
                    requesters={dataFetcher.releaseRecipients.map((val) => val.username)}
                  />
                );
              }}
            </DataFetcher>
          }
        />
      </Route>
    )
  );
  return <RouterProvider router={routes} />;
};
export default RouteLayout;
