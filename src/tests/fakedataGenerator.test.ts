import { z } from 'zod';
import { FakedataGenerator } from '../generator/fakedataGenerator';
import { GeminiProvider } from '../ai/geminiProvider';

describe('FakedataGenerator', () => {
  const UserSchema = z.object({
    id: z.number(),
    fullName: z.string().min(5),
    email: z.string().email(),
    role: z.enum(['admin', 'editor', 'viewer'])
  });

  it('should generate fake users', async () => {
    const mockProvider = {
      generate: jest.fn().mockResolvedValue([
        { id: 1, fullName: 'Nguyen Van A', email: 'a@example.com', role: 'admin' },
        { id: 2, fullName: 'Tran Thi B', email: 'b@example.com', role: 'editor' }
      ])
    } as any;

    const generator = new FakedataGenerator(mockProvider);
    const users = await generator.generate(UserSchema, 2);

    expect(users).toHaveLength(2);
    users.forEach(user => {
      expect(UserSchema.safeParse(user).success).toBe(true);
    });
    expect(mockProvider.generate).toHaveBeenCalled();
  });
});
