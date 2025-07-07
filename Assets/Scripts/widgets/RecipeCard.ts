import { PinchButton } from "../../SpectaclesInteractionKit/Components/UI/PinchButton/PinchButton";
import { InteractorEvent } from "../../SpectaclesInteractionKit/Core/Interactor/InteractorEvent";
import { Instruction } from "../types/Sanctuary";

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

    private instruction: Instruction;
    private currentIndex: number;
    private totalSteps: number;
    private onNavigate: (direction: 'prev' | 'next') => void;
    private onAddTimer: (instruction: Instruction) => void;

    onAwake() {
        this.setupButtonCallbacks();
    }

    private setupButtonCallbacks() {
        this.previousButton.onButtonPinched.add(() => this.onNavigate('prev'));
        this.nextButton.onButtonPinched.add(() => this.onNavigate('next'));
        this.addTimerButton.onButtonPinched.add(() => this.onAddTimer(this.instruction));
    }

    initialize(
        instruction: Instruction, 
        currentIndex: number, 
        totalSteps: number,
        onNavigate: (direction: 'prev' | 'next') => void,
        onAddTimer: (instruction: Instruction) => void
    ) {
        this.instruction = instruction;
        this.currentIndex = currentIndex;
        this.totalSteps = totalSteps;
        this.onNavigate = onNavigate;
        this.onAddTimer = onAddTimer;
        this.updateDisplay();
        this.updateNavigationButtons();
    }

    private updateDisplay() {
        this.stepNumberText.text = `Step ${this.instruction.stepNumber}`;
        this.instructionText.text = this.instruction.description;
        
        if (this.instruction.timeRequired) {
            this.timeRequiredText.text = `Time: ${this.instruction.timeRequired} minutes`;
            this.timeRequiredText.enabled = true;
        } else {
            this.timeRequiredText.enabled = false;
        }

        if (this.instruction.tips) {
            this.tipsText.text = `Tip: ${this.instruction.tips}`;
            this.tipsText.enabled = true;
        } else {
            this.tipsText.enabled = false;
        }
    }

    private updateNavigationButtons() {
        this.previousButton.enabled = this.currentIndex > 0;
        this.nextButton.enabled = this.currentIndex < this.totalSteps - 1;
    }

    updateIndex(newIndex: number) {
        this.currentIndex = newIndex;
        this.updateNavigationButtons();
    }

    getInstruction(): Instruction {
        return this.instruction;
    }
} 