import React, { useContext, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Authenticated, Unauthenticated } from './Authenticated';
import { StanMobileNavLink, StanNavLink } from './nav';
import { useOnClickOutside } from '../lib/hooks';
import Logo from './Logo';
import GuestIcon from './icons/GuestIcon';
import { useAuth } from '../context/AuthContext';
import { AnimatePresence, motion } from '../dependencies/motion';
import Heading from './Heading';
import variants from '../lib/motionVariants';
import { Slide, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import LabwareIcon from './icons/LabwareIcon';
import SupportIcon from './icons/SupportIcon';
import Warning from './notifications/Warning';
import Success from './notifications/Success';
import { UserRole } from '../types/sdk';
import { configContext } from '../context/ConfigContext';
import NavLinkMenuItem from './menu/NavlinkMenuItem';
import Menu from './menu/Menu';
import { FCWithChildren, LocationState } from '../types/stan';

interface AppShellParams {
  children?: React.ReactNode | React.ReactNode[];
}

function AppShell({ children }: AppShellParams) {
  const config = useContext(configContext);
  const auth = useAuth();
  const locationState = useLocation().state as LocationState;
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const profileButtonRef = useRef<HTMLButtonElement>(null);

  // Close the drop down if the user click's outside it, as well as not on the profile button
  useOnClickOutside(
    () => {
      setProfileDropdownOpen(false);
    },
    profileDropdownRef,
    profileButtonRef
  );

  // Should the profile dropdown be open
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  // Should the mobile menu be open
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen">
      <div className={`relative ${config?.headerColor}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center py-4 md:justify-start md:space-x-10 ">
            <div className="flex justify-start">
              <Link to="/">
                <Logo />
              </Link>
            </div>
            <div className="-mr-2 -my-2 md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-100 hover:text-white hover:bg-gray-700 focus:outline-hidden focus:bg-gray-700 focus:text-white"
              >
                <svg className="block h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                <svg className="hidden h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <nav className="hidden md:flex space-x-10">
              <StanNavLink end to="/">
                Home
              </StanNavLink>
              <StanNavLink end to="/search">
                Search
              </StanNavLink>
              <StanNavLink to="/store">Store</StanNavLink>
              <StanNavLink to="/history">History</StanNavLink>
              <Authenticated role={UserRole.Enduser}>
                <StanNavLink to="/sgp">SGP Management</StanNavLink>
              </Authenticated>
              <Authenticated role={UserRole.Normal}>
                <Menu caption={'Lab Work'} topMostMenu={true}>
                  <Menu
                    caption={'Sectioning'}
                    icon={<LabwareIcon className="shrink-0 h-6 w-6 text-sdb-400" />}
                    description={'Recording sectioning planning and confirmation.'}
                  >
                    <NavLinkMenuItem
                      caption={'Orientation QC'}
                      path={'/lab/sectioning/orientation_qc'}
                      icon={<LabwareIcon className="shrink-0 h-6 w-6 text-sdb-400" />}
                      description={'Recording the embedding orientation.'}
                    />
                    <NavLinkMenuItem
                      caption={'Planning'}
                      path={'/lab/sectioning'}
                      icon={<LabwareIcon className="shrink-0 h-6 w-6 text-sdb-400" />}
                      description={'Slice up some tissue and place sections into pre-labelled pieces of labware.'}
                    />
                    <NavLinkMenuItem
                      caption={'Confirmation'}
                      path={'/lab/sectioning/confirm'}
                      icon={<LabwareIcon className="shrink-0 h-6 w-6 text-sdb-400" />}
                      description={
                        'Confirm the number of sections taken, along with section numbers and comments, post-sectioning.'
                      }
                    />
                  </Menu>
                  <Menu
                    caption={'Original Sample'}
                    icon={<LabwareIcon className="shrink-0 h-6 w-6 text-sdb-400" />}
                    description={'Original sample operations'}
                  >
                    <NavLinkMenuItem
                      caption={'Labware generation'}
                      path="/lab/original_sample_processing"
                      icon={<LabwareIcon className="shrink-0 h-6 w-6 text-sdb-400" />}
                      description={
                        'Divide original tissue samples into new labware to become tissue blocks or to different types of pots of fixative.'
                      }
                    />
                    <NavLinkMenuItem
                      caption={'Paraffin Processing'}
                      path="/lab/paraffin_processing"
                      icon={<LabwareIcon className="shrink-0 h-6 w-6 text-sdb-400" />}
                      description={'Records the type of processing cycle run on the sample.'}
                    />

                    <NavLinkMenuItem
                      caption={'Solution Transfer'}
                      path="/lab/solution_transfer"
                      icon={<LabwareIcon className="shrink-0 h-6 w-6 text-sdb-400" />}
                      description={'Records solution transfer operation of samples.'}
                    />
                    <NavLinkMenuItem
                      caption={'Add External ID'}
                      path="/lab/add_external_id"
                      icon={<LabwareIcon className="shrink-0 h-6 w-6 text-sdb-400" />}
                      description={'Add an External ID to an original sample.'}
                    />

                    <NavLinkMenuItem
                      caption={'Sample Processing Comments'}
                      path="/lab/sample_processing_comments"
                      icon={<LabwareIcon className="shrink-0 h-6 w-6 text-sdb-400" />}
                      description={'Records extra labware generation comments.'}
                    />
                  </Menu>

                  <NavLinkMenuItem
                    caption={'Fetal Waste'}
                    path="/lab/fetal_waste"
                    icon={<LabwareIcon className="shrink-0 h-6 w-6 text-sdb-400" />}
                    description={'Convert bio state to Fetal Waste.'}
                  />
                  <Menu
                    caption={'RNA'}
                    icon={<LabwareIcon className="shrink-0 h-6 w-6 text-sdb-400" />}
                    description={'Recording RNA extraction and analysis'}
                  >
                    <NavLinkMenuItem
                      caption={'Extraction'}
                      path="/lab/extraction"
                      icon={<LabwareIcon className="shrink-0 h-6 w-6 text-sdb-400" />}
                      description={'Extract RNA from scraps obtained from Sectioning.'}
                    />
                    <NavLinkMenuItem
                      caption={'Extraction Result'}
                      path={'/lab/extraction_result'}
                      icon={<LabwareIcon className="shrink-0 h-6 w-6 text-sdb-400" />}
                      description={'Record pass/fail results and concentration for RNA extractions.'}
                    />
                    <NavLinkMenuItem
                      caption={'Analysis'}
                      path={'/lab/rna_analysis'}
                      icon={<LabwareIcon className="shrink-0 h-6 w-6 text-sdb-400" />}
                      description={'Record RNA Analysis on tubes from RNA Extraction'}
                    />
                    <NavLinkMenuItem
                      caption={'Aliquoting'}
                      path="/lab/aliquoting"
                      icon={<LabwareIcon className="shrink-0 h-6 w-6 text-sdb-400" />}
                      description={'Aliquot a tube of solution out into multiple new tubes.'}
                    />
                  </Menu>
                  <Menu
                    caption={'Staining'}
                    description={'Recording staining slides and QC'}
                    icon={<LabwareIcon className="shrink-0 h-6 w-6 text-sdb-400" />}
                  >
                    <NavLinkMenuItem
                      caption={'Stain slides'}
                      path={'/lab/staining'}
                      icon={<LabwareIcon className="shrink-0 h-6 w-6 text-sdb-400" />}
                      description={'Stain slides and record incubation details.'}
                    />
                    <NavLinkMenuItem
                      caption={'Staining QC'}
                      path={'/lab/staining_qc'}
                      icon={<LabwareIcon className="shrink-0 h-6 w-6 text-sdb-400" />}
                      description={'Pass or fail samples on a stained slide.'}
                    />
                  </Menu>
                  <Menu
                    caption={'Visium'}
                    icon={<LabwareIcon className="shrink-0 h-6 w-6 text-sdb-400" />}
                    description={'Recording Visium process'}
                  >
                    <NavLinkMenuItem
                      caption={'Transfer'}
                      path={'/lab/transfer'}
                      icon={<LabwareIcon className="shrink-0 h-6 w-6 text-sdb-400" />}
                      description={'Transfer to new 96 well plate.'}
                    />
                    <NavLinkMenuItem
                      caption={'Visium QC'}
                      path={'/lab/visium_qc'}
                      icon={<LabwareIcon className="shrink-0 h-6 w-6 text-sdb-400" />}
                      description={'Pass or fail samples on a visium slide.'}
                    />

                    <NavLinkMenuItem
                      caption={'Visium Permeabilisation'}
                      path={'/lab/visium_perm'}
                      icon={<LabwareIcon className="shrink-0 h-6 w-6 text-sdb-400" />}
                      description={'Record permeabilisation times for each slot of a stained slide.'}
                    />
                    <NavLinkMenuItem
                      caption={'Visium Analysis'}
                      path={'/lab/visium_analysis'}
                      icon={<LabwareIcon className="shrink-0 h-6 w-6 text-sdb-400" />}
                      description={'Select the best permeabilisation time for a slide.'}
                    />
                    <NavLinkMenuItem
                      caption={'Dual Index Plate'}
                      path={'/lab/dual_index_plate'}
                      icon={<LabwareIcon className="shrink-0 h-6 w-6 text-sdb-400" />}
                      description={'Record the transfer of dual-index reagent to 96 well plate.'}
                    />
                    <NavLinkMenuItem
                      caption={'CytAssist'}
                      path={'/lab/cytassist'}
                      icon={<LabwareIcon className="shrink-0 h-6 w-6 text-sdb-400" />}
                      description={'Record the transfer of sections to a CytAssist slide.'}
                    />
                    <NavLinkMenuItem
                      caption={'Library Amplification and Generation'}
                      path={'/lab/libraryGeneration'}
                      icon={<LabwareIcon className="shrink-0 h-6 w-6 text-sdb-400" />}
                      description={
                        'Record the library amplification, dual index plate, and the cycle number for the Visium CytAssist.'
                      }
                    />
                  </Menu>
                  <Menu
                    caption={'Probe Hybridisation'}
                    icon={<LabwareIcon className="shrink-0 h-6 w-6 text-sdb-400" />}
                    description={'Recording Probe hybridisation'}
                  >
                    <NavLinkMenuItem
                      caption={'Xenium'}
                      path={'/lab/probe_hybridisation_xenium'}
                      icon={<LabwareIcon className="shrink-0 h-6 w-6 text-sdb-400" />}
                      description={'Recording Probe hybridisation for Xenium slides.'}
                    />
                    <NavLinkMenuItem
                      caption={'Probe hybridisation QC'}
                      path={'/lab/probe_hybridisation_qc'}
                      icon={<LabwareIcon className="shrink-0 h-6 w-6 text-sdb-400" />}
                      description={'Recording Probe hybridisation QC completion date and set sample sections comments.'}
                    />
                  </Menu>
                  <Menu
                    caption={'Xenium'}
                    icon={<LabwareIcon className="shrink-0 h-6 w-6 text-sdb-400" />}
                    description={'Recording Xenium run information'}
                  >
                    <NavLinkMenuItem
                      caption={'Cell Segmentation'}
                      path={'/lab/cell_segmentation'}
                      icon={<LabwareIcon className="shrink-0 h-6 w-6 text-sdb-400" />}
                    />
                    <NavLinkMenuItem
                      caption={'Cell Segmentation QC'}
                      path={'/lab/cell_segmentation_qc'}
                      icon={<LabwareIcon className="shrink-0 h-6 w-6 text-sdb-400" />}
                      description={'Recording Cell Segmentation QC'}
                    />
                    <NavLinkMenuItem
                      caption={'Xenium Analyser'}
                      path={'/lab/xenium_analyser'}
                      icon={<LabwareIcon className="shrink-0 h-6 w-6 text-sdb-400" />}
                      description={'Recording Xenium analyser information'}
                    />
                    <NavLinkMenuItem
                      caption={'Xenium Analyser QC'}
                      path={'/lab/xenium_qc'}
                      icon={<LabwareIcon className="shrink-0 h-6 w-6 text-sdb-400" />}
                      description={'Recording Xenium Analyser QC'}
                    />
                    <NavLinkMenuItem
                      caption={'Xenium Metrics'}
                      path={'/lab/xenium_metrics'}
                      icon={<LabwareIcon className="shrink-0 h-6 w-6 text-sdb-400" />}
                      description={'Recording region of interest metrics for Xenium slides'}
                    />
                  </Menu>
                  <NavLinkMenuItem
                    caption={'Imaging'}
                    path={'/lab/imaging'}
                    icon={<LabwareIcon className="shrink-0 h-6 w-6 text-sdb-400" />}
                    description={'Record that images have been taken for a batch of labware.'}
                  />
                </Menu>
              </Authenticated>
              <Authenticated role={UserRole.Enduser}>
                <StanNavLink to="/file_manager">File Manager</StanNavLink>
              </Authenticated>
              <Authenticated role={UserRole.Normal}>
                <Menu caption={'Admin'} topMostMenu={true}>
                  <NavLinkMenuItem
                    caption={'Block Registration'}
                    path={'/admin/registration'}
                    icon={<SupportIcon className="shrink-0 h-6 w-6 text-sdb-400" />}
                    description={'Register blocks of tissue into STAN and obtain new barcodes for its labware.'}
                  />
                  <NavLinkMenuItem
                    caption={'Section Registration'}
                    path={'/admin/section_registration'}
                    icon={<SupportIcon className="shrink-0 h-6 w-6 text-sdb-400" />}
                    description={'Register sections of tissue on pre-barcoded labware into STAN.'}
                  />
                  <NavLinkMenuItem
                    caption={'Original Sample Registration'}
                    path={'/admin/tissue_registration'}
                    icon={<SupportIcon className="shrink-0 h-6 w-6 text-sdb-400" />}
                    description={'Register tissue samples which can be either fixed or fresh into STAN.'}
                  />
                  <NavLinkMenuItem
                    caption={'Clean Out'}
                    path={'/admin/cleanout'}
                    icon={<SupportIcon className="shrink-0 h-6 w-6 text-sdb-400" />}
                    description={'Clean the wells/slots of a labware.'}
                  />
                  <NavLinkMenuItem
                    caption={'Destroy'}
                    path={'/admin/destroy'}
                    icon={<SupportIcon className="shrink-0 h-6 w-6 text-sdb-400" />}
                    description={'Destroy multiple pieces of labware and have STAN remove them from storage.'}
                  />
                  <NavLinkMenuItem
                    caption={'Flag Labware'}
                    path={'/admin/flagLabware'}
                    icon={<SupportIcon className="shrink-0 h-6 w-6 text-sdb-400" />}
                    description={'Flag a labware and record a reason.'}
                  />
                  <NavLinkMenuItem
                    caption={'Reactivate'}
                    path={'/admin/reactivate'}
                    icon={<SupportIcon className="shrink-0 h-6 w-6 text-sdb-400" />}
                    description={'Reactivate destroyed and discarded labware.'}
                  />
                  <NavLinkMenuItem
                    caption={'Release'}
                    path={'/admin/release'}
                    icon={<SupportIcon className="shrink-0 h-6 w-6 text-sdb-400" />}
                    description={'Release samples in STAN to teams within the Institute.'}
                  />
                  <NavLinkMenuItem
                    caption={'Unrelease'}
                    path={'/admin/unrelease'}
                    icon={<SupportIcon className="shrink-0 h-6 w-6 text-sdb-400" />}
                    description={' Re-use STAN labware that has previously been released.'}
                  />
                </Menu>
              </Authenticated>
            </nav>
            <div className="hidden md:flex items-center justify-end md:flex-1 lg:w-0">
              <div className="relative">
                <button
                  ref={profileButtonRef}
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="max-w-xs flex items-center text-sm rounded-full text-white focus:outline-hidden focus:shadow-sm-solid"
                  id="user-menu"
                  aria-label="User menu"
                  aria-haspopup="true"
                >
                  <Unauthenticated>
                    <GuestIcon className="h-10 w-10 p-1 rounded-full text-sdb bg-white" />
                  </Unauthenticated>
                  <Authenticated role={UserRole.Enduser}>
                    <span className="inline-flex items-center justify-center h-10 w-10 p-1 rounded-full text-white bg-sp text-xs">
                      {auth.authState?.user.username}
                    </span>
                  </Authenticated>
                </button>

                <AnimatePresence>
                  {profileDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.1 }}
                      ref={profileDropdownRef}
                      className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg"
                    >
                      <div
                        className="py-1 rounded-md bg-white shadow-xs"
                        role="menu"
                        aria-orientation="vertical"
                        aria-labelledby="user-menu"
                      >
                        <Authenticated role={UserRole.Admin}>
                          <Link
                            to="/config"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            role="menuitem"
                          >
                            STAN Configuration
                          </Link>
                        </Authenticated>
                        <Authenticated role={UserRole.Enduser}>
                          <Link
                            to="/logout"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            role="menuitem"
                          >
                            Sign out
                          </Link>
                        </Authenticated>
                        <Unauthenticated>
                          <Link
                            to="/login"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            role="menuitem"
                          >
                            Login
                          </Link>
                        </Unauthenticated>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={variants.menuVariants}
              className="block md:hidden"
            >
              <motion.div variants={variants.menuItemVariants} className="px-2 pt-2 space-y-1 sm:px-3">
                <StanMobileNavLink to="/">Home</StanMobileNavLink>
                <StanMobileNavLink to="/search">Search</StanMobileNavLink>
                <StanMobileNavLink to="/store">Store</StanMobileNavLink>
                <StanMobileNavLink to="/history">History</StanMobileNavLink>
                <Authenticated role={UserRole.Normal}>
                  <StanMobileNavLink to="/sgp">SGP Management</StanMobileNavLink>
                </Authenticated>
              </motion.div>
              <Authenticated role={UserRole.Normal}>
                <motion.div variants={variants.menuItemVariants} className="py-6 px-2 space-y-6">
                  <div className="pt-4 border-t border-gray-700">
                    <h3 className="px-3 text-sm font-bold text-sp-600">Lab Work</h3>
                    <h4 className="px-3 pt-2 text-sm font-normal mt-2 ml-2 text-sp-600">Sectioning</h4>
                    <div className="grid grid-cols-2 ml-2 gap-y-4 gap-x-8">
                      <StanMobileNavLink to="/lab/sectioning">Planning</StanMobileNavLink>
                      <StanMobileNavLink to="/lab/sectioning/confirm">Confirmation</StanMobileNavLink>
                    </div>
                    <StanMobileNavLink to="/lab/fetal_waste">Fetal Waste</StanMobileNavLink>
                    <h4 className="px-3 pt-2 text-sm font-normal mt-2 ml-2 text-sp-600">Original Sample</h4>
                    <div className="grid grid-cols-2 ml-2 gap-y-4 gap-x-8">
                      <StanMobileNavLink to="/lab/original_sample_processing">Labware Generation</StanMobileNavLink>
                      <StanMobileNavLink to="/lab/original_sample_processing">Paraffin Processing</StanMobileNavLink>
                    </div>
                    <h4 className="px-3 pt-2 text-sm font-normal ml-2 text-sp-600">RNA</h4>
                    <div className="grid grid-cols-2 ml-2 gap-y-4 gap-x-8">
                      <StanMobileNavLink to="/lab/extraction">Extraction</StanMobileNavLink>
                      <StanMobileNavLink to="/lab/extraction_result">Extraction Result</StanMobileNavLink>
                      <StanMobileNavLink to="/lab/rna_analysis">Analysis</StanMobileNavLink>
                      <StanMobileNavLink to="/lab/aliquoting">Aliquoting</StanMobileNavLink>
                    </div>
                    <h4 className="px-3 pt-2 text-sm font-normal ml-2 text-sp-600">Staining</h4>
                    <div className="grid grid-cols-2 ml-2 gap-y-4 gap-x-8">
                      <StanMobileNavLink to="/lab/staining">Stain slides</StanMobileNavLink>

                      <StanMobileNavLink to="/lab/staining_qc">Staining QC</StanMobileNavLink>
                    </div>
                    <h4 className="px-3 pt-2 text-sm font-normal ml-2 text-sp-600">Visium</h4>
                    <div className="grid grid-cols-2 ml-2 gap-y-4 gap-x-8">
                      <StanMobileNavLink to="/lab/transfer">Transfer</StanMobileNavLink>
                      <StanMobileNavLink to="/lab/visium_perm">Visium Permeabilisation</StanMobileNavLink>
                      <StanMobileNavLink to="/lab/visium_analysis">Visium Analysis</StanMobileNavLink>
                      <StanMobileNavLink to="/lab/dual_index_plate">Dual Index Plate</StanMobileNavLink>
                    </div>
                    <div className="grid grid-cols-2 ml-2 gap-y-4 gap-x-8">
                      <StanMobileNavLink to="/lab/visium_qc">Visium QC</StanMobileNavLink>
                    </div>
                    <h4 className="px-3 pt-2 text-sm font-normal ml-2 text-sp-600">Probe Hybridisation</h4>
                    <div className="grid grid-cols-2 ml-2 gap-y-4 gap-x-8">
                      <StanMobileNavLink to="/lab/probe_hybridisation_xenium">Xenium</StanMobileNavLink>
                    </div>
                    <div className="grid grid-cols-2 ml-2 gap-y-4 gap-x-8">
                      <StanMobileNavLink to="/lab/probe_hybridisation_qc">Probe hybridisation QC</StanMobileNavLink>
                    </div>
                    <h4 className="px-3 pt-2 text-sm font-normal ml-2 text-sp-600">Xenium</h4>
                    <div className="grid grid-cols-2 ml-2 gap-y-4 gap-x-8">
                      <StanMobileNavLink to="/lab/cell_segmentation">Cell Segmentation</StanMobileNavLink>
                      <StanMobileNavLink to="/lab/cell_segmentation_qc">Cell Segmentation QC</StanMobileNavLink>
                      <StanMobileNavLink to="/lab/xenium_analyser">Xenium Analyser</StanMobileNavLink>
                      <StanMobileNavLink to="/lab/xenium_qc">Xenium Analyser QC</StanMobileNavLink>
                      <StanMobileNavLink to="/lab/xenium_metrics">Xenium Metrics</StanMobileNavLink>
                    </div>
                    <div className="grid grid-cols-2 mt-2 gap-y-4 gap-x-8">
                      <StanMobileNavLink to="/lab/imaging">Imaging</StanMobileNavLink>
                    </div>
                  </div>
                  <Authenticated role={UserRole.Enduser}>
                    <StanMobileNavLink to="/file_manager">File Manager</StanMobileNavLink>
                  </Authenticated>
                  <Authenticated role={UserRole.Normal}>
                    <div className="pt-4 border-t border-gray-700">
                      <h3 className="px-3 text-sm font-bold text-sp-600">Admin</h3>
                      <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                        <StanMobileNavLink to="/admin/registration">Registration</StanMobileNavLink>

                        <StanMobileNavLink to="/admin/slide_registration">Slide Registration</StanMobileNavLink>
                        <StanMobileNavLink to={'/admin/tissue_registration'}>Tissue Registration</StanMobileNavLink>

                        <StanMobileNavLink to="/admin/cleanout">Clean Out</StanMobileNavLink>
                        <StanMobileNavLink to="/admin/destroy">Destroy</StanMobileNavLink>
                        <StanMobileNavLink to={'/admin/flagLabware'}>Flag Labware</StanMobileNavLink>

                        <StanMobileNavLink to="/admin/reactivate">Reactivate</StanMobileNavLink>

                        <StanMobileNavLink to="/admin/release">Release</StanMobileNavLink>

                        <StanMobileNavLink to="/admin/unrelease">Unrelease</StanMobileNavLink>
                      </div>
                    </div>
                  </Authenticated>
                </motion.div>
              </Authenticated>
              <motion.div variants={variants.menuItemVariants} className="pt-4 pb-3 border-t border-gray-700">
                <Authenticated role={UserRole.Enduser}>
                  <div className="flex items-center px-5 space-x-3 mb-3">
                    <div className="shrink-0">
                      <span className="inline-flex items-center justify-center h-10 w-10 p-1 rounded-full text-white bg-sp text-xs">
                        {auth.authState?.user.username}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="text-base font-medium leading-none text-white">Logged In</div>
                      <div className="text-sm font-medium leading-none text-gray-400">
                        {auth.authState?.user.username}
                        @sanger.ac.uk
                      </div>
                    </div>
                  </div>
                </Authenticated>

                <div className="px-2 space-y-1 sm:px-3">
                  <Authenticated role={UserRole.Admin}>
                    <Link
                      to="/config"
                      className="block px-3 py-2 rounded-md text-base font-medium text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-hidden focus:text-white focus:bg-gray-700"
                    >
                      STAN Configuration
                    </Link>
                  </Authenticated>

                  <Authenticated role={UserRole.Enduser}>
                    <Link
                      to="/logout"
                      className="block px-3 py-2 rounded-md text-base font-medium text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-hidden focus:text-white focus:bg-gray-700"
                    >
                      Sign out
                    </Link>
                  </Authenticated>

                  <Unauthenticated>
                    <Link
                      to="/login"
                      className="block px-3 py-2 rounded-md text-base font-medium text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-hidden focus:text-white focus:bg-gray-700"
                    >
                      Login
                    </Link>
                  </Unauthenticated>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {locationState?.warning && <Warning message={locationState.warning} />}
      {locationState?.success && <Success message={locationState.success} />}
      {children}
      <footer className={`border border-t-2 pt-5 pb-3 shrink-0 ${config?.footerColor}`}>
        <div className="max-w-sm mx-auto px-4 sm:px-6">
          <ul className="flex flex-row items-center justify-between my-2 text-xs text-gray-500">
            <li>
              <div className="flex flex-row items-center justify-start gap-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 inline-block"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M2 5a2 2 0 012-2h12a2 2 0 012 2v2a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm14 1a1 1 0 11-2 0 1 1 0 012 0zM2 13a2 2 0 012-2h12a2 2 0 012 2v2a2 2 0 01-2 2H4a2 2 0 01-2-2v-2zm14 1a1 1 0 11-2 0 1 1 0 012 0z"
                    clipRule="evenodd"
                  />
                </svg>
                Version <span className="font-bold">{process.env.REACT_APP_VERSION}</span>
              </div>
            </li>
            <li>
              <div className="flex flex-row items-center justify-start gap-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 inline-block"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                    clipRule="evenodd"
                  />
                </svg>
                Deployed <span className="font-bold">{config?.deploymentDate}</span>
              </div>
            </li>
            <li>
              <a className="flex flex-row items-center justify-start gap-1" href={`${config?.supportUrl}`}>
                Support
              </a>
            </li>
          </ul>
          <div className="mx-auto my-2 text-center text-xs font-medium text-gray-500">
            &copy; {new Date().getFullYear()} Genome Research Ltd.
          </div>
        </div>
      </footer>
    </div>
  );
}

AppShell.Header = function ({ children }: { children: JSX.Element | JSX.Element[] }) {
  return (
    <header className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto py-2 px-4 sm:px-6 lg:px-8">{children}</div>
    </header>
  );
};

AppShell.Title = function ({ children }: { children: string }) {
  return (
    <Heading level={1} showBorder={false} className="text-gray-900">
      {children}
    </Heading>
  );
};

const Main: FCWithChildren = ({ children }) => (
  <motion.main className="flex-auto" initial={{ opacity: 0.1 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
    <div className="py-6 px-4 sm:px-6 lg:px-8">
      {children}
      <ToastContainer autoClose={false} transition={Slide} />
    </div>
  </motion.main>
);
AppShell.Main = Main;

export default AppShell;
