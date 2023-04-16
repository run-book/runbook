This is a project that supports the matching of conditions in json objects. It is used in the runbook project to match
conditions in the runbook.json file.

# Terminology

* Condition: this is something that we are looking for in the
* Situation: this is the 'json object' that we are looking for the condition in
* Mereology: This is a little knowledge about 'what is a part of what'. For example a wheel is part of a car, but isn't
  a car (so not inheritance)
* Inheritance: This is the 'isa' relation. For example 'leo' is a 'service' and 'prod' is as 'environment'
* ReferenceData: We know a lot about the world that we don't put in the situation. For example we know the domain and
  port of a service in the production environment. This information lives in `referenceData`
* Binding: This is a 'place that the condition is true in the situation'. Often there will be multiple bindings for a
  condition

# How it works

We do a depth first search in the situation. However to avoid creating a huge number of unnecessary objects we use '
continuation passing style' and at the bottom of the tree we carry on with the next branch without returning from the
call.

This has the potential to blow the stack if the condition was horribly complicated, but the vast majority of conditions
are
simple and this goes very fast.

We also separate 'compilation time' from the 'run time' although this is mostly invisible to the caller. All the data
about the condition is resolved 'up front'. So for example if the condition is '{service: service}' then we do the
detection
and parsing of this only once (before the first run). This is a big performance win.

# Optimisations

When we have a condition that is an object we:

* We do as much processing in 'compilation time' (aka before the first run) as possible
* preferentially match the things that aren't variables... because if they succeed they don't create a binding, and if
  they fail they prevent further processing
* Prefer branches with a small number of variables over a large number of variables

# Examples
See the tests






