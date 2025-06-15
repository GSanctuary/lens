export enum RemoveMethod {
    RemoveBefore,
    RemoveAllInstances,
    RemoveAfter,
    None,
}

export class VoicePrefixHandler {
    private regex: RegExp;
    private removeMethodHandlers: Record<
        string,
        (input: string, includePrefix?: boolean) => string
    >;
    private removeMethod: RemoveMethod;

    constructor(prefix: string, removeMethod: RemoveMethod) {
        prefix = prefix.trim().toLowerCase();
        this.regex = new RegExp(`^${prefix}`, "i");
        this.removeMethod = removeMethod;
        this.removeMethodHandlers = {
            [RemoveMethod.RemoveBefore]: this.removeBeforePrefix.bind(this),
            [RemoveMethod.RemoveAfter]: this.removeAfterPrefix.bind(this),
            [RemoveMethod.RemoveAllInstances]:
                this.removeAllInstances.bind(this),
            [RemoveMethod.None]: (input: string): string => input,
        };
    }

    checkForPrefix(input: string): boolean {
        return this.regex.test(input);
    }

    clean(input: string, includePrefix: boolean = true): string {
        const handler = this.removeMethodHandlers[this.removeMethod];
        if (handler) {
            return handler(input.trim().toLowerCase(), includePrefix);
        }
    }

    // Remove the part before the prefix
    private removeBeforePrefix(
        input: string,
        includePrefix: boolean = true
    ): string {
        input = input.trim().toLowerCase();
        const match = this.regex.exec(input);
        if (match) {
            let result = input.substring(
                match.index + (includePrefix ? match[0].length : 0)
            );
            result = this.strip(result);
            return result;
        }
        return input;
    }

    // Remove the part after the prefix
    private removeAfterPrefix(
        input: string,
        includePrefix: boolean = true
    ): string {
        const match = this.regex.exec(input);
        if (match) {
            return input.substring(
                0,
                match.index + (includePrefix ? 0 : match[0].length)
            );
        }
        return input;
    }

    // Remove all instances of the prefix
    private removeAllInstances(input: string, _: boolean = false): string {
        return input.replace(this.regex, "");
    }

    // Strips punctuation/whitespace from beginning and end of the string
    private strip(input: string): string {
        return input.replace(/^[\s.,!?]+|[\s.,!?]+$/g, "");
    }
}
