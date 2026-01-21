// ============= User & Role Types =============
export type UserRole = "kam" | "supervisor" | "boss" | "super_admin";

export interface SystemUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  division: string;
  zone: string;
  reportingTo: string;
  role: UserRole;
  avatar?: string;
}

export interface KAM {
  id: string;
  userId: string;
  name: string;
  contact: string;
  email: string;
  address: string;
  reportingTo: string;
  division: string;
  zone: string;
  businessEntities: string[];
}

// ============= Client Types =============
export interface Client {
  id: string;
  name: string;
  businessEntities: string[];
  businessType: string;
  contact: string;
  phone: string;
  email: string;
  address: string;
  division: string;
  zone: string;
  assignedKamId: string | null;
  createdBy?: string;
  products?: string[];
  latitude?: number;
  longitude?: number;
  createdAt: string;
  updatedAt: string;
  licensed?: boolean; // <-- new property
}

// ============= Lead Types =============
export type LeadStatus = "pending_review" | "in_progress" | "on_hold" | "backlog" | "won" | "lost";
export type LeadStage = "new" | "contacted" | "qualified" | "proposal" | "negotiation" | "closed";
export type LeadSource = "direct" | "facebook" | "whatsapp" | "linkedin" | "instagram" | "website" | "phone";

export interface Lead {
  id: string;
  name: string;
  company: string;
  contact: string;
  email: string;
  phone: string;
  department: string;
  division: string;
  area: string;
  title: string;
  status: LeadStatus;
  stage: LeadStage;
  source?: LeadSource;
  assignedKamId: string | null;
  assignedKamName: string | null;
  expectedValue: number;
  notes: string;
  attachments: string[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  closedAt?: string; 
  denialReason?: string;
  closingReason?: string;
  clientId?: string;
  businessEntity?: string;
  products?: string[];
  assignedDate?: string;
}

// ============= Activity Types =============
export type ActivityType = "physical_meeting" | "virtual_meeting" | "call" | "email" | "task" | "follow_up";

export interface ActivityNote {
  id: string;
  activityId: string;
  content: string;
  attachments?: {
    name: string;
    type: string;
    url: string;
  }[];
  createdBy: string;
  createdByName: string;
  createdAt: string;
}

export interface Activity {
  id: string;
  clientId: string;
  type: ActivityType;
  title: string;
  description: string;
  address?: string | null;
  scheduledAt: string;
  completedAt: string | null;
  outcome: string | null;
  createdBy: string;
  notes?: ActivityNote[];
}

// ============= Notification Types =============
export type NotificationType = "lead_assigned" | "lead_queue" | "lead_status" | "meeting_reminder" | "system";

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  clientId: string;
  activityId?: string;
}

// ============= Audit Log Types =============
export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  actionType: "create" | "update" | "delete" | "login" | "logout";
  moduleName: string;
  description: string;
  oldValue?: string;
  newValue?: string;
  ipAddress: string;
  createdAt: string;
}

// ============= Sale Types =============
export interface Sale {
  id: string;
  businessEntityId: string;
  businessEntityName: string;
  clientId: string;
  product: string[];          // ✅ multi-product
  details: string;
  salesAmount: number;        // ✅ matches form
  closingDate: string;        // ✅ matches form
  kamId: string;
  createdAt: string;
}

// ============= Pipeline Configuration =============
export interface PipelineStage {
  id: string;
  name: string;
  order: number;
  color: string;
}

export const pipelineStages: PipelineStage[] = [
  { id: "new", name: "New", order: 1, color: "hsl(217, 91%, 60%)" },
  { id: "contacted", name: "Contacted", order: 2, color: "hsl(38, 92%, 50%)" },
  { id: "qualified", name: "Qualified", order: 3, color: "hsl(280, 65%, 60%)" },
  { id: "proposal", name: "Proposal", order: 4, color: "hsl(200, 80%, 50%)" },
  { id: "negotiation", name: "Negotiation", order: 5, color: "hsl(330, 80%, 60%)" },
  { id: "closed", name: "Closed", order: 6, color: "hsl(142, 76%, 36%)" },
];

export const leadSources: { value: LeadSource; label: string }[] = [
  { value: "direct", label: "Direct" },
  { value: "facebook", label: "Facebook" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "instagram", label: "Instagram" },
  { value: "website", label: "Website" },
  { value: "phone", label: "Phone Call" },
];

export const businessEntities = [
  "Earth Telecommunication Ltd.",
  "Race Online Ltd.",
  "Orbit Internet",
  "Dhaka COLO",
  "Creative Bangladesh",
];

export const divisions = [
  "Dhaka",
  "Chittagong",
  "Rajshahi",
  "Khulna",
  "Barishal",
  "Sylhet",
  "Rangpur",
  "Mymensingh",
];

export const zones = [
  "North",
  "South",
  "East",
  "West",
  "Central",
];

// Zone mapping by division
export const divisionZones: Record<string, string[]> = {
  "Dhaka": ["Mirpur", "Gulshan", "Uttara", "Dhanmondi", "Motijheel"],
  "Chittagong": ["Agrabad", "Nasirabad", "Halishahar", "Patenga", "Kotwali"],
  "Rajshahi": ["Boalia", "Motihar", "Rajpara", "Shah Makhdum", "Godagari"],
  "Khulna": ["Sonadanga", "Khalishpur", "Daulatpur", "Khan Jahan Ali", "Rupsa"],
  "Barishal": ["Kotwali", "Airport", "Kawnia", "Babuganj", "Banaripara"],
  "Sylhet": ["Kotwali", "South Surma", "Airport", "Jalalabad", "Moglabazar"],
  "Rangpur": ["Kotwali", "Mahiganj", "Tajhat", "Kaunia", "Pirganj"],
  "Mymensingh": ["Kotwali", "Mymensingh Sadar", "Bhaluka", "Trishal", "Gafargaon"],
};

export const businessTypes = [
  "Technology",
  "Software",
  "SaaS",
  "Retail",
  "Healthcare",
  "Finance",
  "Manufacturing",
  "Logistics",
  "Education",
];

