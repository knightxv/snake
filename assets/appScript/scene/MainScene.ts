import BaseScene from './BaseScene';
const {ccclass, property} = cc._decorator;


@ccclass
export default class MainScene extends BaseScene {
    OnLoad() {
        this.Log('进入主大厅');
        this.node.on('endlessGame', (ev) => {
            this.endlessGame();
            ev.stopPropagation();
        });
        this.node.on('timeLimitSingle', (ev) => {
            this.timeLimitSingle();
            ev.stopPropagation();
        });
        this.node.on('timeLimitTeam', (ev) => {
            this.timeLimitTeam();
            ev.stopPropagation();
        });
    }
    endlessGame = () => {
        // 进入无尽模式
        this.Log('无尽模式');
        this.moduleManage.SceneModule.EnterEndLessGame();
    }
    timeLimitSingle() {
        this.Log('单人模式');
        this.moduleManage.SceneModule.EnterTimeLimitSingleGame();
    }
    timeLimitTeam() {
        this.moduleManage.SceneModule.EnterTimeLimitTeamGame();
    }
}
