import { useMemo, useState } from 'react';
import { useTranslationRef } from '@backstage/frontend-plugin-api';
import {
  Button,
  ButtonIcon,
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
  Select,
  Text,
  TextField,
  Tooltip,
  TooltipTrigger,
} from '@backstage/ui';
import { RiDeleteBinLine, RiEditLine, RiFileAddLine } from '@remixicon/react';
import { yaml } from '@codemirror/lang-yaml';
import { EditorView } from '@codemirror/view';
import CodeMirror, { ReactCodeMirrorProps } from '@uiw/react-codemirror';
import { toolkitTranslationRef } from '../../../translation';
import styles from './HelmPlayground.module.css';

type FileAction = { type: 'new' } | { type: 'rename' | 'delete'; path: string };

type Props = {
  files: Readonly<Record<string, string>>;
  onChange: (files: Record<string, string>) => void;
  theme: ReactCodeMirrorProps['theme'];
};

export const ChartFileEditor = ({ files, onChange, theme }: Props) => {
  const { t } = useTranslationRef(toolkitTranslationRef);
  const [selectedFile, setSelectedFile] = useState('templates/deployment.yaml');
  const [action, setAction] = useState<FileAction | null>(null);
  const [filename, setFilename] = useState('');
  const [filenameError, setFilenameError] = useState<string>();
  const yamlExtensions = useMemo(() => [yaml()], []);
  const fileNames = Object.keys(files)
    .filter(name => name === 'Chart.yaml' || name.startsWith('templates/'))
    .sort();
  const activeFile = fileNames.includes(selectedFile)
    ? selectedFile
    : fileNames[0];

  const startAction = (nextAction: FileAction) => {
    setAction(nextAction);
    setFilename(nextAction.type === 'new' ? '' : nextAction.path);
    setFilenameError(undefined);
  };

  const saveFile = () => {
    if (!action) {
      return;
    }
    if (action.type === 'delete') {
      onChange(
        Object.fromEntries(
          Object.entries(files).filter(([name]) => name !== action.path),
        ),
      );
      setSelectedFile('templates/deployment.yaml');
      setAction(null);
      return;
    }
    const inputName = filename.trim();
    const name =
      action.type === 'new' && !inputName.startsWith('templates/')
        ? `templates/${inputName}`
        : inputName;
    if (
      name.length > 256 ||
      /[\\:]/.test(name) ||
      Array.from(name).some(character => character.charCodeAt(0) < 32) ||
      name.split('/').some(part => !part || part === '.' || part === '..')
    ) {
      setFilenameError(t('helm.invalidFilename'));
      return;
    }
    if (name !== 'Chart.yaml' && !name.startsWith('templates/')) {
      setFilenameError(t('helm.chartFilenameRequired'));
      return;
    }
    const otherNames = Object.keys(files).filter(
      existing => action.type !== 'rename' || existing !== action.path,
    );
    if (otherNames.includes(name)) {
      setFilenameError(t('helm.duplicateFilename'));
      return;
    }
    if (
      otherNames.some(
        existing =>
          name.startsWith(`${existing}/`) || existing.startsWith(`${name}/`),
      )
    ) {
      setFilenameError(t('helm.conflictingFilename'));
      return;
    }
    if (action.type === 'new' && Object.keys(files).length >= 100) {
      setFilenameError(t('helm.tooManyFiles'));
      return;
    }
    const nextFiles = Object.fromEntries(
      Object.entries(files).filter(
        ([existing]) => action.type !== 'rename' || existing !== action.path,
      ),
    );
    onChange({
      ...nextFiles,
      [name]: action.type === 'rename' ? files[action.path] : '',
    });
    setSelectedFile(name);
    setAction(null);
  };

  const actionLabel = action
    ? {
        new: t('helm.createFile'),
        rename: t('helm.renameFile'),
        delete: t('helm.deleteFile'),
      }[action.type]
    : '';

  return (
    <section aria-label={t('helm.chart')} className={styles.panel}>
      <div className={styles.fileToolbar}>
        <div className={styles.filePicker} title={activeFile}>
          <Select
            aria-label={t('helm.files')}
            size="small"
            placeholder={t('helm.selectFile')}
            options={fileNames.map(name => ({
              id: name,
              label: name,
            }))}
            selectionMode="single"
            value={activeFile ?? null}
            onChange={key => {
              if (typeof key === 'string') {
                setSelectedFile(key);
              }
            }}
            isDisabled={!fileNames.length}
          />
        </div>
        <TooltipTrigger>
          <ButtonIcon
            size="small"
            variant="secondary"
            aria-label={t('helm.newFile')}
            icon={<RiFileAddLine aria-hidden="true" />}
            onPress={() => startAction({ type: 'new' })}
          />
          <Tooltip placement="bottom">{t('helm.newFile')}</Tooltip>
        </TooltipTrigger>
        <TooltipTrigger>
          <ButtonIcon
            size="small"
            variant="tertiary"
            aria-label={t('helm.rename')}
            icon={<RiEditLine aria-hidden="true" />}
            isDisabled={!activeFile}
            onPress={() => startAction({ type: 'rename', path: activeFile })}
          />
          <Tooltip placement="bottom">{t('helm.rename')}</Tooltip>
        </TooltipTrigger>
        <TooltipTrigger>
          <ButtonIcon
            size="small"
            variant="tertiary"
            aria-label={t('helm.delete')}
            icon={<RiDeleteBinLine aria-hidden="true" />}
            isDisabled={!activeFile}
            onPress={() => startAction({ type: 'delete', path: activeFile })}
          />
          <Tooltip placement="bottom">{t('helm.delete')}</Tooltip>
        </TooltipTrigger>
      </div>
      {!fileNames.length && <Text>{t('helm.emptyChart')}</Text>}
      <div className={styles.editor}>
        <CodeMirror
          key={activeFile}
          value={activeFile ? files[activeFile] : ''}
          onChange={content => {
            if (activeFile) {
              onChange({ ...files, [activeFile]: content });
            }
          }}
          readOnly={!activeFile}
          editable={!!activeFile}
          width="100%"
          height="100%"
          style={{ height: '100%' }}
          theme={theme}
          extensions={[
            ...(activeFile ? yamlExtensions : []),
            EditorView.contentAttributes.of({
              'aria-label': t('helm.fileContent'),
            }),
          ]}
        />
      </div>
      {action && (
        <Dialog isOpen onOpenChange={() => setAction(null)}>
          <DialogHeader>{actionLabel}</DialogHeader>
          <form
            onSubmit={event => {
              event.preventDefault();
              saveFile();
            }}
          >
            <DialogBody>
              {action.type === 'delete' ? (
                <Text>
                  {t('helm.confirmDelete', { filename: action.path })}
                </Text>
              ) : (
                <>
                  <TextField
                    label={t('helm.filename')}
                    description={
                      action.type === 'new'
                        ? t('helm.newFilenameHelp')
                        : t('helm.filenameHelp')
                    }
                    value={filename}
                    onChange={value => {
                      setFilename(value);
                      setFilenameError(undefined);
                    }}
                    isInvalid={!!filenameError}
                    aria-describedby={
                      filenameError ? 'helm-filename-error' : undefined
                    }
                  />
                  {filenameError && (
                    <div id="helm-filename-error" role="alert">
                      <Text>{filenameError}</Text>
                    </div>
                  )}
                </>
              )}
            </DialogBody>
            <DialogFooter>
              <Button variant="secondary" onPress={() => setAction(null)}>
                {t('helm.cancel')}
              </Button>
              <Button type="submit">{actionLabel}</Button>
            </DialogFooter>
          </form>
        </Dialog>
      )}
    </section>
  );
};
