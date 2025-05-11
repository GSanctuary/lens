import { PersistentStorageManager } from "../utils/PersistentStorageManager";

@component
export class Authenticator extends BaseScriptComponent {

    @input
    authKey: string;

    onAwake() {
        this.createEvent("OnStartEvent").bind(() => {
            const store = PersistentStorageManager.getInstance();
            const existingAPIKey = store.get(this.authKey);
            if (existingAPIKey) {
                print(`Found API Key: ${existingAPIKey}`);
            } else {
                print("Setting API key...");
                store.set(this.authKey, "test");
            }

            // TODO: Tell event emitter to start listening
        });
    }
}