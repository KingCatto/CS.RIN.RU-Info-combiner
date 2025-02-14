// Global variables
const files = [];
const savedColors = JSON.parse(localStorage.getItem('colorPreferences')) || {
    windows: '#3b82f6',
    mac: '#fc7477',
    linux: '#10b981'
};

let windowsColor = savedColors.windows;
let macColor = savedColors.mac;
let linuxColor = savedColors.linux;

// Enhanced control states
const controlStates = {
    windows: { 
        public: { dateEnabled: false, date: '', linkEnabled: false, link: '', experimental: '' },
        beta: { dateEnabled: false, date: '', linkEnabled: false, link: '', experimental: '' },
        unstable: { dateEnabled: false, date: '', linkEnabled: false, link: '', experimental: '' },
        win32: { dateEnabled: false, date: '', linkEnabled: false, link: '', experimental: '' }
    },
    mac: {
        public: { dateEnabled: false, date: '', linkEnabled: false, link: '', experimental: '' },
        beta: { dateEnabled: false, date: '', linkEnabled: false, link: '', experimental: '' },
        unstable: { dateEnabled: false, date: '', linkEnabled: false, link: '', experimental: '' }
    },
    linux: {
        public: { dateEnabled: false, date: '', linkEnabled: false, link: '', experimental: '' },
        beta: { dateEnabled: false, date: '', linkEnabled: false, link: '', experimental: '' },
        unstable: { dateEnabled: false, date: '', linkEnabled: false, link: '', experimental: '' }
    }
};

const storedStates = localStorage.getItem('controlToggles');
if (storedStates) {
    const savedStates = JSON.parse(storedStates);
    // Restore saved states into controlStates
    Object.keys(savedStates).forEach(platform => {
        Object.keys(savedStates[platform]).forEach(branch => {
            if (controlStates[platform] && controlStates[platform][branch]) {
                controlStates[platform][branch] = savedStates[platform][branch];
            }
        });
    });
}

// Initialize everything when page loads
document.addEventListener('DOMContentLoaded', function() {
    initializeColorPickers();
    initializeControls();
    initializeDropzone();
    initializeButtons();
    createSpaceBackground();
});

// Initialize color pickers
function initializeColorPickers() {
    // Set initial values from saved preferences
    document.getElementById('windowsColorPicker').value = windowsColor;
    document.getElementById('macColorPicker').value = macColor;
    document.getElementById('linuxColorPicker').value = linuxColor;

    ['windows', 'mac', 'linux'].forEach(platform => {
        const picker = document.getElementById(`${platform}ColorPicker`);
        if (picker) {
            picker.addEventListener('input', function(e) {
                // Update the color variable
                window[`${platform}Color`] = e.target.value;
                // Save to localStorage
                saveColorPreferences();
                // Update the display
                updateDisplay();
            });

            // Add change event listener to handle when color picker closes
            picker.addEventListener('change', function(e) {
                // Update the color variable
                window[`${platform}Color`] = e.target.value;
                // Save to localStorage
                saveColorPreferences();
                // Update the display
                updateDisplay();
            });
        }
    });
}

function saveControlStates() {
    localStorage.setItem('controlToggles', JSON.stringify(controlStates));
}

// Save color preferences
function saveColorPreferences() {
    const preferences = {
        windows: windowsColor,
        mac: macColor,
        linux: linuxColor
    };
    localStorage.setItem('colorPreferences', JSON.stringify(preferences));
}
// Initialize controls for each platform and branch
function initializeControls() {
    const platforms = ['windows', 'mac', 'linux'];
    const branches = ['public', 'beta', 'unstable'];

    platforms.forEach(platform => {
        branches.forEach(branch => {
            initializePlatformBranchControls(platform, branch);
        });
    });

    // Special handling for Windows 32-bit
    initializeWin32Controls();
}

