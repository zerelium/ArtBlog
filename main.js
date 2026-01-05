{
	// Function to test if media folder for a given week exists
	async function testMediaFolder(weekNum) {
		return new Promise((resolve) => {
			fetch(`media/${weekNum}/sketch.jpg`, { method: 'HEAD' })
				.then((response) => {
					resolve(response.ok);
				})
				.catch(() => {
					resolve(false);
				});
		});
	}

	// Function to get info text for a given week
	async function getInfoText(weekNum) {
		return new Promise((resolve) => {
			fetch(`media/${weekNum}/info`).then((response) => {
				if (response.ok) {
					response.text().then((text) => {
						resolve(text.trim());
					});
				} else {
					resolve(``);
				}
			});
		});
	}

	// Function to get the latest week number with media
	async function getLatestWeek() {
		// 53 weeks in a year so iterate up to 53
		// TODO: Could optimize with promises and/or binary search
		for (let weekNum = 1; weekNum <= 53; weekNum++) {
			const exists = await testMediaFolder(weekNum);
			if (!exists) {
				return weekNum - 1; // Return the last existing week
			}
		}
		return null; // No weeks found
	}

	/*
	<entry>
		<date>Week 1</date>
		<info>New Beginnings</info>
		<content>
			<img src="media/1/sketch.jpg" alt="Sketch for Week 1 - 2026">
			<img src="media/1/finished.jpg" alt="Final Artwork for Week 1 - 2026">
		</content>
	</entry>
	*/
	// Function to create and append an entry for a given week
	async function createEntry(weekNum) {
		const entry = document.createElement('entry');

		const date = document.createElement('date');
			date.textContent = `Week ${weekNum}`;
		entry.appendChild(date);

		const infoText = await getInfoText(weekNum);
		const info = document.createElement('info');
			info.textContent = infoText;
		entry.appendChild(info);

		const content = document.createElement('content');
			const img1 = document.createElement('img');
				img1.src = `media/${weekNum}/sketch.jpg`;
				img1.alt = `Sketch for Week ${weekNum}`;
			content.appendChild(img1);

			const img2 = document.createElement('img');
				img2.src = `media/${weekNum}/finished.jpg`;
				img2.alt = `Final Artwork for Week ${weekNum}`;
			content.appendChild(img2);
		entry.appendChild(content);

		// Attach dataset and click handlers so images open the lightbox
		img1.dataset.week = weekNum;
		img1.dataset.index = 0;
		img1.style.cursor = 'zoom-in';
		img1.addEventListener('click', () => openLightbox(weekNum, 0));

		img2.dataset.week = weekNum;
		img2.dataset.index = 1;
		img2.style.cursor = 'zoom-in';
		img2.addEventListener('click', () => openLightbox(weekNum, 1));

		document.querySelector('blog > entries').appendChild(entry);
	}


	// Lightbox implementation
	let _currentWeek = null;
	let _currentIndex = 0; // 0 = sketch, 1 = finished

	function buildLightboxDOM() {
		if (document.querySelector('.lightbox-overlay')) return; // already built

		const overlay = document.createElement('div');
		overlay.className = 'lightbox-overlay';
		overlay.innerHTML = `
			<div class="lightbox-content">
				<button class="lightbox-close" aria-label="Close">×</button>
				<button class="lightbox-arrow lightbox-prev" aria-label="Previous"><</button>
				<img class="lightbox-img" src="" alt="">
				<button class="lightbox-arrow lightbox-next" aria-label="Next">></button>
			</div>
		`;
		overlay.addEventListener('click', (e) => {
			// Close when clicking outside the image/content
			if (e.target === overlay) closeLightbox();
		});

		document.body.appendChild(overlay);

		// wire up controls
		overlay.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
		overlay.querySelector('.lightbox-next').addEventListener('click', nextImage);
		overlay.querySelector('.lightbox-prev').addEventListener('click', prevImage);

		// keyboard navigation
		document.addEventListener('keydown', (e) => {
			if (!document.querySelector('.lightbox-overlay') || document.querySelector('.lightbox-overlay').classList.contains('hidden')) return;
			if (e.key === 'Escape') closeLightbox();
			if (e.key === 'ArrowRight') nextImage();
			if (e.key === 'ArrowLeft') prevImage();
		});
	}

	function openLightbox(weekNum, index) {
		buildLightboxDOM();
		_currentWeek = weekNum;
		_currentIndex = index;
		showImage();
		document.querySelector('.lightbox-overlay').classList.remove('hidden');
		document.body.style.overflow = 'hidden'; // prevent background scroll
	}

	function closeLightbox() {
		const overlay = document.querySelector('.lightbox-overlay');
		if (!overlay) return;
		overlay.classList.add('hidden');
		document.body.style.overflow = '';
	}

	function showImage() {
		const imgEl = document.querySelector('.lightbox-img');
		if (!imgEl || _currentWeek === null) return;
		const src = _currentIndex === 0 ? `media/${_currentWeek}/sketch.jpg` : `media/${_currentWeek}/finished.jpg`;
		imgEl.src = src;
		imgEl.alt = `${_currentIndex === 0 ? 'Sketch' : 'Finished'} for Week ${_currentWeek}`;
	}

	function nextImage() {
		_currentIndex = (_currentIndex + 1) % 2; // toggle between 0 and 1
		showImage();
	}

	function prevImage() {
		_currentIndex = (_currentIndex + 1) % 2; // same as next for two images toggling
		showImage();
	}

	
	// On page load, build the entries using the helper functions
	(async function init() {
		const latestWeek = await getLatestWeek();
		console.log(`Latest week with media: ${latestWeek}`);

		if (latestWeek !== null) {
			for (let weekNum = 1; weekNum <= latestWeek; weekNum++) {
				await createEntry(weekNum);
			}
		} else {
			console.log('No media folders found.');
		}
	})();
}