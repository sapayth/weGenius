/**
 * Posts Page Integration
 * Handles the posts list table integration functionality
 *
 * @since 1.0.0
 */

/**
 * Initialize posts page functionality
 */
const initPostsPage = () => {
	// Add event listeners for scan buttons
	document.addEventListener('click', (event) => {
		if (event.target.classList.contains('wegenius-scan-btn')) {
			handleScanClick(event);
		}
		
		if (event.target.classList.contains('wegenius-rescan-btn')) {
			handleRescanClick(event);
		}
	});

	// Add event listeners for checkbox changes
	document.addEventListener('change', (event) => {
		if (event.target.name && event.target.name.startsWith('wegenius_')) {
			handleCheckboxChange(event);
		}
	});

	// Start status polling for posts that are being analyzed
	startStatusPolling();
};

/**
 * Handle scan button click
 */
const handleScanClick = async (event) => {
	const button = event.target;
	const postId = button.dataset.postId;
	
	if (!postId) return;

	// Get selected analysis types
	const analysisTypes = getSelectedAnalysisTypes(postId);
	
	if (analysisTypes.length === 0) {
		alert('Please select at least one analysis type.');
		return;
	}

	// Update button state
	button.disabled = true;
	button.textContent = 'Analyzing...';

	try {
		const response = await fetch('/wp-json/wegenius/v1/analysis/start', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'X-WP-Nonce': window.wegeniusAdmin.nonce,
			},
			body: JSON.stringify({
				postId: parseInt(postId),
				analysisTypes: analysisTypes,
			}),
		});

		if (!response.ok) {
			throw new Error('Failed to start analysis');
		}

		const result = await response.json();
		
		// Update UI to show analyzing state
		updatePostAnalysisState(postId, 'analyzing');
		
		// Show success message
		showNotice('Analysis started successfully!', 'success');
		
	} catch (error) {
		console.error('Analysis start error:', error);
		showNotice('Failed to start analysis. Please try again.', 'error');
		
		// Reset button state
		button.disabled = false;
		button.textContent = 'Scan';
	}
};

/**
 * Handle rescan button click
 */
const handleRescanClick = async (event) => {
	const button = event.target;
	const postId = button.dataset.postId;
	
	if (!postId) return;

	// Update button state
	button.disabled = true;
	button.textContent = 'Re-analyzing...';

	try {
		const response = await fetch('/wp-json/wegenius/v1/analysis/restart', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'X-WP-Nonce': window.wegeniusAdmin.nonce,
			},
			body: JSON.stringify({
				postId: parseInt(postId),
			}),
		});

		if (!response.ok) {
			throw new Error('Failed to restart analysis');
		}

		// Update UI to show analyzing state
		updatePostAnalysisState(postId, 'analyzing');
		
		// Show success message
		showNotice('Analysis restarted successfully!', 'success');
		
	} catch (error) {
		console.error('Analysis restart error:', error);
		showNotice('Failed to restart analysis. Please try again.', 'error');
		
		// Reset button state
		button.disabled = false;
		button.textContent = 'Re-scan';
	}
};

/**
 * Handle checkbox change
 */
const handleCheckboxChange = (event) => {
	const checkbox = event.target;
	const postId = checkbox.name.split('_')[1];
	
	// Store the selection in localStorage for persistence
	const key = `wegenius_${postId}_${checkbox.value}`;
	localStorage.setItem(key, checkbox.checked);
};

/**
 * Get selected analysis types for a post
 */
const getSelectedAnalysisTypes = (postId) => {
	const types = [];
	const checkboxes = document.querySelectorAll(`input[name^="wegenius_"][name$="_${postId}"]`);
	
	checkboxes.forEach(checkbox => {
		if (checkbox.checked) {
			types.push(checkbox.value);
		}
	});
	
	return types;
};

/**
 * Update post analysis state in UI
 */
