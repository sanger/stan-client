import React, { useRef, useState } from "react";
import { useOnClickOutside } from "../../lib/hooks";
import { AnimatePresence, motion } from "framer-motion";

interface MenuProps {
  caption: string;
  description?: string;
  topMostMenu?: boolean;
  icon?: React.ReactNode;
}

const Menu: React.FC<MenuProps> = ({
  children,
  caption,
  description,
  topMostMenu = false,
  icon,
}) => {
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const menuDropdownRef = useRef<HTMLDivElement>(null);
  const [menuDropdownOpen, setMenuDropdownOpen] = useState(false);

  useOnClickOutside(
    () => {
      setMenuDropdownOpen(false);
    },
    menuButtonRef,
    menuDropdownRef
  );
  // ml-4 text-base font-medium text-gray-900
  const buttonClass = topMostMenu
    ? "group rounded-md inline-flex  items-center px-3 py-2 rounded-md text-sm font-medium focus:outline-none focus:text-white focus:bg-gray-700 text-gray-100 hover:text-white hover:bg-gray-700"
    : "w-full rounded-md inline-flex ml-4 justify-between outline-none focus:outline-none hover:bg-gray-50";
  const MenuDropDownIcon: React.FC<{ open: boolean }> = ({ open }) => {
    debugger;
    let rotatePos = open ? "180" : "0";
    return (
      <svg
        className={`ml-2 h-5 w-5 text-gray-400 group-hover:text-gray-500`}
        xmlns="http://www.w3.org/2000/svg"
        transform={`rotate(${rotatePos})`}
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
    );
  };

  const subMenuLayout = topMostMenu
    ? "relative"
    : "relative rounded-lg hover:bg-gray-50 mb-8";
  return (
    <div className={subMenuLayout}>
      <div className={"flex"}>
        <div className="flex flex-row w-full">
          {icon}
          <button
            ref={menuButtonRef}
            onClick={() => setMenuDropdownOpen(!menuDropdownOpen)}
            type="button"
            className={buttonClass}
          >
            <div className={"flex flex-col"}>
              <span className={"text-left"}>{caption}</span>
              {description && !menuDropdownOpen && (
                <div className={"mt-1 text-sm text-gray-500"}>
                  {description}
                </div>
              )}
            </div>
            <MenuDropDownIcon open={menuDropdownOpen} />
          </button>
        </div>
      </div>
      <div className={"flex flex-row"}>
        {menuDropdownOpen && (
          <AnimatePresence>
            <motion.div
              ref={menuDropdownRef}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.1 }}
              className="absolute z-10 left-1/2 transform -translate-x-1/2 mt-3 px-2 w-screen max-w-md sm:px-0"
            >
              <div
                className={`overflow-hidden ${
                  topMostMenu &&
                  "rounded-lg shadow-lg ring-1 ring-black ring-opacity-5"
                }`}
              >
                <div className="bg-white gap-6 px-5 py-6 sm:gap-8 sm:p-8 ">
                  {children}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

export default Menu;
