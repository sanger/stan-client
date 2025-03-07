"use strict";(self.webpackChunkclient=self.webpackChunkclient||[]).push([[129],{"./src/components/buttons/RemoveButton.tsx":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.d(__webpack_exports__,{A:()=>__WEBPACK_DEFAULT_EXPORT__});__webpack_require__("./node_modules/react/index.js");var _icons_RemoveIcon__WEBPACK_IMPORTED_MODULE_1__=__webpack_require__("./src/components/icons/RemoveIcon.tsx"),react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__=__webpack_require__("./node_modules/react/jsx-runtime.js");const RemoveButton=props=>(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)("button",{"data-testid":"removeButton",...props,className:"inline-flex items-center justify-center p-2 rounded-md hover:bg-red-100 focus:outline-hidden focus:bg-red-100 text-red-400 hover:text-red-600 disabled:text-gray-200",children:(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)(_icons_RemoveIcon__WEBPACK_IMPORTED_MODULE_1__.A,{className:"block h-5 w-5"})}),__WEBPACK_DEFAULT_EXPORT__=RemoveButton;try{RemoveButton.displayName="RemoveButton",RemoveButton.__docgenInfo={description:"",displayName:"RemoveButton",props:{}},"undefined"!=typeof STORYBOOK_REACT_CLASSES&&(STORYBOOK_REACT_CLASSES["src/components/buttons/RemoveButton.tsx#RemoveButton"]={docgenInfo:RemoveButton.__docgenInfo,name:"RemoveButton",path:"src/components/buttons/RemoveButton.tsx#RemoveButton"})}catch(__react_docgen_typescript_loader_error){}},"./src/components/dataTableColumns/index.ts":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{function joinUnique(array){return Array.from(new Set(array)).join(", ")}__webpack_require__.d(__webpack_exports__,{EG:()=>joinUnique,lI:()=>valueFromSamples,ne:()=>samplesFromLabwareOrSLot});const samplesFromLabwareOrSLot=labwareOrSlot=>"labwareType"in labwareOrSlot?labwareOrSlot.slots.flatMap((slot=>slot.samples)):labwareOrSlot.samples;function valueFromSamples(labwareOrSlot,sampleFunction){return joinUnique(samplesFromLabwareOrSLot(labwareOrSlot).map(sampleFunction))}},"./src/components/dataTableColumns/labwareColumns.tsx":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.d(__webpack_exports__,{RF:()=>FlaggedBarcodeLink,Ay:()=>labwareColumns});__webpack_require__("./node_modules/react/index.js");var sdk=__webpack_require__("./src/types/sdk.ts"),jsx_runtime=__webpack_require__("./node_modules/react/jsx-runtime.js");const Circle=_ref=>{let{backgroundColor}=_ref;return(0,jsx_runtime.jsx)("span",{className:`inline-block h-8 w-8 rounded-full ${backgroundColor}`})},components_Circle=Circle;try{Circle.displayName="Circle",Circle.__docgenInfo={description:"",displayName:"Circle",props:{backgroundColor:{defaultValue:null,description:"",name:"backgroundColor",required:!0,type:{name:"string"}}}},"undefined"!=typeof STORYBOOK_REACT_CLASSES&&(STORYBOOK_REACT_CLASSES["src/components/Circle.tsx#Circle"]={docgenInfo:Circle.__docgenInfo,name:"Circle",path:"src/components/Circle.tsx#Circle"})}catch(__react_docgen_typescript_loader_error){}var slotHelper=__webpack_require__("./src/lib/helpers/slotHelper.ts"),dataTableColumns=__webpack_require__("./src/components/dataTableColumns/index.ts"),StyledLink=__webpack_require__("./src/components/StyledLink.tsx"),FlagIcon=__webpack_require__("./src/components/icons/FlagIcon.tsx"),MutedText=__webpack_require__("./src/components/MutedText.tsx"),BubleChatIcon=__webpack_require__("./src/components/icons/BubleChatIcon.tsx"),helpers=__webpack_require__("./src/lib/helpers.ts");const FlaggedBarcodeLink=(barcode,priority,index)=>(0,jsx_runtime.jsx)("div",{className:"whitespace-nowrap",children:(0,jsx_runtime.jsxs)(StyledLink.A,{"data-testid":"flagged-barcode-link",className:"text-sp bg-transparent hover:text-sp-700 active:text-sp-800",to:`/labware/${barcode}`,target:"_blank",children:[priority&&priority===sdk.ZpU.Flag&&(0,jsx_runtime.jsx)(FlagIcon.A,{className:"inline-block h-5 w-5 -ml-1 mr-1 mb-2"}),priority&&priority===sdk.ZpU.Note&&(0,jsx_runtime.jsx)(BubleChatIcon.A,{className:"inline-block h-5 w-5 -ml-1 mr-1"}),barcode]})},index),spatialLocationColumnDiv=samples=>(0,jsx_runtime.jsxs)("div",{children:[(0,dataTableColumns.EG)(samples.map((sample=>String(sample.tissue.spatialLocation.code)))),(0,jsx_runtime.jsx)(MutedText.A,{children:(0,dataTableColumns.EG)(samples.map((sample=>String(sample.tissue.spatialLocation.name))))})]}),labwareColumns={color:meta=>({id:"color",Header:"",accessor:originalRow=>{var _meta$get,_originalRow$slots$,_originalRow$slots$$s;return null!==(_meta$get=null==meta?void 0:meta.get(null===(_originalRow$slots$=originalRow.slots[0])||void 0===_originalRow$slots$||null===(_originalRow$slots$$s=_originalRow$slots$.samples[0])||void 0===_originalRow$slots$$s?void 0:_originalRow$slots$$s.id))&&void 0!==_meta$get?_meta$get:(0,helpers.EF)().next().value},Cell:props=>(0,jsx_runtime.jsx)(components_Circle,{backgroundColor:props.value})}),barcode:()=>({Header:"Barcode",accessor:"barcode",id:"barcode"}),flaggedBarcode:()=>({Header:"Barcode",accessor:lw=>lw.flagged?FlaggedBarcodeLink(lw.barcode,lw.flagPriority):lw.barcode}),donorId:()=>({Header:"Donor ID",accessor:labware=>(0,dataTableColumns.lI)(labware,(sample=>sample.tissue.donor.donorName))}),tissueType:()=>({Header:"Tissue type",accessor:labware=>(0,dataTableColumns.lI)(labware,(sample=>sample.tissue.spatialLocation.tissueType.name))}),spatialLocation:()=>({Header:"Spatial location",accessor:labware=>{const samples=(0,dataTableColumns.ne)(labware);return spatialLocationColumnDiv(samples)}}),replicate:()=>({Header:"Replicate",accessor:labware=>(0,dataTableColumns.lI)(labware,(sample=>{var _sample$tissue$replic;return String(null!==(_sample$tissue$replic=sample.tissue.replicate)&&void 0!==_sample$tissue$replic?_sample$tissue$replic:"")}))}),labwareType:()=>({Header:"Labware Type",accessor:labware=>labware.labwareType.name}),externalName:()=>({Header:"External ID",accessor:labware=>(0,dataTableColumns.lI)(labware,(sample=>{var _sample$tissue$extern;return null!==(_sample$tissue$extern=sample.tissue.externalName)&&void 0!==_sample$tissue$extern?_sample$tissue$extern:""}))}),bioState:()=>({Header:"Bio state",accessor:labware=>(0,dataTableColumns.lI)(labware,(sample=>sample.bioState.name))}),highestSectionForSlot:slotAddress=>({Header:"Highest Section for Block",accessor:labware=>{var _maybeFindSlotByAddre,_maybeFindSlotByAddre2;return null!==(_maybeFindSlotByAddre=null===(_maybeFindSlotByAddre2=(0,slotHelper.HQ)(labware.slots,slotAddress))||void 0===_maybeFindSlotByAddre2?void 0:_maybeFindSlotByAddre2.blockHighestSection)&&void 0!==_maybeFindSlotByAddre?_maybeFindSlotByAddre:"-"}}),medium:()=>({Header:"Medium",accessor:labware=>labware.slots[0].samples.length>0?labware.slots[0].samples[0].tissue.medium.name:""}),fixative:()=>({Header:"Fixative",accessor:labware=>labware.slots[0].samples.length>0?labware.slots[0].samples[0].tissue.fixative.name:""})};try{spatialLocationColumnDiv.displayName="spatialLocationColumnDiv",spatialLocationColumnDiv.__docgenInfo={description:"Spatial location code for the first sample in the first slot of the labware",displayName:"spatialLocationColumnDiv",props:{}},"undefined"!=typeof STORYBOOK_REACT_CLASSES&&(STORYBOOK_REACT_CLASSES["src/components/dataTableColumns/labwareColumns.tsx#spatialLocationColumnDiv"]={docgenInfo:spatialLocationColumnDiv.__docgenInfo,name:"spatialLocationColumnDiv",path:"src/components/dataTableColumns/labwareColumns.tsx#spatialLocationColumnDiv"})}catch(__react_docgen_typescript_loader_error){}},"./src/components/icons/LockIcon.tsx":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.d(__webpack_exports__,{A:()=>__WEBPACK_DEFAULT_EXPORT__});__webpack_require__("./node_modules/react/index.js");var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__=__webpack_require__("./node_modules/react/jsx-runtime.js");const LockIcon=props=>(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 20 20",fill:"currentColor",...props,children:(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)("path",{fillRule:"evenodd",d:"M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z",clipRule:"evenodd"})}),__WEBPACK_DEFAULT_EXPORT__=LockIcon;try{LockIcon.displayName="LockIcon",LockIcon.__docgenInfo={description:"Heroicon lock icon",displayName:"LockIcon",props:{}},"undefined"!=typeof STORYBOOK_REACT_CLASSES&&(STORYBOOK_REACT_CLASSES["src/components/icons/LockIcon.tsx#LockIcon"]={docgenInfo:LockIcon.__docgenInfo,name:"LockIcon",path:"src/components/icons/LockIcon.tsx#LockIcon"})}catch(__react_docgen_typescript_loader_error){}},"./src/components/icons/RemoveIcon.tsx":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.d(__webpack_exports__,{A:()=>__WEBPACK_DEFAULT_EXPORT__});__webpack_require__("./node_modules/react/index.js");var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__=__webpack_require__("./node_modules/react/jsx-runtime.js");const RemoveIcon=props=>(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 20 20",fill:"currentColor",...props,children:(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)("path",{fillRule:"evenodd",d:"M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z",clipRule:"evenodd"})}),__WEBPACK_DEFAULT_EXPORT__=RemoveIcon;try{RemoveIcon.displayName="RemoveIcon",RemoveIcon.__docgenInfo={description:"Remove SVG icon",displayName:"RemoveIcon",props:{}},"undefined"!=typeof STORYBOOK_REACT_CLASSES&&(STORYBOOK_REACT_CLASSES["src/components/icons/RemoveIcon.tsx#RemoveIcon"]={docgenInfo:RemoveIcon.__docgenInfo,name:"RemoveIcon",path:"src/components/icons/RemoveIcon.tsx#RemoveIcon"})}catch(__react_docgen_typescript_loader_error){}},"./src/components/labwareScanner/LabwareScanner.tsx":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.d(__webpack_exports__,{A:()=>LabwareScanner,P:()=>useLabwareContext});var react=__webpack_require__("./node_modules/react/index.js"),xstate_react_esm=__webpack_require__("./node_modules/@xstate/react/dist/xstate-react.esm.js"),xstate_esm=__webpack_require__("./node_modules/xstate/dist/xstate.esm.js"),xstate_actors_esm=__webpack_require__("./node_modules/xstate/actors/dist/xstate-actors.esm.js"),log_2a773d37_esm=__webpack_require__("./node_modules/xstate/dist/log-2a773d37.esm.js"),stan=__webpack_require__("./src/types/stan.ts"),sdk=__webpack_require__("./src/lib/sdk.ts"),labwareHelper=__webpack_require__("./src/lib/helpers/labwareHelper.ts"),immer=__webpack_require__("./node_modules/immer/dist/immer.mjs"),lodash=__webpack_require__("./node_modules/lodash/lodash.js");const resolveStringArrayPromise=data=>{let resolvedData=[];return Array.isArray(data)?resolvedData=data:data.then((resolved=>{resolvedData=resolved})),resolvedData},createLabwareMachine=()=>(0,xstate_esm.Op)({types:{},context:_ref=>{let{input}=_ref;return{...input}},id:"labwareScanner",initial:"checking_full",states:{checking_full:{always:[{guard:_ref2=>{let{context}=_ref2;return context.labwares.length===context.limit},target:"full"},{target:"idle"}]},full:{on:{REMOVE_LABWARE:{target:"#labwareScanner.idle.success",actions:["removeLabware"]}}},idle:{initial:"normal",states:{normal:{},error:{},success:{}},on:{UPDATE_CURRENT_BARCODE:{target:"#labwareScanner.idle.normal",actions:"assignCurrentBarcode"},SUBMIT_BARCODE:[{target:"validating",guard:"barcodeNotPresent"},{target:"#labwareScanner.idle.error",actions:"assignErrorMessage"}],REMOVE_LABWARE:{target:"#labwareScanner.idle.success",actions:["removeLabware"]},LOCK:"locked"}},locked:{on:{UNLOCK:"checking_full"}},validating:{invoke:{id:"validateBarcode",src:(0,xstate_actors_esm.Sx)((_ref3=>{let{input}=_ref3;return input.validator.validate(input.currentBarcode)})),input:_ref4=>{let{context}=_ref4;return{validator:context.validator,currentBarcode:context.currentBarcode}},onDone:[{target:"searching",guard:_ref5=>{let{context}=_ref5;return!1===context.locationScan}},{target:"searchingLocation"}],onError:{target:"#labwareScanner.idle.error",actions:"assignValidationError"}}},searching:{invoke:{id:"findLabware",src:(0,xstate_actors_esm.Sx)((_ref6=>{let{input}=_ref6;return input.enableFlaggedLabwareCheck?sdk.Uc.FindFlaggedLabware({barcode:input.currentBarcode}):sdk.Uc.FindLabware({barcode:input.currentBarcode})})),input:_ref7=>{let{context:{enableFlaggedLabwareCheck,currentBarcode}}=_ref7;return{enableFlaggedLabwareCheck,currentBarcode}},onDone:{target:"validatingFoundLabware",actions:["assignFoundLabware"]},onError:{target:"#labwareScanner.idle.error",actions:"assignFindError"}}},searchingLocation:{invoke:{id:"findLocation",src:(0,xstate_actors_esm.Sx)((_ref8=>{let{input}=_ref8;return sdk.Uc.GetLabwareInLocation({locationBarcode:input.currentBarcode})})),input:_ref9=>{let{context:{currentBarcode}}=_ref9;return{currentBarcode}},onDone:{target:"#labwareScanner.idle.normal",actions:["assignFoundLocationLabwareIfValid"]},onError:{target:"#labwareScanner.idle.error",actions:"assignFindError"}}},validatingFoundLabware:{invoke:{id:"validateFoundLabware",src:(0,xstate_actors_esm.Sx)((_ref10=>{let{input}=_ref10;return new Promise((async(resolve,reject)=>{const problems=resolveStringArrayPromise(input.foundLabware?input.foundLabwareCheck?await input.foundLabwareCheck(input.labwares,input.foundLabware):[]:["Labware not loaded."]);0===problems.length?resolve(input.foundLabware):reject(problems)}))})),input:_ref11=>{let{context}=_ref11;return{labwares:context.labwares,foundLabware:context.foundLabware,foundLabwareCheck:context.foundLabwareCheck}},onDone:{target:"gettingCleanedOutAddress",actions:["addFoundLabware"]},onError:{target:"#labwareScanner.idle.error",actions:["foundLabwareCheckError"]}}},gettingCleanedOutAddress:{invoke:{id:"cleanedOutAddress",src:(0,xstate_actors_esm.Sx)((_ref12=>{let{input}=_ref12;return input.runCheck?new Promise(((resolve,reject)=>{sdk.Uc.GetCleanedOutAddresses({barcode:input.barcode}).then((response=>{resolve({...response,id:input.labwareId})})).catch(reject)})):new Promise((resolve=>resolve({cleanedOutAddresses:[],id:input.labwareId})))})),input:_ref13=>{let{context}=_ref13;return{barcode:context.labwares[context.labwares.length-1].barcode,labwareId:context.labwares[context.labwares.length-1].id,runCheck:context.checkForCleanedOutAddresses}},onDone:{target:"#labwareScanner.checking_full",actions:["assignCleanedOutAddresses"]},onError:{target:"#labwareScanner.idle.error",actions:["assignCleanedOutLabwareError"]}}}}},{actions:{assignCurrentBarcode:(0,log_2a773d37_esm.a)((_ref14=>{let{context,event}=_ref14;return"UPDATE_CURRENT_BARCODE"!==event.type||(context.currentBarcode=event.value.replace(/\s+/g,""),context.errorMessage="",context.locationScan=event.locationScan),context})),assignErrorMessage:(0,log_2a773d37_esm.a)((_ref15=>{let{context,event}=_ref15;return"SUBMIT_BARCODE"!==event.type||(context.errorMessage=alreadyScannedBarcodeError(context.currentBarcode)),context})),removeLabware:(0,log_2a773d37_esm.a)((_ref16=>{let{context,event}=_ref16;if("REMOVE_LABWARE"!==event.type)return context;const labwareToRemove=context.labwares.find((lw=>lw.barcode===event.value));return labwareToRemove?(context.removedLabware={labware:labwareToRemove,index:(0,lodash.findIndex)(context.labwares,(lw=>lw.barcode===event.value))},(0,immer.jM)(context,(draft=>{draft.checkForCleanedOutAddresses&&draft.cleanedOutAddresses.delete(labwareToRemove.id),draft.labwares=draft.labwares.filter((lw=>lw.barcode!==event.value)),draft.successMessage=`"${event.value}" removed`}))):context})),assignValidationError:(0,log_2a773d37_esm.a)((_ref17=>{let{context,event}=_ref17;return"xstate.error.actor.validateBarcode"!==event.type?context:{context,errorMessage:event.error.errors.join("\n")}})),assignFoundLabware:(0,log_2a773d37_esm.a)((_ref18=>{let{context,event}=_ref18;return"xstate.done.actor.findLabware"!==event.type||(context.foundLabware=context.enableFlaggedLabwareCheck?event.output.labwareFlagged:(0,labwareHelper.jY)([event.output.labware])[0],context.currentBarcode=""),context})),assignCleanedOutAddresses:(0,log_2a773d37_esm.a)((_ref19=>{let{context,event}=_ref19;return"xstate.done.actor.cleanedOutAddress"!==event.type?context:(0,immer.jM)(context,(draft=>{draft.cleanedOutAddresses.set(event.output.id,event.output.cleanedOutAddresses)}))})),assignCleanedOutLabwareError:(0,log_2a773d37_esm.a)((_ref20=>{let{context,event}=_ref20;return"xstate.error.actor.cleanedOutAddress"!==event.type?context:{...context,errorMessage:event.error.message}})),addFoundLabware:(0,log_2a773d37_esm.a)((_ref21=>{let{context,event}=_ref21;return"xstate.done.actor.validateFoundLabware"!==event.type||(context.labwares=[...context.labwares,event.output],context.foundLabware=null),context})),assignFoundLocationLabwareIfValid:(0,log_2a773d37_esm.a)((_ref22=>{let{context,event}=_ref22;if("xstate.done.actor.findLocation"!==event.type)return context;const problems=[];return event.output.labwareInLocation.filter((labware=>-1===context.labwares.findIndex((ctxLabware=>ctxLabware.barcode===labware.barcode)))),event.output.labwareInLocation.forEach((labware=>{let problem=[];context.labwares.find((ctxLabware=>ctxLabware.barcode===labware.barcode))?problem.push(alreadyScannedBarcodeError(labware.barcode)):problem=resolveStringArrayPromise(context.foundLabwareCheck?context.foundLabwareCheck((0,labwareHelper.jY)(event.output.labwareInLocation),(0,labwareHelper.jY)([labware])[0]):[]),0!==problem.length?problems.push(problem.join("\n")):context.labwares=[...context.labwares,(0,labwareHelper.jY)([labware])[0]]})),problems.length>0&&(context.errorMessage=problems.join("\n")),context.currentBarcode="",context})),foundLabwareCheckError:(0,log_2a773d37_esm.a)((_ref23=>{var _event$error;let{context,event}=_ref23;return"xstate.error.actor.validateFoundLabware"!==event.type||(context.errorMessage=null===(_event$error=event.error)||void 0===_event$error?void 0:_event$error.join("\n")),context})),assignFindError:(0,log_2a773d37_esm.a)((_ref24=>{let{context,event}=_ref24;return"xstate.error.actor.findLabware"!==event.type&&"xstate.error.actor.findLocation"!==event.type||(context.errorMessage=handleFindError(event.error)),context}))},guards:{barcodeNotPresent:_ref25=>{let{context}=_ref25;return!context.labwares.map((lw=>lw.barcode)).includes(context.currentBarcode)}}}),alreadyScannedBarcodeError=barcode=>`"${barcode}" has already been scanned`,handleFindError=error=>{let errors=(0,stan.UG)(error);return null==errors?void 0:errors.message};var ScanInput=__webpack_require__("./src/components/scanInput/ScanInput.tsx"),Success=__webpack_require__("./src/components/notifications/Success.tsx"),Warning=__webpack_require__("./src/components/notifications/Warning.tsx"),index_esm=__webpack_require__("./node_modules/yup/index.esm.js"),jsx_runtime=__webpack_require__("./node_modules/react/jsx-runtime.js");function LabwareScanner(_ref){let{initialLabwares,locked=!1,limit,labwareCheckFunction,onChange,onAdd,onRemove,children,enableLocationScanner,enableFlaggedLabwareCheck=!1,checkForCleanedOutAddresses=!1,initCleanedOutAddresses=new Map}=_ref;const slicedInitialLabware=react.useMemo((()=>initialLabwares?limit&&initialLabwares.length>limit?initialLabwares.slice(0,limit):initialLabwares:[]),[initialLabwares,limit]),slicedInitialCleanedOutAddresses=react.useMemo((()=>{if(slicedInitialLabware&&slicedInitialLabware.length>0&&initCleanedOutAddresses.size!==(null==slicedInitialLabware?void 0:slicedInitialLabware.length)){const cleanedOutAddresses=new Map([...initCleanedOutAddresses]);return slicedInitialLabware.forEach((labware=>{cleanedOutAddresses.set(labware.id,initCleanedOutAddresses.get(labware.id)||[])})),cleanedOutAddresses}return initCleanedOutAddresses}),[initCleanedOutAddresses,slicedInitialLabware]),labwareMachine=react.useMemo((()=>createLabwareMachine()),[]),[current,send,service]=(0,xstate_react_esm.zl)(labwareMachine,{input:{labwares:slicedInitialLabware,foundLabwareCheck:labwareCheckFunction,limit,enableFlaggedLabwareCheck,currentBarcode:"",foundLabware:null,removedLabware:null,validator:index_esm.Yj().trim().required("Barcode is required"),successMessage:null,errorMessage:null,locationScan:!1,checkForCleanedOutAddresses,cleanedOutAddresses:slicedInitialCleanedOutAddresses}}),{labwares,removedLabware,successMessage,errorMessage,currentBarcode,locationScan,cleanedOutAddresses}=current.context,inputRef=(0,react.useRef)(null),previousLabwareLength=service.getSnapshot().context.labwares.length,prevCleanedOutAddressesLength=service.getSnapshot().context.cleanedOutAddresses.size;(0,react.useEffect)((()=>{const subscription=service.subscribe((observer=>{var _inputRef$current;observer.matches("idle")&&!observer.context.locationScan&&(null===(_inputRef$current=inputRef.current)||void 0===_inputRef$current||_inputRef$current.focus());const currentLabwareLength=observer.context.labwares.length,curCleanedOutAddressesLength=observer.context.cleanedOutAddresses.size,labwares=observer.context.labwares;void 0!==previousLabwareLength&&(checkForCleanedOutAddresses||currentLabwareLength===previousLabwareLength||null==onChange||onChange(labwares),checkForCleanedOutAddresses&&curCleanedOutAddressesLength!==prevCleanedOutAddressesLength&&(null==onChange||onChange(labwares,cleanedOutAddresses)),currentLabwareLength>previousLabwareLength&&(null==onAdd||onAdd(labwares[labwares.length-1])),currentLabwareLength<previousLabwareLength&&observer.context.removedLabware&&(null==onRemove||onRemove(observer.context.removedLabware.labware,observer.context.removedLabware.index)))}));return subscription.unsubscribe}),[service,onChange,onAdd,onRemove,labwares,removedLabware,previousLabwareLength,cleanedOutAddresses,prevCleanedOutAddressesLength,checkForCleanedOutAddresses]),(0,react.useEffect)((()=>{send(locked?{type:"LOCK"}:{type:"UNLOCK"})}),[send,locked]);const ctxValue={locked:current.matches("locked"),labwares,removeLabware:react.useCallback((barcode=>{send({type:"REMOVE_LABWARE",value:barcode})}),[send]),enableFlaggedLabwareCheck,cleanedOutAddresses},handleOnScanInputChange=(0,react.useCallback)((function(e){let locationScan=arguments.length>1&&void 0!==arguments[1]&&arguments[1];send({type:"UPDATE_CURRENT_BARCODE",value:e.currentTarget.value,locationScan})}),[send]),handleOnScan=(0,react.useCallback)((()=>send({type:"SUBMIT_BARCODE"})),[send]);return(0,jsx_runtime.jsxs)("div",{className:"space-y-4",children:[current.matches("idle.success")&&successMessage&&(0,jsx_runtime.jsx)(Success.A,{className:"my-2",message:successMessage}),(current.matches("idle.error")&&errorMessage||locationScan&&errorMessage)&&(0,jsx_runtime.jsx)(Warning.A,{className:"my-2",message:errorMessage}),(0,jsx_runtime.jsxs)("div",{className:"flex flex-row",children:[enableLocationScanner&&(0,jsx_runtime.jsxs)("div",{className:"sm:w-2/3 md:w-1/2 mr-4 space-y-2",children:[(0,jsx_runtime.jsx)("label",{htmlFor:"locationScanInput",className:"w-full ml-2 font-sans font-medium text-gray-700",children:"Location:"}),(0,jsx_runtime.jsx)(ScanInput.A,{id:"locationScanInput",type:"text",value:locationScan?currentBarcode:"",disabled:!current.matches("idle"),onChange:e=>handleOnScanInputChange(e,!0),onScan:handleOnScan})]}),(0,jsx_runtime.jsxs)("div",{className:"sm:w-2/3 md:w-1/2 space-y-2",children:[enableLocationScanner&&(0,jsx_runtime.jsx)("label",{htmlFor:"labwareScanInput",className:"w-full ml-2 font-sans font-medium text-gray-700",children:"Labware:"}),(0,jsx_runtime.jsx)(ScanInput.A,{id:"labwareScanInput",type:"text",value:locationScan?"":currentBarcode,disabled:!current.matches("idle"),onChange:handleOnScanInputChange,onScan:handleOnScan,ref:inputRef})]})]}),(0,jsx_runtime.jsx)(LabwareScannerContext.Provider,{value:ctxValue,children:(0,lodash.isFunction)(children)?children(ctxValue):children})]})}const LabwareScannerContext=react.createContext({locked:!1,labwares:[],removeLabware:_barcode=>{},enableFlaggedLabwareCheck:!1,cleanedOutAddresses:new Map});function useLabwareContext(){return(0,react.useContext)(LabwareScannerContext)}try{LabwareScanner.displayName="LabwareScanner",LabwareScanner.__docgenInfo={description:"",displayName:"LabwareScanner",props:{initialLabwares:{defaultValue:null,description:"The initial list of labwares the scanner should be displaying",name:"initialLabwares",required:!1,type:{name:"LabwareFlaggedFieldsFragment[]"}},locked:{defaultValue:{value:"false"},description:"True is the scanner should be locked; false otherwise",name:"locked",required:!1,type:{name:"boolean"}},limit:{defaultValue:null,description:"The maximum number of labware the scanner should be able to have scanned in at one time",name:"limit",required:!1,type:{name:"number"}},labwareCheckFunction:{defaultValue:null,description:"A function to check for problems with new labware because it is added",name:"labwareCheckFunction",required:!1,type:{name:"((labwares: LabwareFlaggedFieldsFragment[], foundLabware: LabwareFlaggedFieldsFragment) => string[] | Promise<string[]>)"}},onChange:{defaultValue:null,description:"Called when labware is added or removed\n@param labwares the list of current labwares",name:"onChange",required:!1,type:{name:"((labwares: LabwareFlaggedFieldsFragment[], cleanedOutAddresses?: Map<number, string[]>) => void)"}},onAdd:{defaultValue:null,description:"Callback for when a labware is added\n@param labware the added labware",name:"onAdd",required:!1,type:{name:"((labware: LabwareFlaggedFieldsFragment, cleanedOutAddresses?: Map<number, string[]>) => void)"}},onRemove:{defaultValue:null,description:"Callback for when a labware is removed\n@param labware the removed labware\n@param index the index of the removed labware",name:"onRemove",required:!1,type:{name:"((labware: LabwareFlaggedFieldsFragment, index: number) => void)"}},children:{defaultValue:null,description:"Children can either be a react node (if using the useLabware hook)\nOr it can be a function that will have the context passed in",name:"children",required:!1,type:{name:"ReactNode | ((props: LabwareScannerContextType) => ReactNode)"}},enableLocationScanner:{defaultValue:null,description:"",name:"enableLocationScanner",required:!1,type:{name:"boolean"}},enableFlaggedLabwareCheck:{defaultValue:{value:"false"},description:"defaults to false, when set to true labwareMachine runs the FindFlaggedLabware query instead of the FindLabware query.",name:"enableFlaggedLabwareCheck",required:!1,type:{name:"boolean"}},checkForCleanedOutAddresses:{defaultValue:{value:"false"},description:"defaults to false, when set to true labwareMachine runs the cleanedOutAddresses query",name:"checkForCleanedOutAddresses",required:!1,type:{name:"boolean"}},initCleanedOutAddresses:{defaultValue:{value:"new Map<number, string[]>()"},description:"The initial map of cleaned out addresses linked to the initial labwares list",name:"initCleanedOutAddresses",required:!1,type:{name:"Map<number, string[]>"}}}},"undefined"!=typeof STORYBOOK_REACT_CLASSES&&(STORYBOOK_REACT_CLASSES["src/components/labwareScanner/LabwareScanner.tsx#LabwareScanner"]={docgenInfo:LabwareScanner.__docgenInfo,name:"LabwareScanner",path:"src/components/labwareScanner/LabwareScanner.tsx#LabwareScanner"})}catch(__react_docgen_typescript_loader_error){}},"./src/components/scanInput/ScanInput.tsx":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.d(__webpack_exports__,{A:()=>__WEBPACK_DEFAULT_EXPORT__});var react__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__("./node_modules/react/index.js"),_icons_BarcodeIcon__WEBPACK_IMPORTED_MODULE_1__=__webpack_require__("./src/components/icons/BarcodeIcon.tsx"),_icons_LockIcon__WEBPACK_IMPORTED_MODULE_2__=__webpack_require__("./src/components/icons/LockIcon.tsx"),classnames__WEBPACK_IMPORTED_MODULE_3__=__webpack_require__("./node_modules/classnames/index.js"),classnames__WEBPACK_IMPORTED_MODULE_3___default=__webpack_require__.n(classnames__WEBPACK_IMPORTED_MODULE_3__),_forms_Label__WEBPACK_IMPORTED_MODULE_4__=__webpack_require__("./src/components/forms/Label.tsx"),formik__WEBPACK_IMPORTED_MODULE_6__=__webpack_require__("./node_modules/formik/dist/formik.esm.js"),react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__=__webpack_require__("./node_modules/react/jsx-runtime.js");const ScanInput=react__WEBPACK_IMPORTED_MODULE_0__.forwardRef(((_ref,ref)=>{let{label,name,type="text",onScan,allowEmptyValue=!1,...inputProps}=_ref;const inputClassNames=classnames__WEBPACK_IMPORTED_MODULE_3___default()({"rounded-r-md":!(null!=inputProps&&inputProps.disabled),"border-r-0 disabled:bg-gray-100":null==inputProps?void 0:inputProps.disabled},"grow-0 focus:ring-sdb-100 focus:border-sdb-100 h-10 block w-full border-gray-300 rounded-none transition duration-150 ease-in-out"),onKeyDownHandler=react__WEBPACK_IMPORTED_MODULE_0__.useCallback((e=>{if(["Tab","Enter"].some((triggerKey=>triggerKey===e.key))){if(e.preventDefault(),""===e.currentTarget.value&&!allowEmptyValue)return;null==onScan||onScan(e.currentTarget.value)}}),[onScan,allowEmptyValue]);return(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsxs)("div",{className:"flex flex-col",children:[label&&(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_forms_Label__WEBPACK_IMPORTED_MODULE_4__.A,{name:label}),(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsxs)("div",{className:"flex rounded-md shadow-xs",children:[(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("span",{className:"inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm",children:(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_icons_BarcodeIcon__WEBPACK_IMPORTED_MODULE_1__.A,{className:"block h-5 w-5"})}),name?(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.Fragment,{children:(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(formik__WEBPACK_IMPORTED_MODULE_6__.D0,{type,"data-testid":"formInput",className:inputClassNames,name,...inputProps,onKeyDown:onKeyDownHandler})}):(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("input",{...inputProps,ref,type,onKeyDown:onKeyDownHandler,className:inputClassNames,"data-testid":"input"}),(null==inputProps?void 0:inputProps.disabled)&&(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("span",{className:"inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-100 transition duration-150 ease-in-out text-sm",children:(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_icons_LockIcon__WEBPACK_IMPORTED_MODULE_2__.A,{className:"block h-5 w-5 text-sp-300 transition duration-150 ease-in-out"})})]})]})})),__WEBPACK_DEFAULT_EXPORT__=ScanInput;try{ScanInput.displayName="ScanInput",ScanInput.__docgenInfo={description:"Input that will call the onScan callback on both `tab` or `enter` (one of which hopefully is what a barcode scanner has setup as its terminal character).",displayName:"ScanInput",props:{name:{defaultValue:null,description:"If name given , display a Formik input otherwise normal",name:"name",required:!1,type:{name:"string"}},onScan:{defaultValue:null,description:"Callback for when a barcode is scanned into the {@link ScanInput}\n@param value the current value of the input",name:"onScan",required:!1,type:{name:"((value: string) => void)"}},allowEmptyValue:{defaultValue:{value:"false"},description:"Allow empty value in input, so it can be validated from parent component",name:"allowEmptyValue",required:!1,type:{name:"boolean"}},type:{defaultValue:{value:"text"},description:"Type of input field, default is 'text'",name:"type",required:!1,type:{name:"string"}},label:{defaultValue:null,description:"Label to display, if any",name:"label",required:!1,type:{name:"string"}}}},"undefined"!=typeof STORYBOOK_REACT_CLASSES&&(STORYBOOK_REACT_CLASSES["src/components/scanInput/ScanInput.tsx#ScanInput"]={docgenInfo:ScanInput.__docgenInfo,name:"ScanInput",path:"src/components/scanInput/ScanInput.tsx#ScanInput"})}catch(__react_docgen_typescript_loader_error){}},"./src/lib/sdk.ts":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.d(__webpack_exports__,{Uc:()=>stanCore});var graphql_request__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__("./node_modules/graphql-request/build/esm/index.js"),js_cookie__WEBPACK_IMPORTED_MODULE_1__=__webpack_require__("./node_modules/js-cookie/dist/js.cookie.mjs"),_types_sdk__WEBPACK_IMPORTED_MODULE_3__=(__webpack_require__("./node_modules/react/index.js"),__webpack_require__("./src/types/sdk.ts"));const graphQLClient=new graphql_request__WEBPACK_IMPORTED_MODULE_0__.l4("/graphql"),xsrf=js_cookie__WEBPACK_IMPORTED_MODULE_1__.A.get("XSRF-TOKEN");xsrf&&graphQLClient.setHeader("X-XSRF-TOKEN",xsrf);const stanCore=(0,_types_sdk__WEBPACK_IMPORTED_MODULE_3__.xMG)(graphQLClient)}}]);