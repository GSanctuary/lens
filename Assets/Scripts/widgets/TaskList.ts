import { PinchButton } from "SpectaclesInteractionKit/Components/UI/PinchButton/PinchButton";
import { Widget } from "../Widget";
import { SanctuaryAPI } from "../services/SanctuaryAPI";
import { Task } from "../types/Sanctuary";
import { TaskListItem } from "./TaskListItem";
import { clamp } from "SpectaclesInteractionKit/Utils/mathUtils";
import { EventEmitter } from "../EventEmitter";
import { EventType } from "../types/Event";
import { WidgetKind } from "../types/WidgetKind";

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
    pageSize: number = 10;

    @input
    pageNumberText: Text;

    @input
    newTaskButton: PinchButton;

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
        this.newTaskButton.onButtonPinched.add(
            this.openNewTaskWidget.bind(this)
        );
    }

    protected override registerEventHandlers(): void {
        super.registerEventHandlers();
        EventEmitter.on(EventType.TaskCreated, this.addTask.bind(this));
    }

    private addTask(task: Task): void {
        print(`Adding task ${task.name}`);
        if (this.pageCache[this.maxPageNumber]) {
            const newTasks = [
                ...this.pageCache[this.maxPageNumber].items,
                task,
            ];
            if (newTasks.length > this.pageSize) {
                this.pageCache[++this.maxPageNumber] = {
                    items: [task],
                    expiration: Date.now() + this.cacheEntryExpiration,
                };
            } else {
                this.pageCache[this.maxPageNumber].items = newTasks;
                this.pageCache[this.maxPageNumber].expiration =
                    Date.now() + this.cacheEntryExpiration;
            }
        } else {
            this.pageCache[++this.maxPageNumber] = {
                items: [task],
                expiration: Date.now() + this.cacheEntryExpiration,
            };
            this.pageNumber = this.maxPageNumber;
        }

        this.tasks = this.pageCache[this.pageNumber].items;
        this.populateTasks();
        this.formatPageNumber();
    }

    private openNewTaskWidget(): void {
        EventEmitter.emit(EventType.WidgetOpen, WidgetKind.TaskCreation);
    }

    private nextPage(): void {
        if (this.pageNumber >= this.maxPageNumber) return;
        this.pageNumber++;
        this.updatePage();
    }

    private previousPage(): void {
        if (this.pageNumber <= 1) return;
        this.pageNumber--;
        this.updatePage();
    }

    private async updatePage(): Promise<void> {
        const cacheEntry = this.pageCache[this.pageNumber];
        if (cacheEntry && cacheEntry.expiration > Date.now()) {
            this.tasks = cacheEntry.items;
        } else {
            await this.fetchEntry(this.pageNumber);
        }
        this.formatPageNumber();
        this.populateTasks();
    }

    private async fetchEntry(entryNumber: number): Promise<void> {
        const { tasks: cachedTasks } = await SanctuaryAPI.getTasks(
            entryNumber,
            this.pageSize
        );
        this.pageCache[entryNumber] = {
            items: cachedTasks.sort(
                (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
            ),
            expiration: Date.now() + this.cacheEntryExpiration,
        };
    }

    private repaginate(taskId: number): void {
        let allTasks: Task[] = [];
        for (let i = 1; i <= this.maxPageNumber; i++) {
            const cacheEntry = this.pageCache[i];
            if (cacheEntry) {
                allTasks = allTasks.concat(cacheEntry.items);
            }
        }
        const processedTasks = allTasks.filter((task) => task.id !== taskId);
        this.maxPageNumber = Math.ceil(processedTasks.length / this.pageSize);
        this.pageNumber = clamp(this.pageNumber, 1, this.maxPageNumber);

        this.pageCache = {};

        for (let i = 1; i <= this.maxPageNumber; i++) {
            this.pageCache[i] = {
                items: processedTasks.slice(
                    (i - 1) * this.pageSize,
                    i * this.pageSize
                ),
                expiration: Date.now() + this.cacheEntryExpiration,
            };
        }
        this.tasks = this.pageCache[this.pageNumber]
            ? this.pageCache[this.pageNumber].items
            : [];
    }

    private formatPageNumber(): void {
        if (this.maxPageNumber <= 0) {
            this.pageNumberText.text = "0/0";
            return;
        }
        this.pageNumberText.text = `${this.pageNumber}/${this.maxPageNumber}`;
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
            taskListItem.setName(task.name);
            taskListItem.setDate(task.createdAt.toLocaleDateString());
            taskListItem.setTaskId(task.id);
            taskListItem.addCompletionCallback(this.onTaskCompleted.bind(this));
        }
    }

    protected override async hydrate(): Promise<void> {
        const { tasks, pageCount } = await SanctuaryAPI.getTasks(
            this.pageNumber,
            this.pageSize
        );
        this.maxPageNumber = pageCount;

        this.pageCache[this.pageNumber] = {
            items: tasks.sort(
                (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
            ),
            expiration: Date.now() + this.cacheEntryExpiration,
        };

        const promises: Promise<void>[] = [];

        for (let i = 2; i <= this.maxPageNumber; i++) {
            promises.push(this.fetchEntry(i));
        }
        await Promise.all(promises);
        this.tasks = this.pageCache[this.pageNumber].items;
    }

    private onTaskCompleted(taskId: number): void {
        this.repaginate(taskId);
        this.formatPageNumber();
        this.populateTasks();
    }
}
