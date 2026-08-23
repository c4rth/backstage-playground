import {
  Base64,
  WordArray,
  Utf8,
  MD5Algo,
  DES,
  CipherParams,
  CBC,
  Pkcs7,
} from 'crypto-es';

export class PBEWithMD5AndDES {
  private static readonly ITERATIONS = 1000;

  /**
   * Encrypts a plain text string using PBEWithMD5AndDES.
   */
  public static encrypt(plainText: string, password: string | null): string {
    if (!password) {
      return plainText;
    }

    try {
      // 1. Generate a random 8-byte salt
      const salt = WordArray.random(8);

      // 2. Derive Key and IV using PKCS#5 v1.5 (PBKDF1 with MD5)
      const { key, iv } = PBEWithMD5AndDES.deriveKeyAndIV(password, salt);

      // 3. Encrypt the plaintext using DES-CBC mode
      const encrypted = DES.encrypt(plainText, key, {
        iv: iv,
        mode: CBC,
        padding: Pkcs7,
      });

      // 4. Combine Salt (8 bytes) + Ciphertext
      // Create a new WordArray with salt words
      const combinedWords = [...salt.words];

      // Append ciphertext words
      const cipherText = encrypted.ciphertext || WordArray.create([], 0);
      combinedWords.push(...cipherText.words);

      // Calculate total size: 8 bytes salt + ciphertext byte length
      const totalBytes = 8 + cipherText.sigBytes;
      const combinedWordArray = WordArray.create(combinedWords, totalBytes);

      // 5. Convert to Base64
      return combinedWordArray.toString(Base64);
    } catch (error) {
      return PBEWithMD5AndDES.formatCryptoError('encrypt', error);
    }
  }

  /**
   * Decrypts a Base64 encoded string encrypted with PBEWithMD5AndDES.
   */
  public static decrypt(
    encryptedText: string,
    password: string | null,
  ): string {
    if (!password) {
      return encryptedText;
    }

    if (!encryptedText?.trim()) {
      return '';
    }

    try {
      // 1. Decode Base64 input
      const fullCipherWordArray = Base64.parse(encryptedText);
      if (fullCipherWordArray.sigBytes <= 8) {
        throw new Error('input is too short or not a valid encrypted payload');
      }

      // 2. Extract salt (first 8 bytes / 2 words)
      const saltWords = fullCipherWordArray.words.slice(0, 2);
      const salt = WordArray.create(saltWords, 8);

      // 3. Extract actual ciphertext (remaining bytes)
      const cipherTextWords = fullCipherWordArray.words.slice(2);
      const cipherTextLength = fullCipherWordArray.sigBytes - 8;
      if (cipherTextLength <= 0 || cipherTextLength % 8 !== 0) {
        throw new Error('ciphertext length is invalid');
      }
      const cipherText = WordArray.create(cipherTextWords, cipherTextLength);

      // 4. Derive Key and IV using PKCS#5 v1.5 (PBKDF1 with MD5)
      const { key, iv } = PBEWithMD5AndDES.deriveKeyAndIV(password, salt);

      // 5. Decrypt using DES-CBC mode
      const cipherParams = CipherParams.create({
        ciphertext: cipherText,
      });

      const decryptedWordArray = DES.decrypt(cipherParams, key, {
        iv: iv,
        mode: CBC,
        padding: Pkcs7,
      });

      // 6. Convert decrypted word array to UTF-8 string
      return decryptedWordArray.toString(Utf8);
    } catch (error) {
      return PBEWithMD5AndDES.formatCryptoError('decrypt', error);
    }
  }

  private static formatCryptoError(
    operation: 'encrypt' | 'decrypt',
    error: unknown,
  ): string {
    const detail =
      error instanceof Error && error.message ? `: ${error.message}` : '';
    return `Cannot ${operation}${detail}`;
  }

  /**
   * Helper method to perform PKCS#5 v1.5 PBKDF1 Key Derivation.
   */
  private static deriveKeyAndIV(
    password: string,
    salt: WordArray,
  ): { key: WordArray; iv: WordArray } {
    const passwordWords = Utf8.parse(password);

    // Iteration 1: MD5(password + salt)
    const md5 = MD5Algo.create();
    md5.update(passwordWords);
    md5.update(salt);
    let hash = md5.finalize();

    // Iterations 2 through 1000: MD5(previous_hash)
    for (let i = 1; i < PBEWithMD5AndDES.ITERATIONS; i++) {
      md5.reset();
      md5.update(hash);
      hash = md5.finalize();
    }

    // Split 16-byte digest: First 8 bytes -> DES Key, Next 8 bytes -> IV
    const key = WordArray.create(hash.words.slice(0, 2), 8);
    const iv = WordArray.create(hash.words.slice(2, 4), 8);

    return { key, iv };
  }
}
