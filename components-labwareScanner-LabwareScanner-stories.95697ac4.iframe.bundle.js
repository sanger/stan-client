"use strict";(self.webpackChunkclient=self.webpackChunkclient||[]).push([[220],{"./src/components/labwareScanner/LabwareScanner.stories.tsx":function(__unused_webpack_module,__webpack_exports__,__webpack_require__){__webpack_require__.r(__webpack_exports__),__webpack_require__.d(__webpack_exports__,{LabwareScannerList:function(){return LabwareScannerList},LabwareScannerSlotsTableStory:function(){return LabwareScannerSlotsTableStory},LabwareScannerTable:function(){return LabwareScannerTable},__namedExportsOrder:function(){return __namedExportsOrder},default:function(){return LabwareScanner_stories}});var objectSpread2=__webpack_require__("./node_modules/babel-preset-react-app/node_modules/@babel/runtime/helpers/esm/objectSpread2.js"),react=__webpack_require__("./node_modules/react/index.js"),LabwareScanner=__webpack_require__("./src/components/labwareScanner/LabwareScanner.tsx"),toConsumableArray=__webpack_require__("./node_modules/babel-preset-react-app/node_modules/@babel/runtime/helpers/esm/toConsumableArray.js"),motion=__webpack_require__("./node_modules/framer-motion/dist/es/render/dom/motion.mjs"),MutedText=__webpack_require__("./src/components/MutedText.tsx"),LockIcon=__webpack_require__("./src/components/icons/LockIcon.tsx"),react_table=__webpack_require__("./node_modules/react-table/index.js"),Table=__webpack_require__("./src/components/Table.tsx"),jsx_runtime=__webpack_require__("./node_modules/react/jsx-runtime.js"),DataTableComponent=function DataTableComponent(_ref,ref){var columns=_ref.columns,data=_ref.data,defaultSort=_ref.defaultSort,_ref$sortable=_ref.sortable,sortable=void 0!==_ref$sortable&&_ref$sortable,_ref$fixedHeader=_ref.fixedHeader,fixedHeader=void 0!==_ref$fixedHeader&&_ref$fixedHeader,cellClassName=_ref.cellClassName,memoedColumns=react.useMemo((function(){return columns}),[columns]),memoedData=react.useMemo((function(){return data}),[data]),plugins=[],initialState={};sortable&&(plugins.push(react_table.useSortBy),defaultSort&&(initialState.sortBy=defaultSort));var instance=react_table.useTable.apply(void 0,[{columns:memoedColumns,data:memoedData,initialState:initialState}].concat(plugins)),getTableProps=instance.getTableProps,getTableBodyProps=instance.getTableBodyProps,headerGroups=instance.headerGroups,rows=instance.rows,prepareRow=instance.prepareRow;return instance.download=function(){return rows.map((function(row){return prepareRow(row),row.cells.map((function(cell){return cell.value instanceof Date?cell.value.toLocaleDateString():cell.value}))}))},(0,react.useImperativeHandle)(ref,(function(){return instance.download()})),(0,jsx_runtime.jsxs)(Table.ZP,(0,objectSpread2.Z)((0,objectSpread2.Z)({},getTableProps()),{},{children:[(0,jsx_runtime.jsx)(Table.ss,{fixed:fixedHeader,children:headerGroups.map((function(headerGroup,indx){return(0,react.createElement)("tr",(0,objectSpread2.Z)((0,objectSpread2.Z)({},headerGroup.getHeaderGroupProps()),{},{key:indx}),headerGroup.headers.map((function(column){return(0,jsx_runtime.jsxs)(Table.xD,(0,objectSpread2.Z)((0,objectSpread2.Z)({allCapital:column.allCapital},column.getHeaderProps(sortable?column.getSortByToggleProps():void 0)),{},{children:[column.render("Header"),column.isSorted?column.isSortedDesc?(0,jsx_runtime.jsx)("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 20 20",fill:"currentColor",className:"inline-block h-4 w-4",children:(0,jsx_runtime.jsx)("path",{fillRule:"evenodd",d:"M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z",clipRule:"evenodd"})}):(0,jsx_runtime.jsx)("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 20 20",fill:"currentColor",className:"inline-block h-4 w-4",children:(0,jsx_runtime.jsx)("path",{fillRule:"evenodd",d:"M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z",clipRule:"evenodd"})}):""]}))})))}))}),(0,jsx_runtime.jsx)(Table.RM,(0,objectSpread2.Z)((0,objectSpread2.Z)({},getTableBodyProps()),{},{children:rows.map((function(row){return prepareRow(row),(0,jsx_runtime.jsx)(motion.E.tr,(0,objectSpread2.Z)((0,objectSpread2.Z)({initial:{x:-20,opacity:0},animate:{x:0,opacity:1}},row.getRowProps()),{},{children:row.cells.map((function(cell,indx){return(0,react.createElement)(Table.pj,(0,objectSpread2.Z)((0,objectSpread2.Z)({className:cellClassName},cell.getCellProps()),{},{key:row.index+","+indx}),cell.render("Cell"))}))}))}))}))]}))},components_DataTable=react.forwardRef(DataTableComponent),RemoveButton=__webpack_require__("./src/components/buttons/RemoveButton.tsx"),labwareColumns=__webpack_require__("./src/components/dataTableColumns/labwareColumns.tsx"),LabwareScanPanel=function LabwareScanPanel(_ref){var columns=_ref.columns,onRemove=_ref.onRemove,_useLabwareContext=(0,LabwareScanner.v)(),labwares=_useLabwareContext.labwares,removeLabware=_useLabwareContext.removeLabware,locked=_useLabwareContext.locked,enableFlaggedLabwareCheck=_useLabwareContext.enableFlaggedLabwareCheck,data=react.useMemo((function(){return labwares}),[labwares]),columnsToDisplay=react.useMemo((function(){return columns}),[columns]),removeLabwareColumn=react.useMemo((function(){return{Header:"",id:"actions",Cell:function Cell(_ref2){var row=_ref2.row;return locked?(0,jsx_runtime.jsx)(LockIcon.Z,{className:"block m-2 h-5 w-5 text-gray-800"}):(0,jsx_runtime.jsx)(RemoveButton.Z,{type:"button",onClick:function onClick(){row.original.barcode&&(removeLabware(row.original.barcode),null==onRemove||onRemove(row.original))}})}}}),[locked,removeLabware,onRemove]),allColumns=react.useMemo((function(){return[].concat(enableFlaggedLabwareCheck?(0,toConsumableArray.Z)(columnsToDisplay.map((function(c){return"barcode"===c.id?labwareColumns.Z.flaggedBarcode():c}))):(0,toConsumableArray.Z)(columnsToDisplay),[removeLabwareColumn])}),[columnsToDisplay,removeLabwareColumn,enableFlaggedLabwareCheck]);return(0,jsx_runtime.jsxs)("div",{children:[0===labwares.length&&(0,jsx_runtime.jsx)(MutedText.Z,{children:"Scan a piece of labware to get started"}),labwares.length>0&&(0,jsx_runtime.jsx)(motion.E.div,{initial:{opacity:0,y:-50},animate:{opacity:1,y:0},className:"mt-3",children:(0,jsx_runtime.jsx)(components_DataTable,{columns:allColumns,data:data})})]})},labwareScanPanel_LabwareScanPanel=LabwareScanPanel;try{LabwareScanPanel.displayName="LabwareScanPanel",LabwareScanPanel.__docgenInfo={description:"",displayName:"LabwareScanPanel",props:{columns:{defaultValue:null,description:"The list of columns to display in the table",name:"columns",required:!0,type:{name:"Column<LabwareFieldsFragment>[]"}},onRemove:{defaultValue:null,description:"",name:"onRemove",required:!1,type:{name:"((labware: LabwareFlaggedFieldsFragment) => void)"}}}},"undefined"!=typeof STORYBOOK_REACT_CLASSES&&(STORYBOOK_REACT_CLASSES["src/components/labwareScanPanel/LabwareScanPanel.tsx#LabwareScanPanel"]={docgenInfo:LabwareScanPanel.__docgenInfo,name:"LabwareScanPanel",path:"src/components/labwareScanPanel/LabwareScanPanel.tsx#LabwareScanPanel"})}catch(__react_docgen_typescript_loader_error){}var dataTableColumns=__webpack_require__("./src/components/dataTableColumns/index.ts");function LabwareScannerSlotsTable(){var _useLabwareContext=(0,LabwareScanner.v)(),labwares=_useLabwareContext.labwares,removeLabware=_useLabwareContext.removeLabware,locked=_useLabwareContext.locked;return(0,jsx_runtime.jsx)("div",{children:labwares.length>0&&(0,jsx_runtime.jsx)(motion.E.div,{initial:{opacity:0,y:-50},animate:{opacity:1,y:0},className:"mt-3",children:(0,jsx_runtime.jsxs)(Table.ZP,{children:[(0,jsx_runtime.jsx)(Table.ss,{children:(0,jsx_runtime.jsxs)("tr",{children:[(0,jsx_runtime.jsx)(Table.xD,{children:"Address"}),(0,jsx_runtime.jsx)(Table.xD,{children:"Tissue Type"}),(0,jsx_runtime.jsx)(Table.xD,{children:"Spatial Location"}),(0,jsx_runtime.jsx)(Table.xD,{})]})}),(0,jsx_runtime.jsx)(Table.RM,{children:labwares.flatMap((function(lw){return lw.slots.map((function(slot,i){return(0,jsx_runtime.jsxs)("tr",{children:[(0,jsx_runtime.jsx)(Table.pj,{children:slot.address}),(0,jsx_runtime.jsx)(Table.pj,{children:(0,dataTableColumns.F)(slot,(function(sample){return sample.tissue.spatialLocation.tissueType.name}))}),(0,jsx_runtime.jsx)(Table.pj,{children:(0,dataTableColumns.F)(slot,(function(sample){return String(sample.tissue.spatialLocation.code)}))}),0===i&&(0,jsx_runtime.jsx)(Table.pj,{rowSpan:lw.labwareType.numRows*lw.labwareType.numColumns,children:locked?(0,jsx_runtime.jsx)(LockIcon.Z,{className:"block m-2 h-5 w-5 text-gray-800"}):(0,jsx_runtime.jsx)(RemoveButton.Z,{type:"button",onClick:function onClick(){return removeLabware(lw.barcode)}})})]},lw.barcode+slot.address)}))}))})]})})})}try{LabwareScannerSlotsTable.displayName="LabwareScannerSlotsTable",LabwareScannerSlotsTable.__docgenInfo={description:"Table that shows all slots in a Labware. Can only be used within a {@link LabwareScanner }.\nUnfortunately doesn't use ReactTable as that doesn't support a way to use {@code rowSpan}s, which we need here.",displayName:"LabwareScannerSlotsTable",props:{}},"undefined"!=typeof STORYBOOK_REACT_CLASSES&&(STORYBOOK_REACT_CLASSES["src/components/labwareScanner/LabwareScannerSlotsTable.tsx#LabwareScannerSlotsTable"]={docgenInfo:LabwareScannerSlotsTable.__docgenInfo,name:"LabwareScannerSlotsTable",path:"src/components/labwareScanner/LabwareScannerSlotsTable.tsx#LabwareScannerSlotsTable"})}catch(__react_docgen_typescript_loader_error){}var LabwareScanner_stories={title:"LabwareScanner",component:LabwareScanner.Z},LabwareScannerList=function LabwareScannerList(args){return(0,jsx_runtime.jsx)(LabwareScanner.Z,(0,objectSpread2.Z)((0,objectSpread2.Z)({},args),{},{children:(0,jsx_runtime.jsx)(List,{})}))},List=function List(){var _useLabwareContext=(0,LabwareScanner.v)(),labwares=_useLabwareContext.labwares,removeLabware=_useLabwareContext.removeLabware;return(0,jsx_runtime.jsx)("ul",{children:labwares.map((function(lw){return(0,jsx_runtime.jsxs)("li",{children:[lw.barcode," ",(0,jsx_runtime.jsx)("button",{onClick:function onClick(){return removeLabware(lw.barcode)},className:"text-red-500 font-bold underline",children:"Remove"})]})}))})},LabwareScannerTable=function LabwareScannerTable(args){return(0,jsx_runtime.jsx)(LabwareScanner.Z,(0,objectSpread2.Z)((0,objectSpread2.Z)({},args),{},{children:(0,jsx_runtime.jsx)(labwareScanPanel_LabwareScanPanel,{columns:[labwareColumns.Z.barcode(),labwareColumns.Z.externalName(),labwareColumns.Z.labwareType()]})}))},LabwareScannerSlotsTableStory=function LabwareScannerSlotsTableStory(args){return(0,jsx_runtime.jsx)(LabwareScanner.Z,(0,objectSpread2.Z)((0,objectSpread2.Z)({},args),{},{children:(0,jsx_runtime.jsx)(LabwareScannerSlotsTable,{})}))};LabwareScannerList.parameters={...LabwareScannerList.parameters,docs:{...LabwareScannerList.parameters?.docs,source:{originalSource:"args => {\n  return <LabwareScanner {...args}>\n      <List />\n    </LabwareScanner>;\n}",...LabwareScannerList.parameters?.docs?.source}}},LabwareScannerTable.parameters={...LabwareScannerTable.parameters,docs:{...LabwareScannerTable.parameters?.docs,source:{originalSource:"args => {\n  return <LabwareScanner {...args}>\n      <LabwareScanPanel columns={[columns.barcode(), columns.externalName(), columns.labwareType()]} />\n    </LabwareScanner>;\n}",...LabwareScannerTable.parameters?.docs?.source}}},LabwareScannerSlotsTableStory.parameters={...LabwareScannerSlotsTableStory.parameters,docs:{...LabwareScannerSlotsTableStory.parameters?.docs,source:{originalSource:"args => {\n  return <LabwareScanner {...args}>\n      <LabwareScannerSlotsTable />\n    </LabwareScanner>;\n}",...LabwareScannerSlotsTableStory.parameters?.docs?.source}}};const __namedExportsOrder=["LabwareScannerList","LabwareScannerTable","LabwareScannerSlotsTableStory"]},"./src/components/icons/BarcodeIcon.tsx":function(__unused_webpack_module,__webpack_exports__,__webpack_require__){var _home_runner_work_stan_client_stan_client_node_modules_babel_preset_react_app_node_modules_babel_runtime_helpers_esm_objectSpread2_js__WEBPACK_IMPORTED_MODULE_2__=__webpack_require__("./node_modules/babel-preset-react-app/node_modules/@babel/runtime/helpers/esm/objectSpread2.js"),react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__=(__webpack_require__("./node_modules/react/index.js"),__webpack_require__("./node_modules/react/jsx-runtime.js")),BarcodeIcon=function BarcodeIcon(props){return(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)("svg",(0,_home_runner_work_stan_client_stan_client_node_modules_babel_preset_react_app_node_modules_babel_runtime_helpers_esm_objectSpread2_js__WEBPACK_IMPORTED_MODULE_2__.Z)((0,_home_runner_work_stan_client_stan_client_node_modules_babel_preset_react_app_node_modules_babel_runtime_helpers_esm_objectSpread2_js__WEBPACK_IMPORTED_MODULE_2__.Z)({xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor"},props),{},{children:(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"})}))};__webpack_exports__.Z=BarcodeIcon;try{BarcodeIcon.displayName="BarcodeIcon",BarcodeIcon.__docgenInfo={description:"Barcode SVG icon",displayName:"BarcodeIcon",props:{}},"undefined"!=typeof STORYBOOK_REACT_CLASSES&&(STORYBOOK_REACT_CLASSES["src/components/icons/BarcodeIcon.tsx#BarcodeIcon"]={docgenInfo:BarcodeIcon.__docgenInfo,name:"BarcodeIcon",path:"src/components/icons/BarcodeIcon.tsx#BarcodeIcon"})}catch(__react_docgen_typescript_loader_error){}},"./src/components/icons/FlagIcon.tsx":function(__unused_webpack_module,__webpack_exports__,__webpack_require__){var _home_runner_work_stan_client_stan_client_node_modules_babel_preset_react_app_node_modules_babel_runtime_helpers_esm_objectSpread2_js__WEBPACK_IMPORTED_MODULE_2__=__webpack_require__("./node_modules/babel-preset-react-app/node_modules/@babel/runtime/helpers/esm/objectSpread2.js"),react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__=(__webpack_require__("./node_modules/react/index.js"),__webpack_require__("./node_modules/react/jsx-runtime.js")),FlagIcon=function FlagIcon(props){var _props$height,_ref;return(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)("svg",(0,_home_runner_work_stan_client_stan_client_node_modules_babel_preset_react_app_node_modules_babel_runtime_helpers_esm_objectSpread2_js__WEBPACK_IMPORTED_MODULE_2__.Z)((0,_home_runner_work_stan_client_stan_client_node_modules_babel_preset_react_app_node_modules_babel_runtime_helpers_esm_objectSpread2_js__WEBPACK_IMPORTED_MODULE_2__.Z)({"data-testid":"flag-icon",xmlns:"http://www.w3.org/2000/svg",height:"".concat(null!==(_props$height=props.height)&&void 0!==_props$height?_props$height:"24px"),viewBox:"0 0 20 20",fill:"currentColor",className:null!==(_ref="w-5 h-5 "+props.className)&&void 0!==_ref?_ref:""},props),{},{children:[(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)("path",{d:"M0 0h24v24H0V0z",fill:"none",clipRule:"evenodd"}),(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)("path",{d:"M12.36 6l.4 2H18v6h-3.36l-.4-2H7V6h5.36M14 4H5v17h2v-7h5.6l.4 2h7V6h-5.6L14 4z",clipRule:"evenodd"})]}))};__webpack_exports__.Z=FlagIcon;try{FlagIcon.displayName="FlagIcon",FlagIcon.__docgenInfo={description:"",displayName:"FlagIcon",props:{}},"undefined"!=typeof STORYBOOK_REACT_CLASSES&&(STORYBOOK_REACT_CLASSES["src/components/icons/FlagIcon.tsx#FlagIcon"]={docgenInfo:FlagIcon.__docgenInfo,name:"FlagIcon",path:"src/components/icons/FlagIcon.tsx#FlagIcon"})}catch(__react_docgen_typescript_loader_error){}},"./src/lib/helpers/labwareHelper.ts":function(__unused_webpack_module,__webpack_exports__,__webpack_require__){__webpack_require__.d(__webpack_exports__,{Bx:function(){return sortDownRight},Xt:function(){return getRowIndex},av:function(){return getColumnIndex},pZ:function(){return convertLabwareToFlaggedLabware}});var _home_runner_work_stan_client_stan_client_node_modules_babel_preset_react_app_node_modules_babel_runtime_helpers_esm_objectSpread2_js__WEBPACK_IMPORTED_MODULE_4__=__webpack_require__("./node_modules/babel-preset-react-app/node_modules/@babel/runtime/helpers/esm/objectSpread2.js"),lodash__WEBPACK_IMPORTED_MODULE_2__=(__webpack_require__("./src/types/sdk.ts"),__webpack_require__("./src/lib/helpers.ts"),__webpack_require__("./node_modules/lodash/lodash.js"));__webpack_require__("./src/types/stan.ts");function getRowIndex(address){return address.charCodeAt(0)-"A".charCodeAt(0)+1}function getColumnIndex(address){return parseInt(address.substr(1))}function sortDownRight(addressable){return(0,lodash__WEBPACK_IMPORTED_MODULE_2__.orderBy)(addressable,[function(a){return getColumnIndex(a.address)},function(a){return getRowIndex(a.address)}],["asc","asc"])}var convertLabwareToFlaggedLabware=function convertLabwareToFlaggedLabware(labware){return labware.map((function(lw){return(0,_home_runner_work_stan_client_stan_client_node_modules_babel_preset_react_app_node_modules_babel_runtime_helpers_esm_objectSpread2_js__WEBPACK_IMPORTED_MODULE_4__.Z)({flagged:!1},lw)}))}},"./src/lib/helpers/slotHelper.ts":function(__unused_webpack_module,__webpack_exports__,__webpack_require__){function findSlotByAddress(slots,address){var slot=maybeFindSlotByAddress(slots,address);if(null==slot)throw new Error("Address ".concat(address," could not be found in slots: ").concat(slots.map((function(slot){return slot.address}))));return slot}function maybeFindSlotByAddress(slots,address){var _slots$find;return null!==(_slots$find=slots.find((function(slot){return slot.address===address})))&&void 0!==_slots$find?_slots$find:null}function filledSlots(slots){return slots.filter(isSlotFilled)}function emptySlots(slots){return slots.filter(isSlotEmpty)}function isSlotEmpty(slot){return 0===slot.samples.length}function isSlotFilled(slot){return!isSlotEmpty(slot)}function hasMultipleSamples(slot){return slot.samples.length>1}__webpack_require__.d(__webpack_exports__,{GZ:function(){return emptySlots},IX:function(){return findSlotByAddress},JI:function(){return filledSlots},aD:function(){return isSlotEmpty},ax:function(){return maybeFindSlotByAddress},kd:function(){return isSlotFilled},qp:function(){return hasMultipleSamples}})}}]);