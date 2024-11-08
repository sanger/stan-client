/*! For license information please see components-scanInput-ScanInput-stories.02ff59f9.iframe.bundle.js.LICENSE.txt */
(self.webpackChunkclient=self.webpackChunkclient||[]).push([[915],{"./src/components/scanInput/ScanInput.stories.tsx":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{"use strict";__webpack_require__.r(__webpack_exports__),__webpack_require__.d(__webpack_exports__,{WithAlertCallback:()=>WithAlertCallback,__namedExportsOrder:()=>__namedExportsOrder,default:()=>__WEBPACK_DEFAULT_EXPORT__});__webpack_require__("./node_modules/react/index.js");var _ScanInput__WEBPACK_IMPORTED_MODULE_1__=__webpack_require__("./src/components/scanInput/ScanInput.tsx"),react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__=__webpack_require__("./node_modules/react/jsx-runtime.js");const __WEBPACK_DEFAULT_EXPORT__={title:"ScanInput",component:_ScanInput__WEBPACK_IMPORTED_MODULE_1__.A},WithAlertCallback=(args=>(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)(_ScanInput__WEBPACK_IMPORTED_MODULE_1__.A,{...args})).bind({});WithAlertCallback.args={onScan:value=>alert(`"${value}" scanned`)},WithAlertCallback.parameters={...WithAlertCallback.parameters,docs:{...WithAlertCallback.parameters?.docs,source:{originalSource:"args => <ScanInput {...args} />",...WithAlertCallback.parameters?.docs?.source}}};const __namedExportsOrder=["WithAlertCallback"]},"./node_modules/classnames/index.js":(module,exports)=>{var __WEBPACK_AMD_DEFINE_RESULT__;!function(){"use strict";var hasOwn={}.hasOwnProperty;function classNames(){for(var classes="",i=0;i<arguments.length;i++){var arg=arguments[i];arg&&(classes=appendClass(classes,parseValue(arg)))}return classes}function parseValue(arg){if("string"==typeof arg||"number"==typeof arg)return arg;if("object"!=typeof arg)return"";if(Array.isArray(arg))return classNames.apply(null,arg);if(arg.toString!==Object.prototype.toString&&!arg.toString.toString().includes("[native code]"))return arg.toString();var classes="";for(var key in arg)hasOwn.call(arg,key)&&arg[key]&&(classes=appendClass(classes,key));return classes}function appendClass(value,newClass){return newClass?value?value+" "+newClass:value+newClass:value}module.exports?(classNames.default=classNames,module.exports=classNames):void 0===(__WEBPACK_AMD_DEFINE_RESULT__=function(){return classNames}.apply(exports,[]))||(module.exports=__WEBPACK_AMD_DEFINE_RESULT__)}()},"./src/components/Modal.tsx":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{"use strict";__webpack_require__.d(__webpack_exports__,{Ay:()=>__WEBPACK_DEFAULT_EXPORT__,cw:()=>ModalBody,jl:()=>ModalFooter,rQ:()=>ModalHeader});__webpack_require__("./node_modules/react/index.js");var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__=__webpack_require__("./node_modules/react/jsx-runtime.js");const Modal=_ref=>{let{children,show}=_ref;return show?(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)("div",{className:"fixed z-20 inset-0 overflow-y-auto",children:(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)("div",{className:"flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block xl:p-0",children:[(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)("div",{className:"fixed inset-0 transition-opacity","aria-hidden":"true",children:(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)("div",{className:"absolute inset-0 bg-gray-500 opacity-75"})}),(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)("span",{className:"hidden sm:inline-block sm:align-middle sm:h-screen","aria-hidden":"true",children:"​"}),(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)("div",{className:"inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-screen-md sm:w-full",role:"dialog","aria-modal":"true","aria-labelledby":"modal-headline",children})]})}):null},__WEBPACK_DEFAULT_EXPORT__=Modal,ModalHeader=_ref2=>{let{children}=_ref2;return(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)("h3",{className:"border-b-2 border-gray-200 px-4 pt-5 pb-4 sm:p-6 sm:pb-4 bg-gray-100 text-lg leading-6 font-medium text-gray-900",id:"modal-headline",children})},ModalBody=_ref3=>{let{children}=_ref3;return(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)("div",{className:"bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4",children})},ModalFooter=_ref4=>{let{children}=_ref4;return(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)("div",{className:"bg-gray-100 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse",children})};try{Modal.displayName="Modal",Modal.__docgenInfo={description:"",displayName:"Modal",props:{show:{defaultValue:null,description:"",name:"show",required:!1,type:{name:"boolean"}}}},"undefined"!=typeof STORYBOOK_REACT_CLASSES&&(STORYBOOK_REACT_CLASSES["src/components/Modal.tsx#Modal"]={docgenInfo:Modal.__docgenInfo,name:"Modal",path:"src/components/Modal.tsx#Modal"})}catch(__react_docgen_typescript_loader_error){}try{ModalHeader.displayName="ModalHeader",ModalHeader.__docgenInfo={description:"",displayName:"ModalHeader",props:{show:{defaultValue:null,description:"",name:"show",required:!1,type:{name:"boolean"}}}},"undefined"!=typeof STORYBOOK_REACT_CLASSES&&(STORYBOOK_REACT_CLASSES["src/components/Modal.tsx#ModalHeader"]={docgenInfo:ModalHeader.__docgenInfo,name:"ModalHeader",path:"src/components/Modal.tsx#ModalHeader"})}catch(__react_docgen_typescript_loader_error){}try{ModalBody.displayName="ModalBody",ModalBody.__docgenInfo={description:"",displayName:"ModalBody",props:{show:{defaultValue:null,description:"",name:"show",required:!1,type:{name:"boolean"}}}},"undefined"!=typeof STORYBOOK_REACT_CLASSES&&(STORYBOOK_REACT_CLASSES["src/components/Modal.tsx#ModalBody"]={docgenInfo:ModalBody.__docgenInfo,name:"ModalBody",path:"src/components/Modal.tsx#ModalBody"})}catch(__react_docgen_typescript_loader_error){}try{ModalFooter.displayName="ModalFooter",ModalFooter.__docgenInfo={description:"",displayName:"ModalFooter",props:{show:{defaultValue:null,description:"",name:"show",required:!1,type:{name:"boolean"}}}},"undefined"!=typeof STORYBOOK_REACT_CLASSES&&(STORYBOOK_REACT_CLASSES["src/components/Modal.tsx#ModalFooter"]={docgenInfo:ModalFooter.__docgenInfo,name:"ModalFooter",path:"src/components/Modal.tsx#ModalFooter"})}catch(__react_docgen_typescript_loader_error){}},"./src/components/Pill.tsx":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{"use strict";__webpack_require__.d(__webpack_exports__,{A:()=>__WEBPACK_DEFAULT_EXPORT__});__webpack_require__("./node_modules/react/index.js");var classnames__WEBPACK_IMPORTED_MODULE_1__=__webpack_require__("./node_modules/classnames/index.js"),classnames__WEBPACK_IMPORTED_MODULE_1___default=__webpack_require__.n(classnames__WEBPACK_IMPORTED_MODULE_1__),react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__=__webpack_require__("./node_modules/react/jsx-runtime.js");const Pill=_ref=>{let{color,children,className}=_ref;const spanClassName=classnames__WEBPACK_IMPORTED_MODULE_1___default()({"bg-sp text-gray-100":"pink"===color,"bg-sdb-300 text-gray-100":"blue"===color},"px-2 rounded-full font-semibold text-sm",className);return(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)("span",{className:spanClassName,children})},__WEBPACK_DEFAULT_EXPORT__=Pill;try{Pill.displayName="Pill",Pill.__docgenInfo={description:"",displayName:"Pill",props:{color:{defaultValue:null,description:"",name:"color",required:!0,type:{name:"enum",value:[{value:'"pink"'},{value:'"blue"'}]}},className:{defaultValue:null,description:"",name:"className",required:!1,type:{name:"string"}}}},"undefined"!=typeof STORYBOOK_REACT_CLASSES&&(STORYBOOK_REACT_CLASSES["src/components/Pill.tsx#Pill"]={docgenInfo:Pill.__docgenInfo,name:"Pill",path:"src/components/Pill.tsx#Pill"})}catch(__react_docgen_typescript_loader_error){}},"./src/components/forms/Label.tsx":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{"use strict";__webpack_require__.d(__webpack_exports__,{A:()=>forms_Label});var react=__webpack_require__("./node_modules/react/index.js"),classnames=__webpack_require__("./node_modules/classnames/index.js"),classnames_default=__webpack_require__.n(classnames),Pill=__webpack_require__("./src/components/Pill.tsx"),jsx_runtime=__webpack_require__("./node_modules/react/jsx-runtime.js");const InfoIcon=props=>(0,jsx_runtime.jsx)("svg",{xmlns:"http://www.w3.org/2000/svg",height:"26",width:"26",fill:"currentColor",...props,"data-testid":"info-icon",children:(0,jsx_runtime.jsx)("path",{d:"M11 17h2v-6h-2Zm1-8q.425 0 .713-.288Q13 8.425 13 8t-.287-.713Q12.425 7 12 7t-.712.287Q11 7.575 11 8t.288.712Q11.575 9 12 9Zm0 13q-2.075 0-3.9-.788-1.825-.787-3.175-2.137-1.35-1.35-2.137-3.175Q2 14.075 2 12t.788-3.9q.787-1.825 2.137-3.175 1.35-1.35 3.175-2.138Q9.925 2 12 2t3.9.787q1.825.788 3.175 2.138 1.35 1.35 2.137 3.175Q22 9.925 22 12t-.788 3.9q-.787 1.825-2.137 3.175-1.35 1.35-3.175 2.137Q14.075 22 12 22Zm0-2q3.35 0 5.675-2.325Q20 15.35 20 12q0-3.35-2.325-5.675Q15.35 4 12 4 8.65 4 6.325 6.325 4 8.65 4 12q0 3.35 2.325 5.675Q8.65 20 12 20Zm0-8Z"})}),icons_InfoIcon=InfoIcon;try{InfoIcon.displayName="InfoIcon",InfoIcon.__docgenInfo={description:"Info SVG icon",displayName:"InfoIcon",props:{}},"undefined"!=typeof STORYBOOK_REACT_CLASSES&&(STORYBOOK_REACT_CLASSES["src/components/icons/InfoIcon.tsx#InfoIcon"]={docgenInfo:InfoIcon.__docgenInfo,name:"InfoIcon",path:"src/components/icons/InfoIcon.tsx#InfoIcon"})}catch(__react_docgen_typescript_loader_error){}const motionVariants={fadeIn:{visible:{opacity:1},hidden:{opacity:0}},fadeInWithLift:{hidden:{opacity:0,y:20},visible:{opacity:1,y:0}},fadeInParent:{visible:{opacity:1,transition:{when:"beforeChildren",staggerChildren:.1}},hidden:{opacity:0,transition:{when:"afterChildren"}}},menuVariants:{hidden:{height:0,transition:{when:"afterChildren",duration:.3}},visible:{height:"auto",opacity:1,transition:{when:"beforeChildren",duration:.2}}},menuItemVariants:{hidden:{opacity:0,transition:{duration:.1}},visible:{opacity:1,transition:{duration:.1}}}};var motion=__webpack_require__("./node_modules/framer-motion/dist/es/render/dom/motion.mjs"),FailIcon=__webpack_require__("./src/components/icons/FailIcon.tsx"),Modal=__webpack_require__("./src/components/Modal.tsx");const Information=_ref=>{let{title,children,className}=_ref;const infoClassName=classnames_default()("relative justify-center align-middle items-center space-x-2",className),[hover,setHover]=react.useState(!1);return(0,jsx_runtime.jsxs)("div",{"data-testid":"info-div",className:infoClassName,onMouseOver:()=>setHover(!0),onMouseLeave:()=>setHover(!1),children:[(0,jsx_runtime.jsx)(icons_InfoIcon,{className:"bg-white inline-block "+(hover?"text-blue-600":"text-blue-400")}),hover&&(0,jsx_runtime.jsx)(motion.P.div,{variants:motionVariants.fadeInWithLift,initial:"hidden",animate:"visible",className:"relative",children:(0,jsx_runtime.jsxs)(Modal.Ay,{show:hover,children:[(0,jsx_runtime.jsxs)(Modal.rQ,{children:[(0,jsx_runtime.jsx)("div",{className:"flex flex-row items-end justify-end",children:(0,jsx_runtime.jsx)(FailIcon.A,{onClick:()=>setHover(!1),className:"w-5 h-5 cursor-pointer hover:text-red-500 text-red-400\n                    }"})}),title&&(0,jsx_runtime.jsx)("div",{children:title})]}),(0,jsx_runtime.jsx)(Modal.cw,{children:(0,jsx_runtime.jsx)("div",{className:"flex flex-col p-1 space-y-2",onMouseLeave:()=>setHover(!1),children})})]})})]})},notifications_Information=Information;try{Information.displayName="Information",Information.__docgenInfo={description:"",displayName:"Information",props:{title:{defaultValue:null,description:"",name:"title",required:!1,type:{name:"string"}}}},"undefined"!=typeof STORYBOOK_REACT_CLASSES&&(STORYBOOK_REACT_CLASSES["src/components/notifications/Information.tsx#Information"]={docgenInfo:Information.__docgenInfo,name:"Information",path:"src/components/notifications/Information.tsx#Information"})}catch(__react_docgen_typescript_loader_error){}const Label=_ref=>{let{name,displayTag,info,children,className,...rest}=_ref;const labelClassName=classnames_default()("block",className);return(0,jsx_runtime.jsxs)("label",{...rest,className:labelClassName,children:[(0,jsx_runtime.jsxs)("span",{className:"text-gray-800 mr-3 flex flex-row gap-x-1",children:[name,info&&(0,jsx_runtime.jsx)(notifications_Information,{title:name,children:info})]}),displayTag&&(0,jsx_runtime.jsx)(Pill.A,{color:"pink",children:displayTag}),children]})},forms_Label=Label;try{Label.displayName="Label",Label.__docgenInfo={description:"",displayName:"Label",props:{name:{defaultValue:null,description:"",name:"name",required:!0,type:{name:"string"}},displayTag:{defaultValue:null,description:"",name:"displayTag",required:!1,type:{name:"string"}},info:{defaultValue:null,description:"",name:"info",required:!1,type:{name:"ReactNode"}}}},"undefined"!=typeof STORYBOOK_REACT_CLASSES&&(STORYBOOK_REACT_CLASSES["src/components/forms/Label.tsx#Label"]={docgenInfo:Label.__docgenInfo,name:"Label",path:"src/components/forms/Label.tsx#Label"})}catch(__react_docgen_typescript_loader_error){}},"./src/components/icons/BarcodeIcon.tsx":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{"use strict";__webpack_require__.d(__webpack_exports__,{A:()=>__WEBPACK_DEFAULT_EXPORT__});__webpack_require__("./node_modules/react/index.js");var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__=__webpack_require__("./node_modules/react/jsx-runtime.js");const BarcodeIcon=props=>(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)("svg",{xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",...props,children:(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"})}),__WEBPACK_DEFAULT_EXPORT__=BarcodeIcon;try{BarcodeIcon.displayName="BarcodeIcon",BarcodeIcon.__docgenInfo={description:"Barcode SVG icon",displayName:"BarcodeIcon",props:{}},"undefined"!=typeof STORYBOOK_REACT_CLASSES&&(STORYBOOK_REACT_CLASSES["src/components/icons/BarcodeIcon.tsx#BarcodeIcon"]={docgenInfo:BarcodeIcon.__docgenInfo,name:"BarcodeIcon",path:"src/components/icons/BarcodeIcon.tsx#BarcodeIcon"})}catch(__react_docgen_typescript_loader_error){}},"./src/components/icons/FailIcon.tsx":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{"use strict";__webpack_require__.d(__webpack_exports__,{A:()=>FailIcon});__webpack_require__("./node_modules/react/index.js");var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__=__webpack_require__("./node_modules/react/jsx-runtime.js");function FailIcon(props){return(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)("svg",{xmlns:"http://www.w3.org/2000/svg","data-testid":"failIcon",viewBox:"0 0 20 20",fill:"currentColor",...props,children:(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)("path",{fillRule:"evenodd",d:"M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z",clipRule:"evenodd"})})}try{FailIcon.displayName="FailIcon",FailIcon.__docgenInfo={description:"",displayName:"FailIcon",props:{}},"undefined"!=typeof STORYBOOK_REACT_CLASSES&&(STORYBOOK_REACT_CLASSES["src/components/icons/FailIcon.tsx#FailIcon"]={docgenInfo:FailIcon.__docgenInfo,name:"FailIcon",path:"src/components/icons/FailIcon.tsx#FailIcon"})}catch(__react_docgen_typescript_loader_error){}},"./src/components/icons/LockIcon.tsx":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{"use strict";__webpack_require__.d(__webpack_exports__,{A:()=>__WEBPACK_DEFAULT_EXPORT__});__webpack_require__("./node_modules/react/index.js");var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__=__webpack_require__("./node_modules/react/jsx-runtime.js");const LockIcon=props=>(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 20 20",fill:"currentColor",...props,children:(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)("path",{fillRule:"evenodd",d:"M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z",clipRule:"evenodd"})}),__WEBPACK_DEFAULT_EXPORT__=LockIcon;try{LockIcon.displayName="LockIcon",LockIcon.__docgenInfo={description:"Heroicon lock icon",displayName:"LockIcon",props:{}},"undefined"!=typeof STORYBOOK_REACT_CLASSES&&(STORYBOOK_REACT_CLASSES["src/components/icons/LockIcon.tsx#LockIcon"]={docgenInfo:LockIcon.__docgenInfo,name:"LockIcon",path:"src/components/icons/LockIcon.tsx#LockIcon"})}catch(__react_docgen_typescript_loader_error){}},"./src/components/scanInput/ScanInput.tsx":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{"use strict";__webpack_require__.d(__webpack_exports__,{A:()=>__WEBPACK_DEFAULT_EXPORT__});var react__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__("./node_modules/react/index.js"),_icons_BarcodeIcon__WEBPACK_IMPORTED_MODULE_1__=__webpack_require__("./src/components/icons/BarcodeIcon.tsx"),_icons_LockIcon__WEBPACK_IMPORTED_MODULE_2__=__webpack_require__("./src/components/icons/LockIcon.tsx"),classnames__WEBPACK_IMPORTED_MODULE_3__=__webpack_require__("./node_modules/classnames/index.js"),classnames__WEBPACK_IMPORTED_MODULE_3___default=__webpack_require__.n(classnames__WEBPACK_IMPORTED_MODULE_3__),_forms_Label__WEBPACK_IMPORTED_MODULE_4__=__webpack_require__("./src/components/forms/Label.tsx"),formik__WEBPACK_IMPORTED_MODULE_6__=__webpack_require__("./node_modules/formik/dist/formik.esm.js"),react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__=__webpack_require__("./node_modules/react/jsx-runtime.js");const ScanInput=react__WEBPACK_IMPORTED_MODULE_0__.forwardRef(((_ref,ref)=>{let{label,name,type="text",onScan,allowEmptyValue=!1,...inputProps}=_ref;const inputClassNames=classnames__WEBPACK_IMPORTED_MODULE_3___default()({"rounded-r-md":!(null!=inputProps&&inputProps.disabled),"border-r-0 disabled:bg-gray-100":null==inputProps?void 0:inputProps.disabled},"flex-grow-0 focus:ring-sdb-100 focus:border-sdb-100 h-10 block w-full border-gray-300 rounded-none transition duration-150 ease-in-out"),onKeyDownHandler=react__WEBPACK_IMPORTED_MODULE_0__.useCallback((e=>{if(["Tab","Enter"].some((triggerKey=>triggerKey===e.key))){if(e.preventDefault(),""===e.currentTarget.value&&!allowEmptyValue)return;null==onScan||onScan(e.currentTarget.value)}}),[onScan,allowEmptyValue]);return(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsxs)("div",{className:"flex flex-col",children:[label&&(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_forms_Label__WEBPACK_IMPORTED_MODULE_4__.A,{name:label}),(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsxs)("div",{className:"flex rounded-md shadow-sm",children:[(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("span",{className:"inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm",children:(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_icons_BarcodeIcon__WEBPACK_IMPORTED_MODULE_1__.A,{className:"block h-5 w-5"})}),name?(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.Fragment,{children:(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(formik__WEBPACK_IMPORTED_MODULE_6__.D0,{type,"data-testid":"formInput",className:inputClassNames,name,...inputProps,onKeyDown:onKeyDownHandler})}):(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("input",{...inputProps,ref,type,onKeyDown:onKeyDownHandler,className:inputClassNames,"data-testid":"input"}),(null==inputProps?void 0:inputProps.disabled)&&(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("span",{className:"inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-100 transition duration-150 ease-in-out text-sm",children:(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_icons_LockIcon__WEBPACK_IMPORTED_MODULE_2__.A,{className:"block h-5 w-5 text-sp-300 transition duration-150 ease-in-out"})})]})]})})),__WEBPACK_DEFAULT_EXPORT__=ScanInput;try{ScanInput.displayName="ScanInput",ScanInput.__docgenInfo={description:"Input that will call the onScan callback on both `tab` or `enter` (one of which hopefully is what a barcode scanner has setup as its terminal character).",displayName:"ScanInput",props:{name:{defaultValue:null,description:"If name given , display a Formik input otherwise normal",name:"name",required:!1,type:{name:"string"}},label:{defaultValue:null,description:"Label to display, if any",name:"label",required:!1,type:{name:"string"}},type:{defaultValue:{value:"text"},description:"Type of input field, default is 'text'",name:"type",required:!1,type:{name:"string"}},onScan:{defaultValue:null,description:"Callback for when a barcode is scanned into the {@link ScanInput}\n@param value the current value of the input",name:"onScan",required:!1,type:{name:"((value: string) => void)"}},allowEmptyValue:{defaultValue:{value:"false"},description:"Allow empty value in input, so it can be validated from parent component",name:"allowEmptyValue",required:!1,type:{name:"boolean"}}}},"undefined"!=typeof STORYBOOK_REACT_CLASSES&&(STORYBOOK_REACT_CLASSES["src/components/scanInput/ScanInput.tsx#ScanInput"]={docgenInfo:ScanInput.__docgenInfo,name:"ScanInput",path:"src/components/scanInput/ScanInput.tsx#ScanInput"})}catch(__react_docgen_typescript_loader_error){}},"./node_modules/react/cjs/react-jsx-runtime.production.min.js":(__unused_webpack_module,exports,__webpack_require__)=>{"use strict";var f=__webpack_require__("./node_modules/react/index.js"),k=Symbol.for("react.element"),l=Symbol.for("react.fragment"),m=Object.prototype.hasOwnProperty,n=f.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,p={key:!0,ref:!0,__self:!0,__source:!0};function q(c,a,g){var b,d={},e=null,h=null;for(b in void 0!==g&&(e=""+g),void 0!==a.key&&(e=""+a.key),void 0!==a.ref&&(h=a.ref),a)m.call(a,b)&&!p.hasOwnProperty(b)&&(d[b]=a[b]);if(c&&c.defaultProps)for(b in a=c.defaultProps)void 0===d[b]&&(d[b]=a[b]);return{$$typeof:k,type:c,key:e,ref:h,props:d,_owner:n.current}}exports.Fragment=l,exports.jsx=q,exports.jsxs=q},"./node_modules/react/jsx-runtime.js":(module,__unused_webpack_exports,__webpack_require__)=>{"use strict";module.exports=__webpack_require__("./node_modules/react/cjs/react-jsx-runtime.production.min.js")}}]);