import type { APIRequestContext, APIResponse } from '@playwright/test';

export interface GraphQLError {
  message: string;
  locations?: { line: number; column: number }[];
  path?: (string | number)[];
  extensions?: { code?: string; [key: string]: unknown };
}

export interface GraphQLResult<TData> {
  /** HTTP status. Apollo answers 400 for parse/validation errors and 200 for variable/resolver errors. */
  status: number;
  data?: TData | null;
  errors?: GraphQLError[];
  /** Server-side duration, for the evidence report. */
  durationMs: number;
}

/** A GraphQL operation with its result and variables types attached. */
export interface Operation<TData, TVariables extends Record<string, unknown> = Record<string, never>> {
  name: string;
  document: string;
  /** Phantom fields: carry types only, never read at runtime. */
  readonly __data?: TData;
  readonly __variables?: TVariables;
}

export function operation<TData, TVariables extends Record<string, unknown> = Record<string, never>>(name: string, document: string): Operation<TData, TVariables> {
  return { name, document };
}

/**
 * Thin client over Playwright's APIRequestContext.
 *
 * Inputs always travel as GraphQL variables, never concatenated into the
 * document, so test data can never change the shape of a query (the GraphQL
 * equivalent of a parameterised SQL statement).
 */
export class GraphQLClient {
  constructor(private readonly request: APIRequestContext, private readonly endpoint = '') {}

  async execute<TData, TVariables extends Record<string, unknown>>(
    op: Operation<TData, TVariables>,
    ...variables: keyof TVariables extends never ? [] : [TVariables]
  ): Promise<GraphQLResult<TData>> {
    return this.send<TData>({ operationName: op.name, query: op.document, ...(variables[0] ? { variables: variables[0] } : {}) });
  }

  /**
   * Sends an arbitrary body, for negative tests that must craft invalid
   * requests (malformed documents, missing variables, wrong types).
   */
  async raw<TData = unknown>(body: Record<string, unknown>): Promise<GraphQLResult<TData>> {
    return this.send<TData>(body);
  }

  private async send<TData>(body: Record<string, unknown>): Promise<GraphQLResult<TData>> {
    const started = Date.now();
    const response: APIResponse = await this.request.post(this.endpoint, {
      data: body,
      headers: { 'content-type': 'application/json', accept: 'application/json' },
    });
    const durationMs = Date.now() - started;
    const json = (await response.json().catch(() => ({}))) as { data?: TData | null; errors?: GraphQLError[] };
    return { status: response.status(), durationMs, ...('data' in json ? { data: json.data } : {}), ...(json.errors ? { errors: json.errors } : {}) };
  }
}
