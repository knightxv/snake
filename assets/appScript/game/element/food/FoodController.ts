
const {ccclass, property} = cc._decorator;

enum FoodType {
    normal = 'normal',
    snakeDie = 'snakeDie',
};

@ccclass
export default class FoodController extends cc.Component {
    public Type = FoodType;
    public countToNode: number = 0.5; // 每吃一个食物增加多少的node节点
    public foodScore = 1; // 吃这个食物能加多少分
    onLoad() {
        this.node.group = 'food';
        this.OnLoad();
    }
    OnLoad() {
        
    }
    // 当被吃掉的时候(隐藏)
    onEated() {
        this.node.active = false;
    }
    public init() {}
}
