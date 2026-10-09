import { test, expect } from '../../../src/fixtures/api';
import { GET_POST, LIST_POSTS } from '../../../src/api/operations';
import { GraphQLErrorContract } from '../../../src/api/contracts';

/**
 * Negative, boundary and security cases. Status codes follow Apollo Server:
 * a document that cannot be parsed or validated is 400; a valid document with
 * bad variables is 200 with an `errors` array and no `data`.
 */
test.describe('GraphQL error handling', { tag: ['@api', '@graphql'] }, () => {
  test('[TC-API-012] malformed document is rejected as a parse error', { tag: ['@p1', '@negative'] }, async ({ gql }) => {
    const res = await gql.raw({ query: 'query { post(id: 1) { id title ' });

    expect(res.status).toBe(400);
    expect(res.data).toBeUndefined();
    const error = GraphQLErrorContract.parse(res.errors?.[0]);
    expect(error.extensions.code).toBe('GRAPHQL_PARSE_FAILED');
    expect(error.message).toMatch(/^Syntax Error/);
  });

  test('[TC-API-013] unknown field is rejected by schema validation', { tag: ['@p1', '@negative'] }, async ({ gql }) => {
    const res = await gql.raw({ query: 'query GetPost($id: ID!) { post(id: $id) { id secretField } }', variables: { id: '1' } });

    expect(res.status).toBe(400);
    expect(res.data).toBeUndefined();
    expect(GraphQLErrorContract.parse(res.errors?.[0]).extensions.code).toBe('GRAPHQL_VALIDATION_FAILED');
    expect(res.errors?.[0]?.message).toContain('Cannot query field "secretField" on type "Post"');
  });

  test('[TC-API-014] missing required variable is reported as bad input', { tag: ['@p1', '@negative'] }, async ({ gql }) => {
    const res = await gql.raw({ query: GET_POST.document });

    expect(res.status).toBe(200);
    expect(res.data).toBeUndefined();
    expect(res.errors?.[0]?.extensions?.code).toBe('BAD_USER_INPUT');
    expect(res.errors?.[0]?.message).toContain('Variable "$id" of required type "ID!" was not provided');
  });

  test('[TC-API-015] wrong variable type is reported as bad input', { tag: ['@p2', '@negative'] }, async ({ gql }) => {
    const res = await gql.raw({ query: GET_POST.document, variables: { id: { nested: 'object' } } });

    expect(res.status).toBe(200);
    expect(res.data).toBeUndefined();
    expect(res.errors?.[0]?.extensions?.code).toBe('BAD_USER_INPUT');
    expect(res.errors?.[0]?.message).toContain('ID cannot represent value');
  });

  test('[TC-API-016] injection-shaped input travels as plain data', { tag: ['@p1', '@security'] }, async ({ gql }) => {
    // Because input is a variable, it can never alter the query document.
    const res = await gql.execute(LIST_POSTS, { options: { search: { q: `") { id } } mutation { deletePost(id: 1) } #` } } });

    expect(res.status).toBe(200);
    expect(res.errors).toBeUndefined();
    expect(res.data?.posts.data).toEqual([]);
  });

  test('[TC-API-017] GET request without a CSRF-safe header is blocked', { tag: ['@p2', '@security'] }, async ({ request }) => {
    const res = await request.get('', { params: { query: '{ post(id: 1) { id } }' } });

    expect(res.status()).toBe(400);
    expect(await res.text()).toContain('Cross-Site Request Forgery');
  });

  test('[TC-API-018] unknown post id returns null', {
    tag: ['@p2', '@boundary', '@defect'],
    annotation: { type: 'issue', description: 'BUG-004: unknown post id returns an object with null fields instead of null' },
  }, async ({ gql }) => {
    test.fail(true, 'Known defect BUG-004 still reproduces');

    const res = await gql.execute(GET_POST, { id: '999999' });

    expect(res.status).toBe(200);
    expect(res.errors).toBeUndefined();
    // Contract expectation: a nullable `post` should be null, not a ghost
    // object ({ id: null, title: null }) that clients will render as a post.
    expect(res.data?.post).toBeNull();
  });

  test('[TC-API-019] negative page limit is rejected', {
    tag: ['@p2', '@boundary', '@defect'],
    annotation: { type: 'issue', description: 'BUG-005: paginate.limit = -5 is accepted and returns the whole collection' },
  }, async ({ gql }) => {
    test.fail(true, 'Known defect BUG-005 still reproduces');

    const res = await gql.execute(LIST_POSTS, { options: { paginate: { page: 1, limit: -5 } } });

    expect(res.status).toBe(200);
    // Expected: BAD_USER_INPUT for an out-of-range limit, never 100 rows.
    expect(res.errors?.[0]?.extensions?.code).toBe('BAD_USER_INPUT');
  });
});
