import type { ReminderTone } from '../../types/health';
type GreetingEntry = { greeting: string; microAction: string };
const noon: Record<ReminderTone, GreetingEntry[]> = {
  friend: [
    { greeting: '中午好，已经过去半天了，你已经很努力了。', microAction: '站起来离开椅子，让眼睛休息两分钟。' },
    { greeting: '午安，肚子应该已经开始叫了。', microAction: '好好吃一顿午饭，别在屏幕前对付过去。' },
    { greeting: '中午了！上午辛苦啦。', microAction: '去吃点好吃的，这是你应得的。' },
    { greeting: '午好，半天过去了，对自己好一点。', microAction: '离开工位，认真吃顿饭。' },
    { greeting: '午餐时间到！别再看屏幕了。', microAction: '走去食堂或者厨房，路上的几步也算休息。' },
  ],
  quiet: [
    { greeting: '中午了。', microAction: '离开椅子，去吃饭。' },
    { greeting: '午安。', microAction: '好好吃饭，不看手机。' },
    { greeting: '半天过去了。', microAction: '喝口水，吃口饭。' },
    { greeting: '中午。安静地吃一顿饭。', microAction: '把屏幕关掉，专注食物。' },
    { greeting: '午时。', microAction: '闭眼休息三十秒，然后去吃饭。' },
  ],
  encouraging: [
    { greeting: '中午好！上午你已经坚持过来了，很棒。', microAction: '奖励自己一顿认真的午饭。' },
    { greeting: '午安！上午不管完成了多少，都值得一顿好饭。', microAction: '起来走一走，胃口会更好。' },
    { greeting: '中午好！半天的高效工作值得好好犒劳。', microAction: '离开屏幕，去找你喜欢吃的。' },
    { greeting: '午安！你已经比早上起床时的自己更厉害了。', microAction: '吃一顿不急的午饭，慢慢嚼。' },
    { greeting: '饭点了！你上午做得够多了。', microAction: '现在只需要做一件事：好好吃饭。' },
  ],
  poetic: [
    { greeting: '正午的阳光笔直地照下来，影子缩成了小小的一团。', microAction: '从屏幕背后走出来，让阳光照到你的脸。' },
    { greeting: '窗外的光到了最亮的时候，也到了照顾胃的时候。', microAction: '放下键盘，用手去拿筷子。' },
    { greeting: '一天的中点，像一个温柔的分号。', microAction: '暂停一下，让温热的食物穿过你的身体。' },
    { greeting: '太阳走到头顶，影子藏起来了。', microAction: '你也该藏起来一会儿——躲在饭菜的热气里。' },
    { greeting: '中午的光是白色的，像一张可以重新开始的纸。', microAction: '吃一顿饭，把上午的疲惫写在这张纸上翻过去。' },
  ],
  companion: [
    { greeting: '中午了！我肚子也在咕咕叫了。', microAction: '一起去吃饭吧，你先选，我跟着。' },
    { greeting: '午安，我蹲在你脚边等你带我去吃饭。', microAction: '走吧走吧，午饭时间是最重要的时间。' },
    { greeting: '半天过去了，你辛苦了，我看到啦。', microAction: '现在去犒劳一下自己，吃顿好的。' },
    { greeting: '中午好！我在键盘旁边打盹，等你带我去觅食。', microAction: '站起来，走出去，我陪着你。' },
    { greeting: '午餐时间到！我在旁边蹭了蹭你的腿。', microAction: '别在屏幕前吃了，换个地方，换种心情。' },
  ],
};
export default noon;
