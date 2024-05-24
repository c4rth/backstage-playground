# Sample Code

This page provides some sample code which may be used in your example component.

This code uses TypeScript, and the Markdown code fence to wrap the code.

```typescript
const serviceEntityPage = (
  <EntityLayout>
    <EntityLayout.Route path="/" title="Overview">
      <Grid container spacing={3} alignItems="stretch">
        <Grid item md={6}>
          <EntityAboutCard variant="gridItem" />
        </Grid>
      </Grid>
    </EntityLayout.Route>
    <EntityLayout.Route path="/docs" title="Docs">
      <EntityTechdocsContent />
    </EntityLayout.Route>
  </EntityLayout>
);
```

Here is an example of Python code:

```python
def getUsersInGroup(targetGroup, secure=False):

    if __debug__:
        print('targetGroup=[' + targetGroup + ']')
```


Collapsed:

??? example "Collapsed code"

    ```python
    def getUsersInGroup(targetGroup, secure=False):

        if __debug__:
            print('targetGroup=[' + targetGroup + ']')
    ```

??? quote "Collapsed code"

    ```python
    def getUsersInGroup(targetGroup, secure=False):

        if __debug__:
            print('targetGroup=[' + targetGroup + ']')
    ```

**Title: Hello1**

```java
// Your First Program

class HelloWorld {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}
```

??? code "Title: Hello2"

    ```java
    // Your First Program
    
    class HelloWorld {
        public static void main(String[] args) {
            System.out.println("Hello, World!");
        }
    }
    ```
Bottom