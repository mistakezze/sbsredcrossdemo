import { ref } from 'vue'

const figuresData = [
  {
    id: 1,
    name: '沈敦和',
    enName: 'Shen Dunhe',
    title: '上海万国红十字会创始人',
    years: '1866 - 1920',
    description: '清末民初著名企业家、慈善家。1904年日俄战争期间，发起成立上海万国红十字会（中国红十字会前身），开创了中国近代红十字运动。他组织了战地救护、难民救济等活动，为中国红十字事业奠定了坚实基础。',
    achievement: '上海万国红十字会发起人兼首任总董',
    quote: '以博爱恤兵为宗旨，以救济扶危为使命。',
    color: '#d32f2f'
  },
  {
    id: 2,
    name: '任鸿隽',
    enName: 'Ren Hongjun',
    title: '中国红十字会先驱',
    years: '1886 - 1961',
    description: '著名教育家、科学家。早年积极参与红十字运动，抗战期间在上海组织救护工作，推动了中国红十字会的医学救护体系建设。曾任多个重要学术机构职务，为中国科学与慈善事业发展做出重要贡献。',
    achievement: '科学救国与红十字运动推动者',
    quote: '科学与仁爱，皆是强国之基。',
    color: '#c62828'
  },
  {
    id: 3,
    name: '宋庆龄',
    enName: 'Soong Ching-ling',
    title: '中国红十字会名誉会长',
    years: '1893 - 1981',
    description: '伟大的爱国主义、民主主义、国际主义和共产主义战士。长期担任中国红十字会名誉会长，在上海创办了中国福利会，积极推动儿童福利、医疗救护、国际援助等事业的发展。',
    achievement: '国家名誉主席，中国红十字会名誉会长',
    quote: '博爱是人类最美的情感。',
    color: '#ef5350'
  },
  {
    id: 4,
    name: '钱信忠',
    enName: 'Qian Xinzhong',
    title: '中国红十字会会长',
    years: '1911 - 2009',
    description: '著名医学家、中国红十字事业领导人。曾任中华人民共和国卫生部部长、中国红十字会会长。他推动了红十字会在上海及全国的医疗救护、无偿献血、造血干细胞捐献等事业的全面发展。',
    achievement: '卫生部部长，中国红十字会会长',
    quote: '医者仁心，人道无疆。',
    color: '#ff7043'
  },
  {
    id: 5,
    name: '吴贻芳',
    enName: 'Wu Yifang',
    title: '红十字妇女运动先驱',
    years: '1893 - 1985',
    description: '著名教育家、社会活动家。金陵女子文理学院首任校长。在抗日战争期间，积极组织红十字救护工作，在上海、南京等地开展难民救济和妇女儿童保护工作，是中国红十字妇女运动的重要推动者。',
    achievement: '金陵女子大学校长，红十字妇女运动先驱',
    quote: '以教育启迪人心，以仁爱救助苦难。',
    color: '#ff8a65'
  },
  {
    id: 6,
    name: '颜福庆',
    enName: 'Yan Fuqing',
    title: '中国现代医学奠基人',
    years: '1882 - 1970',
    description: '著名医学教育家、公共卫生学家。1910年在上海创办中华医学会，积极推动中国现代医学教育发展。他将医学与红十字精神紧密结合，推动了红十字医疗救护体系的现代化建设。',
    achievement: '中华医学会创始人，上海医科大学奠基人',
    quote: '医学是最崇高的人道事业。',
    color: '#ffb74d'
  }
]

const figuresRef = ref(figuresData)

export const useFigureStore = () => {
  return {
    figures: figuresRef
  }
}
