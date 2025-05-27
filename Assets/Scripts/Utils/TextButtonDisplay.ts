import { PinchButton } from "SpectaclesInteractionKit/Components/UI/PinchButton/PinchButton";

@component
export class TextButtonDisplay extends BaseScriptComponent {
    @input
    private titleText: Text;

    @input
    private descriptionText: Text;

    @input
    private pinchButton: PinchButton;

    addOnButtonPinchedCallback(callback: () => void) {
        this.pinchButton.onButtonPinched.add(callback);
    }

    setTitle(title: string) {
        this.titleText.text = title;
    }

    setDescription(description: string) {
        this.descriptionText.text = description;
    }
}
