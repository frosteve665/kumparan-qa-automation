import { test, expect } from '../../../src/fixtures/api';
import { GET_ALBUM_PHOTOS, GET_POST, GET_USER_WITH_POSTS, LIST_POSTS } from '../../../src/api/operations';
import { PhotoContract, PostContract, PostPageContract, UserContract } from '../../../src/api/contracts';

/**
 * Every test checks the three layers of a GraphQL response:
 * HTTP status, the `errors` field, and the `data` field (shape + values).
 */
test.describe('GraphQL queries', { tag: ['@api', '@graphql'] }, () => {
  test(
    '[TC-API-001] post by id returns the post with its author',
    { tag: ['@smoke', '@p1', '@positive'] },
    async ({ gql }) => {
      const res = await gql.execute(GET_POST, { id: '1' });

      expect(res.status).toBe(200);
      expect(res.errors).toBeUndefined();
      const post = PostContract.parse(res.data?.post);
      expect(post.id).toBe('1');
      expect(post.user.id).toBe('1');
    },
  );

  test(
    '[TC-API-002] posts are paginated with the requested page size and a total count',
    { tag: ['@p1', '@positive'] },
    async ({ gql }) => {
      const res = await gql.execute(LIST_POSTS, { options: { paginate: { page: 2, limit: 5 } } });

      expect(res.status).toBe(200);
      expect(res.errors).toBeUndefined();
      const page = PostPageContract.parse(res.data?.posts);
      expect(page.data).toHaveLength(5);
      expect(page.data.map((p) => p.id)).toEqual(['6', '7', '8', '9', '10']);
      expect(page.meta.totalCount).toBe(100);
    },
  );

  test(
    '[TC-API-003] user query resolves nested posts for that user only',
    { tag: ['@p1', '@positive'] },
    async ({ gql }) => {
      const res = await gql.execute(GET_USER_WITH_POSTS, { id: '2', options: { paginate: { limit: 3 } } });

      expect(res.status).toBe(200);
      expect(res.errors).toBeUndefined();
      const user = UserContract.parse(res.data?.user);
      expect(user.id).toBe('2');
      expect(res.data?.user.posts.data).toHaveLength(3);
      // Posts 11-20 belong to user 2 in the fixture data set.
      for (const post of res.data?.user.posts.data ?? []) expect(Number(post.id)).toBeGreaterThan(10);
    },
  );

  test(
    '[TC-API-004] album query returns its owner and photos with valid URLs',
    { tag: ['@p2', '@positive'] },
    async ({ gql }) => {
      const res = await gql.execute(GET_ALBUM_PHOTOS, { id: '1', options: { paginate: { limit: 4 } } });

      expect(res.status).toBe(200);
      expect(res.errors).toBeUndefined();
      expect(res.data?.album.id).toBe('1');
      UserContract.parse(res.data?.album.user);
      const photos = res.data?.album.photos.data ?? [];
      expect(photos).toHaveLength(4);
      for (const photo of photos) PhotoContract.parse(photo);
    },
  );

  test('[TC-API-005] keyword search returns only matching posts', { tag: ['@p2', '@positive'] }, async ({ gql }) => {
    const keyword = 'qui est esse';

    const res = await gql.execute(LIST_POSTS, { options: { search: { q: keyword } } });

    expect(res.status).toBe(200);
    expect(res.errors).toBeUndefined();
    const titles = PostPageContract.parse(res.data?.posts).data.map((p) => p.title);
    expect(titles.length).toBeGreaterThan(0);
    for (const title of titles) expect(title).toContain(keyword);
  });

  test('[TC-API-006] posts can be sorted by id descending', { tag: ['@p3', '@positive'] }, async ({ gql }) => {
    const res = await gql.execute(LIST_POSTS, {
      options: { sort: [{ field: 'id', order: 'DESC' }], paginate: { limit: 3 } },
    });

    expect(res.status).toBe(200);
    expect(res.errors).toBeUndefined();
    expect(PostPageContract.parse(res.data?.posts).data.map((p) => p.id)).toEqual(['100', '99', '98']);
  });

  test(
    '[TC-API-007] page boundary: the last page holds the remainder',
    { tag: ['@p2', '@boundary'] },
    async ({ gql }) => {
      const res = await gql.execute(LIST_POSTS, { options: { paginate: { page: 4, limit: 30 } } });

      expect(res.status).toBe(200);
      expect(res.errors).toBeUndefined();
      const page = PostPageContract.parse(res.data?.posts);
      // 100 posts / 30 per page: page 4 is the partial page with posts 91-100.
      expect(page.data).toHaveLength(10);
      expect(page.data.at(0)?.id).toBe('91');
      expect(page.data.at(-1)?.id).toBe('100');
    },
  );
});