export const products = [
  { id: "prod-1", name: "Enterprise Software License" },
  { id: "prod-2", name: "Cloud Platform Subscription" },
  { id: "prod-3", name: "Data Analytics Suite" },
  { id: "prod-4", name: "CRM System" },
  { id: "prod-5", name: "ERP Solution" },
  { id: "prod-6", name: "Security Suite" },
  { id: "prod-7", name: "Communication Tools" },
  { id: "prod-8", name: "Project Management" },
];

// ============= Mock Data =============
export const systemUsers: SystemUser[] = [
  {
    id: "user-1",
    name: "John Smith",
    email: "john.smith@company.com",
    phone: "+1 (555) 123-4567",
    address: "123 Main St, New York, NY 10001",
    division: "Dhaka",
    zone: "North",
    reportingTo: "Robert Wilson",
    role: "kam",
  },
  {
    id: "user-2",
    name: "Emily Davis",
    email: "emily.davis@company.com",
    phone: "+1 (555) 234-5678",
    address: "456 Oak Ave, Los Angeles, CA 90001",
    division: "Dhaka",
    zone: "West",
    reportingTo: "Robert Wilson",
    role: "kam",
  },
  {
    id: "user-3",
    name: "Robert Wilson",
    email: "robert.wilson@company.com",
    phone: "+1 (555) 345-6789",
    address: "789 Pine Rd, Chicago, IL 60601",
    division: "Chittagong",
    zone: "Central",
    reportingTo: "Sarah Johnson",
    role: "supervisor",
  },
  {
    id: "user-4",
    name: "Amanda Garcia",
    email: "amanda.garcia@company.com",
    phone: "+1 (555) 456-7890",
    address: "321 Elm St, Miami, FL 33101",
    division: "Chittagong",
    zone: "South",
    reportingTo: "David Brown",
    role: "kam",
  },
  {
    id: "user-5",
    name: "James Taylor",
    email: "james.taylor@company.com",
    phone: "+1 (555) 567-8901",
    address: "654 Maple Dr, Seattle, WA 98101",
    division: "Rajshahi",
    zone: "West",
    reportingTo: "Michael Chen",
    role: "kam",
  },
  {
    id: "user-6",
    name: "Sarah Johnson",
    email: "sarah.johnson@company.com",
    phone: "+1 (555) 678-9012",
    address: "987 Cedar Blvd, Boston, MA 02101",
    division: "Khulna",
    zone: "North",
    reportingTo: "David Brown",
    role: "boss",
  },
  {
    id: "user-7",
    name: "David Brown",
    email: "david.brown@company.com",
    phone: "+1 (555) 789-0123",
    address: "147 Birch Lane, San Francisco, CA 94101",
    division: "Mymensingh",
    zone: "All",
    reportingTo: "",
    role: "super_admin",
  },
];

export const initialKAMs: KAM[] = [
  {
    id: "kam-1",
    userId: "user-1",
    name: "John Smith",
    contact: "+1 (555) 123-4567",
    email: "john.smith@company.com",
    address: "123 Main St, New York, NY 10001",
    reportingTo: "Robert Wilson",
    division: "Dhaka",
    zone: "North",
    businessEntities: ["Earth Telecommunication Ltd.", "Race Online Ltd."],
  },
  {
    id: "kam-2",
    userId: "user-2",
    name: "Emily Davis",
    contact: "+1 (555) 234-5678",
    email: "emily.davis@company.com",
    address: "456 Oak Ave, Los Angeles, CA 90001",
    reportingTo: "Robert Wilson",
    division: "Chittagong",
    zone: "West",
    businessEntities: ["Orbit Internet", "Dhaka COLO"],
  },
  {
    id: "kam-3",
    userId: "user-8",
    name: "Ashiqur Rahman`",
    contact: "+1 (555) 123-4567",
    email: "john.smith@company.com",
    address: "123 Main St, New York, NY 10001",
    reportingTo: "Sorowar Hossain",
    division: "Dhaka",
    zone: "North",
    businessEntities: ["Earth Telecommunication Ltd.", "Race Online Ltd.", "Dhaka COLO"],
  },
  {
    id: "kam-4",
    userId: "user-9",
    name: "Rimon Ahmed",
    contact: "+1 (555) 123-4567",
    email: "john.smith@company.com",
    address: "123 Main St, New York, NY 10001",
    reportingTo: "Sorowar Hossain",
    division: "Chittagong",
    zone: "North",
    businessEntities: ["Earth Telecommunication Ltd.", "Race Online Ltd.", "Dhaka COLO", "Ocloud"],
  },
];

