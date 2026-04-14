import { useEffect, useState } from 'react';
import { DefaultEditor } from '../DefaultEditor';
import { Box } from '@backstage/ui';
import * as asn1js from "asn1js";
import { AttributeTypeAndValue, Certificate } from "pkijs";
import ReactJson from 'react-json-view';


const exampleCertificate =
  `-----BEGIN CERTIFICATE-----
MIICMzCCAZygAwIBAgIJALiPnVsvq8dsMA0GCSqGSIb3DQEBBQUAMFMxCzAJBgNV
BAYTAlVTMQwwCgYDVQQIEwNmb28xDDAKBgNVBAcTA2ZvbzEMMAoGA1UEChMDZm9v
MQwwCgYDVQQLEwNmb28xDDAKBgNVBAMTA2ZvbzAeFw0xMzAzMTkxNTQwMTlaFw0x
ODAzMTgxNTQwMTlaMFMxCzAJBgNVBAYTAlVTMQwwCgYDVQQIEwNmb28xDDAKBgNV
BAcTA2ZvbzEMMAoGA1UEChMDZm9vMQwwCgYDVQQLEwNmb28xDDAKBgNVBAMTA2Zv
bzCBnzANBgkqhkiG9w0BAQEFAAOBjQAwgYkCgYEAzdGfxi9CNbMf1UUcvDQh7MYB
OveIHyc0E0KIbhjK5FkCBU4CiZrbfHagaW7ZEcN0tt3EvpbOMxxc/ZQU2WN/s/wP
xph0pSfsfFsTKM4RhTWD2v4fgk+xZiKd1p0+L4hTtpwnEw0uXRVd0ki6muwV5y/P
+5FHUeldq+pgTcgzuK8CAwEAAaMPMA0wCwYDVR0PBAQDAgLkMA0GCSqGSIb3DQEB
BQUAA4GBAJiDAAtY0mQQeuxWdzLRzXmjvdSuL9GoyT3BF/jSnpxz5/58dba8pWen
v3pj4P3w5DoOso0rzkZy2jEsEitlVM2mLSbQpMM+MUVQCQoiG6W9xuCFuxSrwPIS
pAqEAuV4DNoxQKKWmhVv+J0ptMWD25Pnpxeq5sXzghfJnslJlQND
-----END CERTIFICATE-----
`;

export function parsePemCertificates(input: string): Array<{ cert: Certificate; der: ArrayBuffer }> {
  let pemText = input.trim();

  // Case 1: PEM text directly
  if (pemText.includes("BEGIN CERTIFICATE")) {
    // ok, already PEM
  } else {
    // Case 2: base64 of the PEM string
    try {
      const decoded = atob(pemText);
      if (!decoded.includes("BEGIN CERTIFICATE")) {
        throw new Error("Decoded base64 does not contain PEM certificate");
      }
      pemText = decoded;
    } catch {
      throw new Error("Invalid input: not PEM and not base64 of PEM");
    }
  }

  // Extract all certificates from PEM text
  const certRegex = /-----BEGIN CERTIFICATE-----([\s\S]*?)-----END CERTIFICATE-----/g;
  const matches = Array.from(pemText.matchAll(certRegex));

  if (matches.length === 0) {
    throw new Error("No certificates found in input");
  }

  const results: Array<{ cert: Certificate; der: ArrayBuffer }> = [];

  for (const match of matches) {
    // Extract body from PEM
    const base64Body = match[1].replace(/\s+/g, "");

    // Convert Base64 → DER
    const der = Uint8Array.from(atob(base64Body), c => c.charCodeAt(0));

    // Parse ASN.1
    const asn1 = asn1js.fromBER(der.buffer);
    if (asn1.offset === -1) {
      throw new Error("Failed to parse certificate");
    }

    const cert = new Certificate({ schema: asn1.result });
    results.push({ cert, der: der.buffer });
  }

  return results;
}

