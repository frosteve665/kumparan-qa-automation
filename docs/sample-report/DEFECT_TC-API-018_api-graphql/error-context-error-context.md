# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: api\graphql\negative.spec.ts >> GraphQL error handling >> [TC-API-018] unknown post id returns null
- Location: tests\api\graphql\negative.spec.ts:85:3

# Error details

```
Error: expect(received).toBeNull()

Received: {"body": null, "id": null, "title": null, "user": {"email": null, "id": null, "name": null}}
```

# Test source

```ts
  3   | import { GraphQLErrorContract } from '../../../src/api/contracts';
  4   | 
  5   | /**
  6   |  * Negative, boundary and security cases. Status codes follow Apollo Server:
  7   |  * a document that cannot be parsed or validated is 400; a valid document with
  8   |  * bad variables is 200 with an `errors` array and no `data`.
  9   |  */
  10  | test.describe('GraphQL error handling', { tag: ['@api', '@graphql'] }, () => {
  11  |   test(
  12  |     '[TC-API-012] malformed document is rejected as a parse error',
  13  |     { tag: ['@p1', '@negative'] },
  14  |     async ({ gql }) => {
  15  |       const res = await gql.raw({ query: 'query { post(id: 1) { id title ' });
  16  | 
  17  |       expect(res.status).toBe(400);
  18  |       expect(res.data).toBeUndefined();
  19  |       const error = GraphQLErrorContract.parse(res.errors?.[0]);
  20  |       expect(error.extensions.code).toBe('GRAPHQL_PARSE_FAILED');
  21  |       expect(error.message).toMatch(/^Syntax Error/);
  22  |     },
  23  |   );
  24  | 
  25  |   test(
  26  |     '[TC-API-013] unknown field is rejected by schema validation',
  27  |     { tag: ['@p1', '@negative'] },
  28  |     async ({ gql }) => {
  29  |       const res = await gql.raw({
  30  |         query: 'query GetPost($id: ID!) { post(id: $id) { id secretField } }',
  31  |         variables: { id: '1' },
  32  |       });
  33  | 
  34  |       expect(res.status).toBe(400);
  35  |       expect(res.data).toBeUndefined();
  36  |       expect(GraphQLErrorContract.parse(res.errors?.[0]).extensions.code).toBe('GRAPHQL_VALIDATION_FAILED');
  37  |       expect(res.errors?.[0]?.message).toContain('Cannot query field "secretField" on type "Post"');
  38  |     },
  39  |   );
  40  | 
  41  |   test(
  42  |     '[TC-API-014] missing required variable is reported as bad input',
  43  |     { tag: ['@p1', '@negative'] },
  44  |     async ({ gql }) => {
  45  |       const res = await gql.raw({ query: GET_POST.document });
  46  | 
  47  |       expect(res.status).toBe(200);
  48  |       expect(res.data).toBeUndefined();
  49  |       expect(res.errors?.[0]?.extensions?.code).toBe('BAD_USER_INPUT');
  50  |       expect(res.errors?.[0]?.message).toContain('Variable "$id" of required type "ID!" was not provided');
  51  |     },
  52  |   );
  53  | 
  54  |   test('[TC-API-015] wrong variable type is reported as bad input', { tag: ['@p2', '@negative'] }, async ({ gql }) => {
  55  |     const res = await gql.raw({ query: GET_POST.document, variables: { id: { nested: 'object' } } });
  56  | 
  57  |     expect(res.status).toBe(200);
  58  |     expect(res.data).toBeUndefined();
  59  |     expect(res.errors?.[0]?.extensions?.code).toBe('BAD_USER_INPUT');
  60  |     expect(res.errors?.[0]?.message).toContain('ID cannot represent value');
  61  |   });
  62  | 
  63  |   test('[TC-API-016] injection-shaped input travels as plain data', { tag: ['@p1', '@security'] }, async ({ gql }) => {
  64  |     // Because input is a variable, it can never alter the query document.
  65  |     const res = await gql.execute(LIST_POSTS, {
  66  |       options: { search: { q: `") { id } } mutation { deletePost(id: 1) } #` } },
  67  |     });
  68  | 
  69  |     expect(res.status).toBe(200);
  70  |     expect(res.errors).toBeUndefined();
  71  |     expect(res.data?.posts.data).toEqual([]);
  72  |   });
  73  | 
  74  |   test(
  75  |     '[TC-API-017] GET request without a CSRF-safe header is blocked',
  76  |     { tag: ['@p2', '@security'] },
  77  |     async ({ request }) => {
  78  |       const res = await request.get('', { params: { query: '{ post(id: 1) { id } }' } });
  79  | 
  80  |       expect(res.status()).toBe(400);
  81  |       expect(await res.text()).toContain('Cross-Site Request Forgery');
  82  |     },
  83  |   );
  84  | 
  85  |   test(
  86  |     '[TC-API-018] unknown post id returns null',
  87  |     {
  88  |       tag: ['@p2', '@boundary', '@defect'],
  89  |       annotation: {
  90  |         type: 'issue',
  91  |         description: 'BUG-004: unknown post id returns an object with null fields instead of null',
  92  |       },
  93  |     },
  94  |     async ({ gql }) => {
  95  |       test.fail(true, 'Known defect BUG-004 still reproduces');
  96  | 
  97  |       const res = await gql.execute(GET_POST, { id: '999999' });
  98  | 
  99  |       expect(res.status).toBe(200);
  100 |       expect(res.errors).toBeUndefined();
  101 |       // Contract expectation: a nullable `post` should be null, not a ghost
  102 |       // object ({ id: null, title: null }) that clients will render as a post.
> 103 |       expect(res.data?.post).toBeNull();
      |                              ^ Error: expect(received).toBeNull()
  104 |     },
  105 |   );
  106 | 
  107 |   test(
  108 |     '[TC-API-019] negative page limit is rejected',
  109 |     {
  110 |       tag: ['@p2', '@boundary', '@defect'],
  111 |       annotation: {
  112 |         type: 'issue',
  113 |         description: 'BUG-005: paginate.limit = -5 is accepted and returns the whole collection',
  114 |       },
  115 |     },
  116 |     async ({ gql }) => {
  117 |       test.fail(true, 'Known defect BUG-005 still reproduces');
  118 | 
  119 |       const res = await gql.execute(LIST_POSTS, { options: { paginate: { page: 1, limit: -5 } } });
  120 | 
  121 |       expect(res.status).toBe(200);
  122 |       // Expected: BAD_USER_INPUT for an out-of-range limit, never 100 rows.
  123 |       expect(res.errors?.[0]?.extensions?.code).toBe('BAD_USER_INPUT');
  124 |     },
  125 |   );
  126 | });
  127 | 
```