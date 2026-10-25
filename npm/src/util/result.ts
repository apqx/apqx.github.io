// 1. 定义类型结构
export type Result<T, E = Error> =
    | { readonly ok: true; readonly value: T }
    | { readonly ok: false; readonly error: E };

// 2. 构造辅助函数
export function ok<T>(value: T): Result<T, never> { return { ok: true, value } };
export function err<E>(error: E): Result<never, E> { return { ok: false, error } };

// 3. 类似 Kotlin runCatching 的包装器
export function runCatching<T>(block: () => T): Result<T, Error> {
    try {
        return ok(block());
    } catch (e) {
        return err(e instanceof Error ? e : new Error(String(e)));
    }
}

export async function runCatchingAsync<T>(
    block: () => Promise<T>
): Promise<Result<T, Error>> {
    try {
        const value = await block();
        return ok(value);
    } catch (e) {
        return err(e instanceof Error ? e : new Error(String(e)));
    }
}