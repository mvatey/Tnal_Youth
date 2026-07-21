// lib/navigation.js
export const NAV_ITEMS = [
  { id: 'dashboard',  label: 'ផ្ទាំងគ្រប់គ្រង', href: '/dashboard',  icon: 'dashboard', roles: ['admin', 'secretary', 'branch_leader'] },
  { id: 'branches',   label: 'សាខា',             href: '/branche',   icon: 'building',  roles: ['admin'] },
  { id: 'members',    label: 'សមាជិក',           href: '/member',    icon: 'users',     roles: ['admin', 'secretary'] },
  { id: 'activities', label: 'កម្មវិធី',          href: '/activity', icon: 'calendar',  roles: ['admin', 'secretary', 'branch_leader', 'member'] },
  { id: 'donations',  label: 'វិភាគទាន',          href: '/donation',  icon: 'donation',  roles: ['admin', 'secretary', 'branch_leader', 'member'] },
  { id: 'documents',  label: 'ឯកសារ',             href: '/document',  icon: 'file',      roles: ['admin', 'secretary', 'branch_leader', 'member'] },
  { id: 'profile',    label: 'ប្រវត្តិរូប',        href: '/myAcc',    icon: 'profile',   roles: ['admin', 'secretary', 'branch_leader', 'member'] },
  { id: 'variables',  label: 'ការកំណត់អថេរ',      href: '/variable',  icon: 'settings',  roles: ['admin'] },
];