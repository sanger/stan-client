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
    <div className={"h-20"}>
      <div {...tabListProps} ref={ref}>
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
    <div {...tabProps} ref={ref}>
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
  return <div>{state.selectedItem?.props.children}</div>;
};

export { TabList, TabItem };
