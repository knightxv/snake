import gameContext from '../gameContext';
import BaseScene from '../../scene/BaseScene';
const {ccclass, property} = cc._decorator;

@ccclass
export default class BaseGameScene extends BaseScene {
    protected gameContext = gameContext;
}
