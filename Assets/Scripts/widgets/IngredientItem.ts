import { PinchButton } from "../../SpectaclesInteractionKit/Components/UI/PinchButton/PinchButton";
import { InteractorEvent } from "../../SpectaclesInteractionKit/Core/Interactor/InteractorEvent";
import { Ingredient } from "../types/Sanctuary";

@component
export class IngredientItem extends BaseScriptComponent {
    @input
    ingredientText: Text;

    @input
    checkboxButton: PinchButton;

    @input
    checkboxText: Text;

    private ingredient: Ingredient;
    private onToggle: (ingredientId: string, checked: boolean) => void;

    onAwake() {
        this.setupButtonCallbacks();
    }

    private setupButtonCallbacks() {
        this.checkboxButton.onButtonPinched.add(this.toggleCheckbox.bind(this));
    }

    initialize(ingredient: Ingredient, onToggle: (ingredientId: string, checked: boolean) => void) {
        this.ingredient = ingredient;
        this.onToggle = onToggle;
        this.updateDisplay();
    }

    private toggleCheckbox() {
        this.ingredient.checked = !this.ingredient.checked;
        this.updateDisplay();
        this.onToggle(this.ingredient.id, this.ingredient.checked);
    }

    private updateDisplay() {
        const amountText = this.ingredient.amount > 0 ? `${this.ingredient.amount} ${this.ingredient.unit} ` : '';
        const notesText = this.ingredient.notes ? ` (${this.ingredient.notes})` : '';
        this.ingredientText.text = `${amountText}${this.ingredient.name}${notesText}`;
        
        // Update checkbox appearance
        this.checkboxText.text = this.ingredient.checked ? "✓" : "☐";
    }

    getIngredient(): Ingredient {
        return this.ingredient;
    }

    setChecked(checked: boolean) {
        this.ingredient.checked = checked;
        this.updateDisplay();
    }
} 