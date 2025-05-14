import { EventEmitter } from "./EventEmitter";
import { EventType } from "./types/Event";
import { WidgetKind } from "./types/WidgetKind";

@component
export class Widget extends BaseScriptComponent {
    @input
    kindString: string;

    kind: WidgetKind;

    onAwake() {
        this.createEvent("OnStartEvent").bind(() => this.onStart());
    }

    onStart() {
        print(this.kindString);
        switch (this.kindString) {
            case "AIConversation":
                this.kind = WidgetKind.AIConversation;
                break;
            case "AI":
                this.kind = WidgetKind.AI;
                break;
            default:
                break;
        }
        EventEmitter.getInstance().registerWidget(this);
        this.registerEventHandlers();
    }

    protected registerEventHandlers() {
        EventEmitter.getInstance().on(
            EventType.VoiceInput,
            this.handleVoiceInput
        );
    }

    open = (args: Record<string, any>) => {
        print(`Opening widget: ${this.kind}`);
        let object = global.scene.createSceneObject("AI Widget Instance");
        object = this.getSceneObject().copySceneObject(this.getSceneObject());
        object.enabled = true;
    };

    protected async hydrate() {
        throw new Error("hydrate() method not implemented.");
    }

    private handleVoiceInput(input: string) {
        print(`Handling voice input: ${input}`);
    }
}
