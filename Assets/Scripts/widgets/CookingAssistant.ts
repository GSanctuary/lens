import { PinchButton } from "../../SpectaclesInteractionKit/Components/UI/PinchButton/PinchButton";
import { EventEmitter } from "../EventEmitter";
import { SanctuaryAPI } from "../services/SanctuaryAPI";
import { EventType } from "../types/Event";
import { WidgetKind } from "../types/WidgetKind";
import { Widget } from "../Widget";
import { TimerWidget } from "./TimerWidget";
import { RecipeCard } from "./RecipeCard";
import { IngredientItem } from "./IngredientItem";
import { Recipe, Timer, Ingredient, Instruction } from "../types/Sanctuary";

@component
export class CookingAssistant extends Widget {
    // Timer section
    @input
    timerContainer: SceneObject;
    @input
    addTimerButton: PinchButton;
    @input
    timerDurationInput: Text; // For voice input of timer duration

    // Recipe section
    @input
    recipeSearchButton: PinchButton;
    @input
    recipeTitleText: Text;
    @input
    recipeDescriptionText: Text;
    @input
    recipeInfoText: Text;

    // Instruction carousel
    @input
    instructionContainer: SceneObject;
    @input
    currentInstructionText: Text;
    @input
    instructionProgressText: Text;

    // Ingredients list
    @input
    ingredientsContainer: SceneObject;
    @input
    ingredientsTitleText: Text;

    // Navigation
    @input
    showTimersButton: PinchButton;
    @input
    showRecipeButton: PinchButton;
    @input
    showIngredientsButton: PinchButton;

    private timers: Timer[] = [];
    private currentRecipe: Recipe | null = null;
    private currentInstructionIndex: number = 0;
    private timerWidgets: TimerWidget[] = [];
    private recipeCards: RecipeCard[] = [];
    private ingredientItems: IngredientItem[] = [];
    private currentView: 'timers' | 'recipe' | 'ingredients' = 'timers';

    override onAwake(): void {
        print("CookingAssistant awake");
        this.createEvent("OnStartEvent").bind(() => this.onStart());
    }

    override async onStart(): Promise<void> {
        super.onStart();
        await this.initializeWidget();
    }

    override open(args: Record<string, any>): Widget {
        this.initializeWidget();
        return this.activateWidget();
    }

    private async initializeWidget(): Promise<void> {
        this.setupButtonCallbacks();
        this.showView('timers');
    }

    private setupButtonCallbacks(): void {
        // Timer controls
        this.addTimerButton.onButtonPinched.add(this.addTimer.bind(this));
        
        // Recipe controls
        this.recipeSearchButton.onButtonPinched.add(this.searchRecipe.bind(this));
        
        // Navigation
        this.showTimersButton.onButtonPinched.add(() => this.showView('timers'));
        this.showRecipeButton.onButtonPinched.add(() => this.showView('recipe'));
        this.showIngredientsButton.onButtonPinched.add(() => this.showView('ingredients'));
    }

    private showView(view: 'timers' | 'recipe' | 'ingredients'): void {
        this.currentView = view;
        
        // Hide all containers
        this.timerContainer.enabled = false;
        this.instructionContainer.enabled = false;
        this.ingredientsContainer.enabled = false;
        
        // Show selected container
        switch (view) {
            case 'timers':
                this.timerContainer.enabled = true;
                break;
            case 'recipe':
                this.instructionContainer.enabled = true;
                break;
            case 'ingredients':
                this.ingredientsContainer.enabled = true;
                break;
        }
    }

    private addTimer(): void {
        // Default 5-minute timer
        const newTimer: Timer = {
            id: `timer_${Date.now()}`,
            name: `Timer ${this.timers.length + 1}`,
            duration: 300, // 5 minutes
            remainingTime: 300,
            isRunning: false,
            isCompleted: false,
            position: new vec3(0, 0, 0)
        };
        
        this.timers.push(newTimer);
        this.createTimerWidget(newTimer);
    }

    private createTimerWidget(timer: Timer): void {
        // Find an available timer widget slot
        for (let i = 0; i < this.timerContainer.getChildrenCount(); i++) {
            const child = this.timerContainer.getChild(i);
            if (!child.enabled) {
                child.enabled = true;
                const timerWidget = child.getComponent(TimerWidget.getTypeName());
                timerWidget.initialize(
                    timer,
                    this.onTimerComplete.bind(this),
                    this.onTimerDelete.bind(this)
                );
                this.timerWidgets.push(timerWidget);
                break;
            }
        }
    }

