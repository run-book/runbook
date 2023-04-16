The main goals are:

* Easy to write a new fetcher
* Easy to test a fetcher
* Easy to compose fetchers
* Easy to debug/trace fetchers
    * Easy to answer the question 'why didn't this fetcher run?'
    * Easy to answer the question 'which fetches ran and what did they do?'

# Overview

The fetcher code is very 'functor' in nature. and most of the operations are about F[T].

Example functors include

* NameAnd<T>  This is a classic JSON object with the name of T and a value of T
* ErrorsAnd<T> This is either a T or an error
* Promise<T> In the future this will either be a T or an error. Right now... we don't know
* WhyNotLoadedAnd<State,T> Ok this isn't quite a functor but that's because in Typescript we can't curry types. It is
  really a WhyNotLoadedAnd<T> because the State is fixed
    * This is either a T or a list of reasons that we decided not to load the T
* WhyNotLoadedAndTransforms<State,T> This is a WhyNotLoadedAnd<State,T> with a list of transforms that can be applied to
  the T
    * This either holds a Transform<State,T> or a list of reasons that we decided not to load the T or an error that
      occured when we tried to load it

We hand roll our own monadic tranformers and thus the code in this project reads quite simply (but there is 'type system
hell' in the transforms aka take an asprin before looking at it). The actual code in `fetchers.load.ts` is quite simple: most of the
pain is handled in utils (especially the variable 'map over NameAnd' methods) 





