# @Runbook - What it is and whys

## Why do we need one?

There is a lot of waste in processing tickets. In many organisations 'how to fix an issue' is 'in people's heads' rather
than in automation or computer systems.

@Runbook is intended to allow us to slowly automate away the manual processes that we have in place. It should
offer value quickly: just recording service details, basic operations, and giving a few common views (like what
services are up in each environment and what has changed recently)

It should be easy to automate common issues with it

## Why are we using many small packages, a monorepo and Laoban to build

By having many small packages we force ourselves to be wellbehaved: we think about the dependencies and
produce modules that have a single responsibility (or at least a small responsibility). It makes us
think about the interfaces we expose to the rest of the world, and makes it easy to swap in out out
different implementations

Laoban and Yarn are the two tools we use to make it easy to develop in this world

We use a monorepo because we are in the 'explore' phase and it lets us keep everything in one place

## Why typescript

Because it is strongly typed!

## Why CLI first

This is a tool for devops people and for developers. The CLI lets us do things that are very hard to do in guis.
Most importantly it is very easy to 'script up'. So when we develop an instrument, view or remediation it is
immediately available for use in other scripts.

GUis are lovely for exploring data and understanding systems. They are however not very good for automation.
This CLI first should let us get the bet of both worlds

## Why a focus on self service

We hope to use this tool in thousands of customers. We want people to be able to use it without having to
involve ourselves. Support people should be able to download and use it and get value within minutes.

## Why an API/GUI running on the developers box

We want to be able to explore the data and understand the system. GUIs are great for this.
Many of the views and remediations will be using elevated credentials. The kind of credentials that
the support person already has (for example 'access to logs', 'access to the database', 'access to apis directly').
Often their machines are in a controlled network.

By running the API/GUI on the developers box we can use the credentials that the support person already has
and we can use the network that the support person already has. We don't need to worry about how to
get the credentials to the server, or how to get the server into the network.

# Views & instruments

We decided that we would have 'things that get simple info' and 'things that stitch them into views'.

So a simple instrument should get one fact. For example 'what is the status of this service', 'is the server up?',
'what are the tickets in the recent git logs for this sha'. These should be easy to write/test and be very reusable.

The views execute the instruments in a 'situation'. For example 'for these servers, in these environments'. By
decoupling
these two things, we make it easy to create instruments and put them in new views. All the logic about iteration and
'what if the instrument crashes' and 'what if it times out' and 'how stale is the data' can be handled by @Runbook,
leaving the developers free to just stitch things together

## Instruments

### Script instruments

Why do we encourage people to 'shell out' with scripts? Because it is easy to do and we can use their existing tools and
configurations.

For example if we look at git: the developers/support staff probably already have a git configuration to access. They
already have done all the 'secret management'. By using their existing configurations we can let them get value
quickly/deal with all the issues around VPNs and secrets management in the way they are already doing it.

Thus rather than 'using git in from javascript with simple-git', we just shell out and call the command line git. The
same
when we want to get javascript packages from a repository: the developers/support staff can get everything working
from the command line using powerful existing tools and we just stitch them together.

### Javascript instruments

We want to be able to do arbitary complex things with conditional logic. This kind of thing is easy to do with
javascript, and can be complex in scripts. Since everything is self service we want people to be able to make their own
javascriptinstruments. If we make our first javascript instruments in the way we want other people to, we are 'dog
fooding' our extension stories.

The JS instruments are just config files that can be in a git repo, or a local directory. However they need to say
'load this javascript file', and that may reference other javascript files

Directory structure that the js instrument points to

```text
/                Here we have stuff like source code. And a package.json
  /dist.         Here we have the compiled code that we will be using (this means we can have typescript or javascript)
  /node_modules  The normal meaning of node_modules.
```

The JSinstrument specifies the path to the above (which can be a git repo). It also specifies the entry point to the
instrument which must be in the 'main' field of the package.json: basically as normal for a node module.

The JSInstrument needs to implement an interface that looks like this:

```typescript
type JSExecutor = ( args: any ) => Promise<any>
```

The args are the ones specified in the config for the instrument.

## How do we ensure that the javascript  instruments are safe?

I think we will use signed git commits. Not yet of course, but that's the plan

## How do we let the js instruments access other javascript files?

