#Mereology

A mereology is a 'part of' relationship that can be used to help reasoning.

For example a service is a part of an environment, but an environment isn't a part of a service and this relationship
isn't inheritance because a service isn't an environment.

# Why do we need this?

This helps a lot with our reasoning. It helps enormously (under the hood) with getting information out of the
ReferenceData.

For example if we have a situation

```json
{
  "leo":  {},
  "prod": {}
}
```

In the ontology (inheritance) we know that leo is a service and prod is a environment. In the reference data we
know things about leo (it's git url). BUT there is a lot of data about leo only in the environment. For example the
domain, port, which database is used etc.

In order to allow the reference data and the binding logic to work together we needed to know that leo is part of prod.