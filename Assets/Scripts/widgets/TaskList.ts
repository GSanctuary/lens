import { ScrollView } from "SpectaclesInteractionKit/Components/UI/ScrollView/ScrollView";
import { Widget } from "../Widget";
import { SanctuaryAPI } from "../services/SanctuaryAPI";
import { TaskResponse } from "../types/Sanctuary";
import { TaskListItem } from "./TaskListItem";

@component
export class TaskList extends Widget {
    @input
    textPrefab: ObjectPrefab;

    @input
    scrollView: SceneObject;

    private tasks: TaskResponse[] = [];

    override onAwake(): void {
        const scrollViewComponent = this.scrollView.getComponent(
            ScrollView.getTypeName()
        );
        if (!scrollViewComponent) {
            throw new Error("ScrollView component not found");
        }
        this.createEvent("OnStartEvent").bind(() => this.onStart());
    }

    override async onStart(): Promise<void> {
        super.onStart();
        this.populateTasks();
    }

    private populateTasks(): void {
        for (let i = 0; i < this.scrollView.getChildrenCount(); i++) {
            const child = this.scrollView.getChild(i);
            child.enabled = true;
            if (i >= this.tasks.length) {
                child.enabled = false;
                continue;
            }
            const task = this.tasks[i];
            const taskListItem = child.getComponent(TaskListItem.getTypeName());
            if (!taskListItem) {
                throw new Error("TaskListItem component not found");
            }
            taskListItem.setName(task.name);
            taskListItem.setDate(task.createdAt.toLocaleString("en-US"));
            taskListItem.setTaskId(task.id);
        }
    }

    protected override async hydrate(): Promise<void> {
        this.tasks = await SanctuaryAPI.getInstance().getTasks();
        this.tasks = this.tasks.sort(
            (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
        );
    }
}
