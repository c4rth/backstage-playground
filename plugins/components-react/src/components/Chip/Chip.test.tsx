import { renderToStaticMarkup } from 'react-dom/server';
import { Tooltip, TooltipTrigger } from 'react-aria-components';
import { Chip } from './Chip';

describe('Chip responsive styles', () => {
  it.each([false, true])(
    'connects to tooltip trigger context (clickable: %s)',
    clickable => {
      const container = document.createElement('div');
      container.innerHTML = renderToStaticMarkup(
        <TooltipTrigger defaultOpen>
          <Chip
            label="Chip with tooltip"
            onClick={clickable ? () => {} : undefined}
          />
          <Tooltip>Chip details</Tooltip>
        </TooltipTrigger>,
      );
      const chip = container.firstElementChild as HTMLElement;

      expect(chip.getAttribute('aria-describedby')).toBeTruthy();
      expect(chip.tabIndex).toBe(0);
    },
  );

  it.each(['small', 'medium'] as const)(
    'truncates the %s chip label while retaining its icon',
    size => {
      const container = document.createElement('div');
      container.innerHTML = renderToStaticMarkup(
        <Chip label="A long chip label" icon={<svg />} size={size} />,
      );
      const chip = container.firstElementChild as HTMLElement;
      const icon = chip.children[0] as HTMLElement;
      const label = chip.children[1] as HTMLElement;

      expect(chip.style.flexShrink).toBe('0');
      expect(chip.style.maxWidth).toBe('100%');
      expect(chip.style.height).toBe(size === 'small' ? '24px' : '32px');
      expect(chip.style.borderRadius).toBe(size === 'small' ? '12px' : '16px');
      expect(icon.style.flexShrink).toBe('0');
      expect(icon.hidden).toBe(false);
      expect(icon.style.display).toBe('flex');
      expect(label.style.minWidth).toBe('0');
      expect(label.style.whiteSpace).toBe('nowrap');
      expect(label.style.overflow).toBe('hidden');
      expect(label.style.textOverflow).toBe('ellipsis');
    },
  );

  it('uses the same ellipsis styles for clickable chips', () => {
    const container = document.createElement('div');
    container.innerHTML = renderToStaticMarkup(
      <Chip label="Clickable chip" icon={<svg />} onClick={() => {}} />,
    );
    const chip = container.querySelector('button')!;
    const label = chip.lastElementChild as HTMLElement;

    expect(chip.style.flexShrink).toBe('0');
    expect(chip.style.maxWidth).toBe('100%');
    expect(chip.style.height).toBe('32px');
    expect(label.style.minWidth).toBe('0');
    expect(label.style.whiteSpace).toBe('nowrap');
    expect(label.style.overflow).toBe('hidden');
    expect(label.style.textOverflow).toBe('ellipsis');
    expect(container.querySelector('svg')!.parentElement!.hidden).toBe(false);
  });

  it.each([{ color: 'outlined' }, { variant: 'outlined' }] as const)(
    'uses a translucent accent border for %o',
    props => {
      const markup = renderToStaticMarkup(
        <Chip label="Outlined chip" {...props} />,
      );

      expect(markup).toContain(
        'border:1px solid color-mix(in srgb, var(--bui-accent-bg) 23%, transparent)',
      );
      expect(markup).not.toContain('#0000003b');
    },
  );

  it('preserves explicit style overrides', () => {
    const container = document.createElement('div');
    container.innerHTML = renderToStaticMarkup(
      <Chip label="Custom chip" style={{ maxWidth: 80, flexShrink: 1 }} />,
    );
    const chip = container.firstElementChild as HTMLElement;

    expect(chip.style.maxWidth).toBe('80px');
    expect(chip.style.flexShrink).toBe('1');
  });
});