function initializePlatformBranchControls(platform, branch) {
    // Initialize date toggle
    const dateToggle = document.getElementById(`${platform}${branch.charAt(0).toUpperCase() + branch.slice(1)}DateToggle`);
    const dateContainer = document.getElementById(`${platform}${branch.charAt(0).toUpperCase() + branch.slice(1)}DateContainer`);
    const dateInput = document.getElementById(`${platform}${branch.charAt(0).toUpperCase() + branch.slice(1)}DateInput`);

    if (dateToggle && dateContainer && dateInput) {
        // Set initial state from controlStates
        dateToggle.checked = controlStates[platform][branch].dateEnabled;
        dateContainer.style.display = controlStates[platform][branch].dateEnabled ? 'block' : 'none';
        dateInput.value = controlStates[platform][branch].date;

        dateToggle.addEventListener('change', function() {
            controlStates[platform][branch].dateEnabled = this.checked;
            dateContainer.style.display = this.checked ? 'block' : 'none';
            if (this.checked) dateInput.focus();
            updateDisplay();
            saveControlStates();
        });

        dateInput.addEventListener('input', function() {
            controlStates[platform][branch].date = formatDate(this.value);
            this.value = controlStates[platform][branch].date;
            updateDisplay();
            saveControlStates();
        });

        // Add experimental input
        const experimentalInput = document.createElement('input');
        experimentalInput.type = 'text';
        experimentalInput.id = `${platform}${branch.charAt(0).toUpperCase() + branch.slice(1)}ExperimentalInput`;
        experimentalInput.className = 'date-input';
        experimentalInput.placeholder = 'Enter experimental build name (optional)';
        
        // Create experimental container
        const experimentalContainer = document.createElement('div');
        experimentalContainer.className = 'date-input-container';
        experimentalContainer.id = `${platform}${branch.charAt(0).toUpperCase() + branch.slice(1)}ExperimentalContainer`;
        experimentalContainer.appendChild(experimentalInput);
        dateContainer.parentNode.insertBefore(experimentalContainer, dateContainer.nextSibling);

        // Set initial state for experimental input
        experimentalInput.value = controlStates[platform][branch].experimental || '';
        experimentalContainer.style.display = controlStates[platform][branch].dateEnabled ? 'block' : 'none';

        dateToggle.addEventListener('change', function() {
            experimentalContainer.style.display = this.checked ? 'block' : 'none';
        });

        experimentalInput.addEventListener('input', function() {
            controlStates[platform][branch].experimental = this.value;
            updateDisplay();
            saveControlStates();
        });
    }

    // Initialize link toggle
    const linkToggle = document.getElementById(`${platform}${branch.charAt(0).toUpperCase() + branch.slice(1)}LinkToggle`);
    const linkContainer = document.getElementById(`${platform}${branch.charAt(0).toUpperCase() + branch.slice(1)}LinkContainer`);
    const linkInput = document.getElementById(`${platform}${branch.charAt(0).toUpperCase() + branch.slice(1)}LinkInput`);

    if (linkToggle && linkContainer && linkInput) {
        // Set initial state from controlStates
        linkToggle.checked = controlStates[platform][branch].linkEnabled;
        linkContainer.style.display = controlStates[platform][branch].linkEnabled ? 'block' : 'none';
        linkInput.value = controlStates[platform][branch].link;

        linkToggle.addEventListener('change', function() {
            controlStates[platform][branch].linkEnabled = this.checked;
            linkContainer.style.display = this.checked ? 'block' : 'none';
            if (this.checked) linkInput.focus();
            updateDisplay();
            saveControlStates();
        });

        linkInput.addEventListener('input', function() {
            controlStates[platform][branch].link = this.value;
            updateDisplay();
            saveControlStates();
        });
    }
}

// Initialize Win32 controls
function initializeWin32Controls() {
    const dateToggle = document.getElementById('windows32DateToggle');
    const dateContainer = document.getElementById('windows32DateContainer');
    const dateInput = document.getElementById('windows32DateInput');
    const linkToggle = document.getElementById('windows32LinkToggle');
    const linkContainer = document.getElementById('windows32LinkContainer');
    const linkInput = document.getElementById('windows32LinkInput');

    if (dateToggle && dateContainer && dateInput) {
        // Set initial state
        dateToggle.checked = controlStates.windows.win32.dateEnabled;
        dateContainer.style.display = controlStates.windows.win32.dateEnabled ? 'block' : 'none';
        dateInput.value = controlStates.windows.win32.date;

        dateToggle.addEventListener('change', function() {
            controlStates.windows.win32.dateEnabled = this.checked;
            dateContainer.style.display = this.checked ? 'block' : 'none';
            if (this.checked) dateInput.focus();
            updateDisplay();
            saveControlStates();
        });

        dateInput.addEventListener('input', function() {
            controlStates.windows.win32.date = formatDate(this.value);
            this.value = controlStates.windows.win32.date;
            updateDisplay();
            saveControlStates();
        });
    }

    if (linkToggle && linkContainer && linkInput) {
        // Set initial state
        linkToggle.checked = controlStates.windows.win32.linkEnabled;
        linkContainer.style.display = controlStates.windows.win32.linkEnabled ? 'block' : 'none';
        linkInput.value = controlStates.windows.win32.link;

        linkToggle.addEventListener('change', function() {
            controlStates.windows.win32.linkEnabled = this.checked;
            linkContainer.style.display = this.checked ? 'block' : 'none';
            if (this.checked) linkInput.focus();
            updateDisplay();
            saveControlStates();
        });

        linkInput.addEventListener('input', function() {
            controlStates.windows.win32.link = this.value;
            updateDisplay();
            saveControlStates();
        });
    }
}

