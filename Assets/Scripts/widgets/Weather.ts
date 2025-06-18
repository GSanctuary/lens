import { SanctuaryAPI } from "../services/SanctuaryAPI";
import { CurrentWeather } from "../types/Sanctuary";
import { PersistentStorageManager } from "../utils/PersistentStorageManager";
import { Widget } from "../Widget";

@component
export class Weather extends Widget {
    @input
    locationText: Text;

    @input
    temperatureText: Text;

    @input
    conditionText: Text;

    onAwake() {
        this.createEvent("OnStartEvent").bind(this.onStart.bind(this));
    }

    onStart() {
        super.onStart();
        this.hydrate();
    }

    protected override async hydrate(): Promise<void> {
        const { latitude: lat, longitude: lon } =
            this.getLatitudeAndLongitude();
        const weatherData = await SanctuaryAPI.getCurrentWeather(lat, lon);
        print(JSON.stringify(weatherData, null, 2));
        this.updateUI(weatherData);
    }

    private updateUI(weatherData: CurrentWeather): void {
        this.locationText.text = weatherData.location.name;
        this.temperatureText.text = `${weatherData.current.feelslike_c}°C`;
        this.conditionText.text = weatherData.current.condition.text;
    }

    private getLatitudeAndLongitude(): { latitude: number; longitude: number } {
        const rawLatitude =
            PersistentStorageManager.getInstance().get("latitude");
        const rawLongitude =
            PersistentStorageManager.getInstance().get("longitude");
        if (rawLatitude === undefined || rawLongitude === undefined) {
            throw new Error("Latitude or Longitude not found in storage.");
        }

        const latitude = parseFloat(rawLatitude);
        const longitude = parseFloat(rawLongitude);
        if (isNaN(latitude) || isNaN(longitude)) {
            throw new Error("Invalid Latitude or Longitude values.");
        }
        return { latitude, longitude };
    }
}
