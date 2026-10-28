export type QrMotif =
  | 'cat' | 'ghost' | 'blob' | 'fish' | 'frog'
  | 'disco' | 'star' | 'moon' | 'bolt'
  | 'coffee' | 'croissant' | 'boba' | 'pizza' | 'burger' | 'fruit' | 'cookie' | 'cocktail'
  | 'flower' | 'plant' | 'butterfly' | 'sun' | 'tent' | 'sneaker'
  | 'bag' | 'book' | 'yarn' | 'camera' | 'palette'
  | 'record' | 'headphones' | 'megaphone'
  | 'gift' | 'balloon' | 'heart' | 'candle' | 'cake';

export const qrCategories = [
  'Parties',
  'Food & drink',
  'Shops',
  'Markets',
  'Music & arts',
  'Celebrations',
  'Outdoors & wellness',
  'Community',
] as const;

type QrPreset = {
  id: string;
  label: string;
  category: (typeof qrCategories)[number];
  description: string;
  idea: string;
  motifs: readonly QrMotif[];
  accent: string;
};

// Accents belong to the printed preset swatches. QR artwork stays ink on bond.
export const qrPresets = [
  {
    id: 'party', label: 'House party', category: 'Parties',
    description: 'Mirror balls, balloons and cocktail glasses for a night together.',
    idea: 'Put it on your invite, then send everyone to the same party details.',
    motifs: ['disco', 'balloon', 'cocktail', 'star'], accent: '#ff48b0',
  },
  {
    id: 'spooky', label: 'Friendly frights', category: 'Parties',
    description: 'Ghost silhouettes, crescent moons and candlelight.',
    idea: 'Make a Halloween flyer that leads straight to the costume party.',
    motifs: ['ghost', 'moon', 'blob', 'candle'], accent: '#ff6c2f',
  },
  {
    id: 'disco-fever', label: 'Disco fever', category: 'Parties',
    description: 'Mirror balls, headphones and lightning for the dance floor.',
    idea: 'Print it on a DJ night poster or share the set times at the door.',
    motifs: ['disco', 'headphones', 'bolt', 'star'], accent: '#0078bf',
  },
  {
    id: 'rooftop', label: 'Rooftop hours', category: 'Parties',
    description: 'Cocktail glasses, crescent moons and stars above the city.',
    idea: 'Add it to a rooftop invitation or a sunset drinks table card.',
    motifs: ['cocktail', 'moon', 'star'], accent: '#ff48b0',
  },
  {
    id: 'coffee-break', label: 'Coffee break', category: 'Food & drink',
    description: 'Coffee cups, croissants and cookies in simple outlines.',
    idea: 'Stick it by the till for your cafe menu or next coffee pop-up.',
    motifs: ['coffee', 'croissant', 'cookie'], accent: '#b98b5e',
  },
  {
    id: 'boba-buddies', label: 'Boba buddies', category: 'Food & drink',
    description: 'Bubble tea cups, hearts and stars.',
    idea: 'Use it on a drinks stall sign or a tasting night invitation.',
    motifs: ['boba', 'heart', 'star'], accent: '#ff48b0',
  },
  {
    id: 'late-bites', label: 'Late bites', category: 'Food & drink',
    description: 'Pizza slices, stacked burgers and lightning.',
    idea: 'Send the after-party crowd to a food pop-up or late-night menu.',
    motifs: ['pizza', 'burger', 'bolt'], accent: '#ff6c2f',
  },
  {
    id: 'sunny-brunch', label: 'Sunny brunch', category: 'Food & drink',
    description: 'Fresh fruit, pastry, coffee and sunshine.',
    idea: 'Put it on a brunch special, breakfast club invite or weekend menu.',
    motifs: ['fruit', 'croissant', 'sun', 'coffee'], accent: '#00a95c',
  },
  {
    id: 'little-shop', label: 'Little shop', category: 'Shops',
    description: 'Shopping bags, hearts and stars for your next collection.',
    idea: 'Give your shop window, counter sign or new collection a way in.',
    motifs: ['bag', 'heart', 'star'], accent: '#ff48b0',
  },
  {
    id: 'plant-parent', label: 'Plant parent', category: 'Shops',
    description: 'Potted plants, flowers and butterfly silhouettes.',
    idea: 'Tag a plant sale, flower stand or terrarium workshop.',
    motifs: ['plant', 'flower', 'butterfly'], accent: '#00a95c',
  },
  {
    id: 'book-nook', label: 'Book nook', category: 'Shops',
    description: 'Open books, cat silhouettes and a cup for the next chapter.',
    idea: 'Place it on a bookshop display or an author reading poster.',
    motifs: ['book', 'cat', 'coffee'], accent: '#0078bf',
  },
  {
    id: 'stitch-studio', label: 'Stitch studio', category: 'Shops',
    description: 'Yarn balls, totes and flowers for handmade things.',
    idea: 'Share a craft shop, sewing circle or small collection launch.',
    motifs: ['yarn', 'bag', 'flower'], accent: '#b98b5e',
  },
  {
    id: 'flea-finds', label: 'Flea finds', category: 'Markets',
    description: 'Records, cameras and shopping bags for secondhand finds.',
    idea: 'Make a flea market poster or a sign for your vintage stall.',
    motifs: ['bag', 'record', 'camera'], accent: '#ff6c2f',
  },
  {
    id: 'makers-market', label: 'Made by hand', category: 'Markets',
    description: 'Paint palettes, yarn and flowers from local makers.',
    idea: 'Connect a makers market flyer to the event and vendor details.',
    motifs: ['palette', 'yarn', 'flower'], accent: '#ff48b0',
  },
  {
    id: 'farmers-market', label: 'Fresh from the farm', category: 'Markets',
    description: 'Fresh fruit, leafy plants and sunshine.',
    idea: 'Use it on a produce stall, farm day or neighbourhood market sign.',
    motifs: ['fruit', 'plant', 'sun'], accent: '#00a95c',
  },
  {
    id: 'night-market', label: 'Night market', category: 'Markets',
    description: 'Bubble tea, pizza, crescent moons and candlelight.',
    idea: 'Guide visitors from a street poster to your evening market.',
    motifs: ['boba', 'pizza', 'moon', 'candle'], accent: '#0078bf',
  },
  {
    id: 'gig', label: 'Loud little gig', category: 'Music & arts',
    description: 'Headphones, lightning, stars and cat silhouettes.',
    idea: 'Add it to a gig flyer, listening party invite or venue door sign.',
    motifs: ['headphones', 'bolt', 'cat', 'star'], accent: '#0078bf',
  },
  {
    id: 'vinyl-club', label: 'Vinyl club', category: 'Music & arts',
    description: 'Vinyl records, mirror balls and stars.',
    idea: 'Share a record fair, DJ session or album listening night.',
    motifs: ['record', 'disco', 'star'], accent: '#ff6c2f',
  },
  {
    id: 'gallery-crawl', label: 'Gallery crawl', category: 'Music & arts',
    description: 'Paint palettes, cameras and abstract shapes.',
    idea: 'Send people to an exhibition, photo walk or open studio.',
    motifs: ['palette', 'camera', 'blob'], accent: '#ff48b0',
  },
  {
    id: 'workshop-table', label: 'Workshop table', category: 'Music & arts',
    description: 'Paint palettes, yarn and open sketchbooks.',
    idea: 'Put the next art class or hands-on workshop on a printed handout.',
    motifs: ['palette', 'yarn', 'book'], accent: '#00a95c',
  },
  {
    id: 'birthday-wishes', label: 'Birthday wishes', category: 'Celebrations',
    description: 'Birthday cake, balloons and ribbon-wrapped gifts.',
    idea: 'Make a birthday invite or a little sign beside the cake.',
    motifs: ['cake', 'balloon', 'gift'], accent: '#ff48b0',
  },
  {
    id: 'all-love', label: 'All love', category: 'Celebrations',
    description: 'Hearts, flowers and butterfly silhouettes.',
    idea: 'Dress up an anniversary invite, engagement party or wedding card.',
    motifs: ['heart', 'flower', 'butterfly'], accent: '#ff48b0',
  },
  {
    id: 'big-little-win', label: 'Big little win', category: 'Celebrations',
    description: 'Gifts, stars and balloons for a well-earned celebration.',
    idea: 'Celebrate a graduation, new opening or personal milestone.',
    motifs: ['gift', 'star', 'balloon'], accent: '#0078bf',
  },
  {
    id: 'holiday-table', label: 'Holiday table', category: 'Celebrations',
    description: 'Ribbon-wrapped gifts, candles and stars.',
    idea: 'Share a festive get-together, gift exchange or end-of-year dinner.',
    motifs: ['gift', 'candle', 'star'], accent: '#00a95c',
  },
  {
    id: 'picnic-pals', label: 'Picnic pals', category: 'Outdoors & wellness',
    description: 'Fresh fruit, flowers and butterflies for an afternoon outside.',
    idea: 'Invite everyone to a picnic, garden gathering or park meet-up.',
    motifs: ['fruit', 'flower', 'butterfly'], accent: '#00a95c',
  },
  {
    id: 'trail-time', label: 'Trail time', category: 'Outdoors & wellness',
    description: 'Tents, leafy plants and sunshine.',
    idea: 'Put the details for a camp, easy hike or outdoor weekend on a flyer.',
    motifs: ['tent', 'plant', 'sun'], accent: '#b98b5e',
  },
  {
    id: 'move-together', label: 'Move together', category: 'Outdoors & wellness',
    description: 'Sneakers, lightning and sunshine.',
    idea: 'Share a run club, dance class or weekend movement session.',
    motifs: ['sneaker', 'bolt', 'sun'], accent: '#ff6c2f',
  },
  {
    id: 'slow-sunday', label: 'Slow Sunday', category: 'Outdoors & wellness',
    description: 'Candles, potted plants and crescent moons.',
    idea: 'Make a calm invitation for yoga, journaling or a quiet gathering.',
    motifs: ['candle', 'plant', 'moon'], accent: '#0078bf',
  },
  {
    id: 'clubhouse', label: 'Clubhouse', category: 'Community',
    description: 'Frog silhouettes, open books and hearts.',
    idea: 'Bring a reading group, hobby club or student society together.',
    motifs: ['frog', 'book', 'heart'], accent: '#00a95c',
  },
  {
    id: 'give-a-little', label: 'Give a little', category: 'Community',
    description: 'Hearts, gifts and flowers for a shared good cause.',
    idea: 'Help a fundraiser, charity sale or donation drive get discovered.',
    motifs: ['heart', 'gift', 'flower'], accent: '#ff48b0',
  },
  {
    id: 'hello-neighbour', label: 'Hello, neighbour', category: 'Community',
    description: 'Megaphones, coffee cups and bags for the swap table.',
    idea: 'Post a neighbourhood social, swap meet or volunteer gathering.',
    motifs: ['megaphone', 'coffee', 'bag'], accent: '#ff6c2f',
  },
  {
    id: 'animal-friends', label: 'Animal friends', category: 'Community',
    description: 'Simple cat, fish and frog silhouettes.',
    idea: 'Share a pet meet-up, adoption day or animal lovers gathering.',
    motifs: ['cat', 'fish', 'frog'], accent: '#0078bf',
  },
] as const satisfies readonly QrPreset[];

export type QrPresetId = (typeof qrPresets)[number]['id'];

export function getQrPreset(id: string) {
  const preset = qrPresets.find(preset => preset.id === id);
  if (!preset) throw new Error('Choose one of the available QR styles.');
  return preset;
}
