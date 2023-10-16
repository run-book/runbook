# Install

`npm i -g @runbook/azurejms`

# Usage
* Make a file 'jmx.json'
* Run `azurejms`

It can be painful to configure JMS metrics for Azure Application Insights.

For example suppose you are using JBOSS, you have 5 data sources and want to monitor 10 metrics on each. That would be
50 metrics to configure.

We simplify this with a templating story:

```json
{
  "template": {
    "your normal azure applications insight": "json goes here"
  },
  "jmx": {
    "db": {
      "nameFormat": "some name format that includes {name}. The {name} is replaced by the name of the datasource. Can also use {env.name} and if you really want the {attribute} ",
      "names": ["a", "list", "of", "datasource", "names"],
      "attributes": ["the attributes you want to monitor"]
    }
  }
}
```

# Customising the name

When using these in azure it can be nice to use dashboards. Unfortuantely in dashboards the legend of the line is the
name and there is limited space. It has been found helpful to be able to give these JMX custom 'azure names'

```json
{
  "template": {
    "your normal azure applications insight": "json goes here"
  },
  "jmx": {
    "db": {
      "azureNameFormat": "{attribute} for {name} which is a {type}",
      "nameFormat": "some name format that includes {name}. The {name} is replaced by the name of the datasource. Can also use {env.name} and if you really want the {attribute} ",
      "names": ["a", "list", "of", "datasource", "names"],
      "attributes": ["the attributes you want to monitor"]
    }
  }
}
```
If not specified the azureNameFormat is 'jmx {type} {name} {attribute}'


# Secrets
The template can use `${env.xxx}` to retrieve a value from the environment. This is useful for connection string and other
potentially sensitive data. 

 
