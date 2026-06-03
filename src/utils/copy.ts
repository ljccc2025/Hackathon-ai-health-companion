export function logPositiveText(id: string, count: number): string {
  switch (id) {
    case 'hydration':
      return count > 0 ? `身体被轻轻浇了 ${count} 次` : '第一口水在等你';
    case 'standup':
      return count > 0 ? `把自己从椅子上捞起 ${count} 次` : '椅子也在等你离开一下';
    case 'emotion':
      return count > 0 ? `没有立刻责怪自己 ${count} 次` : '每一次停顿都珍贵';
    case 'breathing':
      return count > 0 ? `跟着呼吸慢慢沉下来 ${count} 次` : '睡前的小仪式在等你';
    default:
      return '';
  }
}
