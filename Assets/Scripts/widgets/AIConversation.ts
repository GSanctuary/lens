import { SanctuaryAPI } from "../services/SanctuaryAPI";
import { Conversation } from "../types/Sanctuary";
import { Widget } from "../Widget";
import { AIConversationItem } from "./AIConversationItem";

@component
export class AIConversation extends Widget {
    @input
    textPrefab: ObjectPrefab;
    @input
    scrollView: SceneObject;

    private conversations: Conversation[] = [];

    onAwake(): void {
        super.onAwake();
        print("AIConversation awake");
        this.createEvent("OnStartEvent").bind(() => this.onStart());
    }

    async onStart(): Promise<void> {
        super.onStart();
        await this.hydrate();
        this.populateConversations();
    }

    private populateConversations(): void {
        const yStart = 0;
        const yOffset = -5.4;

        for (let i = 0; i < this.conversations.length; i++) {
            print(`Conversation ${i}: ${this.conversations[i].title}`);
            const conversation = this.conversations[i];
            const item = this.textPrefab.instantiate(this.scrollView);
            const screenTransform = item.getComponent(
                "Component.ScreenTransform"
            );
            const aiConversationItem = item.getComponent<AIConversationItem>(
                AIConversationItem.getTypeName()
            );
            aiConversationItem.titleText.text = conversation.title;
            // Format the date to a more readable format
            aiConversationItem.dateText.text =
                conversation.createdAt.toDateString();
            screenTransform.offsets.setCenter(
                new vec2(0, yStart + yOffset * i)
            );
            item.enabled = true;
        }
    }

    protected async hydrate(): Promise<void> {
        this.conversations =
            await SanctuaryAPI.getInstance().getConversations();
    }
}
