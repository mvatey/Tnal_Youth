export const NAV_ITEMS = [
  {
    id: "dashboard",
    labelKey: "nav.dashboard",
    label: "ផ្ទាំងគ្រប់គ្រង",
    labelEn: "Dashboard",
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
    labelKey: "nav.branches",
    label: "សាខា",
    labelEn: "Branches",
    href: "/branch",
    icon: "building",
    roles: ["admin", "viewer"],
  },
  {
    id: "members",
    labelKey: "nav.members",
    label: "សមាជិក",
    labelEn: "Members",
    href: "/member",
    icon: "users",
    roles: ["admin","branch_leader", "secretary", "viewer"],
  },
  {
    id: "activities",
    labelKey: "nav.activities",
    label: "កម្មវិធី",
    labelEn: "Activities",
    href: "/activity",
    icon: "calendar",
    roles: [
      "admin",
      "secretary",
      "branch_leader",
      "member",
      "viewer",
    ],
  },
  {
    id: "donations",
    labelKey: "nav.donations",
    label: "ហិរញ្ញវត្ថុ",
    labelEn: "Finance",
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
    labelKey: "nav.documents",
    label: "ឯកសារ",
    labelEn: "Documents",
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
    labelKey: "nav.profile",
    label: "ប្រវត្តិរូប",
    labelEn: "My Account",
    href: "/myAcc",
    icon: "profile",
    roles: [
      "admin",
      "secretary",
      "branch_leader",
      "member",
      "viewer",
    ],
  },
  {
    id: "users",
    labelKey: "nav.users",
    label: "អ្នកប្រើប្រាស់",
    labelEn: "Users",
    href: "/users",
    icon: "userAccounts",
    roles: ["admin", "viewer"],
  },
  {
    id: "variables",
    labelKey: "nav.variables",
    label: "ការកំណត់អថេរ",
    labelEn: "Variables",
    href: "/variable",
    icon: "settings",
    roles: ["admin", "viewer"],
  },
  {
  id: "notification",
  labelKey: "nav.notification",
  label: "ការជូនដំណឹង",
  labelEn: "Notifications",
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


export function getEffectiveRole(userOrRole) {
  if (userOrRole && typeof userOrRole === "object") {
    const actualRole = normalizeRole(userOrRole.role);
    if (actualRole === "viewer") {
      return normalizeRole(userOrRole.viewerScope || userOrRole.viewer_scope || "admin");
    }
    return actualRole;
  }
  return normalizeRole(userOrRole);
}

export function isReadOnlyViewer(user) {
  return normalizeRole(user?.role) === "viewer";
}

export function getNavigationForRole(role) {
  const normalizedRole = getEffectiveRole(role);

  return NAV_ITEMS.filter(
    (item) =>
      item.roles.includes(normalizedRole) &&
      item.showInSidebar !== false
  );
}

export function getRoleHomePath(role) {
  const normalizedRole = getEffectiveRole(role);

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
