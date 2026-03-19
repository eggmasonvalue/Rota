import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as supabaseJs from '@supabase/supabase-js';

// Mock the createClient function
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(),
}));

describe('Supabase Client Initialization', () => {
  let originalEnv: NodeJS.ProcessEnv;
  let originalWindow: typeof window | undefined;

  beforeEach(() => {
    // Save original environment
    originalEnv = process.env;
    originalWindow = global.window;

    // Clear mock calls
    vi.clearAllMocks();

    // Spy on console.warn
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
    if (originalWindow !== undefined) {
      global.window = originalWindow;
    } else {
      delete (global as any).window;
    }

    // Restore mocks
    vi.restoreAllMocks();
  });

  it('should initialize with placeholders and warn in browser when env vars are missing', async () => {
    // Setup environment
    process.env = { ...originalEnv };
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    global.window = {} as any; // Simulate browser environment

    // Reset modules to ensure fresh evaluation
    vi.resetModules();

    // Import the module
    await import('../lib/supabase');

    // Assertions
    expect(console.warn).toHaveBeenCalledWith('Missing Supabase environment variables. Realtime features will not work.');
    expect(supabaseJs.createClient).toHaveBeenCalledWith(
      'https://placeholder.supabase.co',
      'placeholder',
      expect.objectContaining({
        auth: { persistSession: false },
        realtime: { params: { eventsPerSecond: 10 } }
      })
    );
  });

  it('should initialize with placeholders and NOT warn in server when env vars are missing', async () => {
    // Setup environment
    process.env = { ...originalEnv };
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    delete (global as any).window; // Simulate server environment

    // Reset modules to ensure fresh evaluation
    vi.resetModules();

    // Import the module
    await import('../lib/supabase');

    // Assertions
    expect(console.warn).not.toHaveBeenCalled();
    expect(supabaseJs.createClient).toHaveBeenCalledWith(
      'https://placeholder.supabase.co',
      'placeholder',
      expect.any(Object)
    );
  });

  it('should initialize with provided valid env vars and NOT warn', async () => {
    // Setup environment
    process.env = { ...originalEnv };
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://valid-url.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'valid-key';
    global.window = {} as any;

    // Reset modules to ensure fresh evaluation
    vi.resetModules();

    // Import the module
    await import('../lib/supabase');

    // Assertions
    expect(console.warn).not.toHaveBeenCalled();
    expect(supabaseJs.createClient).toHaveBeenCalledWith(
      'https://valid-url.supabase.co',
      'valid-key',
      expect.any(Object)
    );
  });

  it('should use placeholder URL if provided URL does not start with http', async () => {
    // Setup environment
    process.env = { ...originalEnv };
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'invalid-url';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'valid-key';
    global.window = {} as any;

    // Reset modules to ensure fresh evaluation
    vi.resetModules();

    // Import the module
    await import('../lib/supabase');

    // Assertions
    expect(supabaseJs.createClient).toHaveBeenCalledWith(
      'https://placeholder.supabase.co',
      'valid-key',
      expect.any(Object)
    );
  });
});