[By means of node_modules and require.](https://nodejs.org/api/modules.html)

The secret is NODE_PATH. This is a list of directories that node will look in when you do a require. So we append
our git repo node_modules to the NODE_PATH and then we can require any of the files in the repo. This is done by the
jsinstrument

## Views

### Why do we have 'conditions' in the views and what are bindings?

We want to be able to iterate over a situation easily. We want to allow the users to self service this iteration.

A condition is just a 'match'. It looks for 'everywhere in the situation that this match can be satisfied'. This is
quite
a natural way of thinking about 'get me my data': you just describe the part of the situation that holds your data.

Example

```javascript
let condition = {
    "{service:service}": {"domain": "{dom}", "port": "{port}"},
}
let situation = {
    "leo:service": {"domain": "www.leo", "port": 8080},
    "npx:service": {"domain": "www.npx", "port": 8080},
    "XXX:service": {"domain": "www.XXX", "port": 8080},
}
```

The condition will match three times giving the following (logical) bindings:

```text
service=leo, domain=www.leo, port=8080
service=npx, domain=www.npx, port=8080
service=XXX, domain=www.XXX, port=8080
```

This makes it really easy to build tables up to show information, or pass the bindings as arguments to instruments. Thus
to
call an instrument like 'ping' on each of the services we can just make a condition like:

```json
 {"{service:service}": {"domain": "{dom}", "port": "{port}"}}
 ```

and then say 'do the instrument'. The instrument will be called three times with the bindings above.

# Ontology

We need structure and reference data. For example we need to know 'is a service part of an environment', 'do we even
have environments', 'what is the relationship between a service, a url and a git repository'. All this kind of logic
varies wildly from organisation to organisation. We need to be able to capture this information in a way that is
machine usable, and allows us to build views and instruments that are reusable.

We use the ontology to capture this information. It is a set of json files that describe the structure of the data

## Mereology

Merelogical relationships are 'part of' relationships. For example 'a service is part of an environment'. We need a
merelogy
as well as inheritance relationships because a service 'is not a' environment but is part of it.

In the mereology we record the information that we know about the relationships between the different parts of the
system.

```json
{
  "mereology": {
    "environment": {
      "children": {
        "service":  {
          "fields": {
            "protocol": {"description": "The protocol that this service will use in this environment"},
            "domain":   {"description": "The domain name for this service in this environment"},
            "port":     {"description": "The port that this service will listen on in this environment"}
          }
        },
        "database": {"name": {"description": "The name of the database in this environment"}}
      }
    },
    "fields":      {
      "gittag": {
        "description": "The tag that will be in each service's git repo for the code that is in this environment"
      }
    }
  },
  "service":   {
    "fields":   {"summary": {"description": "A one line summary of what this service does"}},
    "children": {
      "git": {"url": {"description": "The git repo for this service"}}
    }
  }
}
```

## Reference Data

We need to 'know' things about the system. Like 'what is the domain of this service, what is the port, what is the git
repo'. The
Mereology is effectively the 'type' of data, the reference data is the 'instance' of the data.

## Situation

This is the thing we are asking questions about.

The details of how it will work are not clear yet.

# Configuration

It is critical that

* The configuration is easy to understand
* The configuration is composible:
    * We have global configuration for every user (for example the ping instrument will be probably used by every
      runbook)
    * We have organisation specific configuration that can be shared by all support staff in the organisation
    * We have service specific configuration that can be shared by all support staff for a service
    * We have the users own configuration that they can use to override the above.

Note that credentials are part of configuration. We need to make it REALLY easy and safe for users to give their own
credentials, store them safely. Also to be able to share Non Personal Accounts if a company is set up that way. While
that
might not be best practice, if that's how the company currently works, we don't want to stop them using us.

## Configuration files

We will have a 'search story' and compose the json in the followings

* The current directory or one of its parents with a `.runbook` directory: this allows us to manage multiple projects
  and runbooks
* The users home directory with a `.runbook` directory: this allows us to have global configuration for that machine.
  This is a good place for many users in low security environments to store credentials as it will not be in a git repo
* The runbook global repo

Note that we go to them in order until the configuration says 'stop'. Each configuration can have multiple parents, and
if
it does have a parent we will use those instead of the above path. The moment a configuration defines a parent it
overrides the above.

## Parents

we will have a file called `runbook.config.json` that will have a `parents` field. This will be an array of paths to
other configuration files.

These paths will point to either directory on the current system or a git repo. If a git repo we make a local clone of
it. We will only update those clones when the users tells us to

We may in the future also allow npm packages as those are great for 'permanent high quality' configuration. But git is
much better for the kind of ad hoc self service we are trying to encourage, and is really easy for people to set up
themselves.

# Middleware

## How do we do things like 'call the backend'

We want to be able to do things like 'execute instructions on the back end'. We want this to be debuggable, testable,
very visable.
Options include:

* having a pattern like redux: actions
* doing it adhoc: just call it and when the back end responds add ot to the state
* Using a command pattern in the state. The components add to the state and some middleware picks up the command and
  executes it.

Given my personal focus on 'make it easy to test' and 'let's have it very visual what is going on', I picked the
last approach. The reason it is easy to test is that we have separated 'what we are going to do' from 'the doing of it'.
The middleware can easily be replaced or actually not present (in storybooks for example) and the components
are now just pure functions that take a state and return a new state.

Thus the components are easy to test, and the middleware is easy to test.

Effectively this is like the redux/actions... but we use a part of the state of the remember the actions to be executed.

## Why the signature

```typescript
export interface Middleware<S, Command> {
  optional: Optional<S, Command[]>
  process: ( c: Command[] ) => Promise<TransformCmd<S, any>[]>
}
```
Firstly we need the Promise in there because there will often be calls to the backend and they happen asynchronously...

Secondly we could have done something like `(s: S) => Promise<S>` but then we loose information. If we want to record 
things like 'what we did' for debugging reasons it's difficult to do anything other than say 'you went from this huge state to 
this huge state'. But with the TransformCmds we can say 'this tiny change happened'

Thirdly we process all the commands together because that allows us to have the option of writing more efficient middleware

## What is the work flow around middleware

A typical flow is as possible
* A user event occurs (the run button is pressed)
* The component adds a command to the state
  * In the generic runbook code before the state is updated the middleware is called. 
  * The commands are removed from the state (they never get added to the store)
  * The middle is triggered
  * The state WITHOUT commands is placed in the store
* The middleware does its thing
  * The promise concludes
  * The generic runbook code processes the transform commands 

Thus the middleware only needs to implement this interface, and the components only need to add commands to the state.

# React commands in the store
What do we do when the execution of a command fails? Note that there are multiple commands in the queue in general
and that also they can come from different places. For example some come from a user operation, and others from the 
api added by a promise.

It's pretty clear that we want atomic operations, but we also want to control the granularity of the atomicity.
For example the event might add three actions: Change the selection state, add a command to call an api and change the state. 
those commands added at the same time want to be atomic.

Let's add a composed command. When we execute a composed command it will execute all the commands in the array. This allows
us to leave the granularity to the caller. 





