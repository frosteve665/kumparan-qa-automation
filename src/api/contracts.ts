import { z } from 'zod';

/**
 * Response contracts. A test asserts the values it cares about; the contract
 * asserts the shape, so a renamed or retyped field fails loudly instead of
 * slipping through as `undefined`.
 */
export const UserContract = z.object({ id: z.string(), name: z.string().min(1), email: z.string().email() });

export const PostContract = z.object({
  id: z.string(),
  title: z.string().min(1),
  body: z.string().min(1),
  user: UserContract,
});

export const PostPageContract = z.object({
  data: z.array(z.object({ id: z.string(), title: z.string() })),
  meta: z.object({ totalCount: z.number().int().nonnegative() }),
});

export const PhotoContract = z.object({ id: z.string(), title: z.string(), url: z.string().url() });

export const GraphQLErrorContract = z.object({
  message: z.string().min(1),
  extensions: z.object({ code: z.string() }).passthrough(),
});
