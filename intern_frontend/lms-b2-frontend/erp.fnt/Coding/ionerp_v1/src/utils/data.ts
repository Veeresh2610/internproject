export function getRoleType() {
  return ["ionems", "ionadmission", "iontransport", "main", "ionhostel"];
}

export function getRoleName(): any {
  return {
    ionems: "EMS",
    ionadmission: "Admission",
    iontransport: "Transport",
    ionhostel: "Hostel",
    main: "Main",
  };
}

export interface CardItem {
  name: string;
  url: string;
  iconName: string;
  keyname: string;
  description: string;
}

export const MainPageCards: CardItem[] = [
  {
    name: "EMS",
    url: "/",
    iconName: "ems",
    keyname: "ionems",
    description: "",
  },
  {
    name: "Admission",
    url: "/",
    iconName: "admission",
    keyname: "ionadmission",
    description: "",
  },
  {
    name: "Transport",
    url: "/",
    iconName: "transport",
    keyname: "iontransport",
    description: "",
  },
  {
    name: "Hostel",
    url: "/",
    iconName: "hostel",
    keyname: "ionhostel",
    description: "",
  },
  {
    name: "Mentor Mentee Program",
    url: "/mentoring",
    iconName: "mentoring",
    keyname: "main",
    description: "Manage configurations, mentors, and mentee assignments.",
  },
  {
    name: "Curriculum",
    url: "/curriculum",
    iconName: "curriculum",
    keyname: "main",
    description: "Manage student to course registration.",
  },
];