export const initialClients: Client[] = [
  {
    id: "client-1",
    name: "Tech Corporation",
    businessEntities: ["Earth Telecommunication Ltd."],
    businessType: "Technology",
    contact: "Michael Roberts",
    phone: "+1 (555) 111-2222",
    email: "m.roberts@techcorp.com",
    address: "100 Tech Blvd, New York, NY 10001",
    division: "Dhaka",
    zone: "North",
    assignedKamId: "kam-1",
    createdBy: "kam-1",
    products: ["Enterprise Software License", "Cloud Platform Subscription"],
    latitude: 40.7128,
    longitude: -74.006,
    createdAt: "2024-01-01T10:00:00Z",
    updatedAt: "2024-01-01T10:00:00Z",
    licensed: true, // licensed
  },
  {
    id: "client-2",
    name: "Global Systems Inc",
    businessEntities: ["Race Online Ltd.", "Orbit Internet"],
    businessType: "Software",
    contact: "Jennifer Lee",
    phone: "+1 (555) 333-4444",
    email: "j.lee@globalsys.com",
    address: "200 Global Ave, Los Angeles, CA 90001",
    division: "Chittagong",
    zone: "West",
    assignedKamId: "kam-2",
    createdBy: "kam-2",
    products: ["CRM System", "Security Suite", "Communication Tools"],
    latitude: 34.0522,
    longitude: -118.2437,
    createdAt: "2024-01-02T10:00:00Z",
    updatedAt: "2024-01-02T10:00:00Z",
    licensed: false, // unlicensed
  },
  {
    id: "client-3",
    name: "StartupXYZ",
    businessEntities: ["Dhaka COLO"],
    businessType: "SaaS",
    contact: "Alex Thompson",
    phone: "+1 (555) 555-6666",
    email: "alex@startupxyz.io",
    address: "300 Innovation St, San Francisco, CA 94101",
    division: "Dhaka",
    zone: "West",
    assignedKamId: "kam-1",
    createdBy: "kam-1",
    products: ["Data Analytics Suite", "Project Management"],
    createdAt: "2024-01-05T10:00:00Z",
    updatedAt: "2024-01-05T10:00:00Z",
    licensed: false, // unlicensed
  },
  {
    id: "client-4",
    name: "EduTech Academy",
    businessEntities: ["Orbit Internet"],
    businessType: "Education",
    contact: "Dr. James Wright",
    phone: "+1 (555) 999-0000",
    email: "j.wright@edutech.edu",
    address: "400 Learning St, Austin, TX 73301",
    division: "Sylhet",
    zone: "South",
    assignedKamId: "kam-2",
    createdBy: "kam-2",
    products: ["Learning Management Platform"],
    createdAt: "2024-01-06T10:00:00Z",
    updatedAt: "2024-01-06T10:00:00Z",
    licensed: false, // unlicensed
  },
  {
    id: "client-5",
    name: "FreshFoods Co",
    businessEntities: ["Dhaka COLO"],
    businessType: "Retail",
    contact: "Maria Santos",
    phone: "+1 (555) 111-0000",
    email: "m.santos@freshfoods.com",
    address: "500 Supply St, Phoenix, AZ 85001",
    division: "Barishal",
    zone: "Central",
    assignedKamId: "kam-1",
    createdBy: "kam-1",
    products: ["Supply Chain Management Suite"],
    createdAt: "2024-01-07T10:00:00Z",
    updatedAt: "2024-01-07T10:00:00Z",
    licensed: false, // unlicensed
  },
];

export const getClientsByLicense = (clients: Client[], licensed: boolean): Client[] => {
  return clients.filter(client => client.licensed === licensed);
};


// export const initialClients: Client[] = [
//   {
//     id: "client-1",
//     name: "Tech Corporation",
//     businessEntities: ["Earth Telecommunication Ltd."],
//     businessType: "Technology",
//     contact: "Michael Roberts",
//     phone: "+1 (555) 111-2222",
//     email: "m.roberts@techcorp.com",
//     address: "100 Tech Blvd, New York, NY 10001",
//     division: "Dhaka",
//     zone: "North",
//     assignedKamId: "kam-1",
//     createdBy: "kam-1",
//     products: ["Enterprise Software License", "Cloud Platform Subscription"],
//     latitude: 40.7128,
//     longitude: -74.006,
//     createdAt: "2024-01-01T10:00:00Z",
//     updatedAt: "2024-01-01T10:00:00Z",
//   },
//   {
//     id: "client-2",
//     name: "Global Systems Inc",
//     businessEntities: ["Race Online Ltd.", "Orbit Internet"],
//     businessType: "Software",
//     contact: "Jennifer Lee",
//     phone: "+1 (555) 333-4444",
//     email: "j.lee@globalsys.com",
//     address: "200 Global Ave, Los Angeles, CA 90001",
//     division: "Chittagong",
//     zone: "West",
//     assignedKamId: "kam-2",
//     createdBy: "kam-2",
//     products: ["CRM System", "Security Suite", "Communication Tools"],
//     latitude: 34.0522,
//     longitude: -118.2437,
//     createdAt: "2024-01-02T10:00:00Z",
//     updatedAt: "2024-01-02T10:00:00Z",
//   },
//   {
//     id: "client-3",
//     name: "StartupXYZ",
//     businessEntities: ["Dhaka COLO"],
//     businessType: "SaaS",
//     contact: "Alex Thompson",
//     phone: "+1 (555) 555-6666",
//     email: "alex@startupxyz.io",
//     address: "300 Innovation St, San Francisco, CA 94101",
//     division: "Dhaka",
//     zone: "West",
//     assignedKamId: "kam-1",
//     createdBy: "kam-1",
//     products: ["Data Analytics Suite", "Project Management"],
//     createdAt: "2024-01-05T10:00:00Z",
//     updatedAt: "2024-01-05T10:00:00Z",
//   },
// ];

