import { PinchButton } from "../../SpectaclesInteractionKit/Components/UI/PinchButton/PinchButton";
import { EventEmitter } from "../EventEmitter";
import { SanctuaryAPI } from "../services/SanctuaryAPI";
import { EventType } from "../types/Event";
import { WidgetKind } from "../types/WidgetKind";
import { Widget } from "../Widget";
import { TimerWidget } from "./TimerWidget";
import { RecipeCard } from "./RecipeCard";
import { IngredientItem } from "./IngredientItem";
import { Recipe } from "../types/Sanctuary";

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
    showRecipeButton: PinchButton;
    @input
    showIngredientsButton: PinchButton;

    private currentRecipe: Recipe | null = null;
    private currentInstructionIndex: number = 0;
    private timerWidgets: TimerWidget[] = [];
    private recipeCards: RecipeCard[] = [];
    private ingredientItems: IngredientItem[] = [];
    private currentView: 'timers' | 'recipe' | 'ingredients' = 'timers';

    override onAwake(): void {
        print("CookingAssistant awake");
        this.createEvent("OnStartEvent").bind(() => this.onStart())
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
        // Recipe controls
        this.recipeSearchButton.onButtonPinched.add(this.searchRecipe.bind(this));
        
        // Navigation
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

    private async searchRecipe(): Promise<void> {
        try {
            // Use voice input to get recipe query
            const query = await this.getVoiceInput("What recipe would you like to find?");
            if (!query) return;

            this.recipeSearchButton.enabled = false;
            this.recipeTitleText.text = "Searching for recipe...";
            
            const recipe = await SanctuaryAPI.getRecipe(query, ""); // TODO: Jesse please fix
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

        this.recipeTitleText.text = this.currentRecipe.name;
        this.recipeDescriptionText.text = this.currentRecipe.description;
        
        this.displayCurrentInstruction();
        this.displayIngredients();
    }

    private displayCurrentInstruction(): void {
        if (!this.currentRecipe || this.currentRecipe.steps.length === 0) return;

        const instruction = this.currentRecipe.steps[this.currentInstructionIndex];
        this.currentInstructionText.text = instruction;
        this.instructionProgressText.text = `${this.currentInstructionIndex + 1} of ${this.currentRecipe.steps.length}`;
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
            );
            this.ingredientItems.push(ingredientItem);
        }
    }

    private async getVoiceInput(prompt: string): Promise<string | null> {
        return "pasta carbonara";
    }

    protected override handleVoiceInputCallback(input: string): void {
        super.handleVoiceInputCallback(input);
    }
}
