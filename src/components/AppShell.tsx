import React, { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Authenticated, Unauthenticated } from "./Authenticated";
import { StanMobileNavLink, StanNavLink } from "./nav";
import { useOnClickOutside } from "../hooks";
import GradientBackground from "./GradientBackground";
import Logo from "./Logo";
import GuestIcon from "./icons/GuestIcon";
import FadeInTransition from "./transitions/FadeInTransition";
import CSSTransition from "react-transition-group/CSSTransition";

interface AppShellParams {
  children?: JSX.Element | JSX.Element[];
}

function AppShell({ children }: AppShellParams): JSX.Element {
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const profileButtonRef = useRef<HTMLButtonElement>(null);

  // Close the drop down if the user click's outside it, as well as not on the profile button
  useOnClickOutside(
    (e) => {
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
      <GradientBackground>
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
                      <StanNavLink to="/admin">Admin</StanNavLink>
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
                          <GuestIcon className="rounded-full text-sdb bg-white" />
                        </Unauthenticated>
                        <Authenticated>
                          <span className="h-8 w-8 p-1 rounded-full text-white bg-sp text-sm">
                            jb
                          </span>
                        </Authenticated>
                      </button>
                    </div>

                    <CSSTransition
                      timeout={600}
                      in={profileDropdownOpen}
                      unmountOnExit
                      classNames="pop"
                    >
                      <div
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
                      </div>
                    </CSSTransition>
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

          <div className={`${mobileMenuOpen ? "block" : "hidden"} md:hidden`}>
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <StanMobileNavLink to="/" exact>
                Dashboard
              </StanMobileNavLink>
              <StanMobileNavLink to="/lab">Lab Work</StanMobileNavLink>
              <StanMobileNavLink to="/reports">Reports</StanMobileNavLink>
              <Authenticated>
                <StanMobileNavLink to="/admin">Admin</StanMobileNavLink>
              </Authenticated>
            </div>
            <div className="pt-4 pb-3 border-t border-gray-700">
              <Authenticated>
                <div className="flex items-center px-5 space-x-3 mb-3">
                  <div className="flex-shrink-0">
                    <span className="h-8 w-8 p-1 rounded-full text-white bg-sp text-sm">
                      jb
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="text-base font-medium leading-none text-white">
                      Joe Bloggs
                    </div>
                    <div className="text-sm font-medium leading-none text-gray-400">
                      jb1@sanger.ac.uk
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
            </div>
          </div>
        </nav>
      </GradientBackground>
      {/* Annoying CSSTransition expects only one child so we have to use a wrapper div */}
      <FadeInTransition>
        <div>{children}</div>
      </FadeInTransition>
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
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {children}
      </div>
    </header>
  );
};

AppShell.Title = function ({ children }: { children: string }) {
  return (
    <h1 className="text-3xl font-bold leading-tight text-gray-900">
      {children}
    </h1>
  );
};

AppShell.Main = function ({
  children,
}: {
  children: JSX.Element | JSX.Element[];
}) {
  return (
    <main>
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {children}
      </div>
    </main>
  );
};

export default AppShell;
