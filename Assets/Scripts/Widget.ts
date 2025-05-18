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

    @input
    camera: Camera;

    @input
    instantiationDistance: number = 100;

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

    protected registerEventHandlers(): void {
        EventEmitter.getInstance().on(
            EventType.VoiceInput,
            this.handleVoiceInput
        );
    }

    protected activateWidget(): Widget {
        this.frame.getSceneObject().enabled = true;
        this.placeInFrontOfCamera();
        return this;
    }

    protected deactivateWidget(): Widget {
        EventEmitter.getInstance().closeWidget(this.kind);
        this.frame.getSceneObject().enabled = false;
        return this;
    }

    protected placeInFrontOfCamera() {
        const cameraTransform = this.camera.getTransform();
        const widgetTransform = this.frame.getSceneObject().getTransform();
        const cameraPosition = cameraTransform.getWorldPosition();
        const cameraForward = cameraTransform.forward;

        const newPosition = cameraPosition.add(
            cameraForward.scale(new vec3(0, 0, -this.instantiationDistance))
        );
        widgetTransform.setWorldPosition(newPosition);
    }

    open(args: Record<string, any>): Widget {
        return this.activateWidget();
    }

    close(): Widget {
        return this.deactivateWidget();
    }

    protected async hydrate(): Promise<void> {
        throw new Error("hydrate() method not implemented.");
    }

    protected handleVoiceInput(input: string): void {
        print(`Handling voice input: ${input}`);
    }
}
