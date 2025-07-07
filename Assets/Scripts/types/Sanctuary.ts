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

export type Task = {
    id: number;
    createdAt: Date;
    updatedAt: Date;
    userId: number;
    name: string;
    completed: boolean;
};

export const convertRawTaskResponseToTaskResponse = (
    rawTaskResponse: RawTaskResponse
): Task => {
    return {
        ...rawTaskResponse,
        createdAt: new Date(rawTaskResponse.createdAt),
        updatedAt: new Date(rawTaskResponse.updatedAt),
    };
};

export type RawStickyNoteResponse = {
    id: number;
    createdAt: string;
    updatedAt: string;
    userId: number;
    content: string;
    metadata: Record<string, any>;
};

export type StickyNote = {
    id: number;
    createdAt: Date;
    updatedAt: Date;
    userId: number;
    content: string;
    metadata: Record<string, any>;
};

export const convertRawStickyNoteResponseToStickyNote = (
    rawStickyNoteResponse: RawStickyNoteResponse
): StickyNote => {
    return {
        ...rawStickyNoteResponse,
        createdAt: new Date(rawStickyNoteResponse.createdAt),
        updatedAt: new Date(rawStickyNoteResponse.updatedAt),
    };
};

type Location = {
    name: string;
    country: string;
    lat: number;
    lon: number;
};

export type CurrentWeather = {
    location: Location;
    current: {
        temp_c: number;
        condition: {
            text: string;
            icon: string;
        };
        humidity: number;
        wind_kph: number;
        feelslike_c: number;
        feelslike_f: number;
    };
};

// Recipe-related types
export type Recipe = {
    id: string;
    title: string;
    description: string;
    ingredients: Ingredient[];
    instructions: Instruction[];
    prepTime: number; // in minutes
    cookTime: number; // in minutes
    servings: number;
    difficulty: 'easy' | 'medium' | 'hard';
    cuisine: string;
    tags: string[];
};

export type Ingredient = {
    id: string;
    name: string;
    amount: number;
    unit: string;
    checked: boolean;
    notes?: string;
};

export type Instruction = {
    id: string;
    stepNumber: number;
    description: string;
    timeRequired?: number; // in minutes
    tips?: string;
};

export type Timer = {
    id: string;
    name: string;
    duration: number; // in seconds
    remainingTime: number; // in seconds
    isRunning: boolean;
    isCompleted: boolean;
    position: vec3; // 3D position in space
};
