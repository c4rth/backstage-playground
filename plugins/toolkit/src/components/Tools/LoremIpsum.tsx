import { useCallback, useMemo, useState } from 'react';
import { faker } from '@faker-js/faker';
import { ClearValueButton, CopyToClipboardButton } from '../Buttons';
import { RiEditBoxLine } from '@remixicon/react';
import {
  Button,
  Flex,
  Grid,
  Select,
  Option,
  TextAreaField,
} from '@backstage/ui';
import styles from '../styles/customTextAreaField.module.css';

const randomInt = (min: number, max: number) => {
  return Math.floor(Math.random() * max) + min;
};

export const LoremIpsum = () => {
  const [output, setOutput] = useState('');
  const [multiplier, setMultiplier] = useState(1);
  const [fakerType, setFakerType] = useState('line');

  const generate = useCallback(
    (type: string) => {
      let outputs = [];
      switch (type) {
        default:
        case '':
          outputs = [''];
          break;
        case 'line':
          outputs = faker.lorem.lines(multiplier).split('\n');
          break;
        case 'paragraph':
          outputs = faker.lorem.paragraphs(multiplier, '\n').split('\n');
          break;
        case 'slug':
          outputs = faker.lorem.slug(multiplier).split('\n');
          break;
        case 'word':
          outputs = faker.lorem.words(multiplier).split('\n');
          break;
        case 'hack':
          outputs = [...Array(multiplier)].map(faker.hacker.phrase);
          break;
        case 'hex':
          outputs = [...Array(multiplier)].map(() =>
            faker.string.hexadecimal({
              length: randomInt(1, 50),
              casing: 'lower',
            }),
          );
          break;
        case 'datetime':
          outputs = [...Array(multiplier)].map(faker.date.anytime);
          break;
        case 'number':
          outputs = [...Array(multiplier)].map(() =>
            faker.number.int({ min: 1, max: 100000000000000000 }),
          );
          break;
        case 'string':
          outputs = [...Array(multiplier)].map(() =>
            faker.string.sample(randomInt(10, 100)),
          );
          break;
        case 'uuid':
          outputs = [...Array(multiplier)].map(faker.string.uuid);
          break;
        case 'ipv4':
          outputs = [...Array(multiplier)].map(faker.internet.ipv4);
          break;
        case 'ipv6':
          outputs = [...Array(multiplier)].map(faker.internet.ipv6);
          break;
        case 'mac':
          outputs = [...Array(multiplier)].map(faker.internet.mac);
          break;
        case 'domain':
          outputs = [...Array(multiplier)].map(faker.internet.domainName);
          break;
        case 'password':
          outputs = [...Array(multiplier)].map(() =>
            faker.internet.password({
              length: randomInt(10, 100),
              memorable: false,
            }),
          );
          break;
        case 'url':
          outputs = [...Array(multiplier)].map(faker.internet.url);
          break;
        case 'user-agent':
          outputs = [...Array(multiplier)].map(faker.internet.userAgent);
          break;
        case 'imei':
          outputs = [...Array(multiplier)].map(faker.phone.imei);
          break;
        case 'cron':
          outputs = [...Array(multiplier)].map(faker.system.cron);
          break;
        case 'emoji':
          outputs = [...Array(multiplier)].map(faker.internet.emoji);
          break;
        case 'address':
          outputs = [...Array(multiplier)].map(
            () =>
              `${faker.location.streetAddress(
                true,
              )}, ${faker.location.zipCode()} ${faker.location.city()}, ${faker.location.country()}`,
          );
          break;
        case 'product-name':
          outputs = [...Array(multiplier)].map(faker.commerce.productName);
          break;
        case 'product-description':
          outputs = [...Array(multiplier)].map(
            faker.commerce.productDescription,
          );
          break;
        case 'catch-phrase':
          outputs = [...Array(multiplier)].map(faker.company.catchPhrase);
          break;
        case 'bic':
          outputs = [...Array(multiplier)].map(faker.finance.bic);
          break;
        case 'credit-card':
          outputs = [...Array(multiplier)].map(faker.finance.creditCardNumber);
          break;
        case 'iban':
          outputs = [...Array(multiplier)].map(() =>
            faker.finance.iban({ formatted: true }),
          );
          break;
        case 'name':
          outputs = [...Array(multiplier)].map(faker.person.fullName);
          break;
        case 'job-title':
          outputs = [...Array(multiplier)].map(faker.person.jobTitle);
          break;
      }
      setOutput(outputs.join('\n'));
    },
    [multiplier],
  );

  const multipliers: Option[] = useMemo(
    () => [
      { label: '1', id: '1' },
      { label: '5', id: '5' },
      { label: '10', id: '10' },
      { label: '25', id: '25' },
      { label: '50', id: '50' },
      { label: '100', id: '100' },
      { label: '250', id: '250' },
      { label: '500', id: '500' },
      { label: '1000', id: '1000' },
    ],
    [],
  );

  const fakerTypes: Option[] = useMemo(
    () => [
      { label: 'Address', id: 'address' },
      { label: 'BIC', id: 'bic' },
      { label: 'Catch phrase', id: 'catch-phrase' },
      { label: 'Credit card', id: 'credit-card' },
      { label: 'Cron', id: 'cron' },
      { label: 'Datetime', id: 'datetime' },
      { label: 'Domain', id: 'domain' },
      { label: 'Emoji', id: 'emoji' },
      { label: 'Hack', id: 'hack' },
      { label: 'Hex', id: 'hex' },
      { label: 'IBAN', id: 'iban' },
      { label: 'IMEI', id: 'imei' },
      { label: 'IPv4', id: 'ipv4' },
      { label: 'IPv6', id: 'ipv6' },
      { label: 'Job title', id: 'job-title' },
      { label: 'Line', id: 'line' },
      { label: 'MAC', id: 'mac' },
      { label: 'Name', id: 'name' },
      { label: 'Number', id: 'number' },
      { label: 'Paragraph', id: 'paragraph' },
      { label: 'Password', id: 'password' },
      { label: 'Product description', id: 'product-description' },
      { label: 'Product name', id: 'product-name' },
      { label: 'Slug', id: 'slug' },
      { label: 'String', id: 'string' },
      { label: 'URL', id: 'url' },
      { label: 'User agent', id: 'user-agent' },
      { label: 'UUID', id: 'uuid' },
      { label: 'Word', id: 'word' },
    ],
    [],
  );

  return (
    <Flex direction="column" gap="large" style={{ height: '100%' }}>
      <Grid.Item>
        <Grid.Root
          columns="12"
          style={{ marginBottom: 10, marginLeft: 10, alignContent: 'center' }}
        >
          <Grid.Item colSpan="2">
            <Select
              onChange={selected => setFakerType(selected as string)}
              label="Fake Data"
              value={fakerType.toString()}
              options={fakerTypes}
            />
          </Grid.Item>
          <Grid.Item colSpan="1">
            <Select
              onChange={selected =>
                setMultiplier(Number.parseInt(selected as string, 10))
              }
              label="Count"
              value={multiplier.toString()}
              options={multipliers}
            />
          </Grid.Item>
          <Grid.Item
            colSpan="5"
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Button
              iconStart={<RiEditBoxLine />}
              onClick={() => generate(fakerType)}
              size="small"
              variant="tertiary"
            >
              Generate
            </Button>
            <ClearValueButton setValue={setOutput} tooltip="Clear output" />
            <CopyToClipboardButton output={output} />
          </Grid.Item>
        </Grid.Root>
      </Grid.Item>
      <Grid.Item
        style={{
          width: '100%',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <TextAreaField
          className={styles.customTextAreaField}
          aria-label="Output"
          value={output || ''}
        />
      </Grid.Item>
    </Flex>
  );
};

export default LoremIpsum;
