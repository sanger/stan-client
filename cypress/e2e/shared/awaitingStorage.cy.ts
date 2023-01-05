export function setAwaitingLabwareInSessionStorage() {
  sessionStorage.setItem(
    'awaitingLabwares',
    'STAN-2111,tube,EXT_1,Donor_1,Lungs,Spatial_location 1,2a,STAN-3111,Slide,Ext_2,Donor_2,Kidney,Spatial_location 2,3,STAN-4111,Slide,EXT_3,Donor_3,Heart,Spatial_location 3,4,STAN-5111,Slide,Ext_4,Donor_4,Heart,Spatial_location 4,1'
  );
}
