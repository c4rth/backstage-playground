# MCA backend MCP tools

The metadata tool returns compact metadata; definition and basetype tools return
complete parsed content. Successful frontend and REST responses are unchanged;
invalid inputs, missing resources and unavailable dependencies use Backstage
error conventions.

- `get-mca-component`: accepts only `name` and returns complete release and
  package metadata, not a definition, in one response without chunking.
- `get-mca-component-definition`: accepts `name` and optional `refP`, returning
  the complete parsed operation analysis or element fields in `result`.
  `definition` includes the component identifier and resolved `refP`.
  There is no pagination, truncation or JSON chunking.
- `get-mca-basetype`: accepts only `name` and returns complete parsed Javadoc,
  including all sections, members, descriptions and tags, in one response.
  There is no pagination, truncation or JSON chunking.

All three MCA tools have no serialized byte cap. They do not accept `offset`,
`limit` or `contentOffset`, and always return complete
results without pagination, truncation or JSON chunking. Each action documents
its inputs and output fields in its discovery description.

Output schemas enumerate component metadata, definition identity, and every
Javadoc section/member shape. Parsed XML `result` remains an extensible value
because operation and element definitions have component-specific keys; its
complete content, including arrays and falsy values, is preserved.
