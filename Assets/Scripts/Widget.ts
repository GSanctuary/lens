import { EventEmitter } from "./EventEmitter"
import { PersistentStorageManager } from "./Utils/PersistentStorageManager";

@component
export class Widget extends BaseScriptComponent{
    @input widgetName: string;
    @input eventEmitter: EventEmitter;
    @input persistentStorage: PersistentStorageManager;

    onAwake() {
        this.createEvent("OnStartEvent").bind(() => this.onStart());
    }

    onStart() {
        this.eventEmitter.registerWidget(this);
        print(`Widget ${this.widgetName} registered.`);

        this.hydrate();
    }

    protected registerEventHandlers() {
        this.eventEmitter.on(Event.VoiceInput, (input: string) => {
            print(`Voice input received: ${input}`);
            this.handleVoiceInput(input);
        }
        );
    }
    
    protected hydrate() {
        throw new Error("hydrate() method not implemented.");
    }

    private handleVoiceInput(input: string) {
        print(`Handling voice input: ${input}`);
    }
}