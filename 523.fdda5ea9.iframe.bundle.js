"use strict";(self.webpackChunkclient=self.webpackChunkclient||[]).push([[523],{"./src/lib/helpers.ts":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.d(__webpack_exports__,{Lb:()=>mapify,_f:()=>GridDirection,sn:()=>isSameArray,tQ:()=>cycleColors,uv:()=>objectKeys,wz:()=>regexSort,x:()=>buildAddresses});__webpack_require__("./node_modules/lodash/lodash.js");function objectKeys(o){return Object.keys(o)}let GridDirection=function(GridDirection){return GridDirection.RightDown="RightDown",GridDirection.DownRight="DownRight",GridDirection.RightUp="RightUp",GridDirection.UpRight="UpRight",GridDirection.LeftUp="LeftUp",GridDirection}({});function createAddress(rowNumber,columnNumber){if(rowNumber>26)return`${rowNumber},${columnNumber}`;const aCharCode="A".charCodeAt(0);return`${String.fromCharCode(rowNumber+aCharCode-1)}${columnNumber}`}function buildAddresses(size){let direction=arguments.length>1&&void 0!==arguments[1]?arguments[1]:GridDirection.RightDown;const{numRows,numColumns}=size,addresses=new Array;switch(direction){case GridDirection.RightDown:for(let row=1;row<=numRows;row++)for(let col=1;col<=numColumns;col++)addresses.push(createAddress(row,col));break;case GridDirection.DownRight:for(let col=1;col<=numColumns;col++)for(let row=1;row<=numRows;row++)addresses.push(createAddress(row,col));break;case GridDirection.RightUp:for(let row=numRows;row>=1;row--)for(let col=1;col<=numColumns;col++)addresses.push(createAddress(row,col));break;case GridDirection.LeftUp:for(let row=numRows;row>=1;row--)for(let col=numColumns;col>=1;col--)addresses.push(createAddress(row,col));break;default:throw new Error(`Unsupported direction: ${direction}`)}return addresses}function cycleColors(){return function*cycle(list){let i=0;const l=list.length;for(;;)yield list[i],i+=1,i===l&&(i=0)}(["red","green","indigo","pink","blue","purple"])}function mapify(items,key){return new Map(items.map((item=>[item[key],item])))}function regexSort(a,b,regExp){let aPrim,aSec,bPrim,bSec,alphaFirst=!(arguments.length>3&&void 0!==arguments[3])||arguments[3],aAlpha=aPrim=a.replace(regExp.alpha,"");const bAlpha=bPrim=b.replace(regExp.alpha,""),aNumericVal=a.replace(regExp.numeric,""),bNumericVal=b.replace(regExp.numeric,""),aNumeric=aSec=""!==aNumericVal?parseInt(aNumericVal,10):Number.MAX_VALUE,bNumeric=bSec=""!==bNumericVal?parseInt(bNumericVal,10):Number.MAX_VALUE;return alphaFirst||(aPrim=aNumeric,bPrim=bNumeric,aSec=aAlpha,bSec=bAlpha),aPrim===bPrim?aSec===bSec?0:aSec>bSec?1:-1:aPrim>bPrim?1:-1}function isSameArray(array1,array2){return array1.length===array2.length&&array1.every((element=>array2.includes(element)))}},"./src/types/sdk.ts":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.d(__webpack_exports__,{IoU:()=>LabwareState,NN7:()=>LifeStage,W_V:()=>PassFail,mDe:()=>ControlType,xMG:()=>getSdk});var graphql_request__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__("./node_modules/graphql-request/build/esm/index.js");let LabwareState=function(LabwareState){return LabwareState.Empty="empty",LabwareState.Active="active",LabwareState.Discarded="discarded",LabwareState.Released="released",LabwareState.Destroyed="destroyed",LabwareState.Used="used",LabwareState}({}),PassFail=function(PassFail){return PassFail.Pass="pass",PassFail.Fail="fail",PassFail}({}),ControlType=function(ControlType){return ControlType.Positive="positive",ControlType.Negative="negative",ControlType}({}),LifeStage=function(LifeStage){return LifeStage.Adult="adult",LifeStage.Paediatric="paediatric",LifeStage.Fetal="fetal",LifeStage}({});graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    fragment AddressPermDataFields on AddressPermData {
  address
  controlType
  seconds
  selected
}
    `;const CommentFieldsFragmentDoc=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    fragment CommentFields on Comment {
  id
  text
  category
  enabled
}
    `,DestructionReasonFieldsFragmentDoc=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    fragment DestructionReasonFields on DestructionReason {
  id
  text
  enabled
}
    `,EquipmentFieldsFragmentDoc=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    fragment EquipmentFields on Equipment {
  id
  name
  category
  enabled
}
    `,AnalyserScanDataFieldsFragmentDoc=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    fragment AnalyserScanDataFields on AnalyserScanData {
  workNumbers
  probes
  cellSegmentationRecorded
}
    `,FileFieldsFragmentDoc=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    fragment FileFields on StanFile {
  created
  name
  url
  work {
    workNumber
  }
}
    `,HmdmcFieldsFragmentDoc=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    fragment HmdmcFields on Hmdmc {
  hmdmc
  enabled
}
    `,GraphSvgFieldsFragmentDoc=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    fragment GraphSVGFields on GraphSVG {
  svg
}
    `,BioRiskFieldsFragmentDoc=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    fragment BioRiskFields on BioRisk {
  code
  enabled
}
    `,LabwareTypeFieldsFragmentDoc=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    fragment LabwareTypeFields on LabwareType {
  name
  numRows
  numColumns
  labelType {
    name
  }
}
    `,SampleFieldsFragmentDoc=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    fragment SampleFields on Sample {
  id
  section
  tissue {
    donor {
      donorName
      lifeStage
    }
    externalName
    spatialLocation {
      tissueType {
        name
      }
      code
      name
    }
    hmdmc {
      hmdmc
    }
    replicate
    medium {
      name
    }
    fixative {
      name
      enabled
    }
    collectionDate
  }
  bioState {
    name
  }
}
    `,SlotFieldsFragmentDoc=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    fragment SlotFields on Slot {
  id
  address
  labwareId
  samples {
    ...SampleFields
  }
  blockHighestSection
  block
}
    `,LabwareFieldsFragmentDoc=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    fragment LabwareFields on Labware {
  id
  barcode
  externalBarcode
  destroyed
  discarded
  released
  state
  created
  labwareType {
    ...LabwareTypeFields
  }
  slots {
    ...SlotFields
  }
}
    `,HistoryEntryFieldsFragmentDoc=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    fragment HistoryEntryFields on HistoryEntry {
  destinationLabwareId
  details
  eventId
  sampleId
  sourceLabwareId
  time
  username
  type
  workNumber
  address
  region
}
    `,HistoryFieldsFragmentDoc=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    fragment HistoryFields on History {
  labware {
    ...LabwareFields
  }
  samples {
    ...SampleFields
  }
  entries {
    ...HistoryEntryFields
  }
  flaggedBarcodes
}
    `,RoiFieldsFragmentDoc=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    fragment RoiFields on Roi {
  sample {
    ...SampleFields
  }
  address
  roi
}
    `,LabwareRoiFieldsFragmentDoc=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    fragment LabwareRoiFields on LabwareRoi {
  barcode
  rois {
    ...RoiFields
  }
}
    `,NextReplicateDataFieldsFragmentDoc=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    fragment NextReplicateDataFields on NextReplicateData {
  barcodes
  donorId
  nextReplicateNumber
  spatialLocationId
}
    `,LinkedLocationFieldsFragmentDoc=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    fragment LinkedLocationFields on LinkedLocation {
  barcode
  fixedName
  customName
  address
  numStored
  leaf
}
    `,LocationFieldsFragmentDoc=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    fragment LocationFields on Location {
  barcode
  fixedName
  customName
  address
  direction
  numStored
  leaf
  parent {
    barcode
    fixedName
    customName
  }
  size {
    numRows
    numColumns
  }
  stored {
    barcode
    address
  }
  children {
    ...LinkedLocationFields
  }
}
    `,PlanActionFieldsFragmentDoc=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    fragment PlanActionFields on PlanAction {
  newSection
  sample {
    id
  }
  source {
    address
    labwareId
    samples {
      id
    }
  }
  destination {
    address
    labwareId
  }
}
    `,ActionFieldsFragmentDoc=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    fragment ActionFields on Action {
  source {
    ...SlotFields
  }
  destination {
    ...SlotFields
  }
  operationId
  sample {
    ...SampleFields
  }
}
    `,UserFieldsFragmentDoc=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    fragment UserFields on User {
  username
  role
}
    `,OperationFieldsFragmentDoc=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    fragment OperationFields on Operation {
  id
  operationType {
    name
  }
  actions {
    ...ActionFields
  }
  user {
    ...UserFields
  }
  performed
}
    `,PrinterFieldsFragmentDoc=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    fragment PrinterFields on Printer {
  name
  labelTypes {
    name
  }
}
    `,ReagentSlotFieldsFragmentDoc=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    fragment ReagentSlotFields on ReagentSlot {
  address
  used
}
    `,FixativeFieldsFragmentDoc=(graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    fragment ReagentPlateFields on ReagentPlate {
  barcode
  slots {
    ...ReagentSlotFields
  }
  plateType
}
    `,graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    fragment FixativeFields on Fixative {
  name
  enabled
}
    `),RegisterResultFieldsFragmentDoc=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    fragment RegisterResultFields on RegisterResult {
  labware {
    ...LabwareFields
  }
  clashes {
    tissue {
      externalName
      donor {
        donorName
      }
      spatialLocation {
        code
        name
        tissueType {
          name
        }
      }
    }
    labware {
      barcode
      labwareType {
        name
      }
    }
  }
  labwareSolutions {
    barcode
    solutionName
  }
}
    `,LabwareFlaggedFieldsFragmentDoc=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    fragment LabwareFlaggedFields on LabwareFlagged {
  id
  barcode
  externalBarcode
  destroyed
  discarded
  released
  flagged
  state
  created
  labwareType {
    ...LabwareTypeFields
  }
  slots {
    ...SlotFields
  }
}
    `,ProbePanelFieldsFragmentDoc=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    fragment ProbePanelFields on ProbePanel {
  name
  enabled
}
    `,ReleaseDestinationFieldsFragmentDoc=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    fragment ReleaseDestinationFields on ReleaseDestination {
  name
  enabled
}
    `,SlotPassFailFieldsFragmentDoc=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    fragment SlotPassFailFields on SlotPassFail {
  address
  result
  comment
}
    `,SolutionFieldsFragmentDoc=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    fragment SolutionFields on Solution {
  name
  enabled
}
    `,SlotRegionFieldsFragmentDoc=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    fragment SlotRegionFields on SlotRegion {
  enabled
  name
}
    `,SamplePositionFieldsFragmentDoc=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    fragment SamplePositionFields on SamplePosition {
  address
  region
  sampleId
  slotId
  operationId
}
    `,SpeciesFieldsFragmentDoc=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    fragment SpeciesFields on Species {
  name
  enabled
}
    `,StainTypeFieldsFragmentDoc=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    fragment StainTypeFields on StainType {
  name
  measurementTypes
}
    `,SuggestedWorkFieldsFragmentDoc=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    fragment SuggestedWorkFields on SuggestedWork {
  barcode
  workNumber
}
    `,ReleaseFileOptionFieldsFragmentDoc=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    fragment ReleaseFileOptionFields on ReleaseFileOption {
  displayName
  queryParamName
}
    `,ReleaseRecipientFieldsFragmentDoc=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    fragment ReleaseRecipientFields on ReleaseRecipient {
  username
  fullName
  enabled
}
    `,ProjectFieldsFragmentDoc=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    fragment ProjectFields on Project {
  name
  enabled
}
    `,ProgramFieldsFragmentDoc=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    fragment ProgramFields on Program {
  name
  enabled
}
    `,CostCodeFieldsFragmentDoc=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    fragment CostCodeFields on CostCode {
  code
  enabled
}
    `,WorkTypeFieldsFragmentDoc=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    fragment WorkTypeFields on WorkType {
  name
  enabled
}
    `,OmeroProjectFieldsFragmentDoc=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    fragment OmeroProjectFields on OmeroProject {
  name
  enabled
}
    `,DnapStudyFieldsFragmentDoc=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    fragment DnapStudyFields on DnapStudy {
  ssId
  name
  enabled
}
    `,WorkFieldsFragmentDoc=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    fragment WorkFields on Work {
  workNumber
  status
  workRequester {
    ...ReleaseRecipientFields
  }
  project {
    ...ProjectFields
  }
  program {
    ...ProgramFields
  }
  costCode {
    ...CostCodeFields
  }
  workType {
    ...WorkTypeFields
  }
  omeroProject {
    ...OmeroProjectFields
  }
  dnapStudy {
    ...DnapStudyFields
  }
  numBlocks
  numSlides
  numOriginalSamples
  priority
}
    `,WorkProgressTimeStampFieldFragmentDoc=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    fragment WorkProgressTimeStampField on WorkProgressTimestamp {
  type
  timestamp
}
    `,WorkProgressFieldsFragmentDoc=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    fragment WorkProgressFields on WorkProgress {
  work {
    ...WorkFields
  }
  timestamps {
    ...WorkProgressTimeStampField
  }
  mostRecentOperation
  workComment
}
    `,WorkWithCommentFieldsFragmentDoc=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    fragment WorkWithCommentFields on WorkWithComment {
  work {
    ...WorkFields
  }
  comment
}
    `,WorkSummaryGroupFieldsFragmentDoc=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    fragment WorkSummaryGroupFields on WorkSummaryGroup {
  workType {
    ...WorkTypeFields
  }
  numWorks
  status
  totalNumBlocks
  totalNumSlides
  totalNumOriginalSamples
}
    `,ExtractResultDocument=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    query ExtractResult($barcode: String!) {
  extractResult(barcode: $barcode) {
    result
    concentration
    labware {
      ...LabwareFlaggedFields
    }
  }
}
    ${LabwareFlaggedFieldsFragmentDoc}
${LabwareTypeFieldsFragmentDoc}
${SlotFieldsFragmentDoc}
${SampleFieldsFragmentDoc}`,CurrentUserDocument=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    query CurrentUser {
  user {
    ...UserFields
  }
}
    ${UserFieldsFragmentDoc}`,FindFlaggedLabwareDocument=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    query FindFlaggedLabware($barcode: String!) {
  labwareFlagged(barcode: $barcode) {
    ...LabwareFlaggedFields
  }
}
    ${LabwareFlaggedFieldsFragmentDoc}
${LabwareTypeFieldsFragmentDoc}
${SlotFieldsFragmentDoc}
${SampleFieldsFragmentDoc}`,FindFilesDocument=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    query FindFiles($workNumbers: [String!]!) {
  listFiles(workNumbers: $workNumbers) {
    ...FileFields
  }
}
    ${FileFieldsFragmentDoc}`,FindHistoryForExternalNameDocument=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    query FindHistoryForExternalName($externalName: String!) {
  historyForExternalName(externalName: $externalName) {
    ...HistoryFields
  }
}
    ${HistoryFieldsFragmentDoc}
${LabwareFieldsFragmentDoc}
${LabwareTypeFieldsFragmentDoc}
${SlotFieldsFragmentDoc}
${SampleFieldsFragmentDoc}
${HistoryEntryFieldsFragmentDoc}`,FindHistoryForWorkNumberDocument=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    query FindHistoryForWorkNumber($workNumber: String!) {
  historyForWorkNumber(workNumber: $workNumber) {
    ...HistoryFields
  }
}
    ${HistoryFieldsFragmentDoc}
${LabwareFieldsFragmentDoc}
${LabwareTypeFieldsFragmentDoc}
${SlotFieldsFragmentDoc}
${SampleFieldsFragmentDoc}
${HistoryEntryFieldsFragmentDoc}`,FindHistoryDocument=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    query FindHistory($workNumber: String, $barcode: String, $donorName: [String!], $externalName: [String!], $eventType: String) {
  history(
    workNumber: $workNumber
    barcode: $barcode
    donorName: $donorName
    externalName: $externalName
    eventType: $eventType
  ) {
    ...HistoryFields
  }
}
    ${HistoryFieldsFragmentDoc}
${LabwareFieldsFragmentDoc}
${LabwareTypeFieldsFragmentDoc}
${SlotFieldsFragmentDoc}
${SampleFieldsFragmentDoc}
${HistoryEntryFieldsFragmentDoc}`,FindHistoryForDonorNameDocument=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    query FindHistoryForDonorName($donorName: String!) {
  historyForDonorName(donorName: $donorName) {
    ...HistoryFields
  }
}
    ${HistoryFieldsFragmentDoc}
${LabwareFieldsFragmentDoc}
${LabwareTypeFieldsFragmentDoc}
${SlotFieldsFragmentDoc}
${SampleFieldsFragmentDoc}
${HistoryEntryFieldsFragmentDoc}`,FindDocument=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    query Find($request: FindRequest!) {
  find(request: $request) {
    numRecords
    entries {
      labwareId
      sampleId
      workNumbers
    }
    samples {
      id
      section
      tissue {
        replicate
        spatialLocation {
          tissueType {
            name
          }
        }
        externalName
        donor {
          donorName
        }
        medium {
          name
        }
        fixative {
          name
        }
      }
    }
    labware {
      id
      barcode
      created
      labwareType {
        name
      }
    }
    locations {
      id
      barcode
      customName
      fixedName
      direction
      size {
        numRows
        numColumns
      }
      qualifiedNameWithFirstBarcode
    }
    labwareLocations {
      labwareId
      locationId
      address
    }
  }
}
    `,FindHistoryForSampleIdDocument=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    query FindHistoryForSampleId($sampleId: Int!) {
  historyForSampleId(sampleId: $sampleId) {
    ...HistoryFields
  }
}
    ${HistoryFieldsFragmentDoc}
${LabwareFieldsFragmentDoc}
${LabwareTypeFieldsFragmentDoc}
${SlotFieldsFragmentDoc}
${SampleFieldsFragmentDoc}
${HistoryEntryFieldsFragmentDoc}`,FindLabwareDocument=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    query FindLabware($barcode: String!) {
  labware(barcode: $barcode) {
    ...LabwareFields
  }
}
    ${LabwareFieldsFragmentDoc}
${LabwareTypeFieldsFragmentDoc}
${SlotFieldsFragmentDoc}
${SampleFieldsFragmentDoc}`,FindHistoryForLabwareBarcodeDocument=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    query FindHistoryForLabwareBarcode($barcode: String!) {
  historyForLabwareBarcode(barcode: $barcode) {
    ...HistoryFields
  }
}
    ${HistoryFieldsFragmentDoc}
${LabwareFieldsFragmentDoc}
${LabwareTypeFieldsFragmentDoc}
${SlotFieldsFragmentDoc}
${SampleFieldsFragmentDoc}
${HistoryEntryFieldsFragmentDoc}`,FindHistoryGraphDocument=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    query FindHistoryGraph($workNumber: String, $barcode: String, $donorName: [String!], $externalName: [String!], $zoom: Float, $fontSize: Int) {
  historyGraph(
    workNumber: $workNumber
    barcode: $barcode
    donorName: $donorName
    externalName: $externalName
    zoom: $zoom
    fontSize: $fontSize
  ) {
    ...GraphSVGFields
  }
}
    ${GraphSvgFieldsFragmentDoc}`,FindPassFailsDocument=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    query FindPassFails($barcode: String!, $operationType: String!) {
  passFails(barcode: $barcode, operationType: $operationType) {
    operation {
      ...OperationFields
    }
    slotPassFails {
      ...SlotPassFailFields
    }
  }
}
    ${OperationFieldsFragmentDoc}
${ActionFieldsFragmentDoc}
${SlotFieldsFragmentDoc}
${SampleFieldsFragmentDoc}
${UserFieldsFragmentDoc}
${SlotPassFailFieldsFragmentDoc}`,FindLabwareLocationDocument=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    query FindLabwareLocation($barcodes: [String!]!) {
  stored(barcodes: $barcodes) {
    location {
      barcode
    }
  }
}
    `,FindLocationByBarcodeDocument=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    query FindLocationByBarcode($barcode: String!) {
  location(locationBarcode: $barcode) {
    ...LocationFields
  }
}
    ${LocationFieldsFragmentDoc}
${LinkedLocationFieldsFragmentDoc}`,FindReagentPlateDocument=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    query FindReagentPlate($barcode: String!) {
  reagentPlate(barcode: $barcode) {
    barcode
    slots {
      ...ReagentSlotFields
    }
    plateType
  }
}
    ${ReagentSlotFieldsFragmentDoc}`,FindStoragePathDocument=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    query FindStoragePath($locationBarcode: String!) {
  storagePath(locationBarcode: $locationBarcode) {
    ...LinkedLocationFields
  }
}
    ${LinkedLocationFieldsFragmentDoc}`,FindSamplePositionsDocument=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    query FindSamplePositions($labwareBarcode: String!) {
  samplePositions(labwareBarcode: $labwareBarcode) {
    ...SamplePositionFields
  }
}
    ${SamplePositionFieldsFragmentDoc}`,FindPermDataDocument=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    query FindPermData($barcode: String!) {
  visiumPermData(barcode: $barcode) {
    labware {
      ...LabwareFlaggedFields
    }
    addressPermData {
      address
      controlType
      seconds
      selected
    }
    samplePositionResults {
      ...SamplePositionFields
    }
  }
}
    ${LabwareFlaggedFieldsFragmentDoc}
${LabwareTypeFieldsFragmentDoc}
${SlotFieldsFragmentDoc}
${SampleFieldsFragmentDoc}
${SamplePositionFieldsFragmentDoc}`,FindWorkInfoDocument=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    query FindWorkInfo($status: WorkStatus!) {
  works(status: [$status]) {
    workNumber
    workRequester {
      username
    }
    project {
      name
    }
  }
}
    `,FindWorkNumbersDocument=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    query FindWorkNumbers($status: WorkStatus!) {
  works(status: [$status]) {
    workNumber
  }
}
    `,FindWorksCreatedByDocument=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    query FindWorksCreatedBy($username: String!) {
  worksCreatedBy(username: $username) {
    ...WorkFields
  }
}
    ${WorkFieldsFragmentDoc}
${ReleaseRecipientFieldsFragmentDoc}
${ProjectFieldsFragmentDoc}
${ProgramFieldsFragmentDoc}
${CostCodeFieldsFragmentDoc}
${WorkTypeFieldsFragmentDoc}
${OmeroProjectFieldsFragmentDoc}
${DnapStudyFieldsFragmentDoc}`,FindWorkProgressDocument=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    query FindWorkProgress($workNumber: String, $workTypes: [String!], $programs: [String!], $statuses: [WorkStatus!], $requesters: [String!]) {
  workProgress(
    workNumber: $workNumber
    workTypes: $workTypes
    programs: $programs
    statuses: $statuses
    requesters: $requesters
  ) {
    ...WorkProgressFields
  }
}
    ${WorkProgressFieldsFragmentDoc}
${WorkFieldsFragmentDoc}
${ReleaseRecipientFieldsFragmentDoc}
${ProjectFieldsFragmentDoc}
${ProgramFieldsFragmentDoc}
${CostCodeFieldsFragmentDoc}
${WorkTypeFieldsFragmentDoc}
${OmeroProjectFieldsFragmentDoc}
${DnapStudyFieldsFragmentDoc}
${WorkProgressTimeStampFieldFragmentDoc}`,FindPlanDataDocument=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    query FindPlanData($barcode: String!) {
  planData(barcode: $barcode) {
    sources {
      ...LabwareFlaggedFields
    }
    destination {
      ...LabwareFlaggedFields
    }
    plan {
      operationType {
        name
      }
      planActions {
        ...PlanActionFields
      }
    }
  }
}
    ${LabwareFlaggedFieldsFragmentDoc}
${LabwareTypeFieldsFragmentDoc}
${SlotFieldsFragmentDoc}
${SampleFieldsFragmentDoc}
${PlanActionFieldsFragmentDoc}`,GetAllWorkInfoDocument=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    query GetAllWorkInfo {
  works {
    workNumber
    workRequester {
      username
    }
    project {
      name
    }
    status
  }
}
    `,GetAnalyserScanDataDocument=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    query GetAnalyserScanData($barcode: String!) {
  analyserScanData(barcode: $barcode) {
    ...AnalyserScanDataFields
  }
}
    ${AnalyserScanDataFieldsFragmentDoc}`,GetBioRisksDocument=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    query GetBioRisks($includeDisabled: Boolean) {
  bioRisks(includeDisabled: $includeDisabled) {
    ...BioRiskFields
  }
}
    ${BioRiskFieldsFragmentDoc}`,GetCleanedOutAddressesDocument=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    query GetCleanedOutAddresses($barcode: String!) {
  cleanedOutAddresses(barcode: $barcode)
}
    `,GetCommentsDocument=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    query GetComments($commentCategory: String, $includeDisabled: Boolean) {
  comments(category: $commentCategory, includeDisabled: $includeDisabled) {
    ...CommentFields
  }
}
    ${CommentFieldsFragmentDoc}`,FindLatestOperationDocument=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    query FindLatestOperation($barcode: String!, $operationType: String!) {
  findLatestOp(barcode: $barcode, operationType: $operationType) {
    id
  }
}
    `,FindMeasurementByBarcodeAndNameDocument=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    query FindMeasurementByBarcodeAndName($barcode: String!, $measurementName: String!) {
  measurementValueFromLabwareOrParent(barcode: $barcode, name: $measurementName) {
    address
    string
  }
}
    `,GetDestructionReasonsDocument=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    query GetDestructionReasons($includeDisabled: Boolean) {
  destructionReasons(includeDisabled: $includeDisabled) {
    ...DestructionReasonFields
  }
}
    ${DestructionReasonFieldsFragmentDoc}`,GetDestroyInfoDocument=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    query GetDestroyInfo {
  destructionReasons {
    ...DestructionReasonFields
  }
}
    ${DestructionReasonFieldsFragmentDoc}`,GetDnapStudyDocument=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    query GetDnapStudy($ssId: Int!) {
  dnapStudy(ssId: $ssId) {
    ...DnapStudyFields
  }
}
    ${DnapStudyFieldsFragmentDoc}`,GetEquipmentsDocument=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    query GetEquipments($category: String, $includeDisabled: Boolean) {
  equipments(category: $category, includeDisabled: $includeDisabled) {
    ...EquipmentFields
  }
}
    ${EquipmentFieldsFragmentDoc}`,GetConfigurationDocument=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    query GetConfiguration {
  destructionReasons(includeDisabled: true) {
    ...DestructionReasonFields
  }
  comments(includeDisabled: true) {
    ...CommentFields
  }
  hmdmcs(includeDisabled: true) {
    ...HmdmcFields
  }
  species(includeDisabled: true) {
    ...SpeciesFields
  }
  fixatives(includeDisabled: true) {
    ...FixativeFields
  }
  releaseDestinations(includeDisabled: true) {
    ...ReleaseDestinationFields
  }
  releaseRecipients(includeDisabled: true) {
    ...ReleaseRecipientFields
  }
  projects(includeDisabled: true) {
    ...ProjectFields
  }
  costCodes(includeDisabled: true) {
    ...CostCodeFields
  }
  workTypes(includeDisabled: true) {
    ...WorkTypeFields
  }
  equipments(includeDisabled: true) {
    ...EquipmentFields
  }
  users(includeDisabled: true) {
    ...UserFields
  }
  solutions(includeDisabled: true) {
    ...SolutionFields
  }
  probePanels(includeDisabled: true) {
    ...ProbePanelFields
  }
  programs(includeDisabled: true) {
    ...ProgramFields
  }
  omeroProjects(includeDisabled: true) {
    ...OmeroProjectFields
  }
  dnapStudies(includeDisabled: true) {
    ...DnapStudyFields
  }
  bioRisks(includeDisabled: true) {
    ...BioRiskFields
  }
}
    ${DestructionReasonFieldsFragmentDoc}
${CommentFieldsFragmentDoc}
${HmdmcFieldsFragmentDoc}
${SpeciesFieldsFragmentDoc}
${FixativeFieldsFragmentDoc}
${ReleaseDestinationFieldsFragmentDoc}
${ReleaseRecipientFieldsFragmentDoc}
${ProjectFieldsFragmentDoc}
${CostCodeFieldsFragmentDoc}
${WorkTypeFieldsFragmentDoc}
${EquipmentFieldsFragmentDoc}
${UserFieldsFragmentDoc}
${SolutionFieldsFragmentDoc}
${ProbePanelFieldsFragmentDoc}
${ProgramFieldsFragmentDoc}
${OmeroProjectFieldsFragmentDoc}
${DnapStudyFieldsFragmentDoc}
${BioRiskFieldsFragmentDoc}`,GetBlockProcessingInfoDocument=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    query GetBlockProcessingInfo {
  mediums {
    name
  }
  comments(includeDisabled: false, category: "Sample Processing") {
    ...CommentFields
  }
  labwareTypes {
    ...LabwareTypeFields
  }
}
    ${CommentFieldsFragmentDoc}
${LabwareTypeFieldsFragmentDoc}`,GetLabwareCostingDocument=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    query GetLabwareCosting($barcode: String!) {
  labwareCosting(barcode: $barcode)
}
    `,GetEventTypesDocument=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    query GetEventTypes {
  eventTypes
}
    `,GetParaffinProcessingInfoDocument=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    query GetParaffinProcessingInfo {
  comments(includeDisabled: false, category: "Paraffin processing program") {
    ...CommentFields
  }
}
    ${CommentFieldsFragmentDoc}`,GetLabwareInLocationDocument=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    query GetLabwareInLocation($locationBarcode: String!) {
  labwareInLocation(locationBarcode: $locationBarcode) {
    ...LabwareFields
  }
}
    ${LabwareFieldsFragmentDoc}
${LabwareTypeFieldsFragmentDoc}
${SlotFieldsFragmentDoc}
${SampleFieldsFragmentDoc}`,GetLabwareOperationsDocument=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    query GetLabwareOperations($barcode: String!, $operationType: String!) {
  labwareOperations(barcode: $barcode, operationType: $operationType) {
    ...OperationFields
  }
}
    ${OperationFieldsFragmentDoc}
${ActionFieldsFragmentDoc}
${SlotFieldsFragmentDoc}
${SampleFieldsFragmentDoc}
${UserFieldsFragmentDoc}`,GetLabwareFlagDetailsDocument=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    query GetLabwareFlagDetails($barcodes: [String!]!) {
  labwareFlagDetails(barcodes: $barcodes) {
    barcode
    flags {
      barcode
      description
    }
  }
}
    `,GetOmeroProjectsDocument=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    query GetOmeroProjects {
  omeroProjects {
    name
    enabled
  }
}
    `,GetPotProcessingInfoDocument=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    query GetPotProcessingInfo {
  fixatives {
    name
  }
  comments(includeDisabled: false, category: "Sample Processing") {
    ...CommentFields
  }
  labwareTypes {
    ...LabwareTypeFields
  }
}
    ${CommentFieldsFragmentDoc}
${LabwareTypeFieldsFragmentDoc}`,GetPrintersDocument=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    query GetPrinters {
  printers {
    ...PrinterFields
  }
}
    ${PrinterFieldsFragmentDoc}`,GetNextReplicateNumberDocument=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    query GetNextReplicateNumber($barcodes: [String!]!) {
  nextReplicateNumbers(barcodes: $barcodes) {
    ...NextReplicateDataFields
  }
}
    ${NextReplicateDataFieldsFragmentDoc}`,GetProgramsDocument=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    query GetPrograms {
  programs {
    name
    enabled
  }
}
    `,GetRecordExtractResultInfoDocument=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    query GetRecordExtractResultInfo {
  comments(category: "extract result", includeDisabled: false) {
    ...CommentFields
  }
}
    ${CommentFieldsFragmentDoc}`,GetRegionsOfInterestDocument=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    query GetRegionsOfInterest($barcodes: [String!]!) {
  rois(barcodes: $barcodes) {
    ...LabwareRoiFields
  }
}
    ${LabwareRoiFieldsFragmentDoc}
${RoiFieldsFragmentDoc}
${SampleFieldsFragmentDoc}`,GetProbePanelsDocument=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    query GetProbePanels {
  probePanels {
    name
    enabled
  }
}
    `,GetReleaseInfoDocument=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    query GetReleaseInfo {
  releaseDestinations {
    ...ReleaseDestinationFields
  }
  releaseRecipients {
    ...ReleaseRecipientFields
  }
  releaseColumnOptions {
    ...ReleaseFileOptionFields
  }
}
    ${ReleaseDestinationFieldsFragmentDoc}
${ReleaseRecipientFieldsFragmentDoc}
${ReleaseFileOptionFieldsFragmentDoc}`,GetReleaseColumnOptionsDocument=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    query GetReleaseColumnOptions {
  releaseColumnOptions {
    ...ReleaseFileOptionFields
  }
}
    ${ReleaseFileOptionFieldsFragmentDoc}`,GetRegistrationInfoDocument=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    query GetRegistrationInfo {
  species {
    name
  }
  hmdmcs {
    hmdmc
  }
  labwareTypes {
    ...LabwareTypeFields
  }
  tissueTypes {
    name
    spatialLocations {
      name
      code
    }
  }
  fixatives {
    name
  }
  mediums {
    name
  }
  solutions {
    name
  }
  slotRegions {
    name
  }
  bioRisks {
    code
  }
}
    ${LabwareTypeFieldsFragmentDoc}`,GetRecordInPlaceInfoDocument=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    query GetRecordInPlaceInfo($category: String) {
  equipments(includeDisabled: false, category: $category) {
    ...EquipmentFields
  }
}
    ${EquipmentFieldsFragmentDoc}`,GetSectioningInfoDocument=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    query GetSectioningInfo {
  labwareTypes {
    ...LabwareTypeFields
  }
}
    ${LabwareTypeFieldsFragmentDoc}`,GetSectioningConfirmInfoDocument=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    query GetSectioningConfirmInfo {
  comments(category: "section") {
    ...CommentFields
  }
  slotRegions(includeDisabled: false) {
    ...SlotRegionFields
  }
}
    ${CommentFieldsFragmentDoc}
${SlotRegionFieldsFragmentDoc}`,GetSolutionTransferInfoDocument=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    query GetSolutionTransferInfo {
  solutions {
    name
  }
}
    `,GetStainInfoDocument=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    query GetStainInfo {
  stainTypes {
    ...StainTypeFields
  }
}
    ${StainTypeFieldsFragmentDoc}`,GetSampleProcessingCommentsInfoDocument=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    query GetSampleProcessingCommentsInfo {
  comments: comments(includeDisabled: false, category: "Sample Processing") {
    ...CommentFields
  }
}
    ${CommentFieldsFragmentDoc}`,GetStainingQcInfoDocument=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    query GetStainingQCInfo {
  comments(includeDisabled: false, category: "stain QC") {
    ...CommentFields
  }
}
    ${CommentFieldsFragmentDoc}`,GetRunNamesDocument=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    query GetRunNames($barcode: String!) {
  runNames(barcode: $barcode)
}
    `,GetVisiumQcInfoDocument=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    query GetVisiumQCInfo {
  comments(includeDisabled: false, category: "Visium QC") {
    ...CommentFields
  }
}
    ${CommentFieldsFragmentDoc}`,GetRunRoisDocument=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    query GetRunRois($barcode: String!, $run: String!) {
  runRois(barcode: $barcode, run: $run) {
    ...RoiFields
  }
}
    ${RoiFieldsFragmentDoc}
${SampleFieldsFragmentDoc}`,GetSlotRegionsDocument=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    query GetSlotRegions($includeDisabled: Boolean) {
  slotRegions(includeDisabled: $includeDisabled) {
    name
    enabled
  }
}
    `,GetSuggestedLabwareForWorkDocument=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    query GetSuggestedLabwareForWork($workNumber: String!, $forRelease: Boolean) {
  suggestedLabwareForWork(workNumber: $workNumber, forRelease: $forRelease) {
    ...LabwareFields
  }
}
    ${LabwareFieldsFragmentDoc}
${LabwareTypeFieldsFragmentDoc}
${SlotFieldsFragmentDoc}
${SampleFieldsFragmentDoc}`,GetSearchInfoDocument=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    query GetSearchInfo {
  tissueTypes {
    name
  }
  labwareTypes {
    name
  }
  species {
    name
  }
}
    `,GetStainReagentTypesDocument=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    query GetStainReagentTypes {
  stainReagentTypes {
    ...CommentFields
  }
}
    ${CommentFieldsFragmentDoc}`,GetWorkNumbersDocument=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    query GetWorkNumbers {
  works {
    workNumber
  }
}
    `,GetWorkProgressInputsDocument=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    query GetWorkProgressInputs {
  workTypes(includeDisabled: true) {
    name
  }
  programs(includeDisabled: true) {
    name
  }
  releaseRecipients(includeDisabled: true) {
    username
  }
}
    `,GetWorkAllocationInfoDocument=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    query GetWorkAllocationInfo($commentCategory: String!, $workStatuses: [WorkStatus!]) {
  projects(includeDisabled: false) {
    ...ProjectFields
  }
  programs(includeDisabled: false) {
    ...ProgramFields
  }
  costCodes(includeDisabled: false) {
    ...CostCodeFields
  }
  worksWithComments(status: $workStatuses) {
    ...WorkWithCommentFields
  }
  workTypes {
    ...WorkTypeFields
  }
  comments(category: $commentCategory, includeDisabled: false) {
    ...CommentFields
  }
  releaseRecipients(includeDisabled: false) {
    ...ReleaseRecipientFields
  }
  omeroProjects(includeDisabled: false) {
    ...OmeroProjectFields
  }
  dnapStudies(includeDisabled: false) {
    ...DnapStudyFields
  }
}
    ${ProjectFieldsFragmentDoc}
${ProgramFieldsFragmentDoc}
${CostCodeFieldsFragmentDoc}
${WorkWithCommentFieldsFragmentDoc}
${WorkFieldsFragmentDoc}
${ReleaseRecipientFieldsFragmentDoc}
${WorkTypeFieldsFragmentDoc}
${OmeroProjectFieldsFragmentDoc}
${DnapStudyFieldsFragmentDoc}
${CommentFieldsFragmentDoc}`,GetWorkTypesDocument=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    query GetWorkTypes {
  workTypes(includeDisabled: true) {
    name
  }
}
    `,GetWorkSummaryDocument=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    query GetWorkSummary {
  worksSummary {
    workSummaryGroups {
      ...WorkSummaryGroupFields
    }
    workTypes {
      name
    }
  }
}
    ${WorkSummaryGroupFieldsFragmentDoc}
${WorkTypeFieldsFragmentDoc}`,GetSuggestedWorkForLabwareDocument=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    query GetSuggestedWorkForLabware($barcodes: [String!]!, $includeInactive: Boolean) {
  suggestedWorkForLabware(barcodes: $barcodes, includeInactive: $includeInactive) {
    suggestedWorks {
      ...SuggestedWorkFields
    }
  }
}
    ${SuggestedWorkFieldsFragmentDoc}`,GetXeniumQcInfoDocument=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    query GetXeniumQCInfo {
  comments(includeDisabled: false, category: "Xenium analyser QC") {
    ...CommentFields
  }
}
    ${CommentFieldsFragmentDoc}`,AddDestructionReasonDocument=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    mutation AddDestructionReason($text: String!) {
  addDestructionReason(text: $text) {
    ...DestructionReasonFields
  }
}
    ${DestructionReasonFieldsFragmentDoc}`,AddBioRiskDocument=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    mutation AddBioRisk($code: String!) {
  addBioRisk(code: $code) {
    ...BioRiskFields
  }
}
    ${BioRiskFieldsFragmentDoc}`,AddCommentDocument=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    mutation AddComment($category: String!, $text: String!) {
  addComment(category: $category, text: $text) {
    ...CommentFields
  }
}
    ${CommentFieldsFragmentDoc}`,AddFixativeDocument=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    mutation AddFixative($name: String!) {
  addFixative(name: $name) {
    ...FixativeFields
  }
}
    ${FixativeFieldsFragmentDoc}`,AddEquipmentDocument=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    mutation AddEquipment($category: String!, $name: String!) {
  addEquipment(category: $category, name: $name) {
    ...EquipmentFields
  }
}
    ${EquipmentFieldsFragmentDoc}`,AddHmdmcDocument=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    mutation AddHmdmc($hmdmc: String!) {
  addHmdmc(hmdmc: $hmdmc) {
    ...HmdmcFields
  }
}
    ${HmdmcFieldsFragmentDoc}`,AddProjectDocument=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    mutation AddProject($name: String!) {
  addProject(name: $name) {
    ...ProjectFields
  }
}
    ${ProjectFieldsFragmentDoc}`,AddOmeroProjectDocument=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    mutation AddOmeroProject($name: String!) {
  addOmeroProject(name: $name) {
    ...OmeroProjectFields
  }
}
    ${OmeroProjectFieldsFragmentDoc}`,AddExternalIdDocument=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    mutation AddExternalID($request: AddExternalIDRequest!) {
  addExternalID(request: $request) {
    operations {
      operationType {
        name
      }
      user {
        username
      }
      performed
    }
  }
}
    `,AddReleaseDestinationDocument=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    mutation AddReleaseDestination($name: String!) {
  addReleaseDestination(name: $name) {
    ...ReleaseDestinationFields
  }
}
    ${ReleaseDestinationFieldsFragmentDoc}`,AddProbePanelDocument=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    mutation AddProbePanel($name: String!) {
  addProbePanel(name: $name) {
    ...ProbePanelFields
  }
}
    ${ProbePanelFieldsFragmentDoc}`,AddProgramDocument=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    mutation AddProgram($name: String!) {
  addProgram(name: $name) {
    ...ProgramFields
  }
}
    ${ProgramFieldsFragmentDoc}`,AddCostCodeDocument=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    mutation AddCostCode($code: String!) {
  addCostCode(code: $code) {
    ...CostCodeFields
  }
}
    ${CostCodeFieldsFragmentDoc}`,AddSolutionDocument=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    mutation AddSolution($name: String!) {
  addSolution(name: $name) {
    ...SolutionFields
  }
}
    ${SolutionFieldsFragmentDoc}`,ConfirmDocument=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    mutation Confirm($request: ConfirmOperationRequest!) {
  confirmOperation(request: $request) {
    labware {
      ...LabwareFields
    }
    operations {
      operationType {
        name
      }
      user {
        username
      }
      performed
    }
  }
}
    ${LabwareFieldsFragmentDoc}
${LabwareTypeFieldsFragmentDoc}
${SlotFieldsFragmentDoc}
${SampleFieldsFragmentDoc}`,AddSlotRegionDocument=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    mutation AddSlotRegion($name: String!) {
  addSlotRegion(name: $name) {
    ...SlotRegionFields
  }
}
    ${SlotRegionFieldsFragmentDoc}`,AddUserDocument=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    mutation AddUser($username: String!) {
  addUser(username: $username) {
    ...UserFields
  }
}
    ${UserFieldsFragmentDoc}`,AddSpeciesDocument=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    mutation AddSpecies($name: String!) {
  addSpecies(name: $name) {
    ...SpeciesFields
  }
}
    ${SpeciesFieldsFragmentDoc}`,AddWorkTypeDocument=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    mutation AddWorkType($name: String!) {
  addWorkType(name: $name) {
    ...WorkTypeFields
  }
}
    ${WorkTypeFieldsFragmentDoc}`,AddReleaseRecipientDocument=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    mutation AddReleaseRecipient($username: String!, $fullName: String) {
  addReleaseRecipient(username: $username, fullName: $fullName) {
    ...ReleaseRecipientFields
  }
}
    ${ReleaseRecipientFieldsFragmentDoc}`,DestroyDocument=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    mutation Destroy($request: DestroyRequest!) {
  destroy(request: $request) {
    destructions {
      labware {
        barcode
      }
    }
  }
}
    `,AliquotDocument=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    mutation Aliquot($request: AliquotRequest!) {
  aliquot(request: $request) {
    labware {
      ...LabwareFields
    }
    operations {
      operationType {
        name
      }
      actions {
        sample {
          id
        }
        source {
          address
          labwareId
          samples {
            id
          }
        }
        destination {
          address
          labwareId
        }
      }
    }
  }
}
    ${LabwareFieldsFragmentDoc}
${LabwareTypeFieldsFragmentDoc}
${SlotFieldsFragmentDoc}
${SampleFieldsFragmentDoc}`,ConfirmSectionDocument=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    mutation ConfirmSection($request: ConfirmSectionRequest!) {
  confirmSection(request: $request) {
    labware {
      ...LabwareFields
    }
    operations {
      operationType {
        name
      }
      user {
        username
      }
      performed
    }
  }
}
    ${LabwareFieldsFragmentDoc}
${LabwareTypeFieldsFragmentDoc}
${SlotFieldsFragmentDoc}
${SampleFieldsFragmentDoc}`,EmptyLocationDocument=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    mutation EmptyLocation($barcode: String!) {
  empty(locationBarcode: $barcode) {
    numUnstored
  }
}
    `,CreateWorkDocument=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    mutation CreateWork($prefix: String!, $workType: String!, $workRequester: String!, $project: String!, $program: String!, $costCode: String!, $numBlocks: Int, $numSlides: Int, $numOriginalSamples: Int, $omeroProject: String, $ssStudyId: Int) {
  createWork(
    prefix: $prefix
    workType: $workType
    workRequester: $workRequester
    project: $project
    program: $program
    costCode: $costCode
    numBlocks: $numBlocks
    numSlides: $numSlides
    numOriginalSamples: $numOriginalSamples
    omeroProject: $omeroProject
    ssStudyId: $ssStudyId
  ) {
    ...WorkFields
  }
}
    ${WorkFieldsFragmentDoc}
${ReleaseRecipientFieldsFragmentDoc}
${ProjectFieldsFragmentDoc}
${ProgramFieldsFragmentDoc}
${CostCodeFieldsFragmentDoc}
${WorkTypeFieldsFragmentDoc}
${OmeroProjectFieldsFragmentDoc}
${DnapStudyFieldsFragmentDoc}`,LogoutDocument=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    mutation Logout {
  logout
}
    `,ExtractDocument=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    mutation Extract($request: ExtractRequest!) {
  extract(request: $request) {
    labware {
      ...LabwareFields
    }
    operations {
      operationType {
        name
      }
      actions {
        sample {
          id
        }
        source {
          address
          labwareId
          samples {
            id
          }
        }
        destination {
          address
          labwareId
        }
      }
    }
  }
}
    ${LabwareFieldsFragmentDoc}
${LabwareTypeFieldsFragmentDoc}
${SlotFieldsFragmentDoc}
${SampleFieldsFragmentDoc}`,PerformParaffinProcessingDocument=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    mutation PerformParaffinProcessing($request: ParaffinProcessingRequest!) {
  performParaffinProcessing(request: $request) {
    labware {
      ...LabwareFields
    }
    operations {
      operationType {
        name
      }
      user {
        username
      }
      performed
    }
  }
}
    ${LabwareFieldsFragmentDoc}
${LabwareTypeFieldsFragmentDoc}
${SlotFieldsFragmentDoc}
${SampleFieldsFragmentDoc}`,PerformTissueBlockDocument=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    mutation PerformTissueBlock($request: TissueBlockRequest!) {
  performTissueBlock(request: $request) {
    labware {
      ...LabwareFields
    }
    operations {
      operationType {
        name
      }
      user {
        username
      }
      performed
    }
  }
}
    ${LabwareFieldsFragmentDoc}
${LabwareTypeFieldsFragmentDoc}
${SlotFieldsFragmentDoc}
${SampleFieldsFragmentDoc}`,PerformTissuePotDocument=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    mutation PerformTissuePot($request: PotProcessingRequest!) {
  performPotProcessing(request: $request) {
    labware {
      ...LabwareFields
    }
    operations {
      operationType {
        name
      }
      user {
        username
      }
      performed
    }
  }
}
    ${LabwareFieldsFragmentDoc}
${LabwareTypeFieldsFragmentDoc}
${SlotFieldsFragmentDoc}
${SampleFieldsFragmentDoc}`,PlanDocument=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    mutation Plan($request: PlanRequest!) {
  plan(request: $request) {
    labware {
      ...LabwareFields
    }
    operations {
      operationType {
        name
      }
      planActions {
        ...PlanActionFields
      }
    }
  }
}
    ${LabwareFieldsFragmentDoc}
${LabwareTypeFieldsFragmentDoc}
${SlotFieldsFragmentDoc}
${SampleFieldsFragmentDoc}
${PlanActionFieldsFragmentDoc}`,LoginDocument=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    mutation Login($username: String!, $password: String!) {
  login(username: $username, password: $password) {
    user {
      ...UserFields
    }
  }
}
    ${UserFieldsFragmentDoc}`,PerformSolutionTransferDocument=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    mutation PerformSolutionTransfer($request: SolutionTransferRequest!) {
  performSolutionTransfer(request: $request) {
    labware {
      ...LabwareFields
    }
    operations {
      operationType {
        name
      }
      user {
        username
      }
      performed
    }
  }
}
    ${LabwareFieldsFragmentDoc}
${LabwareTypeFieldsFragmentDoc}
${SlotFieldsFragmentDoc}
${SampleFieldsFragmentDoc}`,FlagLabwareDocument=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    mutation FlagLabware($request: FlagLabwareRequest!) {
  flagLabware(request: $request) {
    operations {
      id
    }
  }
}
    `,RecordComplexStainDocument=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    mutation RecordComplexStain($request: ComplexStainRequest!) {
  recordComplexStain(request: $request) {
    operations {
      id
    }
  }
}
    `,RecordExtractResultDocument=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    mutation RecordExtractResult($request: ExtractResultRequest!) {
  recordExtractResult(request: $request) {
    operations {
      id
    }
  }
}
    `,RecordCompletionDocument=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    mutation RecordCompletion($request: CompletionRequest!) {
  recordCompletion(request: $request) {
    operations {
      id
    }
  }
}
    `,RecordMetricsDocument=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    mutation RecordMetrics($request: SampleMetricsRequest!) {
  recordSampleMetrics(request: $request) {
    operations {
      id
    }
  }
}
    `,PrintDocument=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    mutation Print($barcodes: [String!]!, $printer: String!) {
  printLabware(barcodes: $barcodes, printer: $printer)
}
    `,RecordInPlaceDocument=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    mutation RecordInPlace($request: InPlaceOpRequest!) {
  recordInPlace(request: $request) {
    labware {
      ...LabwareFields
    }
  }
}
    ${LabwareFieldsFragmentDoc}
${LabwareTypeFieldsFragmentDoc}
${SlotFieldsFragmentDoc}
${SampleFieldsFragmentDoc}`,RecordOpWithSlotMeasurementsDocument=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    mutation RecordOpWithSlotMeasurements($request: OpWithSlotMeasurementsRequest!) {
  recordOpWithSlotMeasurements(request: $request) {
    operations {
      id
    }
  }
}
    `,ReactivateLabwareDocument=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    mutation ReactivateLabware($items: [ReactivateLabware!]!) {
  reactivateLabware(items: $items) {
    labware {
      barcode
      state
    }
    operations {
      id
    }
  }
}
    `,RecordOpWithSlotCommentsDocument=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    mutation RecordOpWithSlotComments($request: OpWithSlotCommentsRequest!) {
  recordOpWithSlotComments(request: $request) {
    operations {
      id
    }
  }
}
    `,RecordOrientationQcDocument=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    mutation RecordOrientationQC($request: OrientationRequest!) {
  recordOrientationQC(request: $request) {
    operations {
      id
    }
  }
}
    `,RecordLibraryPrepDocument=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    mutation RecordLibraryPrep($request: LibraryPrepRequest!) {
  libraryPrep(request: $request) {
    operations {
      id
    }
    labware {
      ...LabwareFields
    }
  }
}
    ${LabwareFieldsFragmentDoc}
${LabwareTypeFieldsFragmentDoc}
${SlotFieldsFragmentDoc}
${SampleFieldsFragmentDoc}`,RecordReagentTransferDocument=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    mutation RecordReagentTransfer($request: ReagentTransferRequest!) {
  reagentTransfer(request: $request) {
    operations {
      id
    }
  }
}
    `,RecordPermDocument=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    mutation RecordPerm($request: RecordPermRequest!) {
  recordPerm(request: $request) {
    operations {
      id
    }
  }
}
    `,RecordAnalyserDocument=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    mutation RecordAnalyser($request: AnalyserRequest!) {
  recordAnalyser(request: $request) {
    operations {
      id
    }
  }
}
    `,RecordSampleProcessingCommentsDocument=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    mutation RecordSampleProcessingComments($request: SampleProcessingCommentRequest!) {
  recordSampleProcessingComments(request: $request) {
    labware {
      ...LabwareFields
    }
    operations {
      operationType {
        name
      }
      user {
        username
      }
      performed
    }
  }
}
    ${LabwareFieldsFragmentDoc}
${LabwareTypeFieldsFragmentDoc}
${SlotFieldsFragmentDoc}
${SampleFieldsFragmentDoc}`,RecordProbeOperationDocument=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    mutation RecordProbeOperation($request: ProbeOperationRequest!) {
  recordProbeOperation(request: $request) {
    operations {
      id
    }
  }
}
    `,RecordVisiumQcDocument=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    mutation RecordVisiumQC($request: ResultRequest!) {
  recordVisiumQC(request: $request) {
    operations {
      id
    }
  }
}
    `,RecordQcLabwareDocument=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    mutation RecordQCLabware($request: QCLabwareRequest!) {
  recordQCLabware(request: $request) {
    operations {
      id
    }
  }
}
    `,RegisterOriginalSamplesDocument=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    mutation RegisterOriginalSamples($request: OriginalSampleRegisterRequest!) {
  registerOriginalSamples(request: $request) {
    ...RegisterResultFields
  }
}
    ${RegisterResultFieldsFragmentDoc}
${LabwareFieldsFragmentDoc}
${LabwareTypeFieldsFragmentDoc}
${SlotFieldsFragmentDoc}
${SampleFieldsFragmentDoc}`,RecordStainResultDocument=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    mutation RecordStainResult($request: ResultRequest!) {
  recordStainResult(request: $request) {
    operations {
      id
    }
  }
}
    `,RecordRnaAnalysisDocument=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    mutation RecordRNAAnalysis($request: RNAAnalysisRequest!) {
  recordRNAAnalysis(request: $request) {
    operations {
      id
    }
  }
}
    `,ReleaseLabwareDocument=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    mutation ReleaseLabware($releaseRequest: ReleaseRequest!) {
  release(request: $releaseRequest) {
    releases {
      id
      labware {
        barcode
      }
      destination {
        name
      }
      recipient {
        username
      }
    }
  }
}
    `,RegisterSectionsDocument=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    mutation RegisterSections($request: SectionRegisterRequest!) {
  registerSections(request: $request) {
    labware {
      ...LabwareFields
    }
  }
}
    ${LabwareFieldsFragmentDoc}
${LabwareTypeFieldsFragmentDoc}
${SlotFieldsFragmentDoc}
${SampleFieldsFragmentDoc}`,SetCommentEnabledDocument=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    mutation SetCommentEnabled($commentId: Int!, $enabled: Boolean!) {
  setCommentEnabled(commentId: $commentId, enabled: $enabled) {
    ...CommentFields
  }
}
    ${CommentFieldsFragmentDoc}`,SetDestructionReasonEnabledDocument=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    mutation SetDestructionReasonEnabled($text: String!, $enabled: Boolean!) {
  setDestructionReasonEnabled(text: $text, enabled: $enabled) {
    ...DestructionReasonFields
  }
}
    ${DestructionReasonFieldsFragmentDoc}`,SegmentationDocument=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    mutation Segmentation($request: SegmentationRequest!) {
  segmentation(request: $request) {
    operations {
      id
    }
    labware {
      ...LabwareFields
    }
  }
}
    ${LabwareFieldsFragmentDoc}
${LabwareTypeFieldsFragmentDoc}
${SlotFieldsFragmentDoc}
${SampleFieldsFragmentDoc}`,SetCostCodeEnabledDocument=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    mutation SetCostCodeEnabled($code: String!, $enabled: Boolean!) {
  setCostCodeEnabled(code: $code, enabled: $enabled) {
    ...CostCodeFields
  }
}
    ${CostCodeFieldsFragmentDoc}`,SetBioRiskEnabledDocument=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    mutation SetBioRiskEnabled($code: String!, $enabled: Boolean!) {
  setBioRiskEnabled(code: $code, enabled: $enabled) {
    ...BioRiskFields
  }
}
    ${BioRiskFieldsFragmentDoc}`,SetEquipmentEnabledDocument=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    mutation SetEquipmentEnabled($equipmentId: Int!, $enabled: Boolean!) {
  setEquipmentEnabled(equipmentId: $equipmentId, enabled: $enabled) {
    ...EquipmentFields
  }
}
    ${EquipmentFieldsFragmentDoc}`,RegisterTissuesDocument=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    mutation RegisterTissues($request: RegisterRequest!) {
  register(request: $request) {
    ...RegisterResultFields
  }
}
    ${RegisterResultFieldsFragmentDoc}
${LabwareFieldsFragmentDoc}
${LabwareTypeFieldsFragmentDoc}
${SlotFieldsFragmentDoc}
${SampleFieldsFragmentDoc}`,SetLocationCustomNameDocument=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    mutation SetLocationCustomName($locationBarcode: String!, $newCustomName: String!) {
  setLocationCustomName(
    locationBarcode: $locationBarcode
    customName: $newCustomName
  ) {
    ...LocationFields
  }
}
    ${LocationFieldsFragmentDoc}
${LinkedLocationFieldsFragmentDoc}`,RegisterAsEndUserDocument=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    mutation RegisterAsEndUser($username: String!, $password: String!) {
  registerAsEndUser(username: $username, password: $password) {
    user {
      ...UserFields
    }
  }
}
    ${UserFieldsFragmentDoc}`,SetFixativeEnabledDocument=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    mutation SetFixativeEnabled($name: String!, $enabled: Boolean!) {
  setFixativeEnabled(name: $name, enabled: $enabled) {
    ...FixativeFields
  }
}
    ${FixativeFieldsFragmentDoc}`,SetOmeroProjectEnabledDocument=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    mutation SetOmeroProjectEnabled($name: String!, $enabled: Boolean!) {
  setOmeroProjectEnabled(name: $name, enabled: $enabled) {
    ...OmeroProjectFields
  }
}
    ${OmeroProjectFieldsFragmentDoc}`,SetProjectEnabledDocument=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    mutation SetProjectEnabled($name: String!, $enabled: Boolean!) {
  setProjectEnabled(name: $name, enabled: $enabled) {
    ...ProjectFields
  }
}
    ${ProjectFieldsFragmentDoc}`,SetReleaseDestinationEnabledDocument=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    mutation SetReleaseDestinationEnabled($name: String!, $enabled: Boolean!) {
  setReleaseDestinationEnabled(name: $name, enabled: $enabled) {
    ...ReleaseDestinationFields
  }
}
    ${ReleaseDestinationFieldsFragmentDoc}`,SetReleaseRecipientEnabledDocument=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    mutation SetReleaseRecipientEnabled($username: String!, $enabled: Boolean!) {
  setReleaseRecipientEnabled(username: $username, enabled: $enabled) {
    ...ReleaseRecipientFields
  }
}
    ${ReleaseRecipientFieldsFragmentDoc}`,SetSpeciesEnabledDocument=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    mutation SetSpeciesEnabled($name: String!, $enabled: Boolean!) {
  setSpeciesEnabled(name: $name, enabled: $enabled) {
    ...SpeciesFields
  }
}
    ${SpeciesFieldsFragmentDoc}`,SetWorkTypeEnabledDocument=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    mutation SetWorkTypeEnabled($name: String!, $enabled: Boolean!) {
  setWorkTypeEnabled(name: $name, enabled: $enabled) {
    ...WorkTypeFields
  }
}
    ${WorkTypeFieldsFragmentDoc}`,SetProbePanelEnabledDocument=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    mutation SetProbePanelEnabled($name: String!, $enabled: Boolean!) {
  setProbePanelEnabled(name: $name, enabled: $enabled) {
    ...ProbePanelFields
  }
}
    ${ProbePanelFieldsFragmentDoc}`,SetSlotRegionEnabledDocument=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    mutation SetSlotRegionEnabled($name: String!, $enabled: Boolean!) {
  setSlotRegionEnabled(name: $name, enabled: $enabled) {
    ...SlotRegionFields
  }
}
    ${SlotRegionFieldsFragmentDoc}`,SetHmdmcEnabledDocument=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    mutation SetHmdmcEnabled($hmdmc: String!, $enabled: Boolean!) {
  setHmdmcEnabled(hmdmc: $hmdmc, enabled: $enabled) {
    ...HmdmcFields
  }
}
    ${HmdmcFieldsFragmentDoc}`,SetProgramEnabledDocument=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    mutation SetProgramEnabled($name: String!, $enabled: Boolean!) {
  setProgramEnabled(name: $name, enabled: $enabled) {
    ...ProgramFields
  }
}
    ${ProgramFieldsFragmentDoc}`,StainDocument=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    mutation Stain($request: StainRequest!) {
  stain(request: $request) {
    operations {
      id
    }
  }
}
    `,SetSolutionEnabledDocument=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    mutation SetSolutionEnabled($name: String!, $enabled: Boolean!) {
  setSolutionEnabled(name: $name, enabled: $enabled) {
    ...SolutionFields
  }
}
    ${SolutionFieldsFragmentDoc}`,StoreDocument=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    mutation Store($store: [StoreInput!]!, $locationBarcode: String!) {
  store(store: $store, locationBarcode: $locationBarcode) {
    ...LocationFields
  }
}
    ${LocationFieldsFragmentDoc}
${LinkedLocationFieldsFragmentDoc}`,StoreBarcodeDocument=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    mutation StoreBarcode($barcode: String!, $locationBarcode: String!, $address: Address) {
  storeBarcode(
    barcode: $barcode
    locationBarcode: $locationBarcode
    address: $address
  ) {
    location {
      ...LocationFields
    }
  }
}
    ${LocationFieldsFragmentDoc}
${LinkedLocationFieldsFragmentDoc}`,TransferLocationItemsDocument=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    mutation TransferLocationItems($sourceBarcode: String!, $destinationBarcode: String!) {
  transfer(sourceBarcode: $sourceBarcode, destinationBarcode: $destinationBarcode) {
    ...LocationFields
  }
}
    ${LocationFieldsFragmentDoc}
${LinkedLocationFieldsFragmentDoc}`,UnreleaseDocument=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    mutation Unrelease($request: UnreleaseRequest!) {
  unrelease(request: $request) {
    operations {
      id
    }
  }
}
    `,SetUserRoleDocument=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    mutation SetUserRole($username: String!, $role: UserRole!) {
  setUserRole(username: $username, role: $role) {
    ...UserFields
  }
}
    ${UserFieldsFragmentDoc}`,SlotCopyDocument=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    mutation SlotCopy($request: SlotCopyRequest!) {
  slotCopy(request: $request) {
    labware {
      ...LabwareFields
    }
  }
}
    ${LabwareFieldsFragmentDoc}
${LabwareTypeFieldsFragmentDoc}
${SlotFieldsFragmentDoc}
${SampleFieldsFragmentDoc}`,UpdateWorkOmeroProjectDocument=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    mutation UpdateWorkOmeroProject($workNumber: String!, $omeroProject: String) {
  updateWorkOmeroProject(workNumber: $workNumber, omeroProject: $omeroProject) {
    ...WorkFields
  }
}
    ${WorkFieldsFragmentDoc}
${ReleaseRecipientFieldsFragmentDoc}
${ProjectFieldsFragmentDoc}
${ProgramFieldsFragmentDoc}
${CostCodeFieldsFragmentDoc}
${WorkTypeFieldsFragmentDoc}
${OmeroProjectFieldsFragmentDoc}
${DnapStudyFieldsFragmentDoc}`,UpdateWorkNumSlidesDocument=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    mutation UpdateWorkNumSlides($workNumber: String!, $numSlides: Int) {
  updateWorkNumSlides(workNumber: $workNumber, numSlides: $numSlides) {
    ...WorkFields
  }
}
    ${WorkFieldsFragmentDoc}
${ReleaseRecipientFieldsFragmentDoc}
${ProjectFieldsFragmentDoc}
${ProgramFieldsFragmentDoc}
${CostCodeFieldsFragmentDoc}
${WorkTypeFieldsFragmentDoc}
${OmeroProjectFieldsFragmentDoc}
${DnapStudyFieldsFragmentDoc}`,UpdateDnapStudiesDocument=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    mutation UpdateDnapStudies {
  updateDnapStudies {
    ssId
    name
    enabled
  }
}
    `,UpdateWorkPriorityDocument=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    mutation UpdateWorkPriority($workNumber: String!, $priority: String) {
  updateWorkPriority(workNumber: $workNumber, priority: $priority) {
    ...WorkFields
  }
}
    ${WorkFieldsFragmentDoc}
${ReleaseRecipientFieldsFragmentDoc}
${ProjectFieldsFragmentDoc}
${ProgramFieldsFragmentDoc}
${CostCodeFieldsFragmentDoc}
${WorkTypeFieldsFragmentDoc}
${OmeroProjectFieldsFragmentDoc}
${DnapStudyFieldsFragmentDoc}`,UpdateWorkStatusDocument=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    mutation UpdateWorkStatus($workNumber: String!, $status: WorkStatus!, $commentId: Int) {
  updateWorkStatus(
    workNumber: $workNumber
    status: $status
    commentId: $commentId
  ) {
    ...WorkWithCommentFields
  }
}
    ${WorkWithCommentFieldsFragmentDoc}
${WorkFieldsFragmentDoc}
${ReleaseRecipientFieldsFragmentDoc}
${ProjectFieldsFragmentDoc}
${ProgramFieldsFragmentDoc}
${CostCodeFieldsFragmentDoc}
${WorkTypeFieldsFragmentDoc}
${OmeroProjectFieldsFragmentDoc}
${DnapStudyFieldsFragmentDoc}`,UpdateWorkNumOriginalSamplesDocument=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    mutation UpdateWorkNumOriginalSamples($workNumber: String!, $numOriginalSamples: Int) {
  updateWorkNumOriginalSamples(
    workNumber: $workNumber
    numOriginalSamples: $numOriginalSamples
  ) {
    ...WorkFields
  }
}
    ${WorkFieldsFragmentDoc}
${ReleaseRecipientFieldsFragmentDoc}
${ProjectFieldsFragmentDoc}
${ProgramFieldsFragmentDoc}
${CostCodeFieldsFragmentDoc}
${WorkTypeFieldsFragmentDoc}
${OmeroProjectFieldsFragmentDoc}
${DnapStudyFieldsFragmentDoc}`,UpdateReleaseRecipientFullNameDocument=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    mutation UpdateReleaseRecipientFullName($username: String!, $fullName: String) {
  updateReleaseRecipientFullName(username: $username, fullName: $fullName) {
    ...ReleaseRecipientFields
  }
}
    ${ReleaseRecipientFieldsFragmentDoc}`,VisiumAnalysisDocument=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    mutation VisiumAnalysis($request: VisiumAnalysisRequest!) {
  visiumAnalysis(request: $request) {
    operations {
      id
    }
  }
}
    `,UpdateWorkDnapStudyDocument=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    mutation UpdateWorkDnapStudy($workNumber: String!, $ssStudyId: Int) {
  updateWorkDnapStudy(workNumber: $workNumber, ssStudyId: $ssStudyId) {
    ...WorkFields
  }
}
    ${WorkFieldsFragmentDoc}
${ReleaseRecipientFieldsFragmentDoc}
${ProjectFieldsFragmentDoc}
${ProgramFieldsFragmentDoc}
${CostCodeFieldsFragmentDoc}
${WorkTypeFieldsFragmentDoc}
${OmeroProjectFieldsFragmentDoc}
${DnapStudyFieldsFragmentDoc}`,UnstoreBarcodeDocument=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    mutation UnstoreBarcode($barcode: String!) {
  unstoreBarcode(barcode: $barcode) {
    barcode
    address
  }
}
    `,UpdateWorkNumBlocksDocument=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    mutation UpdateWorkNumBlocks($workNumber: String!, $numBlocks: Int) {
  updateWorkNumBlocks(workNumber: $workNumber, numBlocks: $numBlocks) {
    ...WorkFields
  }
}
    ${WorkFieldsFragmentDoc}
${ReleaseRecipientFieldsFragmentDoc}
${ProjectFieldsFragmentDoc}
${ProgramFieldsFragmentDoc}
${CostCodeFieldsFragmentDoc}
${WorkTypeFieldsFragmentDoc}
${OmeroProjectFieldsFragmentDoc}
${DnapStudyFieldsFragmentDoc}`,CleanOutDocument=graphql_request__WEBPACK_IMPORTED_MODULE_0__.J1`
    mutation CleanOut($request: CleanOutRequest!) {
  cleanOut(request: $request) {
    operations {
      id
    }
  }
}
    `,defaultWrapper=(action,_operationName,_operationType,_variables)=>action();function getSdk(client){let withWrapper=arguments.length>1&&void 0!==arguments[1]?arguments[1]:defaultWrapper;return{ExtractResult:(variables,requestHeaders)=>withWrapper((wrappedRequestHeaders=>client.request(ExtractResultDocument,variables,{...requestHeaders,...wrappedRequestHeaders})),"ExtractResult","query",variables),CurrentUser:(variables,requestHeaders)=>withWrapper((wrappedRequestHeaders=>client.request(CurrentUserDocument,variables,{...requestHeaders,...wrappedRequestHeaders})),"CurrentUser","query",variables),FindFlaggedLabware:(variables,requestHeaders)=>withWrapper((wrappedRequestHeaders=>client.request(FindFlaggedLabwareDocument,variables,{...requestHeaders,...wrappedRequestHeaders})),"FindFlaggedLabware","query",variables),FindFiles:(variables,requestHeaders)=>withWrapper((wrappedRequestHeaders=>client.request(FindFilesDocument,variables,{...requestHeaders,...wrappedRequestHeaders})),"FindFiles","query",variables),FindHistoryForExternalName:(variables,requestHeaders)=>withWrapper((wrappedRequestHeaders=>client.request(FindHistoryForExternalNameDocument,variables,{...requestHeaders,...wrappedRequestHeaders})),"FindHistoryForExternalName","query",variables),FindHistoryForWorkNumber:(variables,requestHeaders)=>withWrapper((wrappedRequestHeaders=>client.request(FindHistoryForWorkNumberDocument,variables,{...requestHeaders,...wrappedRequestHeaders})),"FindHistoryForWorkNumber","query",variables),FindHistory:(variables,requestHeaders)=>withWrapper((wrappedRequestHeaders=>client.request(FindHistoryDocument,variables,{...requestHeaders,...wrappedRequestHeaders})),"FindHistory","query",variables),FindHistoryForDonorName:(variables,requestHeaders)=>withWrapper((wrappedRequestHeaders=>client.request(FindHistoryForDonorNameDocument,variables,{...requestHeaders,...wrappedRequestHeaders})),"FindHistoryForDonorName","query",variables),Find:(variables,requestHeaders)=>withWrapper((wrappedRequestHeaders=>client.request(FindDocument,variables,{...requestHeaders,...wrappedRequestHeaders})),"Find","query",variables),FindHistoryForSampleId:(variables,requestHeaders)=>withWrapper((wrappedRequestHeaders=>client.request(FindHistoryForSampleIdDocument,variables,{...requestHeaders,...wrappedRequestHeaders})),"FindHistoryForSampleId","query",variables),FindLabware:(variables,requestHeaders)=>withWrapper((wrappedRequestHeaders=>client.request(FindLabwareDocument,variables,{...requestHeaders,...wrappedRequestHeaders})),"FindLabware","query",variables),FindHistoryForLabwareBarcode:(variables,requestHeaders)=>withWrapper((wrappedRequestHeaders=>client.request(FindHistoryForLabwareBarcodeDocument,variables,{...requestHeaders,...wrappedRequestHeaders})),"FindHistoryForLabwareBarcode","query",variables),FindHistoryGraph:(variables,requestHeaders)=>withWrapper((wrappedRequestHeaders=>client.request(FindHistoryGraphDocument,variables,{...requestHeaders,...wrappedRequestHeaders})),"FindHistoryGraph","query",variables),FindPassFails:(variables,requestHeaders)=>withWrapper((wrappedRequestHeaders=>client.request(FindPassFailsDocument,variables,{...requestHeaders,...wrappedRequestHeaders})),"FindPassFails","query",variables),FindLabwareLocation:(variables,requestHeaders)=>withWrapper((wrappedRequestHeaders=>client.request(FindLabwareLocationDocument,variables,{...requestHeaders,...wrappedRequestHeaders})),"FindLabwareLocation","query",variables),FindLocationByBarcode:(variables,requestHeaders)=>withWrapper((wrappedRequestHeaders=>client.request(FindLocationByBarcodeDocument,variables,{...requestHeaders,...wrappedRequestHeaders})),"FindLocationByBarcode","query",variables),FindReagentPlate:(variables,requestHeaders)=>withWrapper((wrappedRequestHeaders=>client.request(FindReagentPlateDocument,variables,{...requestHeaders,...wrappedRequestHeaders})),"FindReagentPlate","query",variables),FindStoragePath:(variables,requestHeaders)=>withWrapper((wrappedRequestHeaders=>client.request(FindStoragePathDocument,variables,{...requestHeaders,...wrappedRequestHeaders})),"FindStoragePath","query",variables),FindSamplePositions:(variables,requestHeaders)=>withWrapper((wrappedRequestHeaders=>client.request(FindSamplePositionsDocument,variables,{...requestHeaders,...wrappedRequestHeaders})),"FindSamplePositions","query",variables),FindPermData:(variables,requestHeaders)=>withWrapper((wrappedRequestHeaders=>client.request(FindPermDataDocument,variables,{...requestHeaders,...wrappedRequestHeaders})),"FindPermData","query",variables),FindWorkInfo:(variables,requestHeaders)=>withWrapper((wrappedRequestHeaders=>client.request(FindWorkInfoDocument,variables,{...requestHeaders,...wrappedRequestHeaders})),"FindWorkInfo","query",variables),FindWorkNumbers:(variables,requestHeaders)=>withWrapper((wrappedRequestHeaders=>client.request(FindWorkNumbersDocument,variables,{...requestHeaders,...wrappedRequestHeaders})),"FindWorkNumbers","query",variables),FindWorksCreatedBy:(variables,requestHeaders)=>withWrapper((wrappedRequestHeaders=>client.request(FindWorksCreatedByDocument,variables,{...requestHeaders,...wrappedRequestHeaders})),"FindWorksCreatedBy","query",variables),FindWorkProgress:(variables,requestHeaders)=>withWrapper((wrappedRequestHeaders=>client.request(FindWorkProgressDocument,variables,{...requestHeaders,...wrappedRequestHeaders})),"FindWorkProgress","query",variables),FindPlanData:(variables,requestHeaders)=>withWrapper((wrappedRequestHeaders=>client.request(FindPlanDataDocument,variables,{...requestHeaders,...wrappedRequestHeaders})),"FindPlanData","query",variables),GetAllWorkInfo:(variables,requestHeaders)=>withWrapper((wrappedRequestHeaders=>client.request(GetAllWorkInfoDocument,variables,{...requestHeaders,...wrappedRequestHeaders})),"GetAllWorkInfo","query",variables),GetAnalyserScanData:(variables,requestHeaders)=>withWrapper((wrappedRequestHeaders=>client.request(GetAnalyserScanDataDocument,variables,{...requestHeaders,...wrappedRequestHeaders})),"GetAnalyserScanData","query",variables),GetBioRisks:(variables,requestHeaders)=>withWrapper((wrappedRequestHeaders=>client.request(GetBioRisksDocument,variables,{...requestHeaders,...wrappedRequestHeaders})),"GetBioRisks","query",variables),GetCleanedOutAddresses:(variables,requestHeaders)=>withWrapper((wrappedRequestHeaders=>client.request(GetCleanedOutAddressesDocument,variables,{...requestHeaders,...wrappedRequestHeaders})),"GetCleanedOutAddresses","query",variables),GetComments:(variables,requestHeaders)=>withWrapper((wrappedRequestHeaders=>client.request(GetCommentsDocument,variables,{...requestHeaders,...wrappedRequestHeaders})),"GetComments","query",variables),FindLatestOperation:(variables,requestHeaders)=>withWrapper((wrappedRequestHeaders=>client.request(FindLatestOperationDocument,variables,{...requestHeaders,...wrappedRequestHeaders})),"FindLatestOperation","query",variables),FindMeasurementByBarcodeAndName:(variables,requestHeaders)=>withWrapper((wrappedRequestHeaders=>client.request(FindMeasurementByBarcodeAndNameDocument,variables,{...requestHeaders,...wrappedRequestHeaders})),"FindMeasurementByBarcodeAndName","query",variables),GetDestructionReasons:(variables,requestHeaders)=>withWrapper((wrappedRequestHeaders=>client.request(GetDestructionReasonsDocument,variables,{...requestHeaders,...wrappedRequestHeaders})),"GetDestructionReasons","query",variables),GetDestroyInfo:(variables,requestHeaders)=>withWrapper((wrappedRequestHeaders=>client.request(GetDestroyInfoDocument,variables,{...requestHeaders,...wrappedRequestHeaders})),"GetDestroyInfo","query",variables),GetDnapStudy:(variables,requestHeaders)=>withWrapper((wrappedRequestHeaders=>client.request(GetDnapStudyDocument,variables,{...requestHeaders,...wrappedRequestHeaders})),"GetDnapStudy","query",variables),GetEquipments:(variables,requestHeaders)=>withWrapper((wrappedRequestHeaders=>client.request(GetEquipmentsDocument,variables,{...requestHeaders,...wrappedRequestHeaders})),"GetEquipments","query",variables),GetConfiguration:(variables,requestHeaders)=>withWrapper((wrappedRequestHeaders=>client.request(GetConfigurationDocument,variables,{...requestHeaders,...wrappedRequestHeaders})),"GetConfiguration","query",variables),GetBlockProcessingInfo:(variables,requestHeaders)=>withWrapper((wrappedRequestHeaders=>client.request(GetBlockProcessingInfoDocument,variables,{...requestHeaders,...wrappedRequestHeaders})),"GetBlockProcessingInfo","query",variables),GetLabwareCosting:(variables,requestHeaders)=>withWrapper((wrappedRequestHeaders=>client.request(GetLabwareCostingDocument,variables,{...requestHeaders,...wrappedRequestHeaders})),"GetLabwareCosting","query",variables),GetEventTypes:(variables,requestHeaders)=>withWrapper((wrappedRequestHeaders=>client.request(GetEventTypesDocument,variables,{...requestHeaders,...wrappedRequestHeaders})),"GetEventTypes","query",variables),GetParaffinProcessingInfo:(variables,requestHeaders)=>withWrapper((wrappedRequestHeaders=>client.request(GetParaffinProcessingInfoDocument,variables,{...requestHeaders,...wrappedRequestHeaders})),"GetParaffinProcessingInfo","query",variables),GetLabwareInLocation:(variables,requestHeaders)=>withWrapper((wrappedRequestHeaders=>client.request(GetLabwareInLocationDocument,variables,{...requestHeaders,...wrappedRequestHeaders})),"GetLabwareInLocation","query",variables),GetLabwareOperations:(variables,requestHeaders)=>withWrapper((wrappedRequestHeaders=>client.request(GetLabwareOperationsDocument,variables,{...requestHeaders,...wrappedRequestHeaders})),"GetLabwareOperations","query",variables),GetLabwareFlagDetails:(variables,requestHeaders)=>withWrapper((wrappedRequestHeaders=>client.request(GetLabwareFlagDetailsDocument,variables,{...requestHeaders,...wrappedRequestHeaders})),"GetLabwareFlagDetails","query",variables),GetOmeroProjects:(variables,requestHeaders)=>withWrapper((wrappedRequestHeaders=>client.request(GetOmeroProjectsDocument,variables,{...requestHeaders,...wrappedRequestHeaders})),"GetOmeroProjects","query",variables),GetPotProcessingInfo:(variables,requestHeaders)=>withWrapper((wrappedRequestHeaders=>client.request(GetPotProcessingInfoDocument,variables,{...requestHeaders,...wrappedRequestHeaders})),"GetPotProcessingInfo","query",variables),GetPrinters:(variables,requestHeaders)=>withWrapper((wrappedRequestHeaders=>client.request(GetPrintersDocument,variables,{...requestHeaders,...wrappedRequestHeaders})),"GetPrinters","query",variables),GetNextReplicateNumber:(variables,requestHeaders)=>withWrapper((wrappedRequestHeaders=>client.request(GetNextReplicateNumberDocument,variables,{...requestHeaders,...wrappedRequestHeaders})),"GetNextReplicateNumber","query",variables),GetPrograms:(variables,requestHeaders)=>withWrapper((wrappedRequestHeaders=>client.request(GetProgramsDocument,variables,{...requestHeaders,...wrappedRequestHeaders})),"GetPrograms","query",variables),GetRecordExtractResultInfo:(variables,requestHeaders)=>withWrapper((wrappedRequestHeaders=>client.request(GetRecordExtractResultInfoDocument,variables,{...requestHeaders,...wrappedRequestHeaders})),"GetRecordExtractResultInfo","query",variables),GetRegionsOfInterest:(variables,requestHeaders)=>withWrapper((wrappedRequestHeaders=>client.request(GetRegionsOfInterestDocument,variables,{...requestHeaders,...wrappedRequestHeaders})),"GetRegionsOfInterest","query",variables),GetProbePanels:(variables,requestHeaders)=>withWrapper((wrappedRequestHeaders=>client.request(GetProbePanelsDocument,variables,{...requestHeaders,...wrappedRequestHeaders})),"GetProbePanels","query",variables),GetReleaseInfo:(variables,requestHeaders)=>withWrapper((wrappedRequestHeaders=>client.request(GetReleaseInfoDocument,variables,{...requestHeaders,...wrappedRequestHeaders})),"GetReleaseInfo","query",variables),GetReleaseColumnOptions:(variables,requestHeaders)=>withWrapper((wrappedRequestHeaders=>client.request(GetReleaseColumnOptionsDocument,variables,{...requestHeaders,...wrappedRequestHeaders})),"GetReleaseColumnOptions","query",variables),GetRegistrationInfo:(variables,requestHeaders)=>withWrapper((wrappedRequestHeaders=>client.request(GetRegistrationInfoDocument,variables,{...requestHeaders,...wrappedRequestHeaders})),"GetRegistrationInfo","query",variables),GetRecordInPlaceInfo:(variables,requestHeaders)=>withWrapper((wrappedRequestHeaders=>client.request(GetRecordInPlaceInfoDocument,variables,{...requestHeaders,...wrappedRequestHeaders})),"GetRecordInPlaceInfo","query",variables),GetSectioningInfo:(variables,requestHeaders)=>withWrapper((wrappedRequestHeaders=>client.request(GetSectioningInfoDocument,variables,{...requestHeaders,...wrappedRequestHeaders})),"GetSectioningInfo","query",variables),GetSectioningConfirmInfo:(variables,requestHeaders)=>withWrapper((wrappedRequestHeaders=>client.request(GetSectioningConfirmInfoDocument,variables,{...requestHeaders,...wrappedRequestHeaders})),"GetSectioningConfirmInfo","query",variables),GetSolutionTransferInfo:(variables,requestHeaders)=>withWrapper((wrappedRequestHeaders=>client.request(GetSolutionTransferInfoDocument,variables,{...requestHeaders,...wrappedRequestHeaders})),"GetSolutionTransferInfo","query",variables),GetStainInfo:(variables,requestHeaders)=>withWrapper((wrappedRequestHeaders=>client.request(GetStainInfoDocument,variables,{...requestHeaders,...wrappedRequestHeaders})),"GetStainInfo","query",variables),GetSampleProcessingCommentsInfo:(variables,requestHeaders)=>withWrapper((wrappedRequestHeaders=>client.request(GetSampleProcessingCommentsInfoDocument,variables,{...requestHeaders,...wrappedRequestHeaders})),"GetSampleProcessingCommentsInfo","query",variables),GetStainingQCInfo:(variables,requestHeaders)=>withWrapper((wrappedRequestHeaders=>client.request(GetStainingQcInfoDocument,variables,{...requestHeaders,...wrappedRequestHeaders})),"GetStainingQCInfo","query",variables),GetRunNames:(variables,requestHeaders)=>withWrapper((wrappedRequestHeaders=>client.request(GetRunNamesDocument,variables,{...requestHeaders,...wrappedRequestHeaders})),"GetRunNames","query",variables),GetVisiumQCInfo:(variables,requestHeaders)=>withWrapper((wrappedRequestHeaders=>client.request(GetVisiumQcInfoDocument,variables,{...requestHeaders,...wrappedRequestHeaders})),"GetVisiumQCInfo","query",variables),GetRunRois:(variables,requestHeaders)=>withWrapper((wrappedRequestHeaders=>client.request(GetRunRoisDocument,variables,{...requestHeaders,...wrappedRequestHeaders})),"GetRunRois","query",variables),GetSlotRegions:(variables,requestHeaders)=>withWrapper((wrappedRequestHeaders=>client.request(GetSlotRegionsDocument,variables,{...requestHeaders,...wrappedRequestHeaders})),"GetSlotRegions","query",variables),GetSuggestedLabwareForWork:(variables,requestHeaders)=>withWrapper((wrappedRequestHeaders=>client.request(GetSuggestedLabwareForWorkDocument,variables,{...requestHeaders,...wrappedRequestHeaders})),"GetSuggestedLabwareForWork","query",variables),GetSearchInfo:(variables,requestHeaders)=>withWrapper((wrappedRequestHeaders=>client.request(GetSearchInfoDocument,variables,{...requestHeaders,...wrappedRequestHeaders})),"GetSearchInfo","query",variables),GetStainReagentTypes:(variables,requestHeaders)=>withWrapper((wrappedRequestHeaders=>client.request(GetStainReagentTypesDocument,variables,{...requestHeaders,...wrappedRequestHeaders})),"GetStainReagentTypes","query",variables),GetWorkNumbers:(variables,requestHeaders)=>withWrapper((wrappedRequestHeaders=>client.request(GetWorkNumbersDocument,variables,{...requestHeaders,...wrappedRequestHeaders})),"GetWorkNumbers","query",variables),GetWorkProgressInputs:(variables,requestHeaders)=>withWrapper((wrappedRequestHeaders=>client.request(GetWorkProgressInputsDocument,variables,{...requestHeaders,...wrappedRequestHeaders})),"GetWorkProgressInputs","query",variables),GetWorkAllocationInfo:(variables,requestHeaders)=>withWrapper((wrappedRequestHeaders=>client.request(GetWorkAllocationInfoDocument,variables,{...requestHeaders,...wrappedRequestHeaders})),"GetWorkAllocationInfo","query",variables),GetWorkTypes:(variables,requestHeaders)=>withWrapper((wrappedRequestHeaders=>client.request(GetWorkTypesDocument,variables,{...requestHeaders,...wrappedRequestHeaders})),"GetWorkTypes","query",variables),GetWorkSummary:(variables,requestHeaders)=>withWrapper((wrappedRequestHeaders=>client.request(GetWorkSummaryDocument,variables,{...requestHeaders,...wrappedRequestHeaders})),"GetWorkSummary","query",variables),GetSuggestedWorkForLabware:(variables,requestHeaders)=>withWrapper((wrappedRequestHeaders=>client.request(GetSuggestedWorkForLabwareDocument,variables,{...requestHeaders,...wrappedRequestHeaders})),"GetSuggestedWorkForLabware","query",variables),GetXeniumQCInfo:(variables,requestHeaders)=>withWrapper((wrappedRequestHeaders=>client.request(GetXeniumQcInfoDocument,variables,{...requestHeaders,...wrappedRequestHeaders})),"GetXeniumQCInfo","query",variables),AddDestructionReason:(variables,requestHeaders)=>withWrapper((wrappedRequestHeaders=>client.request(AddDestructionReasonDocument,variables,{...requestHeaders,...wrappedRequestHeaders})),"AddDestructionReason","mutation",variables),AddBioRisk:(variables,requestHeaders)=>withWrapper((wrappedRequestHeaders=>client.request(AddBioRiskDocument,variables,{...requestHeaders,...wrappedRequestHeaders})),"AddBioRisk","mutation",variables),AddComment:(variables,requestHeaders)=>withWrapper((wrappedRequestHeaders=>client.request(AddCommentDocument,variables,{...requestHeaders,...wrappedRequestHeaders})),"AddComment","mutation",variables),AddFixative:(variables,requestHeaders)=>withWrapper((wrappedRequestHeaders=>client.request(AddFixativeDocument,variables,{...requestHeaders,...wrappedRequestHeaders})),"AddFixative","mutation",variables),AddEquipment:(variables,requestHeaders)=>withWrapper((wrappedRequestHeaders=>client.request(AddEquipmentDocument,variables,{...requestHeaders,...wrappedRequestHeaders})),"AddEquipment","mutation",variables),AddHmdmc:(variables,requestHeaders)=>withWrapper((wrappedRequestHeaders=>client.request(AddHmdmcDocument,variables,{...requestHeaders,...wrappedRequestHeaders})),"AddHmdmc","mutation",variables),AddProject:(variables,requestHeaders)=>withWrapper((wrappedRequestHeaders=>client.request(AddProjectDocument,variables,{...requestHeaders,...wrappedRequestHeaders})),"AddProject","mutation",variables),AddOmeroProject:(variables,requestHeaders)=>withWrapper((wrappedRequestHeaders=>client.request(AddOmeroProjectDocument,variables,{...requestHeaders,...wrappedRequestHeaders})),"AddOmeroProject","mutation",variables),AddExternalID:(variables,requestHeaders)=>withWrapper((wrappedRequestHeaders=>client.request(AddExternalIdDocument,variables,{...requestHeaders,...wrappedRequestHeaders})),"AddExternalID","mutation",variables),AddReleaseDestination:(variables,requestHeaders)=>withWrapper((wrappedRequestHeaders=>client.request(AddReleaseDestinationDocument,variables,{...requestHeaders,...wrappedRequestHeaders})),"AddReleaseDestination","mutation",variables),AddProbePanel:(variables,requestHeaders)=>withWrapper((wrappedRequestHeaders=>client.request(AddProbePanelDocument,variables,{...requestHeaders,...wrappedRequestHeaders})),"AddProbePanel","mutation",variables),AddProgram:(variables,requestHeaders)=>withWrapper((wrappedRequestHeaders=>client.request(AddProgramDocument,variables,{...requestHeaders,...wrappedRequestHeaders})),"AddProgram","mutation",variables),AddCostCode:(variables,requestHeaders)=>withWrapper((wrappedRequestHeaders=>client.request(AddCostCodeDocument,variables,{...requestHeaders,...wrappedRequestHeaders})),"AddCostCode","mutation",variables),AddSolution:(variables,requestHeaders)=>withWrapper((wrappedRequestHeaders=>client.request(AddSolutionDocument,variables,{...requestHeaders,...wrappedRequestHeaders})),"AddSolution","mutation",variables),Confirm:(variables,requestHeaders)=>withWrapper((wrappedRequestHeaders=>client.request(ConfirmDocument,variables,{...requestHeaders,...wrappedRequestHeaders})),"Confirm","mutation",variables),AddSlotRegion:(variables,requestHeaders)=>withWrapper((wrappedRequestHeaders=>client.request(AddSlotRegionDocument,variables,{...requestHeaders,...wrappedRequestHeaders})),"AddSlotRegion","mutation",variables),AddUser:(variables,requestHeaders)=>withWrapper((wrappedRequestHeaders=>client.request(AddUserDocument,variables,{...requestHeaders,...wrappedRequestHeaders})),"AddUser","mutation",variables),AddSpecies:(variables,requestHeaders)=>withWrapper((wrappedRequestHeaders=>client.request(AddSpeciesDocument,variables,{...requestHeaders,...wrappedRequestHeaders})),"AddSpecies","mutation",variables),AddWorkType:(variables,requestHeaders)=>withWrapper((wrappedRequestHeaders=>client.request(AddWorkTypeDocument,variables,{...requestHeaders,...wrappedRequestHeaders})),"AddWorkType","mutation",variables),AddReleaseRecipient:(variables,requestHeaders)=>withWrapper((wrappedRequestHeaders=>client.request(AddReleaseRecipientDocument,variables,{...requestHeaders,...wrappedRequestHeaders})),"AddReleaseRecipient","mutation",variables),Destroy:(variables,requestHeaders)=>withWrapper((wrappedRequestHeaders=>client.request(DestroyDocument,variables,{...requestHeaders,...wrappedRequestHeaders})),"Destroy","mutation",variables),Aliquot:(variables,requestHeaders)=>withWrapper((wrappedRequestHeaders=>client.request(AliquotDocument,variables,{...requestHeaders,...wrappedRequestHeaders})),"Aliquot","mutation",variables),ConfirmSection:(variables,requestHeaders)=>withWrapper((wrappedRequestHeaders=>client.request(ConfirmSectionDocument,variables,{...requestHeaders,...wrappedRequestHeaders})),"ConfirmSection","mutation",variables),EmptyLocation:(variables,requestHeaders)=>withWrapper((wrappedRequestHeaders=>client.request(EmptyLocationDocument,variables,{...requestHeaders,...wrappedRequestHeaders})),"EmptyLocation","mutation",variables),CreateWork:(variables,requestHeaders)=>withWrapper((wrappedRequestHeaders=>client.request(CreateWorkDocument,variables,{...requestHeaders,...wrappedRequestHeaders})),"CreateWork","mutation",variables),Logout:(variables,requestHeaders)=>withWrapper((wrappedRequestHeaders=>client.request(LogoutDocument,variables,{...requestHeaders,...wrappedRequestHeaders})),"Logout","mutation",variables),Extract:(variables,requestHeaders)=>withWrapper((wrappedRequestHeaders=>client.request(ExtractDocument,variables,{...requestHeaders,...wrappedRequestHeaders})),"Extract","mutation",variables),PerformParaffinProcessing:(variables,requestHeaders)=>withWrapper((wrappedRequestHeaders=>client.request(PerformParaffinProcessingDocument,variables,{...requestHeaders,...wrappedRequestHeaders})),"PerformParaffinProcessing","mutation",variables),PerformTissueBlock:(variables,requestHeaders)=>withWrapper((wrappedRequestHeaders=>client.request(PerformTissueBlockDocument,variables,{...requestHeaders,...wrappedRequestHeaders})),"PerformTissueBlock","mutation",variables),PerformTissuePot:(variables,requestHeaders)=>withWrapper((wrappedRequestHeaders=>client.request(PerformTissuePotDocument,variables,{...requestHeaders,...wrappedRequestHeaders})),"PerformTissuePot","mutation",variables),Plan:(variables,requestHeaders)=>withWrapper((wrappedRequestHeaders=>client.request(PlanDocument,variables,{...requestHeaders,...wrappedRequestHeaders})),"Plan","mutation",variables),Login:(variables,requestHeaders)=>withWrapper((wrappedRequestHeaders=>client.request(LoginDocument,variables,{...requestHeaders,...wrappedRequestHeaders})),"Login","mutation",variables),PerformSolutionTransfer:(variables,requestHeaders)=>withWrapper((wrappedRequestHeaders=>client.request(PerformSolutionTransferDocument,variables,{...requestHeaders,...wrappedRequestHeaders})),"PerformSolutionTransfer","mutation",variables),FlagLabware:(variables,requestHeaders)=>withWrapper((wrappedRequestHeaders=>client.request(FlagLabwareDocument,variables,{...requestHeaders,...wrappedRequestHeaders})),"FlagLabware","mutation",variables),RecordComplexStain:(variables,requestHeaders)=>withWrapper((wrappedRequestHeaders=>client.request(RecordComplexStainDocument,variables,{...requestHeaders,...wrappedRequestHeaders})),"RecordComplexStain","mutation",variables),RecordExtractResult:(variables,requestHeaders)=>withWrapper((wrappedRequestHeaders=>client.request(RecordExtractResultDocument,variables,{...requestHeaders,...wrappedRequestHeaders})),"RecordExtractResult","mutation",variables),RecordCompletion:(variables,requestHeaders)=>withWrapper((wrappedRequestHeaders=>client.request(RecordCompletionDocument,variables,{...requestHeaders,...wrappedRequestHeaders})),"RecordCompletion","mutation",variables),RecordMetrics:(variables,requestHeaders)=>withWrapper((wrappedRequestHeaders=>client.request(RecordMetricsDocument,variables,{...requestHeaders,...wrappedRequestHeaders})),"RecordMetrics","mutation",variables),Print:(variables,requestHeaders)=>withWrapper((wrappedRequestHeaders=>client.request(PrintDocument,variables,{...requestHeaders,...wrappedRequestHeaders})),"Print","mutation",variables),RecordInPlace:(variables,requestHeaders)=>withWrapper((wrappedRequestHeaders=>client.request(RecordInPlaceDocument,variables,{...requestHeaders,...wrappedRequestHeaders})),"RecordInPlace","mutation",variables),RecordOpWithSlotMeasurements:(variables,requestHeaders)=>withWrapper((wrappedRequestHeaders=>client.request(RecordOpWithSlotMeasurementsDocument,variables,{...requestHeaders,...wrappedRequestHeaders})),"RecordOpWithSlotMeasurements","mutation",variables),ReactivateLabware:(variables,requestHeaders)=>withWrapper((wrappedRequestHeaders=>client.request(ReactivateLabwareDocument,variables,{...requestHeaders,...wrappedRequestHeaders})),"ReactivateLabware","mutation",variables),RecordOpWithSlotComments:(variables,requestHeaders)=>withWrapper((wrappedRequestHeaders=>client.request(RecordOpWithSlotCommentsDocument,variables,{...requestHeaders,...wrappedRequestHeaders})),"RecordOpWithSlotComments","mutation",variables),RecordOrientationQC:(variables,requestHeaders)=>withWrapper((wrappedRequestHeaders=>client.request(RecordOrientationQcDocument,variables,{...requestHeaders,...wrappedRequestHeaders})),"RecordOrientationQC","mutation",variables),RecordLibraryPrep:(variables,requestHeaders)=>withWrapper((wrappedRequestHeaders=>client.request(RecordLibraryPrepDocument,variables,{...requestHeaders,...wrappedRequestHeaders})),"RecordLibraryPrep","mutation",variables),RecordReagentTransfer:(variables,requestHeaders)=>withWrapper((wrappedRequestHeaders=>client.request(RecordReagentTransferDocument,variables,{...requestHeaders,...wrappedRequestHeaders})),"RecordReagentTransfer","mutation",variables),RecordPerm:(variables,requestHeaders)=>withWrapper((wrappedRequestHeaders=>client.request(RecordPermDocument,variables,{...requestHeaders,...wrappedRequestHeaders})),"RecordPerm","mutation",variables),RecordAnalyser:(variables,requestHeaders)=>withWrapper((wrappedRequestHeaders=>client.request(RecordAnalyserDocument,variables,{...requestHeaders,...wrappedRequestHeaders})),"RecordAnalyser","mutation",variables),RecordSampleProcessingComments:(variables,requestHeaders)=>withWrapper((wrappedRequestHeaders=>client.request(RecordSampleProcessingCommentsDocument,variables,{...requestHeaders,...wrappedRequestHeaders})),"RecordSampleProcessingComments","mutation",variables),RecordProbeOperation:(variables,requestHeaders)=>withWrapper((wrappedRequestHeaders=>client.request(RecordProbeOperationDocument,variables,{...requestHeaders,...wrappedRequestHeaders})),"RecordProbeOperation","mutation",variables),RecordVisiumQC:(variables,requestHeaders)=>withWrapper((wrappedRequestHeaders=>client.request(RecordVisiumQcDocument,variables,{...requestHeaders,...wrappedRequestHeaders})),"RecordVisiumQC","mutation",variables),RecordQCLabware:(variables,requestHeaders)=>withWrapper((wrappedRequestHeaders=>client.request(RecordQcLabwareDocument,variables,{...requestHeaders,...wrappedRequestHeaders})),"RecordQCLabware","mutation",variables),RegisterOriginalSamples:(variables,requestHeaders)=>withWrapper((wrappedRequestHeaders=>client.request(RegisterOriginalSamplesDocument,variables,{...requestHeaders,...wrappedRequestHeaders})),"RegisterOriginalSamples","mutation",variables),RecordStainResult:(variables,requestHeaders)=>withWrapper((wrappedRequestHeaders=>client.request(RecordStainResultDocument,variables,{...requestHeaders,...wrappedRequestHeaders})),"RecordStainResult","mutation",variables),RecordRNAAnalysis:(variables,requestHeaders)=>withWrapper((wrappedRequestHeaders=>client.request(RecordRnaAnalysisDocument,variables,{...requestHeaders,...wrappedRequestHeaders})),"RecordRNAAnalysis","mutation",variables),ReleaseLabware:(variables,requestHeaders)=>withWrapper((wrappedRequestHeaders=>client.request(ReleaseLabwareDocument,variables,{...requestHeaders,...wrappedRequestHeaders})),"ReleaseLabware","mutation",variables),RegisterSections:(variables,requestHeaders)=>withWrapper((wrappedRequestHeaders=>client.request(RegisterSectionsDocument,variables,{...requestHeaders,...wrappedRequestHeaders})),"RegisterSections","mutation",variables),SetCommentEnabled:(variables,requestHeaders)=>withWrapper((wrappedRequestHeaders=>client.request(SetCommentEnabledDocument,variables,{...requestHeaders,...wrappedRequestHeaders})),"SetCommentEnabled","mutation",variables),SetDestructionReasonEnabled:(variables,requestHeaders)=>withWrapper((wrappedRequestHeaders=>client.request(SetDestructionReasonEnabledDocument,variables,{...requestHeaders,...wrappedRequestHeaders})),"SetDestructionReasonEnabled","mutation",variables),Segmentation:(variables,requestHeaders)=>withWrapper((wrappedRequestHeaders=>client.request(SegmentationDocument,variables,{...requestHeaders,...wrappedRequestHeaders})),"Segmentation","mutation",variables),SetCostCodeEnabled:(variables,requestHeaders)=>withWrapper((wrappedRequestHeaders=>client.request(SetCostCodeEnabledDocument,variables,{...requestHeaders,...wrappedRequestHeaders})),"SetCostCodeEnabled","mutation",variables),SetBioRiskEnabled:(variables,requestHeaders)=>withWrapper((wrappedRequestHeaders=>client.request(SetBioRiskEnabledDocument,variables,{...requestHeaders,...wrappedRequestHeaders})),"SetBioRiskEnabled","mutation",variables),SetEquipmentEnabled:(variables,requestHeaders)=>withWrapper((wrappedRequestHeaders=>client.request(SetEquipmentEnabledDocument,variables,{...requestHeaders,...wrappedRequestHeaders})),"SetEquipmentEnabled","mutation",variables),RegisterTissues:(variables,requestHeaders)=>withWrapper((wrappedRequestHeaders=>client.request(RegisterTissuesDocument,variables,{...requestHeaders,...wrappedRequestHeaders})),"RegisterTissues","mutation",variables),SetLocationCustomName:(variables,requestHeaders)=>withWrapper((wrappedRequestHeaders=>client.request(SetLocationCustomNameDocument,variables,{...requestHeaders,...wrappedRequestHeaders})),"SetLocationCustomName","mutation",variables),RegisterAsEndUser:(variables,requestHeaders)=>withWrapper((wrappedRequestHeaders=>client.request(RegisterAsEndUserDocument,variables,{...requestHeaders,...wrappedRequestHeaders})),"RegisterAsEndUser","mutation",variables),SetFixativeEnabled:(variables,requestHeaders)=>withWrapper((wrappedRequestHeaders=>client.request(SetFixativeEnabledDocument,variables,{...requestHeaders,...wrappedRequestHeaders})),"SetFixativeEnabled","mutation",variables),SetOmeroProjectEnabled:(variables,requestHeaders)=>withWrapper((wrappedRequestHeaders=>client.request(SetOmeroProjectEnabledDocument,variables,{...requestHeaders,...wrappedRequestHeaders})),"SetOmeroProjectEnabled","mutation",variables),SetProjectEnabled:(variables,requestHeaders)=>withWrapper((wrappedRequestHeaders=>client.request(SetProjectEnabledDocument,variables,{...requestHeaders,...wrappedRequestHeaders})),"SetProjectEnabled","mutation",variables),SetReleaseDestinationEnabled:(variables,requestHeaders)=>withWrapper((wrappedRequestHeaders=>client.request(SetReleaseDestinationEnabledDocument,variables,{...requestHeaders,...wrappedRequestHeaders})),"SetReleaseDestinationEnabled","mutation",variables),SetReleaseRecipientEnabled:(variables,requestHeaders)=>withWrapper((wrappedRequestHeaders=>client.request(SetReleaseRecipientEnabledDocument,variables,{...requestHeaders,...wrappedRequestHeaders})),"SetReleaseRecipientEnabled","mutation",variables),SetSpeciesEnabled:(variables,requestHeaders)=>withWrapper((wrappedRequestHeaders=>client.request(SetSpeciesEnabledDocument,variables,{...requestHeaders,...wrappedRequestHeaders})),"SetSpeciesEnabled","mutation",variables),SetWorkTypeEnabled:(variables,requestHeaders)=>withWrapper((wrappedRequestHeaders=>client.request(SetWorkTypeEnabledDocument,variables,{...requestHeaders,...wrappedRequestHeaders})),"SetWorkTypeEnabled","mutation",variables),SetProbePanelEnabled:(variables,requestHeaders)=>withWrapper((wrappedRequestHeaders=>client.request(SetProbePanelEnabledDocument,variables,{...requestHeaders,...wrappedRequestHeaders})),"SetProbePanelEnabled","mutation",variables),SetSlotRegionEnabled:(variables,requestHeaders)=>withWrapper((wrappedRequestHeaders=>client.request(SetSlotRegionEnabledDocument,variables,{...requestHeaders,...wrappedRequestHeaders})),"SetSlotRegionEnabled","mutation",variables),SetHmdmcEnabled:(variables,requestHeaders)=>withWrapper((wrappedRequestHeaders=>client.request(SetHmdmcEnabledDocument,variables,{...requestHeaders,...wrappedRequestHeaders})),"SetHmdmcEnabled","mutation",variables),SetProgramEnabled:(variables,requestHeaders)=>withWrapper((wrappedRequestHeaders=>client.request(SetProgramEnabledDocument,variables,{...requestHeaders,...wrappedRequestHeaders})),"SetProgramEnabled","mutation",variables),Stain:(variables,requestHeaders)=>withWrapper((wrappedRequestHeaders=>client.request(StainDocument,variables,{...requestHeaders,...wrappedRequestHeaders})),"Stain","mutation",variables),SetSolutionEnabled:(variables,requestHeaders)=>withWrapper((wrappedRequestHeaders=>client.request(SetSolutionEnabledDocument,variables,{...requestHeaders,...wrappedRequestHeaders})),"SetSolutionEnabled","mutation",variables),Store:(variables,requestHeaders)=>withWrapper((wrappedRequestHeaders=>client.request(StoreDocument,variables,{...requestHeaders,...wrappedRequestHeaders})),"Store","mutation",variables),StoreBarcode:(variables,requestHeaders)=>withWrapper((wrappedRequestHeaders=>client.request(StoreBarcodeDocument,variables,{...requestHeaders,...wrappedRequestHeaders})),"StoreBarcode","mutation",variables),TransferLocationItems:(variables,requestHeaders)=>withWrapper((wrappedRequestHeaders=>client.request(TransferLocationItemsDocument,variables,{...requestHeaders,...wrappedRequestHeaders})),"TransferLocationItems","mutation",variables),Unrelease:(variables,requestHeaders)=>withWrapper((wrappedRequestHeaders=>client.request(UnreleaseDocument,variables,{...requestHeaders,...wrappedRequestHeaders})),"Unrelease","mutation",variables),SetUserRole:(variables,requestHeaders)=>withWrapper((wrappedRequestHeaders=>client.request(SetUserRoleDocument,variables,{...requestHeaders,...wrappedRequestHeaders})),"SetUserRole","mutation",variables),SlotCopy:(variables,requestHeaders)=>withWrapper((wrappedRequestHeaders=>client.request(SlotCopyDocument,variables,{...requestHeaders,...wrappedRequestHeaders})),"SlotCopy","mutation",variables),UpdateWorkOmeroProject:(variables,requestHeaders)=>withWrapper((wrappedRequestHeaders=>client.request(UpdateWorkOmeroProjectDocument,variables,{...requestHeaders,...wrappedRequestHeaders})),"UpdateWorkOmeroProject","mutation",variables),UpdateWorkNumSlides:(variables,requestHeaders)=>withWrapper((wrappedRequestHeaders=>client.request(UpdateWorkNumSlidesDocument,variables,{...requestHeaders,...wrappedRequestHeaders})),"UpdateWorkNumSlides","mutation",variables),UpdateDnapStudies:(variables,requestHeaders)=>withWrapper((wrappedRequestHeaders=>client.request(UpdateDnapStudiesDocument,variables,{...requestHeaders,...wrappedRequestHeaders})),"UpdateDnapStudies","mutation",variables),UpdateWorkPriority:(variables,requestHeaders)=>withWrapper((wrappedRequestHeaders=>client.request(UpdateWorkPriorityDocument,variables,{...requestHeaders,...wrappedRequestHeaders})),"UpdateWorkPriority","mutation",variables),UpdateWorkStatus:(variables,requestHeaders)=>withWrapper((wrappedRequestHeaders=>client.request(UpdateWorkStatusDocument,variables,{...requestHeaders,...wrappedRequestHeaders})),"UpdateWorkStatus","mutation",variables),UpdateWorkNumOriginalSamples:(variables,requestHeaders)=>withWrapper((wrappedRequestHeaders=>client.request(UpdateWorkNumOriginalSamplesDocument,variables,{...requestHeaders,...wrappedRequestHeaders})),"UpdateWorkNumOriginalSamples","mutation",variables),UpdateReleaseRecipientFullName:(variables,requestHeaders)=>withWrapper((wrappedRequestHeaders=>client.request(UpdateReleaseRecipientFullNameDocument,variables,{...requestHeaders,...wrappedRequestHeaders})),"UpdateReleaseRecipientFullName","mutation",variables),VisiumAnalysis:(variables,requestHeaders)=>withWrapper((wrappedRequestHeaders=>client.request(VisiumAnalysisDocument,variables,{...requestHeaders,...wrappedRequestHeaders})),"VisiumAnalysis","mutation",variables),UpdateWorkDnapStudy:(variables,requestHeaders)=>withWrapper((wrappedRequestHeaders=>client.request(UpdateWorkDnapStudyDocument,variables,{...requestHeaders,...wrappedRequestHeaders})),"UpdateWorkDnapStudy","mutation",variables),UnstoreBarcode:(variables,requestHeaders)=>withWrapper((wrappedRequestHeaders=>client.request(UnstoreBarcodeDocument,variables,{...requestHeaders,...wrappedRequestHeaders})),"UnstoreBarcode","mutation",variables),UpdateWorkNumBlocks:(variables,requestHeaders)=>withWrapper((wrappedRequestHeaders=>client.request(UpdateWorkNumBlocksDocument,variables,{...requestHeaders,...wrappedRequestHeaders})),"UpdateWorkNumBlocks","mutation",variables),CleanOut:(variables,requestHeaders)=>withWrapper((wrappedRequestHeaders=>client.request(CleanOutDocument,variables,{...requestHeaders,...wrappedRequestHeaders})),"CleanOut","mutation",variables)}}},"./src/types/stan.ts":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.d(__webpack_exports__,{PC:()=>alphaNumericSortDefault,UG:()=>extractServerErrors,y1:()=>LabwareTypeName});__webpack_require__("./src/types/sdk.ts");var _lib_helpers__WEBPACK_IMPORTED_MODULE_1__=__webpack_require__("./src/lib/helpers.ts");let LabwareTypeName=function(LabwareTypeName){return LabwareTypeName.PROVIASETTE="Proviasette",LabwareTypeName.TUBE="Tube",LabwareTypeName.VISIUM_LP="Visium LP",LabwareTypeName.VISIUM_TO="Visium TO",LabwareTypeName.SLIDE="6 slot slide",LabwareTypeName.PLATE="96 well plate",LabwareTypeName.CASSETTE="Cassette",LabwareTypeName.VISIUM_ADH="Visium ADH",LabwareTypeName.FOUR_SLOT_SLIDE="4 slot slide",LabwareTypeName.FETAL_WASTE_CONTAINER="Fetal waste container",LabwareTypeName.DUAL_INDEX_PLATE="Dual index plate",LabwareTypeName.POT="Pot",LabwareTypeName.PRE_BARCODED_TUBE="Prebarcoded tube",LabwareTypeName.VISIUM_LP_CYTASSIST="Visium LP CytAssist",LabwareTypeName.VISIUM_LP_CYTASSIST_XL="Visium LP CytAssist XL",LabwareTypeName.VISIUM_LP_CYTASSIST_HD="Visium LP CytAssist HD",LabwareTypeName.XENIUM="Xenium",LabwareTypeName.STRIP_TUBE="8 Strip Tube",LabwareTypeName}({});function extractServerErrors(e){var _e$response$errors$ma,_e$response$errors,_reduce;return{message:null!==(_e$response$errors$ma=null===(_e$response$errors=e.response.errors)||void 0===_e$response$errors?void 0:_e$response$errors.map((error=>{var _error$message,_error$message$match;return(null==error||null===(_error$message=error.message)||void 0===_error$message||null===(_error$message$match=_error$message.match(/^.*\s:\s(.*)$/))||void 0===_error$message$match?void 0:_error$message$match[1])||(null==error?void 0:error.message)})).filter(Boolean).join("\n"))&&void 0!==_e$response$errors$ma?_e$response$errors$ma:null,problems:null!==(_reduce=e.response.errors.reduce(((memo,graphQLError,_index,_original)=>{var _graphQLError$extensi;return null!==(_graphQLError$extensi=graphQLError.extensions)&&void 0!==_graphQLError$extensi&&_graphQLError$extensi.hasOwnProperty("problems")?[...memo,...graphQLError.extensions.problems]:memo}),[]))&&void 0!==_reduce?_reduce:[]}}const alphaNumericSortDefault=function(a,b){let alphaFirst=!(arguments.length>2&&void 0!==arguments[2])||arguments[2];return(0,_lib_helpers__WEBPACK_IMPORTED_MODULE_1__.wz)(a,b,{alpha:/[^a-zA-Z]*/g,numeric:/[^0-9]*/g},alphaFirst)}}}]);
//# sourceMappingURL=523.fdda5ea9.iframe.bundle.js.map