export const getTypeName = <T>(instance: T): string => {
    if (instance && instance.constructor) {
        return instance.constructor.name;
    } else {
        return typeof instance;
    }
};

export const isEmptyObject = (obj: Record<string, unknown>): boolean =>
    Object.keys(obj).length === 0;
