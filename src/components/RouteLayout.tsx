import { createBrowserRouter, createRoutesFromElements, Route } from 'react-router-dom';
import { RouterProvider } from 'react-router';
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
import { ProbeType, UserRole } from '../types/sdk';
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
import ImagingQC from '../pages/ImagingQC';
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
import OrientationQC from '../pages/OrientationQC';
import FlagLabware from '../pages/FlagLabware';
import { NewFlaggedLabwareLayout } from '../types/stan';
import { LibraryAmpAndGeneration } from '../pages/LibraryAmpAndGeneration';
import { CellSegmentationQc } from '../pages/CellSegmentationQc';
import { CellSegmentation } from '../pages/CellSegmentation';
import CleanOut from '../pages/CleanOut';
import XeniumMetrics from '../pages/XeniumMetrics';
import { ReviseWorkNumber } from '../pages/ReviseWorkNumber/ReviseWorkNumber';
import { ReassignRequestNumber } from '../pages/ReassignRequestNumber';
import ProbeHybridisationCytAssist from '../pages/ProbeHybridisationCytAssist/ProbeHybridisationCytAssist';

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
          loader={async () => {
            const searchInfo = await stanCore.GetSearchInfo();
            return searchInfo;
          }}
          element={<Search />}
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
              return await stanCore.GetSectioningComments();
            }}
          />
        </Route>
        <Route element={<AuthLayout />}>
          <Route
            path="/lab/sectioning"
            loader={async () => {
              const res = await stanCore.GetSectioningInfo();
              return res;
            }}
            element={<Plan />}
          />
        </Route>
        <Route element={<AuthLayout />}>
          <Route path="/lab/sectioning/orientation_qc" element={<OrientationQC />} />
        </Route>
        <Route element={<AuthLayout />}>
          <Route path="/lab/original_sample_processing" element={<OriginalSampleProcessing />} />
        </Route>
        <Route element={<AuthLayout />}>
          <Route
            path="/lab/original_sample_processing/block"
            loader={async () => {
              const res = await stanCore.GetBlockProcessingInfo();
              return res;
            }}
            element={<BlockProcessing />}
          />
        </Route>
        <Route element={<AuthLayout />}>
          <Route
            path="/lab/original_sample_processing/pot"
            loader={async () => {
              const res = await stanCore.GetPotProcessingInfo();
              return res;
            }}
            element={<PotProcessing />}
          />
        </Route>
        <Route element={<AuthLayout />}>
          <Route
            path="/lab/sample_processing_comments"
            loader={async () => {
              const res = await stanCore.GetSampleProcessingCommentsInfo();
              return res;
            }}
            element={<SampleProcessingComments />}
          />
        </Route>
        <Route element={<AuthLayout />}>
          <Route
            path="/lab/solution_transfer"
            loader={async () => {
              const res = await stanCore.GetSolutionTransferInfo();
              return res;
            }}
            element={<SolutionTransfer />}
          />
        </Route>
        <Route element={<AuthLayout />}>
          <Route
            path="/lab/paraffin_processing"
            loader={async () => {
              const res = await stanCore.GetParaffinProcessingInfo();
              return res;
            }}
            element={<ParaffinProcessing />}
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
            loader={async () => {
              const res = await stanCore.GetRecordExtractResultInfo();
              return res;
            }}
            element={<ExtractionResult />}
          />
        </Route>
        <Route element={<AuthLayout />}>
          <Route path="/lab/aliquoting" element={<Aliquot />} />
        </Route>
        <Route element={<AuthLayout />}>
          <Route
            path="/lab/transfer"
            element={
              <SlotCopy title={'Transfer'} initialOutputLabware={[plateFactory.build() as NewFlaggedLabwareLayout]} />
            }
          />
        </Route>
        <Route element={<AuthLayout />}>
          <Route
            path="/lab/visium_qc"
            loader={async () => {
              return await stanCore.GetComments({ includeDisabled: false });
            }}
            element={<VisiumQC />}
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
            loader={async () => {
              return await stanCore.GetProbePanels({ type: ProbeType.Xenium });
            }}
            element={<ProbeHybridisationXenium />}
          />
        </Route>
        <Route element={<AuthLayout />}>
          <Route
            path="/lab/probe_hybridisation_cytassist"
            loader={async () => {
              const cytAssistProbes = await stanCore.GetProbePanels({ type: ProbeType.Cytassist });
              const spikeProbes = await stanCore.GetProbePanels({ type: ProbeType.Spike });
              return {
                cytAssistProbes: cytAssistProbes.probePanels,
                spikeProbes: spikeProbes.probePanels
              };
            }}
            element={<ProbeHybridisationCytAssist />}
          />
        </Route>
        <Route element={<AuthLayout />}>
          <Route
            path="/lab/probe_hybridisation_qc"
            loader={async () => {
              const res = await stanCore.GetComments({
                commentCategory: 'Probe QC',
                includeDisabled: false
              });
              return res.comments;
            }}
            element={<ProbeHybridisationQC />}
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
          <Route path="/lab/xenium_metrics" element={<XeniumMetrics />} />
        </Route>
        <Route element={<AuthLayout />}>
          <Route
            path="/lab/cell_segmentation"
            loader={async () => {
              const commentsQuery = await stanCore.GetComments({
                commentCategory: 'Cell Segmentation'
              });
              const proteinPanels = await stanCore.GetProteinPanels({ includeDisabled: false });
              return {
                comments: commentsQuery.comments,
                proteinPanels: proteinPanels.proteinPanels
              };
            }}
            element={<CellSegmentation />}
          />
        </Route>
        <Route element={<AuthLayout />}>
          <Route
            path="/lab/cell_segmentation_qc"
            loader={async () => {
              const res = await stanCore.GetComments({
                commentCategory: 'Cell Segmentation'
              });
              return res.comments;
            }}
            element={<CellSegmentationQc />}
          />
        </Route>
        <Route element={<AuthLayout />}>
          <Route path="/lab/cytassist" element={<CytAssist />} />
        </Route>
        <Route element={<AuthLayout />}>
          <Route path="/lab/libraryGeneration" element={<LibraryAmpAndGeneration />} />
        </Route>
        <Route element={<AuthLayout />}>
          <Route
            path="/lab/staining"
            loader={async () => {
              const stainingInfo = await stanCore.GetStainInfo();
              const reagentTypes = await stanCore.GetStainReagentTypes();
              return {
                stainingInfo,
                reagentTypes
              };
            }}
            element={<Staining />}
          />
        </Route>
        <Route element={<AuthLayout />}>
          <Route
            path="/lab/imaging_qc"
            element={
              <DataFetcher dataFetcher={stanCore.GetStainingQCInfo}>
                {(stainingQcInfo) => <ImagingQC info={stainingQcInfo} />}
              </DataFetcher>
            }
          />
        </Route>
        <Route element={<AuthLayout />}>
          <Route
            path="/lab/imaging"
            loader={async () => {
              const recordInPlaceInfo = await stanCore.GetRecordInPlaceInfo({ category: 'scanner' });
              return recordInPlaceInfo.equipments;
            }}
            element={
              <RecordInPlace
                title={'Imaging'}
                operationType={'image'}
                columns={[
                  columns.barcode(),
                  columns.donorId(),
                  columns.labwareType(),
                  columns.externalName(),
                  columns.bioState()
                ]}
                displayStoreOption={true}
              />
            }
          />
        </Route>
        <Route element={<AuthLayout />}>
          <Route
            path="/admin/registration"
            loader={async () => {
              return await stanCore.GetRegistrationInfo();
            }}
            element={<BlockRegistration />}
          />
        </Route>
        <Route element={<AuthLayout />}>
          <Route
            path="/admin/section_registration"
            loader={async () => {
              const res = await stanCore.GetRegistrationInfo();
              return res;
            }}
            element={<SectionRegistration />}
          />
        </Route>
        <Route element={<AuthLayout />}>
          <Route
            path="/admin/tissue_registration"
            loader={async () => {
              const res = await stanCore.GetRegistrationInfo();
              return res;
            }}
            element={<OriginalSampleRegistration />}
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
          <Route path="/admin/reassign_request_number" element={<ReassignRequestNumber />} />
        </Route>
        <Route element={<AuthLayout />}>
          <Route
            path="/admin/revise_work_number"
            loader={async () => {
              return await stanCore.GetOperationTypes();
            }}
            element={<ReviseWorkNumber />}
          />
        </Route>

        <Route element={<AuthLayout />}>
          <Route
            path="/admin/release"
            loader={async () => {
              const res = stanCore.GetReleaseInfo();
              return res;
            }}
            element={<Release />}
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
          <Route path="/admin/cleanout" element={<CleanOut />} />
        </Route>
        <Route element={<AuthLayout />}>
          <Route
            path="/admin/destroy"
            loader={async () => {
              const res = await stanCore.GetDestroyInfo();
              return res;
            }}
            element={<Destroy />}
          />
        </Route>
        <Route element={<AuthLayout role={UserRole.Admin} />}>
          <Route
            path="/config"
            loader={async () => {
              const res = await stanCore.GetConfiguration();
              return res;
            }}
            element={<Configuration />}
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
            if (params.barcode) {
              const [perData, flagDetails, labwareBioRiskCodes] = await Promise.all([
                stanCore.FindPermData({ barcode: params.barcode }),
                stanCore.GetLabwareFlagDetails({ barcodes: [params.barcode] }),
                stanCore.GetLabwareBioRiskCodes({ barcode: params.barcode })
              ]);
              return {
                ...perData.visiumPermData,
                labwareFlagDetails: flagDetails.labwareFlagDetails,
                labwareBioRiskCodes: labwareBioRiskCodes.labwareBioRiskCodes
              };
            }
          }}
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
          <Route path="/releaseOptions" element={<ReleaseOptions />} />
        </Route>
        <Route element={<AuthLayout />}>
          <Route path="/admin/flagLabware" element={<FlagLabware />} />
        </Route>
      </Route>
    )
  );
  return <RouterProvider router={routes} />;
};
export default RouteLayout;
