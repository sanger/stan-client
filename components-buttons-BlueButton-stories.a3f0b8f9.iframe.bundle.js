/*! For license information please see components-buttons-BlueButton-stories.a3f0b8f9.iframe.bundle.js.LICENSE.txt */
(self.webpackChunkclient=self.webpackChunkclient||[]).push([[164],{"./src/components/buttons/BlueButton.stories.tsx":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{"use strict";__webpack_require__.r(__webpack_exports__),__webpack_require__.d(__webpack_exports__,{Primary:()=>Primary,__namedExportsOrder:()=>__namedExportsOrder,default:()=>__WEBPACK_DEFAULT_EXPORT__});__webpack_require__("./node_modules/react/index.js");var _BlueButton__WEBPACK_IMPORTED_MODULE_1__=__webpack_require__("./src/components/buttons/BlueButton.tsx"),react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__=__webpack_require__("./node_modules/react/jsx-runtime.js");const __WEBPACK_DEFAULT_EXPORT__={title:"BlueButton",component:_BlueButton__WEBPACK_IMPORTED_MODULE_1__.A},Primary=(_ref=>{let{children,...args}=_ref;return(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)(_BlueButton__WEBPACK_IMPORTED_MODULE_1__.A,{...args,children})}).bind({});Primary.args={children:"Save"},Primary.parameters={...Primary.parameters,docs:{...Primary.parameters?.docs,source:{originalSource:"({\n  children,\n  ...args\n}) => <BlueButton {...args}>{children}</BlueButton>",...Primary.parameters?.docs?.source}}};const __namedExportsOrder=["Primary"]},"./node_modules/classnames/index.js":(module,exports)=>{var __WEBPACK_AMD_DEFINE_RESULT__;!function(){"use strict";var hasOwn={}.hasOwnProperty;function classNames(){for(var classes="",i=0;i<arguments.length;i++){var arg=arguments[i];arg&&(classes=appendClass(classes,parseValue(arg)))}return classes}function parseValue(arg){if("string"==typeof arg||"number"==typeof arg)return arg;if("object"!=typeof arg)return"";if(Array.isArray(arg))return classNames.apply(null,arg);if(arg.toString!==Object.prototype.toString&&!arg.toString.toString().includes("[native code]"))return arg.toString();var classes="";for(var key in arg)hasOwn.call(arg,key)&&arg[key]&&(classes=appendClass(classes,key));return classes}function appendClass(value,newClass){return newClass?value?value+" "+newClass:value+newClass:value}module.exports?(classNames.default=classNames,module.exports=classNames):void 0===(__WEBPACK_AMD_DEFINE_RESULT__=function(){return classNames}.apply(exports,[]))||(module.exports=__WEBPACK_AMD_DEFINE_RESULT__)}()},"./src/components/buttons/BlueButton.tsx":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{"use strict";__webpack_require__.d(__webpack_exports__,{A:()=>__WEBPACK_DEFAULT_EXPORT__});__webpack_require__("./node_modules/react/index.js");var _Button__WEBPACK_IMPORTED_MODULE_1__=__webpack_require__("./src/components/buttons/Button.tsx"),classnames__WEBPACK_IMPORTED_MODULE_2__=__webpack_require__("./node_modules/classnames/index.js"),classnames__WEBPACK_IMPORTED_MODULE_2___default=__webpack_require__.n(classnames__WEBPACK_IMPORTED_MODULE_2__),react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__=__webpack_require__("./node_modules/react/jsx-runtime.js");const BlueButton=_ref=>{let{children,className,action="primary",miniButton,...rest}=_ref;const buttonClasses=classnames__WEBPACK_IMPORTED_MODULE_2___default()({"text-white bg-sdb-400 shadow-sm hover:bg-sdb focus:border-sdb focus:shadow-outline-sdb active:bg-sdb-600":"primary"===action,"text-sdb-400 border border-sdb-400 shadow-sm bg-transparent hover:bg-gray-100 focus:border-sdb-400 focus:shadow-outline-sdb active:bg-gray-200":"secondary"===action,"text-sdb-400 underline bg-white hover:bg-gray-100 focus:border-sdb-400 focus:shadow-outline-sdb active:bg-gray-200":"tertiary"===action},className);return(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)(_Button__WEBPACK_IMPORTED_MODULE_1__.A,{...rest,className:buttonClasses,miniButton,children})},__WEBPACK_DEFAULT_EXPORT__=BlueButton;try{BlueButton.displayName="BlueButton",BlueButton.__docgenInfo={description:"",displayName:"BlueButton",props:{loading:{defaultValue:null,description:"",name:"loading",required:!1,type:{name:"boolean"}},action:{defaultValue:{value:"primary"},description:"",name:"action",required:!1,type:{name:"enum",value:[{value:'"primary"'},{value:'"secondary"'},{value:'"tertiary"'}]}},miniButton:{defaultValue:null,description:"",name:"miniButton",required:!1,type:{name:"boolean"}}}},"undefined"!=typeof STORYBOOK_REACT_CLASSES&&(STORYBOOK_REACT_CLASSES["src/components/buttons/BlueButton.tsx#BlueButton"]={docgenInfo:BlueButton.__docgenInfo,name:"BlueButton",path:"src/components/buttons/BlueButton.tsx#BlueButton"})}catch(__react_docgen_typescript_loader_error){}},"./src/components/buttons/Button.tsx":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{"use strict";__webpack_require__.d(__webpack_exports__,{A:()=>__WEBPACK_DEFAULT_EXPORT__});__webpack_require__("./node_modules/react/index.js");var classnames__WEBPACK_IMPORTED_MODULE_1__=__webpack_require__("./node_modules/classnames/index.js"),classnames__WEBPACK_IMPORTED_MODULE_1___default=__webpack_require__.n(classnames__WEBPACK_IMPORTED_MODULE_1__),_icons_LoadingSpinner__WEBPACK_IMPORTED_MODULE_2__=__webpack_require__("./src/components/icons/LoadingSpinner.tsx"),react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__=__webpack_require__("./node_modules/react/jsx-runtime.js");const Button=_ref=>{let{children,disabled,className,loading,miniButton,...rest}=_ref;const width=miniButton?"w-20":"w-full sm:mt-0 sm:w-auto",buttonClasses=classnames__WEBPACK_IMPORTED_MODULE_1___default()("sm:text-sm inline-flex justify-center rounded-md border border-transparent px-4 py-2 text-base font-medium focus:outline-none focus:ring-2 focus:ring-offset-2",{"cursor-not-allowed opacity-50":disabled||loading},className,width);return(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsxs)("button",{...rest,disabled,className:buttonClasses,children:[children,loading&&(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)("span",{className:"ml-3 -mr-1",children:(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)(_icons_LoadingSpinner__WEBPACK_IMPORTED_MODULE_2__.A,{})})]})},__WEBPACK_DEFAULT_EXPORT__=Button;try{Button.displayName="Button",Button.__docgenInfo={description:"Not to be used in the UI. Here to provide some good defaults for building other buttons.",displayName:"Button",props:{loading:{defaultValue:null,description:"",name:"loading",required:!1,type:{name:"boolean"}},action:{defaultValue:null,description:"",name:"action",required:!1,type:{name:"enum",value:[{value:'"primary"'},{value:'"secondary"'},{value:'"tertiary"'}]}},miniButton:{defaultValue:null,description:"",name:"miniButton",required:!1,type:{name:"boolean"}}}},"undefined"!=typeof STORYBOOK_REACT_CLASSES&&(STORYBOOK_REACT_CLASSES["src/components/buttons/Button.tsx#Button"]={docgenInfo:Button.__docgenInfo,name:"Button",path:"src/components/buttons/Button.tsx#Button"})}catch(__react_docgen_typescript_loader_error){}},"./src/components/icons/LoadingSpinner.tsx":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{"use strict";__webpack_require__.d(__webpack_exports__,{A:()=>__WEBPACK_DEFAULT_EXPORT__});__webpack_require__("./node_modules/react/index.js");var classnames__WEBPACK_IMPORTED_MODULE_1__=__webpack_require__("./node_modules/classnames/index.js"),classnames__WEBPACK_IMPORTED_MODULE_1___default=__webpack_require__.n(classnames__WEBPACK_IMPORTED_MODULE_1__),react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__=__webpack_require__("./node_modules/react/jsx-runtime.js");function LoadingSpinner(_ref){let{className}=_ref;const svgClasses=classnames__WEBPACK_IMPORTED_MODULE_1___default()("animate-spin",{"h-5 w-5 text-sdb":!className},{["".concat(className)]:!!className});return(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsxs)("svg",{className:svgClasses,xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24",children:[(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)("circle",{className:"opacity-25",cx:"12",cy:"12",r:"10",stroke:"currentColor",strokeWidth:"4"}),(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)("path",{className:"opacity-75",fill:"currentColor",d:"M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"})]})}const __WEBPACK_DEFAULT_EXPORT__=LoadingSpinner;try{LoadingSpinner.displayName="LoadingSpinner",LoadingSpinner.__docgenInfo={description:"Renders a spinning h-5 by w-5 Sanger dark-blue loading icon. All classNames can be overridden.",displayName:"LoadingSpinner",props:{}},"undefined"!=typeof STORYBOOK_REACT_CLASSES&&(STORYBOOK_REACT_CLASSES["src/components/icons/LoadingSpinner.tsx#LoadingSpinner"]={docgenInfo:LoadingSpinner.__docgenInfo,name:"LoadingSpinner",path:"src/components/icons/LoadingSpinner.tsx#LoadingSpinner"})}catch(__react_docgen_typescript_loader_error){}},"./node_modules/react/cjs/react-jsx-runtime.production.min.js":(__unused_webpack_module,exports,__webpack_require__)=>{"use strict";var f=__webpack_require__("./node_modules/react/index.js"),k=Symbol.for("react.element"),l=Symbol.for("react.fragment"),m=Object.prototype.hasOwnProperty,n=f.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,p={key:!0,ref:!0,__self:!0,__source:!0};function q(c,a,g){var b,d={},e=null,h=null;for(b in void 0!==g&&(e=""+g),void 0!==a.key&&(e=""+a.key),void 0!==a.ref&&(h=a.ref),a)m.call(a,b)&&!p.hasOwnProperty(b)&&(d[b]=a[b]);if(c&&c.defaultProps)for(b in a=c.defaultProps)void 0===d[b]&&(d[b]=a[b]);return{$$typeof:k,type:c,key:e,ref:h,props:d,_owner:n.current}}exports.Fragment=l,exports.jsx=q,exports.jsxs=q},"./node_modules/react/jsx-runtime.js":(module,__unused_webpack_exports,__webpack_require__)=>{"use strict";module.exports=__webpack_require__("./node_modules/react/cjs/react-jsx-runtime.production.min.js")}}]);