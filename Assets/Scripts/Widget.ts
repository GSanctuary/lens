import { ContainerFrame } from "SpectaclesInteractionKit/Components/UI/ContainerFrame/ContainerFrame";
import { EventEmitter } from "./EventEmitter";
import { EventType } from "./types/Event";
import { WidgetKind } from "./types/WidgetKind";
import {
    CancelToken,
    clearTimeout,
    setTimeout,
} from "SpectaclesInteractionKit/Utils/FunctionTimingUtils";

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

    @input
    voiceInputDelay: number = 1000;

    kind: WidgetKind;

    protected isWidgetEnabled: boolean = false;
    private voiceTimeoutToken: CancelToken | undefined;

    onAwake() {
        this.createEvent("OnStartEvent").bind(() => this.onStart());
    }

    onStart() {
        this.frame = this.getSceneObject()
            .getChild(0)
            .getComponent(ContainerFrame.getTypeName());

        this.frame.onCloseButtonTriggerEvent.add(this.close.bind(this));
        this.kind = WidgetKind[this.kindString as keyof typeof WidgetKind];
        EventEmitter.registerWidget(this);
        this.registerEventHandlers();
    }

    protected registerEventHandlers(): void {
        EventEmitter.on(EventType.VoiceInput, this.handleVoiceInput.bind(this));
    }

    protected activateWidget(): Widget {
        this.frame.getSceneObject().enabled = true;
        this.placeInFrontOfCamera();
        this.isWidgetEnabled = true;
        print(`Widget ${this.kind} activated`);
        return this;
    }

    protected deactivateWidget(): Widget {
        EventEmitter.emit(EventType.WidgetClose, this.kind);
        this.frame.getSceneObject().enabled = false;
        this.isWidgetEnabled = false;
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
        if (!this.isWidgetEnabled) {
            return;
        }

        if (this.voiceTimeoutToken) {
            clearTimeout(this.voiceTimeoutToken);
        }

        this.voiceTimeoutToken = setTimeout(() => {
            this.handleVoiceInputCallback(input);
        }, this.voiceInputDelay);
    }

    protected handleVoiceInputCallback(input: string): void {
        print(`Handling voice input: ${input}`);
        this.voiceTimeoutToken = undefined;
    }
}
