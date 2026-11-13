export const ADMIN_DEFAULT_PATH = '/admin/places'

export const ADMIN_SECTIONS = [
  {
    key: 'places',
    path: '/admin/places',
    label: '地点审核',
    shortLabel: '审核',
    icon: 'shield',
    title: '地点审核',
    description: '只处理待审核地点，核实信息后直接通过或驳回。'
  },
  {
    key: 'activities',
    path: '/admin/activities',
    label: '活动管理',
    shortLabel: '活动',
    icon: 'calendar',
    title: '活动管理',
    description: '审核用户提交的活动，并集中管理已通过活动的状态与报名情况。'
  },
  {
    key: 'reviews',
    path: '/admin/reviews',
    label: '评价审核',
    shortLabel: '评论',
    icon: 'message',
    title: '评价与评论',
    description: '统一处理地点评价和活动评论，移除不当内容。'
  }
]
