import { ContainerFrame } from "SpectaclesInteractionKit/Components/UI/ContainerFrame/ContainerFrame";
import Event from "SpectaclesInteractionKit/Utils/Event";

// Renders text in a container frame
// Provides control over what happens on close
@component
export class TextDisplay extends BaseScriptComponent {
    @input
    text: Text;

    @input
    private containerFrame: ContainerFrame;

    private closeEvent: Event = new Event();
    public onClose = this.closeEvent.publicApi();

    onAwake() {
        this.createEvent("OnStartEvent").bind(() => this.onStart());
    }

    onStart() {
        this.containerFrame.onCloseButtonTriggerEvent.add(
            this.close.bind(this)
        );
    }

    close() {
        this.closeEvent.invoke();
    }
}
