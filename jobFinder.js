// Sample job data
const jobsData = [
    {
        id: 1,
        title: "Software Engineer",
        company: "Tech Corp",
        location: "Remote",
        industry: "Technology",
        experience: "Mid Level",
        authorization: "Visa Sponsorship Available",
        salary: "$100k - $150k",
        type: "Full-time"
    },
    {
        id: 2,
        title: "Frontend Developer",
        company: "Web Solutions",
        location: "San Francisco, CA",
        industry: "Technology",
        experience: "Entry Level",
        authorization: "Accepts International Applicants",
        salary: "$80k - $110k",
        type: "Full-time"
    },
    {
        id: 3,
        title: "Data Analyst",
        company: "Finance Pro",
        location: "New York, NY",
        industry: "Finance",
        experience: "Mid Level",
        authorization: "US Citizens Only",
        salary: "$90k - $120k",
        type: "Full-time"
    },
    {
        id: 4,
        title: "Nurse Practitioner",
        company: "Health Plus",
        location: "Seattle, WA",
        industry: "Healthcare",
        experience: "Senior Level",
        authorization: "Visa Sponsorship Available",
        salary: "$110k - $140k",
        type: "Full-time"
    },
    {
        id: 5,
        title: "Marketing Manager",
        company: "Brand Boost",
        location: "Austin, TX",
        industry: "Marketing",
        experience: "Senior Level",
        authorization: "US Citizens Only",
        salary: "$95k - $130k",
        type: "Full-time"
    },
    {
        id: 6,
        title: "Elementary Teacher",
        company: "Bright Future School",
        location: "Remote",
        industry: "Education",
        experience: "Entry Level",
        authorization: "Accepts International Applicants",
        salary: "$50k - $65k",
        type: "Full-time"
    },
    {
        id: 7,
        title: "Senior Backend Developer",
        company: "Cloud Systems",
        location: "San Francisco, CA",
        industry: "Technology",
        experience: "Senior Level",
        authorization: "Visa Sponsorship Available",
        salary: "$140k - $180k",
        type: "Full-time"
    },
    {
        id: 8,
        title: "Financial Analyst",
        company: "Investment Group",
        location: "New York, NY",
        industry: "Finance",
        experience: "Entry Level",
        authorization: "US Citizens Only",
        salary: "$70k - $90k",
        type: "Full-time"
    }
];

// Get DOM elements
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const locationFilter = document.getElementById('locationFilter');
const industryFilter = document.getElementById('industryFilter');
const experienceFilter = document.getElementById('experienceFilter');
const authorizationFilter = document.getElementById('authorizationFilter');
const clearFiltersBtn = document.getElementById('clearFilters');
const jobsGrid = document.getElementById('jobsGrid');
const resultsCount = document.getElementById('resultsCount');
const noResults = document.getElementById('noResults');

// Filter and display jobs
function filterJobs() {
    const searchTerm = searchInput.value.toLowerCase();
    const location = locationFilter.value;
    const industry = industryFilter.value;
    const experience = experienceFilter.value;
    const authorization = authorizationFilter.value;

    const filteredJobs = jobsData.filter(job => {
        const matchesSearch = searchTerm === '' || 
            job.title.toLowerCase().includes(searchTerm) ||
            job.company.toLowerCase().includes(searchTerm);
        
        const matchesLocation = location === '' || job.location === location;
        const matchesIndustry = industry === '' || job.industry === industry;
        const matchesExperience = experience === '' || job.experience === experience;
        const matchesAuthorization = authorization === '' || job.authorization === authorization;

        return matchesSearch && matchesLocation && matchesIndustry && 
               matchesExperience && matchesAuthorization;
    });

    displayJobs(filteredJobs);
}

// Display jobs in grid
function displayJobs(jobs) {
    jobsGrid.innerHTML = '';
    resultsCount.textContent = `${jobs.length} job${jobs.length !== 1 ? 's' : ''} found`;

    if (jobs.length === 0) {
        noResults.style.display = 'block';
        jobsGrid.style.display = 'none';
    } else {
        noResults.style.display = 'none';
        jobsGrid.style.display = 'grid';

        jobs.forEach(job => {
            const jobCard = document.createElement('div');
            jobCard.className = 'job-card';
            jobCard.innerHTML = `
                <div class="job-card-header">
                    <h4 class="job-card-title">${job.title}</h4>
                    <p class="job-card-company">${job.company}</p>
                </div>
                <div class="job-card-details">
                    <div class="job-detail">
                        <svg class="job-detail-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                        </svg>
                        ${job.location}
                    </div>
                    <div class="job-detail">
                        <svg class="job-detail-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                        ${job.salary}
                    </div>
                    <div class="job-detail">
                        <svg class="job-detail-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                        </svg>
                        ${job.experience}
                    </div>
                </div>
                <div class="job-tags">
                    <span class="job-tag">${job.industry}</span>
                    ${job.authorization.includes('Visa') || job.authorization.includes('International') ? 
                        `<span class="job-tag visa">${job.authorization.split(' ')[0]} ${job.authorization.split(' ')[1]}</span>` : 
                        ''}
                </div>
            `;
            jobsGrid.appendChild(jobCard);
        });
    }
}

// Event listeners
searchBtn.addEventListener('click', filterJobs);
searchInput.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') filterJobs();
});
locationFilter.addEventListener('change', filterJobs);
industryFilter.addEventListener('change', filterJobs);
experienceFilter.addEventListener('change', filterJobs);
authorizationFilter.addEventListener('change', filterJobs);

clearFiltersBtn.addEventListener('click', () => {
    searchInput.value = '';
    locationFilter.value = '';
    industryFilter.value = '';
    experienceFilter.value = '';
    authorizationFilter.value = '';
    filterJobs();
});

// Initial display of all jobs
displayJobs(jobsData);