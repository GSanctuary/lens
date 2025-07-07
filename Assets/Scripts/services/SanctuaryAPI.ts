import {
    CompletionResponse,
    Conversation,
    convertRawCompletionResponseToCompletionResponse,
    convertRawConversationToConversation,
    convertRawStickyNoteResponseToStickyNote,
    convertRawTaskResponseToTaskResponse,
    CurrentWeather,
    RawCompletionResponse,
    RawConversation,
    RawStickyNoteResponse,
    RawTaskResponse,
    StickyNote,
    Task,
    Recipe,
} from "../types/Sanctuary";

@component
export class SanctuaryAPI extends BaseScriptComponent {
    @input
    baseUrl: string;

    @input
    prodUrl: string;

    @input
    useProd: boolean = false;

    @input
    remoteServiceModule: InternetModule;

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
        SanctuaryAPI.healthCheck();
    }

    onDestroy() {
        SanctuaryAPI.instance = null;
    }

    private static url(): string {
        return this.instance.useProd
            ? this.instance.prodUrl
            : this.instance.baseUrl;
    }

    static getInstance(): SanctuaryAPI {
        if (!this.instance) {
            throw new Error("SanctuaryAPI instance not initialized");
        }
        return this.instance;
    }

    static setAPIKey(apiKey: string) {
        this.instance.apiKey = apiKey;
        this.instance.headers["x-api-key"] = apiKey;
    }

    static async getCredentials(): Promise<string> {
        const request = new Request(`${this.url()}/user/credential`, {
            method: "POST",
        });
        const response = await this.instance.remoteServiceModule.fetch(request);

        if (response.status !== 201) {
            print("Failed to initialize user");
            throw new Error("Failed to initialize user");
        }

        const body = await response.json();

        return body.user.apiKey as string;
    }

    static async newConversation(title: string): Promise<Conversation> {
        if (!this.instance.apiKey) {
            throw new Error("API key not set");
        }

        const request = new Request(`${this.url()}/ai/conversation`, {
            method: "POST",
            body: JSON.stringify({ title }),
            headers: this.instance.headers,
        });

        const response = await this.instance.remoteServiceModule.fetch(request);
        if (response.status !== 201) {
            throw new Error("Failed to create conversation");
        }
        const body = await response.json();
        return convertRawConversationToConversation(body.conversation);
    }

    static async getConversations(): Promise<Conversation[]> {
        if (!this.instance.apiKey) {
            print("API key not set");
            throw new Error("API key not set");
        }

        const request = new Request(`${this.url()}/ai/conversation`, {
            method: "GET",
            headers: this.instance.headers,
        });
        const response = await this.instance.remoteServiceModule.fetch(request);

        if (response.status !== 200) {
            throw new Error("Failed to fetch conversations");
        }

        const body: { conversations: RawConversation[] } =
            await response.json();

        return body.conversations.map(convertRawConversationToConversation);
    }

    static async completion(
        conversationId: number,
        prompt: string
    ): Promise<CompletionResponse> {
        if (!this.instance.apiKey) {
            throw new Error("API key not set");
        }

        const request = new Request(`${this.url()}/ai/completion`, {
            method: "POST",
            body: JSON.stringify({ prompt, conversationId }),
            headers: this.instance.headers,
        });

        const response = await this.instance.remoteServiceModule.fetch(request);

        if (response.status !== 201) {
            throw new Error("Failed to create completion");
        }

        const body: { createdMessage: RawCompletionResponse } =
            await response.json();

        return convertRawCompletionResponseToCompletionResponse(
            body.createdMessage
        );
    }

    static async createTask(name: string): Promise<Task> {
        if (!this.instance.apiKey) {
            throw new Error("API key not set");
        }

        if (name.trim() === "") {
            throw new Error("Task name cannot be empty");
        }

        const request = new Request(`${this.url()}/task`, {
            method: "POST",
            headers: this.instance.headers,
            body: JSON.stringify({ task: name }),
        });

        const response = await this.instance.remoteServiceModule.fetch(request);

        if (response.status !== 201) {
            throw new Error("Failed to create task");
        }

        const body: { task: RawTaskResponse } = await response.json();

        return convertRawTaskResponseToTaskResponse(body.task);
    }

    static async getTasks(pageNumber: number = 1, pageSize: number = 10) {
        if (!this.instance.apiKey) {
            throw new Error("API key not set");
        }

        if (pageNumber <= 0 || pageSize <= 0) {
            pageNumber = 1;
            pageSize = 10;
        }

        const request = new Request(
            `${this.url()}/task/?pageNumber=${pageNumber}&pageSize=${pageSize}`,
            {
                method: "GET",
                headers: this.instance.headers,
            }
        );
        const response = await this.instance.remoteServiceModule.fetch(request);
        if (response.status !== 200) {
            throw new Error("Failed to fetch tasks");
        }
        const body: {
            tasks: RawTaskResponse[];
            page: number;
            pageCount: number;
            count: number;
        } = await response.json();
        return {
            tasks: body.tasks.map(convertRawTaskResponseToTaskResponse),
            pageCount: body.pageCount,
            count: body.count,
        };
    }

    static async completeTask(taskId: number): Promise<boolean> {
        if (!this.instance.apiKey) {
            throw new Error("API key not set");
        }

        const request = new Request(`${this.url()}/task/complete`, {
            method: "PUT",
            headers: this.instance.headers,
            body: JSON.stringify({ taskIds: [taskId] }),
        });

        const response = await this.instance.remoteServiceModule.fetch(request);

        return response.status === 201;
    }

    static async completeTasks(taskIds: number[]): Promise<boolean> {
        if (!this.instance.apiKey) {
            throw new Error("API key not set");
        }

        const request = new Request(`${this.url()}/task/complete`, {
            method: "PUT",
            headers: this.instance.headers,
            body: JSON.stringify({ taskIds }),
        });

        const response = await this.instance.remoteServiceModule.fetch(request);

        return response.status === 200;
    }

    static async createStickyNote(
        content: string,
        metadata: Record<string, any> = {}
    ): Promise<StickyNote> {
        if (!this.instance.apiKey) {
            throw new Error("API key not set");
        }

        if (content.trim() === "") {
            throw new Error("Sticky note content cannot be empty");
        }

        const request = new Request(`${this.url()}/sticky`, {
            method: "POST",
            headers: this.instance.headers,
            body: JSON.stringify({ content, metadata }),
        });

        const response = await this.instance.remoteServiceModule.fetch(request);

        if (response.status !== 201) {
            throw new Error("Failed to create sticky note");
        }

        const body = await response.json();

        return convertRawStickyNoteResponseToStickyNote(body.note);
    }

    static async updateStickyNote(
        noteId: number,
        content: string,
        metadata: Record<string, any> = {}
    ): Promise<boolean> {
        if (!this.instance.apiKey) {
            throw new Error("API key not set");
        }

        if (content.trim() === "") {
            throw new Error("Sticky note content cannot be empty");
        }

        const payload = {
            noteId,
            content,
            metadata,
        };

        const request = new Request(`${this.url()}/sticky/`, {
            method: "PUT",
            headers: this.instance.headers,
            body: JSON.stringify(payload),
        });

        const response = await this.instance.remoteServiceModule.fetch(request);

        if (response.status !== 200) {
            throw new Error("Failed to update sticky note");
        }

        return true;
    }

    static async getStickyNotes(): Promise<StickyNote[]> {
        if (!this.instance.apiKey) {
            throw new Error("API key not set");
        }

        const request = new Request(`${this.url()}/sticky`, {
            method: "GET",
            headers: this.instance.headers,
        });

        const response = await this.instance.remoteServiceModule.fetch(request);

        if (response.status !== 200) {
            throw new Error("Failed to fetch sticky notes");
        }

        const body: { notes: RawStickyNoteResponse[] } = await response.json();

        return body.notes.map(convertRawStickyNoteResponseToStickyNote);
    }

    static async deleteStickyNote(noteId: number): Promise<boolean> {
        if (!this.instance.apiKey) {
            throw new Error("API key not set");
        }

        const request = new Request(`${this.url()}/sticky?id=${noteId}`, {
            method: "DELETE",
            headers: this.instance.headers,
        });

        const response = await this.instance.remoteServiceModule.fetch(request);

        return response.status === 200;
    }

    static async getCurrentWeather(
        latitude: number,
        longitude: number
    ): Promise<CurrentWeather> {
        if (!this.instance.apiKey) {
            throw new Error("API key not set");
        }
        const request = new Request(
            `${this.url()}/weather/current?latitude=${latitude}&longitude=${longitude}`,
            {
                method: "GET",
                headers: this.instance.headers,
            }
        );
        const response = await this.instance.remoteServiceModule.fetch(request);

        if (response.status !== 200) {
            throw new Error("Failed to fetch current weather");
        }

        const body = await response.json();

        return body as CurrentWeather;
    }

    static async getRecipe(query: string): Promise<Recipe> {
        if (!this.instance.apiKey) {
            throw new Error("API key not set");
        }

        // Create a temporary conversation for recipe search
        const conversation = await this.newConversation("Recipe Search");
        
        const prompt = `Find a recipe for: ${query}. Return the response in the following JSON format:
{
  "id": "unique_id",
  "title": "Recipe Title",
  "description": "Brief description",
  "ingredients": [
    {
      "id": "ingredient_1",
      "name": "Ingredient Name",
      "amount": 2,
      "unit": "cups",
      "checked": false
    }
  ],
  "instructions": [
    {
      "id": "step_1",
      "stepNumber": 1,
      "description": "Step description",
      "timeRequired": 5
    }
  ],
  "prepTime": 15,
  "cookTime": 30,
  "servings": 4,
  "difficulty": "medium",
  "cuisine": "Italian",
  "tags": ["pasta", "dinner"]
}`;

        const completion = await this.completion(conversation.id, prompt);
        
        try {
            const recipeData = JSON.parse(completion.response);
            return recipeData as Recipe;
        } catch (error) {
            throw new Error("Failed to parse recipe data from AI response");
        }
    }

    private static async healthCheck() {
        const request = new Request(`${this.url()}/test`);
        const response = await this.instance.remoteServiceModule.fetch(request);

        if (response.status !== 200) {
            throw new Error("Failed to connect to the server");
        }
    }
}
