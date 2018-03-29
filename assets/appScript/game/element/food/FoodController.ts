
const {ccclass, property} = cc._decorator;

enum FoodType {
    normal = 'normal',
    snakeDie = 'snakeDie',
};

@ccclass
export default class FoodController extends cc.Component {
    public Type = FoodType;
    public foodType = FoodType.normal;
    public countToNode: number = 0.5; // 每吃一个食物增加多少的node节点
    public foodScore = 1; // 吃这个食物能加多少分
    public isEated = false; // 是否被吃掉
    public radius = 5;
    onLoad() {
        this.node.group = 'food';
        this.OnLoad();
    }
    OnLoad() {   }
    getWorldPos() {}
    // 当被吃掉的时候(隐藏)
    public onEated() {
        this.isEated = true;
        this.node.active = false;
    }
    public init(...arg) {}
}
