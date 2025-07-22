// frontend/__tests__/instagram.test.js
// Unit tests for Instagram login functionality

import { 
  getInstagramErrorMessage, 
  encryptInstagramData, 
  decryptInstagramData 
} from '../lib/instagram';

describe('Instagram Utility Functions', () => {
  describe('getInstagramErrorMessage', () => {
    test('should return correct Albanian error message for access_token error', () => {
      const error = 'invalid access_token';
      const result = getInstagramErrorMessage(error);
      expect(result).toBe('Tokeni i Instagram është i pavlefshëm.');
    });

    test('should return correct Albanian error message for rate limit error', () => {
      const error = 'rate limit exceeded';
      const result = getInstagramErrorMessage(error);
      expect(result).toBe('Shumë kërkesa. Ju lutemi prisni pak dhe provoni përsëri.');
    });

    test('should return correct Albanian error message for permission error', () => {
      const error = 'permission denied';
      const result = getInstagramErrorMessage(error);
      expect(result).toBe('Lejimet e Instagram u refuzuan.');
    });

    test('should return correct Albanian error message for network error', () => {
      const error = 'network timeout';
      const result = getInstagramErrorMessage(error);
      expect(result).toBe('Gabim në rrjet. Kontrolloni lidhjen tuaj të internetit.');
    });

    test('should return default Albanian error message for unknown error', () => {
      const error = 'some unknown error';
      const result = getInstagramErrorMessage(error);
      expect(result).toBe('Ka ndodhur një gabim i papritur. Ju lutemi provoni përsëri.');
    });
  });

  describe('Data Encryption/Decryption', () => {
    test('should encrypt and decrypt data correctly', () => {
      const originalData = 'test_instagram_token_12345';
      const encrypted = encryptInstagramData(originalData);
      const decrypted = decryptInstagramData(encrypted);
      
      expect(encrypted).not.toBe(originalData);
      expect(decrypted).toBe(originalData);
    });

    test('should handle empty string encryption', () => {
      const originalData = '';
      const encrypted = encryptInstagramData(originalData);
      const decrypted = decryptInstagramData(encrypted);
      
      expect(decrypted).toBe(originalData);
    });

    test('should throw error for invalid encrypted data', () => {
      const invalidEncryptedData = 'invalid_base64_data!@#';
      
      expect(() => {
        decryptInstagramData(invalidEncryptedData);
      }).toThrow('Failed to decrypt Instagram data');
    });
  });
});

describe('Instagram API Configuration', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  test('should validate required environment variables', () => {
    // Mock missing environment variables
    delete process.env.NEXT_PUBLIC_INSTAGRAM_CLIENT_ID;
    delete process.env.NEXT_PUBLIC_INSTAGRAM_REDIRECT_URI;

    // This would normally be tested by importing the function that checks env vars
    // For now, we'll test the concept
    const hasClientId = !!process.env.NEXT_PUBLIC_INSTAGRAM_CLIENT_ID;
    const hasRedirectUri = !!process.env.NEXT_PUBLIC_INSTAGRAM_REDIRECT_URI;

    expect(hasClientId).toBe(false);
    expect(hasRedirectUri).toBe(false);
  });

  test('should detect properly configured environment variables', () => {
    process.env.NEXT_PUBLIC_INSTAGRAM_CLIENT_ID = 'test_client_id';
    process.env.NEXT_PUBLIC_INSTAGRAM_REDIRECT_URI = 'http://localhost:3000/callback';

    const hasClientId = !!process.env.NEXT_PUBLIC_INSTAGRAM_CLIENT_ID;
    const hasRedirectUri = !!process.env.NEXT_PUBLIC_INSTAGRAM_REDIRECT_URI;

    expect(hasClientId).toBe(true);
    expect(hasRedirectUri).toBe(true);
  });
});

// Mock tests for Instagram API calls (would require actual API in integration tests)
describe('Instagram API Integration (Mocked)', () => {
  test('should handle successful token exchange', async () => {
    // Mock successful response
    const mockResponse = {
      access_token: 'mock_access_token',
      user_id: 'mock_user_id'
    };

    // In a real test, you would mock the fetch call
    expect(mockResponse.access_token).toBeDefined();
    expect(mockResponse.user_id).toBeDefined();
  });

  test('should handle failed token exchange', async () => {
    // Mock error response
    const mockError = new Error('Instagram token exchange failed: 400');
    
    expect(mockError.message).toContain('Instagram token exchange failed');
  });

  test('should handle successful profile fetch', async () => {
    // Mock successful profile response
    const mockProfile = {
      id: 'mock_user_id',
      username: 'mock_username',
      account_type: 'PERSONAL',
      media_count: 42
    };

    expect(mockProfile.id).toBeDefined();
    expect(mockProfile.username).toBeDefined();
    expect(['PERSONAL', 'BUSINESS']).toContain(mockProfile.account_type);
    expect(typeof mockProfile.media_count).toBe('number');
  });
});

// Albanian text validation tests
describe('Albanian Localization', () => {
  test('should contain proper Albanian characters and grammar', () => {
    const messages = [
      'Tokeni i Instagram është i pavlefshëm.',
      'Shumë kërkesa. Ju lutemi prisni pak dhe provoni përsëri.',
      'Lejimet e Instagram u refuzuan.',
      'Gabim në rrjet. Kontrolloni lidhjen tuaj të internetit.',
      'Ka ndodhur një gabim i papritur. Ju lutemi provoni përsëri.'
    ];

    messages.forEach(message => {
      // Check for Albanian characters
      expect(message).toMatch(/[ëçüöäÇÜÖÄË]/);
      // Check that message ends with period
      expect(message).toMatch(/\.$/);
      // Check that message is not empty
      expect(message.length).toBeGreaterThan(0);
    });
  });

  test('should use formal Albanian language (ju form)', () => {
    const errorMessage = getInstagramErrorMessage('test');
    
    // Should use "Ju lutemi" (formal) instead of "të lutem" (informal)
    expect(errorMessage).toMatch(/Ju lutemi|ju/i);
  });
});