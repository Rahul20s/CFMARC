// Property Filter Variables - Global Scope
let allProperties = [];
let filteredProperties = [];
let selectedStates = [];
let selectedCategories = [];
let selectedCities = [];

// Global Filter Functions
function toggleFilter(type) {
    const dropdown = document.getElementById(`${type}FilterDropdown`);
    const button = document.getElementById(`${type}FilterBtn`);
    
    // Close other dropdowns
    document.querySelectorAll('.filter-dropdown-content').forEach(d => {
        if (d !== dropdown) {
            d.classList.remove('show');
        }
    });
    
    document.querySelectorAll('.filter-btn').forEach(btn => {
        if (btn !== button) {
            btn.classList.remove('active');
        }
    });
    
    // Toggle current dropdown
    dropdown.classList.toggle('show');
    button.classList.toggle('active');
}

function populateFilterOptions(properties) {
    // Get unique states, categories, and cities
    const states = [...new Set(properties.map(p => p.State).filter(s => s))];
    const categories = [...new Set(properties.map(p => p.Category).filter(c => c))];
    const cities = [...new Set(properties.map(p => p.City).filter(c => c))];
    
    // Populate state filter options
    const stateOptions = document.getElementById('stateFilterOptions');
    if (stateOptions) {
        stateOptions.innerHTML = states.map(state => `
            <div class="filter-option">
                <input type="checkbox" id="state_${state.replace(/\s+/g, '_')}" value="${state}" onchange="updateFilterSelection('state')">
                <label for="state_${state.replace(/\s+/g, '_')}">${state}</label>
            </div>
        `).join('');
    }
    
    // Populate category filter options
    const categoryOptions = document.getElementById('categoryFilterOptions');
    if (categoryOptions) {
        categoryOptions.innerHTML = categories.map(category => `
            <div class="filter-option">
                <input type="checkbox" id="category_${category.replace(/\s+/g, '_')}" value="${category}" onchange="updateFilterSelection('category')">
                <label for="category_${category.replace(/\s+/g, '_')}">${category}</label>
            </div>
        `).join('');
    }
    
    // Populate city filter options
    const cityOptions = document.getElementById('cityFilterOptions');
    if (cityOptions) {
        cityOptions.innerHTML = cities.map(city => `
            <div class="filter-option">
                <input type="checkbox" id="city_${city.replace(/\s+/g, '_')}" value="${city}" onchange="updateFilterSelection('city')">
                <label for="city_${city.replace(/\s+/g, '_')}">${city}</label>
            </div>
        `).join('');
    }
}

function updateFilterSelection(type) {
    const checkboxes = document.querySelectorAll(`#${type}FilterOptions input[type="checkbox"]:checked`);
    const selectedValues = Array.from(checkboxes).map(cb => cb.value);
    
    if (type === 'state') {
        selectedStates = selectedValues;
    } else if (type === 'category') {
        selectedCategories = selectedValues;
    } else if (type === 'city') {
        selectedCities = selectedValues;
    }
    
    updateFilterButtonText(type, selectedValues);
}

function updateFilterButtonText(type, selectedValues) {
    const button = document.getElementById(`${type}FilterBtn`);
    const filterText = button.querySelector('.filter-text');
    
    if (!button || !filterText) return;
    
    if (selectedValues.length === 0) {
        filterText.textContent = type.charAt(0).toUpperCase() + type.slice(1);
    } else if (selectedValues.length === 1) {
        filterText.textContent = selectedValues[0];
    } else {
        filterText.textContent = `${selectedValues.length} ${type}s selected`;
    }
}

function applyFilter(type) {
    updateFilterSelection(type);
    filterProperties();
    
    // Close dropdown
    const dropdown = document.getElementById(`${type}FilterDropdown`);
    const button = document.getElementById(`${type}FilterBtn`);
    if (dropdown && button) {
        dropdown.classList.remove('show');
        button.classList.remove('active');
    }
}

