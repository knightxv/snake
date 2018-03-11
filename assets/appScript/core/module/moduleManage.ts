import BaseModuleManage from '../../../baseScript/module/BaseModuleManage';
import ClientManage from '../module/business/ClientManage';
import LoginModule from '../module/business/LoginModule';
import SceneModule from '../module/service/SceneModule';
import ToolService from './service/ToolService';
import AudioModule from '../module/service/AudioModule';

enum ModuleDef {
    LoginModule = 'LoginModule',
    SceneModule = 'SceneModule',
    ToolService = 'ToolService',
    AudioModule = 'AudioModule',
};

class ModuleManage extends BaseModuleManage {
    public ModuleDef = ModuleDef;
    LoginModule: LoginModule;
    ClientManage: ClientManage;
    SceneModule: SceneModule;
    ToolService: ToolService;
    AudioModule: AudioModule;
    // 共有的模块(默认会初始化)
    public commonModules: ModuleDef[] = [
        ModuleDef.SceneModule,
        ModuleDef.ToolService,
    ];
    // 初始化模块
    constructor() {
        super();
        this.createModules(this.commonModules);
    }
}

export default new ModuleManage();

// export default (() => {
//     let manageInstance: ModuleManage | null = null;
//     return () : ModuleManage => {
//         if (!manageInstance) {
//             manageInstance = new ModuleManage();
//         }
//         return manageInstance;
//     };
// })();