const oidMap: Record<string, string> = {
  "2.5.4.3": "Common Name (CN)",
  "2.5.4.10": "Organization (O)",
  "2.5.4.11": "Organizational Unit (OU)",
  "2.5.4.6": "Country",
  "2.5.4.7": "Locality",
  "2.5.4.8": "State/Province",
  "2.5.4.5": "Serial Number",
  "2.5.4.12": "Domain Component",
  "2.5.4.15": "Business Category",
  "1.2.840.113549.1.9.1": "Email",
  "1.3.6.1.4.1.311.60.2.1.3": "Country"
};

function formatName(attrs: AttributeTypeAndValue[]) {
  let names = {};
  attrs.forEach(tv => {
    const name = oidMap[tv.type] || tv.type;
    const value = tv.value.valueBlock.value;
    names = { [name]: value, ...names };
  });
  return names;
}

async function computeFingerprint(certDer: ArrayBuffer, algorithm: "SHA-1" | "SHA-256" = "SHA-256"): Promise<string> {
  const digest = await crypto.subtle.digest(algorithm, certDer);
  const bytes = new Uint8Array(digest);
  return Array.from(bytes).map(b => b.toString(16).padStart(2, "0")).join(":").toUpperCase();
}

export const CertificateDecoder = () => {
  const [input, setInput] = useState('');
  const [info, setInfo] = useState<any>(null);

  const CertificateDecodeOutput = (props: { info?: any }) => {
    return (
      <Box style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {props.info ? (
          <ReactJson
            name={false}
            src={props.info || {}}
            style={{
              border: '1px solid var(--bui-gray-4)',
              boxSizing: 'border-box',
              borderRadius: '4px',
              flex: 1,
              backgroundColor: 'var(--bui-bg-neutral-1)'
            }}
            enableClipboard={true}
          />
        ) : (
           <div
            style={{
              flex: 1,
              overflow: 'auto',
              padding: '8px',
              fontFamily: 'monospace',
              fontSize: '14px',
              border: '1px solid var(--bui-gray-4)',
              borderRadius: '4px',
              backgroundColor: 'var(--bui-bg-neutral-1)',
              color: 'var(--bui-fg-default)',
            }}
          >
            <Box style={{ color: 'var(--bui-fg-muted)' }}><i>No Certificate data available</i></Box>
          </div>
        )}
      </Box>
    );
  };

  useEffect(() => {
    const decodeCertificate = async () => {
      setInfo(undefined);
      if (!input) {
        return;
      }
      try {
        const certificates = parsePemCertificates(input);

        // Process all certificates
        const certInfos = await Promise.all(
          certificates.map(async ({ cert, der }, index) => {
            const sha256 = await computeFingerprint(der, "SHA-256");

            return {
              [`Certificate ${index + 1}`]: {
                subject: formatName(cert.subject.typesAndValues),
                issuer: formatName(cert.issuer.typesAndValues),
                notBefore: cert.notBefore.value.toString(),
                notAfter: cert.notAfter.value.toString(),
                serialNumber: cert.serialNumber.valueBlock.toString(),
                version: cert.version,
                "SHA-256 Fingerprint": sha256,
              }
            };
          })
        );

        // If single certificate, show it directly; otherwise show array
        if (certInfos.length === 1) {
          setInfo(certInfos[0]['Certificate 1']);
        } else {
          setInfo(Object.assign({}, ...certInfos));
        }
      } catch (error) {
        setInfo(
          { message: `Couldn't decode certificate: ${error}` });
      }
    };

    decodeCertificate();
  }, [input]);


  return (
    <DefaultEditor
      input={input}
      mode={"Decode"}
      setInput={setInput}
      sample={
        exampleCertificate
      }
      output={JSON.stringify(info, null, 2)}
      rightContent={
        <CertificateDecodeOutput info={info} />
      }

    />
  );
};

export default CertificateDecoder;