    private onTimerComplete(timerId: string): void {
        print(`Timer ${timerId} completed!`);
        // Could add audio notification here
    }

    private onTimerDelete(timerId: string): void {
        this.timers = this.timers.filter(t => t.id !== timerId);
        this.timerWidgets = this.timerWidgets.filter(tw => tw.getTimer().id !== timerId);
        
        // Disable the corresponding widget
        for (let i = 0; i < this.timerContainer.getChildrenCount(); i++) {
            const child = this.timerContainer.getChild(i);
            const timerWidget = child.getComponent(TimerWidget.getTypeName());
            if (timerWidget && timerWidget.getTimer().id === timerId) {
                child.enabled = false;
                break;
            }
        }
    }

    private async searchRecipe(): Promise<void> {
        try {
            // Use voice input to get recipe query
            const query = await this.getVoiceInput("What recipe would you like to find?");
            if (!query) return;

            this.recipeSearchButton.enabled = false;
            this.recipeTitleText.text = "Searching for recipe...";
            
            const recipe = await SanctuaryAPI.getRecipe(query);
            this.currentRecipe = recipe;
            this.currentInstructionIndex = 0;
            
            this.displayRecipe();
            this.showView('recipe');
        } catch (error) {
            print(`Error searching for recipe: ${error}`);
            this.recipeTitleText.text = "Error finding recipe";
        } finally {
            this.recipeSearchButton.enabled = true;
        }
    }

    private displayRecipe(): void {
        if (!this.currentRecipe) return;

        this.recipeTitleText.text = this.currentRecipe.title;
        this.recipeDescriptionText.text = this.currentRecipe.description;
        this.recipeInfoText.text = `Prep: ${this.currentRecipe.prepTime}min | Cook: ${this.currentRecipe.cookTime}min | Serves: ${this.currentRecipe.servings}`;
        
        this.displayCurrentInstruction();
        this.displayIngredients();
    }

    private displayCurrentInstruction(): void {
        if (!this.currentRecipe || this.currentRecipe.instructions.length === 0) return;

        const instruction = this.currentRecipe.instructions[this.currentInstructionIndex];
        this.currentInstructionText.text = instruction.description;
        this.instructionProgressText.text = `${this.currentInstructionIndex + 1} of ${this.currentRecipe.instructions.length}`;
    }

    private displayIngredients(): void {
        if (!this.currentRecipe) return;

        this.ingredientsTitleText.text = `Ingredients (${this.currentRecipe.ingredients.length})`;
        
        // Clear existing ingredient items
        this.ingredientItems.forEach(item => {
            item.getSceneObject().enabled = false;
        });
        this.ingredientItems = [];

        // Create new ingredient items
        for (let i = 0; i < Math.min(this.currentRecipe.ingredients.length, this.ingredientsContainer.getChildrenCount()); i++) {
            const child = this.ingredientsContainer.getChild(i);
            child.enabled = true;
            
            const ingredientItem = child.getComponent(IngredientItem.getTypeName());
            ingredientItem.initialize(
                this.currentRecipe.ingredients[i],
                this.onIngredientToggle.bind(this)
            );
            this.ingredientItems.push(ingredientItem);
        }
    }

    private onIngredientToggle(ingredientId: string, checked: boolean): void {
        if (!this.currentRecipe) return;
        
        const ingredient = this.currentRecipe.ingredients.find(i => i.id === ingredientId);
        if (ingredient) {
            ingredient.checked = checked;
        }
    }

    private async getVoiceInput(prompt: string): Promise<string | null> {
        // This would integrate with the voice input system
        // For now, return a default query
        return "pasta carbonara";
    }

    protected override handleVoiceInputCallback(input: string): void {
        super.handleVoiceInputCallback(input);
        
        // Handle voice commands for timers
        if (input.toLowerCase().includes("timer")) {
            const timeMatch = input.match(/(\d+)\s*(min|minute|minutes|sec|second|seconds)/i);
            if (timeMatch) {
                const time = parseInt(timeMatch[1]);
                const unit = timeMatch[2].toLowerCase();
                const duration = unit.startsWith('min') ? time * 60 : time;
                
                const newTimer: Timer = {
                    id: `timer_${Date.now()}`,
                    name: `Voice Timer`,
                    duration: duration,
                    remainingTime: duration,
                    isRunning: false,
                    isCompleted: false,
                    position: new vec3(0, 0, 0)
                };
                
                this.timers.push(newTimer);
                this.createTimerWidget(newTimer);
            }
        }
    }
}
