export const NAV_ITEMS = [
  {
    id: "dashboard",
    label: "ផ្ទាំងគ្រប់គ្រង",
    href: "/dashboard",
    icon: "dashboard",
    roles: [
      "admin",
      "secretary",
      "branch_leader",
      "viewer",
    ],
  },
  {
    id: "branches",
    label: "សាខា",
    href: "/branch",
    icon: "building",
    roles: ["admin", "viewer"],
  },
  {
    id: "members",
    label: "សមាជិក",
    href: "/member",
    icon: "users",
    roles: ["admin", "secretary", "viewer"],
  },
  {
    id: "activities",
    label: "កម្មវិធី",
    href: "/activity",
    icon: "calendar",
    roles: [
      "admin",
      "secretary",
      "branch_leader",
      "viewer",
    ],
  },
  {
    id: "donations",
    label: "ហិរញ្ញវត្ថុ",
    href: "/donation",
    icon: "donation",
    roles: [
      "admin",
      "secretary",
      "branch_leader",
      "member",
      "viewer",
    ],
  },
  {
    id: "documents",
    label: "ឯកសារ",
    href: "/document",
    icon: "file",
    roles: [
      "admin",
      "secretary",
      "branch_leader",
      "member",
      "viewer",
    ],
  },
  {
    id: "profile",
    label: "ប្រវត្តិរូប",
    href: "/myAcc",
    icon: "profile",
    roles: [
      "secretary",
      "branch_leader",
      "member",
    ],
  },
  {
    id: "users",
    label: "អ្នកប្រើប្រាស់",
    href: "/users",
    icon: "userAccounts",
    roles: ["admin", "viewer"],
  },
  {
    id: "variables",
    label: "ការកំណត់អថេរ",
    href: "/variable",
    icon: "settings",
    roles: ["admin", "viewer"],
  },
  {
  id: "notification",
  label: "ការជូនដំណឹង",
  href: "/notification",
  icon: "bell",
  roles: [
    "admin",
    "secretary",
    "branch_leader",
    "member",
  ],
  showInSidebar: false,
},
];

export function normalizeRole(role) {
  return String(role || "")
    .trim()
    .toLowerCase();
}

export function getNavigationForRole(role) {
  const normalizedRole = normalizeRole(role);

  return NAV_ITEMS.filter(
    (item) =>
      item.roles.includes(normalizedRole) &&
      item.showInSidebar !== false
  );
}

export function getRoleHomePath(role) {
  const normalizedRole = normalizeRole(role);

  const roleHomePaths = {
    admin: "/dashboard",
    secretary: "/dashboard",
    branch_leader: "/dashboard",
    member: "/activity",
    viewer: "/dashboard",
  };

  return (
    roleHomePaths[normalizedRole] ||
    "/auth/login"
  );
}
