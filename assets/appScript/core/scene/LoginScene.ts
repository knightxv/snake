import BaseScene from './BaseScene';
const {ccclass, property} = cc._decorator;

@ccclass
export default class LoginScene extends BaseScene {
    needModules(ModuleDef): string[] {
        const { AudioModule } = ModuleDef;
        return [AudioModule];
    }
    OnLoad() {
        // this.moduleManage.AudioModule.playBg();
        this.node.once(cc.Node.EventType.TOUCH_END, () => {
            this.showLoading();
            this.scheduleOnce(() => {
                this.hideLoading();
                this.moduleManage.SceneModule.EnterMain();
            }, 1);
        });
    }
}
