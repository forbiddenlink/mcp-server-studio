/**
 * mcp-server-studio - MCP Protocol validation utilities
 * Validates MCP server definitions against the official spec
 */
import { z } from "zod";
import Ajv from "ajv";
import zodToJsonSchema from "zod-to-json-schema";

const ajv = new Ajv({ allErrors: true });

// ── MCP Tool Schema ────────────────────────────────────────────────────────────

export const MCPInputSchemaSchema = z.object({
  type: z.literal("object"),
  properties: z
    .record(
      z.string(),
      z.object({
        type: z.string(),
        description: z.string().optional(),
        enum: z.array(z.unknown()).optional(),
      }),
    )
    .optional(),
  required: z.array(z.string()).optional(),
});

export const MCPToolSchema = z.object({
  name: z
    .string()
    .regex(/^[a-zA-Z_][a-zA-Z0-9_-]*$/, "Tool names must be valid identifiers"),
  description: z.string().min(1, "Description is required"),
  inputSchema: MCPInputSchemaSchema,
});

export const MCPServerSchema = z.object({
  name: z.string().min(1),
  version: z.string().regex(/^\d+\.\d+\.\d+$/, "Version must be semver"),
  description: z.string().optional(),
  tools: z.array(MCPToolSchema),
  resources: z
    .array(
      z.object({
        uri: z.string(),
        name: z.string(),
        description: z.string().optional(),
        mimeType: z.string().optional(),
      }),
    )
    .optional(),
  prompts: z
    .array(
      z.object({
        name: z.string(),
        description: z.string().optional(),
        arguments: z
          .array(
            z.object({
              name: z.string(),
              description: z.string().optional(),
              required: z.boolean().optional(),
            }),
          )
          .optional(),
      }),
    )
    .optional(),
});

export type MCPServer = z.infer<typeof MCPServerSchema>;
export type MCPTool = z.infer<typeof MCPToolSchema>;

// ── Validation ─────────────────────────────────────────────────────────────────

export function validateMCPServer(serverDef: unknown): {
  valid: boolean;
  errors: string[];
  data?: MCPServer;
} {
  const result = MCPServerSchema.safeParse(serverDef);
  if (result.success) {
    return { valid: true, errors: [], data: result.data };
  }
  const errors = result.error.issues.map(
    (e) => `${e.path.join(".")}: ${e.message}`,
  );
  return { valid: false, errors };
}

// ── JSON Schema Generation ─────────────────────────────────────────────────────

export function generateJSONSchema(zodSchema: z.ZodTypeAny): object {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return zodToJsonSchema(zodSchema as any, { name: "schema" });
}

export function generateMCPServerJSONSchema(): object {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return zodToJsonSchema(MCPServerSchema as any, { name: "MCPServer" });
}

// ── Tool Name Validation ───────────────────────────────────────────────────────

export function isValidToolName(name: string): boolean {
  return /^[a-zA-Z_][a-zA-Z0-9_-]*$/.test(name) && name.length <= 64;
}

export function suggestToolName(displayName: string): string {
  return displayName
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "_")
    .replace(/^[^a-z_]/, "_")
    .slice(0, 64);
}