export const initialLeads: Lead[] = [
  {
    id: "lead-1",
    name: "Tech Corp Deal",
    company: "Tech Corporation",
    contact: "Michael Roberts",
    email: "m.roberts@techcorp.com",
    phone: "+1 (555) 111-2222",
    department: "IT",
    division: "Dhaka",
    area: "New York",
    title: "Enterprise Software License",
    status: "in_progress",
    stage: "proposal",
    source: "direct",
    assignedKamId: "kam-1",
    assignedKamName: "John Smith",
    expectedValue: 150000,
    notes: "Large enterprise deal, decision expected Q1",
    attachments: [],
    createdBy: "user-1",
    createdAt: "2025-01-15T10:00:00Z",
    updatedAt: "2025-01-20T14:30:00Z",
    closedAt: '2025-12-05T12:00:00Z',
    clientId: "client-1",
  },
  {
    id: "lead-2",
    name: "Global Systems Contract",
    company: "Global Systems Inc",
    contact: "Jennifer Lee",
    email: "j.lee@globalsys.com",
    phone: "+1 (555) 222-3333",
    department: "Operations",
    division: "Chittagong",
    area: "Los Angeles",
    title: "Annual Maintenance Contract",
    status: "in_progress",
    stage: "negotiation",
    source: "linkedin",
    assignedKamId: "kam-2",
    assignedKamName: "Emily Davis",
    expectedValue: 85000,
    notes: "Renewal with expansion potential",
    attachments: [],
    createdBy: "user-2",
    createdAt: "2025-01-10T09:00:00Z",
    updatedAt: "2025-01-22T11:00:00Z",
    closedAt: '2025-12-06T14:00:00Z',
    clientId: "client-2",
  },
  {
    id: "lead-3",
    name: "StartupXYZ Platform",
    company: "StartupXYZ",
    contact: "Alex Thompson",
    email: "alex@startupxyz.io",
    phone: "+1 (555) 333-4444",
    department: "Product",
    division: "Chittagong",
    area: "San Francisco",
    title: "SaaS Platform Subscription",
    status: "in_progress",
    stage: "qualified",
    source: "website",
    assignedKamId: "kam-1",
    assignedKamName: "John Smith",
    expectedValue: 24000,
    notes: "Fast-growing startup, high potential",
    attachments: [],
    createdBy: "user-1",
    createdAt: "2025-02-18T14:00:00Z",
    updatedAt: "2025-02-21T16:00:00Z",
    closedAt: undefined,
    clientId: "client-3",
  },
  {
    id: "lead-4",
    name: "Bandiwidth Solutions",
    company: "Shornolota",
    contact: "Patricia Wang",
    email: "p.wang@metrobank.com",
    phone: "+1 (555) 444-5555",
    department: "Finance",
    division: "Khulna",
    area: "Chicago",
    title: "Network Infrastructure Upgrade",
    status: "pending_review",
    stage: "new",
    source: "phone",
    assignedKamId: null,
    assignedKamName: null,
    expectedValue: 320000,
    notes: "Submitted by helpdesk, awaiting review",
    attachments: [],
    createdBy: "user-4",
    createdAt: "2025-12-24T08:00:00Z",
    updatedAt: "2025-12-24T08:00:00Z",
    closedAt: undefined,
  },
  {
    id: "lead-8",
    name: "AutoParts Distribution",
    company: "AutoParts Inc",
    contact: "Linda Chen",
    email: "l.chen@autoparts.com",
    phone: "+1 (555) 888-9999",
    department: "Procurement",
    division: "Mymensingh",
    area: "Detroit",
    title: "Inventory Management System",
    status: "won",
    stage: "new",
    source: "facebook",
    assignedKamId: null,
    assignedKamName: null,
    expectedValue: 78000,
    notes: "Submitted by helpdesk, needs inventory tracking solution",
    attachments: [],
    createdBy: "user-4",
    createdAt: "2025-05-24T09:30:00Z",
    updatedAt: "2025-05-24T09:30:00Z",
    closedAt: "2025-06-07T09:30:00Z",
  },
  {
    id: "lead-9",
    name: "EduTech Academy",
    company: "EduTech Solutions",
    contact: "Dr. James Wright",
    email: "j.wright@edutech.edu",
    phone: "+1 (555) 999-0000",
    department: "IT Administration",
    division: "Barishal",
    area: "Austin",
    title: "Learning Management Platform",
    status: "pending_review",
    stage: "new",
    source: "whatsapp",
    assignedKamId: null,
    assignedKamName: null,
    expectedValue: 125000,
    notes: "Submitted by helpdesk, university looking for LMS",
    attachments: [],
    createdBy: "user-4",
    createdAt: "2024-01-24T11:00:00Z",
    updatedAt: "2024-01-24T11:00:00Z",
    closedAt: '2025-07-06T14:00:00Z',
  },
  {
    id: "lead-10",
    name: "FreshFoods Supply Chain",
    company: "FreshFoods Co",
    contact: "Maria Santos",
    email: "m.santos@freshfoods.com",
    phone: "+1 (555) 111-0000",
    department: "Operations",
    division: "Dhaka",
    area: "Phoenix",
    title: "Supply Chain Management Suite",
    status: "pending_review",
    stage: "new",
    source: "instagram",
    assignedKamId: null,
    assignedKamName: null,
    expectedValue: 245000,
    notes: "Submitted by helpdesk, large food distributor",
    attachments: [],
    createdBy: "user-4",
    createdAt: "2024-01-24T14:15:00Z",
    updatedAt: "2024-01-24T14:15:00Z",
    closedAt: '2025-01-06T14:00:00Z',
  },
  {
    id: "lead-11",
    name: "SecureNet Insurance",
    company: "SecureNet Group",
    contact: "Thomas Baker",
    email: "t.baker@securenet.com",
    phone: "+1 (555) 222-0000",
    department: "Claims",
    division: "Sylhet",
    area: "Hartford",
    title: "Claims Processing Automation",
    status: "pending_review",
    stage: "new",
    source: "website",
    assignedKamId: null,
    assignedKamName: null,
    expectedValue: 380000,
    notes: "Submitted by helpdesk, insurance company needs claims automation",
    attachments: [],
    createdBy: "user-4",
    createdAt: "2024-01-24T16:00:00Z",
    updatedAt: "2024-01-24T16:00:00Z",
    closedAt: '2025-03-04T14:00:00Z',
  },
  {
    id: "lead-5",
    name: "Retail Plus Expansion",
    company: "Retail Plus",
    contact: "Kevin Martinez",
    email: "k.martinez@retailplus.com",
    phone: "+1 (555) 555-6666",
    department: "Sales",
    division: "Mymensingh",
    area: "Miami",
    title: "POS System Upgrade",
    status: "in_progress",
    stage: "contacted",
    source: "direct",
    assignedKamId: "kam-2",
    assignedKamName: "Emily Davis",
    expectedValue: 45000,
    notes: "Initial contact made, scheduling demo",
    attachments: [],
    createdBy: "user-2",
    createdAt: "2024-01-19T11:00:00Z",
    updatedAt: "2024-01-22T09:00:00Z",
    closedAt: '2025-09-09T14:00:00Z',
  },
  {
    id: "lead-6",
    name: "Healthcare Solutions",
    company: "MedTech Solutions",
    contact: "Dr. Susan Clark",
    email: "s.clark@medtech.com",
    phone: "+1 (555) 666-7777",
    department: "Healthcare IT",
    division: "Enterprise",
    area: "Boston",
    title: "EMR System Implementation",
    status: "won",
    stage: "closed",
    source: "linkedin",
    assignedKamId: "kam-1",
    assignedKamName: "John Smith",
    expectedValue: 275000,
    notes: "Contract signed, implementation starting",
    attachments: [],
    createdBy: "user-1",
    createdAt: "2024-01-05T10:00:00Z",
    updatedAt: "2024-01-20T15:00:00Z",
    closedAt: '2025-08-05T14:00:00Z',
  },
  {
    id: "lead-20",
    name: "Cloud Storage",
    company: "dataSafe Inc",
    contact: "Dr. Susan Clark",
    email: "s.clark@medtech.com",
    phone: "+8801903421904",
    department: "Healthcare IT",
    division: "Dhaka",
    area: "Gulshan",
    title: "Cloud Storage Solution",
    status: "won",
    stage: "closed",
    source: "whatsapp",
    assignedKamId: "kam-3",
    assignedKamName: "Rimon Ahmed",
    expectedValue: 275000,
    notes: "Contract signed, implementation starting",
    attachments: [],
    createdBy: "user-1",
    createdAt: "2025-10-05T10:00:00Z",
    updatedAt: "2025-10-20T15:00:00Z",
    closedAt: '2025-11-05T14:00:00Z',
  },
  {
    id: "lead-7",
    name: "Logistics Pro Deal",
    company: "Logistics Pro",
    contact: "Mark Anderson",
    email: "m.anderson@logisticspro.com",
    phone: "+1 (555) 777-8888",
    department: "Operations",
    division: "Mid-Market",
    area: "Dallas",
    title: "Fleet Management Software",
    status: "lost",
    stage: "closed",
    source: "phone",
    assignedKamId: "kam-2",
    assignedKamName: "Emily Davis",
    expectedValue: 62000,
    notes: "Lost to competitor",
    closingReason: "Competitor offered lower price with similar features",
    attachments: [],
    createdBy: "user-2",
    createdAt: "2024-01-08T09:00:00Z",
    updatedAt: "2024-01-19T14:00:00Z",
    closedAt: '2025-10-10T14:00:00Z',
  },
];

