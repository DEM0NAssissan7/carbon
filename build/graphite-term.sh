#!/bin/bash
files_root_directory="..";
linker_files=(
    #Kernel
    "kernel/core/kernel.js"
    "kernel/extra/tools.js"
    #Application Toolkit
    "desktop/toolkit.js"
    #Applications
    "applications/system/settings.js"
    "applications/games/sotf.js"
    "applications/games/cookieclicker.js"
    "applications/utilities/autoclick.js"
    "kernel/interface/tty.js"
    #Desktop
    "desktop/window-manager.js"
    "desktop/app-manager.js"
    "desktop/gui.js"
)

# The name of the HTML file you want
file_output_name="build/output/graphite-term.html"
# Title of the website
website_title="Graphite Terminal"