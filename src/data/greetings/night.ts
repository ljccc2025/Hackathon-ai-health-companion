import type { ReminderTone } from '../../types/health';
type GreetingEntry = { greeting: string; microAction: string };
const night: Record<ReminderTone, GreetingEntry[]> = {
  friend: [
    { greeting: '夜深了，你还没睡，是不是还在想事情？', microAction: '先放下手机，把手放在胸口，慢慢呼一口气。' },
    { greeting: '这么晚了，身体需要一点温柔的信号才能放松。', microAction: '试着关掉一个灯，让房间慢慢暗下来。' },
    { greeting: '夜很深了，今天不用把所有事情都做完。', microAction: '躺下来，跟着呼吸慢慢沉下去，明天的事明天再说。' },
    { greeting: '还没睡啊？手机屏幕的光让大脑以为还是白天。', microAction: '放下手机，闭上眼睛听一会儿自己的呼吸。' },
    { greeting: '熬夜的你，是不是又忘了时间？', microAction: '没关系的，现在放下也不算晚。' },
  ],
  quiet: [
    { greeting: '夜深了。', microAction: '放下手机，闭上眼睛。' },
    { greeting: '该睡了。', microAction: '关掉屏幕，躺下来。' },
    { greeting: '夜很深了。', microAction: '听自己的呼吸。' },
    { greeting: '不用再想了。', microAction: '让身体沉进床里。' },
    { greeting: '晚安。', microAction: '明天的事明天再说。' },
  ],
  encouraging: [
    { greeting: '夜深了，但你不需要立刻睡着，放松就好。', microAction: '躺下来，告诉自己「我今天已经够了」。' },
    { greeting: '这么晚了还没睡，没关系，不要责怪自己。', microAction: '关掉手机，闭着眼睛做三次深呼吸。' },
    { greeting: '夜很深了，但你不需要完美地入睡。', microAction: '只要躺着放松，就已经在照顾自己了。' },
    { greeting: '你今天已经面对了很多，现在只需要闭上眼睛。', microAction: '不用睡着，只是躺着，让身体休息。' },
    { greeting: '很晚了，你已经足够努力了。', microAction: '把今天的所有担心放在床头柜上，明天再拿。' },
  ],
  poetic: [
    { greeting: '月亮已经升到了窗口，像一盏不收费的夜灯。', microAction: '把手机翻过去，让月光成为房间里唯一的亮。' },
    { greeting: '星星在很远的地方安静地闪烁，它们已经闪了亿万年。', microAction: '你的今天，在这一刻，也值得安静下来。' },
    { greeting: '夜把所有的声音都吸走了，只剩下你的呼吸。', microAction: '跟着自己的呼吸，慢慢沉进夜的深处。' },
    { greeting: '窗外的虫鸣像夜在轻声念一首催眠曲。', microAction: '闭上眼睛听一会儿，让那些声音把你带进梦里。' },
    { greeting: '夜是一块深蓝色的绒布，轻轻盖在所有东西上面。', microAction: '让它也盖住你，把你裹进温暖的黑暗里。' },
  ],
  companion: [
    { greeting: '这么晚了，我困得眼睛都睁不开了。', microAction: '你也该睡了，我窝在你枕头旁边陪着你。' },
    { greeting: '深夜了，我蜷在你脚边，已经快睡着了。', microAction: '放下手机吧，让我呼噜呼噜的声音陪你入睡。' },
    { greeting: '你还在刷手机，我已经在你旁边睡了一觉了。', microAction: '关掉屏幕吧，今晚的陪伴已经够多了。' },
    { greeting: '夜很深很深了，我轻轻地用爪子碰了碰你的手。', microAction: '该睡了，明天我还要叫你起床呢。' },
    { greeting: '整个城市都睡了，只有你的屏幕还亮着。', microAction: '把手机放下吧，我在黑暗里陪着你。' },
  ],
};
export default night;