function clearAllFilters() {
    // Clear all checkboxes
    document.querySelectorAll('.filter-options input[type="checkbox"]').forEach(cb => {
        cb.checked = false;
    });
    
    // Clear all selected values
    selectedStates = [];
    selectedCategories = [];
    selectedCities = [];
    
    // Update all button texts
    updateFilterButtonText('state', []);
    updateFilterButtonText('category', []);
    updateFilterButtonText('city', []);
    
    // Apply filtering
    filterProperties();
    
    // Close all dropdowns
    document.querySelectorAll('.filter-dropdown-content').forEach(dropdown => {
        dropdown.classList.remove('show');
    });
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
}

function filterProperties() {
    filteredProperties = allProperties.filter(property => {
        const stateMatch = selectedStates.length === 0 || selectedStates.includes(property.State);
        const categoryMatch = selectedCategories.length === 0 || selectedCategories.includes(property.Category);
        const cityMatch = selectedCities.length === 0 || selectedCities.includes(property.City);
        return stateMatch && categoryMatch && cityMatch;
    });
    
    displayProperties(filteredProperties);
}

// Helper Functions for Property Display
function getDaysRemaining(auctionDate) {
    if (!auctionDate) {
        return {
            status: 'unknown',
            text: 'Date N/A',
            icon: '📅'
        };
    }

    // Parse DD-MM-YYYY format
    const parts = auctionDate.split('-');
    if (parts.length !== 3) {
        return {
            status: 'unknown',
            text: 'Invalid Date',
            icon: '❓'
        };
    }

    const [day, month, year] = parts;
    const auctionDateTime = new Date(`${year}-${month}-${day}`);
    
    if (isNaN(auctionDateTime.getTime())) {
        return {
            status: 'unknown',
            text: 'Invalid Date',
            icon: '❓'
        };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of day for accurate comparison
    auctionDateTime.setHours(0, 0, 0, 0);

    const timeDiff = auctionDateTime.getTime() - today.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

    if (daysDiff < 0) {
        return {
            status: 'closed',
            text: 'Closed',
            icon: '🔒'
        };
    } else if (daysDiff === 0) {
        return {
            status: 'today',
            text: 'Today',
            icon: '⚡'
        };
    } else if (daysDiff === 1) {
        return {
            status: 'urgent',
            text: 'Tomorrow',
            icon: '⏰'
        };
    } else if (daysDiff <= 7) {
        return {
            status: 'soon',
            text: `${daysDiff} days`,
            icon: '🔥'
        };
    } else if (daysDiff <= 30) {
        return {
            status: 'upcoming',
            text: `${daysDiff} days`,
            icon: '📅'
        };
    } else {
        return {
            status: 'future',
            text: `${daysDiff} days`,
            icon: '🗓️'
        };
    }
}

function getBadgeForCategory(category) {
    const badges = {
        'Commercial': 'Commercial',
        'Residential': 'Residential'
    };
    return badges[category] || 'Available';
}

function getPropertyImage(category, subCategory) {
    const imageMap = {
        // Residential Properties
        'Residential Apartment': 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400&h=250&fit=crop&auto=format',
        'Residential House': 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=400&h=250&fit=crop&auto=format',
        'Residential Flat': 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=250&fit=crop&auto=format',
        'Residential Plot': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=250&fit=crop&auto=format',
        
        // Commercial Properties
        'Commercial Plot': 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=250&fit=crop&auto=format',
        'Commercial Shop': 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=250&fit=crop&auto=format',
        'Commercial Office': 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=400&h=250&fit=crop&auto=format',
        'Commercial Land': 'data:image/jpeg;base64,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',
        'Land & Building': 'https://images.unsplash.com/photo-1448630360428-65456885c650?w=400&h=250&fit=crop&auto=format'
    };
    
    return imageMap[subCategory] || 'https://via.placeholder.com/400x250/1c1c1c/ffffff?text=Property';
}

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    
    // Parse DD-MM-YYYY format
    const parts = dateString.split('-');
    if (parts.length === 3) {
        const [day, month, year] = parts;
        const date = new Date(`${year}-${month}-${day}`);
        
        if (!isNaN(date.getTime())) {
            return date.toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
            });
        }
    }
    
    return dateString;
}

function showPropertyDetails(index) {
    // This function can show a modal with detailed property information
    // For now, just show a notification
    showNotification('Property details feature coming soon!', 'info');
}

