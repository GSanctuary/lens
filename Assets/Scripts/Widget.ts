import { ContainerFrame } from "SpectaclesInteractionKit/Components/UI/ContainerFrame/ContainerFrame";
import { EventEmitter } from "./EventEmitter";
import { EventType } from "./types/Event";
import { WidgetKind } from "./types/WidgetKind";

@component
export class Widget extends BaseScriptComponent {
    @input
    kindString: string;

    @input
    frame: ContainerFrame;

    kind: WidgetKind;

    onAwake() {
        this.createEvent("OnStartEvent").bind(() => this.onStart());
    }

    onStart() {
        this.frame = this.getSceneObject()
            .getChild(0)
            .getComponent(ContainerFrame.getTypeName());

        this.frame.onCloseButtonTriggerEvent.add(this.close);

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

    protected activateWidget(): Widget {
        this.frame.getSceneObject().enabled = true;
        return this;
    }

    protected deactivateWidget(): Widget {
        EventEmitter.getInstance().closeWidget(this.kind);
        this.frame.getSceneObject().enabled = false;
        return this;
    }

    open = (args: Record<string, any>): Widget => {
        return this.activateWidget();
    };

    close = (): Widget => {
        return this.deactivateWidget();
    };

    protected async hydrate() {
        throw new Error("hydrate() method not implemented.");
    }

    protected handleVoiceInput = (input: string) => {
        print(`Handling voice input: ${input}`);
    };
}