const updatePostAnalysisState = (postId, state) => {
	const actionsContainer = document.querySelector(`[data-post-id="${postId}"]`);
	if (!actionsContainer) return;

	if (state === 'analyzing') {
		actionsContainer.innerHTML = `
			<div class="wegenius-analyzing">
				<span class="wegenius-status-text">Analyzing...</span>
				<button type="button" class="button wegenius-rescan-btn" data-post-id="${postId}">
					Re-scan
				</button>
			</div>
		`;
	}
};

/**
 * Show admin notice
 */
const showNotice = (message, type = 'info') => {
	const notice = document.createElement('div');
	notice.className = `notice notice-${type} is-dismissible`;
	notice.innerHTML = `<p>${message}</p>`;
	
	// Insert at the top of the page
	const adminNotices = document.querySelector('.wrap h1');
	if (adminNotices) {
		adminNotices.parentNode.insertBefore(notice, adminNotices.nextSibling);
	}
	
	// Auto-dismiss after 5 seconds
	setTimeout(() => {
		if (notice.parentNode) {
			notice.parentNode.removeChild(notice);
		}
	}, 5000);
};

/**
 * Load saved checkbox states
 */
const loadSavedStates = () => {
	document.querySelectorAll('input[name^="wegenius_"]').forEach(checkbox => {
		const key = `wegenius_${checkbox.name.split('_')[1]}_${checkbox.value}`;
		const saved = localStorage.getItem(key);
		if (saved !== null) {
			checkbox.checked = saved === 'true';
		}
	});
};

/**
 * Start status polling for posts being analyzed
 */
const startStatusPolling = () => {
	// Find all posts that are currently being analyzed
	const analyzingPosts = document.querySelectorAll('.wegenius-analyzing');
	
	if (analyzingPosts.length === 0) return;

	// Poll status every 5 seconds
	const pollInterval = setInterval(() => {
		analyzingPosts.forEach(async (container) => {
			const postId = container.dataset.postId;
			if (!postId) return;

			try {
				const response = await fetch(`/wp-json/wegenius/v1/analysis/status/${postId}`, {
					headers: {
						'X-WP-Nonce': window.wegeniusAdmin.nonce,
					},
				});

				if (response.ok) {
					const status = await response.json();
					updatePostStatus(postId, status);
				}
			} catch (error) {
				console.error('Status polling error:', error);
			}
		});

		// Stop polling if no more analyzing posts
		const currentAnalyzingPosts = document.querySelectorAll('.wegenius-analyzing');
		if (currentAnalyzingPosts.length === 0) {
			clearInterval(pollInterval);
		}
	}, 5000);
};

/**
 * Update post status based on analysis results
 */
const updatePostStatus = (postId, status) => {
	const actionsContainer = document.querySelector(`[data-post-id="${postId}"]`);
	if (!actionsContainer) return;

	// Update based on status
	if (status.status === 'completed' || status.status === 'failed') {
		// Analysis is done, update UI
		const statusText = status.status === 'completed' ? 'Analysis completed' : 'Analysis failed';
		const buttonText = status.status === 'completed' ? 'Re-scan' : 'Try Again';
		
		actionsContainer.innerHTML = `
			<button 
				type="button" 
				class="button button-primary wegenius-scan-btn" 
				data-post-id="${postId}"
			>
				${buttonText}
			</button>
			<div class="wegenius-last-analyzed">
				${statusText}: ${new Date().toLocaleString()}
			</div>
		`;

		// Show completion notice
		if (status.status === 'completed') {
			showNotice('Analysis completed successfully!', 'success');
		} else {
			// Check if it's an Action Scheduler error
			const errorMessage = status.analysis?.results?.error || 'Analysis failed. Please try again.';
			showNotice(errorMessage, 'error');
		}
	}
	// If still processing, keep the current UI
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', () => {
		initPostsPage();
		loadSavedStates();
	});
} else {
	initPostsPage();
	loadSavedStates();
}
