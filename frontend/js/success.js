/**
 * Success Page Handler
 * Handles success page functionality and social sharing
 * YAICESS Solutions - Tech Conference Registration System
 */

document.addEventListener('DOMContentLoaded', function() {
    initializeSuccessPage();
});

/**
 * Initialize success page
 */
function initializeSuccessPage() {
    loadRegistrationData();
    initializeAnimations();
    setupSocialSharing();
}

/**
 * Load registration data from session storage
 */
function loadRegistrationData() {
    try {
        const registrationData = sessionStorage.getItem('registrationData');
        
        if (registrationData) {
            const data = JSON.parse(registrationData);
            displayRegistrationDetails(data);
            
            // Clear session storage
            sessionStorage.removeItem('registrationData');
        } else {
            // If no data found, show generic success message
            displayGenericSuccess();
        }
    } catch (error) {
        console.error('Error loading registration data:', error);
        displayGenericSuccess();
    }
}

/**
 * Display registration details
 */
function displayRegistrationDetails(data) {
    // Update registration ID
    const idElement = document.getElementById('registrationId');
    if (idElement && data.registration_id) {
        idElement.textContent = `#${data.registration_id}`;
    }

    // Update name
    const nameElement = document.getElementById('registrationName');
    if (nameElement && data.full_name) {
        nameElement.textContent = data.full_name;
    }

    // Update email
    const emailElement = document.getElementById('registrationEmail');
    if (emailElement && data.email) {
        emailElement.textContent = data.email;
    }

    // Update session
    const sessionElement = document.getElementById('registrationSession');
    if (sessionElement && data.session_choice) {
        sessionElement.textContent = data.session_choice;
    }

    // Store data for social sharing
    window.registrationData = data;
}

/**
 * Display generic success message if no data available
 */
function displayGenericSuccess() {
    const summarySection = document.getElementById('registrationSummary');
    if (summarySection) {
        summarySection.innerHTML = `
            <h3>Registration Confirmed!</h3>
            <p>Your registration has been successfully submitted. You will receive a confirmation email shortly.</p>
        `;
    }
}

/**
 * Initialize success animations
 */
function initializeAnimations() {
    // Animate success checkmark
    setTimeout(() => {
        const checkmark = document.querySelector('.success-checkmark');
        if (checkmark) {
            checkmark.classList.add('animate');
        }
    }, 500);

    // Animate circles
    setTimeout(() => {
        const circles = document.querySelectorAll('.success-circles div');
        circles.forEach((circle, index) => {
            setTimeout(() => {
                circle.classList.add('animate');
            }, index * 200);
        });
    }, 1000);

    // Animate content sections
    const sections = document.querySelectorAll('.registration-summary, .next-steps, .conference-info');
    sections.forEach((section, index) => {
        setTimeout(() => {
            section.classList.add('fade-in');
        }, 1500 + (index * 300));
    });
}

/**
 * Setup social sharing functionality
 */
function setupSocialSharing() {
    // Social sharing event listeners
    const socialButtons = document.querySelectorAll('.social-btn');
    socialButtons.forEach(button => {
        button.addEventListener('click', function() {
            const platform = this.classList[1]; // Get second class (twitter, linkedin, etc.)
            handleSocialShare(platform);
        });
    });
}

/**
 * Handle social sharing
 */
