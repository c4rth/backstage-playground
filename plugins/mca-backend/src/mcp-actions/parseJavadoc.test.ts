import { parseJavadoc } from './parseJavadoc';

describe('parseJavadoc', () => {
  it('extracts Java 8 documentation without navigation or duplicate summaries', () => {
    const result = parseJavadoc(`
      <head><style>unused CSS</style><script>unused script</script></head>
      <div class="topNav">Navigation</div>
      <div class="header"><h2 class="title">Class Example</h2></div>
      <ul class="inheritance"><li>java.lang.Object</li>
        <li><ul class="inheritance"><li>demo.Example</li></ul></li>
      </ul>
      <div class="description"><ul class="blockList"><li class="blockList">
        <pre>public class <span>Example</span>\nextends Object</pre>
        <div class="block"><p>Example &amp; documentation.</p>
          <ul><li>First rule</li><li>Second rule</li></ul>
          <pre>one();\ntwo();</pre>
        </div>
        <dl><dt>Since:</dt><dd>1.0</dd></dl>
      </li></ul></div>
      <div class="summary">
        <table><tr><td>Duplicate method summary</td></tr></table>
        <h3>Methods inherited from class Object</h3><code>wait, <a>notify</a></code>
      </div>
      <div class="details">
        <ul><li><a name="field.detail"></a><h3>Field Detail</h3>
          <ul><li><h4>EMPTY</h4><pre>public static final String EMPTY</pre>
            <div class="block">Empty value.</div></li></ul>
        </li></ul>
        <ul><li><a name="constructor.detail"></a><h3>Constructor Detail</h3>
          <ul><li><h4>Example</h4><pre>public Example()</pre></li></ul>
          <ul><li><h4>Example</h4><pre>public Example(String value)</pre>
            <dl><dt>Parameters:</dt><dd><code>value</code> - input</dd>
              <dt>Throws:</dt><dd>IllegalArgumentException - invalid input</dd></dl>
          </li></ul>
        </li></ul>
        <ul><li><a name="method.detail"></a><h3>Method Detail</h3>
          <ul><li><h4>value</h4><pre>public String value()</pre>
            <div class="block">Returns <code>value</code>.<br>Never null.</div>
            <dl><dt>Returns:</dt><dd>the value</dd><dt>See Also:</dt>
              <dd><a href="other.html">Other</a></dd><dd>Related</dd></dl>
          </li></ul>
        </li></ul>
      </div>`);

    expect(result).toMatchObject({
      title: 'Class Example',
      signature: 'public class Example extends Object',
      inheritance: ['java.lang.Object', 'demo.Example'],
      tags: [{ label: 'Since', values: ['1.0'] }],
      fields: [
        {
          name: 'EMPTY',
          signature: 'public static final String EMPTY',
          description: 'Empty value.',
          tags: [],
        },
      ],
      methods: [
        {
          name: 'value',
          signature: 'public String value()',
          description: 'Returns value.\nNever null.',
          tags: [
            { label: 'Returns', values: ['the value'] },
            { label: 'See Also', values: ['Other', 'Related'] },
          ],
        },
      ],
      inheritedMembers: [
        {
          source: 'Methods inherited from class Object',
          members: ['wait', 'notify'],
        },
      ],
    });
    expect(result.constructors).toHaveLength(2);
    expect(result.constructors[1].tags).toEqual([
      { label: 'Parameters', values: ['value - input'] },
      { label: 'Throws', values: ['IllegalArgumentException - invalid input'] },
    ]);
    expect(result.description).toContain('First rule\n\nSecond rule');
    expect(result.description).toContain('one();\ntwo();');
    expect(JSON.stringify(result)).not.toMatch(
      /Navigation|unused|Duplicate|<[^>]+>|other\.html/,
    );
  });

  it('supports modern Javadoc sections', () => {
    const result = parseJavadoc(`
      <div class="header"><h1 class="title">Interface Example</h1></div>
      <section class="class-description">
        <div class="type-signature">public interface Example</div>
        <div class="block">Example API.</div>
      </section>
      <section class="method-details"><section class="detail">
        <h3>run</h3><div class="member-signature">void run()</div>
        <div class="block">Run the task.</div>
        <dl class="notes"><dt>Throws:</dt><dd>Exception - failure</dd></dl>
      </section></section>`);

    expect(result.signature).toBe('public interface Example');
    expect(result.methods).toEqual([
      {
        name: 'run',
        signature: 'void run()',
        description: 'Run the task.',
        tags: [{ label: 'Throws', values: ['Exception - failure'] }],
      },
    ]);
    expect(result.fields).toEqual([]);
    expect(result.constructors).toEqual([]);
  });

  it.each(['', '<html><body>Not found</body></html>'])(
    'rejects missing or unrecognized documentation',
    html => {
      expect(() => parseJavadoc(html)).toThrow(
        'Invalid Javadoc: class declaration not found',
      );
    },
  );
});
