import { PinchButton } from "SpectaclesInteractionKit/Components/UI/PinchButton/PinchButton";
import { EventEmitter } from "../EventEmitter";
import { SanctuaryAPI } from "../services/SanctuaryAPI";
import { EventType } from "../types/Event";
import { RemoveMethod, VoicePrefixHandler } from "../utils/VoicePrefixHandler";
import { Widget } from "../Widget";

@component
export class TaskCreation extends Widget {
    @input
    titleText: Text;

    @input
    statusText: Text;

    @input
    voicePrefix: string;

    @input
    initialTaskNameValue: string;

    @input
    confirmButton: PinchButton;

    @input
    denyButton: PinchButton;

    onAwake(): void {
        this.createEvent("OnStartEvent").bind(() => this.onStart());
    }

    async onStart(): Promise<void> {
        super.onStart();
        this.reset();
        this.registerEventHandlers();
        this.confirmButton.onButtonPinched.add(this.createTask.bind(this));
        this.denyButton.onButtonPinched.add(this.reset.bind(this));
    }

    protected override setupVoicePrefixHandler(): VoicePrefixHandler {
        return new VoicePrefixHandler(
            this.voicePrefix,
            RemoveMethod.RemoveBefore
        );
    }

    protected override handleVoiceInput(input: string): boolean {
        if (!super.handleVoiceInput(input)) return;
        this.titleText.text = input;
        this.statusText.text = "Processing...";
    }

    protected override handleVoiceInputCallback(input: string) {
        this.titleText.text = input;
        this.statusText.text = "";
    }

    private reset() {
        this.titleText.text = this.initialTaskNameValue;
    }

    private async createTask(): Promise<void> {
        const taskName = this.titleText.text;
        if (taskName === this.initialTaskNameValue) return;

        try {
            const task = await SanctuaryAPI.createTask(taskName);
            print(`Task created: ${task.name}`);
            EventEmitter.emit(EventType.TaskCreated, task);
        } catch (error) {
            print(`Error creating task: ${error}`);
        }

        this.reset();
    }
}