export const initialActivities: Activity[] = [
  {
    id: "act-1",
   clientId: "client-1",
    type: "physical_meeting",
    title: "On-site Product Demo",
    address: "Dhaka",
    description: "Present enterprise features to IT team",
    scheduledAt: "2025-12-17T10:00:00Z",
    completedAt: null,
    outcome: null,
    createdBy: "user-1",
  },
  {
    id: "act-2",
    clientId: "client-2",
    type: "virtual_meeting",
    title: "Contract Review Call",
    description: "Review contract terms with legal team",
    scheduledAt: "2025-12-17T14:00:00Z",
    completedAt: null,
    outcome: null,
    createdBy: "user-2",
  },
  {
    id: "act-3",
    clientId: "client-3",
    type: "call",
    title: "Discovery Call",
    description: "Initial requirements gathering",
    scheduledAt: "2025-12-16T11:00:00Z",
    completedAt: "2025-12-16T11:45:00Z",
    outcome: "Identified key pain points. Scheduling follow-up demo.",
    createdBy: "user-1",
  },
  {
    id: "act-4",
    clientId: "client-5",
    type: "email",
    title: "Product Brochure Sent",
    description: "Sent detailed product specifications",
    scheduledAt: "2025-12-15T09:00:00Z",
    completedAt: "2025-12-15T09:15:00Z",
    outcome: "Client acknowledged receipt, reviewing internally",
    createdBy: "user-2",
  },
  {
    id: "act-5",
    clientId: "client-1",
    type: "follow_up",
    title: "Post-Demo Follow-up",
    description: "Check on decision progress",
    scheduledAt: "2025-12-20T15:00:00Z",
    completedAt: null,
    outcome: null,
    createdBy: "user-1",
  },
  {
    id: "act-6",
    clientId: "client-2",
    type: "task",
    title: "Prepare Proposal",
    description: "Draft contract proposal with pricing",
    scheduledAt: "2025-12-18T09:00:00Z",
    completedAt: null,
    outcome: null,
    createdBy: "user-2",
  },
  // Additional activities for supervisor (user-3)
  {
    id: "act-7",
    clientId: "client-1",
    type: "virtual_meeting",
    title: "Weekly Team Sync",
    description: "Review team progress and KPIs",
    scheduledAt: "2025-12-17T09:00:00Z",
    completedAt: null,
    outcome: null,
    createdBy: "user-3",
  },
  {
    id: "act-8",
    clientId: "client-2",
    type: "physical_meeting",
    title: "Client Site Visit - Global Systems",
     address: "Chittagong",
    description: "Meet with procurement team for contract finalization",
    scheduledAt: "2025-12-18T14:00:00Z",
    completedAt: null,
    outcome: null,
    createdBy: "user-3",
  },
  {
    id: "act-9",
    clientId: "client-3",
    type: "call",
    title: "Partner Strategy Call",
    description: "Discuss partnership expansion opportunities",
    scheduledAt: "2025-12-19T10:30:00Z",
    completedAt: null,
    outcome: null,
    createdBy: "user-3",
  },
  {
    id: "act-10",
    clientId: "client-1",
    type: "task",
    title: "Q4 Performance Review",
    description: "Complete quarterly performance assessments for team",
    scheduledAt: "2025-12-20T11:00:00Z",
    completedAt: null,
    outcome: null,
    createdBy: "user-3",
  },
  {
    id: "act-11",
    clientId: "client-5",
    type: "virtual_meeting",
    title: "Board Presentation Prep",
    description: "Prepare slides for quarterly board meeting",
    scheduledAt: "2025-12-17T16:00:00Z",
    completedAt: null,
    outcome: null,
    createdBy: "user-3",
  },
  {
    id: "act-12",
    clientId: "client-2",
    type: "email",
    title: "Send Monthly Newsletter",
    description: "Distribute team newsletter with updates",
    scheduledAt: "2025-12-18T08:00:00Z",
    completedAt: null,
    outcome: null,
    createdBy: "user-3",
  },
  {
    id: "act-13",
    clientId: "client-1",
    type: "follow_up",
    title: "Check Deal Pipeline Status",
    description: "Review and update deal pipeline for month-end",
    scheduledAt: "2025-12-19T14:00:00Z",
    completedAt: null,
    outcome: null,
    createdBy: "user-3",
  },
  {
    id: "act-14",
    clientId: "client-2",
    type: "physical_meeting",
    title: "Lunch with Enterprise Client",
     address: "Gulshan",
    description: "Relationship building meeting with key stakeholder",
    scheduledAt: "2025-12-21T12:30:00Z",
    completedAt: null,
    outcome: null,
    createdBy: "user-3",
  },
];

