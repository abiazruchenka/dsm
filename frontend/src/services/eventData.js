/**
 * replace with API calls later
 */
export const EVENTS_DATA = [
  {
    id: 1,
    title: 'Medieval Fair 2026',
    date: 'May 15, 2026',
    image: 'https://picsum.photos/id/1011/800/600',
    description: 'Join us for a full day of historical reenactments, craft stalls, and traditional music.'
  },
  {
    id: 2,
    title: 'Historical Parade',
    date: 'June 4, 2026',
    image: 'https://picsum.photos/id/1012/800/600',
    description: 'A colorful procession through the town centre featuring period costumes and banners.'
  },
  {
    id: 3,
    title: 'Battle Reenactment',
    date: 'July 9, 2026',
    image: 'https://picsum.photos/id/1013/800/600',
    description: 'Witness a recreated skirmish with authentic weapons and tactics from the era.'
  },
  {
    id: 4,
    title: 'Open Workshop',
    date: 'August 21, 2026',
    image: 'https://picsum.photos/id/1014/800/600',
    description: 'Hands-on demonstrations by artisans: blacksmithing, weaving, and woodcarving.'
  }
];

export const getEvents = () => EVENTS_DATA;
export const getEventById = (id) => EVENTS_DATA.find(ev => ev.id === id);
