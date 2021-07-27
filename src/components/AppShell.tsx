import React, { useContext, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Authenticated, Unauthenticated } from "./Authenticated";
import { StanMobileNavLink, StanNavLink } from "./nav";
import { useOnClickOutside } from "../lib/hooks";
import Logo from "./Logo";
import GuestIcon from "./icons/GuestIcon";
import { authContext } from "../context/AuthContext";
import { AnimatePresence, motion } from "framer-motion";
import Heading from "./Heading";
import variants from "../lib/motionVariants";
import { Slide, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LabwareIcon from "./icons/LabwareIcon";
import SupportIcon from "./icons/SupportIcon";
import Warning from "./notifications/Warning";
import { LocationState } from "../types/stan";
import Success from "./notifications/Success";
import { UserRole } from "../types/sdk";
import { configContext } from "../context/ConfigContext";

interface AppShellParams {
  children?: React.ReactNode | React.ReactNode[];
}

function AppShell({ children }: AppShellParams) {
  const config = useContext(configContext);
  const auth = useContext(authContext);
  const location = useLocation<LocationState>();
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const profileButtonRef = useRef<HTMLButtonElement>(null);
  const labDropdownRef = useRef<HTMLDivElement>(null);
  const labButtonRef = useRef<HTMLButtonElement>(null);
  const adminDropdownRef = useRef<HTMLDivElement>(null);
  const adminButtonRef = useRef<HTMLButtonElement>(null);

  // Close the drop down if the user click's outside it, as well as not on the profile button
  useOnClickOutside(
    () => {
      setProfileDropdownOpen(false);
    },
    profileDropdownRef,
    profileButtonRef
  );

  useOnClickOutside(
    () => {
      setLabDropdownOpen(false);
    },
    labDropdownRef,
    labButtonRef
  );

  useOnClickOutside(
    () => {
      setAdminDropdownOpen(false);
    },
    adminDropdownRef,
    adminButtonRef
  );

  // Should the profile dropdown be open
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [labDropdownOpen, setLabDropdownOpen] = useState(false);
  const [adminDropdownOpen, setAdminDropdownOpen] = useState(false);

  // Should the mobile menu be open
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen">
      <div className={`relative ${config?.headerColor}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center py-4 md:justify-start md:space-x-10">
            <div className="flex justify-start">
              <Link to="/">
                <Logo />
              </Link>
            </div>
            <div className="-mr-2 -my-2 md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-100 hover:text-white hover:bg-gray-700 focus:outline-none focus:bg-gray-700 focus:text-white"
              >
                <svg
                  className="block h-6 w-6"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
                <svg
                  className="hidden h-6 w-6"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <nav className="hidden md:flex space-x-10">
              <StanNavLink exact to="/search">
                Search
              </StanNavLink>
              <StanNavLink to="/store">Store</StanNavLink>
              <Authenticated>
                <div className="relative">
                  <button
                    ref={labButtonRef}
                    onClick={() => setLabDropdownOpen(!labDropdownOpen)}
                    type="button"
                    className="group rounded-md inline-flex items-center px-3 py-2 rounded-md text-sm font-medium focus:outline-none focus:text-white focus:bg-gray-700 text-gray-100 hover:text-white hover:bg-gray-700"
                  >
                    <span>Lab Work</span>

                    <svg
                      className="ml-2 h-5 w-5 text-gray-400 group-hover:text-gray-500"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>

                  {labDropdownOpen && (
                    <AnimatePresence>
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.1 }}
                        ref={labDropdownRef}
                        className="absolute z-10 -ml-4 mt-3 transform px-2 w-screen max-w-md sm:px-0 lg:ml-0 lg:left-1/2 lg:-translate-x-1/2"
                      >
                        <div className="rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 overflow-hidden">
                          <div className="relative grid gap-6 bg-white px-5 py-6 sm:gap-8 sm:p-8">
                            <NavLink
                              to="/lab/sectioning"
                              className="-m-3 p-3 flex items-start rounded-lg hover:bg-gray-50"
                            >
                              <LabwareIcon className="flex-shrink-0 h-6 w-6 text-sdb-400" />
                              <div className="ml-4">
                                <p className="text-base font-medium text-gray-900">
                                  Sectioning Planning
                                </p>
                                <p className="mt-1 text-sm text-gray-500">
                                  Slice up some tissue and place sections into
                                  pre-labelled pieces of labware.
                                </p>
                              </div>
                            </NavLink>
                            <NavLink
                              to="/lab/sectioning/confirm"
                              className="-m-3 p-3 flex items-start rounded-lg hover:bg-gray-50"
                            >
                              <LabwareIcon className="flex-shrink-0 h-6 w-6 text-sdb-400" />
                              <div className="ml-4">
                                <p className="text-base font-medium text-gray-900">
                                  Sectioning Confirmation
                                </p>
                                <p className="mt-1 text-sm text-gray-500">
                                  Confirm the number of sections taken, along
                                  with section numbers and comments,
                                  post-sectioning.
                                </p>
                              </div>
                            </NavLink>
                            <NavLink
                              to="/lab/extraction"
                              className="-m-3 p-3 flex items-start rounded-lg hover:bg-gray-50"
                            >
                              <LabwareIcon className="flex-shrink-0 h-6 w-6 text-sdb-400" />
                              <div className="ml-4">
                                <p className="text-base font-medium text-gray-900">
                                  RNA Extraction
                                </p>
                                <p className="mt-1 text-sm text-gray-500">
                                  Extract RNA from scraps obtained from
                                  Sectioning.
                                </p>
                              </div>
                            </NavLink>
                            <NavLink
                              to="/lab/visium_cdna"
                              className="-m-3 p-3 flex items-start rounded-lg hover:bg-gray-50"
                            >
                              <LabwareIcon className="flex-shrink-0 h-6 w-6 text-sdb-400" />
                              <div className="ml-4">
                                <p className="text-base font-medium text-gray-900">
                                  Visium cDNA
                                </p>
                                <p className="mt-1 text-sm text-gray-500">
                                  Transfer cDNA from slides onto a new 96 well
                                  plate.
                                </p>
                              </div>
                            </NavLink>
                          </div>
                          <div className="px-5 py-5 bg-gray-50 space-y-6 sm:flex sm:space-y-0 sm:space-x-10 sm:px-8" />
                        </div>
                      </motion.div>
                    </AnimatePresence>
                  )}
                </div>
              </Authenticated>

              <Authenticated>
                <div className="relative">
                  <button
                    ref={adminButtonRef}
                    onClick={() => setAdminDropdownOpen(!adminDropdownOpen)}
                    type="button"
                    className="group rounded-md inline-flex items-center px-3 py-2 rounded-md text-sm font-medium focus:outline-none focus:text-white focus:bg-gray-700 text-gray-100 hover:text-white hover:bg-gray-700"
                  >
                    <span>Admin</span>

                    <svg
                      className="ml-2 h-5 w-5 text-gray-400 group-hover:text-gray-500"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>

                  {adminDropdownOpen && (
                    <AnimatePresence>
                      <motion.div
                        ref={adminDropdownRef}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.1 }}
                        className="absolute z-10 left-1/2 transform -translate-x-1/2 mt-3 px-2 w-screen max-w-md sm:px-0"
                      >
                        <div className="rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 overflow-hidden">
                          <div className="relative grid gap-6 bg-white px-5 py-6 sm:gap-8 sm:p-8">
                            <Link
                              to="/admin/registration"
                              className="-m-3 p-3 flex items-start rounded-lg hover:bg-gray-50"
                            >
                              <SupportIcon className="flex-shrink-0 h-6 w-6 text-sdb-400" />
                              <div className="ml-4">
                                <p className="text-base font-medium text-gray-900">
                                  Block Registration
                                </p>
                                <p className="mt-1 text-sm text-gray-500">
                                  Register blocks of tissue into STAN and obtain
                                  new barcodes for its labware.
                                </p>
                              </div>
                            </Link>
                            <Link
                              to="/admin/slide_registration"
                              className="-m-3 p-3 flex items-start rounded-lg hover:bg-gray-50"
                            >
                              <SupportIcon className="flex-shrink-0 h-6 w-6 text-sdb-400" />
                              <div className="ml-4">
                                <p className="text-base font-medium text-gray-900">
                                  Slide Registration
                                </p>
                                <p className="mt-1 text-sm text-gray-500">
                                  Register sections of tissue on pre-barcoded
                                  slides into STAN.
                                </p>
                              </div>
                            </Link>
                            <Link
                              to="/admin/destroy"
                              className="-m-3 p-3 flex items-start rounded-lg hover:bg-gray-50"
                            >
                              <SupportIcon className="flex-shrink-0 h-6 w-6 text-sdb-400" />
                              <div className="ml-4">
                                <p className="text-base font-medium text-gray-900">
                                  Destroy
                                </p>
                                <p className="mt-1 text-sm text-gray-500">
                                  Destroy multiple pieces of labware and have
                                  STAN remove them from storage.
                                </p>
                              </div>
                            </Link>
                            <Link
                              to="/admin/release"
                              className="-m-3 p-3 flex items-start rounded-lg hover:bg-gray-50"
                            >
                              <SupportIcon className="flex-shrink-0 h-6 w-6 text-sdb-400" />
                              <div className="ml-4">
                                <p className="text-base font-medium text-gray-900">
                                  Release
                                </p>
                                <p className="mt-1 text-sm text-gray-500">
                                  Release samples in STAN to teams within the
                                  Institute.
                                </p>
                              </div>
                            </Link>
                          </div>
                          <div className="px-5 py-5 bg-gray-50 sm:px-8 sm:py-8" />
                        </div>
                      </motion.div>
                    </AnimatePresence>
                  )}
                </div>
              </Authenticated>
            </nav>
            <div className="hidden md:flex items-center justify-end md:flex-1 lg:w-0">
              <div className="relative">
                <button
                  ref={profileButtonRef}
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="max-w-xs flex items-center text-sm rounded-full text-white focus:outline-none focus:shadow-solid"
                  id="user-menu"
                  aria-label="User menu"
                  aria-haspopup="true"
                >
                  <Unauthenticated>
                    <GuestIcon className="h-10 w-10 p-1 rounded-full text-sdb bg-white" />
                  </Unauthenticated>
                  <Authenticated>
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
                        <Authenticated>
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
              <motion.div
                variants={variants.menuItemVariants}
                className="px-2 pt-2 space-y-1 sm:px-3"
              >
                <StanMobileNavLink to="/search">Search</StanMobileNavLink>
                <StanMobileNavLink to="/store">Store</StanMobileNavLink>
              </motion.div>
              <Authenticated>
                <motion.div
                  variants={variants.menuItemVariants}
                  className="py-6 px-2 space-y-6"
                >
                  <div className="pt-4 border-t border-gray-700">
                    <h3 className="px-3 text-sm font-medium text-sp-600">
                      Lab Work
                    </h3>
                    <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                      <StanMobileNavLink to="/lab/sectioning">
                        Sectioning Planning
                      </StanMobileNavLink>

                      <StanMobileNavLink to="/lab/sectioning/confirm">
                        Sectioning Confirmation
                      </StanMobileNavLink>

                      <StanMobileNavLink to="/lab/extraction">
                        RNA Extraction
                      </StanMobileNavLink>

                      <StanMobileNavLink to="/lab/visium_cdna">
                        Visium cDNA
                      </StanMobileNavLink>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-700">
                    <h3 className="px-3 text-sm font-medium text-sp-600">
                      Admin
                    </h3>
                    <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                      <StanMobileNavLink to="/admin/registration">
                        Registration
                      </StanMobileNavLink>

                      <StanMobileNavLink to="/admin/slide_registration">
                        Slide Registration
                      </StanMobileNavLink>

                      <StanMobileNavLink to="/admin/destroy">
                        Destroy
                      </StanMobileNavLink>

                      <StanMobileNavLink to="/admin/release">
                        Release
                      </StanMobileNavLink>
                    </div>
                  </div>
                </motion.div>
              </Authenticated>
              <motion.div
                variants={variants.menuItemVariants}
                className="pt-4 pb-3 border-t border-gray-700"
              >
                <Authenticated>
                  <div className="flex items-center px-5 space-x-3 mb-3">
                    <div className="flex-shrink-0">
                      <span className="inline-flex items-center justify-center h-10 w-10 p-1 rounded-full text-white bg-sp text-xs">
                        {auth.authState?.user.username}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="text-base font-medium leading-none text-white">
                        Logged In
                      </div>
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
                      className="block px-3 py-2 rounded-md text-base font-medium text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:text-white focus:bg-gray-700"
                    >
                      STAN Configuration
                    </Link>
                  </Authenticated>

                  <Authenticated>
                    <Link
                      to="/logout"
                      className="block px-3 py-2 rounded-md text-base font-medium text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:text-white focus:bg-gray-700"
                    >
                      Sign out
                    </Link>
                  </Authenticated>

                  <Unauthenticated>
                    <Link
                      to="/login"
                      className="block px-3 py-2 rounded-md text-base font-medium text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:text-white focus:bg-gray-700"
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
      {location.state?.warning && <Warning message={location.state.warning} />}
      {location.state?.success && <Success message={location.state.success} />}
      {children}
      <footer
        className={`border border-t-2 pt-5 pb-3 flex-shrink-0 ${config?.footerColor}`}
      >
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
                Version{" "}
                <span className="font-bold">
                  {process.env.REACT_APP_VERSION}
                </span>
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
                Deployed{" "}
                <span className="font-bold">{config?.deploymentDate}</span>
              </div>
            </li>
            <li>
              <a
                className="flex flex-row items-center justify-start gap-1"
                href={`mailto:${config?.supportEmail}`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 h-4 inline-block"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
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

AppShell.Header = function ({
  children,
}: {
  children: JSX.Element | JSX.Element[];
}) {
  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto py-2 px-4 sm:px-6 lg:px-8">
        {children}
      </div>
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

const Main: React.FC = ({ children }) => (
  <motion.main
    className="flex-auto"
    initial={{ opacity: 0.1 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.4 }}
  >
    <div className="py-6 px-4 sm:px-6 lg:px-8">
      {children}
      <ToastContainer autoClose={false} transition={Slide} />
    </div>
  </motion.main>
);
AppShell.Main = Main;

export default AppShell;
