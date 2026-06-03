import type { ReminderTone } from '../../types/health';
type GreetingEntry = { greeting: string; microAction: string };
const afternoon: Record<ReminderTone, GreetingEntry[]> = {
  friend: [
    { greeting: '下午好，这个时间点最容易忘记照顾自己。', microAction: '如果杯子空了，刚好可以去接杯水走一走。' },
    { greeting: '下午了，肩膀是不是开始有点紧？', microAction: '慢慢绕两圈肩膀，不用做到标准，舒服就好。' },
    { greeting: '下午总是很漫长，你已经坚持到现在了。', microAction: '起来站一站，让脚底重新感觉到地面。' },
    { greeting: '下午好！咖啡因撑到现在不容易。', microAction: '换一杯水吧，身体会谢你的。' },
    { greeting: '下午的困意来袭，这是身体在说它需要动一动。', microAction: '起来走一圈，不用很久，两分钟就好。' },
  ],
  quiet: [
    { greeting: '下午了。', microAction: '可以站起来，让身体换个姿势。' },
    { greeting: '午后。', microAction: '喝两口水，站一站。' },
    { greeting: '下午。风可能已经变凉了。', microAction: '闭上眼，呼吸三次。' },
    { greeting: '午后的光线开始变软。', microAction: '让肩膀往下沉一点。' },
    { greeting: '下午好。不着急。', microAction: '慢慢转动脖子，一圈就好。' },
  ],
  encouraging: [
    { greeting: '下午好！你已经把今天最难的部分扛过去了。', microAction: '起来活动一下，你值得一个舒服的身体。' },
    { greeting: '下午了！不要忘了你已经做了很多。', microAction: '接杯水，走几步，这是你应得的暂停。' },
    { greeting: '下午好！再坚持一下就好，但不是硬撑。', microAction: '如果累了，就停下来喝两口水，这不是放弃。' },
    { greeting: '午后时光，你已经很棒了。', microAction: '活动一下肩膀，让紧绷的自己松一松。' },
    { greeting: '下午仍在继续，但你已经证明了自己。', microAction: '站起来绕一圈，身体会感谢你这个决定。' },
  ],
  poetic: [
    { greeting: '下午的光从西边斜射进来，在桌面上画了一道金色的河。', microAction: '起身走到窗边，把视线放进那道河里漂一会儿。' },
    { greeting: '下午的光变软了，像被时间打磨过的琥珀。', microAction: '推开椅子，让身体感受一下地心引力以外的方向。' },
    { greeting: '窗外的树在下午的风里轻轻晃，它已经站了一天。', microAction: '你也站一站吧，让腿知道它们不只是用来坐的。' },
    { greeting: '下午的影子开始拉长了，像在提醒一天正在流动。', microAction: '接一杯水，看水在杯子里晃动，然后喝掉它。' },
    { greeting: '杯子里的水变凉了，下午也快过半了。', microAction: '去换一杯温水，顺便让腿走几步路。' },
  ],
  companion: [
    { greeting: '下午好！我在你脚边睡了一觉，现在醒了。', microAction: '要不要起来走一走？我陪你绕房间一圈。' },
    { greeting: '下午了，我看到你揉了好几次肩膀。', microAction: '来，像我这样绕两圈肩膀，呼——好舒服。' },
    { greeting: '下午的时间过得好慢，但我在旁边陪着你。', microAction: '起来接杯水吧，顺便摸摸我的头。' },
    { greeting: '午后的阳光照在你背上，暖洋洋的。', microAction: '起来伸个懒腰，像猫一样，把身体拉长。' },
    { greeting: '你的杯子空了很久了，我注意到了。', microAction: '去加满吧，我帮你看着座位。' },
  ],
};
export default afternoon;
