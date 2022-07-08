
# Code Philosophy
* Optimize the living hell out of the code
* Stability is a priority
* Keep code-base relatively small
* Divide things into nice and digestible parts
* Descriptive but readable names for variables/objects/functions
* Only -stable- git pushes
***
# To do for 1.0 Release

## High Priority
- [x] Make `errorScreen` programmable
- [ ] Convert everything to classes
- [x] Change project name to `carbon`
- [ ] Let `maximize` be toggleable
- [ ] Live `windowWidth`/`windowHeight` resizing
- [x] Allow bootstrapper to be able to choose between different systems (jskernel core, JsOS shell, etc.) and make it easy for devs to add a system to the menu.

## Low priority
- [ ] Make `stress()` use a list format that executes each stresstest in a for loop from an array.
- [x] Create settings app
- [ ] Make kshell use a variable called `applications[]` for the dock so that new apps can be added while the system is live
- [ ] Rename Window to something else (to not conflict with the actual javascript Window function)
  - [ ] Finish **Raycast** (canceled)

## Design changes
- [ ] Enable live reload
- [x] Figure out a name for the project (Carbon)

## Problems (without current solution)
  - Scheduler currently under-executes processes and does not properly account for the load of realtime processes.
  - Windows will spontaneously and constantly switch between other when being clicked and overlapping each other.
  - Kernel will stop executing when the computer is suspended and awakened

## Long term
- [ ] Get rid of `p5.js`
- [ ] Optimize scheduler to perfection.
- [ ] Create JShell `jsh` (as an adaptation/clone of sh) to interface with the system in a Unix-like command line
- [ ] Finish **Survival of the Fittest**
- [ ] Finish **Horizon**
