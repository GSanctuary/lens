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
    voicePrefix: string;

    onAwake(): void {
        this.createEvent("OnStartEvent").bind(() => this.onStart());
    }

    async onStart(): Promise<void> {
        super.onStart();
        this.titleText.text = "Task Name";
        this.registerEventHandlers();
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
    }

    protected override handleVoiceInputCallback(input: string) {
        this.titleText.text = input;
        this.createTask();
    }

    private async createTask(): Promise<void> {
        const taskName = this.titleText.text;
        // Ensure task name (after prefix is stripped) is not empty
        try {
            const task = await SanctuaryAPI.createTask(taskName);
            print(`Task created: ${task.name}`);
            EventEmitter.emit(EventType.TaskCreated, task);
        } catch (error) {
            print(`Error creating task: ${error}`);
        }
    }
}