// Initialize dropzone
function initializeDropzone() {
    const dropzone = document.getElementById('dropzone');
    
    if (dropzone) {
        dropzone.onclick = function() {
            const input = document.createElement('input');
            input.type = 'file';
            input.multiple = true;
            input.accept = '.txt';
            input.onchange = function() {
                handleFiles(this.files);
            };
            input.click();
        };

        dropzone.ondragover = function(e) {
            e.preventDefault();
            this.classList.add('dragover');
        };

        dropzone.ondragleave = function(e) {
            e.preventDefault();
            this.classList.remove('dragover');
        };

        dropzone.ondrop = function(e) {
            e.preventDefault();
            this.classList.remove('dragover');
            handleFiles(e.dataTransfer.files);
        };
    }
}

// Initialize buttons
function initializeButtons() {
    const copyBtn = document.getElementById('copyButton');
    const downloadBtn = document.getElementById('downloadButton');
    const clearBtn = document.getElementById('clearButton');

    if (copyBtn) copyBtn.addEventListener('click', copyOutput);
    if (downloadBtn) downloadBtn.addEventListener('click', downloadOutput);
    if (clearBtn) clearBtn.addEventListener('click', clearAll);
}

// Handle file uploads
function handleFiles(newFiles) {
    for (let file of newFiles) {
        const reader = new FileReader();
        reader.onload = function(e) {
            files.push({
                name: file.name,
                content: e.target.result
            });
            updateDisplay();
            updateBranchControls();
        };
        reader.readAsText(file);
    }
}


// Handle file uploads
function handleFiles(newFiles) {
    for (let file of newFiles) {
        const reader = new FileReader();
        reader.onload = function(e) {
            files.push({
                name: file.name,
                content: e.target.result
            });
            updateDisplay();
            updateBranchControls();
        };
        reader.readAsText(file);
    }
}
// Get the local timezone offset in minutes
let userTimezoneOffset = new Date().getTimezoneOffset();

