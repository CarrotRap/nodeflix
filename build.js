const builder = require('electron-builder');
const Platform = builder.Platform;

builder.build({
    targets: Platform.LINUX.createTarget(),
    config: {
        appId: 'nodeflix',
        productName: 'NodeFlix',
        artifactName: '${productName}.${ext}',
        directories: {
            buildResources: 'build',
            output: 'dist'
        },
        win: {
            target: [
                {
                    target: 'nsis',
                    arch: 'x64'
                }
            ]
        },
        nsis: {
            oneClick: false,
            perMachine: false,
            allowElevation: true,
            allowToChangeInstallationDirectory: true
        },
        mac: {
            target: 'dmg',
            category: 'public.app-category.games'
        },
        linux: {
            target: 'AppImage',
            maintainer: 'Kairrot',
            description: 'NodeFlix',
            category: 'Game'
        },
    }
}).then(() => {
    console.log('Build complete')
})