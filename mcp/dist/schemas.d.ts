import { z } from "zod";
/**
 * Context entry with content and timestamp
 */
export declare const ContextEntrySchema: z.ZodObject<{
    id: z.ZodString;
    content: z.ZodString;
    timestamp: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    id: string;
    content: string;
    timestamp: number;
}, {
    id: string;
    content: string;
    timestamp: number;
}>;
export type ContextEntry = z.infer<typeof ContextEntrySchema>;
/**
 * Request to create a new shared context
 */
export declare const CreateContextRequestSchema: z.ZodObject<{
    entries: z.ZodOptional<z.ZodArray<z.ZodObject<{
        content: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        content: string;
    }, {
        content: string;
    }>, "many">>;
    readme: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    entries?: {
        content: string;
    }[] | undefined;
    readme?: string | undefined;
}, {
    entries?: {
        content: string;
    }[] | undefined;
    readme?: string | undefined;
}>;
export type CreateContextRequest = z.infer<typeof CreateContextRequestSchema>;
/**
 * Response from creating a context
 */
export declare const CreateContextResponseSchema: z.ZodObject<{
    uri: z.ZodString;
    contextId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    uri: string;
    contextId: string;
}, {
    uri: string;
    contextId: string;
}>;
export type CreateContextResponse = z.infer<typeof CreateContextResponseSchema>;
/**
 * Response containing README content
 */
export declare const GetReadmeResponseSchema: z.ZodObject<{
    readme: z.ZodNullable<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    readme: string | null;
}, {
    readme: string | null;
}>;
export type GetReadmeResponse = z.infer<typeof GetReadmeResponseSchema>;
/**
 * Request to update context README
 */
export declare const UpdateReadmeRequestSchema: z.ZodObject<{
    readme: z.ZodString;
}, "strip", z.ZodTypeAny, {
    readme: string;
}, {
    readme: string;
}>;
export type UpdateReadmeRequest = z.infer<typeof UpdateReadmeRequestSchema>;
/**
 * Response from updating README
 */
export declare const UpdateReadmeResponseSchema: z.ZodObject<{
    success: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    success: boolean;
}, {
    success: boolean;
}>;
export type UpdateReadmeResponse = z.infer<typeof UpdateReadmeResponseSchema>;
/**
 * Summary of a shared context
 */
export declare const ContextSummarySchema: z.ZodObject<{
    id: z.ZodString;
    uri: z.ZodString;
    readme: z.ZodNullable<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    id: string;
    readme: string | null;
    uri: string;
}, {
    id: string;
    readme: string | null;
    uri: string;
}>;
export type ContextSummary = z.infer<typeof ContextSummarySchema>;
/**
 * Response listing contexts
 */
export declare const ListContextsResponseSchema: z.ZodObject<{
    contexts: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        uri: z.ZodString;
        readme: z.ZodNullable<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        readme: string | null;
        uri: string;
    }, {
        id: string;
        readme: string | null;
        uri: string;
    }>, "many">;
    total: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    contexts: {
        id: string;
        readme: string | null;
        uri: string;
    }[];
    total: number;
}, {
    contexts: {
        id: string;
        readme: string | null;
        uri: string;
    }[];
    total: number;
}>;
export type ListContextsResponse = z.infer<typeof ListContextsResponseSchema>;
/**
 * Response containing context entries
 */
export declare const GetContextResponseSchema: z.ZodObject<{
    entries: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        content: z.ZodString;
        timestamp: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        id: string;
        content: string;
        timestamp: number;
    }, {
        id: string;
        content: string;
        timestamp: number;
    }>, "many">;
    total: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    entries: {
        id: string;
        content: string;
        timestamp: number;
    }[];
    total: number;
}, {
    entries: {
        id: string;
        content: string;
        timestamp: number;
    }[];
    total: number;
}>;
export type GetContextResponse = z.infer<typeof GetContextResponseSchema>;
/**
 * Request to add entry to context
 */
export declare const AddEntryRequestSchema: z.ZodObject<{
    content: z.ZodString;
}, "strip", z.ZodTypeAny, {
    content: string;
}, {
    content: string;
}>;
export type AddEntryRequest = z.infer<typeof AddEntryRequestSchema>;
/**
 * Response from adding entry
 */
export declare const AddEntryResponseSchema: z.ZodObject<{
    id: z.ZodString;
    timestamp: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    id: string;
    timestamp: number;
}, {
    id: string;
    timestamp: number;
}>;
export type AddEntryResponse = z.infer<typeof AddEntryResponseSchema>;
/**
 * Error response from API
 */
export declare const ErrorResponseSchema: z.ZodObject<{
    error: z.ZodString;
}, "strip", z.ZodTypeAny, {
    error: string;
}, {
    error: string;
}>;
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;
/**
 * MCP Tool Input/Output Schemas
 */
/**
 * Input for create_context tool
 */
export declare const CreateContextToolInputSchema: z.ZodObject<{
    entries: z.ZodOptional<z.ZodArray<z.ZodObject<{
        content: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        content: string;
    }, {
        content: string;
    }>, "many">>;
    readme: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    entries?: {
        content: string;
    }[] | undefined;
    readme?: string | undefined;
}, {
    entries?: {
        content: string;
    }[] | undefined;
    readme?: string | undefined;
}>;
export type CreateContextToolInput = z.infer<typeof CreateContextToolInputSchema>;
/**
 * Input for add_entry tool
 */
export declare const AddEntryToolInputSchema: z.ZodObject<{
    contextId: z.ZodString;
    content: z.ZodString;
}, "strip", z.ZodTypeAny, {
    content: string;
    contextId: string;
}, {
    content: string;
    contextId: string;
}>;
export type AddEntryToolInput = z.infer<typeof AddEntryToolInputSchema>;
/**
 * Input for update_readme tool
 */
export declare const UpdateReadmeToolInputSchema: z.ZodObject<{
    contextId: z.ZodString;
    readme: z.ZodString;
}, "strip", z.ZodTypeAny, {
    readme: string;
    contextId: string;
}, {
    readme: string;
    contextId: string;
}>;
export type UpdateReadmeToolInput = z.infer<typeof UpdateReadmeToolInputSchema>;
/**
 * Input for list_contexts tool
 */
export declare const ListContextsToolInputSchema: z.ZodObject<{
    limit: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
    offset: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
    limit?: number | undefined;
    offset?: number | undefined;
}, {
    limit?: number | undefined;
    offset?: number | undefined;
}>;
export type ListContextsToolInput = z.infer<typeof ListContextsToolInputSchema>;
//# sourceMappingURL=schemas.d.ts.map