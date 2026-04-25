// We generate 100 seeds for DiceBear Pixel Art
const SEEDS = Array.from({ length: 100 }, (_, i) => `boss_${i}_${Math.random().toString(36).substring(7)}`);

export const PRELOADED_AVATARS = SEEDS.map(seed => `https://api.dicebear.com/8.x/pixel-art/svg?seed=${seed}`);

export const preloadImages = () => {
  PRELOADED_AVATARS.forEach(url => {
    const img = new Image();
    img.src = url;
  });
};

export const getRandomAvatar = () => {
  const index = Math.floor(Math.random() * PRELOADED_AVATARS.length);
  return PRELOADED_AVATARS[index];
};
