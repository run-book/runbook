Instruments are the most basic unit of execution in @runbook. This project allows us to execute 
a single instrument and view the results.

# Workflow

The 'run' button 
* Adds a fetch command to the state which will send a post to the server
* The result of the fetch command is sent to a known location in the state
  * This is passed into the component by currying so later if we have multiple instrument we can control this
* Note that the result won't be affected by this immediatly
  * The 'show result' is focused on two things
    * The result of the fetch command which is the map of id to param hash
    * The data that is fetched from the back end separately which is keyed by the param hash
  * So when either of these change the result will be updated
