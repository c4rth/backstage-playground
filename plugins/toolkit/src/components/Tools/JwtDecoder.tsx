import { useCallback, useEffect, useState } from 'react';
import { jwtDecode, JwtPayload } from 'jwt-decode';
import { DefaultEditor } from '../DefaultEditor';
import { SignJWT, createRemoteJWKSet, jwtVerify } from 'jose';
import { alertApiRef, useApi } from '@backstage/core-plugin-api';
import { TextField } from '@material-ui/core';
import ReactJson from 'react-json-view'
import { Box } from '@backstage/ui';

const BASE64_REGEX =
  /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;

export const JwtDecoder = () => {
  const alertApi = useApi(alertApiRef);
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [jwt, setJwt] = useState<any | undefined>(undefined);
  const [mode, setMode] = useState('Decode');
  const [signatureVerified, setSignatureVerified] = useState<boolean | null>(null);
  const [verificationError, setVerificationError] = useState<string>('');

  const exampleJwt =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1MTYyMzkwMjJ9.4Adcj3UFYzPUVaVF43FmMab6RlaQD8A9V8wFzzht-KQ';
  const exampleJSON = {
    header: {
      alg: 'HS256',
      typ: 'JWT',
    },
    payload: {
      sub: 1234567890,
      iat: 1516239022,
      iss: 'John Doe',
      exp: 1516239022,
    },
    key: 'exampleSecretKey',
  };

  const showError = useCallback(
    (attribute: string) => {
      const errorMessage = `Couldn't encode JWT token: missing attribute ${attribute}`;
      setOutput(errorMessage);
      alertApi.post({
        message: errorMessage,
        severity: 'error',
        display: 'transient',
      });
      return false;
    },
    [alertApi],
  );

  const keyExists = useCallback(
    (json: any) => {
      if (!('key' in json)) {
        return showError('key');
      }
      return true;
    },
    [showError],
  );

  const payloadExists = useCallback(
    (json: any) => {
      if (!('payload' in json)) {
        return showError('payload');
      }
      if (!('iat' in json.payload)) {
        return showError('payload.iat');
      }
      if (!('iss' in json.payload)) {
        return showError('payload.iss');
      }
      if (!('exp' in json.payload)) {
        return showError('payload.exp');
      }
      return true;
    },
    [showError],
  );

  const headerExists = useCallback(
    (json: any) => {
      if (!('header' in json)) {
        return showError('header');
      }
      if (!('alg' in json.header)) {
        return showError('header.alg');
      }
      return true;
    },
    [showError],
  );


  const JwtDecodeOutput = (props: { jwt?: any; signatureVerified?: boolean | null; verificationError?: string }) => {
    return (
      <Box style={{ width: '100%', height: '99%' }}>
        <legend>Decoded JWT</legend>
        {props.jwt ? (
          <>
            {props.signatureVerified !== null && (
              <Box mb='2' p='1' style={{ 
                backgroundColor: props.signatureVerified ? '#4caf50' : '#f44336', 
                color: 'white',
                borderRadius: '4px',
                textAlign: 'center'
              }}>
                Signature: {props.signatureVerified ? '✓ Verified' : `✗ Invalid${props.verificationError ? ` - ${props.verificationError}` : ''}`}
              </Box>
            )}
            {props.signatureVerified === null && (
              <Box mb='2' p='1' style={{ 
                backgroundColor: '#2196f3', 
                color: 'white',
                borderRadius: '4px',
                textAlign: 'center'
              }}>
                Signature: Verification not performed
              </Box>
            )}
            <ReactJson name={false} src={props.jwt || {}} />
          </>
        ) : (
          <Box>No JWT data available</Box>
        )}
      </Box>
    );
  };

  useEffect(() => {
    setJwt(undefined);
    setSignatureVerified(null);
    setVerificationError('');
    if (!input) {
      setOutput('');
      return;
    }
    if (mode === 'Decode') {
      let value = input;
      if (value) {
        if (BASE64_REGEX.test(value)) {
          value = atob(value);
        }

        try {
          const jwtPayload = jwtDecode<JwtPayload>(value);
          const jwtHeader = jwtDecode(value, { header: true });
          setJwt({ header: jwtHeader, payload: jwtPayload });

          // Verify signature using Azure AD public keys
          (async () => {
            try {
              // Determine the Azure AD JWKS endpoint based on the issuer
              const issuer = jwtPayload.iss;
              let jwksUri = '';
              
              if (issuer?.includes('login.microsoftonline.com')) {
                // Azure AD v2.0
                const tenantId = issuer.split('/')[3];
                jwksUri = `https://login.microsoftonline.com/${tenantId}/discovery/v2.0/keys`;
              } else if (issuer?.includes('sts.windows.net')) {
                // Azure AD v1.0
                const tenantId = issuer.split('/')[3];
                jwksUri = `https://login.microsoftonline.com/${tenantId}/discovery/keys?appid=00000000-0000-0000-0000-000000000000`;
              } else {
                setVerificationError('Unknown issuer - cannot verify signature');
                return;
              }

              const JWKS = createRemoteJWKSet(new URL(jwksUri));
              // Verify signature only, skip all claim validations (exp, nbf, iat, etc.)
              await jwtVerify(value, JWKS, {
                clockTolerance: Infinity, // Ignore all time-based checks
              });
              setSignatureVerified(true);
            } catch (error) {
              setSignatureVerified(false);
              const errorMessage = error instanceof Error ? error.message : 'Unknown error';
              setVerificationError(errorMessage);
            }
          })();
        } catch (error) {
          setOutput(`Couldn't decode JWT token: ${error}`);
        }
      } else {
        setOutput('');
      }
    } else {
      try {
        const inputJSON = JSON.parse(input);
        if (
          keyExists(inputJSON) &&
          payloadExists(inputJSON) &&
          headerExists(inputJSON)
        ) {
          const secret = new TextEncoder().encode(inputJSON.key);
          (async () => {
            const token = await new SignJWT(inputJSON.payload)
              .setProtectedHeader(inputJSON.header)
              .setIssuedAt(inputJSON.payload.iat)
              .setIssuer(inputJSON.payload.iss)
              .setExpirationTime(inputJSON.payload.exp)
              .sign(secret);
            setOutput(token);
          })();
        }

        if (!('header' in inputJSON)) {
          const errorMessage = `Couldn't encode JWT token: missing attribute 'header'`;
          setOutput(errorMessage);
        }
      } catch (error) {
        setOutput(`Couldn't encode JWT token: ${error}`);
      }
    }
  }, [input, mode, headerExists, keyExists, payloadExists]);


  return (
    <DefaultEditor
      input={input}
      mode={mode}
      setInput={setInput}
      setMode={setMode}
      modes={['Decode', 'Encode']}
      sample={
        mode === 'Encode' ? JSON.stringify(exampleJSON, null, 4) : exampleJwt
      }
      output={output}
      rightContent={mode === 'Decode' ?
        <JwtDecodeOutput jwt={jwt} signatureVerified={signatureVerified} verificationError={verificationError} />
        : <TextField
          id="output"
          label='Output'
          value={output || ''}
          style={{ width: '100%' }}
          multiline
          minRows={20}
          variant="outlined"
        />
      }

    />
  );
};

export default JwtDecoder;
