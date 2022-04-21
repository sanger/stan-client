import React, { useContext, useEffect } from "react";
import { Route, Switch } from "react-router-dom";
import AuthenticatedRoute from "./AuthenticatedRoute";
import Login from "../pages/Login";
import Logout from "../pages/Logout";
import Location from "../pages/Location";
import Plan from "../pages/sectioning/Plan";
import Confirm from "../pages/sectioning/Confirm";
import Extraction from "../pages/Extraction";
import Registration from "../pages/Registration";
import Release from "../pages/Release";
import Store from "../pages/Store";
import Search from "../pages/Search";
import Destroy from "../pages/Destroy";
import SlideRegistration from "../pages/SlideRegistration";
import SlotCopy from "../pages/SlotCopy";
import History from "../pages/History";
import { plateFactory } from "../lib/factories/labwareFactory";
import DataFetcher from "./DataFetcher";
import { safeParseQueryString } from "../lib/helpers";
import { isLocationSearch, LocationSearchParams } from "../types/stan";
import { Maybe, UserRole } from "../types/sdk";
import Configuration from "../pages/Configuration";
import { StanCoreContext } from "../lib/sdk";
import LabwareDetails from "../pages/LabwareDetails";
import SGP from "../pages/SGP";
import Staining from "../pages/Staining";
import RecordInPlace from "../pages/RecordInPlace";
import WorkProgress from "../pages/WorkProgress";
import StainingQC from "../pages/StainingQC";
import Analysis from "../pages/Analysis";
import Unrelease from "../pages/Unrelease";
import ExtractionResult from "../pages/ExtractionResult";
import VisiumQC from "../pages/VisiumQC";
import VisiumPerm from "../pages/VisiumPerm";
import VisiumAnalysis from "../pages/VisiumAnalysis";
import Aliquot from "../pages/Aliquot";
import DualIndexPlate from "../pages/DualIndexPlate";
import columns from "./dataTable/labwareColumns";