export const initialNotifications: Notification[] = [
  {
    id: "notif-1",
    userId: "user-1",
    type: "lead_assigned",
    title: "New Lead Assigned",
    message: "You have been assigned a new lead: Tech Corp Deal",
    read: false,
    createdAt: "2024-01-24T10:00:00Z",
    clientId: "client-1",
  },
  {
    id: "notif-2",
    userId: "user-5",
    type: "lead_queue",
    title: "New Lead in Queue",
    message: "A new lead has been submitted by helpdesk: Metro Bank Services",
    read: false,
    createdAt: "2024-01-23T08:00:00Z",
    clientId: "client-4",
  },
  {
    id: "notif-3",
    userId: "user-3",
    type: "lead_status",
    title: "Lead Status Updated",
    message: "Lead 'Global Systems Contract' moved to Negotiation stage",
    read: true,
    createdAt: "2024-01-22T11:00:00Z",
    clientId: "client-2",
  },
  {
    id: "notif-4",
    userId: "user-1",
    clientId: "client-1",
    type: "meeting_reminder",
    title: "Meeting Reminder",
    message: "On-site Product Demo with Tech Corporation in 1 hour",
    read: false,
    createdAt: "2024-01-25T09:00:00Z",
    activityId: "act-1",
  },
];

export const initialAuditLogs: AuditLog[] = [
  {
    id: "log-1",
    userId: "user-1",
    userName: "John Smith",
    actionType: "create",
    moduleName: "Lead",
    description: "Created new lead: Tech Corp Deal",
    ipAddress: "192.168.1.100",
    createdAt: "2024-01-15T10:00:00Z",
  },
  {
    id: "log-2",
    userId: "user-4",
    userName: "Amanda Garcia",
    actionType: "create",
    moduleName: "Lead",
    description: "Created lead request: Metro Bank Services",
    ipAddress: "192.168.1.105",
    createdAt: "2024-01-23T08:00:00Z",
  },
  {
    id: "log-3",
    userId: "user-5",
    userName: "James Taylor",
    actionType: "update",
    moduleName: "Lead",
    description: "Assigned lead to KAM: John Smith",
    oldValue: "Unassigned",
    newValue: "John Smith",
    ipAddress: "192.168.1.110",
    createdAt: "2024-01-23T09:00:00Z",
  },
  {
    id: "log-4",
    userId: "user-7",
    userName: "David Brown",
    actionType: "login",
    moduleName: "Auth",
    description: "User logged in",
    ipAddress: "192.168.1.1",
    createdAt: "2024-01-24T08:00:00Z",
  },
];


