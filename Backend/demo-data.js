// Demo data for testing the interactive features
const demoStories = [
    {
        id: 1,
        title: "Help Ravi Complete His Engineering Studies",
        description: "Ravi is a brilliant student from a rural village who secured admission in a prestigious engineering college. However, his family cannot afford the fees due to financial constraints. He needs support to complete his education and achieve his dream of becoming an engineer to help his community.",
        location: "Rajasthan, India",
        contactInfo: "ravi.education@example.com",
        urgencyLevel: "high",
        media: [],
        donationAmount: 400,
        donations: 4,
        status: "active",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: 2,
        title: "Medical Treatment for Little Priya",
        description: "5-year-old Priya was diagnosed with a rare heart condition that requires immediate surgery. Her parents, who work as daily wage laborers, cannot afford the expensive treatment. Every day counts, and with your help, we can save Priya's life and give her a chance at a healthy future.",
        location: "Mumbai, Maharashtra",
        contactInfo: "priya.family@example.com",
        urgencyLevel: "critical",
        media: [],
        donationAmount: 0,
        donations: 0,
        status: "active",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: 3,
        title: "Rebuild Homes After Flood Disaster",
        description: "Recent floods in our village have destroyed over 50 homes, leaving families homeless. We need urgent help to rebuild basic shelters and provide essential supplies like food, clean water, and clothing. Your contribution can help these families get back on their feet.",
        location: "Kerala, India",
        contactInfo: "flood.relief@example.com",
        urgencyLevel: "high",
        media: [],
        donationAmount: 0,
        donations: 0,
        status: "active",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    }
];

// Demo donations data to match the stories
const demoDonations = [
    // Donations for Ravi's Engineering Studies (₹400 from 4 donors)
    {
        id: 1,
        postId: 1,
        storyTitle: "Help Ravi Complete His Engineering Studies",
        donorName: "Anonymous",
        donorUPI: null,
        amount: 100,
        paymentMethod: "UPI",
        transactionId: "UTR123456789012",
        status: "completed",
        timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        createdAt: new Date(Date.now() - 86400000).toISOString()
    },
    {
        id: 2,
        postId: 1,
        storyTitle: "Help Ravi Complete His Engineering Studies",
        donorName: "Priya Sharma",
        donorUPI: null,
        amount: 100,
        paymentMethod: "UPI",
        transactionId: "UTR123456789013",
        status: "completed",
        timestamp: new Date(Date.now() - 72000000).toISOString(), // 20 hours ago
        createdAt: new Date(Date.now() - 72000000).toISOString()
    },
    {
        id: 3,
        postId: 1,
        storyTitle: "Help Ravi Complete His Engineering Studies",
        donorName: "Rajesh Kumar",
        donorUPI: null,
        amount: 100,
        paymentMethod: "UPI",
        transactionId: "UTR123456789014",
        status: "completed",
        timestamp: new Date(Date.now() - 43200000).toISOString(), // 12 hours ago
        createdAt: new Date(Date.now() - 43200000).toISOString()
    },
    {
        id: 4,
        postId: 1,
        storyTitle: "Help Ravi Complete His Engineering Studies",
        donorName: "Anonymous",
        donorUPI: null,
        amount: 100,
        paymentMethod: "UPI",
        transactionId: "UTR123456789015",
        status: "completed",
        timestamp: new Date(Date.now() - 21600000).toISOString(), // 6 hours ago
        createdAt: new Date(Date.now() - 21600000).toISOString()
    }
];

// Add demo stories and donations to the server data
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { demoStories, demoDonations };
}