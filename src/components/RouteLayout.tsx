import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from 'react-router-dom';
import Store from '../pages/Store';
import DataFetcher from './DataFetcher';
import { StanCoreContext } from '../lib/sdk';
import WorkProgress from '../pages/WorkProgress';
import React, { useContext } from 'react';
import Logout from '../pages/Logout';
import History from '../pages/History';
import Location from '../pages/Location';
import Login from '../pages/Login';
import Search from '../pages/Search';
import WorkProgressSummary from '../pages/WorkProgressSummary';
import FileManager from '../pages/FileManager';
import AuthLayout from './AuthLayout';
import { UserRole } from '../types/sdk';
import SGP from '../pages/SGP';
import Confirm from '../pages/sectioning/Confirm';
import Plan from '../pages/sectioning/Plan';
import { OriginalSampleProcessing } from '../pages/OriginalSampleProcessing';
import BlockProcessing from './originalSampleProcessing/blockProcessing/BlockProcessing';
import PotProcessing from './originalSampleProcessing/potProcessing/PotProcessing';
import SampleProcessingComments from '../pages/SampleProcessingComments';
import SolutionTransfer from '../pages/SolutionTransfer';
import ParaffinProcessing from '../pages/ParaffinProcessing';
import AddExternalID from '../pages/AddExternalID';
import Extraction from '../pages/Extraction';
import Analysis from '../pages/Analysis';
import ExtractionResult from '../pages/ExtractionResult';
import Aliquot from '../pages/Aliquot';
import SlotCopy from '../pages/SlotCopy';
import { plateFactory } from '../lib/factories/labwareFactory';
import VisiumQC from '../pages/VisiumQC';
import VisiumPerm from '../pages/VisiumPerm';
import VisiumAnalysis from '../pages/VisiumAnalysis';
import DualIndexPlate from '../pages/DualIndexPlate';
import ProbeHybridisationXenium from '../pages/ProbeHybridisationXenium';
import XeniumAnalyser from '../pages/XeniumAnalyser';
import CytAssist from '../pages/CytAssist';
import Staining from '../pages/Staining';
import StainingQC from '../pages/StainingQC';
import RecordInPlace from '../pages/RecordInPlace';
import columns from './dataTableColumns/labwareColumns';
import BlockRegistration from '../pages/BlockRegistration';
import SectionRegistration from '../pages/SectionRegistration';
import OriginalSampleRegistration from '../pages/OriginalSampleRegistration';
import Release from '../pages/Release';
import Unrelease from '../pages/Unrelease';
import Destroy from '../pages/Destroy';
import Configuration from '../pages/Configuration';
import LabwareDetails from '../pages/LabwareDetails';
import { useAuth } from '../context/AuthContext';
import ErrorBoundary from './notifications/ErrorBoundary';
import ProbeHybridisationQC from '../pages/ProbeHybridisationQC';
import XeniumQC from '../pages/XeniumQC';
import ReleaseOptions from './release/ReleaseOptions';
import { Reactivate } from '../pages/Reactivate';