// Main Display Function
function displayProperties(properties) {
    const grid = document.getElementById('propertiesGrid');
    if (!grid) return;

    if (properties.length === 0) {
        grid.innerHTML = '<div class="no-properties">No properties available at the moment.</div>';
        return;
    }

    // Sort properties by days remaining (descending order)
    const sortedProperties = properties.sort((a, b) => {
        const daysA = getDaysRemaining(a['Date of Auction']);
        const daysB = getDaysRemaining(b['Date of Auction']);
        
        // Get numeric days for comparison
        const getNumericDays = (daysInfo) => {
            if (daysInfo.status === 'closed') return -9999;
            if (daysInfo.status === 'today') return 0;
            if (daysInfo.status === 'tomorrow') return 1;
            if (daysInfo.status === 'soon' || daysInfo.status === 'upcoming' || daysInfo.status === 'future') {
                const daysText = daysInfo.text;
                const daysMatch = daysText.match(/\d+/);
                return daysMatch ? parseInt(daysMatch[0]) : 0;
            }
            return 0;
        };
        
        return getNumericDays(daysB) - getNumericDays(daysA);
    });

    const propertyCards = sortedProperties.map((property, index) => {
        const badge = getBadgeForCategory(property.Category);
        const imageUrl = getPropertyImage(property.Category, property['Sub - Category / Type of Asset']);
        const daysInfo = getDaysRemaining(property['Date of Auction']);
        
        return `
            <div class="property-card">
                <div class="property-image">
                    <img src="${imageUrl}" alt="${property['Sub - Category / Type of Asset']}">
                    <div class="property-badge">${badge}</div>
                </div>
                <div class="property-content">
                    <h3>${property['Sub - Category / Type of Asset']}</h3>
                    <div class="property-location">
                        
                    </div>
                    <div class="property-details">
                        <div class="detail-item">
                            <span class="detail-label">Category:</span>
                            <span class="detail-value">${property.Category}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Type:</span>
                            <span class="detail-value">${property['Sub - Category / Type of Asset']}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">City:</span>
                            <span class="detail-value">${property.City}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">State:</span>
                            <span class="detail-value">${property.State}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Reserve Price:</span>
                            <span class="detail-value">${property['Reserve Price']}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Auction Date:</span>
                            <span class="detail-value">${formatDate(property['Date of Auction'])}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Bid Last Date:</span>
                            <span class="detail-value">${formatDate(property['Bid Submission Last Date'])}</span>
                        </div>
                    </div>
                    <div class="property-actions">
                        <div class="days-remaining ${daysInfo.status}">
                            <span class="days-icon">${daysInfo.icon}</span>
                            <span class="days-text">${daysInfo.text}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    grid.innerHTML = propertyCards;
}

// Mobile Menu Toggle
document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const navMenu = document.getElementById('navMenu');
    
    if (mobileMenuToggle && navMenu) {
        mobileMenuToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            
            // Toggle hamburger menu animation
            const spans = mobileMenuToggle.querySelectorAll('span');
            spans.forEach((span, index) => {
                if (navMenu.classList.contains('active')) {
                    if (index === 0) span.style.transform = 'rotate(45deg) translate(5px, 5px)';
                    if (index === 1) span.style.opacity = '0';
                    if (index === 2) span.style.transform = 'rotate(-45deg) translate(7px, -6px)';
                } else {
                    span.style.transform = '';
                    span.style.opacity = '';
                }
            });
        });
    }

    // Dropdown Menu Toggle for Mobile
    const navLinks = document.querySelectorAll('.nav-link[data-dropdown]');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            if (window.innerWidth <= 768) {
                e.preventDefault();
                const dropdownId = this.getAttribute('data-dropdown') + '-dropdown';
                const dropdown = document.getElementById(dropdownId);
                
                if (dropdown) {
                    // Close other dropdowns
                    document.querySelectorAll('.dropdown-menu').forEach(menu => {
                        if (menu !== dropdown) {
                            menu.style.display = 'none';
                        }
                    });
                    
                    // Toggle current dropdown
                    dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
                }
            }
        });
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', function(e) {
        if (window.innerWidth <= 768) {
            if (!navMenu.contains(e.target) && !mobileMenuToggle.contains(e.target)) {
                navMenu.classList.remove('active');
                
                // Reset hamburger menu
                const spans = mobileMenuToggle.querySelectorAll('span');
                spans.forEach(span => {
                    span.style.transform = '';
                    span.style.opacity = '';
                });
            }
        }
    });

    // Handle window resize
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            navMenu.classList.remove('active');
            
            // Reset hamburger menu
            const spans = mobileMenuToggle.querySelectorAll('span');
            spans.forEach(span => {
                span.style.transform = '';
                span.style.opacity = '';
            });
            
            // Reset mobile dropdowns
            document.querySelectorAll('.dropdown-menu').forEach(menu => {
                menu.style.display = '';
            });
        }
    });

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                
                // Close mobile menu if open
                if (navMenu.classList.contains('active')) {
                    navMenu.classList.remove('active');
                    
                    // Reset hamburger menu
                    const spans = mobileMenuToggle.querySelectorAll('span');
                    spans.forEach(span => {
                        span.style.transform = '';
                        span.style.opacity = '';
                    });
                }
            }
        });
    });

    // Scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    // Observe elements for animation
    const animateElements = document.querySelectorAll('.feature-card, .business-card, .expertise-card, .stat-card, .quick-links-card');
    animateElements.forEach(el => {
        el.classList.add('fade-in');
        observer.observe(el);
    });

    // Header scroll effect
    let lastScrollTop = 0;
    const header = document.querySelector('.header');
    
    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (header) {
            if (scrollTop > lastScrollTop && scrollTop > 100) {
                // Scrolling down
                header.style.transform = 'translateY(-100%)';
            } else {
                // Scrolling up
                header.style.transform = 'translateY(0)';
            }
        }
        
        lastScrollTop = scrollTop;
    });

    // Add transition to header for smooth hide/show
    if (header) {
        header.style.transition = 'transform 0.3s ease-in-out';
    }

    // Form validation (if any forms are added later)
    function validateForm(form) {
        let isValid = true;
        const inputs = form.querySelectorAll('input[required], textarea[required], select[required]');
        
        inputs.forEach(input => {
            if (!input.value.trim()) {
                isValid = false;
                input.classList.add('error');
                
                // Remove error class on input
                input.addEventListener('input', function() {
                    this.classList.remove('error');
                });
            } else {
                input.classList.remove('error');
            }
        });
        
        return isValid;
    }

    // Email validation
    function validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Phone number validation (Indian format)
    function validatePhone(phone) {
        const phoneRegex = /^[6-9]\d{9}$/;
        return phoneRegex.test(phone.replace(/\D/g, ''));
    }

    // Add loading states to buttons
    document.querySelectorAll('.btn').forEach(button => {
        button.addEventListener('click', function(e) {
            if (this.classList.contains('loading')) {
                e.preventDefault();
                return false;
            }
        });
    });

    // Utility function to show notifications
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Style the notification
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '15px 20px',
            borderRadius: '8px',
            color: 'white',
            fontWeight: '500',
            zIndex: '9999',
            maxWidth: '300px',
            wordWrap: 'break-word',
            transform: 'translateX(100%)',
            transition: 'transform 0.3s ease-in-out'
        });
        
        // Set background color based on type
        switch(type) {
            case 'success':
                notification.style.backgroundColor = '#28a745';
                break;
            case 'error':
                notification.style.backgroundColor = '#dc3545';
                break;
            case 'warning':
                notification.style.backgroundColor = '#ffc107';
                notification.style.color = '#333';
                break;
            default:
                notification.style.backgroundColor = '#003366';
        }
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Remove after 5 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 5000);
    }

    // Initialize tooltips (if needed)
    function initTooltips() {
        const tooltipElements = document.querySelectorAll('[data-tooltip]');
        
        tooltipElements.forEach(element => {
            element.addEventListener('mouseenter', function() {
                const tooltip = document.createElement('div');
                tooltip.className = 'tooltip';
                tooltip.textContent = this.getAttribute('data-tooltip');
                
                Object.assign(tooltip.style, {
                    position: 'absolute',
                    backgroundColor: '#333',
                    color: 'white',
                    padding: '5px 10px',
                    borderRadius: '4px',
                    fontSize: '14px',
                    zIndex: '1000',
                    pointerEvents: 'none'
                });
                
                document.body.appendChild(tooltip);
                
                const rect = this.getBoundingClientRect();
                tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
                tooltip.style.top = rect.top - tooltip.offsetHeight - 5 + 'px';
                
                this.tooltip = tooltip;
            });
            
            element.addEventListener('mouseleave', function() {
                if (this.tooltip) {
                    this.tooltip.remove();
                    this.tooltip = null;
                }
            });
        });
    }

    // Initialize everything when DOM is loaded
    initTooltips();

    // Contact Form Submission
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                phone: document.getElementById('phone').value,
                subject: document.getElementById('subject').value,
                message: document.getElementById('message').value,
                consent: document.getElementById('consent').checked,
                timestamp: new Date().toLocaleString()
            };
            
            // Validate form
            if (!validateForm(this)) {
                showNotification('Please fill in all required fields correctly.', 'error');
                return;
            }
            
            // Validate email
            if (!validateEmail(formData.email)) {
                showNotification('Please enter a valid email address.', 'error');
                return;
            }
            
            // Validate phone if provided
            if (formData.phone && !validatePhone(formData.phone)) {
                showNotification('Please enter a valid 10-digit phone number.', 'error');
                return;
            }
            
            // Display submission details in modal
            displaySubmissionDetails(formData);
            
            // Send email
            sendEmail(formData);
            
            // Show thank you modal
            const modal = document.getElementById('thankYouModal');
            if (modal) {
                modal.style.display = 'block';
            }
            
            // Reset form
            this.reset();
            
            // Show success notification
            showNotification('Your message has been sent successfully!', 'success');
        });
    }

    // Modal close functionality
    const closeModalBtn = document.getElementById('closeModal');
    const closeModalX = document.getElementById('closeModalBtn');
    const modal = document.getElementById('thankYouModal');
    
    if (closeModalBtn && modal) {
        closeModalBtn.addEventListener('click', function() {
            modal.style.display = 'none';
        });
    }
    
    if (closeModalX && modal) {
        closeModalX.addEventListener('click', function() {
            modal.style.display = 'none';
        });
    }
    
    // Close modal when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });

    function displaySubmissionDetails(data) {
        const submissionInfo = document.getElementById('submissionInfo');
        if (!submissionInfo) return;
        
        const subjectLabels = {
            'general': 'General Inquiry',
            'business': 'Business Inquiry',
            'properties': 'Property Inquiry',
            'careers': 'Career Inquiry',
            'media': 'Media Inquiry',
            'investor': 'Investor Relations',
            'complaint': 'Complaint'
        };
        
        submissionInfo.innerHTML = `
            <div class="submission-info-item">
                <strong>Name:</strong> ${data.name}
            </div>
            <div class="submission-info-item">
                <strong>Email:</strong> ${data.email}
            </div>
            ${data.phone ? `<div class="submission-info-item"><strong>Phone:</strong> ${data.phone}</div>` : ''}
            <div class="submission-info-item">
                <strong>Subject:</strong> ${subjectLabels[data.subject] || data.subject}
            </div>
            <div class="submission-info-item">
                <strong>Message:</strong> ${data.message}
            </div>
            <div class="submission-info-item">
                <strong>Submitted:</strong> ${data.timestamp}
            </div>
        `;
    }

    function sendEmail(data) {
        // Initialize EmailJS with your Public Key
        (function() {
            emailjs.init("bZAR_FJKzozVW5Ih2"); // Replace with your EmailJS Public Key
        })();

        // Send email using EmailJS
        emailjs.send('service_ng56a68', 'template_x4i9vvs', {
            from_name: data.name,
            from_email: data.email,
            phone: data.phone || 'Not provided',
            subject: data.subject,
            message: data.message,
            timestamp: data.timestamp
        }).then(function(response) {
            console.log('Email sent successfully!', response.status, response.text);
            showNotification('Your message has been sent to our team!', 'success');
        }, function(error) {
            console.log('Failed to send email:', error);
            showNotification('Failed to send message. Please try again.', 'error');
        });
        
        // Log data for debugging
        console.log('Form data being sent:', data);
    }

    // Close dropdowns when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.filter-dropdown')) {
            document.querySelectorAll('.filter-dropdown-content').forEach(dropdown => {
                dropdown.classList.remove('show');
            });
            document.querySelectorAll('.filter-btn').forEach(btn => {
                btn.classList.remove('active');
            });
        }
    });

    // CSV Property Loading
    function loadPropertiesFromCSV() {
        fetch('../DATA.csv')
            .then(response => response.text())
            .then(csvText => {
                const properties = parseCSV(csvText);
                allProperties = properties;
                filteredProperties = properties;
                populateFilterOptions(properties);
                displayProperties(properties);
            })
            .catch(error => {
                console.error('Error loading CSV:', error);
                document.getElementById('propertiesGrid').innerHTML = 
                    '<div class="error">Failed to load properties. Please try again later.</div>';
            });
    }

    function parseCSV(csvText) {
        const lines = csvText.split('\n');
        const headers = lines[0].split(',').map(h => h.trim());
        const properties = [];

        for (let i = 1; i < lines.length; i++) {
            if (lines[i].trim()) {
                const values = parseCSVLine(lines[i]);
                const property = {};
                
                headers.forEach((header, index) => {
                    property[header] = values[index] ? values[index].trim() : '';
                });
                
                properties.push(property);
            }
        }
        
        return properties;
    }

    function parseCSVLine(line) {
        const result = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                result.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }
        
        result.push(current.trim());
        return result;
    }

    function formatDate(dateString) {
        if (!dateString) return 'N/A';
        
        // Parse DD-MM-YYYY format
        const parts = dateString.split('-');
        if (parts.length === 3) {
            const [day, month, year] = parts;
            const date = new Date(`${year}-${month}-${day}`);
            
            if (!isNaN(date.getTime())) {
                return date.toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                });
            }
        }
        
        return dateString;
    }

    function showPropertyDetails(index) {
        // This function can show a modal with detailed property information
        // For now, just show a notification
        showNotification('Property details feature coming soon!', 'info');
    }

    // Load properties when page loads
    if (document.getElementById('propertiesGrid')) {
        loadPropertiesFromCSV();
    }

    // Console log for debugging
    console.log('Cfmarc website initialized successfully');
});

// Application Form Functions
function openApplicationForm() {
    document.getElementById('applicationModal').style.display = 'block';
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
}

function closeApplicationForm() {
    document.getElementById('applicationModal').style.display = 'none';
    document.body.style.overflow = 'auto'; // Restore scrolling
    document.getElementById('applicationForm').reset(); // Reset form
}

function submitApplication(event) {
    event.preventDefault();
    
    const form = document.getElementById('applicationForm');
    const formData = new FormData(form);
    
    // Validate file size
    const resumeFile = document.getElementById('resume').files[0];
    if (resumeFile && resumeFile.size > 5 * 1024 * 1024) {
        showNotification('Resume file size must be less than 5MB', 'error');
        return;
    }
    
    // Show loading state
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Submitting...';
    submitBtn.disabled = true;
    
    // Send data to server
    fetch('http://localhost:3000/api/submit-application', {
        method: 'POST',
        body: formData,
        mode: 'cors' // Important for CORS
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showNotification('Application submitted successfully! We will contact you soon.', 'success');
            closeApplicationForm();
        } else {
            showNotification(data.message || 'Error submitting application. Please try again.', 'error');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showNotification('Error submitting application. Please check your connection and try again.', 'error');
    })
    .finally(() => {
        // Reset button state
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    });
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('applicationModal');
    if (event.target === modal) {
        closeApplicationForm();
    }
}

// Escape key to close modal
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeApplicationForm();
    }
});

// Global notification function for careers page (outside document ready scope)
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Style the notification
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '15px 20px',
        borderRadius: '8px',
        color: 'white',
        fontWeight: '500',
        zIndex: '9999',
        maxWidth: '300px',
        wordWrap: 'break-word',
        transform: 'translateX(100%)',
        transition: 'transform 0.3s ease-in-out'
    });
    
    // Set background color based on type
    switch(type) {
        case 'success':
            notification.style.backgroundColor = '#28a745';
            break;
        case 'error':
            notification.style.backgroundColor = '#dc3545';
            break;
        case 'warning':
            notification.style.backgroundColor = '#ffc107';
            notification.style.color = '#333';
            break;
        default:
            notification.style.backgroundColor = '#003366';
    }
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after 5 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 5000);
}
