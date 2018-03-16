import gameContext from '../gameContext';
import SnakeNode from './SnakeNode';
const {ccclass, property} = cc._decorator;
const partType = gameContext.SnakePart;
@ccclass
export default class SnakeHeadNode extends SnakeNode {
    // 设置目标坐标（缓慢移动过去）
    public partType = partType.head;
    
}
