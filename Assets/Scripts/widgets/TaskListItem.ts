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

    private onCompletion: Array<(taskId: number) => void> = [];

    // Used to identify task when completing
    private taskId: number;

    onAwake() {
        this.pinchButton.onButtonPinched.add(this.completeTask.bind(this));
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
        this.onCompletion.push(callback);
    }

    removeCompletionCallback(callback: (taskId: number) => void) {
        this.onCompletion = this.onCompletion.filter((cb) => cb !== callback);
    }

    private async completeTask() {
        this.onCompletion.forEach((callback) => callback(this.taskId));
        const taskCompletion = await SanctuaryAPI.getInstance().completeTask(
            this.taskId
        );
        // TODO: handle error more gracefully
        if (taskCompletion) {
            print(`Task ${this.taskId} completed`);
        } else {
            print(`Failed to complete task ${this.taskId}`);
        }
    }
}
