// servidor MCP STDIO based
export const logger = {
    info: (...args: unknown[]) => console.error("[unahur-mcp]", ...args),
    warn: (...args: unknown[]) => console.error("[unahur-mcp] WARN", ...args),
    error: (...args: unknown[]) => console.error("[unahur-mcp] ERROR", ...args),
};
