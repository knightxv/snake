import BaseGameScene from './BaseGameScene';
const {ccclass, property} = cc._decorator;

@ccclass
export default class TimeLimitSingleGame extends BaseGameScene {
    OnLoad() {
        this.Log('单人限时game start');
    }
}
