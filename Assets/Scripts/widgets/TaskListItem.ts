import { PinchButton } from "SpectaclesInteractionKit/Components/UI/PinchButton/PinchButton";
import { SanctuaryAPI } from "../services/SanctuaryAPI";

@component
export class TaskListItem extends BaseScriptComponent {
    @input
    nameText: Text;

    @input
    dateText: Text;

    @input
    pinchButton: PinchButton;

    private onCompletion: ((taskId: number) => void) | undefined;

    // Used to identify task when completing
    private taskId: number;

    onAwake() {
        this.pinchButton.onButtonPinched.add(() => {
            this.completeTask();
        });
    }

    setName(name: string) {
        this.nameText.text = name;
    }

    setDate(date: string) {
        this.dateText.text = date;
    }

    setTaskId(id: number) {
        this.taskId = id;
    }

    addCompletionCallback(callback: (taskId: number) => void) {
        this.onCompletion = callback;
    }

    removeCompletionCallback() {
        this.onCompletion = undefined;
    }

    private async completeTask() {
        print(`Called by ${this.taskId}`);
        const taskCompletion = await SanctuaryAPI.completeTask(this.taskId);
        // TODO: handle error more gracefully
        if (taskCompletion) {
            print(`Task ${this.taskId} completed`);
        } else {
            print(`Failed to complete task ${this.taskId}`);
        }
        if (this.onCompletion) {
            this.onCompletion(this.taskId);
        }
    }
}
