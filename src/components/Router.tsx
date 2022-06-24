import React, { useContext, useEffect } from "react";
import { Route, Routes, useLocation, useParams } from "react-router-dom";
import AuthenticatedRoute from "./AuthenticatedRoute";
import Login from "../pages/Login";
import Logout from "../pages/Logout";
import Location from "../pages/Location";
import Plan from "../pages/sectioning/Plan";
import Confirm from "../pages/sectioning/Confirm";
import Extraction from "../pages/Extraction";
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
import OriginalSampleRegistration from "../pages/OriginalSampleRegistration";
import BlockRegistration from "../pages/BlockRegistration";
import { OriginalSampleProcessing } from "../pages/OriginalSampleProcessing";
import BlockProcessing from "./originalSampleProcessing/blockProcessing/BlockProcessing";
import PotProcessing from "./originalSampleProcessing/potProcessing/PotProcessing";
import { AuthProvider } from "../context/AuthContext";

export function Router() {
  const stanCore = useContext(StanCoreContext);

  // Hook to remove any location state after it has been consumed for a component.
  // Turns state into "flashes"
  useEffect(() => {
    window.history.replaceState(null, "");
  }, []);

  const location = useLocation();
  const params = useParams();

  const locationComponent = () => {
    let locationSearch: Maybe<LocationSearchParams> = null;
    return (
      <DataFetcher
        dataFetcher={() => {
          if (location.search) {
            locationSearch = safeParseQueryString<LocationSearchParams>({
              query: location.search,
              guard: isLocationSearch,
            });
          }
          return stanCore
            .FindLocationByBarcode({
              barcode: params.locationBarcode ?? "",
            })
            .then((res) => res.location);
        }}
      >
        {(location) => (
          <Location
            storageLocation={location}
            locationSearchParams={locationSearch}
          />
        )}
      </DataFetcher>
    );
  };
  return (
    <Routes>
      <AuthProvider>
        <Route path="/logout">
          <Logout />
        </Route>
        <AuthenticatedRoute
          path="/lab/sectioning/confirm"
          element={
            <DataFetcher dataFetcher={stanCore.GetSectioningConfirmInfo}>
              {(sectioningInfo) => (
                <Confirm sectioningConfirmInfo={sectioningInfo} />
              )}
            </DataFetcher>
          }
        />
        <AuthenticatedRoute
          path="/lab/sectioning/sectioning"
          element={
            <DataFetcher dataFetcher={stanCore.GetSectioningInfo}>
              {(sectioningInfo) => <Plan sectioningInfo={sectioningInfo} />}
            </DataFetcher>
          }
        />
        <AuthenticatedRoute
          path="/lab/original_sample_processing"
          element={<OriginalSampleProcessing />}
        />
        <AuthenticatedRoute
          path="/lab/original_sample_processing/block"
          element={
            <DataFetcher dataFetcher={() => stanCore.GetBlockProcessingInfo()}>
              {(blockInfo) => <BlockProcessing processingInfo={blockInfo} />}
            </DataFetcher>
          }
        />
        <AuthenticatedRoute
          path="/lab/original_sample_processing/pot"
          element={
            <DataFetcher dataFetcher={() => stanCore.GetPotProcessingInfo()}>
              {(potInfo) => <PotProcessing processingInfo={potInfo} />}
            </DataFetcher>
          }
        />
        <AuthenticatedRoute path="/lab/extraction" element={<Extraction />} />
        <AuthenticatedRoute
          path="/lab/rna_analysis"
          element={
            <DataFetcher
              dataFetcher={() =>
                stanCore.GetComments({
                  commentCategory: "RNA analysis",
                  includeDisabled: false,
                })
              }
            >
              {(commentInfo) => <Analysis comments={commentInfo.comments} />}
            </DataFetcher>
          }
        />
        <AuthenticatedRoute
          path="/lab/extraction_result"
          element={
            <DataFetcher dataFetcher={stanCore.GetRecordExtractResultInfo}>
              {(info) => <ExtractionResult info={info} />}
            </DataFetcher>
          }
        />
        <AuthenticatedRoute path="/lab/aliquoting" element={<Aliquot />} />
        <AuthenticatedRoute
          path="/lab/visium_cdna"
          element={
            <SlotCopy
              title={"Visium cDNA"}
              initialOutputLabware={[plateFactory.build()]}
            />
          }
        />
        <AuthenticatedRoute
          path="/lab/visium_qc"
          element={
            <DataFetcher dataFetcher={stanCore.GetVisiumQCInfo}>
              {(visiumQCInfo) => <VisiumQC info={visiumQCInfo} />}
            </DataFetcher>
          }
        />
        <AuthenticatedRoute path="/lab/visium_perm" element={<VisiumPerm />} />
        <AuthenticatedRoute
          path="/lab/visium_analysis"
          element={<VisiumAnalysis />}
        />
        <AuthenticatedRoute
          path="/lab/dual_index_plate"
          element={<DualIndexPlate />}
        />
        <AuthenticatedRoute
          path="/lab/staining"
          element={
            <DataFetcher dataFetcher={stanCore.GetStainInfo}>
              {(stainingInfo) => <Staining stainingInfo={stainingInfo} />}
            </DataFetcher>
          }
        />
        <AuthenticatedRoute
          path="/lab/staining_qc"
          element={
            <DataFetcher dataFetcher={stanCore.GetStainingQCInfo}>
              {(stainingQcInfo) => <StainingQC info={stainingQcInfo} />}
            </DataFetcher>
          }
        />
        <AuthenticatedRoute
          path="/lab/imaging"
          element={
            <DataFetcher
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
          }
        />
        <AuthenticatedRoute
          path="/admin/registration"
          element={
            <DataFetcher dataFetcher={stanCore.GetRegistrationInfo}>
              {(registrationInfo) => (
                <BlockRegistration registrationInfo={registrationInfo} />
              )}
            </DataFetcher>
          }
        />
        <AuthenticatedRoute
          path="/admin/slide_registration"
          element={
            <DataFetcher dataFetcher={stanCore.GetRegistrationInfo}>
              {(registrationInfo) => (
                <SlideRegistration registrationInfo={registrationInfo} />
              )}
            </DataFetcher>
          }
        />
        <AuthenticatedRoute
          path="/admin/tissue_registration"
          element={
            <DataFetcher dataFetcher={stanCore.GetRegistrationInfo}>
              {(registrationInfo) => {
                return (
                  <OriginalSampleRegistration
                    registrationInfo={registrationInfo}
                  />
                );
              }}
            </DataFetcher>
          }
        />
        <AuthenticatedRoute
          path="/admin/release"
          element={
            <DataFetcher dataFetcher={stanCore.GetReleaseInfo}>
              {(releaseInfo) => <Release releaseInfo={releaseInfo} />}
            </DataFetcher>
          }
        />
        <AuthenticatedRoute path="/admin/unrelease" element={<Unrelease />} />
        <AuthenticatedRoute
          path={"/lab/fetal_waste"}
          element={
            <RecordInPlace
              title={"Fetal Waste"}
              operationType={"Convert to fetal waste"}
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
          }
        />
        <Route
          path="/locations/:locationBarcode"
          element={locationComponent()}
        />
        <Route path="/locations" element={<Store />} />
        <Route path="/store" element={<Store />} />
        <Route path="/login" element={<Login />} />
        <AuthenticatedRoute
          path="/admin/destroy"
          element={
            <DataFetcher dataFetcher={stanCore.GetDestroyInfo}>
              {(destroyInfo) => <Destroy destroyInfo={destroyInfo} />}
            </DataFetcher>
          }
        />
        <AuthenticatedRoute
          path="/config"
          role={UserRole.Admin}
          element={
            <DataFetcher dataFetcher={stanCore.GetConfiguration}>
              {(configuration) => (
                <Configuration configuration={configuration} />
              )}
            </DataFetcher>
          }
        />
        <Route
          path="/labware/:barcode"
          element={
            <DataFetcher
              dataFetcher={() => {
                return stanCore.FindPermData({
                  barcode: params.barcode ?? "",
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
          }
        />
        <Route path={"/history"} element={<History />} />
        <AuthenticatedRoute path={"/sgp"} element={<SGP />} />
        <Route
          path={"/search"}
          element={
            <DataFetcher dataFetcher={stanCore.GetSearchInfo}>
              {(searchInfo) => (
                <Search
                  searchInfo={searchInfo}
                  urlParamsString={location.search}
                />
              )}
            </DataFetcher>
          }
        />
        <Route
          path="/"
          element={
            <DataFetcher dataFetcher={stanCore.GetWorkTypes}>
              {(workTypes) => (
                <WorkProgress
                  workTypes={workTypes.workTypes.map((val) => val.name)}
                />
              )}
            </DataFetcher>
          }
        />
      </AuthProvider>
    </Routes>
  );
}
