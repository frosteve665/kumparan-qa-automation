import { test, expect } from '../../../src/fixtures/api';
import { CREATE_POST, DELETE_POST, UPDATE_POST } from '../../../src/api/operations';

/**
 * GraphQLZero accepts mutations and answers as if they succeeded, but never
 * persists them (it is a read-only fake backend). So each test asserts the
 * mutation's own response; nothing needs cleaning up afterwards.
 */
test.describe('GraphQL mutations', { tag: ['@api', '@graphql'] }, () => {
  test(
    '[TC-API-008] createPost returns the new post echoing the input',
    { tag: ['@p1', '@positive'] },
    async ({ gql }) => {
      const input = { title: `QA automation ${test.info().workerIndex}`, body: 'Created through GraphQL variables' };

      const res = await gql.execute(CREATE_POST, { input });

      expect(res.status).toBe(200);
      expect(res.errors).toBeUndefined();
      expect(res.data?.createPost).toEqual({ id: expect.any(String), ...input });
    },
  );

  test(
    '[TC-API-009] updatePost returns the post with the new title',
    { tag: ['@p1', '@positive'] },
    async ({ gql }) => {
      const res = await gql.execute(UPDATE_POST, { id: '1', input: { title: 'Updated by QA automation' } });

      expect(res.status).toBe(200);
      expect(res.errors).toBeUndefined();
      expect(res.data?.updatePost.id).toBe('1');
      expect(res.data?.updatePost.title).toBe('Updated by QA automation');
    },
  );

  test('[TC-API-010] deletePost confirms the deletion', { tag: ['@p1', '@positive'] }, async ({ gql }) => {
    const res = await gql.execute(DELETE_POST, { id: '1' });

    expect(res.status).toBe(200);
    expect(res.errors).toBeUndefined();
    expect(res.data?.deletePost).toBe(true);
  });

  test(
    '[TC-API-011] createPost without the required title is rejected',
    { tag: ['@p1', '@negative'] },
    async ({ gql }) => {
      // Deliberately violates CreatePostInput (title: String!) via variables.
      const res = await gql.raw({ query: CREATE_POST.document, variables: { input: { body: 'no title' } } });

      expect(res.status).toBe(200);
      expect(res.data).toBeUndefined();
      expect(res.errors?.[0]?.extensions?.code).toBe('BAD_USER_INPUT');
      expect(res.errors?.[0]?.message).toContain('Field "title" of required type "String!" was not provided');
    },
  );
});
