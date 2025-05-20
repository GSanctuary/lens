import { PinchButton } from "SpectaclesInteractionKit/Components/UI/PinchButton/PinchButton";
import { Widget } from "../Widget";
import { SanctuaryAPI } from "../services/SanctuaryAPI";
import { Task } from "../types/Sanctuary";
import { TaskListItem } from "./TaskListItem";

type PageCacheEntry = {
    items: Task[];
    expiration: number;
};

@component
export class TaskList extends Widget {
    @input
    scrollView: SceneObject;

    @input
    cacheEntryExpiration: number = 1000 * 60 * 30; // 30 minutes

    @input
    nextPageButton: PinchButton;

    @input
    previousPageButton: PinchButton;

    @input
    pageNumberText: Text;

    private tasks: Task[] = [];
    private pageNumber: number = 1;
    private maxPageNumber: number = 1;

    private pageCache: Record<number, PageCacheEntry> = {};

    override onAwake(): void {
        this.createEvent("OnStartEvent").bind(() => this.onStart());
    }

    override async onStart(): Promise<void> {
        super.onStart();
        await this.hydrateAndPopulate();
        this.nextPageButton.onButtonPinched.add(this.nextPage.bind(this));
        this.previousPageButton.onButtonPinched.add(
            this.previousPage.bind(this)
        );
    }

    private nextPage(): void {
        if (this.pageNumber >= this.maxPageNumber) return;
        this.pageNumber++;
        this.formatPageNumber();
        this.hydrateAndPopulate();
    }

    private previousPage(): void {
        if (this.pageNumber <= 1) return;
        this.pageNumber--;
        this.formatPageNumber();
        this.hydrateAndPopulate();
    }

    private formatPageNumber(): void {
        if (this.maxPageNumber <= 0) {
            this.pageNumberText.text = "No tasks available";
            return;
        }
        this.pageNumberText.text = `Page ${this.pageNumber}/${this.maxPageNumber}`;
    }

    private async hydrateAndPopulate(): Promise<void> {
        await this.hydrate();
        this.formatPageNumber();
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
            taskListItem.removeCompletionCallback();
            taskListItem.setName(task.name);
            taskListItem.setDate(task.createdAt.toLocaleDateString());
            taskListItem.setTaskId(task.id);
            taskListItem.addCompletionCallback(this.onTaskCompleted.bind(this));
        }
    }

    protected override async hydrate(): Promise<void> {
        const cacheEntry = this.pageCache[this.pageNumber];
        if (cacheEntry && cacheEntry.expiration > Date.now()) {
            print("Using cached tasks");
            this.tasks = cacheEntry.items;
            return;
        }

        const { tasks, pageCount } = await SanctuaryAPI.getInstance().getTasks(
            this.pageNumber
        );
        this.maxPageNumber = pageCount;
        this.tasks = tasks;
        this.tasks = this.tasks.sort(
            (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
        );

        this.pageCache[this.pageNumber] = {
            items: this.tasks,
            expiration: Date.now() + this.cacheEntryExpiration,
        };
    }

    private onTaskCompleted(taskId: number): void {
        this.tasks = this.tasks.filter((task) => task.id !== taskId);
        this.populateTasks();
        this.pageCache[this.pageNumber] = {
            items: this.tasks,
            expiration: Date.now() + this.cacheEntryExpiration,
        };
    }
}
