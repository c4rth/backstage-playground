import {
  createTranslationRef,
  TranslationFunction,
} from '@backstage/frontend-plugin-api';

export const toolkitMetadata = {
  title: 'Dev Tools',
} as const;

export const toolkitTranslationRef = createTranslationRef({
  id: 'plugin.toolkit',
  messages: {
    page: {
      documentTitle: 'Dev Tools',
      tools: 'Tools',
    },
    tools: {
      jwt: {
        name: 'JSON Web Token',
        description: 'Encode and decode JSON Web Tokens',
      },
      base64: {
        name: 'Base64',
        description: 'Encode and decode base64 strings',
      },
      certificate: {
        name: 'Certificate Decoder',
        description: 'Decode PEM certificate',
      },
      jsonata: {
        name: 'JSONata Tester',
        description: 'Test JSONata expressions',
      },
      json: {
        name: 'JSON Formater',
        description: 'Format JSON strings',
      },
      crypto: {
        name: 'Ciphers',
        description: 'Encrypt and decrypt strings',
      },
      cron: {
        name: 'Cron Decoder',
        description: 'Decode cron expressions',
      },
      lorem: {
        name: 'Lorem Ipsum',
        description: 'Generate random text for placeholders',
      },
      string: {
        name: 'String Utilities',
        description: 'Various string manipulation tools',
      },
      categories: {
        encodeDecode: 'Encode/Decode',
        decode: 'Decode',
        generate: 'Generate',
        utilities: 'Utilities',
      },
    },
    buttons: {
      clear: 'Clear',
      clearTooltip: 'Clear the current value',
      copy: 'Copy',
      copyTooltip: 'Copy output to clipboard',
      copySuccess: 'Copied to clipboard!',
      copyError: 'Failed to copy to clipboard!',
      paste: 'Clipboard',
      pasteTooltip: 'Paste input from clipboard',
      sample: 'Sample',
      sampleTooltip: 'Copy sample to input',
    },
    editor: {
      input: 'Input',
      output: 'Output',
      modes: {
        Decode: 'Decode',
        Encode: 'Encode',
        Camel: 'Camel',
        Snake: 'Snake',
        Kebab: 'Kebab',
        Upper: 'Upper',
        Lower: 'Lower',
        Capitalize: 'Capitalize',
      },
    },
    card: {
      error: 'Could not fetch data.',
      noData: 'Unknown error - no data',
    },
    certificate: {
      empty: 'No Certificate data available',
      title: 'Certificate {{number}}',
      fingerprint: 'SHA-256 Fingerprint',
      decodeError: "Couldn't decode certificate: {{detail}}",
      decodedNotPem: 'Decoded base64 does not contain PEM certificate',
      invalidInput: 'Invalid input: not PEM and not base64 of PEM',
      noneFound: 'No certificates found in input',
      parseError: 'Failed to parse certificate',
      fields: {
        commonName: 'Common Name (CN)',
        organization: 'Organization (O)',
        organizationalUnit: 'Organizational Unit (OU)',
        country: 'Country',
        locality: 'Locality',
        province: 'State/Province',
        serialNumber: 'Serial Number',
        domainComponent: 'Domain Component',
        businessCategory: 'Business Category',
        email: 'Email',
      },
    },
    cron: {
      error: 'Error: {{detail}}',
      invalid: 'Invalid cron expression',
    },
    crypto: {
      algorithm: 'Algorithm',
      secretKey: 'Secret key',
      algorithms: {
        aes: 'AES',
        des: 'DES',
        tripledes: 'TripleDES',
        rabbit: 'Rabbit',
        rc4: 'RC4',
        pbestring: 'PBEWithMD5AndDES (jasypt)',
      },
      invalidInput: 'Error while decrypting: Invalid input or secret key',
      encryptError: 'Error while encrypting: {{detail}}',
      decryptError: 'Error while decrypting: {{detail}}',
      shortPayload: 'input is too short or not a valid encrypted payload',
      invalidLength: 'ciphertext length is invalid',
      cannotEncrypt: 'Cannot encrypt{{detail}}',
      cannotDecrypt: 'Cannot decrypt{{detail}}',
    },
    json: {
      empty: 'No JSON data available',
      decodeError: "Couldn't decode JSON: {{detail}}",
    },
    jwt: {
      missingAttribute:
        "Couldn't encode JWT token: missing attribute {{attribute}}",
      signature: 'Signature:',
      verified: '✓ Verified',
      invalid: '✗ Invalid{{detail}}',
      notVerified: 'Signature: Verification not performed',
      empty: 'No JWT data available',
      unknownIssuer: 'Unknown issuer - cannot verify signature',
      unknownError: 'Unknown error',
      decodeError: "Couldn't decode JWT token: {{detail}}",
    },
    lorem: {
      type: 'Fake Data',
      count: 'Count',
      generate: 'Generate',
      clearTooltip: 'Clear output',
      output: 'Output',
      types: {
        address: 'Address',
        bic: 'BIC',
        'catch-phrase': 'Catch phrase',
        'credit-card': 'Credit card',
        cron: 'Cron',
        datetime: 'Datetime',
        domain: 'Domain',
        emoji: 'Emoji',
        hack: 'Hack',
        hex: 'Hex',
        iban: 'IBAN',
        imei: 'IMEI',
        ipv4: 'IPv4',
        ipv6: 'IPv6',
        'job-title': 'Job title',
        line: 'Line',
        mac: 'MAC',
        name: 'Name',
        number: 'Number',
        paragraph: 'Paragraph',
        password: 'Password',
        'product-description': 'Product description',
        'product-name': 'Product name',
        slug: 'Slug',
        string: 'String',
        url: 'URL',
        'user-agent': 'User agent',
        uuid: 'UUID',
        word: 'Word',
      },
    },
    jsonata: {
      noMatch: '** no match **',
      resizeHorizontal: 'Resize horizontal divider',
      resizeVertical: 'Resize vertical divider',
    },
  },
});

export type ToolkitTranslator = TranslationFunction<
  typeof toolkitTranslationRef.T
>;
