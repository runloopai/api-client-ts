import { z } from 'zod';
/**
 * Base interface for all Runloop tools.
 * Runloop tool types are meant to be basic structures that make it easier to incorporate Runloop functionality into your agents regardless of the framework.
 */
export interface RunloopTool<TSchema extends z.ZodObject<any> = z.ZodObject<any>> {
  /**
   * Unique identifier for the tool
   */
  name: string;

  /**
   * Human-readable description of what the tool does
   */
  description: string;

  /**
   * Parameter schema for the tool using Zod
   */
  parameters: TSchema;

  /**
   * Function to execute the tool with given parameters
   * Parameters are automatically inferred from the Zod schema
   */
  execute: (params: z.infer<TSchema>) => Promise<string>;
}

/**
 * Helper function to create a strongly typed Runloop tool
 */
export function createTool<TSchema extends z.ZodObject<any>>(
  tool: RunloopTool<TSchema>,
): RunloopTool<TSchema> {
  return tool;
}
