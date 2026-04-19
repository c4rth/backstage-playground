import { AppRegistryEndpoint } from '../types';

export function dummyEmptyCall(): AppRegistryEndpoint[] {
  const data = `[]`;
  return JSON.parse(data) as AppRegistryEndpoint[];
}

export function dummyCall(): AppRegistryEndpoint[] {
  const data = `
        [
    {
        "id": "31d125ac-a229-43d0-a30d-c62ec24acd6f",
        "endpointType": null,
        "path": "/api/echo/{message}",
        "realPath": "/api/echo/{message}",
        "method": "GET",
        "bFunction": "B18090",
        "operationId": "processEchoRequest",
        "cobolName": null,
        "policies": [
            {
                "type": "ACCESS_CHECK",
                "active": true,
                "userCreate": null,
                "userModif": null,
                "lastUpdateTime": 1728568033.209000000,
                "pdpMapping": [],
                "pipMapping": [],
                "clientPrincipals": null
            }
        ]
    },
    {
        "id": "5ca0d16a-e698-43df-894e-2e7d28c7ebdb",
        "endpointType": null,
        "path": "/api/status",
        "realPath": "/api/status",
        "method": "GET",
        "bFunction": "B18091",
        "operationId": "processStatusRequest",
        "cobolName": null,
        "policies": [
            {
                "type": "ACCESS_CHECK",
                "active": true,
                "userCreate": null,
                "userModif": null,
                "lastUpdateTime": 1728568033.209000000,
                "pdpMapping": [],
                "pipMapping": [],
                "clientPrincipals": null
            }
        ]
    },
    {
        "id": "a22dc006-35b9-48b1-95e6-16262de3cd1a",
        "endpointType": null,
        "path": "/api/card-clear-pin-code",
        "realPath": "/api/card-clear-pin-code",
        "method": "POST",
        "bFunction": "B18082",
        "operationId": "processDecryptPinRequest",
        "cobolName": null,
        "policies": [
            {
                "type": "ACCESS_CHECK",
                "active": true,
                "userCreate": null,
                "userModif": null,
                "lastUpdateTime": 1728568033.209000000,
                "pdpMapping": [],
                "pipMapping": [],
                "clientPrincipals": null
            }
        ]
    },
    {
        "id": "0b38f7c9-e6c6-48a8-965c-085cc8a75e6b",
        "endpointType": null,
        "path": "/api/generate-mac",
        "realPath": "/api/generate-mac",
        "method": "POST",
        "bFunction": "B17762",
        "operationId": "processGenerateMacRequest",
        "cobolName": null,
        "policies": [
            {
                "type": "ACCESS_CHECK",
                "active": true,
                "userCreate": null,
                "userModif": null,
                "lastUpdateTime": 1728568033.209000000,
                "pdpMapping": [],
                "pipMapping": [],
                "clientPrincipals": null
            }
        ]
    },
    {
        "id": "bda5a818-abfb-4d60-82fc-39f964d28a5d",
        "endpointType": null,
        "path": "/api/validate-bapof",
        "realPath": "/api/validate-bapof",
        "method": "POST",
        "bFunction": "B18089",
        "operationId": "processValidateBapof",
        "cobolName": null,
        "policies": [
            {
                "type": "ACCESS_CHECK",
                "active": true,
                "userCreate": null,
                "userModif": null,
                "lastUpdateTime": 1728568033.209000000,
                "pdpMapping": [],
                "pipMapping": [],
                "clientPrincipals": null
            }
        ]
    },
    {
        "id": "737a4838-e793-4d80-bb0c-9a6b8f9bf1de",
        "endpointType": null,
        "path": "/api/rsa-generate-signature",
        "realPath": "/api/rsa-generate-signature",
        "method": "POST",
        "bFunction": "B18085",
        "operationId": "processRsaSignatureRequest",
        "cobolName": null,
        "policies": [
            {
                "type": "ACCESS_CHECK",
                "active": true,
                "userCreate": null,
                "userModif": null,
                "lastUpdateTime": 1731080529.856000000,
                "pdpMapping": [],
                "pipMapping": [],
                "clientPrincipals": null
            }
        ]
    },
    {
        "id": "f6a0faa3-f346-4a54-a880-79e86183e46d",
        "endpointType": null,
        "path": "/api/aes-encrypt",
        "realPath": "/api/aes-encrypt",
        "method": "POST",
        "bFunction": "B18086",
        "operationId": "aesEncryptService",
        "cobolName": null,
        "policies": [
            {
                "type": "ACCESS_CHECK",
                "active": true,
                "userCreate": null,
                "userModif": null,
                "lastUpdateTime": 1733838661.568000000,
                "pdpMapping": [],
                "pipMapping": [],
                "clientPrincipals": null
            }
        ]
    },
    {
        "id": "45b87c1b-b1b4-439f-b2b5-ab44353834fe",
        "endpointType": null,
        "path": "/api/aes-decrypt",
        "realPath": "/api/aes-decrypt",
        "method": "POST",
        "bFunction": "B18087",
        "operationId": "aesDecryptService",
        "cobolName": null,
        "policies": [
            {
                "type": "ACCESS_CHECK",
                "active": true,
                "userCreate": null,
                "userModif": null,
                "lastUpdateTime": 1737120039.423000000,
                "pdpMapping": [],
                "pipMapping": [],
                "clientPrincipals": null
            }
        ]
    },
    {
        "id": "f94078de-5f6d-48c7-9298-58597d0b5fbc",
        "endpointType": null,
        "path": "/api/pin-code-exchange",
        "realPath": "/api/pin-code-exchange",
        "method": "POST",
        "bFunction": "B18167",
        "operationId": "processMobileCardPinCodeExchangeRequest",
        "cobolName": null,
        "policies": []
    },
    {
        "id": "18326111-9b6b-4d30-82c8-78592ed46646",
        "endpointType": null,
        "path": "/api/aes-encrypt-cards",
        "realPath": "/api/aes-encrypt-cards",
        "method": "POST",
        "bFunction": "B18083",
        "operationId": "aesEncryptCards",
        "cobolName": null,
        "policies": [
            {
                "type": "ACCESS_CHECK",
                "active": true,
                "userCreate": null,
                "userModif": null,
                "lastUpdateTime": 1738155279.946000000,
                "pdpMapping": [],
                "pipMapping": [],
                "clientPrincipals": null
            }
        ]
    },
    {
        "id": "717f410a-35c8-4783-81bc-fd27e058916c",
        "endpointType": null,
        "path": "/api/aes-cbc-encrypt",
        "realPath": "/api/aes-cbc-encrypt",
        "method": "POST",
        "bFunction": "B18307",
        "operationId": "aesCbcEncryptService",
        "cobolName": null,
        "policies": [
            {
                "type": "ACCESS_CHECK",
                "active": true,
                "userCreate": null,
                "userModif": null,
                "lastUpdateTime": 1742369751.709000000,
                "pdpMapping": [],
                "pipMapping": [],
                "clientPrincipals": null
            }
        ]
    },
    {
        "id": "2163479f-a234-4630-8148-fdf635c4965f",
        "endpointType": null,
        "path": "/api/generate-hmac",
        "realPath": "/api/generate-hmac",
        "method": "POST",
        "bFunction": "B18169",
        "operationId": "processGenerateHmacRequest",
        "cobolName": null,
        "policies": [
            {
                "type": "ACCESS_CHECK",
                "active": true,
                "userCreate": null,
                "userModif": null,
                "lastUpdateTime": 1742369751.709000000,
                "pdpMapping": [],
                "pipMapping": [],
                "clientPrincipals": null
            }
        ]
    },
    {
        "id": "6b9ca4e4-0d0b-45cd-ae4e-4b79c351e1a7",
        "endpointType": null,
        "path": "/api/aes-cbc-decrypt",
        "realPath": "/api/aes-cbc-decrypt",
        "method": "POST",
        "bFunction": "B18308",
        "operationId": "aesCbcDecryptService",
        "cobolName": null,
        "policies": [
            {
                "type": "ACCESS_CHECK",
                "active": true,
                "userCreate": null,
                "userModif": null,
                "lastUpdateTime": 1742984448.152000000,
                "pdpMapping": [],
                "pipMapping": [],
                "clientPrincipals": null
            }
        ]
    },
    {
        "id": "f472064e-e65d-4751-89e5-65b6e651e6c3",
        "endpointType": null,
        "path": "/api/rsa-decrypt",
        "realPath": "/api/rsa-decrypt",
        "method": "POST",
        "bFunction": "B18170",
        "operationId": "processRsaDecryptRequest",
        "cobolName": null,
        "policies": [
            {
                "type": "ACCESS_CHECK",
                "active": true,
                "userCreate": null,
                "userModif": null,
                "lastUpdateTime": 1743515587.358000000,
                "pdpMapping": [],
                "pipMapping": [],
                "clientPrincipals": null
            }
        ]
    },
    {
        "id": "415cea2c-b188-4987-af00-5cd24c825abf",
        "endpointType": null,
        "path": "/api/ecc-generate-signature",
        "realPath": "/api/ecc-generate-signature",
        "method": "POST",
        "bFunction": "B18371",
        "operationId": "generateEccSignature",
        "cobolName": null,
        "policies": [
            {
                "type": "ACCESS_CHECK",
                "active": true,
                "userCreate": null,
                "userModif": null,
                "lastUpdateTime": 1747128373.391000000,
                "pdpMapping": [],
                "pipMapping": [],
                "clientPrincipals": null
            }
        ]
    },
    {
        "id": "c6f6a8a6-f029-4ca3-96e7-49d07e25f1c7",
        "endpointType": null,
        "path": "/api/card-reader-validate-signature",
        "realPath": "/api/card-reader-validate-signature",
        "method": "POST",
        "bFunction": "B18374",
        "operationId": "cardReaderValidateSignature",
        "cobolName": null,
        "policies": [
            {
                "type": "ACCESS_CHECK",
                "active": true,
                "userCreate": null,
                "userModif": null,
                "lastUpdateTime": 1748952055.050000000,
                "pdpMapping": [],
                "pipMapping": [],
                "clientPrincipals": null
            }
        ]
    },
    {
        "id": "8b81e2a1-6e84-4387-af19-129ef9c11924",
        "endpointType": null,
        "path": "/api/card-reader-decimalization",
        "realPath": "/api/card-reader-decimalization",
        "method": "POST",
        "bFunction": "B18373",
        "operationId": "cardReaderDataDecimalization",
        "cobolName": null,
        "policies": [
            {
                "type": "ACCESS_CHECK",
                "active": true,
                "userCreate": null,
                "userModif": null,
                "lastUpdateTime": 1750254408.986000000,
                "pdpMapping": [],
                "pipMapping": [],
                "clientPrincipals": null
            }
        ]
    },
    {
        "id": "47bbcc36-0a7d-4a29-bd2f-81ed9596aef7",
        "endpointType": null,
        "path": "/api/otp-encrypt",
        "realPath": "/api/otp-encrypt",
        "method": "POST",
        "bFunction": "B18480",
        "operationId": "otpEncrypt",
        "cobolName": null,
        "policies": [
            {
                "type": "ACCESS_CHECK",
                "active": true,
                "userCreate": null,
                "userModif": null,
                "lastUpdateTime": 1755591262.766000000,
                "pdpMapping": [],
                "pipMapping": [],
                "clientPrincipals": null
            }
        ]
    },
    {
        "id": "b72438c7-6f3d-4df3-bf7e-e98d777c2479",
        "endpointType": null,
        "path": "/api/cvc-code-check",
        "realPath": "/api/cvc-code-check",
        "method": "POST",
        "bFunction": "B18084",
        "operationId": "checkCardVerificationCode",
        "cobolName": null,
        "policies": [
            {
                "type": "ACCESS_CHECK",
                "active": true,
                "userCreate": null,
                "userModif": null,
                "lastUpdateTime": 1758204663.233000000,
                "pdpMapping": [],
                "pipMapping": [],
                "clientPrincipals": null
            }
        ]
    },
    {
        "id": "5ecf7d17-7f2c-466b-9599-ab4dfd4181fc",
        "endpointType": null,
        "path": "/api/validate-atm-pin-code",
        "realPath": "/api/validate-atm-pin-code",
        "method": "POST",
        "bFunction": "B18372",
        "operationId": "processValidateAtmPinCode",
        "cobolName": null,
        "policies": [
            {
                "type": "ACCESS_CHECK",
                "active": true,
                "userCreate": null,
                "userModif": null,
                "lastUpdateTime": 1758866437.018000000,
                "pdpMapping": [],
                "pipMapping": [],
                "clientPrincipals": null
            }
        ]
    },
    {
        "id": "fad5c7fe-3172-486e-acc2-7731f221e9d6",
        "endpointType": null,
        "path": "/api/wero-keys-generate",
        "realPath": "/api/wero-keys-generate",
        "method": "POST",
        "bFunction": "B18481",
        "operationId": "generateWeroKeys",
        "cobolName": null,
        "policies": [
            {
                "type": "ACCESS_CHECK",
                "active": true,
                "userCreate": null,
                "userModif": null,
                "lastUpdateTime": 1762413630.897000000,
                "pdpMapping": [],
                "pipMapping": [],
                "clientPrincipals": []
            }
        ]
    }
]        `;
  return JSON.parse(data) as AppRegistryEndpoint[];
}
