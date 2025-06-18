import { PersistentStorageManager } from "./utils/PersistentStorageManager";

require("LensStudio:RawLocationModule");

@component
export class LocationExample extends BaseScriptComponent {
    @input
    locationRefetchIntervalSeconds: number = 600;

    latitude: number;
    longitude: number;
    altitude: number;
    horizontalAccuracy: number;
    verticalAccuracy: number;
    timestamp: Date;
    locationSource: string;

    private repeatUpdateUserLocation: DelayedCallbackEvent;
    private locationService: LocationService;
    onAwake() {
        this.createEvent("OnStartEvent").bind(() => {
            this.createAndLogLocationAndHeading();
        });

        this.repeatUpdateUserLocation = this.createEvent(
            "DelayedCallbackEvent"
        );
        this.repeatUpdateUserLocation.bind(() => {
            this.locationService.getCurrentPosition(
                function (geoPosition) {
                    if (
                        this.timestamp === undefined ||
                        this.timestamp.getTime() !=
                            geoPosition.timestamp.getTime()
                    ) {
                        this.latitude = geoPosition.latitude;
                        this.longitude = geoPosition.longitude;
                        this.horizontalAccuracy =
                            geoPosition.horizontalAccuracy;
                        this.verticalAccuracy = geoPosition.verticalAccuracy;
                        print("long: " + this.longitude);
                        print("lat: " + this.latitude);
                        if (geoPosition.altitude != 0) {
                            this.altitude = geoPosition.altitude;
                            print("altitude: " + this.altitude);
                        }
                        this.timestamp = geoPosition.timestamp;
                        PersistentStorageManager.getInstance().set(
                            "latitude",
                            `${this.latitude}`
                        );
                        PersistentStorageManager.getInstance().set(
                            "longitude",
                            `${this.longitude}`
                        );
                    }
                },
                function (error) {
                    print(error);
                }
            );

            this.repeatUpdateUserLocation.reset(
                this.locationRefetchIntervalSeconds
            );
        });
    }
    createAndLogLocationAndHeading() {
        // Create location handler
        this.locationService = GeoLocation.createLocationService();

        // Set the accuracy
        this.locationService.accuracy = GeoLocationAccuracy.Navigation;

        this.repeatUpdateUserLocation.reset(0.0);
    }
}
