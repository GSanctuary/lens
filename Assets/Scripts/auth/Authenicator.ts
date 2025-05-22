import { EventEmitter } from "../EventEmitter";
import { SanctuaryAPI } from "../services/SanctuaryAPI";
import { PersistentStorageManager } from "../utils/PersistentStorageManager";

@component
export class Authenticator extends BaseScriptComponent {
    @input
    authKey: string;

    async onAwake() {
        const store = PersistentStorageManager.getInstance();
        let apiKey = store.get(this.authKey);
        if (apiKey) {
            print(`Found API Key: ${apiKey}`);
        } else {
            print(`No API Key found. Generating a new one.`);
            apiKey = await this.generateAPIKey();
            store.set(this.authKey, apiKey);
            print(`Generated API Key: ${apiKey}`);
        }
        SanctuaryAPI.setAPIKey(apiKey);
        EventEmitter.activate();
    }

    private async generateAPIKey(): Promise<string> {
        return await SanctuaryAPI.getCredentials();
    }
}
