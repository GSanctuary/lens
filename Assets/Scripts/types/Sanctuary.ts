export type RawConversation = {
    id: number;
    createdAt: string;
    updatedAt: string;
    userId: number;
    title: string;
};

export type Conversation = {
    id: number;
    createdAt: Date;
    updatedAt: Date;
    userId: number;
    title: string;
};

export const convertRawConversationToConversation = (
    rawConversation: RawConversation
): Conversation => {
    return {
        ...rawConversation,
        createdAt: new Date(rawConversation.createdAt),
        updatedAt: new Date(rawConversation.updatedAt),
    };
};

export type RawCompletionResponse = {
    id: number;
    createdAt: string;
    updatedAt: string;
    conversationId: number;
    prompt: string;
    response: string;
};

export type CompletionResponse = {
    id: number;
    createdAt: Date;
    updatedAt: Date;
    conversationId: number;
    prompt: string;
    response: string;
};

export const convertRawCompletionResponseToCompletionResponse = (
    rawCompletionResponse: RawCompletionResponse
): CompletionResponse => {
    return {
        ...rawCompletionResponse,
        createdAt: new Date(rawCompletionResponse.createdAt),
        updatedAt: new Date(rawCompletionResponse.updatedAt),
    };
};

export type RawTaskResponse = {
    id: number;
    createdAt: string;
    updatedAt: string;
    userId: number;
    name: string;
    completed: boolean;
};

export type TaskResponse = {
    id: number;
    createdAt: Date;
    updatedAt: Date;
    userId: number;
    name: string;
    completed: boolean;
};

export const convertRawTaskResponseToTaskResponse = (
    rawTaskResponse: RawTaskResponse
): TaskResponse => {
    return {
        ...rawTaskResponse,
        createdAt: new Date(rawTaskResponse.createdAt),
        updatedAt: new Date(rawTaskResponse.updatedAt),
    };
};
