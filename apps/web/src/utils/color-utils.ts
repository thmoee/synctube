const SAFE_COLORS = [
  // Warm Colors
  '#FF5733', // Coral
  '#FF6B4A', // Salmon
  '#FF8C64', // Light Coral
  '#FF4F1F', // Bright Red-Orange
  '#FF7F50', // Coral Pink
  '#FFB347', // Pastel Orange
  '#FFA07A', // Light Salmon
  '#FF8C42', // Mango

  // Cool Colors
  '#4A90E2', // Sky Blue
  '#5C6BC0', // Indigo
  '#3498DB', // Bright Blue
  '#2E86DE', // Ocean Blue
  '#54A0FF', // Clear Blue
  '#686DE0', // Electric Blue
  '#4834D4', // Royal Blue
  '#30336B', // Deep Blue

  // Green Shades
  '#2ECC71', // Emerald
  '#26DE81', // Gossip
  '#20BF6B', // Forest Green
  '#16A085', // Sea Green
  '#4CD137', // Lime
  '#A8E6CF', // Mint
  '#3DBB7F', // Jade
  '#2D98DA', // Summer Sky

  // Purple Shades
  '#9B59B6', // Amethyst
  '#8E44AD', // Wisteria
  '#A55EEA', // Light Purple
  '#D6A2E8', // Lavender
  '#BE2EDD', // Magenta
  '#6C5CE7', // Bright Purple
  '#7158E2', // Royal Purple
  '#786FA6', // Mountain Lavender

  // Pink Shades
  '#FF4757', // Wild Watermelon
  '#FF6B81', // Pink Rose
  '#FF7979', // Coral Pink
  '#F78FB3', // Pink Glamour
  '#E84393', // Bright Pink
  '#FD79A8', // Rosy Pink
  '#F53B57', // Hot Pink
  '#EE5A24', // Burning Orange

  // Yellow/Orange Shades
  '#FFA502', // Orange
  '#FFBD2F', // Sunflower
  '#FFC312', // Sunny Yellow
  '#F1C40F', // Yellow
  '#FAB1A0', // Peach
  '#FFEAA7', // Cream
  '#FFB142', // Golden
  '#FF9F1A', // Bright Orange

  // Teal/Cyan Shades
  '#00CEC9', // Robin's Egg Blue
  '#81ECEC', // Light Cyan
  '#34E7E4', // Turquoise
  '#18DCFF', // Electric Blue
  '#17C0EB', // Blue Curacao
  '#00B894', // Mint Leaf
  '#55EFC4', // Light Greenish Blue
  '#00D2D3', // Aqua

  // Unique Mixed Shades
  '#6D214F', // Plum
  '#B33771', // Fuchsia
  '#82589F', // Bright Lavender
  '#CD84F1', // Light Purple
  '#7ED6DF', // Middle Blue
  '#E056FD', // Psychedelic Purple
  '#686DE0', // Electric Blue
  '#95AFC0', // Steel Blue
];

export function getRandomSafeColor(): string {
  return SAFE_COLORS[Math.floor(Math.random() * SAFE_COLORS.length)];
}

export function getColorForUsername(username: string): string {
  const index =
    username.split('').reduce((acc, char) => {
      return acc + char.charCodeAt(0);
    }, 0) % SAFE_COLORS.length;

  return SAFE_COLORS[index];
}