// Format date
function formatDate(dateStr) {
    try {
        // Clean up the input string
        const cleanStr = dateStr.trim()
            .replace(/[–—]/g, '-')  // Normalize dashes
            .replace(/\s+/g, ' ')   // Normalize spaces
            .toLowerCase();

        // Check for the specific format: "Dec 17, 2024, 08:56:22 AM"
        const localTimePattern = /^([a-z]+)\s+(\d{1,2}),\s*(\d{4}),\s*(\d{1,2}):(\d{1,2}):(\d{1,2})\s*(am|pm)/i;
        const timeMatch = cleanStr.match(localTimePattern);
        
        if (timeMatch) {
            const [_, monthStr, day, year, hours, minutes, seconds, ampm] = timeMatch;
            const months = ['january', 'february', 'march', 'april', 'may', 'june',
                          'july', 'august', 'september', 'october', 'november', 'december'];
            
            // Convert month name to index (0-11)
            const month = months.findIndex(m => m.startsWith(monthStr.toLowerCase()));
            
            // Convert hours to 24-hour format first
            let hour = parseInt(hours);
            if (ampm.toLowerCase() === 'pm' && hour !== 12) hour += 12;
            if (ampm.toLowerCase() === 'am' && hour === 12) hour = 0;

            // Create date in UTC accounting for user's timezone
            // getTimezoneOffset() returns minutes, and is opposite of what you might expect
            // e.g., EST is 300, so we subtract it (add the negative) to convert to UTC
            const offsetHours = -userTimezoneOffset / 60;
            
            const utcDate = new Date(Date.UTC(
                parseInt(year),
                month,
                parseInt(day),
                hour + offsetHours, // Add the offset to convert from local to UTC
                parseInt(minutes),
                parseInt(seconds)
            ));
            
            return `${months[utcDate.getUTCMonth()].charAt(0).toUpperCase() + 
                    months[utcDate.getUTCMonth()].slice(1)} ${utcDate.getUTCDate()}, ${
                    utcDate.getUTCFullYear()} - ${
                    String(utcDate.getUTCHours()).padStart(2, '0')}:${
                    String(utcDate.getUTCMinutes()).padStart(2, '0')}:${
                    String(utcDate.getUTCSeconds()).padStart(2, '0')} UTC`;
        }

        let date;

        // Try Unix timestamp first
        if (/^\d+$/.test(cleanStr)) {
            date = new Date(parseInt(cleanStr) * 1000);
            if (!isNaN(date.getTime())) {
                return formatToUTC(date);
            }
        }

        // Try parsing with built-in Date
        // Remove timezone info temporarily for consistent parsing
        const withoutTZ = cleanStr.replace(/\s*(?:utc|gmt|[+-]\d{1,4}|[a-z]{3,4})$/i, '');
        
        // Try multiple date formats
        const attempts = [
            // Original string
            cleanStr,
            // Try with UTC explicitly
            cleanStr + ' UTC',
            // Try different separators
            withoutTZ.replace(/[\/-]/g, '.'),
            withoutTZ.replace(/[\.-]/g, '/'),
            withoutTZ.replace(/[\.\/]/g, '-'),
            // Try with and without time
            withoutTZ.split(/\s+\d{1,2}:/)[0],
            // Try different year positions
            withoutTZ.replace(/(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{2,4})/, '$3/$2/$1'),
            // Try month name variants
            ...tryMonthVariants(withoutTZ)
        ];

        for (let attempt of attempts) {
            date = new Date(attempt);
            if (isValidDate(date)) {
                // If no timezone was specified in original input, treat as UTC
                if (!dateStr.toLowerCase().includes('utc') && 
                    !dateStr.match(/[+-]\d{1,4}$/) && 
                    !dateStr.match(/[a-z]{3,4}$/i)) {
                    date = new Date(Date.UTC(
                        date.getFullYear(),
                        date.getMonth(),
                        date.getDate(),
                        date.getHours(),
                        date.getMinutes(),
                        date.getSeconds()
                    ));
                }
                return formatToUTC(date);
            }
        }

        // If all attempts fail, try manual parsing
        const patterns = [
            // 10 January 2025 - 01:26:40
            /^(\d{1,2})\s*([a-z]+)\s*(\d{4})\s*[-–—]?\s*(\d{1,2})?:?(\d{1,2})?:?(\d{1,2})?/i,
            // January 10, 2025 - 01:26:40
            /^([a-z]+)\s*(\d{1,2}),?\s*(\d{4})\s*[-–—]?\s*(\d{1,2})?:?(\d{1,2})?:?(\d{1,2})?/i,
            // 1/10/25 10:04:44 or 1-10-25 10:04:44
            /^(\d{1,2})[-\/.](\d{1,2})[-\/.](\d{2,4})\s*(\d{1,2})?:?(\d{1,2})?:?(\d{1,2})?/i,
            // 2025/10/1 10:04:44 or 2025-10-1 10:04:44
            /^(\d{4})[-\/.](\d{1,2})[-\/.](\d{1,2})\s*(\d{1,2})?:?(\d{1,2})?:?(\d{1,2})?/i,
            // 10:04:44 1/10/25
            /^(\d{1,2}):(\d{1,2}):(\d{1,2})\s*(\d{1,2})[-\/.](\d{1,2})[-\/.](\d{2,4})/i
        ];

        for (let pattern of patterns) {
            const match = withoutTZ.match(pattern);
            if (match) {
                const parts = Array.from(match).slice(1).map(p => p ? parseInt(p) : 0);
                date = createDateFromParts(pattern, parts);
                if (isValidDate(date)) {
                    return formatToUTC(date);
                }
            }
        }

        return dateStr; // Return original if all parsing attempts fail
    } catch (e) {
        console.error('Date parsing error:', e);
        return dateStr;
    }
}

// Helper function to validate date
function isValidDate(date) {
    return date instanceof Date && !isNaN(date.getTime());
}

// Helper function to format date to UTC string
function formatToUTC(date) {
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    return `${months[date.getUTCMonth()]} ${date.getUTCDate()}, ${date.getUTCFullYear()} - ${
        String(date.getUTCHours()).padStart(2, '0')}:${
        String(date.getUTCMinutes()).padStart(2, '0')}:${
        String(date.getUTCSeconds()).padStart(2, '0')} UTC`;
}

// Helper function to try different month name variants
function tryMonthVariants(dateStr) {
    const months = {
        'january': ['jan'],
        'february': ['feb'],
        'march': ['mar'],
        'april': ['apr'],
        'may': ['may'],
        'june': ['jun'],
        'july': ['jul'],
        'august': ['aug'],
        'september': ['sep', 'sept'],
        'october': ['oct'],
        'november': ['nov'],
        'december': ['dec']
    };

    const variants = [];
    for (const [full, abbrevs] of Object.entries(months)) {
        for (const abbrev of abbrevs) {
            variants.push(
                dateStr.replace(new RegExp(full, 'i'), abbrev),
                dateStr.replace(new RegExp(abbrev, 'i'), full)
            );
        }
    }
    return variants;
}

