@component
export class SanctuaryAPI extends BaseScriptComponent {

    @input
    baseUrl: string;

    @input
    remoteServiceModule: RemoteServiceModule;

    private static instance: SanctuaryAPI;

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

    public static getInstance(): SanctuaryAPI {
        if (!this.instance) {
            throw new Error("SanctuaryAPI instance not initialized");
        }
        return this.instance;
    }

    async getCredentials(): Promise<string> {
        const request = new Request(`${this.baseUrl}/user`, { method: "POST" });
        const response = await this.remoteServiceModule.fetch(request);

        if (response.status !== 201) {
            throw new Error("Failed to initialize user");
        }
        
        const body = await response.json();

        return body.user.apiKey as string;
    }

    private async healthCheck() {
        const request = new Request(`${this.baseUrl}/test`);
        const response = await this.remoteServiceModule.fetch(request);

        if (response.status !== 200) {
            throw new Error("Failed to connect to the server");
        }
    }
}
