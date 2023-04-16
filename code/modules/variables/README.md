# Variables

This modules allows us to dereference variables. If the 'marker' is present in a string it will be replaced with
something from the `dictionary

The markers can be <> or ${} or {} or {{}}. More can be added if desired

# Examples strings:

```text
This is a string with a variable ${path[1].to.variable}
This is a string with a variable ${path.to.variable|toLowerCase()}
This is a string with a variable ${path.to.variable|toSnakeCase()}
This is a string with a variable ${path.to.variable|toTitleCase()}
This is a string with a variable ${path.to.variable|default(defaultValue)}
This is a string with a variable ${path.to.variable|default(defaultValue)}
```

There are more complex examples in the tests