// Helper function to create date from pattern matches
function createDateFromParts(pattern, parts) {
    let year, month, day, hours = 0, minutes = 0, seconds = 0;

    // Handle different pattern formats
    if (pattern.source.startsWith('^\\d{1,2}\\s*[a-z]+')) {
        // 10 January 2025 format
        [day, , year, hours, minutes, seconds] = parts;
        month = getMonthIndex(parts[1]);
    } else if (pattern.source.startsWith('^[a-z]+')) {
        // January 10, 2025 format
        [, day, year, hours, minutes, seconds] = parts;
        month = getMonthIndex(parts[0]);
    } else if (pattern.source.startsWith('^\\d{1,2}[-\\/.]')) {
        // 1/10/25 format
        [month, day, year, hours, minutes, seconds] = parts;
        month--; // Adjust month to 0-based index
        if (year < 100) year += 2000;
    } else if (pattern.source.startsWith('^\\d{4}[-\\/.]')) {
        // 2025/10/1 format
        [year, month, day, hours, minutes, seconds] = parts;
        month--; // Adjust month to 0-based index
    } else if (pattern.source.startsWith('^\\d{1,2}:')) {
        // 10:04:44 1/10/25 format
        [hours, minutes, seconds, month, day, year] = parts;
        month--; // Adjust month to 0-based index
        if (year < 100) year += 2000;
    }

    return new Date(Date.UTC(year, month, day, hours, minutes, seconds));
}

// Helper function to get month index from name
function getMonthIndex(monthStr) {
    const months = [
        'january', 'february', 'march', 'april', 'may', 'june',
        'july', 'august', 'september', 'october', 'november', 'december'
    ];
    const monthName = monthStr.toLowerCase();
    let index = months.findIndex(m => m.startsWith(monthName));
    if (index === -1) index = months.findIndex(m => m === monthName);
    return index;
}
// Update branch controls visibility
function updateBranchControls() {
    const branches = new Set();
    const platforms = new Set();
    const branchPlatforms = {
        beta: new Set(),
        unstable: new Set()
    };

    files.forEach(file => {
        // Extract branch information
        const branchMatch = file.content.match(/\[Branch:\s*([^\]]+)\]/);
        if (branchMatch) {
            const branch = branchMatch[1].toLowerCase();
            branches.add(branch);

            // If this is a beta or unstable branch, record which platform it's for
            if (branch === 'beta' || branch === 'unstable') {
                if (file.name.includes('Win32') || file.name.includes('Win64') || file.name.includes('Windows')) {
                    branchPlatforms[branch].add('windows');
                } else if (file.name.includes('Mac')) {
                    branchPlatforms[branch].add('mac');
                } else if (file.name.includes('Linux')) {
                    branchPlatforms[branch].add('linux');
                }
            }
        }

        // Extract platform information
        if (file.name.includes('Win32')) {
            platforms.add('win32');
        } else if (file.name.includes('Windows') || file.name.includes('Win64')) {
            platforms.add('windows');
        } else if (file.name.includes('Mac')) {
            platforms.add('mac');
        } else if (file.name.includes('Linux')) {
            platforms.add('linux');
        }
    });

    // Always ensure the public controls are visible
    const publicControls = document.querySelector('.public-branch-controls');
    if (publicControls) {
        publicControls.style.display = 'block';
    }

    // Show/hide branch-specific controls and their platform controls
    document.querySelectorAll('.branch-specific-controls').forEach(control => {
        if (control.classList.contains('public-branch-controls')) {
            return; // Skip public controls as they're always visible
        }

        const branchClass = Array.from(control.classList)
            .find(cls => cls.endsWith('-branch-controls'));
        
        if (branchClass) {
            const branchName = branchClass.replace('-branch-controls', '');
            const shouldShowBranch = branches.has(branchName);
            control.style.display = shouldShowBranch ? 'block' : 'none';

            // If showing the branch, handle platform-specific controls
            if (shouldShowBranch) {
                // Hide/show platform controls based on whether that platform exists for this branch
                control.querySelectorAll('.control-group').forEach(platformControl => {
                    const isWindows = platformControl.querySelector('[id*="windows"]');
                    const isMac = platformControl.querySelector('[id*="mac"]');
                    const isLinux = platformControl.querySelector('[id*="linux"]');

                    if (isWindows && !platformControl.classList.contains('win32-controls')) {
                        platformControl.style.display = branchPlatforms[branchName].has('windows') ? 'block' : 'none';
                    } else if (isMac) {
                        platformControl.style.display = branchPlatforms[branchName].has('mac') ? 'block' : 'none';
                    } else if (isLinux) {
                        platformControl.style.display = branchPlatforms[branchName].has('linux') ? 'block' : 'none';
                    }
                });
            }
        }
    });

    // Show/hide Win32 controls
    const win32Controls = document.querySelector('.win32-controls');
    if (win32Controls) {
        win32Controls.style.display = platforms.has('win32') ? 'block' : 'none';
    }
}

