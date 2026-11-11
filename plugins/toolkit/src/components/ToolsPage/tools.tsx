import { lazy } from 'react';
import { Tool } from './types';
import { ToolkitTranslator } from '../../translation';

const Base64Encode = lazy(() => import('../Tools/Base64Encode'));
const JwtDecoder = lazy(() => import('../Tools/JwtDecoder'));
const CertificateDecoder = lazy(() => import('../Tools/CertificateDecoder'));
const CronDecoder = lazy(() => import('../Tools/CronDecoder'));
const LoremIpsum = lazy(() => import('../Tools/LoremIpsum'));
const JSONataTester = lazy(() => import('../Tools/jsonata/JSONataTester'));
const StringUtilities = lazy(() => import('../Tools/StringUtilities'));
const CryptoCoder = lazy(() => import('../Tools/CryptoCoder'));
const JsonFormater = lazy(() => import('../Tools/JsonFormater'));

export const getDefaultTools = (t: ToolkitTranslator): Tool[] => [
  {
    id: 'jwt-decoder-encode',
    name: t('tools.jwt.name'),
    component: <JwtDecoder />,
    category: t('tools.categories.encodeDecode'),
    description: t('tools.jwt.description'),
    aliases: ['jwt'],
  },
  {
    id: 'base64-encode',
    name: t('tools.base64.name'),
    component: <Base64Encode />,
    category: t('tools.categories.encodeDecode'),
    description: t('tools.base64.description'),
  },
  {
    id: 'certificate-decoder',
    name: t('tools.certificate.name'),
    component: <CertificateDecoder />,
    category: t('tools.categories.decode'),
    description: t('tools.certificate.description'),
  },
  {
    id: 'jsonata-tester',
    name: t('tools.jsonata.name'),
    component: <JSONataTester />,
    category: t('tools.categories.encodeDecode'),
    description: t('tools.jsonata.description'),
  },
  {
    id: 'json-formater',
    name: t('tools.json.name'),
    component: <JsonFormater />,
    category: t('tools.categories.decode'),
    description: t('tools.json.description'),
  },
  {
    id: 'crypto-coder',
    name: t('tools.crypto.name'),
    component: <CryptoCoder />,
    category: t('tools.categories.encodeDecode'),
    description: t('tools.crypto.description'),
  },
  {
    id: 'cron-decoder',
    name: t('tools.cron.name'),
    component: <CronDecoder />,
    category: t('tools.categories.decode'),
    description: t('tools.cron.description'),
  },
  {
    id: 'lorem-ipsum-generate',
    name: t('tools.lorem.name'),
    component: <LoremIpsum />,
    category: t('tools.categories.generate'),
    description: t('tools.lorem.description'),
  },
  {
    id: 'string-utilities',
    name: t('tools.string.name'),
    component: <StringUtilities />,
    category: t('tools.categories.utilities'),
    description: t('tools.string.description'),
  },
];
