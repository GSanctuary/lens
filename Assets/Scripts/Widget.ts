import { EventEmitter } from "./EventEmitter";
import { EventType } from "./types/Event";

@component
export class Widget extends BaseScriptComponent {
    @input widgetName: string;

    onAwake() {
        this.createEvent("OnStartEvent").bind(() => this.onStart());
    }

    onStart() {
        EventEmitter.getInstance().registerWidget(this);
        this.registerEventHandlers();
    }

    protected registerEventHandlers() {
        EventEmitter.getInstance().on(
            EventType.VoiceInput,
            this.handleVoiceInput
        );
    }

    protected async hydrate() {
        throw new Error("hydrate() method not implemented.");
    }

    private handleVoiceInput(input: string) {
        print(`Handling voice input: ${input}`);
    }
}