// Update file content with date/link
function updateFileContent(content, platform, branch = 'public') {
    let updatedContent = content;
    const branchMatch = content.match(/\[Branch:\s*([^\]]+)\]/);
    const detectedBranch = branchMatch ? branchMatch[1].toLowerCase() : 'public';
    
    // Handle Win32 specifically
    if (platform === 'win32') {
        const win32State = controlStates.windows.win32;
        if (win32State.dateEnabled && win32State.date) {
            const buildMatch = content.match(/\[Build\s+(\d+)\]/);
            const buildNumber = buildMatch ? ` [Build ${buildMatch[1]}]` : '';
            const experimental = win32State.experimental ? ` (${win32State.experimental})` : '';
            
            updatedContent = updatedContent.replace(/\s*\[Build\s+\d+\]/g, '');
            updatedContent = updatedContent.replace(
                /(\[color=white\]\[b\]Version:\[\/b\]\s*)\[i\].*?\[\/i\]/,
                `$1[i]${win32State.date}${experimental}${buildNumber}[/i]`
            );
            updatedContent = updatedContent.replace(
                /(\[color=white\]\[b\]Uploaded version:\[\/b\]\s*)\[i\].*?\[\/i\]/,
                `$1[i]${win32State.date}${buildNumber}[/i]`
            );
        }
        if (win32State.linkEnabled && win32State.link) {
            updatedContent = updatedContent.replace(/\[url=.*?\]/, `[url=${win32State.link}]`);
        }
        return updatedContent;
    }
    
    // Handle all other platforms including Win64
    let normalizedPlatform = platform.toLowerCase()
        .replace(/64$/, '')  // Remove 64 suffix
        .replace(/^win(?:dows)?/, 'windows');  // Normalize Win/Windows to windows
    
    // Check if we have a valid platform
    if (!controlStates[normalizedPlatform]) {
        console.warn(`Unknown platform: ${platform}, normalized: ${normalizedPlatform}`);
        return content;
    }

    // Use the detected branch if it exists in controlStates, otherwise use 'public'
    const state = controlStates[normalizedPlatform][detectedBranch] || 
                 controlStates[normalizedPlatform]['public'];

    if (!state) return content;

    if (state.dateEnabled && state.date) {
        const buildMatch = content.match(/\[Build\s+(\d+)\]/);
        const buildNumber = buildMatch ? ` [Build ${buildMatch[1]}]` : '';
        const experimental = state.experimental ? ` (${state.experimental})` : '';
        
        updatedContent = updatedContent.replace(/\s*\[Build\s+\d+\]/g, '');
        updatedContent = updatedContent.replace(
            /(\[color=white\]\[b\]Version:\[\/b\]\s*)\[i\].*?\[\/i\]/,
            `$1[i]${state.date}${experimental}${buildNumber}[/i]`
        );
        updatedContent = updatedContent.replace(
            /(\[color=white\]\[b\]Uploaded version:\[\/b\]\s*)\[i\].*?\[\/i\]/,
            `$1[i]${state.date}${buildNumber}[/i]`
        );
    }

    if (state.linkEnabled && state.link) {
        const urlMatch = updatedContent.match(/\[url=.*?\]/);
        if (urlMatch) {
            updatedContent = updatedContent.replace(/\[url=.*?\]/, `[url=${state.link}]`);
        }
    }

    return updatedContent;
}

// Extract branch info
function extractBranch(content) {
    const branchMatch = content.match(/\[Branch:\s*([^\]]+)\]/);
    return branchMatch && branchMatch[1] !== 'Public' ? ` [${branchMatch[1]}]` : '';
}

// Detect platform from filename
function detectPlatform(filename) {
    if (filename.includes('.Linux64.')) return 'linux';
    if (filename.includes('.Linux.')) return 'linux';
    if (filename.includes('.Mac.')) return 'mac';
    if (filename.includes('.Win32.')) return 'win32';
    if (filename.includes('.Win64.')) return 'windows';
    if (filename.includes('.Windows.')) return 'windows';
    return 'windows';
}
// Update display
function updateDisplay() {
    const grouped = {
        Windows: [],
        Mac: [],
        Linux: []
    };

    // Process files
    for (const file of files) {
        const platform = detectPlatform(file.name);
        const branch = extractBranch(file.content).replace(/[\[\]]/g, '').trim().toLowerCase() || 'public';
        let content = file.content;

        // Apply updates based on platform and branch
        content = updateFileContent(content, platform, branch);

        // Group content
        if (platform === 'linux') {
            grouped.Linux.push({ ...file, content });
        } else if (platform === 'mac') {
            grouped.Mac.push({ ...file, content });
        } else {
            grouped.Windows.push({ ...file, content });
        }
    }

    updateFileList(grouped);
    updateOutputText(grouped);
}

