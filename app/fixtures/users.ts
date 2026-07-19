import type { PublicUserProfile } from '~/types/user'

export const publicUsers: PublicUserProfile[] = [
  { id: 'aoki', name: '青木与夏', role: 'author', bio: '写雨、旧书页，以及那些没能及时说出口的话。', joinedAt: '2024-04-12T00:00:00+08:00' },
  { id: 'mori', name: '森下遥', role: 'author', bio: '愿每一盏灯都能照见回家的海岸。', joinedAt: '2023-11-03T00:00:00+08:00' },
  { id: 'natsu', name: '夏至之后', role: 'author', bio: '收集深夜站台、星光和短暂相遇。', joinedAt: '2024-08-19T00:00:00+08:00' },
  { id: 'shiro', name: '白川灯', role: 'author', bio: '咖啡、猫和普通日子里的微小奇迹。', joinedAt: '2025-01-26T00:00:00+08:00' }
]
