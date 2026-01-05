// main.js - this gets linked in index.html to build the front end page

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

	document.querySelector('blog > entries').appendChild(entry);
}

// On page load,
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