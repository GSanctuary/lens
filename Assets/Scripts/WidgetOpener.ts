import { EventEmitter } from "./EventEmitter";
import { EventType } from "./types/Event";
import { WidgetKind } from "./types/WidgetKind";
import { TextButtonDisplay } from "./utils/TextButtonDisplay";

// Going to be always active for now
// Might convert to a regular widget later
@component
export class WidgetOpener extends BaseScriptComponent {
    @input
    private widgetListContainer: SceneObject;

    private registeredWidgetKinds: Map<string, WidgetKind> = new Map();

    onAwake() {
        this.createEvent("OnStartEvent").bind(() => this.onStart());
        EventEmitter.on(
            EventType.WidgetRegistered,
            this.registerWidgetKind.bind(this)
        );
    }

    onStart() {
        this.populateWidgetList();
    }

    registerWidgetKind(name: string, widgetKind: WidgetKind): void {
        this.registeredWidgetKinds.set(name, widgetKind);
        print(`Registered widget kind: ${name}`);
    }

    populateWidgetList(): void {
        const childrenLength = this.widgetListContainer.getChildrenCount();
        const widgetKinds = Array.from(this.registeredWidgetKinds.entries());
        for (let i = 0; i < childrenLength; i++) {
            const child = this.widgetListContainer.getChild(i);
            if (i >= widgetKinds.length) {
                child.enabled = false;
                continue;
            }
            const textDisplay = child.getComponent(
                TextButtonDisplay.getTypeName()
            );
            if (!textDisplay) {
                print(`TextButtonDisplay component not found on child ${i}`);
                return;
            }
            const [name, widgetKind] = widgetKinds[i];
            textDisplay.setTitle(name);
            textDisplay.setDescription(`Open ${name}`);
            textDisplay.addOnButtonPinchedCallback(this.openWidget(widgetKind));
        }
    }

    openWidget(widgetKind: WidgetKind) {
        return () => {
            EventEmitter.emit(EventType.WidgetOpen, widgetKind);
        };
    }
}
