import { EventEmitter } from "./EventEmitter"
import { EventType } from "./types/Event";
import { PersistentStorageManager } from "./utils/PersistentStorageManager";

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
        this.registerEventHandlers();
    }

    protected registerEventHandlers() {
        this.eventEmitter.on(EventType.VoiceInput, this.handleVoiceInput);
    }
    
    protected hydrate() {
        throw new Error("hydrate() method not implemented.");
    }

    private handleVoiceInput(input: string) {
        print(`Handling voice input: ${input}`);
    }
}