// ============= Mock Sales Data =============
export const initialSales: Sale[] = [
  // January 2026
  {
    id: "sale-1",
    businessEntityId: "Earth Telecommunication Ltd.",
    businessEntityName: "Earth Telecommunication Ltd.",
    clientId: "client-1",
    product: ["Enterprise Software License"],
    details: "Large enterprise deal",
    salesAmount: 180000,
    closingDate: "2026-01-05",
    kamId: "kam-1",
    createdAt: "2026-01-05T12:00:00Z",
  },
  {
    id: "sale-2",
    businessEntityId: "Race Online Ltd.",
    businessEntityName: "Race Online Ltd.",
    clientId: "client-2",
    product: ["CRM System", "Security Suite"],
    details: "Expansion contract",
    salesAmount: 95000,
    closingDate: "2026-01-08",
    kamId: "kam-2",
    createdAt: "2026-01-08T14:00:00Z",
  },
  {
    id: "sale-3",
    businessEntityId: "Dhaka COLO",
    businessEntityName: "Dhaka COLO",
    clientId: "client-3",
    product: ["Cloud Platform Subscription"],
    details: "New client onboarding",
    salesAmount: 120000,
    closingDate: "2026-01-10",
    kamId: "kam-3",
    createdAt: "2026-01-10T09:00:00Z",
  },
  {
    id: "sale-4",
    businessEntityId: "Orbit Internet",
    businessEntityName: "Orbit Internet",
    clientId: "client-4",
    product: ["Data Analytics Suite"],
    details: "Analytics implementation",
    salesAmount: 75000,
    closingDate: "2026-01-12",
    kamId: "kam-4",
    createdAt: "2026-01-12T11:00:00Z",
  },
  // December 2025
  {
    id: "sale-5",
    businessEntityId: "Earth Telecommunication Ltd.",
    businessEntityName: "Earth Telecommunication Ltd.",
    clientId: "client-1",
    product: ["Enterprise Software License"],
    details: "Q4 deal closure",
    salesAmount: 150000,
    closingDate: "2025-12-05",
    kamId: "kam-1",
    createdAt: "2025-12-05T12:00:00Z",
  },
  {
    id: "sale-6",
    businessEntityId: "Race Online Ltd.",
    businessEntityName: "Race Online Ltd.",
    clientId: "client-2",
    product: ["Security Suite"],
    details: "Security upgrade",
    salesAmount: 85000,
    closingDate: "2025-12-10",
    kamId: "kam-2",
    createdAt: "2025-12-10T14:00:00Z",
  },
  {
    id: "sale-7",
    businessEntityId: "Dhaka COLO",
    businessEntityName: "Dhaka COLO",
    clientId: "client-3",
    product: ["Cloud Platform Subscription"],
    details: "Renewal contract",
    salesAmount: 95000,
    closingDate: "2025-12-15",
    kamId: "kam-3",
    createdAt: "2025-12-15T09:00:00Z",
  },
  {
    id: "sale-8",
    businessEntityId: "Orbit Internet",
    businessEntityName: "Orbit Internet",
    clientId: "client-4",
    product: ["Communication Tools"],
    details: "Communication suite",
    salesAmount: 55000,
    closingDate: "2025-12-18",
    kamId: "kam-4",
    createdAt: "2025-12-18T11:00:00Z",
  },
  // November 2025
  {
    id: "sale-10",
    businessEntityId: "Earth Telecommunication Ltd.",
    businessEntityName: "Earth Telecommunication Ltd.",
    clientId: "client-1",
    product: ["Data Analytics Suite"],
    details: "Analytics add-on",
    salesAmount: 130000,
    closingDate: "2025-11-08",
    kamId: "kam-1",
    createdAt: "2025-11-08T12:00:00Z",
  },
  {
    id: "sale-11",
    businessEntityId: "Race Online Ltd.",
    businessEntityName: "Race Online Ltd.",
    clientId: "client-2",
    product: ["CRM System"],
    details: "CRM expansion",
    salesAmount: 72000,
    closingDate: "2025-11-12",
    kamId: "kam-2",
    createdAt: "2025-11-12T14:00:00Z",
  },
  {
    id: "sale-12",
    businessEntityId: "Dhaka COLO",
    businessEntityName: "Dhaka COLO",
    clientId: "client-3",
    product: ["ERP Solution"],
    details: "ERP implementation",
    salesAmount: 110000,
    closingDate: "2025-11-18",
    kamId: "kam-3",
    createdAt: "2025-11-18T09:00:00Z",
  },
  {
    id: "sale-13",
    businessEntityId: "Orbit Internet",
    businessEntityName: "Orbit Internet",
    clientId: "client-4",
    product: ["Security Suite"],
    details: "Security package",
    salesAmount: 62000,
    closingDate: "2025-11-22",
    kamId: "kam-4",
    createdAt: "2025-11-22T11:00:00Z",
  },
  // October 2025
  {
    id: "sale-14",
    businessEntityId: "Earth Telecommunication Ltd.",
    businessEntityName: "Earth Telecommunication Ltd.",
    clientId: "client-1",
    product: ["Cloud Platform Subscription"],
    details: "Cloud migration",
    salesAmount: 165000,
    closingDate: "2025-10-05",
    kamId: "kam-1",
    createdAt: "2025-10-05T12:00:00Z",
  },
  {
    id: "sale-15",
    businessEntityId: "Race Online Ltd.",
    businessEntityName: "Race Online Ltd.",
    clientId: "client-2",
    product: ["Enterprise Software License"],
    details: "License renewal",
    salesAmount: 88000,
    closingDate: "2025-10-10",
    kamId: "kam-2",
    createdAt: "2025-10-10T14:00:00Z",
  },
  {
    id: "sale-16",
    businessEntityId: "Dhaka COLO",
    businessEntityName: "Dhaka COLO",
    clientId: "client-3",
    product: ["Data Analytics Suite"],
    details: "Analytics setup",
    salesAmount: 85000,
    closingDate: "2025-10-15",
    kamId: "kam-3",
    createdAt: "2025-10-15T09:00:00Z",
  },
  // September 2025
  {
    id: "sale-18",
    businessEntityId: "Earth Telecommunication Ltd.",
    businessEntityName: "Earth Telecommunication Ltd.",
    clientId: "client-1",
    product: ["Security Suite"],
    details: "Security implementation",
    salesAmount: 142000,
    closingDate: "2025-09-08",
    kamId: "kam-1",
    createdAt: "2025-09-08T12:00:00Z",
  },
  {
    id: "sale-19",
    businessEntityId: "Race Online Ltd.",
    businessEntityName: "Race Online Ltd.",
    clientId: "client-2",
    product: ["Project Management"],
    details: "PM tools",
    salesAmount: 68000,
    closingDate: "2025-09-12",
    kamId: "kam-2",
    createdAt: "2025-09-12T14:00:00Z",
  },
  {
    id: "sale-20",
    businessEntityId: "Dhaka COLO",
    businessEntityName: "Dhaka COLO",
    clientId: "client-3",
    product: ["CRM System"],
    details: "CRM setup",
    salesAmount: 78000,
    closingDate: "2025-09-18",
    kamId: "kam-3",
    createdAt: "2025-09-18T09:00:00Z",
  },
  {
    id: "sale-21",
    businessEntityId: "Orbit Internet",
    businessEntityName: "Orbit Internet",
    clientId: "client-4",
    product: ["Cloud Platform Subscription"],
    details: "Cloud services",
    salesAmount: 52000,
    closingDate: "2025-09-22",
    kamId: "kam-4",
    createdAt: "2025-09-22T11:00:00Z",
  },
  // August 2025
  {
    id: "sale-22",
    businessEntityId: "Earth Telecommunication Ltd.",
    businessEntityName: "Earth Telecommunication Ltd.",
    clientId: "client-1",
    product: ["ERP Solution"],
    details: "ERP upgrade",
    salesAmount: 175000,
    closingDate: "2025-08-05",
    kamId: "kam-1",
    createdAt: "2025-08-05T12:00:00Z",
  },
  {
    id: "sale-23",
    businessEntityId: "Race Online Ltd.",
    businessEntityName: "Race Online Ltd.",
    clientId: "client-2",
    product: ["Data Analytics Suite"],
    details: "Analytics platform",
    salesAmount: 92000,
    closingDate: "2025-08-10",
    kamId: "kam-2",
    createdAt: "2025-08-10T14:00:00Z",
  },
  {
    id: "sale-24",
    businessEntityId: "Dhaka COLO",
    businessEntityName: "Dhaka COLO",
    clientId: "client-3",
    product: ["Security Suite"],
    details: "Security package",
    salesAmount: 65000,
    closingDate: "2025-08-15",
    kamId: "kam-3",
    createdAt: "2025-08-15T09:00:00Z",
  },
];

// ============= Target Types & Data =============
export interface Target {
  id: string;
  kamId: string;
  month: string; // Format: "January 2026"
  revenueTarget: number;
  clientTarget: number;
}

