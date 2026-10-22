import * as cheerio from 'cheerio';

type DocumentationTag = {
  label: string;
  values: string[];
};

type JavadocMember = {
  name: string;
  signature: string;
  description: string;
  tags: DocumentationTag[];
};

export function parseJavadoc(html: string) {
  const $ = cheerio.load(html);
  $(
    'script, style, noscript, nav, .topNav, .subNav, .bottomNav, .skipNav',
  ).remove();

  // Keep word and paragraph boundaries when removing presentation markup.
  $('br').replaceWith('\n');
  $('p, div, ul, ol, li, pre').each((_index, element) => {
    $(element).prepend('\n').append('\n');
  });

  const text = (element: ReturnType<typeof $>) =>
    element
      .text()
      .replace(/[^\S\n]+/g, ' ')
      .replace(/ *\n */g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  const inline = (element: ReturnType<typeof $>) =>
    text(element).replace(/\s+/g, ' ');

  function tags(element: ReturnType<typeof $>): DocumentationTag[] {
    return element
      .children('dl')
      .children('dt')
      .toArray()
      .map(term => ({
        label: inline($(term)).replace(/:$/, ''),
        values: $(term)
          .nextUntil('dt', 'dd')
          .toArray()
          .map(value => text($(value)))
          .filter(Boolean),
      }));
  }

  const description = $('.description .blockList')
    .filter((_index, element) => $(element).children('pre').length > 0)
    .first()
    .add($('.class-description').first())
    .first();
  const signature = inline(
    description.children('pre, .type-signature').first(),
  );
  if (!signature) {
    throw new Error('Invalid Javadoc: class declaration not found');
  }

  function members(kind: string): JavadocMember[] {
    // Java 8 groups members below named anchors; newer Javadoc uses sections.
    const legacy = $(`a[name="${kind}.detail"]`).parent();
    const modern = $(`.${kind}-details`);
    return legacy
      .find('h4')
      .add(modern.find('.detail > h3'))
      .toArray()
      .map(heading => {
        const member = $(heading).parent();
        return {
          name: inline($(heading)),
          signature: inline(member.children('pre, .member-signature').first()),
          description: text(member.children('.block, .deprecation-block')),
          tags: tags(member),
        };
      });
  }

  return {
    title: inline($('.header .title').first()),
    signature,
    description: text(description.children('.block, .deprecation-block')),
    inheritance: $('ul.inheritance li, div.inheritance')
      .toArray()
      .map(element => {
        const node = $(element).clone();
        node.children('ul, div').remove();
        return inline(node);
      })
      .filter(Boolean),
    tags: tags(description),
    fields: members('field'),
    constructors: members('constructor'),
    methods: members('method'),
    inheritedMembers: $('.summary h3, .summary h4')
      .toArray()
      .filter(heading => /inherited from/.test(inline($(heading))))
      .map(heading => ({
        source: inline($(heading)),
        members: inline($(heading).next('code')).split(/,\s*/).filter(Boolean),
      })),
  };
}
