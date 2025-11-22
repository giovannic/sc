import { z } from "zod";
/**
 * Context entry with content and timestamp
 */
export const ContextEntrySchema = z.object({
    id: z.string().uuid("Entry ID must be a valid UUID"),
    content: z.string(),
    timestamp: z.number().int(),
});
/**
 * Request to create a new shared context
 */
export const CreateContextRequestSchema = z.object({
    entries: z
        .array(z.object({
        content: z.string(),
    }))
        .optional(),
    readme: z.string().optional(),
});
/**
 * Response from creating a context
 */
export const CreateContextResponseSchema = z.object({
    uri: z.string(),
    contextId: z.string().uuid(),
});
/**
 * Response containing README content
 */
export const GetReadmeResponseSchema = z.object({
    readme: z.string().nullable(),
});
/**
 * Request to update context README
 */
export const UpdateReadmeRequestSchema = z.object({
    readme: z.string(),
});
/**
 * Response from updating README
 */
export const UpdateReadmeResponseSchema = z.object({
    success: z.boolean(),
});
/**
 * Summary of a shared context
 */
export const ContextSummarySchema = z.object({
    id: z.string().uuid(),
    uri: z.string(),
    readme: z.string().nullable(),
});
/**
 * Response listing contexts
 */
export const ListContextsResponseSchema = z.object({
    contexts: z.array(ContextSummarySchema),
    total: z.number().int(),
});
/**
 * Response containing context entries
 */
export const GetContextResponseSchema = z.object({
    entries: z.array(ContextEntrySchema),
    total: z.number().int(),
});
/**
 * Request to add entry to context
 */
export const AddEntryRequestSchema = z.object({
    content: z.string(),
});
/**
 * Response from adding entry
 */
export const AddEntryResponseSchema = z.object({
    id: z.string().uuid(),
    timestamp: z.number().int(),
});
/**
 * Error response from API
 */
export const ErrorResponseSchema = z.object({
    error: z.string(),
});
/**
 * MCP Tool Input/Output Schemas
 */
/**
 * Input for create_context tool
 */
export const CreateContextToolInputSchema = z.object({
    entries: z
        .array(z.object({
        content: z.string(),
    }))
        .optional(),
    readme: z.string().optional(),
});
/**
 * Input for add_entry tool
 */
export const AddEntryToolInputSchema = z.object({
    contextId: z.string().uuid(),
    content: z.string(),
});
/**
 * Input for update_readme tool
 */
export const UpdateReadmeToolInputSchema = z.object({
    contextId: z.string().uuid(),
    readme: z.string(),
});
/**
 * Input for list_contexts tool
 */
export const ListContextsToolInputSchema = z.object({
    limit: z.number().int().min(1).default(20).optional(),
    offset: z.number().int().min(0).default(0).optional(),
});
//# sourceMappingURL=schemas.js.map