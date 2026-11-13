import { Dialog, DialogBody, DialogHeader, Link } from '@backstage/ui';
import { HealthStatusIndicator } from './HealthStatusIndicator';
import styles from './HealthDetailsSheet.module.css';

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

  if (
    ['downstreamStatus', 'functionalStatus', 'technicalStatus'].includes(
      label,
    ) &&
    typeof value === 'string'
  ) {
    return (
      <span className={styles.statusValue}>
        <HealthStatusIndicator status={value} />
        {formatted.text}
      </span>
    );
  }

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
  return (
    <Dialog
      isOpen={selection !== null}
      onOpenChange={isOpen => {
        if (!isOpen) {
          onClose();
        }
      }}
      width="min(60rem, 90vw)"
      height="100%"
      className={styles.modal}
      data-health-details-overlay
    >
      {selection && (
        <>
          <DialogHeader>{selection.title}</DialogHeader>
          <DialogBody>
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
          </DialogBody>
        </>
      )}
    </Dialog>
  );
};
