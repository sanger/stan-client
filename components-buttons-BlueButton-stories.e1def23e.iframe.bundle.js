/*! For license information please see components-buttons-BlueButton-stories.e1def23e.iframe.bundle.js.LICENSE.txt */
(self.webpackChunkclient=self.webpackChunkclient||[]).push([[489],{"./node_modules/classnames/index.js":function(module,exports){var __WEBPACK_AMD_DEFINE_RESULT__;!function(){"use strict";var hasOwn={}.hasOwnProperty;function classNames(){for(var classes=[],i=0;i<arguments.length;i++){var arg=arguments[i];if(arg){var argType=typeof arg;if("string"===argType||"number"===argType)classes.push(arg);else if(Array.isArray(arg)){if(arg.length){var inner=classNames.apply(null,arg);inner&&classes.push(inner)}}else if("object"===argType)if(arg.toString===Object.prototype.toString)for(var key in arg)hasOwn.call(arg,key)&&arg[key]&&classes.push(key);else classes.push(arg.toString())}}return classes.join(" ")}module.exports?(classNames.default=classNames,module.exports=classNames):void 0===(__WEBPACK_AMD_DEFINE_RESULT__=function(){return classNames}.apply(exports,[]))||(module.exports=__WEBPACK_AMD_DEFINE_RESULT__)}()},"./src/components/buttons/BlueButton.stories.tsx":function(__unused_webpack_module,__webpack_exports__,__webpack_require__){"use strict";__webpack_require__.r(__webpack_exports__),__webpack_require__.d(__webpack_exports__,{Primary:function(){return Primary},__namedExportsOrder:function(){return __namedExportsOrder}});var _home_runner_work_stan_client_stan_client_node_modules_babel_preset_react_app_node_modules_babel_runtime_helpers_esm_objectSpread2_js__WEBPACK_IMPORTED_MODULE_4__=__webpack_require__("./node_modules/babel-preset-react-app/node_modules/@babel/runtime/helpers/esm/objectSpread2.js"),_home_runner_work_stan_client_stan_client_node_modules_babel_preset_react_app_node_modules_babel_runtime_helpers_esm_objectWithoutProperties_js__WEBPACK_IMPORTED_MODULE_3__=__webpack_require__("./node_modules/babel-preset-react-app/node_modules/@babel/runtime/helpers/esm/objectWithoutProperties.js"),_BlueButton__WEBPACK_IMPORTED_MODULE_1__=(__webpack_require__("./node_modules/react/index.js"),__webpack_require__("./src/components/buttons/BlueButton.tsx")),react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__=__webpack_require__("./node_modules/react/jsx-runtime.js"),_excluded=["children"],meta={title:"BlueButton",component:_BlueButton__WEBPACK_IMPORTED_MODULE_1__.Z};__webpack_exports__.default=meta;var Primary=function Template(_ref){var children=_ref.children,args=(0,_home_runner_work_stan_client_stan_client_node_modules_babel_preset_react_app_node_modules_babel_runtime_helpers_esm_objectWithoutProperties_js__WEBPACK_IMPORTED_MODULE_3__.Z)(_ref,_excluded);return(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)(_BlueButton__WEBPACK_IMPORTED_MODULE_1__.Z,(0,_home_runner_work_stan_client_stan_client_node_modules_babel_preset_react_app_node_modules_babel_runtime_helpers_esm_objectSpread2_js__WEBPACK_IMPORTED_MODULE_4__.Z)((0,_home_runner_work_stan_client_stan_client_node_modules_babel_preset_react_app_node_modules_babel_runtime_helpers_esm_objectSpread2_js__WEBPACK_IMPORTED_MODULE_4__.Z)({},args),{},{children:children}))}.bind({});Primary.args={children:"Save"},Primary.parameters=(0,_home_runner_work_stan_client_stan_client_node_modules_babel_preset_react_app_node_modules_babel_runtime_helpers_esm_objectSpread2_js__WEBPACK_IMPORTED_MODULE_4__.Z)({storySource:{source:"({ children, ...args }) => (\n  <BlueButton {...args}>{children}</BlueButton>\n)"}},Primary.parameters);var __namedExportsOrder=["Primary"];try{Meta.displayName="Meta",Meta.__docgenInfo={description:"Metadata to configure the stories for a component.",displayName:"Meta",props:{}},"undefined"!=typeof STORYBOOK_REACT_CLASSES&&(STORYBOOK_REACT_CLASSES["src/components/buttons/BlueButton.stories.tsx#Meta"]={docgenInfo:Meta.__docgenInfo,name:"Meta",path:"src/components/buttons/BlueButton.stories.tsx#Meta"})}catch(__react_docgen_typescript_loader_error){}},"./src/components/buttons/BlueButton.tsx":function(__unused_webpack_module,__webpack_exports__,__webpack_require__){"use strict";var _home_runner_work_stan_client_stan_client_node_modules_babel_preset_react_app_node_modules_babel_runtime_helpers_esm_objectSpread2_js__WEBPACK_IMPORTED_MODULE_5__=__webpack_require__("./node_modules/babel-preset-react-app/node_modules/@babel/runtime/helpers/esm/objectSpread2.js"),_home_runner_work_stan_client_stan_client_node_modules_babel_preset_react_app_node_modules_babel_runtime_helpers_esm_objectWithoutProperties_js__WEBPACK_IMPORTED_MODULE_4__=__webpack_require__("./node_modules/babel-preset-react-app/node_modules/@babel/runtime/helpers/esm/objectWithoutProperties.js"),_Button__WEBPACK_IMPORTED_MODULE_1__=(__webpack_require__("./node_modules/react/index.js"),__webpack_require__("./src/components/buttons/Button.tsx")),classnames__WEBPACK_IMPORTED_MODULE_2__=__webpack_require__("./node_modules/classnames/index.js"),classnames__WEBPACK_IMPORTED_MODULE_2___default=__webpack_require__.n(classnames__WEBPACK_IMPORTED_MODULE_2__),react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__=__webpack_require__("./node_modules/react/jsx-runtime.js"),_excluded=["children","className","action"],BlueButton=function BlueButton(_ref){var children=_ref.children,className=_ref.className,_ref$action=_ref.action,action=void 0===_ref$action?"primary":_ref$action,rest=(0,_home_runner_work_stan_client_stan_client_node_modules_babel_preset_react_app_node_modules_babel_runtime_helpers_esm_objectWithoutProperties_js__WEBPACK_IMPORTED_MODULE_4__.Z)(_ref,_excluded),buttonClasses=classnames__WEBPACK_IMPORTED_MODULE_2___default()({"text-white bg-sdb-400 shadow-sm hover:bg-sdb focus:border-sdb focus:shadow-outline-sdb active:bg-sdb-600":"primary"===action,"text-sdb-400 border border-sdb-400 shadow-sm bg-transparent hover:bg-gray-100 focus:border-sdb-400 focus:shadow-outline-sdb active:bg-gray-200":"secondary"===action,"text-sdb-400 underline bg-white hover:bg-gray-100 focus:border-sdb-400 focus:shadow-outline-sdb active:bg-gray-200":"tertiary"===action},className);return(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)(_Button__WEBPACK_IMPORTED_MODULE_1__.Z,(0,_home_runner_work_stan_client_stan_client_node_modules_babel_preset_react_app_node_modules_babel_runtime_helpers_esm_objectSpread2_js__WEBPACK_IMPORTED_MODULE_5__.Z)((0,_home_runner_work_stan_client_stan_client_node_modules_babel_preset_react_app_node_modules_babel_runtime_helpers_esm_objectSpread2_js__WEBPACK_IMPORTED_MODULE_5__.Z)({},rest),{},{className:buttonClasses,children:children}))};__webpack_exports__.Z=BlueButton;try{BlueButton.displayName="BlueButton",BlueButton.__docgenInfo={description:"",displayName:"BlueButton",props:{loading:{defaultValue:null,description:"",name:"loading",required:!1,type:{name:"boolean"}},action:{defaultValue:{value:"primary"},description:"",name:"action",required:!1,type:{name:"enum",value:[{value:'"primary"'},{value:'"secondary"'},{value:'"tertiary"'}]}}}},"undefined"!=typeof STORYBOOK_REACT_CLASSES&&(STORYBOOK_REACT_CLASSES["src/components/buttons/BlueButton.tsx#BlueButton"]={docgenInfo:BlueButton.__docgenInfo,name:"BlueButton",path:"src/components/buttons/BlueButton.tsx#BlueButton"})}catch(__react_docgen_typescript_loader_error){}},"./src/components/buttons/Button.tsx":function(__unused_webpack_module,__webpack_exports__,__webpack_require__){"use strict";var _home_runner_work_stan_client_stan_client_node_modules_babel_preset_react_app_node_modules_babel_runtime_helpers_esm_objectSpread2_js__WEBPACK_IMPORTED_MODULE_5__=__webpack_require__("./node_modules/babel-preset-react-app/node_modules/@babel/runtime/helpers/esm/objectSpread2.js"),_home_runner_work_stan_client_stan_client_node_modules_babel_preset_react_app_node_modules_babel_runtime_helpers_esm_objectWithoutProperties_js__WEBPACK_IMPORTED_MODULE_4__=__webpack_require__("./node_modules/babel-preset-react-app/node_modules/@babel/runtime/helpers/esm/objectWithoutProperties.js"),classnames__WEBPACK_IMPORTED_MODULE_1__=(__webpack_require__("./node_modules/react/index.js"),__webpack_require__("./node_modules/classnames/index.js")),classnames__WEBPACK_IMPORTED_MODULE_1___default=__webpack_require__.n(classnames__WEBPACK_IMPORTED_MODULE_1__),_icons_LoadingSpinner__WEBPACK_IMPORTED_MODULE_2__=__webpack_require__("./src/components/icons/LoadingSpinner.tsx"),react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__=__webpack_require__("./node_modules/react/jsx-runtime.js"),_excluded=["children","disabled","className","loading"],Button=function Button(_ref){var children=_ref.children,disabled=_ref.disabled,className=_ref.className,loading=_ref.loading,rest=(0,_home_runner_work_stan_client_stan_client_node_modules_babel_preset_react_app_node_modules_babel_runtime_helpers_esm_objectWithoutProperties_js__WEBPACK_IMPORTED_MODULE_4__.Z)(_ref,_excluded),buttonClasses=classnames__WEBPACK_IMPORTED_MODULE_1___default()("w-full inline-flex justify-center rounded-md border border-transparent px-4 py-2 text-base font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 sm:mt-0 sm:w-auto sm:text-sm",{"cursor-not-allowed opacity-50":disabled||loading},className);return(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsxs)("button",(0,_home_runner_work_stan_client_stan_client_node_modules_babel_preset_react_app_node_modules_babel_runtime_helpers_esm_objectSpread2_js__WEBPACK_IMPORTED_MODULE_5__.Z)((0,_home_runner_work_stan_client_stan_client_node_modules_babel_preset_react_app_node_modules_babel_runtime_helpers_esm_objectSpread2_js__WEBPACK_IMPORTED_MODULE_5__.Z)({},rest),{},{disabled:disabled,className:buttonClasses,children:[children,loading&&(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)("span",{className:"ml-3 -mr-1",children:(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)(_icons_LoadingSpinner__WEBPACK_IMPORTED_MODULE_2__.Z,{})})]}))};__webpack_exports__.Z=Button;try{Button.displayName="Button",Button.__docgenInfo={description:"Not to be used in the UI. Here to provide some good defaults for building other buttons.",displayName:"Button",props:{loading:{defaultValue:null,description:"",name:"loading",required:!1,type:{name:"boolean"}},action:{defaultValue:null,description:"",name:"action",required:!1,type:{name:"enum",value:[{value:'"primary"'},{value:'"secondary"'},{value:'"tertiary"'}]}}}},"undefined"!=typeof STORYBOOK_REACT_CLASSES&&(STORYBOOK_REACT_CLASSES["src/components/buttons/Button.tsx#Button"]={docgenInfo:Button.__docgenInfo,name:"Button",path:"src/components/buttons/Button.tsx#Button"})}catch(__react_docgen_typescript_loader_error){}},"./src/components/icons/LoadingSpinner.tsx":function(__unused_webpack_module,__webpack_exports__,__webpack_require__){"use strict";var _home_runner_work_stan_client_stan_client_node_modules_babel_preset_react_app_node_modules_babel_runtime_helpers_esm_defineProperty_js__WEBPACK_IMPORTED_MODULE_3__=__webpack_require__("./node_modules/babel-preset-react-app/node_modules/@babel/runtime/helpers/esm/defineProperty.js"),classnames__WEBPACK_IMPORTED_MODULE_1__=(__webpack_require__("./node_modules/react/index.js"),__webpack_require__("./node_modules/classnames/index.js")),classnames__WEBPACK_IMPORTED_MODULE_1___default=__webpack_require__.n(classnames__WEBPACK_IMPORTED_MODULE_1__),react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__=__webpack_require__("./node_modules/react/jsx-runtime.js");function LoadingSpinner(_ref){var className=_ref.className,svgClasses=classnames__WEBPACK_IMPORTED_MODULE_1___default()("animate-spin",{"h-5 w-5 text-sdb":!className},(0,_home_runner_work_stan_client_stan_client_node_modules_babel_preset_react_app_node_modules_babel_runtime_helpers_esm_defineProperty_js__WEBPACK_IMPORTED_MODULE_3__.Z)({},"".concat(className),!!className));return(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsxs)("svg",{className:svgClasses,xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24",children:[(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)("circle",{className:"opacity-25",cx:"12",cy:"12",r:"10",stroke:"currentColor",strokeWidth:"4"}),(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)("path",{className:"opacity-75",fill:"currentColor",d:"M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"})]})}__webpack_exports__.Z=LoadingSpinner;try{LoadingSpinner.displayName="LoadingSpinner",LoadingSpinner.__docgenInfo={description:"Renders a spinning h-5 by w-5 Sanger dark-blue loading icon. All classNames can be overridden.",displayName:"LoadingSpinner",props:{}},"undefined"!=typeof STORYBOOK_REACT_CLASSES&&(STORYBOOK_REACT_CLASSES["src/components/icons/LoadingSpinner.tsx#LoadingSpinner"]={docgenInfo:LoadingSpinner.__docgenInfo,name:"LoadingSpinner",path:"src/components/icons/LoadingSpinner.tsx#LoadingSpinner"})}catch(__react_docgen_typescript_loader_error){}},"./node_modules/react/cjs/react-jsx-runtime.production.min.js":function(__unused_webpack_module,exports,__webpack_require__){"use strict";__webpack_require__("./node_modules/object-assign/index.js");var f=__webpack_require__("./node_modules/react/index.js"),g=60103;if(exports.Fragment=60107,"function"==typeof Symbol&&Symbol.for){var h=Symbol.for;g=h("react.element"),exports.Fragment=h("react.fragment")}var m=f.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,n=Object.prototype.hasOwnProperty,p={key:!0,ref:!0,__self:!0,__source:!0};function q(c,a,k){var b,d={},e=null,l=null;for(b in void 0!==k&&(e=""+k),void 0!==a.key&&(e=""+a.key),void 0!==a.ref&&(l=a.ref),a)n.call(a,b)&&!p.hasOwnProperty(b)&&(d[b]=a[b]);if(c&&c.defaultProps)for(b in a=c.defaultProps)void 0===d[b]&&(d[b]=a[b]);return{$$typeof:g,type:c,key:e,ref:l,props:d,_owner:m.current}}exports.jsx=q,exports.jsxs=q},"./node_modules/react/jsx-runtime.js":function(module,__unused_webpack_exports,__webpack_require__){"use strict";module.exports=__webpack_require__("./node_modules/react/cjs/react-jsx-runtime.production.min.js")},"./node_modules/babel-preset-react-app/node_modules/@babel/runtime/helpers/esm/objectWithoutProperties.js":function(__unused_webpack___webpack_module__,__webpack_exports__,__webpack_require__){"use strict";function _objectWithoutProperties(source,excluded){if(null==source)return{};var key,i,target=function _objectWithoutPropertiesLoose(source,excluded){if(null==source)return{};var key,i,target={},sourceKeys=Object.keys(source);for(i=0;i<sourceKeys.length;i++)key=sourceKeys[i],excluded.indexOf(key)>=0||(target[key]=source[key]);return target}(source,excluded);if(Object.getOwnPropertySymbols){var sourceSymbolKeys=Object.getOwnPropertySymbols(source);for(i=0;i<sourceSymbolKeys.length;i++)key=sourceSymbolKeys[i],excluded.indexOf(key)>=0||Object.prototype.propertyIsEnumerable.call(source,key)&&(target[key]=source[key])}return target}__webpack_require__.d(__webpack_exports__,{Z:function(){return _objectWithoutProperties}})}}]);