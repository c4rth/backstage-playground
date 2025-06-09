import { lazy } from "react";
import { Tool } from "./types";

const Base64Encode = lazy(() => import('../Tools/Base64Encode'));
const JwtDecoder = lazy(() => import('../Tools/JwtDecoder'));
const LoremIpsum = lazy(() => import('../Tools/LoremIpsum'));

export const defaultTools: Tool[] = [
    {
        id: 'base64-encode',
        name: 'Base64',
        component: <Base64Encode />,
        category: 'Encode/Decode',
        description: 'Encode and decode base64 strings',
    }, {
        id: 'jwt-decoder-encode',
        name: 'JSON Web Token',
        component: <JwtDecoder />,
        category: 'Encode/Decode',
        description: 'Encode and decode JSON Web Tokens',
        aliases: ['jwt'],
    },
    {
        id: 'lorem-ipsum-generate',
        name: 'Lorem Ipsum',
        component: <LoremIpsum />,
        category: 'Generate',
        description: 'Generate random text for placeholders',
    },
];