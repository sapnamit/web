// Settings page script for Smart Shopping Assistant
document.addEventListener('DOMContentLoaded', function() {
    initializeSettings();
});

async function initializeSettings() {
    // Load saved settings
    await loadSettings();
    
    // Load statistics
    await loadStatistics();
    
    // Set up event listeners
    setupEventListeners();
}

async function loadSettings() {
    try {
        const settings = await chrome.storage.sync.get({
            // Default settings
            autoDetectProducts: true,
            showNotifications: true,
            priceThreshold: 10,
            autoApplyCoupons: false,
            showCouponCodes: true,
            minCouponValue: 5,
            defaultDeparture: '',
            preferredAirlines: '',
            maxFlightPrice: 500,
            enableNotifications: true,
            notificationFrequency: 'hourly'
        });
        
        // Apply settings to UI
        applySettingsToUI(settings);
    } catch (error) {
        console.error('Error loading settings:', error);
    }
}

function applySettingsToUI(settings) {
    // Toggle switches
    setToggleState('autoDetectProducts', settings.autoDetectProducts);
    setToggleState('showNotifications', settings.showNotifications);
    setToggleState('autoApplyCoupons', settings.autoApplyCoupons);
    setToggleState('showCouponCodes', settings.showCouponCodes);
    setToggleState('enableNotifications', settings.enableNotifications);
    
    // Select dropdowns
    document.getElementById('priceThreshold').value = settings.priceThreshold;
    document.getElementById('notificationFrequency').value = settings.notificationFrequency;
    
    // Input fields
    document.getElementById('minCouponValue').value = settings.minCouponValue;
    document.getElementById('defaultDeparture').value = settings.defaultDeparture;
    document.getElementById('preferredAirlines').value = settings.preferredAirlines;
    document.getElementById('maxFlightPrice').value = settings.maxFlightPrice;
}

function setToggleState(settingName, isActive) {
    const toggles = document.querySelectorAll(`[onclick*="${settingName}"]`);
    toggles.forEach(toggle => {
        if (isActive) {
            toggle.classList.add('active');
        } else {
            toggle.classList.remove('active');
        }
    });
}

async function loadStatistics() {
    try {
        const stats = await chrome.storage.local.get({
            totalSavings: 0,
            couponsApplied: 0,
            priceChecks: 0,
            travelSearches: 0
        });
        
        // Update statistics display
        document.getElementById('total-savings').textContent = `$${stats.totalSavings.toFixed(2)}`;
        document.getElementById('coupons-applied').textContent = stats.couponsApplied;
        document.getElementById('price-checks').textContent = stats.priceChecks;
        document.getElementById('travel-searches').textContent = stats.travelSearches;
    } catch (error) {
        console.error('Error loading statistics:', error);
    }
}

function setupEventListeners() {
    // Add change listeners for all form elements
    document.querySelectorAll('select, input').forEach(element => {
        element.addEventListener('change', function() {
            // Add visual feedback
            this.style.borderColor = '#007bff';
            setTimeout(() => {
                this.style.borderColor = '#ced4da';
            }, 1000);
        });
    });
}

function toggleSetting(toggleElement, settingName) {
    const isActive = toggleElement.classList.contains('active');
    
    if (isActive) {
        toggleElement.classList.remove('active');
    } else {
        toggleElement.classList.add('active');
    }
    
    // Save setting immediately
    saveSetting(settingName, !isActive);
}

async function saveSetting(settingName, value) {
    try {
        await chrome.storage.sync.set({ [settingName]: value });
        console.log(`Setting ${settingName} saved:`, value);
    } catch (error) {
        console.error('Error saving setting:', error);
    }
}

async function saveSettings() {
    try {
        const settings = {
            autoDetectProducts: document.querySelector('[onclick*="autoDetectProducts"]').classList.contains('active'),
            showNotifications: document.querySelector('[onclick*="showNotifications"]').classList.contains('active'),
            priceThreshold: parseInt(document.getElementById('priceThreshold').value),
            autoApplyCoupons: document.querySelector('[onclick*="autoApplyCoupons"]').classList.contains('active'),
            showCouponCodes: document.querySelector('[onclick*="showCouponCodes"]').classList.contains('active'),
            minCouponValue: parseFloat(document.getElementById('minCouponValue').value),
            defaultDeparture: document.getElementById('defaultDeparture').value,
            preferredAirlines: document.getElementById('preferredAirlines').value,
            maxFlightPrice: parseInt(document.getElementById('maxFlightPrice').value),
            enableNotifications: document.querySelector('[onclick*="enableNotifications"]').classList.contains('active'),
            notificationFrequency: document.getElementById('notificationFrequency').value
        };
        
        await chrome.storage.sync.set(settings);
        
        // Show success message
        showNotification('Settings saved successfully!', 'success');
        
        console.log('All settings saved:', settings);
    } catch (error) {
        console.error('Error saving settings:', error);
        showNotification('Error saving settings. Please try again.', 'error');
    }
}

async function resetSettings() {
    if (confirm('Are you sure you want to reset all settings to default values?')) {
        try {
            // Clear all settings
            await chrome.storage.sync.clear();
            
            // Reload the page to show default values
            location.reload();
            
            showNotification('Settings reset to defaults!', 'success');
        } catch (error) {
            console.error('Error resetting settings:', error);
            showNotification('Error resetting settings. Please try again.', 'error');
        }
    }
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#007bff'};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 10000;
        animation: slideIn 0.3s ease;
        max-width: 300px;
    `;
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 3000);
}

// Add CSS for slideIn animation
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
`;
document.head.appendChild(style);