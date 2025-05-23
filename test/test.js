function displayResult(summaryData) {
    const result_tag = document.getElementById('result_content');
    console.log('🖼 Displaying result:', summaryData);

    const resultContainer = document.getElementById('result_content');
    resultContainer.innerHTML = '';  // Clear previous content

    if (!summaryData) {
        result_tag.style.display = 'block';
        resultContainer.textContent = '⚠️ No data to display. Click the download button to get the RAW HTML';
        return;
    }

    // Fallback test data
    const testSummary = {
        page_summary: "Is there some issue in this process? Please retry or refresh the page and restart the process."
    };

    summaryData = summaryData || testSummary;

    if (summaryData) {
        result_tag.style.display = 'block';
    } else {
        result_tag.style.display = 'none';
    }

    // Create and append the paragraph element
    const summary = document.createElement('p');
    summary.innerHTML = `<strong>Page Summary:</strong> `;
    summary.classList.add('summary-paragraph');
    resultContainer.appendChild(summary);

    // Start typewriter effect
    typeText(summary, summaryData.page_summary, 30);

    adjustResultHeight(result_tag);
}

document.getElementById('result_content').scrollIntoView({ behavior: 'smooth' });

function typeText(element, text, speed, onComplete) {
    let i = 0;

    function typeChar() {
        if (i < text.length) {
            element.innerHTML += text.charAt(i);

            const container = document.getElementById('result_content');
            container.style.height = 'auto';
            container.style.height = container.scrollHeight + 'px';

            i++;
            setTimeout(typeChar, speed);
        } else {
            if (typeof onComplete === 'function') {
                onComplete();
            }
        }
    }

    typeChar();
}

function adjustResultHeight(container) {
    container.style.height = 'auto';
    const contentHeight = container.scrollHeight;
    container.style.height = `${contentHeight}px`;
}

function renderSummary(data) {
    const container = document.getElementById('result_content');
    container.innerHTML = '';

    // Page Title
    if (data.page_title) {
        const title = document.createElement('h2');
        title.textContent = data.page_title;
        title.classList.add('page-title');
        container.appendChild(title);
    }

    // Page Summary
    if (data.page_summary) {
        const label = document.createElement('span');
        label.textContent = 'Summary:';
        label.classList.add('field-label');

        const summary = document.createElement('p');
        summary.textContent = data.page_summary;
        summary.classList.add('summary-text');

        container.appendChild(label);
        container.appendChild(summary);
    }

    // Header Info
    if (data.header_info?.sub_headers?.length) {
        const h3 = document.createElement('h3');
        h3.textContent = 'Sub Headers:';
        h3.classList.add('section-header');
        container.appendChild(h3);

        const list = document.createElement('ul');
        list.classList.add('styled-list');
        data.header_info.sub_headers.forEach(header => {
            const li = document.createElement('li');
            li.textContent = header;
            list.appendChild(li);
        });
        container.appendChild(list);
    }

    // Content Summary
    if (data.content_summary) {
        const { introduction, main_points, conclusion } = data.content_summary;

        if (introduction) {
            const label = document.createElement('span');
            label.textContent = 'Introduction:';
            label.classList.add('field-label');

            const intro = document.createElement('p');
            intro.textContent = introduction;
            intro.classList.add('section-intro');

            container.appendChild(label);
            container.appendChild(intro);
        }

        if (main_points?.length) {
            const label = document.createElement('span');
            label.textContent = 'Main Points:';
            label.classList.add('field-label');
            container.appendChild(label);

            const points = document.createElement('ul');
            points.classList.add('styled-list');
            main_points.forEach(pt => {
                const li = document.createElement('li');
                li.innerHTML = pt;
                points.appendChild(li);
            });
            container.appendChild(points);
        }

        if (conclusion) {
            const label = document.createElement('span');
            label.textContent = 'Conclusion:';
            label.classList.add('field-label');

            const concl = document.createElement('p');
            concl.textContent = conclusion;
            concl.classList.add('section-conclusion');

            container.appendChild(label);
            container.appendChild(concl);
        }
    }

    // Tables
    if (data.tables?.length) {
        data.tables.forEach(tableData => {
            const h3 = document.createElement('h3');
            h3.textContent = tableData.table_title;
            h3.classList.add('table-title');
            container.appendChild(h3);

            const table = document.createElement('table');
            table.classList.add('data-table');

            const thead = document.createElement('thead');
            const headerRow = document.createElement('tr');
            tableData.columns.forEach(col => {
                const th = document.createElement('th');
                th.textContent = col;
                headerRow.appendChild(th);
            });
            thead.appendChild(headerRow);
            table.appendChild(thead);

            const tbody = document.createElement('tbody');
            tableData.data.forEach(row => {
                const tr = document.createElement('tr');
                row.forEach(cell => {
                    const td = document.createElement('td');
                    td.textContent = cell;
                    tr.appendChild(td);
                });
                tbody.appendChild(tr);
            });
            table.appendChild(tbody);
            container.appendChild(table);
        });
    }

   // External Links
    if (data.external_sources?.external_links?.length) {
        const h3 = document.createElement('h3');
        h3.textContent = 'External Links';
        h3.classList.add('section-header');
        container.appendChild(h3);

        const list = document.createElement('ul');
        list.classList.add('styled-list');
        data.external_sources.external_links.forEach(link => {
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.href = link.startsWith('http') ? link : `https://${link}`;
            a.textContent = a.href;
            a.target = '_blank';
            a.rel = 'noopener noreferrer';
            li.appendChild(a);
            list.appendChild(li);
        });
        container.appendChild(list);
    } 

    // Additional Notes
    if (data.additional_notes) {
        const label = document.createElement('span');
        label.textContent = 'Additional Notes:';
        label.classList.add('field-label');

        const notes = document.createElement('p');
        notes.textContent = data.additional_notes;
        notes.classList.add('notes-text');

        container.appendChild(label);
        container.appendChild(notes);
    }
}




