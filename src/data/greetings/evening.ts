import type { ReminderTone } from '../../types/health';
type GreetingEntry = { greeting: string; microAction: string };
const evening: Record<ReminderTone, GreetingEntry[]> = {
  friend: [
    { greeting: '晚上好，今天一天你辛苦了。', microAction: '吃完饭后可以慢慢走几步，不用急。' },
    { greeting: '天黑了，可以把节奏放慢一点了。', microAction: '喝一小杯温水，别让身体在晚上太干。' },
    { greeting: '晚间好，现在不需要再赶进度了。', microAction: '做一次长长的呼气，把白天的紧绷呼出去。' },
    { greeting: '晚上好！今天过得怎么样？', microAction: '不管怎样，先喝口水，然后慢慢放松。' },
    { greeting: '晚饭吃了吗？胃也需要被照顾。', microAction: '吃完了就走几步，让食物慢慢沉下去。' },
  ],
  quiet: [
    { greeting: '天黑了。', microAction: '可以把灯调暗一点。' },
    { greeting: '晚上好。', microAction: '喝一小杯温水。' },
    { greeting: '夜来了。', microAction: '放慢呼吸。' },
    { greeting: '晚间。安静下来了。', microAction: '关掉一个屏幕。' },
    { greeting: '晚上好。不用再赶了。', microAction: '慢慢呼一口气，越长越好。' },
  ],
  encouraging: [
    { greeting: '晚上好！今天你做得够多了，现在是休息时间。', microAction: '喝杯温水，告诉自己「今天够了」。' },
    { greeting: '晚间好！今天所有的努力都已经被记下来了。', microAction: '现在只需要做一件事：放松下来。' },
    { greeting: '晚上好！不管今天怎样，你都撑过来了。', microAction: '给自己一个温柔的晚上，你值得的。' },
    { greeting: '天黑了，你已经完成了今天的任务。', microAction: '喝口水，把「还要做什么」关在门外。' },
    { greeting: '晚上好！今天你照顾了自己，这已经足够。', microAction: '剩下的时间只属于放松。' },
  ],
  poetic: [
    { greeting: '黄昏把天空染成了橘子和薰衣草的颜色。', microAction: '走到窗前看一眼那片颜色，它只为你停留几分钟。' },
    { greeting: '白天的喧嚣已经沉下去了，空气开始变软。', microAction: '倒一杯温水，用手心感受杯壁的温度。' },
    { greeting: '路灯一盏一盏亮起来，像大地在慢慢睁开眼睛。', microAction: '你也慢慢闭上眼睛，做一个长长的呼气。' },
    { greeting: '晚风把窗帘轻轻吹起来，像一个温柔的提醒。', microAction: '提醒你：现在可以不用再努力了。' },
    { greeting: '夜正在从东边慢慢走过来，带着凉凉的气息。', microAction: '披上一件薄外套，给自己泡一杯温热的东西。' },
  ],
  companion: [
    { greeting: '晚上好！今天你辛苦了，我都看在眼里。', microAction: '来，先喝杯温水，然后我们慢慢放松。' },
    { greeting: '天黑了，我在你旁边窝好了。', microAction: '你也找个舒服的姿势，不用再端着了。' },
    { greeting: '晚上好！今天我一直在旁边陪着你。', microAction: '现在该照顾一下自己了，喝口水吧。' },
    { greeting: '晚餐后是最舒服的时候，我趴在你脚边。', microAction: '走几步消消食，我跟着你。' },
    { greeting: '夜深了，我困了，但你看起来还需要一会儿。', microAction: '没关系，我陪你，先喝口水。' },
  ],
};
export default evening;
