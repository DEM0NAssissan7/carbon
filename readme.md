# Code Philosophy
* Optimize the living hell out of the code
* Keep code-base relatively small
* Divide things into nice and digestible parts
* Descriptive but readable names for variables/objects/functions
* Only -stable- git pushes
***
# To do for 1.0 Release

## High Priority
[x] Make `errorScreen` programmable
[-] Convert everything to classes
[x] Change project name to `carbon`
[ ] Let `maximize` be toggleable
[c] Live `windowWidth`/`windowHeight` resizing
[x] Allow bootstrapper to be able to choose between different systems (jskernel core, JsOS shell, etc.) and make it easy for devs to add a system to the menu.
[x] get_transition currently uses the static value of "15" to determine animation speed. We need to change that.
[c] Multi-user support

## Low priority
[c] Make `stress()` use a list format that executes each stresstest in a for loop from an array.
[x] Create settings app
[x] Make kshell use a variable called `applications[]` for the dock so that new apps can be added while the system is live
[x] Rename Window to something else (to not conflict with the actual javascript Window function)
[c] Finish **Raycast** (need to rebuild it)

## Design changes

## Problems (without current solution)
- Windows will spontaneously and constantly switch between other when being clicked and overlapping each other.

## Long term
* Optimize scheduler to perfection.
[ ] Create JsFS to create a pseudo filesystem tree. (Make the system unix-like with /dev, /proc, /home, etc)
[ ] Create JShell `jsh` (as an adaptation/clone of sh) to interface with the system in a Unix-like command line
[-] Finish **Survival of the Fittest** (Add boss, online multiplayer, more stability)
[ ] Finish **Horizon**
[ ] New desktop environment (pencil) and toolkit (ptk)