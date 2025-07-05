export function normalizeName(input: string): string {
    return input
        .normalize("NFKC")      // 全角 → 半角変換（例：「ｱ」→「ア」、"１"→"1"）
        .replace(/\s+/g, "")    // 空白除去
        .toLowerCase();         // 小文字化
}