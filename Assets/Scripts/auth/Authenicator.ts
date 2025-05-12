import { SanctuaryAPI } from "../services/SanctuaryAPI";
import { PersistentStorageManager } from "../utils/PersistentStorageManager";

@component
export class Authenticator extends BaseScriptComponent {

    @input
    authKey: string;

    onAwake() {
        this.createEvent("OnStartEvent").bind(async () => {
            const store = PersistentStorageManager.getInstance();
            const existingAPIKey = store.get(this.authKey);
            if (existingAPIKey) {
                print(`Found API Key: ${existingAPIKey}`);
            } else {
                print(`No API Key found. Generating a new one.`);
                const newAPIKey = await this.generateAPIKey();
                store.set(this.authKey, newAPIKey);
                print(`Generated API Key: ${newAPIKey}`);

                // TODO: Tell event emitter to start listening
            }
        });
    }

    private async generateAPIKey(): Promise<string> {
        const sanctuaryAPI = SanctuaryAPI.getInstance();
        return await sanctuaryAPI.getCredentials()
    }
}