// Update file list
function updateFileList(grouped) {
    const fileList = document.getElementById('fileList');
    if (!fileList) return;

    const fileListHTML = `
        <div class="file-list-header">
            <span>Filename</span>
            <span>Platform</span>
            <span>Branch</span>
        </div>
        ${[
            ...grouped.Windows.map(createFileListItem),
            ...grouped.Mac.map(createFileListItem),
            ...grouped.Linux.map(createFileListItem)
        ].join('')}
    `;
    
    fileList.innerHTML = fileListHTML;
}

// Create file list item
function createFileListItem(file) {
    const platform = detectPlatform(file.name);
    const hasWin32 = files.some(f => f.name.includes('Win32'));
    
    let displayPlatform = platform;
    if (platform === 'windows') {
        if (file.name.includes('Win32')) {
            displayPlatform = 'Win32';
        } else if (hasWin32 && !file.name.includes('Win32')) {
            displayPlatform = 'Win64';
        }
    }
    
    const branch = extractBranch(file.content).replace(/[\[\]]/g, '').trim() || 'Public';
    
    return `
        <div class="file-item">
            <span>${file.name}</span>
            <span class="platform-tag ${platform.toLowerCase()}">${displayPlatform}</span>
            <span class="branch-tag ${branch.toLowerCase()}">${branch}</span>
        </div>
    `;
}

// Update output text
function updateOutputText(grouped) {
    const output = document.getElementById('output');
    if (!output) return;

    const outputText = [
        ...grouped.Windows.map(f => createQuoteBlock(f, 'Windows')),
        ...grouped.Mac.map(f => createQuoteBlock(f, 'Mac')),
        ...grouped.Linux.map(f => createQuoteBlock(f, 'Linux'))
    ].join('\n\n');

    output.textContent = outputText;
}

// Create quote block
function createQuoteBlock(file, platform) {
    const color = platform === 'Windows' ? windowsColor :
                 platform === 'Mac' ? macColor : linuxColor;
                 
    // Check if Win32 exists in any of the files
    const hasWin32 = files.some(f => f.name.includes('Win32'));
    
    let label = platform;
    if (platform === 'Windows') {
        if (file.name.includes('Win32')) {
            label = 'Windows 32-bit';
        } else if (hasWin32 && !file.name.includes('Win32')) {
            label = 'Windows 64-bit';
        }
    }
    
    return `[quote][size=150][color=${color}]${label}${extractBranch(file.content)}[/color][/size]\n${file.content}[/quote]`;
}

// Copy output
function copyOutput() {
    const output = document.getElementById('output');
    if (!output || !output.textContent) {
        showToast('No content to copy');
        return;
    }

    navigator.clipboard.writeText(output.textContent)
        .then(() => showToast('Copied to clipboard!'))
        .catch(() => {
            const textarea = document.createElement('textarea');
            textarea.value = output.textContent;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();
            try {
                document.execCommand('copy');
                showToast('Copied to clipboard!');
            } catch (err) {
                console.error('Failed to copy:', err);
                showToast('Failed to copy to clipboard');
            }
            document.body.removeChild(textarea);
        });
}

