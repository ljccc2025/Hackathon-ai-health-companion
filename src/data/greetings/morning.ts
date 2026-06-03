import type { ReminderTone } from '../../types/health';

type GreetingEntry = { greeting: string; microAction: string };

const morning: Record<ReminderTone, GreetingEntry[]> = {
  friend: [
    { greeting: '早上好，今天先不用急着变得很自律。', microAction: '要不要先喝两口水，让身体慢慢醒过来？' },
    { greeting: '早安！昨晚睡得好吗？', microAction: '先喝杯温水，身体需要慢慢开机。' },
    { greeting: '早啊，窗户外面今天又是不一样的一天。', microAction: '伸个懒腰再开始，不用那么赶。' },
    { greeting: '早上好！今天不用给自己太大压力。', microAction: '慢慢喝一杯温水，比看手机更重要。' },
    { greeting: '早，先别急着刷手机。', microAction: '坐在床边深呼吸三次再站起来。' },
  ],
  quiet: [
    { greeting: '早上好。', microAction: '喝两口水，让身体慢慢醒。' },
    { greeting: '早安。', microAction: '一杯温水，安静地开始今天。' },
    { greeting: '天亮了。', microAction: '先喝水，再看世界。' },
    { greeting: '早上好。不着急。', microAction: '慢慢起身，慢慢喝水。' },
    { greeting: '早。', microAction: '闭上眼睛，深深吸一口气。' },
  ],
  encouraging: [
    { greeting: '早安！新的一天你已经醒了，这已经是一个胜利。', microAction: '喝两口水，给自己第一个肯定的信号。' },
    { greeting: '早上好！今天不管发生什么，先照顾自己一下。', microAction: '一杯温水就是今天第一个好的决定。' },
    { greeting: '早！你已经准备好面对今天了。', microAction: '先喝口水，你值得这个小小的开始。' },
    { greeting: '早上好！昨天的一切都过去了。', microAction: '今天从一杯温和的水开始，你很棒。' },
    { greeting: '早安！又是可以在日常里照顾自己的一天。', microAction: '喝口水，对自己说一声「我可以」。' },
  ],
  poetic: [
    { greeting: '晨光从窗帘缝隙里漏进来，像在说「可以醒了」。', microAction: '让一杯温水成为你和今天的第一次触碰。' },
    { greeting: '露水还在叶子上没有干，早晨还很新。', microAction: '慢慢喝一杯水，像植物吸收清晨的露珠。' },
    { greeting: '鸟鸣穿过窗户，落在枕边。', microAction: '起身接一杯水，听水流入杯子的声音。' },
    { greeting: '天空正在由深蓝变成浅白，这是属于早起的人的颜色。', microAction: '呼吸一口清晨的空气，再喝一杯温水。' },
    { greeting: '阳光在地板上画了一条金色的路。', microAction: '沿着那条光走过去，给自己倒一杯水。' },
  ],
  companion: [
    { greeting: '早安，我在旁边等你慢慢醒过来。', microAction: '要不要一起喝第一杯水？你喝你的，我数着。' },
    { greeting: '早！今天我也在，像一只窝在枕头上的猫。', microAction: '先喝两口水，然后我们再看看今天要做什么。' },
    { greeting: '天亮了，我轻轻拍了拍你的肩膀。', microAction: '起来喝口水吧，我陪你去厨房。' },
    { greeting: '早啊，我已经帮你数好了：今天从第一口水开始。', microAction: '去吧，拿起杯子，我在旁边。' },
    { greeting: '新的一天，我还在这里陪着你。', microAction: '先喝杯温水，不用急，我等你。' },
  ],
};
export default morning;
