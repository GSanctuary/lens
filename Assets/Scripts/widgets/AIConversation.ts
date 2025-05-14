import { PinchButton } from "../../SpectaclesInteractionKit/Components/UI/PinchButton/PinchButton";
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
    @input newConversationButton: PinchButton;

    private conversations: Conversation[] = [];

    override onAwake(): void {
        print("AIConversation awake");
        this.createEvent("OnStartEvent").bind(() => this.onStart());
    }

    async onStart(): Promise<void> {
        super.onStart();
        this.newConversationButton.onButtonPinched.add(this.newConversation);
        await this.hydrateAndPopulate();
    }

    newConversation = (): void => {
        const maxId = this.conversations.reduce((acc, curr) =>
            curr.id > acc.id ? curr : acc
        ).id;
        const conversationTitle = `Conversation ${maxId + 1}`;
        SanctuaryAPI.getInstance()
            .newConversation(conversationTitle)
            .then((conversation) => {
                print(`New conversation created: ${conversation.title}`);
                this.conversations = [conversation, ...this.conversations];
                this.populateConversations();
            })
            .catch((error) => {
                print(`Error creating new conversation: ${error}`);
            });
    };

    private async hydrateAndPopulate(): Promise<void> {
        await this.hydrate();
        this.populateConversations();
    }

    private populateConversations(): void {
        print("Populating conversations");
        print(this.conversations.length);
        for (let i = 0; i < this.scrollView.getChildrenCount(); i++) {
            const child = this.scrollView.getChild(i);
            child.enabled = true;
            if (i >= this.conversations.length) {
                child.enabled = false;
                continue;
            }
            const aiConversationItem = child.getComponent(
                AIConversationItem.getTypeName()
            );
            aiConversationItem.titleText.text = this.conversations[i].title;
            aiConversationItem.dateText.text =
                this.conversations[i].createdAt.toLocaleString("en-US");
        }
    }

    protected async hydrate(): Promise<void> {
        this.conversations =
            await SanctuaryAPI.getInstance().getConversations();
        this.conversations = this.conversations.sort(
            (a, b) => -(a.createdAt.getTime() - b.createdAt.getTime())
        );
    }
}
