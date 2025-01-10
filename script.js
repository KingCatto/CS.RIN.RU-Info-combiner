// Global variables
const files = [];
const savedColors = JSON.parse(localStorage.getItem('colorPreferences')) || {
    windows: '#3b82f6',
    mac: '#8b5cf6',
    linux: '#10b981'
};

let windowsColor = savedColors.windows;
let macColor = savedColors.mac;
let linuxColor = savedColors.linux;

// Enhanced control states
const controlStates = {
    windows: { 
        public: { dateEnabled: false, date: '', linkEnabled: false, link: '' },
        beta: { dateEnabled: false, date: '', linkEnabled: false, link: '' },
        unstable: { dateEnabled: false, date: '', linkEnabled: false, link: '' },
        win32: { dateEnabled: false, date: '', linkEnabled: false, link: '' }
    },
    mac: {
        public: { dateEnabled: false, date: '', linkEnabled: false, link: '' },
        beta: { dateEnabled: false, date: '', linkEnabled: false, link: '' },
        unstable: { dateEnabled: false, date: '', linkEnabled: false, link: '' }
    },
    linux: {
        public: { dateEnabled: false, date: '', linkEnabled: false, link: '' },
        beta: { dateEnabled: false, date: '', linkEnabled: false, link: '' },
        unstable: { dateEnabled: false, date: '', linkEnabled: false, link: '' }
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
});

// Initialize color pickers
function initializeColorPickers() {
    document.getElementById('windowsColorPicker').value = windowsColor;
    document.getElementById('macColorPicker').value = macColor;
    document.getElementById('linuxColorPicker').value = linuxColor;

    ['windows', 'mac', 'linux'].forEach(platform => {
        const picker = document.getElementById(`${platform}ColorPicker`);
        if (picker) {
            picker.addEventListener('input', function(e) {
                window[`${platform}Color`] = e.target.value;
                saveColorPreferences();
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
    localStorage.setItem('colorPreferences', JSON.stringify({
        windows: windowsColor,
        mac: macColor,
        linux: linuxColor
    }));
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

// Update initializeWin32Controls function similarly
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

// Format date
function formatDate(dateStr) {
    try {
        const normalizedStr = dateStr.replace(/[–—-]/g, '-');
        const dateParts = normalizedStr.match(/(\d{1,2})\s+(\w+)\s+(\d{4})\s*-\s*(\d{2}):(\d{2}):(\d{2})\s*UTC/i);
        
        if (dateParts) {
            const months = [
                'January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December'
            ];
            const day = parseInt(dateParts[1]);
            let month = dateParts[2];
            const year = dateParts[3];
            const hours = dateParts[4];
            const minutes = dateParts[5];
            const seconds = dateParts[6];
            
            month = month.charAt(0).toUpperCase() + month.slice(1).toLowerCase();
            if (months.includes(month)) {
                return `${month} ${day}, ${year} - ${hours}:${minutes}:${seconds} UTC`;
            }
        }
        return dateStr;
    } catch (e) {
        return dateStr;
    }
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
            
            updatedContent = updatedContent.replace(/\s*\[Build\s+\d+\]/g, '');
            updatedContent = updatedContent.replace(
                /(\[color=white\]\[b\]Version:\[\/b\]\s*)\[i\].*?\[\/i\]/,
                `$1[i]${win32State.date}${buildNumber}[/i]`
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
        
        updatedContent = updatedContent.replace(/\s*\[Build\s+\d+\]/g, '');
        updatedContent = updatedContent.replace(
            /(\[color=white\]\[b\]Version:\[\/b\]\s*)\[i\].*?\[\/i\]/,
            `$1[i]${state.date}${buildNumber}[/i]`
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
    if (filename.includes('Linux64')) return 'linux';
    if (filename.includes('Linux')) return 'linux';
    if (filename.includes('Mac')) return 'mac';
    if (filename.includes('Win32')) return 'win32';  // Return win32 specifically
    if (filename.includes('Win64')) return 'windows';
    if (filename.includes('Windows')) return 'windows';
    return 'windows';  // Default to windows if no specific platform found
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
                link: ''
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