import React, { useContext, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Authenticated, Unauthenticated } from "./Authenticated";
import { StanMobileNavLink, StanNavLink } from "./nav";
import { useOnClickOutside } from "../hooks";
import Logo from "./Logo";
import GuestIcon from "./icons/GuestIcon";
import { authContext } from "../context/AuthContext";
import { AnimatePresence, motion } from "framer-motion";
import Heading from "./Heading";
import variants from "../lib/motionVariants";

interface AppShellParams {
  children?: JSX.Element | JSX.Element[];
}

function AppShell({ children }: AppShellParams): JSX.Element {
  const auth = useContext(authContext);
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
    <div>
      <div className="bg-gradient-to-tr from-sdb to-sdb-400">
        <nav>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Link to="/">
                    <Logo />
                  </Link>
                </div>
                <div className="hidden md:block">
                  <div className="ml-10 flex items-baseline space-x-4">
                    <StanNavLink to="/" exact>
                      Dashboard
                    </StanNavLink>
                    <StanNavLink to="/lab">Lab Work</StanNavLink>
                    <StanNavLink to="/reports">Reports</StanNavLink>
                    <Authenticated>
                      <StanNavLink to="/admin/registration">
                        Registration
                      </StanNavLink>
                    </Authenticated>
                  </div>
                </div>
              </div>
              <div className="hidden md:block">
                <div className="ml-4 flex items-center md:ml-6">
                  <div className="ml-3 relative">
                    <div>
                      <button
                        ref={profileButtonRef}
                        onClick={() =>
                          setProfileDropdownOpen(!profileDropdownOpen)
                        }
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
                            {auth.authState?.userInfo.username}
                          </span>
                        </Authenticated>
                      </button>
                    </div>

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
              <div className="-mr-2 flex md:hidden">
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
                  className="px-2 pt-2 pb-3 space-y-1 sm:px-3"
                >
                  <StanMobileNavLink to="/" exact>
                    Dashboard
                  </StanMobileNavLink>
                  <StanMobileNavLink to="/lab">Lab Work</StanMobileNavLink>
                  <StanMobileNavLink to="/reports">Reports</StanMobileNavLink>
                  <Authenticated>
                    <StanMobileNavLink to="/admin/registration">
                      Registration
                    </StanMobileNavLink>
                  </Authenticated>
                </motion.div>
                <motion.div
                  variants={variants.menuItemVariants}
                  className="pt-4 pb-3 border-t border-gray-700"
                >
                  <Authenticated>
                    <div className="flex items-center px-5 space-x-3 mb-3">
                      <div className="flex-shrink-0">
                        <span className="inline-flex items-center justify-center h-10 w-10 p-1 rounded-full text-white bg-sp text-xs">
                          {auth.authState?.userInfo.username}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <div className="text-base font-medium leading-none text-white">
                          Logged In
                        </div>
                        <div className="text-sm font-medium leading-none text-gray-400">
                          {auth.authState?.userInfo.username}
                          @sanger.ac.uk
                        </div>
                      </div>
                    </div>
                  </Authenticated>

                  <div className="px-2 space-y-1 sm:px-3">
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
        </nav>
      </div>
      <motion.div
        initial={{ opacity: 0.1 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        {children}
      </motion.div>
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
  <main>
    <div className="py-6 px-4 sm:px-6 lg:px-8">{children}</div>
  </main>
);
AppShell.Main = Main;

export default AppShell;
