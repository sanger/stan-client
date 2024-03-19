/*! For license information please see components-pagination-Pager-stories.c06e231c.iframe.bundle.js.LICENSE.txt */
(self.webpackChunkclient=self.webpackChunkclient||[]).push([[442],{"./src/components/pagination/Pager.stories.tsx":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{"use strict";__webpack_require__.r(__webpack_exports__),__webpack_require__.d(__webpack_exports__,{WithUsePager:()=>WithUsePager,__namedExportsOrder:()=>__namedExportsOrder,default:()=>__WEBPACK_DEFAULT_EXPORT__});__webpack_require__("./node_modules/react/index.js");var _Pager__WEBPACK_IMPORTED_MODULE_1__=__webpack_require__("./src/components/pagination/Pager.tsx"),_lib_hooks_usePager__WEBPACK_IMPORTED_MODULE_2__=__webpack_require__("./src/lib/hooks/usePager.ts"),react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__=__webpack_require__("./node_modules/react/jsx-runtime.js");const __WEBPACK_DEFAULT_EXPORT__={title:"Pager",component:_Pager__WEBPACK_IMPORTED_MODULE_1__.A},WithUsePager=()=>{const pager=(0,_lib_hooks_usePager__WEBPACK_IMPORTED_MODULE_2__.X)({initialCurrentPage:1,initialNumberOfPages:7});return(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)(_Pager__WEBPACK_IMPORTED_MODULE_1__.A,{currentPage:pager.currentPage,numberOfPages:pager.numberOfPages,pageDownDisabled:pager.pageDownDisabled,pageUpDisabled:pager.pageUpDisabled,onPageDownClick:pager.onPageDownClick,onPageUpClick:pager.onPageUpClick})};WithUsePager.parameters={...WithUsePager.parameters,docs:{...WithUsePager.parameters?.docs,source:{originalSource:"() => {\n  const pager = usePager({\n    initialCurrentPage: 1,\n    initialNumberOfPages: 7\n  });\n  return <Pager currentPage={pager.currentPage} numberOfPages={pager.numberOfPages} pageDownDisabled={pager.pageDownDisabled} pageUpDisabled={pager.pageUpDisabled} onPageDownClick={pager.onPageDownClick} onPageUpClick={pager.onPageUpClick} />;\n}",...WithUsePager.parameters?.docs?.source}}};const __namedExportsOrder=["WithUsePager"]},"./node_modules/classnames/index.js":(module,exports)=>{var __WEBPACK_AMD_DEFINE_RESULT__;!function(){"use strict";var hasOwn={}.hasOwnProperty;function classNames(){for(var classes="",i=0;i<arguments.length;i++){var arg=arguments[i];arg&&(classes=appendClass(classes,parseValue(arg)))}return classes}function parseValue(arg){if("string"==typeof arg||"number"==typeof arg)return arg;if("object"!=typeof arg)return"";if(Array.isArray(arg))return classNames.apply(null,arg);if(arg.toString!==Object.prototype.toString&&!arg.toString.toString().includes("[native code]"))return arg.toString();var classes="";for(var key in arg)hasOwn.call(arg,key)&&arg[key]&&(classes=appendClass(classes,key));return classes}function appendClass(value,newClass){return newClass?value?value+" "+newClass:value+newClass:value}module.exports?(classNames.default=classNames,module.exports=classNames):void 0===(__WEBPACK_AMD_DEFINE_RESULT__=function(){return classNames}.apply(exports,[]))||(module.exports=__WEBPACK_AMD_DEFINE_RESULT__)}()},"./src/components/buttons/IconButton.tsx":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{"use strict";__webpack_require__.d(__webpack_exports__,{A:()=>__WEBPACK_DEFAULT_EXPORT__});var classnames__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__("./node_modules/classnames/index.js"),classnames__WEBPACK_IMPORTED_MODULE_0___default=__webpack_require__.n(classnames__WEBPACK_IMPORTED_MODULE_0__),react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__=(__webpack_require__("./node_modules/react/index.js"),__webpack_require__("./node_modules/react/jsx-runtime.js"));const IconButton=_ref=>{let{children,disabled=!1,dataTestId,...rest}=_ref;const buttonClassNames=classnames__WEBPACK_IMPORTED_MODULE_0___default()({"hover:bg-gray-100 focus:outline-none focus:bg-gray-100 hover:text-gray-600":!disabled,"cursor-not-allowed":disabled},"inline-flex items-center justify-center p-2 rounded-md text-gray-400");return(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)("button",{...rest,className:buttonClassNames,"data-testid":null!=dataTestId?dataTestId:"",children})},__WEBPACK_DEFAULT_EXPORT__=IconButton;try{IconButton.displayName="IconButton",IconButton.__docgenInfo={description:"",displayName:"IconButton",props:{disabled:{defaultValue:{value:"false"},description:"",name:"disabled",required:!1,type:{name:"boolean"}},dataTestId:{defaultValue:null,description:"",name:"dataTestId",required:!1,type:{name:"string"}}}},"undefined"!=typeof STORYBOOK_REACT_CLASSES&&(STORYBOOK_REACT_CLASSES["src/components/buttons/IconButton.tsx#IconButton"]={docgenInfo:IconButton.__docgenInfo,name:"IconButton",path:"src/components/buttons/IconButton.tsx#IconButton"})}catch(__react_docgen_typescript_loader_error){}},"./src/components/pagination/Pager.tsx":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{"use strict";__webpack_require__.d(__webpack_exports__,{A:()=>__WEBPACK_DEFAULT_EXPORT__});__webpack_require__("./node_modules/react/index.js");var _buttons_IconButton__WEBPACK_IMPORTED_MODULE_1__=__webpack_require__("./src/components/buttons/IconButton.tsx"),react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__=__webpack_require__("./node_modules/react/jsx-runtime.js");function Pager(_ref){let{currentPage,numberOfPages,pageDownDisabled,pageUpDisabled,onPageDownClick,onPageUpClick}=_ref;return(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsxs)("div",{className:"flex flex-row items-center gap-6 text-sm text-gray-700",children:[(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)(_buttons_IconButton__WEBPACK_IMPORTED_MODULE_1__.A,{disabled:pageDownDisabled,dataTestId:"left-button",onClick:onPageDownClick,children:(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)("svg",{className:"h-5 w-5",xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 20 20",fill:"currentColor","aria-hidden":"true",children:(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)("path",{fillRule:"evenodd",d:"M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z",clipRule:"evenodd"})})}),(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsxs)("div",{"data-testid":"pager-text-div",children:[(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)("span",{className:"font-medium",children:currentPage})," of ",(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)("span",{className:"font-medium",children:numberOfPages})]}),(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)(_buttons_IconButton__WEBPACK_IMPORTED_MODULE_1__.A,{disabled:pageUpDisabled,onClick:onPageUpClick,dataTestId:"right-button",children:(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)("svg",{className:"h-5 w-5",xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 20 20",fill:"currentColor","aria-hidden":"true",children:(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)("path",{fillRule:"evenodd",d:"M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z",clipRule:"evenodd"})})})]})}const __WEBPACK_DEFAULT_EXPORT__=Pager;try{Pager.displayName="Pager",Pager.__docgenInfo={description:"A pager shows how many pages are available, and allows navigation between those pages.\n\nWorks well with the {@link usePager } hook.",displayName:"Pager",props:{currentPage:{defaultValue:null,description:"The current page",name:"currentPage",required:!0,type:{name:"number"}},numberOfPages:{defaultValue:null,description:"How many pages does the pager have",name:"numberOfPages",required:!0,type:{name:"number"}},pageDownDisabled:{defaultValue:null,description:"Should the page down button be disabled",name:"pageDownDisabled",required:!0,type:{name:"boolean"}},onPageDownClick:{defaultValue:null,description:"Callback for clicking on the page down button",name:"onPageDownClick",required:!0,type:{name:"VoidFunction"}},pageUpDisabled:{defaultValue:null,description:"Should the page up button be disabled",name:"pageUpDisabled",required:!0,type:{name:"boolean"}},onPageUpClick:{defaultValue:null,description:"Callback for clicking on the page down button",name:"onPageUpClick",required:!0,type:{name:"VoidFunction"}}}},"undefined"!=typeof STORYBOOK_REACT_CLASSES&&(STORYBOOK_REACT_CLASSES["src/components/pagination/Pager.tsx#Pager"]={docgenInfo:Pager.__docgenInfo,name:"Pager",path:"src/components/pagination/Pager.tsx#Pager"})}catch(__react_docgen_typescript_loader_error){}},"./src/lib/hooks/usePager.ts":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{"use strict";__webpack_require__.d(__webpack_exports__,{X:()=>usePager});var react__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__("./node_modules/react/index.js");function pagerReducer(state,action){let currentPage,numberOfPages;switch(action.type){case"PAGE_UP":return state.currentPage<state.numberOfPages?{...state,currentPage:state.currentPage+1}:state;case"PAGE_DOWN":return state.currentPage>1?{...state,currentPage:state.currentPage-1}:state;case"GO_TO_LAST_PAGE":return{...state,currentPage:state.numberOfPages};case"SET_NUMBER_OF_PAGES":return numberOfPages=action.numberOfPages,numberOfPages<0&&(numberOfPages=0),currentPage=state.currentPage,currentPage>numberOfPages?currentPage=numberOfPages:0===currentPage&&(currentPage=1),{...state,numberOfPages,currentPage};case"SET_CURRENT_PAGE":return currentPage=action.currentPage,currentPage<1?currentPage=1:currentPage>state.numberOfPages&&(currentPage=state.numberOfPages),{...state,currentPage}}return state}function usePager(_ref){let{initialCurrentPage,initialNumberOfPages}=_ref;const[state,dispatch]=(0,react__WEBPACK_IMPORTED_MODULE_0__.useReducer)(pagerReducer,{currentPage:initialCurrentPage,numberOfPages:initialNumberOfPages}),setNumberOfPages=(0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)((numberOfPages=>dispatch({type:"SET_NUMBER_OF_PAGES",numberOfPages})),[dispatch]),goToLastPage=(0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)((()=>dispatch({type:"GO_TO_LAST_PAGE"})),[dispatch]),onPageUpClick=(0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)((()=>dispatch({type:"PAGE_UP"})),[dispatch]),onPageDownClick=(0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)((()=>dispatch({type:"PAGE_DOWN"})),[dispatch]),setCurrentPage=(0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)((currentPage=>dispatch({type:"SET_CURRENT_PAGE",currentPage})),[dispatch]);return{...state,setCurrentPage,setNumberOfPages,goToLastPage,onPageUpClick,onPageDownClick,pageUpDisabled:state.currentPage===state.numberOfPages,pageDownDisabled:1===state.currentPage}}},"./node_modules/react/cjs/react-jsx-runtime.production.min.js":(__unused_webpack_module,exports,__webpack_require__)=>{"use strict";var f=__webpack_require__("./node_modules/react/index.js"),k=Symbol.for("react.element"),l=Symbol.for("react.fragment"),m=Object.prototype.hasOwnProperty,n=f.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,p={key:!0,ref:!0,__self:!0,__source:!0};function q(c,a,g){var b,d={},e=null,h=null;for(b in void 0!==g&&(e=""+g),void 0!==a.key&&(e=""+a.key),void 0!==a.ref&&(h=a.ref),a)m.call(a,b)&&!p.hasOwnProperty(b)&&(d[b]=a[b]);if(c&&c.defaultProps)for(b in a=c.defaultProps)void 0===d[b]&&(d[b]=a[b]);return{$$typeof:k,type:c,key:e,ref:h,props:d,_owner:n.current}}exports.Fragment=l,exports.jsx=q,exports.jsxs=q},"./node_modules/react/jsx-runtime.js":(module,__unused_webpack_exports,__webpack_require__)=>{"use strict";module.exports=__webpack_require__("./node_modules/react/cjs/react-jsx-runtime.production.min.js")}}]);