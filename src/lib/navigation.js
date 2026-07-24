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
    ],
  },
  {
    id: "branches",
    label: "សាខា",
    href: "/branch",
    icon: "building",
    roles: ["admin"],
  },
  {
    id: "members",
    label: "សមាជិក",
    href: "/member",
    icon: "users",
    roles: ["admin", "secretary"],
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
      "member",
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
    ],
  },
  {
    id: "profile",
    label: "ប្រវត្តិរូប",
    href: "/myAcc",
    icon: "profile",
    roles: [
      "admin",
      "secretary",
      "branch_leader",
      "member",
    ],
  },
  {
    id: "variables",
    label: "ការកំណត់អថេរ",
    href: "/variable",
    icon: "settings",
    roles: ["admin"],
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
  };

  return (
    roleHomePaths[normalizedRole] ||
    "/auth/login"
  );
}