// Download output
function downloadOutput() {
    const output = document.getElementById('output');
    if (!output || !output.textContent) {
        showToast('No content to download');
        return;
    }

    const blob = new Blob([output.textContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = generateFileName();
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    showToast('File downloaded!');
}

// Generate filename for download
function generateFileName() {
    if (files.length === 0) return 'combined.txt';
    
    let baseName = files[0].name;
    baseName = baseName.replace(/\.txt$/, '');
    
    const originalPlatformMatch = baseName.match(/(Win32|Win64|Linux64|Linux|Mac|Windows)/);
    if (originalPlatformMatch) {
        const platforms = new Set(files.map(file => {
            const platform = detectPlatform(file.name);
            return platform === 'Windows' ? 'Win' : 
                   (platform === 'Linux' ? 'Linux64' : platform);
        }));
        
        const platformString = Array.from(platforms)
            .sort((a, b) => {
                const order = {
                    'Win32': 1,
                    'Win64': 2,
                    'Mac': 3,
                    'Linux64': 4
                };
                return order[a] - order[b];
            })
            .join('.');
            
        baseName = baseName.replace(originalPlatformMatch[0], platformString);
    }
    
    return baseName + '.txt';
}
// Clear all data also clear localStorage
function clearAll() {
    files.length = 0;
    
    // Reset all control states
    Object.keys(controlStates).forEach(platform => {
        Object.keys(controlStates[platform]).forEach(branch => {
            controlStates[platform][branch] = {
                dateEnabled: false,
                date: '',
                linkEnabled: false,
                link: '',
                experimental: ''
            };
        });
    });

    // Clear localStorage
    localStorage.removeItem('controlToggles');

    // Reset all toggles and inputs
    document.querySelectorAll('.date-toggle input, .link-toggle input').forEach(input => {
        input.checked = false;
    });

    document.querySelectorAll('.date-input-container, .link-input-container').forEach(container => {
        container.style.display = 'none';
    });

    document.querySelectorAll('.date-input, .link-input').forEach(input => {
        input.value = '';
    });

    // Hide all branch-specific controls
    document.querySelectorAll('.branch-specific-controls').forEach(el => {
        if (!el.classList.contains('public-branch-controls')) {
            el.style.display = 'none';
        }
    });

    // Hide Win32 controls
    const win32Controls = document.querySelector('.win32-controls');
    if (win32Controls) {
        win32Controls.style.display = 'none';
    }

    updateDisplay();
    showToast('All data cleared');
}

// Show toast notification
function showToast(message) {
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// Create space background
function createSpaceBackground() {
    const spaceBackground = document.createElement('div');
    spaceBackground.id = 'space-background';
    document.body.prepend(spaceBackground);

    // Add reduced nebula effect with lower opacity and fewer gradients
    const nebula = document.createElement('div');
    nebula.className = 'nebula';
    spaceBackground.appendChild(nebula);

    // Reduce number of star clusters
    for (let i = 0; i < 3; i++) {
        const cluster = document.createElement('div');
        cluster.className = 'star-cluster';
        cluster.style.width = `${Math.random() * 150 + 100}px`;
        cluster.style.height = cluster.style.width;
        cluster.style.left = `${Math.random() * 100}%`;
        cluster.style.top = `${Math.random() * 100}%`;
        cluster.style.opacity = 0.2;
        spaceBackground.appendChild(cluster);
    }

    // Reduce number of shooting stars
    const shootingStar = document.createElement('div');
    shootingStar.className = 'shooting-star';
    shootingStar.style.top = `${Math.random() * 100}%`;
    shootingStar.style.left = `${Math.random() * 100}%`;
    shootingStar.style.animationDelay = `${Math.random() * 10}s`;
    spaceBackground.appendChild(shootingStar);

    // Reduce number of stars and simplify their styling
    const starCount = 100; // Reduced from 200
    for (let i = 0; i < starCount; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.left = `${Math.random() * 100}%`;
        star.style.top = `${Math.random() * 100}%`;
        const size = Math.random() * 1.5 + 0.5; // Reduced size range
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;
        
        // Simplified animation with longer duration
        star.style.animation = `twinkle ${Math.random() * 3 + 4}s ease-in-out infinite ${Math.random() * 2}s`;
        
        // Simplified glow effect
        star.style.boxShadow = `0 0 ${size}px rgba(255, 255, 255, 0.3)`;
        
        spaceBackground.appendChild(star);
    }

    // Reduce number of planets and simplify their effects
    const celestialBodies = [
        { 
            name: 'sun', 
            color: 'radial-gradient(circle at 30% 30%, #fff7b5, #ffd700)',
            size: 60,
            left: '10%',
            top: '20%'
        },
        { 
            name: 'earth',
            color: 'linear-gradient(135deg, #4b9cd3, #1a5c8b)',
            size: 25,
            left: '60%',
            top: '30%'
        },
        {
            name: 'saturn',
            color: 'linear-gradient(135deg, #ffd700, #b39700)',
            size: 40,
            left: '30%',
            top: '60%'
        }
    ];

    celestialBodies.forEach(body => {
        const planet = document.createElement('div');
        planet.className = 'planet';
        planet.style.width = `${body.size}px`;
        planet.style.height = `${body.size}px`;
        planet.style.background = body.color;
        planet.style.left = body.left;
        planet.style.top = body.top;
        planet.style.animation = 'float 10s ease-in-out infinite'; // Simplified animation
        planet.style.opacity = '0.7';
        
        // Simplified shadow
        planet.style.boxShadow = 'inset -4px -4px 8px rgba(0, 0, 0, 0.5)';
        
        spaceBackground.appendChild(planet);
    });

    // Optimize scroll performance
    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                const scrolled = window.pageYOffset;
                const stars = document.querySelectorAll('.star');
                const planets = document.querySelectorAll('.planet');
                
                // Use transform3d for hardware acceleration
                stars.forEach((star, index) => {
                    if (index % 2 === 0) { // Only animate every other star
                        star.style.transform = `translate3d(0, ${scrolled * 0.1}px, 0)`;
                    }
                });
                
                planets.forEach((planet, index) => {
                    planet.style.transform = `translate3d(0, ${scrolled * 0.05}px, 0)`;
                });
                
                ticking = false;
            });
            ticking = true;
        }
    });
}