const summaryData = {
		"additional_notes": "The page contains extensive navigation links for tutorials, exercises, certifications, and services offered by W3Schools.  Many of these links appear to be internal to the w3schools.com domain. The page utilizes a responsive design adapting to different screen sizes, with different navigation elements shown based on screen size (large/medium/small).",
		"content_summary": {
			"conclusion": "<code>then()</code> is an ECMAScript6 (ES6) feature supported in all modern browsers since June 2017; it's not supported in Internet Explorer.",
			"introduction": "The <code>then()</code> method provides two callbacks: One function to run when a promise is fulfilled and one function to run when a promise is rejected.",
			"main_points": [
				"The <code>then()</code> method takes two callback functions as arguments: <code>fulfilled()</code> and <code>rejected()</code>.",
				"<code>fulfilled()</code> is executed if the promise resolves successfully.",
				"<code>rejected()</code> is executed if the promise is rejected.",
				"<code>then()</code> returns a new promise object."
			]
		},
		"external_sources": {
			"external_links": [
				"https://oss.maxcdn.com/libs/html5shiv/3.7.0/html5shiv.js",
				"https://oss.maxcdn.com/libs/respond.js/1.4.2/respond.min.js",
				"https://www.w3schools.com/js/js_promise.asp",
				"jsref_promise_catch.asp",
				"jsref_promise_finally.asp",
				"jsref_promise_then.asp",
				"https://www.youtube.com/@w3schools",
				"https://www.linkedin.com/company/w3schools.com/",
				"https://discord.com/invite/w3schools",
				"https://www.facebook.com/w3schoolscom/",
				"https://www.instagram.com/w3schools.com_official/",
				"https://campus.w3schools.com/products/w3schools-full-access-course",
				"/colors/colors_picker.asp",
				"/colors/colors_picker.asp",
				"https://profile.w3schools.com/log-in?redirect_url=https%3A%2F%2Fmy-learning.w3schools.com",
				"https://profile.w3schools.com/log-in?redirect_url=https%3A%2F%2Fpathfinder.w3schools.com",
				"https://profile.w3schools.com/sign-up?redirect_url=https%3A%2F%2Fpathfinder.w3schools.com",
				"//www.w3schools.com",
				"/plus/index.php",
				"/spaces/index.php",
				"https://campus.w3schools.com/collections/certifications",
				"/academy/index.php",
				"/academy/index.php",
				"//www.w3schools.com/about/about_copyright.asp",
				"//www.w3schools.com/about/about_privacy.asp",
				"//www.w3schools.com/about/about_copyright.asp",
				"//www.w3schools.com/w3css/default.asp",
				"/forum/default.asp",
				"/about/default.asp",
				"/academy/index.php",
				"https://campus.w3schools.com/collections/course-catalog"
			]
		},
		"header_info": {
			"main_header": "JavaScript Promise then()",
			"sub_headers": [
				"Example",
				"Description",
				"Syntax",
				"Parameters",
				"Return Value",
				"Related Pages:",
				"Browser Support"
			]
		},
		"page_summary": "This W3Schools webpage provides a reference for the JavaScript Promise then() method.  The page begins with an example of the method's usage, followed by a description explaining its purpose: handling both fulfilled and rejected promises with callback functions.  The syntax and parameters are clearly defined in a table, along with the return value (a new promise).  The content also includes a section on browser support, noting compatibility with modern browsers and incompatibility with Internet Explorer.  Numerous links to related tutorials, references, and other JavaScript concepts are provided, demonstrating the comprehensive nature of the W3Schools documentation.  The page is well-structured, using clear headings, code examples, and tables to present information effectively. The tone is informative and technical, suitable for programmers looking for quick and precise information.",
		"page_title": "JavaScript Promise then()",
		"tables": [
			{
				"columns": [
					"Parameter",
					"Description"
				],
				"data": [
					[
						"fulfilled()",
						"Function to run when the promise is fulfilled"
					],
					[
						"rejected()",
						"Function to run when the promise is rejected"
					]
				],
				"table_title": "Parameters"
			},
			{
				"columns": [
					"Type",
					"Description"
				],
				"data": [
					[
						"Object",
						"A new Promise Object"
					]
				],
				"table_title": "Return Value"
			},
			{
				"columns": [
					"Browser",
					"Version",
					"Date"
				],
				"data": [
					[
						"Chrome",
						"51",
						"May 2016"
					],
					[
						"Edge",
						"15",
						"Apr 2017"
					],
					[
						"Firefox",
						"54",
						"Jun 2017"
					],
					[
						"Safari",
						"10",
						"Sep 2016"
					],
					[
						"Opera",
						"38",
						"Jun 2016"
					]
				],
				"table_title": "Browser Support"
			}
		],
		"total_images": 2,
		"total_links": 223
	}

renderSummary(summaryData);
