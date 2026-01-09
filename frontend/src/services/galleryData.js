/**
 * replace with API calls later
 */
export const GALLERY_DATA = [
  {
    id: 1,
    link: 'http://www.dsm1918.de/filmdreh-dormans-09-09-2006-4.jpg',
    description: 'Der Film handelt über die Marneschlacht in Dormans / Frankreich und über die Spanische Grippe 1918'
  },
  {
    id: 2,
    link: 'http://www.dsm1918.de/emden-14-07-2005-2.jpg',
    description: 'Jagt die Korsaren des Kaisers!'
  },
  {
    id: 3,
    link: 'http://www.dsm1918.de/sedan-1870-film-02-07-2005-3.jpg',
    description: 'Sedan 1870'
  },
  {
    id: 4,
    link: 'https://picsum.photos/id/1020/800/600',
    description: 'Description for image 4'
  },
  {
    id: 5,
    link: 'https://picsum.photos/id/1024/800/600',
    description: 'Description for image 5'
  },
  {
    id: 6,
    link: 'https://picsum.photos/id/1025/800/600',
    description: 'Description for image 6'
  },
  {
    id: 7,
    link: 'https://picsum.photos/id/1027/800/600',
    description: 'Description for image 7'
  },
  {
    id: 8,
    link: 'https://picsum.photos/id/1035/800/600',
    description: 'Description for image 8'
  },
  {
    id: 9,
    link: 'https://picsum.photos/id/1039/800/600',
    description: 'Description for image 9'
  },
  {
    id: 10,
    link: 'https://picsum.photos/id/1043/800/600',
    description: 'Description for image 10'
  },
  {
    id: 11,
    link: 'https://picsum.photos/id/1050/800/600',
    description: 'Description for image 11'
  },
  {
    id: 12,
    link: 'https://picsum.photos/id/1062/800/600',
    description: 'Description for image 12'
  }
];

export const getGalleryImages = () => GALLERY_DATA;
export const getGalleryImageById = (id) => GALLERY_DATA.find(img => img.id === id);
