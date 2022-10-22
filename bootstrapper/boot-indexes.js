//This is where you put all of the files you want to load in

{
        let kernel = "kernel/core/kernel.js"
        let graphite = [
            [
            //Kernel
            "kernel/extra/tools.js",
            //App manager
            "desktop/app-manager.js",
            //Applications
            "desktop/toolkit.js",
            "applications/system/settings.js",
            "applications/games/sotf.js",
            "applications/development/octane.js",
            "applications/development/gcode.js",
            "applications/emulators/physics.js",
            "applications/system/monitor.js",
            "applications/games/cookieclicker.js",
            "applications/utilities/autoclick.js",
            "kernel/interface/tty.js",
            //Machine Code Emulator
            "applications/emulators/vm/vm.js",
            //Desktop
            "desktop/window-manager.js",
            "desktop/gui.js",
            ],
            "Graphite Desktop"
        ];
        let graphiteGui2 = [
            [
            //Kernel
            "kernel/extra/tools.js",
            //Applications
            "desktop/toolkit.js",
            "applications/system/settings.js",
            "applications/games/sotf.js",
            "applications/games/cookieclicker.js",
            "applications/utilities/autoclick.js",
            "kernel/interface/tty.js",
            //Desktop
            "desktop/window-manager.js",
            "desktop/app-manager.js",
            "desktop/gui2.js",
            ],
            "Graphite GUI2"
        ];
        let sotfLaunch = [
            [
            //Kernel
            "kernel/extra/tools.js",
            //Applications
            "desktop/toolkit.js",
            "applications/games/sotf.js",
            "kernel/interface/tty.js",
            //Desktop
            "desktop/window-manager.js",
            "desktop/app-manager.js",
            ],
            "Survival of the Fittest"
        ];
        let graphiteCore = [
            [
            //Kernel
            "kernel/extra/tools.js",
            //Stress Tools
            "kernel/extra/stresstest.js",
            //TTY
            "kernel/interface/tty.js",
            ],
            "Graphite Core"
        ];
        let bareKernel = [
            [
            ],
            "Bare Kernel"
        ]
        let virtual_machine = [
            [
            //Applications
            "applications/emulators/vm/vm.js",
            "applications/emulators/vm/test machine.js",
            ],
            "Carbonite VM"
        ];
        let systems = [
            graphite,
            graphiteGui2,
            sotfLaunch,
            virtual_machine,
            graphiteCore,
            bareKernel,
        ]
        init_system(systems, kernel);//Leave this at the end
}