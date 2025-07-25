import { PinchButton } from "../../SpectaclesInteractionKit/Components/UI/PinchButton/PinchButton";
import { InteractorEvent } from "../../SpectaclesInteractionKit/Core/Interactor/InteractorEvent";

@component
export class IngredientItem extends BaseScriptComponent {
    @input
    ingredientText: Text;

    private ingredient: string;

    onAwake() {
    }

    initialize(ingredient: string) {
        this.ingredient = ingredient;
        this.updateDisplay();
    }

    private updateDisplay() {
        this.ingredientText.text = this.ingredient;
    }
} 