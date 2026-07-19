import type { PublicUserProfile } from '~/types/user'

export const publicUsers: PublicUserProfile[] = [
  { id: 'aoki', name: '青木与夏', role: 'author', bio: '写雨、旧书页，以及那些没能及时说出口的话。', joinedAt: '2024-04-12T00:00:00+08:00', contributions: [{ date: '2026-01-08', count: 1 }, { date: '2026-01-10', count: 2 }, { date: '2026-02-14', count: 1 }, { date: '2026-03-03', count: 3 }, { date: '2026-03-05', count: 2 }, { date: '2026-04-18', count: 1 }, { date: '2026-05-06', count: 4 }, { date: '2026-05-21', count: 2 }, { date: '2026-06-21', count: 3 }, { date: '2026-06-28', count: 2 }, { date: '2026-07-05', count: 1 }, { date: '2026-07-11', count: 4 }, { date: '2026-07-17', count: 3 }] },
  { id: 'mori', name: '森下遥', role: 'author', bio: '愿每一盏灯都能照见回家的海岸。', joinedAt: '2023-11-03T00:00:00+08:00', contributions: [{ date: '2026-02-02', count: 1 }, { date: '2026-03-12', count: 2 }, { date: '2026-04-27', count: 4 }, { date: '2026-06-09', count: 2 }, { date: '2026-07-16', count: 3 }] },
  { id: 'natsu', name: '夏至之后', role: 'author', bio: '收集深夜站台、星光和短暂相遇。', joinedAt: '2024-08-19T00:00:00+08:00', contributions: [{ date: '2026-01-19', count: 2 }, { date: '2026-04-03', count: 1 }, { date: '2026-05-25', count: 3 }, { date: '2026-07-12', count: 5 }] },
  { id: 'shiro', name: '白川灯', role: 'author', bio: '咖啡、猫和普通日子里的微小奇迹。', joinedAt: '2025-01-26T00:00:00+08:00', contributions: [{ date: '2026-03-11', count: 1 }, { date: '2026-05-13', count: 2 }, { date: '2026-06-24', count: 1 }, { date: '2026-07-15', count: 3 }] }
]
