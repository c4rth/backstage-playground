import { lazy } from "react";
import { Tool } from "./types";
import { StringUtilities } from "../Tools/StringUtilities";

const Base64Encode = lazy(() => import('../Tools/Base64Encode'));
const JwtDecoder = lazy(() => import('../Tools/JwtDecoder'));
const CertificateDecoder = lazy(() => import('../Tools/CertificateDecoder'));
const CronDecoder = lazy(() => import('../Tools/CronDecoder'));
const LoremIpsum = lazy(() => import('../Tools/LoremIpsum'));
const JSONataTester = lazy(() => import('../Tools/jsonata/JSONataTester'));

export const defaultTools: Tool[] = [
     {
        id: 'jwt-decoder-encode',
        name: 'JSON Web Token',
        component: <JwtDecoder />,
        category: 'Encode/Decode',
        description: 'Encode and decode JSON Web Tokens',
        aliases: ['jwt'],
    },
    {
        id: 'base64-encode',
        name: 'Base64',
        component: <Base64Encode />,
        category: 'Encode/Decode',
        description: 'Encode and decode base64 strings',
    },
    {
        id: 'certificate-decoder',
        name: 'Certificate Decoder',
        component: <CertificateDecoder />,
        category: 'Decode',
        description: 'Decode PEM certificate',
    },  
    {
        id: 'jsonata-tester',
        name: 'JSONata Tester',
        component: <JSONataTester />,
        category: 'Encode/Decode',
        description: 'Test JSONata expressions',
    },
    {
        id: 'cron-decoder',
        name: 'Cron Decoder',
        component: <CronDecoder />,
        category: 'Decode',
        description: 'Decode cron expressions',
    },
    {
        id: 'lorem-ipsum-generate',
        name: 'Lorem Ipsum',
        component: <LoremIpsum />,
        category: 'Generate',
        description: 'Generate random text for placeholders',
    },
    {
        id: 'string-utilities',
        name: 'String Utilities',
        component: <StringUtilities />,
        category: 'Utilities',
        description: 'Various string manipulation tools',
    },
];