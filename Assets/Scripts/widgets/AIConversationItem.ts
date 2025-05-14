import { PinchButton } from "../../SpectaclesInteractionKit/Components/UI/PinchButton/PinchButton";
import { InteractorEvent } from "../../SpectaclesInteractionKit/Core/Interactor/InteractorEvent";

@component
export class AIConversationItem extends BaseScriptComponent {
    @input
    titleText: Text;

    @input
    dateText: Text;

    @input
    pinchButton: PinchButton;

    addButtonCallback = (callback: (evt: InteractorEvent) => void) => {
        this.pinchButton.onButtonPinched.add(callback);
    };
}
