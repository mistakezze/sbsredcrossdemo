import { ref } from 'vue'

const locationsData = [
  {
    id: 1,
    name: '上海红十字会博物馆',
    location: '上海市 · 徐汇区',
    category: '博物馆',
    description: '中国第一座红十字主题博物馆，坐落于原上海万国红十字会旧址。全面展示了自1904年以来，中国红十字运动从上海起源并发展的百年历程，馆藏珍贵历史照片、实物资料超过万件。',
    history: '2005年开馆，位于中国红十字会发源地——上海徐汇区，是全国红十字系统首座专业博物馆。',
    highlights: ['百年红十字史展', '人道救援实物展', '沈敦和故居复原', '互动体验区'],
    image: '',
    color: '#d32f2f',
    mapX: 330,
    mapY: 370,
    labelSide: 'bottom'
  },
  {
    id: 2,
    name: '上海市红十字会',
    location: '上海市 · 静安区',
    category: '机构',
    description: '上海市红十字会是中国红十字会的地方分会，承担着全市范围内的人道救助、应急救护、无偿献血、造血干细胞捐献、遗体捐献等重要职责。每年组织大量志愿服务活动，惠及百万市民。',
    history: '1911年成立上海红十字分会，1950年改组为上海市红十字会，是中国红十字事业的重要力量。',
    highlights: ['应急救护培训中心', '无偿献血组织', '志愿服务平台', '国际交流合作'],
    image: '',
    color: '#c62828',
    mapX: 350,
    mapY: 250,
    labelSide: 'top'
  },
  {
    id: 3,
    name: '上海红十字备灾救灾中心',
    location: '上海市 · 浦东新区',
    category: '救灾中心',
    description: '上海市红十字会备灾救灾物资储备与调配中心，承担着华东地区重大自然灾害的应急物资保障任务。仓库面积上万平米，储备有帐篷、棉被、食品、医疗物资等各类救灾物资。',
    history: '2008年汶川地震后加速建设，2010年正式投入使用，已参与多次重大灾害救援行动。',
    highlights: ['应急物资储备库', '救灾指挥中心', '应急演练基地', '志愿者培训中心'],
    image: '',
    color: '#ef5350',
    mapX: 680,
    mapY: 320,
    labelSide: 'bottom'
  },
  {
    id: 4,
    name: '上海市红十字医院',
    location: '上海市 · 长宁区',
    category: '医疗机构',
    description: '由上海市红十字会冠名的医疗机构，秉承红十字人道主义精神，为广大市民提供优质医疗服务。医院在应急医疗救援、贫困患者救助、社区健康服务等方面具有显著特色。',
    history: '前身为1920年代创立的教会医院，1980年代由红十字会冠名，发展为综合性医疗机构。',
    highlights: ['人道医疗救助', '24小时急诊服务', '社区健康义诊', '红十字义诊团'],
    image: '',
    color: '#e57373',
    mapX: 230,
    mapY: 220,
    labelSide: 'top'
  },
  {
    id: 5,
    name: '红十字国际委员会东亚地区代表处',
    location: '上海市 · 黄浦区',
    category: '国际组织',
    description: '红十字国际委员会（ICRC）在东亚地区的重要办事机构，负责协调中国、日本、韩国等地区的人道援助工作。致力于推广国际人道法，保护战争与武装冲突受难者的生命与尊严。',
    history: '1990年代在上海设立代表处，是ICRC在东亚地区的核心协调枢纽。',
    highlights: ['国际人道法推广', '地区援助协调', '人道外交', '学术交流合作'],
    image: '',
    color: '#ff7043',
    mapX: 520,
    mapY: 320,
    labelSide: 'top'
  },
  {
    id: 6,
    name: '上海红十字青少年活动中心',
    location: '上海市 · 杨浦区',
    category: '青少年教育',
    description: '面向全市青少年开展红十字精神教育与实践活动的专门场所。通过急救培训、志愿服务、人道教育等项目，培养青少年的社会责任意识与博爱精神。',
    history: '2000年初创立，是全国第一家红十字青少年专项活动中心，已培训数十万青少年。',
    highlights: ['急救技能训练营', '人道精神课堂', '志愿服务项目', '红十字少年团'],
    image: '',
    color: '#ff8a65',
    mapX: 640,
    mapY: 180,
    labelSide: 'top'
  },
  {
    id: 7,
    name: '上海红十字造血干细胞捐献者资料库',
    location: '上海市 · 静安区',
    category: '公益机构',
    description: '中国造血干细胞捐献者资料库（中华骨髓库）上海分库。为白血病等血液病患者提供造血干细胞配型检索服务，是上海地区造血干细胞捐献工作的核心机构。',
    history: '1992年启动，已登记志愿捐献者超过10万人，已成功帮助数千名患者找到配型。',
    highlights: ['造血干细胞登记', 'HLA配型检索', '捐献者关怀', '科普宣传教育'],
    image: '',
    color: '#ffb74d',
    mapX: 440,
    mapY: 180,
    labelSide: 'bottom'
  },
  {
    id: 8,
    name: '上海博爱园',
    location: '上海市 · 闵行区',
    category: '纪念公园',
    description: '以"博爱"为主题的纪念公园，是上海市红十字会弘扬人道主义精神的重要文化阵地。园内设有红十字纪念碑、博爱广场、志愿者雕塑群、红十字文化长廊等景观设施。',
    history: '2014年建成开放，是全国第一个以红十字为主题的城市公园，占地约100亩。',
    highlights: ['红十字纪念碑', '博爱主题雕塑', '志愿者纪念馆', '文化宣传长廊'],
    image: '',
    color: '#ffcc80',
    mapX: 270,
    mapY: 440,
    labelSide: 'top'
  }
]

const locationsRef = ref(locationsData)

export const useLocationStore = () => {
  const getLocationById = (id) => {
    return locationsData.find(l => l.id === Number(id))
  }

  return {
    locations: locationsRef,
    getLocationById
  }
}
