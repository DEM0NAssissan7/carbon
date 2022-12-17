#!/bin/bash
files_root_directory="..";
linker_files=(
    #Initializer
    "init.js"
    #Kernel
    "kernel/core/kernel.js"
    "kernel/extra/tools.js"
    #App manager
    "desktop/app-manager.js"
    #Applications
    "desktop/toolkit.js"
    "applications/system/settings.js"
    "applications/games/sotf.js"
    "applications/development/octane.js"
    "applications/development/gcode.js"
    "applications/experimentation/signal-processing.js"
    "applications/graphics/3d.js"
    "applications/graphics/paint.js"
    "applications/graphics/raycast.js"
    "applications/emulators/physics.js"
    "applications/system/monitor.js"
    "applications/games/cookieclicker.js"
    "applications/utilities/autoclick.js"
    "kernel/interface/tty.js"
    #Machine Code Emulator
    "applications/emulators/vm/vm.js"
    #Desktop
    "desktop/window-manager.js"
    "desktop/shell.js"
)

# The name of the HTML file you want
file_output_name="build/output/graphite-composite.html"
# Title of the website
website_title="Graphite Desktop"
