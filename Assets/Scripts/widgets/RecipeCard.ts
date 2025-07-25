import { PinchButton } from "../../SpectaclesInteractionKit/Components/UI/PinchButton/PinchButton";
import { InteractorEvent } from "../../SpectaclesInteractionKit/Core/Interactor/InteractorEvent";

@component
export class RecipeCard extends BaseScriptComponent {
    @input
    stepNumberText: Text;

    @input
    instructionText: Text;

    @input
    timeRequiredText: Text;

    @input
    tipsText: Text;

    @input
    previousButton: PinchButton;

    @input
    nextButton: PinchButton;

    @input
    addTimerButton: PinchButton;

    private instruction: string;
    private currentIndex: number;
    private totalSteps: number;
    private onNavigate: (direction: 'prev' | 'next') => void;

    onAwake() {
        this.setupButtonCallbacks();
    }

    private setupButtonCallbacks() {
        this.previousButton.onButtonPinched.add(() => this.onNavigate('prev'));
        this.nextButton.onButtonPinched.add(() => this.onNavigate('next'));
    }

    initialize(
        instruction: string, 
        currentIndex: number, 
        totalSteps: number,
        onNavigate: (direction: 'prev' | 'next') => void,
    ) {
        this.instruction = instruction;
        this.currentIndex = currentIndex;
        this.totalSteps = totalSteps;
        this.onNavigate = onNavigate;
        this.updateDisplay();
        this.updateNavigationButtons();
    }

    private updateDisplay() {
        this.stepNumberText.text = `Step ${this.currentIndex + 1}`;
        this.instructionText.text = this.instruction;
        this.timeRequiredText.enabled = false;
        this.tipsText.enabled = false;
    }

    private updateNavigationButtons() {
        this.previousButton.enabled = this.currentIndex > 0;
        this.nextButton.enabled = this.currentIndex < this.totalSteps - 1;
    }

    updateIndex(newIndex: number) {
        this.currentIndex = newIndex;
        this.updateNavigationButtons();
    }

    getInstruction(): string {
        return this.instruction;
    }
} 