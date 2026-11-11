import { ButtonIcon, Link } from '@backstage/ui';
import { RiCloseLargeLine } from '@remixicon/react';
import {
  Heading,
  Sheet,
  SheetBackdrop,
  SheetContent,
  SheetOverlay,
} from 'react-aria-components';
import styles from './HealthDetailsSheet.module.css';
import { useTranslationRef } from '@backstage/frontend-plugin-api';
import { healthDashboardTranslationRef } from '../../translation';

export type HealthDetailsField = {
  label: string;
  value: unknown;
};

export type HealthDetailsSection = {
  id: string;
  fields: HealthDetailsField[];
};

export type HealthDetailsSelection = {
  title: string;
  subtitle?: string;
  sections: HealthDetailsSection[];
};

type HealthDetailsSheetProps = {
  selection: HealthDetailsSelection | null;
  onClose: () => void;
};

function formatValue(value: unknown): { text: string; isJson: boolean } {
  if (value === null || value === undefined || value === '') {
    return { text: '-', isJson: false };
  }
  if (typeof value === 'string') {
    try {
      return {
        text: JSON.stringify(JSON.parse(value), null, 2),
        isJson: true,
      };
    } catch {
      return { text: value, isJson: false };
    }
  }
  if (typeof value === 'object') {
    return {
      text: JSON.stringify(value, null, 2),
      isJson: true,
    };
  }
  return { text: String(value), isJson: false };
}

function getUrlHref(label: string, value: unknown): string | undefined {
  if (typeof value !== 'string' || !value.trim()) {
    return undefined;
  }

  const text = value.trim();
  const isUrlField = label.toLowerCase().includes('url');
  let href: string | undefined;
  if (/^https?:\/\//i.test(text)) {
    href = text;
  } else if (isUrlField) {
    href = `https://${text}`;
  }

  if (!href) {
    return undefined;
  }

  try {
    const url = new URL(href);
    return url.protocol === 'http:' || url.protocol === 'https:'
      ? href
      : undefined;
  } catch {
    return undefined;
  }
}

function renderValue(label: string, value: unknown) {
  const href = getUrlHref(label, value);
  const formatted = formatValue(value);

  if (href) {
    return (
      <Link href={href} target="_blank" rel="noopener noreferrer" color="info">
        {formatted.text}
      </Link>
    );
  }

  return formatted.isJson ? (
    <pre className={styles.formattedJson}>{formatted.text}</pre>
  ) : (
    formatted.text
  );
}

export const HealthDetailsSheet = ({
  selection,
  onClose,
}: HealthDetailsSheetProps) => {
  const { t } = useTranslationRef(healthDashboardTranslationRef);
  return (
  <SheetOverlay
    isOpen={selection !== null}
    onOpenChange={isOpen => {
      if (!isOpen) {
        onClose();
      }
    }}
    position="right"
    className={styles.overlay}
  >
    <SheetBackdrop className={styles.backdrop} />
    <Sheet className={styles.sheet}>
      <SheetContent
        className={styles.content}
        aria-labelledby="health-details-title"
      >
        {selection && (
          <>
            <header className={styles.header}>
              <div>
                <Heading
                  id="health-details-title"
                  level={2}
                  className={styles.title}
                >
                  {selection.title}
                </Heading>
                {selection.subtitle && (
                  <p className={styles.subtitle}>{selection.subtitle}</p>
                )}
              </div>
              <ButtonIcon
                icon={<RiCloseLargeLine />}
                aria-label={t('healthDetails.close')}
                onClick={onClose}
              />
            </header>
            {selection.sections.map(section => (
              <section className={styles.section} key={section.id}>
                <table className={styles.details}>
                  <tbody>
                    {section.fields.map(({ label, value }) => (
                      <tr className={styles.detail} key={label}>
                        <th scope="row">{label}</th>
                        <td>{renderValue(label, value)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>
            ))}
          </>
        )}
      </SheetContent>
    </Sheet>
  </SheetOverlay>
  );
};
