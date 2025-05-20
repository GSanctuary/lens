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

    private async completeTask() {
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
