// Demo collaboration data for testing admin dashboard
module.exports = [
  {
    id: 1,
    organizationName: "Hope Foundation",
    contactPerson: "Rajesh Kumar",
    email: "rajesh@hopefoundation.org",
    phone: "+91-9876543210",
    organizationType: "NGO",
    collaborationType: "Resource Sharing",
    resources: ["Volunteers", "Medical Supplies"],
    description: "We are a healthcare-focused NGO looking to collaborate on medical emergency cases. We can provide volunteers and medical supplies for urgent cases.",
    status: "pending",
    submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 2,
    organizationName: "Education First Trust",
    contactPerson: "Priya Sharma",
    email: "priya.sharma@educationfirst.in",
    phone: "+91-8765432109",
    organizationType: "Educational Trust",
    collaborationType: "Funding Support",
    resources: ["Financial Aid", "Scholarships"],
    description: "We provide educational scholarships and financial aid for deserving students. Looking to partner for education-related fundraising campaigns.",
    status: "approved",
    submittedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 3,
    organizationName: "Green Earth Initiative",
    contactPerson: "Amit Patel",
    email: "amit@greenearth.org",
    phone: "+91-7654321098",
    organizationType: "Environmental NGO",
    collaborationType: "Awareness Campaigns",
    resources: ["Social Media", "Event Management"],
    description: "Environmental awareness NGO interested in collaborating on community development projects with environmental focus.",
    status: "under_review",
    submittedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  }
];