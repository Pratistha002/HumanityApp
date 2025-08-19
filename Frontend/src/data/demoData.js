// Demo data for GitHub Pages deployment (when backend is not available)
export const demoStories = [
  {
    id: 1,
    title: "Help Build a School in Rural Village",
    description: "We are raising funds to build a primary school in a remote village where children have to walk 10km to reach the nearest school. Your donation will help provide education to over 200 children.",
    location: "Rajasthan, India",
    contactInfo: "contact@ruralschool.org",
    urgencyLevel: "high",
    media: [
      { filename: "school-construction.jpg" }
    ],
    donationAmount: 45000,
    donations: 23,
    status: "active",
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-20T15:30:00Z"
  },
  {
    id: 2,
    title: "Medical Treatment for Cancer Patient",
    description: "A 35-year-old mother of two needs urgent medical treatment for cancer. The family cannot afford the expensive treatment. Every contribution counts towards saving a life.",
    location: "Mumbai, Maharashtra",
    contactInfo: "help@medicalaid.org",
    urgencyLevel: "critical",
    media: [
      { filename: "medical-help.jpg" }
    ],
    donationAmount: 78000,
    donations: 45,
    status: "active",
    createdAt: "2024-01-10T08:00:00Z",
    updatedAt: "2024-01-22T12:00:00Z"
  },
  {
    id: 3,
    title: "Food Distribution for Flood Victims",
    description: "Recent floods have displaced hundreds of families. We are organizing food distribution camps and need your support to provide meals to affected families.",
    location: "Kerala, India",
    contactInfo: "relief@floodhelp.org",
    urgencyLevel: "medium",
    media: [
      { filename: "flood-relief.jpg" }
    ],
    donationAmount: 32000,
    donations: 18,
    status: "active",
    createdAt: "2024-01-18T14:00:00Z",
    updatedAt: "2024-01-21T09:00:00Z"
  }
];

export const demoStats = {
  totalDonations: 155000,
  totalPosts: 3,
  totalCollaborations: 5,
  totalDonors: 86,
  recentDonations: [
    {
      id: 1,
      donorName: "Anonymous",
      amount: 5000,
      storyTitle: "Help Build a School in Rural Village",
      timestamp: "2024-01-22T10:30:00Z"
    },
    {
      id: 2,
      donorName: "Rahul Sharma",
      amount: 2000,
      storyTitle: "Medical Treatment for Cancer Patient",
      timestamp: "2024-01-22T09:15:00Z"
    },
    {
      id: 3,
      donorName: "Priya Patel",
      amount: 1500,
      storyTitle: "Food Distribution for Flood Victims",
      timestamp: "2024-01-21T16:45:00Z"
    }
  ]
};

export const demoCollaborations = [
  {
    id: 1,
    organizationName: "Hope Foundation",
    contactPerson: "Dr. Amit Kumar",
    email: "amit@hopefoundation.org",
    phone: "+91-9876543210",
    organizationType: "NGO",
    collaborationType: "funding",
    resources: ["Medical Equipment", "Volunteers"],
    description: "We want to collaborate on medical aid projects",
    status: "pending",
    priority: "high",
    submittedAt: "2024-01-20T10:00:00Z"
  },
  {
    id: 2,
    organizationName: "Education Trust",
    contactPerson: "Ms. Sunita Verma",
    email: "sunita@educationtrust.org",
    phone: "+91-9876543211",
    organizationType: "Trust",
    collaborationType: "partnership",
    resources: ["Books", "Teachers", "Infrastructure"],
    description: "Looking to partner for education initiatives",
    status: "approved",
    priority: "medium",
    submittedAt: "2024-01-18T14:30:00Z"
  }
];

export const isDemo = process.env.NODE_ENV === 'production' && !process.env.REACT_APP_API_URL;