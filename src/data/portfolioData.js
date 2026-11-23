import { HOSTINGER_CDN } from './servicesData';

export const PORTFOLIO_PROJECTS = [
  {
    title: 'Living Room',
    category: 'Interior',
    imgBefore: 'bfda9f33af15cb04141cba80a461381f',
    imgAfter: 'f5ed7b606cf533a77de25540a1017ea4',
    editorialNote: 'Spaces made to feel like home'
  },
  {
    title: 'Bedroom',
    category: 'Interior',
    imgBefore: '527481712b60269a0d4b123030a6b736',
    imgAfter: 'c13046f98b8b35e7b31523d0693b3d64',
    editorialNote: 'Spaces made to feel like home'
  },
  {
    title: 'Kitchen',
    category: 'Interior',
    imgBefore: '8ba755097ae612ca5ca2e1e96f5769fb',
    imgAfter: '1a7bf25816b1b58901d555a3686cb44a',
    editorialNote: 'Spaces made to feel like home'
  },
  {
    title: 'Interior Hallway',
    category: 'Interior',
    imgBefore: 'c5720d1bfe8b0637facfdb8c4598c171',
    imgAfter: '1415ed2db5c649898046196d0d0df252',
    editorialNote: 'Spaces made to feel like home'
  },
  {
    title: 'Staircases and Landings',
    category: 'Interior',
    imgBefore: 'b54ea55bc7b8c685428e70abf7dc1d32',
    imgAfter: 'a7622203101417ca63d7032b43ee27dd',
    editorialNote: 'Spaces made to feel like home'
  },
  {
    title: 'Exterior House Painting',
    category: 'Exterior',
    imgBefore: '98172832b84b637c8e72182b631b5d17',
    imgAfter: '5861761c66ae7248702bfc0bb9ca2b9d',
    editorialNote: 'A first impression that lasts'
  },
  {
    title: 'Front Door Painting',
    category: 'Exterior',
    imgBefore: '00cdb2fbe0eac1ae22b4ed767006b4d1',
    imgAfter: 'd07c58a7b42a0ca28a9c2ff6a88bfa4f',
    editorialNote: 'A first impression that lasts'
  },
  {
    title: 'Metal Driveway Gates',
    category: 'Exterior',
    imgBefore: '847b2d366f7b4774ff48387a0265a023',
    imgAfter: '07abb3da3ddc25d08f0d0379e7ff8a13',
    editorialNote: 'A first impression that lasts'
  },
  {
    title: 'Exterior Staircases',
    category: 'Exterior',
    imgBefore: '5d00acab05be06b7c3412bfc90d593da',
    imgAfter: 'a6f0f16a273814367316d50ed8b661ee',
    editorialNote: 'A first impression that lasts'
  },
  {
    title: 'Roof Fascia',
    category: 'Roofline',
    imgBefore: '99327c5fb455d4173f905d1bdfebb1f4',
    imgAfter: '4186c4a76f9397f29f19153cb58992f3',
    editorialNote: 'The details are everything'
  },
  {
    title: 'Roof Soffits',
    category: 'Roofline',
    imgBefore: '6d9efce9e1e18855f73a024c55447164',
    imgAfter: '586b327b9fd39ebe36a35bf8d743976e',
    editorialNote: 'The details are everything'
  },
  {
    title: 'Roof Painting',
    category: 'Roofline',
    imgBefore: '590fdbc38ab338c0128b598692790e11',
    imgAfter: 'b4a335e8048c0aa5f608497d4cc11b9c',
    editorialNote: 'The details are everything'
  }
];

export const getImageUrl = (id) => {
  if (!id) return '';
  if (typeof id === 'string' && (id.startsWith('http://') || id.startsWith('https://') || id.startsWith('/'))) {
    return id;
  }
  return `${HOSTINGER_CDN}${id}.jpg`;
};