const RouteLayout = () => {
  const stanCore = useContext(StanCoreContext);
  const { authState } = useAuth();

  const routes = createBrowserRouter(
    createRoutesFromElements(
      <Route errorElement={<ErrorBoundary />}>
        <Route path="/logout" element={<Logout />} />
        <Route path="/history" element={<History />} />
        <Route path="/locations" element={<Store />} />
        <Route path="/store" element={<Store />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          loader={async () => {
            const workProgress = await stanCore.GetWorkProgressInputs();
            return workProgress;
          }}
          element={<WorkProgress />}
        />
        <Route
          path={'/search'}
          element={
            <DataFetcher dataFetcher={stanCore.GetSearchInfo}>
              {(searchInfo) => <Search searchInfo={searchInfo} />}
            </DataFetcher>
          }
        />
        <Route
          path={'/work_progress_summary'}
          element={
            <DataFetcher dataFetcher={stanCore.GetWorkSummary}>
              {(summaryData) => <WorkProgressSummary summaryData={summaryData} />}
            </DataFetcher>
          }
        />
        <Route
          path="/file_viewer"
          loader={async () => {
            const workInfo = await stanCore.GetAllWorkInfo();
            return workInfo.works;
          }}
          element={<FileManager showUpload={false} />}
        />
        <Route element={<AuthLayout role={UserRole.Enduser} />}>
          <Route path="sgp" element={<SGP />} />
        </Route>
        <Route element={<AuthLayout />}>
          <Route
            path="/lab/sectioning/confirm"
            element={<Confirm />}
            loader={async () => {
              return await stanCore.GetSectioningConfirmInfo();
            }}
          />
        </Route>
        <Route element={<AuthLayout />}>
          <Route
            path="/lab/sectioning"
            element={
              <DataFetcher dataFetcher={stanCore.GetSectioningInfo}>
                {(sectioningInfo) => <Plan sectioningInfo={sectioningInfo} />}
              </DataFetcher>
            }
          />
        </Route>
        <Route element={<AuthLayout />}>
          <Route path="/lab/original_sample_processing" element={<OriginalSampleProcessing />} />
        </Route>
        <Route element={<AuthLayout />}>
          <Route
            path="/lab/original_sample_processing/block"
            element={
              <DataFetcher dataFetcher={() => stanCore.GetBlockProcessingInfo()}>
                {(blockInfo) => <BlockProcessing processingInfo={blockInfo} />}
              </DataFetcher>
            }
          />
        </Route>
        <Route element={<AuthLayout />}>
          <Route
            path="/lab/original_sample_processing/pot"
            element={
              <DataFetcher dataFetcher={() => stanCore.GetPotProcessingInfo()}>
                {(blockInfo) => <PotProcessing processingInfo={blockInfo} />}
              </DataFetcher>
            }
          />
        </Route>
        <Route element={<AuthLayout />}>
          <Route
            path="/lab/sample_processing_comments"
            element={
              <DataFetcher dataFetcher={() => stanCore.GetSampleProcessingCommentsInfo()}>
                {(samnpleCommentsInfo) => <SampleProcessingComments sampleCommentsInfo={samnpleCommentsInfo} />}
              </DataFetcher>
            }
          />
        </Route>
        <Route element={<AuthLayout />}>
          <Route
            path="/lab/solution_transfer"
            element={
              <DataFetcher dataFetcher={() => stanCore.GetSolutionTransferInfo()}>
                {(solnTransferInfo) => <SolutionTransfer solutionTransferInfo={solnTransferInfo} />}
              </DataFetcher>
            }
          />
        </Route>
        <Route element={<AuthLayout />}>
          <Route
            path="/lab/paraffin_processing"
            element={
              <DataFetcher dataFetcher={() => stanCore.GetParaffinProcessingInfo()}>
                {(paraffinProcessingInfo) => <ParaffinProcessing paraffinProcessingInfo={paraffinProcessingInfo} />}
              </DataFetcher>
            }
          />
        </Route>
        <Route element={<AuthLayout />}>
          <Route path="/lab/add_external_id" element={<AddExternalID />} />
        </Route>
        <Route element={<AuthLayout />}>
          <Route
            path="/lab/extraction"
            loader={async ({ params }) => {
              const res = await stanCore.GetEquipments({
                category: 'extract'
              });
              return res.equipments;
            }}
            element={<Extraction />}
          />
        </Route>
        <Route element={<AuthLayout />}>
          <Route
            path="/lab/rna_analysis"
            loader={async ({ params }) => {
              const comments = await stanCore.GetComments({
                commentCategory: 'RNA analysis',
                includeDisabled: false
              });
              const equipments = await stanCore.GetEquipments({
                category: 'RNA analysis'
              });

              return {
                comments: comments.comments,
                equipments: equipments.equipments
              };
            }}
            element={<Analysis />}
          />
        </Route>
        <Route element={<AuthLayout />}>
          <Route
            path="/lab/extraction_result"
            element={
              <DataFetcher dataFetcher={stanCore.GetRecordExtractResultInfo}>
                {(info) => <ExtractionResult info={info} />}
              </DataFetcher>
            }
          />
        </Route>
        <Route element={<AuthLayout />}>
          <Route path="/lab/aliquoting" element={<Aliquot />} />
        </Route>
        <Route element={<AuthLayout />}>
          <Route
            path="/lab/transfer"
            element={<SlotCopy title={'Transfer'} initialOutputLabware={[plateFactory.build()]} />}
          />
        </Route>
        <Route element={<AuthLayout />}>
          <Route
            path="/lab/visium_qc"
            element={
              <DataFetcher dataFetcher={() => stanCore.GetComments({ includeDisabled: false })}>
                {(visiumQCInfo) => <VisiumQC info={visiumQCInfo} />}
              </DataFetcher>
            }
          />
        </Route>
        <Route element={<AuthLayout />}>
          <Route path="/lab/visium_perm" element={<VisiumPerm />} />
        </Route>
        <Route element={<AuthLayout />}>
          <Route path="/lab/visium_analysis" element={<VisiumAnalysis />} />
        </Route>
        <Route element={<AuthLayout />}>
          <Route path="/lab/dual_index_plate" element={<DualIndexPlate />} />
        </Route>
        <Route element={<AuthLayout />}>
          <Route
            path="/lab/probe_hybridisation_xenium"
            element={
              <DataFetcher dataFetcher={stanCore.GetProbePanels}>
                {(probePanelInfo) => <ProbeHybridisationXenium probePanelInfo={probePanelInfo} />}
              </DataFetcher>
            }
          />
        </Route>
        <Route element={<AuthLayout />}>
          <Route
            path="/lab/probe_hybridisation_qc"
            element={
              <DataFetcher
                dataFetcher={() =>
                  stanCore.GetComments({
                    commentCategory: 'Probe QC',
                    includeDisabled: false
                  })
                }
              >
                {(response) => <ProbeHybridisationQC comments={response.comments} />}
              </DataFetcher>
            }
          />
        </Route>
        <Route element={<AuthLayout />}>
          <Route
            path="/lab/xenium_qc"
            loader={async () => {
              const res = await stanCore.GetXeniumQCInfo();
              return res.comments;
            }}
            element={<XeniumQC />}
          />
        </Route>
        <Route element={<AuthLayout />}>
          <Route
            path="/lab/xenium_analyser"
            loader={async () => {
              const res = await stanCore.GetEquipments({
                category: 'xenium analyser'
              });
              return res.equipments;
            }}
            element={<XeniumAnalyser />}
          />
        </Route>
        <Route element={<AuthLayout />}>
          <Route path="/lab/cytassist" element={<CytAssist />} />
        </Route>
        <Route element={<AuthLayout />}>
          <Route
            path="/lab/staining"
            element={
              <DataFetcher dataFetcher={stanCore.GetStainInfo}>
                {(stainingInfo) => <Staining stainingInfo={stainingInfo} />}
              </DataFetcher>
            }
          />
        </Route>
        <Route element={<AuthLayout />}>
          <Route
            path="/lab/staining_qc"
            element={
              <DataFetcher dataFetcher={stanCore.GetStainingQCInfo}>
                {(stainingQcInfo) => <StainingQC info={stainingQcInfo} />}
              </DataFetcher>
            }
          />
        </Route>
        <Route element={<AuthLayout />}>
          <Route
            path="/lab/imaging"
            element={
              <DataFetcher dataFetcher={() => stanCore.GetRecordInPlaceInfo({ category: 'scanner' })}>
                {(recordInPlaceInfo) => (
                  <RecordInPlace
                    title={'Imaging'}
                    operationType={'image'}
                    equipment={recordInPlaceInfo.equipments}
                    columns={[
                      columns.barcode(),
                      columns.donorId(),
                      columns.labwareType(),
                      columns.externalName(),
                      columns.bioState()
                    ]}
                  />
                )}
              </DataFetcher>
            }
          />
        </Route>
        <Route element={<AuthLayout />}>
          <Route
            path="/admin/registration"
            element={
              <DataFetcher dataFetcher={stanCore.GetRegistrationInfo}>
                {(registrationInfo) => <BlockRegistration registrationInfo={registrationInfo} />}
              </DataFetcher>
            }
          />
        </Route>
        <Route element={<AuthLayout />}>
          <Route
            path="/admin/section_registration"
            element={
              <DataFetcher dataFetcher={stanCore.GetRegistrationInfo}>
                {(registrationInfo) => <SectionRegistration registrationInfo={registrationInfo} />}
              </DataFetcher>
            }
          />
        </Route>
        <Route element={<AuthLayout />}>
          <Route
            path="/admin/tissue_registration"
            element={
              <DataFetcher dataFetcher={stanCore.GetRegistrationInfo}>
                {(registrationInfo) => {
                  return <OriginalSampleRegistration registrationInfo={registrationInfo} />;
                }}
              </DataFetcher>
            }
          />
        </Route>
        <Route element={<AuthLayout />}>
          <Route
            path="/admin/reactivate"
            element={<Reactivate />}
            loader={async () => {
              const res = await stanCore.GetComments({
                commentCategory: 'Work status',
                includeDisabled: false
              });
              return res.comments;
            }}
          />
        </Route>

        <Route element={<AuthLayout />}>
          <Route
            path="/admin/release"
            element={
              <DataFetcher dataFetcher={stanCore.GetReleaseInfo}>
                {(releaseInfo) => <Release releaseInfo={releaseInfo} />}
              </DataFetcher>
            }
          />
        </Route>
        <Route element={<AuthLayout />}>
          <Route path="/admin/unrelease" element={<Unrelease />} />
        </Route>
        <Route element={<AuthLayout />}>
          <Route
            path="/lab/fetal_waste"
            element={
              <RecordInPlace
                title={'Fetal Waste'}
                operationType={'Convert to fetal waste'}
                columns={[
                  columns.barcode(),
                  columns.labwareType(),
                  columns.tissueType(),
                  columns.spatialLocation(),
                  columns.replicate()
                ]}
                description={" to change bio state of all scanned labware to 'Fetal Waste'"}
              />
            }
          />
        </Route>
        <Route element={<AuthLayout />}>
          <Route
            path="/admin/destroy"
            element={
              <DataFetcher dataFetcher={stanCore.GetDestroyInfo}>
                {(destroyInfo) => <Destroy destroyInfo={destroyInfo} />}
              </DataFetcher>
            }
          />
        </Route>
        <Route element={<AuthLayout role={UserRole.Admin} />}>
          <Route
            path="/config"
            element={
              <DataFetcher dataFetcher={stanCore.GetConfiguration}>
                {(configuration) => <Configuration configuration={configuration} />}
              </DataFetcher>
            }
          />
        </Route>
        <Route
          path="/locations/:locationBarcode"
          loader={async ({ params }) => {
            // the matching param will be available to the loader
            if (params.locationBarcode) {
              const res = await stanCore.FindLocationByBarcode({
                barcode: params.locationBarcode
              });
              return res.location;
            }
          }}
          element={<Location />}
          index={true}
        />
        <Route
          path="/labware/:barcode"
          loader={async ({ params }) => {
            // the matching param will be available to the loader
            if (params.barcode) {
              const res = await stanCore.FindPermData({
                barcode: params.barcode
              });
              return res.visiumPermData;
            }
          }} // the loader will be called with the params object
          element={<LabwareDetails />}
        />
        <Route element={<AuthLayout role={UserRole.Enduser} />}>
          <Route
            path="/file_manager"
            loader={async () => {
              if (authState?.user && authState?.user.role === UserRole.Enduser) {
                const res = await stanCore.FindWorksCreatedBy({ username: authState.user.username });
                return res.worksCreatedBy.map((workInfo) => {
                  return {
                    workNumber: workInfo.workNumber,
                    workRequester: workInfo.workRequester ? workInfo.workRequester.username : '',
                    project: workInfo.project.name,
                    status: workInfo.status
                  };
                });
              } else {
                const res = await stanCore.GetAllWorkInfo();
                return res.works;
              }
            }}
            element={<FileManager showUpload={true} />}
          />
        </Route>
        <Route>
          <Route
            path="/releaseOptions"
            loader={async () => {
              const res = await stanCore.GetReleaseColumnOptions();
              return res.releaseColumnOptions;
            }}
            element={<ReleaseOptions />}
          />
        </Route>
      </Route>
    )
  );
  return <RouterProvider router={routes} />;
};
export default RouteLayout;