export const initialTargets: Target[] = [
  // January 2026 (current month based on date 2026-01-15)
  { id: "target-1", kamId: "kam-1", month: "January 2026", revenueTarget: 500000, clientTarget: 5 },
  { id: "target-2", kamId: "kam-2", month: "January 2026", revenueTarget: 450000, clientTarget: 4 },
  { id: "target-3", kamId: "kam-3", month: "January 2026", revenueTarget: 400000, clientTarget: 4 },
  { id: "target-4", kamId: "kam-4", month: "January 2026", revenueTarget: 350000, clientTarget: 3 },
  // December 2025 (last month)
  { id: "target-6", kamId: "kam-1", month: "December 2025", revenueTarget: 600000, clientTarget: 6 },
  { id: "target-7", kamId: "kam-2", month: "December 2025", revenueTarget: 500000, clientTarget: 5 },
  { id: "target-8", kamId: "kam-3", month: "December 2025", revenueTarget: 450000, clientTarget: 4 },
  { id: "target-9", kamId: "kam-4", month: "December 2025", revenueTarget: 400000, clientTarget: 3 },
];

// ============= Helper Functions =============
export const getLeadsByStage = (leads: Lead[], stage: LeadStage): Lead[] => {
  return leads.filter((lead) => lead.stage === stage);
};

export const getLeadsByStatus = (leads: Lead[], status: LeadStatus): Lead[] => {
  return leads.filter((lead) => lead.status === status);
};

export const getActivitiesByClient = (activities: Activity[], clientId: string): Activity[] => {
  return activities.filter((activity) => activity.clientId === clientId);
};

export const getUpcomingActivities = (activities: Activity[]): Activity[] => {
  const now = new Date();
  return activities
    .filter((activity) => new Date(activity.scheduledAt) > now && !activity.completedAt)
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
};

export const formatCurrency = (value: number): string => {
  return '৳' + new Intl.NumberFormat("en-BD", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const formatDateTime = (dateString: string): string => {
  return new Date(dateString).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const formatTime = (dateString: string): string => {
  return new Date(dateString).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
};
// ============= Report Helpers =============

// Total expected value by KAM
export const getExpectedValueByKAM = (leads: Lead[], kamId: string): number => {
  return leads
    .filter(lead => lead.assignedKamId === kamId)
    .reduce((sum, lead) => sum + lead.expectedValue, 0);
};

// Leads count by status
export const getLeadCountByStatus = (leads: Lead[]): Record<LeadStatus, number> => {
  return leads.reduce((acc, lead) => {
    acc[lead.status] = (acc[lead.status] || 0) + 1;
    return acc;
  }, {} as Record<LeadStatus, number>);
};

// Leads count by stage
export const getLeadCountByStage = (leads: Lead[]): Record<LeadStage, number> => {
  return leads.reduce((acc, lead) => {
    acc[lead.stage] = (acc[lead.stage] || 0) + 1;
    return acc;
  }, {} as Record<LeadStage, number>);
};

// Client licensing report
export const getClientLicenseReport = (clients: Client[]): { licensed: number; unlicensed: number } => {
  const licensed = clients.filter(c => c.licensed).length;
  const unlicensed = clients.filter(c => !c.licensed).length;
  return { licensed, unlicensed };
};

// Leads by division
export const getLeadsByDivision = (leads: Lead[]): Record<string, Lead[]> => {
  return leads.reduce((acc, lead) => {
    if (!acc[lead.division]) acc[lead.division] = [];
    acc[lead.division].push(lead);
    return acc;
  }, {} as Record<string, Lead[]>);
};

// Leads by source
export const getLeadsBySource = (leads: Lead[]): Record<LeadSource, Lead[]> => {
  return leads.reduce((acc, lead) => {
    if (lead.source) {
      if (!acc[lead.source]) acc[lead.source] = [];
      acc[lead.source].push(lead);
    }
    return acc;
  }, {} as Record<LeadSource, Lead[]>);
};

// Top KAM by expected value
export const getTopKAMByExpectedValue = (leads: Lead[], kams: KAM[]): { kam: KAM; totalValue: number } | null => {
  const kamTotals = kams.map(kam => ({
    kam,
    totalValue: getExpectedValueByKAM(leads, kam.id),
  }));
  kamTotals.sort((a, b) => b.totalValue - a.totalValue);
  return kamTotals[0]?.totalValue ? kamTotals[0] : null;
};

// ============= Sales Report Helpers =============

// Total sales by KAM
export const getTotalSalesByKAM = (
  sales: Sale[],
  kamId: string
): number => {
  return sales
    .filter(sale => sale.kamId === kamId)
    .reduce((sum, sale) => sum + sale.salesAmount, 0);
};

// Total sales by Client
export const getTotalSalesByClient = (
  sales: Sale[],
  clientId: string
): number => {
  return sales
    .filter(sale => sale.clientId === clientId)
    .reduce((sum, sale) => sum + sale.salesAmount, 0);
};

// Sales count by Product
export const getSalesCountByProduct = (
  sales: Sale[]
): Record<string, number> => {
  return sales.reduce((acc, sale) => {
    sale.product.forEach((p) => {
      acc[p] = (acc[p] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>);
};

// ✅ Total sales amount by Product (FIXED)
export const getSalesAmountByProduct = (
  sales: Sale[]
): Record<string, number> => {
  return sales.reduce((acc, sale) => {
    sale.product.forEach((p) => {
      acc[p] = (acc[p] || 0) + sale.salesAmount;
    });
    return acc;
  }, {} as Record<string, number>);
};

// Top-selling product by revenue
export const getTopProductByRevenue = (
  sales: Sale[]
): { product: string; totalAmount: number } | null => {
  const salesByProduct = getSalesAmountByProduct(sales);
  const entries = Object.entries(salesByProduct);

  if (entries.length === 0) return null;

  entries.sort((a, b) => b[1] - a[1]);
  return {
    product: entries[0][0],
    totalAmount: entries[0][1],
  };
};

// Monthly sales summary
export const getMonthlySales = (
  sales: Sale[]
): Record<string, number> => {
  return sales.reduce((acc, sale) => {
    const month = new Date(sale.closingDate).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
    });
    acc[month] = (acc[month] || 0) + sale.salesAmount;
    return acc;
  }, {} as Record<string, number>);
};

// ✅ Total sales overall (FIXED)
export const getTotalSales = (sales: Sale[]): number => {
  return sales.reduce((sum, sale) => sum + sale.salesAmount, 0);
};

