// Simple test to verify Jest is working
describe('Simple Test Suite', () => {
  it('should pass a basic test', () => {
    expect(1 + 1).toBe(2);
  });

  it('should handle basic math', () => {
    expect(5 * 3).toBe(15);
  });

  it('should work with strings', () => {
    expect('hello' + ' world').toBe('hello world');
  });
});
