import NativeLogger from "SpectaclesInteractionKit/Utils/NativeLogger";
import { SanctuaryAPI } from "../services/SanctuaryAPI";
import { Conversation } from "../types/Sanctuary";
import { Widget } from "../Widget";
import LogLevelProvider from "SpectaclesInteractionKit/Providers/InteractionConfigurationProvider/LogLevelProvider";

@component
export class AIView extends Widget {
    @input
    titleText: Text;

    @input
    inputText: Text;

    @input
    outputText: Text;

    private conversation: Conversation;

    open = (args: Record<string, any>): Widget => {
        const { title } = args;
        if (!title) {
            print("Title is required");
            return this.deactivateWidget();
        }
        this.titleText.text = title;
        this.conversation = args as Conversation;
        return this.activateWidget();
    };

    close = (): Widget => {
        this.inputText.text = "";
        this.outputText.text = "";
        return this.deactivateWidget();
    };

    protected override handleVoiceInput = (input: string) => {
        this.inputText.text = input;
        this.sendToAPI(input);
        this.outputText.text = "Thinking...";
    };

    private sendToAPI = async (input: string) => {
        if (!this.conversation) {
            throw new Error("Conversation is not set");
        }
        try {
            const response = await SanctuaryAPI.getInstance().completion(
                this.conversation.id,
                input
            );
            print(`Response: ${response.response}`);
            this.outputText.text = response.response;
        } catch (error) {
            print(`Error sending message: ${error}`);
        }
    };
}
