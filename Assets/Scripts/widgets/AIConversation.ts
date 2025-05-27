import { PinchButton } from "../../SpectaclesInteractionKit/Components/UI/PinchButton/PinchButton";
import { EventEmitter } from "../EventEmitter";
import { SanctuaryAPI } from "../services/SanctuaryAPI";
import { EventType } from "../types/Event";
import { Conversation } from "../types/Sanctuary";
import { WidgetKind } from "../types/WidgetKind";
import { Widget } from "../Widget";
import { AIConversationItem } from "./AIConversationItem";

@component
export class AIConversation extends Widget {
    @input
    scrollView: SceneObject;
    @input newConversationButton: PinchButton;

    private conversations: Conversation[] = [];

    override onAwake(): void {
        print("AIConversation awake");
        this.createEvent("OnStartEvent").bind(() => this.onStart());
    }

    override async onStart(): Promise<void> {
        super.onStart();
        await this.initializeWidget();
    }

    override open(args: Record<string, any>): Widget {
        this.initializeWidget();
        return this.activateWidget();
    }

    newConversation(): void {
        const maxId =
            this.conversations.length > 0
                ? this.conversations.reduce((acc, curr) =>
                      curr.id > acc.id ? curr : acc
                  ).id
                : 1;
        const conversationTitle = `Conversation ${maxId + 1}`;
        SanctuaryAPI.newConversation(conversationTitle)
            .then((conversation) => {
                print(`New conversation created: ${conversation.title}`);
                this.conversations = [conversation, ...this.conversations];
                this.populateConversations();
            })
            .catch((error) => {
                print(`Error creating new conversation: ${error}`);
            });
    }

    private async initializeWidget(): Promise<void> {
        this.newConversationButton.onButtonPinched.add(
            this.newConversation.bind(this)
        );
        await this.hydrateAndPopulate();
    }

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
                this.conversations[i].createdAt.toLocaleDateString();
            aiConversationItem.addButtonCallback(
                this.handleButtonConversationClick(this.conversations[i])
            );
        }
    }

    private handleButtonConversationClick(conversation: Conversation) {
        return () => {
            print(`Conversation clicked: ${conversation.title}`);
            EventEmitter.emit(
                EventType.WidgetOpen,
                WidgetKind.AI,
                conversation
            );
        };
    }

    protected override async hydrate(): Promise<void> {
        this.conversations = await SanctuaryAPI.getConversations();
        this.conversations = this.conversations.sort(
            (a, b) => -(a.createdAt.getTime() - b.createdAt.getTime())
        );
    }
}
