import { test as base, expect } from '@playwright/test';
import { GraphQLClient } from '../api/graphql-client';

/**
 * API fixture: each test gets a GraphQL client on Playwright's own `request`
 * fixture (baseURL comes from the api-graphql project), isolated per test.
 */
export const test = base.extend<{ gql: GraphQLClient }>({
  gql: async ({ request }, use) => use(new GraphQLClient(request)),
});

export { expect };
