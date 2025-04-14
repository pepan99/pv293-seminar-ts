export const serializeObject = (value: unknown): string => {
    try {
        return JSON.stringify(value);
    } catch (error) {
        if (error instanceof Error) throw new Error(`Serialization failed: ${error}`);
        throw new Error("Serialization failed");
    }
};

export const deserializeObject = <T>(value: string): T => {
    try {
        return JSON.parse(value) as T;
    } catch (error) {
        if (error instanceof Error) throw new Error(`Deserialization failed: ${error}`);
        throw new Error("Deserialization failed");
    }
};
