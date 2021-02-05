import React, { useEffect, useState } from "react";
import AppShell from "../components/AppShell";
import LocationSearch from "../components/LocationSearch";
import StripyCard, { StripyCardDetail } from "../components/StripyCard";
import Heading from "../components/Heading";
import PinkButton from "../components/buttons/PinkButton";
import Modal, {
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "../components/Modal";
import WhiteButton from "../components/buttons/WhiteButton";
import BinIcon from "../components/icons/BinIcon";
import IconButton from "../components/buttons/IconButton";
import GridIcon from "../components/icons/GridIcon";
import ListIcon from "../components/icons/ListIcon";
import StyledLink from "../components/StyledLink";
import ItemsList from "./location/ItemsList";
import ItemsGrid from "./location/ItemsGrid";
import Success from "../components/notifications/Success";
import EditableText from "../components/EditableText";
import { setLocationCustomName } from "../lib/services/locationService";
import Warning from "../components/notifications/Warning";
import { toast } from "react-toastify";
import { addressToLocationAddress } from "../lib/helpers/locationHelper";
import { Authenticated, Unauthenticated } from "../components/Authenticated";
import LocationPresentationModel from "../lib/presentationModels/locationPresentationModel";
import { RouteComponentProps } from "react-router-dom";

/**
 * The different ways of displaying stored items
 */
enum ViewType {
  GRID,
  LIST,
}

export const ModelContext = React.createContext<
  LocationPresentationModel | undefined
>(undefined);

/**
 * Type for possible location URL params
 */
export type LocationSearchParams = {
  labwareBarcode: string;
};

/**
 * Custom type guard for {@link LocationSearchParams}
 */
export function isLocationSearch(obj: any): obj is LocationSearchParams {
  return "labwareBarcode" in obj && typeof obj["labwareBarcode"] === "string";
}

/**
 * Parameters expected in the react-router match object (i.e. URL parameters)
 */
export interface LocationMatchParams {
  locationBarcode: string;
}

interface LocationProps extends RouteComponentProps<LocationMatchParams> {
  model: LocationPresentationModel;
}

const Location: React.FC<LocationProps> = ({ model, match }) => {
  const { location, successMessage, errorMessage } = model.context;

  const locationHasGrid = model.locationHasGrid;
  /**
   * Should the page be displaying the grid or list view of the items
   */
  const [currentViewType, setCurrentViewType] = useState<ViewType>(
    locationHasGrid ? ViewType.GRID : ViewType.LIST
  );

  /**
   * Is the "Empty Location" modal open
   */
  const [emptyLocationModalOpen, setEmptyLocationModalOpen] = useState(false);

  /**
   * Show a toast notification when success message changes (and isn't null)
   */

  useEffect(() => {
    if (successMessage) {
      const SuccessToast = () => {
        return <Success message={successMessage} />;
      };

      toast(<SuccessToast />, {
        position: toast.POSITION.TOP_RIGHT,
        autoClose: 5000,
        hideProgressBar: true,
      });
    }
  }, [successMessage]);

  /**
   * Show a toast notification when error message changes (and isn't null)
   */
  useEffect(() => {
    if (errorMessage) {
      const WarningToast = () => (
        <Warning message={errorMessage} error={model.context.serverError} />
      );

      toast(<WarningToast />, {
        position: toast.POSITION.TOP_RIGHT,
        autoClose: 5000,
        hideProgressBar: true,
      });
    }
  }, [errorMessage, model.context.serverError]);

  /**
   * Event handler for the editable custom name
   * @param newCustomName the new custom name of the location
   */
  const onCustomNameChange = async (newCustomName: string) => {
    try {
      const updatedLocation = await setLocationCustomName(
        location.barcode,
        newCustomName
      );
      model.updateLocation(updatedLocation);
      return newCustomName;
    } catch (e) {
      throw new Error("Failed to update Location");
    }
  };

  return (
    <AppShell>
      <AppShell.Header>
        <AppShell.Title>Store</AppShell.Title>
      </AppShell.Header>
      <AppShell.Main>
        <div className="max-w-screen-xl mx-auto">
          {model.labwareBarcodeToAddressMap &&
            Array.from(model.labwareBarcodeToAddressMap.keys()).map(
              (labwareBarcode) => (
                <Success
                  className="mb-5"
                  key={labwareBarcode}
                  message={`Labware found`}
                >
                  Labware <span className="font-bold">{labwareBarcode}</span> is
                  in address{" "}
                  <span className="font-bold">
                    {location.size && location.direction
                      ? addressToLocationAddress(
                          model.labwareBarcodeToAddressMap.get(
                            labwareBarcode
                          ) ?? "",
                          location.size,
                          location.direction
                        )
                      : model.labwareBarcodeToAddressMap.get(labwareBarcode)}
                  </span>
                </Success>
              )
            )}

          {model.showWarning() && (
            <Warning
              message={`Location ${match.params.locationBarcode} could not be found`}
            />
          )}

          <LocationSearch />

          {model.showLocation() && (
            <>
              <StripyCard
                heading={
                  <Heading level={3} showBorder={false}>
                    {location.customName ? (
                      <>
                        <Authenticated>
                          <EditableText onChange={onCustomNameChange}>
                            {location.customName}
                          </EditableText>
                        </Authenticated>

                        <Unauthenticated>{location.customName}</Unauthenticated>
                      </>
                    ) : (
                      location.barcode
                    )}
                  </Heading>
                }
                description={location.barcode}
              >
                <StripyCardDetail term={"Name"}>
                  {location.name ?? <span className="italic">None</span>}
                </StripyCardDetail>

                {location.parent && (
                  <StripyCardDetail term={"Parent"}>
                    <StyledLink to={`/locations/${location.parent.barcode}`}>
                      {location.parent.customName ?? location.parent.barcode}
                    </StyledLink>
                  </StripyCardDetail>
                )}

                {location.size && (
                  <StripyCardDetail term={"Size"}>
                    <span className="font-semibold">
                      {location.size.numRows}
                    </span>{" "}
                    row(s) and{" "}
                    <span className="font-semibold">
                      {location.size.numColumns}
                    </span>{" "}
                    column(s)
                  </StripyCardDetail>
                )}

                {location.children.length > 0 && (
                  <StripyCardDetail term={"Children"}>
                    <ul className="list-disc list-inside">
                      {location.children.map((child) => {
                        return (
                          <li key={child.barcode}>
                            <StyledLink to={`/locations/${child.barcode}`}>
                              {child.customName ?? child.name ?? child.barcode}
                            </StyledLink>
                          </li>
                        );
                      })}
                    </ul>
                  </StripyCardDetail>
                )}

                {location.children.length === 0 && (
                  <StripyCardDetail term={"Number of Stored Items"}>
                    <span
                      data-testid={"storedItemsCount"}
                      className="font-semibold"
                    >
                      {location.stored.length}
                    </span>
                  </StripyCardDetail>
                )}

                {location.direction && (
                  <StripyCardDetail term={"Layout"}>
                    <span className="font-semibold">{location.direction}</span>
                  </StripyCardDetail>
                )}
              </StripyCard>

              {location.children.length === 0 && (
                <>
                  <Heading className="mt-10 mb-5" level={2}>
                    Stored Items
                    {location?.size!! && (
                      <div className="float-right">
                        <div className="flex flex-row items-center">
                          <IconButton
                            data-testid="gridIcon"
                            onClick={() => setCurrentViewType(ViewType.GRID)}
                          >
                            <GridIcon
                              className={`inline-block h-5 w-4 ${
                                currentViewType === ViewType.GRID &&
                                "text-gray-700"
                              }`}
                            />
                          </IconButton>

                          <IconButton
                            data-testid="listIcon"
                            onClick={() => setCurrentViewType(ViewType.LIST)}
                          >
                            <ListIcon
                              className={`inline-block h-5 w-4 ${
                                currentViewType === ViewType.LIST &&
                                "text-gray-700"
                              }`}
                            />
                          </IconButton>
                        </div>
                      </div>
                    )}
                  </Heading>

                  <ModelContext.Provider value={model}>
                    {currentViewType === ViewType.LIST && (
                      <ItemsList freeformAddress={!locationHasGrid} />
                    )}
                    {locationHasGrid && currentViewType === ViewType.GRID && (
                      <ItemsGrid />
                    )}
                  </ModelContext.Provider>

                  <Authenticated>
                    <div className="my-5 flex flex-row items-center justify-end">
                      <PinkButton
                        onClick={() => setEmptyLocationModalOpen(true)}
                      >
                        <BinIcon className="inline-block h-5 w-5 -ml-1 mr-2" />
                        Empty Location
                      </PinkButton>
                    </div>

                    <Modal show={emptyLocationModalOpen}>
                      <ModalHeader>Remove All Labware</ModalHeader>
                      <ModalBody>
                        <p className="text-sm text-gray-700">
                          Are you sure you want to remove all labware from{" "}
                          <span className="font-semibold">
                            {location.customName ??
                              location.name ??
                              location.barcode}
                          </span>
                          ?
                        </p>
                      </ModalBody>
                      <ModalFooter>
                        <PinkButton
                          className="sm:ml-3"
                          onClick={() => {
                            model.emptyLocation();
                            setEmptyLocationModalOpen(false);
                          }}
                        >
                          Remove All Labware
                        </PinkButton>
                        <WhiteButton
                          className="sm:ml-3 mt-1"
                          onClick={() => setEmptyLocationModalOpen(false)}
                        >
                          Close
                        </WhiteButton>
                      </ModalFooter>
                    </Modal>
                  </Authenticated>
                </>
              )}
            </>
          )}
        </div>
      </AppShell.Main>
    </AppShell>
  );
};

export default Location;