export function Routes() {
  const stanCore = useContext(StanCoreContext);

  // Hook to remove any location state after it has been consumed for a component.
  // Turns state into "flashes"
  useEffect(() => {
    window.history.replaceState(null, "");
  }, []);

  return (
    <Switch>
      <Route path="/logout">
        <Logout />
      </Route>

      <AuthenticatedRoute
        path="/lab/sectioning/confirm"
        render={(routeProps) => (
          <DataFetcher
            key={routeProps.location.key}
            dataFetcher={stanCore.GetSectioningConfirmInfo}
          >
            {(sectioningInfo) => (
              <Confirm sectioningConfirmInfo={sectioningInfo} />
            )}
          </DataFetcher>
        )}
      />

      <AuthenticatedRoute
        path="/lab/sectioning"
        render={(routeProps) => (
          <DataFetcher
            key={routeProps.location.key}
            dataFetcher={stanCore.GetSectioningInfo}
          >
            {(sectioningInfo) => <Plan sectioningInfo={sectioningInfo} />}
          </DataFetcher>
        )}
      />
      <AuthenticatedRoute
        path="/lab/extraction"
        render={(routerProps) => <Extraction key={routerProps.location.key} />}
      />
      <AuthenticatedRoute
        path="/lab/rna_analysis"
        render={(routeProps) => (
          <DataFetcher
            key={routeProps.location.key}
            dataFetcher={() =>
              stanCore.GetComments({
                commentCategory: "RNA analysis",
                includeDisabled: false,
              })
            }
          >
            {(commentInfo) => <Analysis comments={commentInfo.comments} />}
          </DataFetcher>
        )}
      />

      <AuthenticatedRoute
        path="/lab/extraction_result"
        render={(routerProps) => (
          <DataFetcher
            key={routerProps.location.key}
            dataFetcher={stanCore.GetRecordExtractResultInfo}
          >
            {(info) => <ExtractionResult info={info} />}
          </DataFetcher>
        )}
      />
      <AuthenticatedRoute
        path="/lab/aliquoting"
        render={(routerProps) => <Aliquot key={routerProps.location.key} />}
      />
      <AuthenticatedRoute
        path="/lab/visium_cdna"
        render={(routeProps) => (
          <SlotCopy
            key={routeProps.location.key}
            title={"Visium cDNA"}
            initialOutputLabware={[plateFactory.build()]}
          />
        )}
      />
      <AuthenticatedRoute
        path="/lab/visium_qc"
        render={(routeProps) => (
          <DataFetcher
            key={routeProps.location.key}
            dataFetcher={stanCore.GetVisiumQCInfo}
          >
            {(visiumQCInfo) => <VisiumQC info={visiumQCInfo} />}
          </DataFetcher>
        )}
      />
      <AuthenticatedRoute
        path="/lab/visium_perm"
        render={(routeProps) => <VisiumPerm key={routeProps.location.key} />}
      />

      <AuthenticatedRoute
        path="/lab/visium_analysis"
        render={(routeProps) => (
          <VisiumAnalysis key={routeProps.location.key} />
        )}
      />
      <AuthenticatedRoute
        path="/lab/dual_index_plate"
        render={(routeProps) => (
          <DualIndexPlate key={routeProps.location.key} />
        )}
      />

      <AuthenticatedRoute
        path="/lab/staining"
        render={(routeProps) => (
          <DataFetcher
            key={routeProps.location.key}
            dataFetcher={stanCore.GetStainInfo}
          >
            {(stainingInfo) => <Staining stainingInfo={stainingInfo} />}
          </DataFetcher>
        )}
      />

      <AuthenticatedRoute
        path="/lab/staining_qc"
        render={(routeProps) => (
          <DataFetcher
            key={routeProps.location.key}
            dataFetcher={stanCore.GetStainingQCInfo}
          >
            {(stainingQcInfo) => <StainingQC info={stainingQcInfo} />}
          </DataFetcher>
        )}
      />

      <AuthenticatedRoute
        path="/lab/imaging"
        render={(routeProps) => (
          <DataFetcher
            key={routeProps.location.key}
            dataFetcher={() =>
              stanCore.GetRecordInPlaceInfo({ category: "scanner" })
            }
          >
            {(recordInPlaceInfo) => (
              <RecordInPlace
                title={"Imaging"}
                operationType={"image"}
                equipment={recordInPlaceInfo.equipments}
                columns={[
                  columns.barcode(),
                  columns.donorId(),
                  columns.labwareType(),
                  columns.externalName(),
                  columns.bioState(),
                ]}
              />
            )}
          </DataFetcher>
        )}
      />

      <AuthenticatedRoute
        path="/admin/registration"
        render={(routeProps) => (
          <DataFetcher
            key={routeProps.location.key}
            dataFetcher={stanCore.GetRegistrationInfo}
          >
            {(registrationInfo) => (
              <Registration registrationInfo={registrationInfo} />
            )}
          </DataFetcher>
        )}
      />

      <AuthenticatedRoute
        path="/admin/slide_registration"
        render={(routeProps) => (
          <DataFetcher
            key={routeProps.location.key}
            dataFetcher={stanCore.GetRegistrationInfo}
          >
            {(registrationInfo) => (
              <SlideRegistration
                registrationInfo={registrationInfo}
                {...routeProps}
              />
            )}
          </DataFetcher>
        )}
      />

      <AuthenticatedRoute
        path="/admin/release"
        render={(routeProps) => (
          <DataFetcher
            key={routeProps.location.key}
            dataFetcher={stanCore.GetReleaseInfo}
          >
            {(releaseInfo) => <Release releaseInfo={releaseInfo} />}
          </DataFetcher>
        )}
      />

      <AuthenticatedRoute
        path="/admin/unrelease"
        render={(routeProps) => <Unrelease key={routeProps.location.key} />}
      />
      <AuthenticatedRoute
        path={"/lab/fetal_waste"}
        render={(routeProps) => (
          <RecordInPlace
            title={"Fetal Waste"}
            operationType={"Convert to fetal waste"}
            key={routeProps.location.key}
            columns={[
              columns.barcode(),
              columns.labwareType(),
              columns.tissueType(),
              columns.spatialLocation(),
              columns.replicate(),
            ]}
            description={
              " to change bio state of all scanned labware to 'Fetal Waste'"
            }
          />
        )}
      />

      <Route
        path="/locations/:locationBarcode"
        render={(routeProps) => {
          let locationSearch: Maybe<LocationSearchParams> = null;

          return (
            <DataFetcher
              key={routeProps.location.key}
              dataFetcher={() => {
                if (routeProps.location.search) {
                  locationSearch = safeParseQueryString<LocationSearchParams>({
                    query: routeProps.location.search,
                    guard: isLocationSearch,
                  });
                }

                return stanCore
                  .FindLocationByBarcode({
                    barcode: routeProps.match.params.locationBarcode,
                  })
                  .then((res) => res.location);
              }}
            >
              {(location) => (
                <Location
                  storageLocation={location}
                  locationSearchParams={locationSearch}
                  {...routeProps}
                />
              )}
            </DataFetcher>
          );
        }}
      />

      <Route path="/locations" component={Store} />
      <Route path="/store" component={Store} />
      <Route path="/login" component={Login} />
      <AuthenticatedRoute
        path="/admin/destroy"
        render={(routeProps) => (
          <DataFetcher
            key={routeProps.location.key}
            dataFetcher={stanCore.GetDestroyInfo}
          >
            {(destroyInfo) => <Destroy destroyInfo={destroyInfo} />}
          </DataFetcher>
        )}
      />

      <AuthenticatedRoute
        path="/config"
        role={UserRole.Admin}
        render={() => (
          <DataFetcher dataFetcher={stanCore.GetConfiguration}>
            {(configuration) => <Configuration configuration={configuration} />}
          </DataFetcher>
        )}
      />

      <Route
        path="/labware/:barcode"
        render={(routeProps) => {
          return (
            <DataFetcher
              key={routeProps.location.key}
              dataFetcher={() => {
                return stanCore.FindPermData({
                  barcode: routeProps.match.params.barcode,
                });
              }}
            >
              {(dataFetcher) => {
                return (
                  <LabwareDetails
                    labware={dataFetcher.visiumPermData.labware}
                    permData={dataFetcher.visiumPermData.addressPermData}
                  />
                );
              }}
            </DataFetcher>
          );
        }}
      />

      <Route path={"/history"} component={History} />
      <AuthenticatedRoute path={"/sgp"} component={SGP} />

      <Route
        path={"/search"}
        render={(routeProps) => {
          return (
            <DataFetcher
              dataFetcher={stanCore.GetSearchInfo}
              key={routeProps.location.key}
            >
              {(searchInfo) => (
                <Search
                  searchInfo={searchInfo}
                  urlParamsString={routeProps.location.search}
                />
              )}
            </DataFetcher>
          );
        }}
      />

      <Route
        path="/"
        render={(routeProps) => {
          return (
            <DataFetcher
              dataFetcher={stanCore.GetWorkTypes}
              key={routeProps.location.key}
            >
              {(workTypes) => (
                <WorkProgress
                  workTypes={workTypes.workTypes.map((val) => val.name)}
                />
              )}
            </DataFetcher>
          );
        }}
      />
    </Switch>
  );
}
