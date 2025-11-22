import { z } from "zod";

/**
 * Context entry with content and timestamp
 */
export const ContextEntrySchema = z.object({
  id: z.string().uuid("Entry ID must be a valid UUID"),
  content: z.string(),
  timestamp: z.number().int(),
});

export type ContextEntry = z.infer<typeof ContextEntrySchema>;

/**
 * Request to create a new shared context
 */
export const CreateContextRequestSchema = z.object({
  entries: z
    .array(
      z.object({
        content: z.string(),
      })
    )
    .optional(),
  readme: z.string().optional(),
});

export type CreateContextRequest =
  z.infer<typeof CreateContextRequestSchema>;

/**
 * Response from creating a context
 */
export const CreateContextResponseSchema = z.object({
  uri: z.string(),
  contextId: z.string().uuid(),
});

export type CreateContextResponse =
  z.infer<typeof CreateContextResponseSchema>;

/**
 * Response containing README content
 */
export const GetReadmeResponseSchema = z.object({
  readme: z.string().nullable(),
});

export type GetReadmeResponse =
  z.infer<typeof GetReadmeResponseSchema>;

/**
 * Request to update context README
 */
export const UpdateReadmeRequestSchema = z.object({
  readme: z.string(),
});

export type UpdateReadmeRequest =
  z.infer<typeof UpdateReadmeRequestSchema>;

/**
 * Response from updating README
 */
export const UpdateReadmeResponseSchema = z.object({
  success: z.boolean(),
});

export type UpdateReadmeResponse =
  z.infer<typeof UpdateReadmeResponseSchema>;

/**
 * Summary of a shared context
 */
export const ContextSummarySchema = z.object({
  id: z.string().uuid(),
  uri: z.string(),
  readme: z.string().nullable(),
});

export type ContextSummary = z.infer<typeof ContextSummarySchema>;

/**
 * Response listing contexts
 */
export const ListContextsResponseSchema = z.object({
  contexts: z.array(ContextSummarySchema),
  total: z.number().int(),
});

export type ListContextsResponse =
  z.infer<typeof ListContextsResponseSchema>;

/**
 * Response containing context entries
 */
export const GetContextResponseSchema = z.object({
  entries: z.array(ContextEntrySchema),
  total: z.number().int(),
});

export type GetContextResponse =
  z.infer<typeof GetContextResponseSchema>;

/**
 * Request to add entry to context
 */
export const AddEntryRequestSchema = z.object({
  content: z.string(),
});

export type AddEntryRequest =
  z.infer<typeof AddEntryRequestSchema>;

/**
 * Response from adding entry
 */
export const AddEntryResponseSchema = z.object({
  id: z.string().uuid(),
  timestamp: z.number().int(),
});

export type AddEntryResponse =
  z.infer<typeof AddEntryResponseSchema>;

/**
 * Error response from API
 */
export const ErrorResponseSchema = z.object({
  error: z.string(),
});

export type ErrorResponse =
  z.infer<typeof ErrorResponseSchema>;

/**
 * MCP Tool Input/Output Schemas
 */

/**
 * Input for create_context tool
 */
export const CreateContextToolInputSchema = z.object({
  entries: z
    .array(
      z.object({
        content: z.string(),
      })
    )
    .optional(),
  readme: z.string().optional(),
});

export type CreateContextToolInput =
  z.infer<typeof CreateContextToolInputSchema>;

/**
 * Input for add_entry tool
 */
export const AddEntryToolInputSchema = z.object({
  contextId: z.string().uuid(),
  content: z.string(),
});

export type AddEntryToolInput =
  z.infer<typeof AddEntryToolInputSchema>;

/**
 * Input for update_readme tool
 */
export const UpdateReadmeToolInputSchema = z.object({
  contextId: z.string().uuid(),
  readme: z.string(),
});

export type UpdateReadmeToolInput =
  z.infer<typeof UpdateReadmeToolInputSchema>;

/**
 * Input for list_contexts tool
 */
export const ListContextsToolInputSchema = z.object({
  limit: z.number().int().min(1).default(20).optional(),
  offset: z.number().int().min(0).default(0).optional(),
});

export type ListContextsToolInput =
  z.infer<typeof ListContextsToolInputSchema>;
