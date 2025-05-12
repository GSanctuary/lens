import {
    CompletionResponse,
    Conversation,
    convertRawCompletionResponseToCompletionResponse,
    convertRawConversationToConversation,
    RawCompletionResponse,
    RawConversation,
} from "../types/Sanctuary";

@component
export class SanctuaryAPI extends BaseScriptComponent {
    @input
    baseUrl: string;

    @input
    remoteServiceModule: RemoteServiceModule;

    private static instance: SanctuaryAPI;
    private apiKey: string | null = null;
    private headers: Record<string, string> = {
        "Content-Type": "application/json",
    };

    onAwake() {
        if (SanctuaryAPI.instance) {
            this.destroy();
            return;
        }
        SanctuaryAPI.instance = this;
        this.healthCheck();
    }

    onDestroy() {
        SanctuaryAPI.instance = null;
    }

    static getInstance(): SanctuaryAPI {
        if (!this.instance) {
            throw new Error("SanctuaryAPI instance not initialized");
        }
        return this.instance;
    }

    setAPIKey(apiKey: string) {
        this.apiKey = apiKey;
        this.headers["x-api-key"] = apiKey;
    }

    async getCredentials(): Promise<string> {
        const request = new Request(`${this.baseUrl}/user`, {
            method: "POST",
        });
        const response = await this.remoteServiceModule.fetch(request);

        if (response.status !== 201) {
            throw new Error("Failed to initialize user");
        }

        const body = await response.json();

        return body.user.apiKey as string;
    }

    async newConversation(title: string): Promise<Conversation> {
        if (!this.apiKey) {
            throw new Error("API key not set");
        }

        const request = new Request(`${this.baseUrl}/ai/conversations`, {
            method: "POST",
            body: JSON.stringify({ title }),
            headers: this.headers,
        });

        const response = await this.remoteServiceModule.fetch(request);
        if (response.status !== 201) {
            throw new Error("Failed to create conversation");
        }
        const body = await response.json();
        return convertRawConversationToConversation(body.conversation);
    }

    async getConversations(): Promise<Conversation[]> {
        if (!this.apiKey) {
            throw new Error("API key not set");
        }

        const request = new Request(`${this.baseUrl}/ai/conversation`, {
            method: "GET",
            headers: this.headers,
        });
        const response = await this.remoteServiceModule.fetch(request);

        if (response.status !== 200) {
            throw new Error("Failed to fetch conversations");
        }

        const body: { conversations: RawConversation[] } =
            await response.json();

        return body.conversations.map(convertRawConversationToConversation);
    }

    async completion(
        conversationId: number,
        prompt: string
    ): Promise<CompletionResponse> {
        if (!this.apiKey) {
            throw new Error("API key not set");
        }

        const request = new Request(`${this.baseUrl}/ai/completion`, {
            method: "POST",
            body: JSON.stringify({ prompt, conversationId }),
            headers: this.headers,
        });

        const response = await this.remoteServiceModule.fetch(request);

        if (response.status !== 201) {
            throw new Error("Failed to create completion");
        }

        const body: { completion: RawCompletionResponse } =
            await response.json();

        return convertRawCompletionResponseToCompletionResponse(
            body.completion
        );
    }

    private async healthCheck() {
        const request = new Request(`${this.baseUrl}/test`);
        const response = await this.remoteServiceModule.fetch(request);

        if (response.status !== 200) {
            throw new Error("Failed to connect to the server");
        }
    }
}
