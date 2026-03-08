import { useCallback, useMemo, useState } from 'react';
import { faker } from '@faker-js/faker';
import { ClearValueButton, CopyToClipboardButton } from '../Buttons';
import { TextField, TextArea } from 'react-aria-components';
import { SelectItem, Select, } from '@backstage/core-components';
import { RiEditBoxLine } from '@remixicon/react';
import { Button, Flex, Grid } from '@backstage/ui';

const randomInt = (min: number, max: number) => {
    return Math.floor(Math.random() * max) + min;
};

export const LoremIpsum = () => {
    const [output, setOutput] = useState('');
    const [multiplier, setMultiplier] = useState(1);
    const [fakerType, setFakerType] = useState('line');

    const generate = useCallback((type: string) => {
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
                outputs = [...Array(multiplier)].map(faker.commerce.productDescription);
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
    }, [multiplier]);

    const multipliers: SelectItem[] = useMemo(
        () => [
            { label: '1', value: '1' },
            { label: '5', value: '5' },
            { label: '10', value: '10' },
            { label: '25', value: '25' },
            { label: '50', value: '50' },
            { label: '100', value: '100' },
            { label: '250', value: '250' },
            { label: '500', value: '500' },
            { label: '1000', value: '1000' },
        ],
        [],
    );

    const fakerTypes: SelectItem[] = useMemo(
        () =>
            [
                { label: 'Address', value: 'address' },
                { label: 'BIC', value: 'bic' },
                { label: 'Catch phrase', value: 'catch-phrase' },
                { label: 'Credit card', value: 'credit-card' },
                { label: 'Cron', value: 'cron' },
                { label: 'Datetime', value: 'datetime' },
                { label: 'Domain', value: 'domain' },
                { label: 'Emoji', value: 'emoji' },
                { label: 'Hack', value: 'hack' },
                { label: 'Hex', value: 'hex' },
                { label: 'IBAN', value: 'iban' },
                { label: 'IMEI', value: 'imei' },
                { label: 'IPv4', value: 'ipv4' },
                { label: 'IPv6', value: 'ipv6' },
                { label: 'Job title', value: 'job-title' },
                { label: 'Line', value: 'line' },
                { label: 'MAC', value: 'mac' },
                { label: 'Name', value: 'name' },
                { label: 'Number', value: 'number' },
                { label: 'Paragraph', value: 'paragraph' },
                { label: 'Password', value: 'password' },
                { label: 'Product description', value: 'product-description' },
                { label: 'Product name', value: 'product-name' },
                { label: 'Slug', value: 'slug' },
                { label: 'String', value: 'string' },
                { label: 'URL', value: 'url' },
                { label: 'User agent', value: 'user-agent' },
                { label: 'UUID', value: 'uuid' },
                { label: 'Word', value: 'word' },
            ],
        [],
    );

    return (
        <Flex direction="column" gap="large" style={{ height: '100%' }}>
            <Grid.Item>
                <Grid.Root columns='12' style={{ marginBottom: 10, alignContent: 'center' }}>
                    <Grid.Item colSpan='2'>
                        <Select
                            onChange={selected => setFakerType(selected as string)}
                            label="Fake Data"
                            selected={fakerType.toString()}
                            items={fakerTypes}
                        />
                    </Grid.Item>
                    <Grid.Item colSpan='1'>
                        <Select
                            onChange={selected => setMultiplier(Number.parseInt(selected as string, 10))}
                            label="Count"
                            selected={multiplier.toString()}
                            items={multipliers}
                        />
                    </Grid.Item>
                    <Grid.Item colSpan='5' style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Button
                            iconStart={<RiEditBoxLine />}
                            onClick={() => generate(fakerType)}
                            size='medium'
                            variant="tertiary"
                            style={{
                                paddingLeft: '16px',
                                paddingRight: '16px',
                                borderColor: 'textVerySubtle',
                                borderRadius: '4px !important',
                            }}
                        >
                            Generate
                        </Button>
                        <ClearValueButton setValue={setOutput} tooltip="Clear output" />
                        <CopyToClipboardButton output={output} />
                    </Grid.Item>
                </Grid.Root>
            </Grid.Item>
            <Grid.Item style={{ width: '100%', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <TextField style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }} aria-label='Output'>
                    <TextArea
                        value={output || ''}
                        style={{
                            width: '100%',
                            flex: 1,
                            padding: '8px',
                            fontFamily: 'monospace',
                            fontSize: '14px',
                            border: '1px solid var(--md-sys-color-outline, #ccc)',
                            borderRadius: '4px',
                            backgroundColor: 'var(--md-sys-color-surface, #fff)',
                            color: 'var(--md-sys-color-on-surface, #000)',
                            resize: 'none',
                        }}
                    />
                </TextField>
            </Grid.Item>
        </Flex>
    );
};

export default LoremIpsum;