function handleSocialShare(platform) {
    const conferenceUrl = window.location.origin;
    const message = "I just registered for YAICESS Tech Conference 2025! Join me for an amazing tech event. #YAICESS2025 #TechConference";
    
    let shareUrl = '';

    switch (platform) {
        case 'twitter':
            shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}&url=${encodeURIComponent(conferenceUrl)}`;
            break;
        case 'linkedin':
            shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(conferenceUrl)}`;
            break;
        case 'facebook':
            shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(conferenceUrl)}`;
            break;
        case 'copy':
            copyEventLink();
            return;
    }

    if (shareUrl) {
        window.open(shareUrl, '_blank', 'width=550,height=420');
    }
}

/**
 * Share on social media (general function)
 */
function shareOnSocial() {
    // Show sharing options
    const socialSection = document.querySelector('.social-sharing');
    if (socialSection) {
        socialSection.scrollIntoView({ behavior: 'smooth' });
    }
}

/**
 * Share on Twitter
 */
function shareOnTwitter() {
    handleSocialShare('twitter');
}

/**
 * Share on LinkedIn
 */
function shareOnLinkedIn() {
    handleSocialShare('linkedin');
}

/**
 * Share on Facebook
 */
function shareOnFacebook() {
    handleSocialShare('facebook');
}

/**
 * Copy event link to clipboard
 */
async function copyEventLink() {
    const eventUrl = window.location.origin;
    
    try {
        await navigator.clipboard.writeText(eventUrl);
        MessageDisplay.success('Event link copied to clipboard!');
    } catch (error) {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = eventUrl;
        document.body.appendChild(textArea);
        textArea.select();
        
        try {
            document.execCommand('copy');
            MessageDisplay.success('Event link copied to clipboard!');
        } catch (err) {
            MessageDisplay.error('Failed to copy link to clipboard');
        }
        
        document.body.removeChild(textArea);
    }
}

/**
 * Download calendar event (future enhancement)
 */
function downloadCalendarEvent() {
    const eventData = {
        title: 'YAICESS Tech Conference 2025',
        start: new Date('2025-08-15T09:00:00'),
        end: new Date('2025-08-16T18:00:00'),
        description: 'Premier technology conference featuring AI, Cloud Computing, Cybersecurity, and DevOps sessions.',
        location: 'Tech District Conference Center, Silicon Valley, CA'
    };

    // Create ICS file content
    const icsContent = createICSFile(eventData);
    
    // Download ICS file
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    downloadFile(blob, 'yaicess-conference-2025.ics');
    
    MessageDisplay.success('Calendar event downloaded!');
}

/**
 * Create ICS file content
 */
function createICSFile(event) {
    const formatDate = (date) => {
        return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//YAICESS Solutions//Tech Conference//EN
BEGIN:VEVENT
UID:${Date.now()}@yaicess.com
DTSTAMP:${formatDate(new Date())}
DTSTART:${formatDate(event.start)}
DTEND:${formatDate(event.end)}
SUMMARY:${event.title}
DESCRIPTION:${event.description}
LOCATION:${event.location}
STATUS:CONFIRMED
TRANSP:OPAQUE
END:VEVENT
END:VCALENDAR`;
}

/**
 * Contact support
 */
function contactSupport() {
    const subject = 'YAICESS Tech Conference 2025 - Support Request';
    const body = 'Hello,\n\nI need assistance with my conference registration.\n\nRegistration details:\n';
    
    if (window.registrationData) {
        body += `Registration ID: #${window.registrationData.registration_id}\n`;
        body += `Name: ${window.registrationData.full_name}\n`;
        body += `Email: ${window.registrationData.email}\n\n`;
    }
    
    body += 'Please describe your issue:\n\n';
    
    const mailtoLink = `mailto:info@yaicess.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoLink;
}

/**
 * Navigate to accommodation page
 */
function viewAccommodation() {
    MessageDisplay.info('Accommodation information coming soon!');
    // Future: window.location.href = 'accommodation.html';
}

/**
 * Get directions to venue
 */
function getDirections() {
    const venueAddress = 'Tech District Conference Center, Silicon Valley, CA';
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(venueAddress)}`;
    window.open(mapsUrl, '_blank');
}

/**
 * Add entrance animation on scroll
 */
function initializeScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);

    // Observe sections for animation
    const animatedSections = document.querySelectorAll('.additional-info, .social-sharing');
    animatedSections.forEach(section => {
        observer.observe(section);
    });
}

// Initialize scroll animations
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(initializeScrollAnimations, 2000);
});

// Export functions for global access
window.shareOnSocial = shareOnSocial;
window.shareOnTwitter = shareOnTwitter;
window.shareOnLinkedIn = shareOnLinkedIn;
window.shareOnFacebook = shareOnFacebook;
window.copyEventLink = copyEventLink;
window.downloadCalendarEvent = downloadCalendarEvent;
window.contactSupport = contactSupport;
window.viewAccommodation = viewAccommodation;
window.getDirections = getDirections;