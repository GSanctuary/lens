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

    @input
    textures: Texture[];

    @input
    weatherImageDisplay: Image;

    @input
    showAdvanced: boolean = false;

    @input
    @showIf("showAdvanced")
    weatherUrlPrefix: string = "//cdn.weatherapi.com/weather/64x64/";

    private weatherIconMap: Record<string, Texture> = {};

    onAwake() {
        this.createEvent("OnStartEvent").bind(this.onStart.bind(this));
        this.initializeWeatherIconMap();
    }

    onStart() {
        super.onStart();
        this.hydrate();
    }

    protected override async hydrate(): Promise<void> {
        const { latitude: lat, longitude: lon } =
            this.getLatitudeAndLongitude();
        const weatherData = await SanctuaryAPI.getCurrentWeather(lat, lon);
        this.updateUI(weatherData);
    }

    private initializeWeatherIconMap(): void {
        for (const texture of this.textures) {
            const iconName = texture.name.toLowerCase();
            const [time, code] = iconName.split("_");
            this.weatherIconMap[`${time}/${code}.png`] = texture;
        }
    }

    private removePrefixFromURL(url: string): string {
        if (this.weatherUrlPrefix && url.startsWith(this.weatherUrlPrefix)) {
            return url.slice(this.weatherUrlPrefix.length);
        }
        return url;
    }

    private updateUI(weatherData: CurrentWeather): void {
        this.locationText.text = weatherData.location.name;
        this.temperatureText.text = `${weatherData.current.feelslike_c}°C`;
        this.conditionText.text = weatherData.current.condition.text;

        const iconUrl = this.removePrefixFromURL(
            weatherData.current.condition.icon
        );
        const iconTexture = this.weatherIconMap[iconUrl];
        if (iconTexture) {
            this.weatherImageDisplay.mainPass.baseTex = iconTexture;
        }
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
