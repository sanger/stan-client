import React from "react";
import { AriaTabListProps } from "@react-types/tabs";
import { useTabListState, TabListState } from "@react-stately/tabs";
import { useTab, useTabList, useTabPanel } from "@react-aria/tabs";
import { Node } from "@react-types/shared";

type TabItemProps<T extends object> = {
  state: TabListState<T>;
  item: Node<T>;
};

const TabList = (props: AriaTabListProps<object>) => {
  const state = useTabListState(props);
  const ref = React.useRef(null);
  const { tabListProps } = useTabList(props, state, ref);
  return (
    <div className={"h-full"}>
      <div
        {...tabListProps}
        ref={ref}
        className={
          "rounded-tl overflow-hidden rounded-tr grid grid-flow-col justify-start items-center gap-x-1 bg-primary-200 border border-t-0 border-primary-200 bg-primary-50"
        }
      >
        {Array.from(state.collection).map((item) => (
          <TabItem key={item.key} item={item} state={state} />
        ))}
      </div>
      <TabContentPanel key={state.selectedItem?.key} state={state} />
    </div>
  );
};

function TabItem<T extends object>({ state, item }: TabItemProps<T>) {
  const { key, rendered } = item;
  const ref = React.useRef(null);
  const { tabProps } = useTab({ key }, state, ref);
  let isSelected = state.selectedKey === key;
  let isDisabled = state.disabledKeys.has(key);

  return (
    <div
      key={key}
      {...tabProps}
      ref={ref}
      className={`rounded-tl-lg rounded-tr-lg whitespace-nowrap transition focus:outline-none py-2 cursor-pointer px-8 h-full ${
        isSelected ? "bg-sdb-400 text-white" : "bg-gray-200"
      } ${isDisabled && "text-gray-300 cursor-not-allowed"}`}
    >
      {rendered}
    </div>
  );
}

const TabContentPanel = ({
  state,
  ...props
}: {
  state: TabListState<object>;
}) => {
  const ref = React.useRef(null);
  const { tabPanelProps } = useTabPanel(props, state, ref);
  return (
    <div
      className={
        "p-4 border h-full border-primary-200 -mt-px rounded rounded-tl-none overflow-y-auto overflow-x-hidden"
      }
      {...tabPanelProps}
      ref={ref}
    >
      {state.selectedItem?.props.children}
    </div>
  );
};

export { TabList, TabItem };
