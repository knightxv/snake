import BaseGameScene from './BaseGameScene';
const {ccclass, property} = cc._decorator;

@ccclass
export default class TimeLimitTeamGame extends BaseGameScene {
    OnLoad() {
        this.Log('限时团队game start');
    }
}
