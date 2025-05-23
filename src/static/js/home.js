const loader = document.getElementById('load')
loader.style.display = 'none'

const body = document.getElementsByTagName('body')

// Create the download button for json
let rawJSONData = ''; // Store raw json after fetch for download

function download_Data(filename) {
  if (!rawJSONData) {
    alert('No JSON data available to download.');
    return;
  }
  console.log('Download button was clicked..')
  // Ensure proper string format
  const jsonString = typeof rawJSONData === 'string' ? rawJSONData : JSON.stringify(rawJSONData, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename; // Custom file name
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

async function download_raw_html() {
  console.log('📥 Download button clicked...');

  const urlInput = document.getElementById('get_input').value;
  const htmlType = document.getElementById('html_type').value;

  if (!urlInput.trim()) {
    alert('Please enter a valid URL.');
    return;
  }

  const input_value = {
    URL: urlInput,
    type_of_html: htmlType
  };

  const loader = document.getElementById('load');       // Loader element
  const container = document.getElementById('container'); // Content container

  // Show loader and hide content
  if (loader && container) {
    container.style.display = 'none';
    loader.style.display = 'flex'; // Use flex if you're centering
  }

  try {
    const response = await fetch('http://127.0.0.1:5000/html/download', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input_value)
    });

    if (!response.ok) {
      throw new Error(`❌ HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();

    if (!data || !data.html) {
      console.warn('⚠️ "html" key missing in response');
      return;
    }

    // Store the raw HTML
    rawJSONData = data.html;

    // Trigger file download
    download_Data('parsed_data.html');

  } catch (error) {
    console.error('❌ Error during fetch or download:', error);
  } finally {
    // Hide loader and show container again
    if (loader && container) {
      loader.style.display = 'none';
      container.style.display = 'block';
    }
  }
}

document.getElementById('html_download').addEventListener('click', download_raw_html);


// ✅ Reusable fetcher function for both endpoints
async function fetchData(endpoint) {
  const urlInput = document.getElementById('get_input').value;
  const htmlType = document.getElementById('html_type').value;
  const loader = document.getElementById('load'); // Loader ID
  const container = document.getElementById('container')
  console.log('Type og HTML :',htmlType)
  if (!urlInput.trim()) {
    alert('Please enter a valid URL.');
    return null;
  }

  const input_value = {
    URL: urlInput,
    type_of_html: htmlType
  };

  try {
    if (loader && container) {
      container.style.display = 'none';
      loader.style.display = 'block';
    }
    console.log(`📡 Sending request to ${endpoint}...`);
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(input_value)
    });

    if (!response.ok) {
      throw new Error(`❌ HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();

    if (!data || !data.json) {
      console.warn('⚠️ "json" key missing in response');
      return null;
    }

    return data.json;
  } catch (error) {
    console.error('❌ Fetch error:', error);
    const resultContainer = document.getElementById('result_content');
    resultContainer.style.display = 'block';
    resultContainer.innerHTML = 'An error occurred while processing the URL.';
    return null;
  } finally {
      if (loader && container) {
      container.style.display = 'block';
      loader.style.display = 'none';
    }
  }
}

// ✅ Submit button: Fetch + Render
function setupSubmitButton() {
  document.getElementById('input_box_submit').addEventListener('click', async () => {
    console.log('✅ Submit button clicked');
    const data = await fetchData('http://127.0.0.1:5000/home');
    const loader = document.getElementById('load'); // Loader ID
    const container = document.getElementById('container')
    if (loader && container) {
    container.style.display = 'block';
    loader.style.display = 'none';
    }
    if (!data) {
      console.warn('⚠️ No data returned from /home');
      return;
    }

    rawJSONData = JSON.stringify(data, null, 2); // Save for download if needed
    console.log('🧪 submit Data:', data);
    renderSummary(data); // Display result on the page
  });
}

function setupParsingButton() {
  document.getElementById('parsing').addEventListener('click', async () => {
    console.log('🔍 Parsing button clicked');

    const data = await fetchData('http://127.0.0.1:5000/home/parsing');

    if (!data) {
      console.warn('⚠️ No data returned from /home/parsing');
      return;
    }

    console.log('🧪 Parsed Data:', data);

    rawJSONData = data; // Assign the raw object
    download_Data('parser.json'); // Then call the fixed download
  });
}

// ✅ Initialize buttons on DOM ready
document.addEventListener('DOMContentLoaded', function () {
  setupSubmitButton();
  setupParsingButton();
});

window.onload = function () {
  const result_tag = document.getElementById('result_content');
  result_tag.innerText = 'Welcome to AI Summarization';  // hide initially
};

function renderSummary(data) {
  const container = document.getElementById('result_content');
  container.innerHTML = ''; // Clear previous content

  if (!data) {
    container.style.display = 'block';
    container.textContent = '⚠️ No data to display. Click the download button to get the RAW JSON.';
    return;
  }

  // Page Title
  if (data.page_title) {
    const title = document.createElement('h2');
    title.style.fontWeight = 'bold';
    title.textContent = data.page_title;
    title.classList.add('page-title');
    container.appendChild(title);
  }

  // Page Summary
  if (data.page_summary) {
    const label = document.createElement('span');
    label.style.fontWeight = 'bold';
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
    h3.style.fontWeight = 'bold';
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
      label.style.fontWeight = 'bold';
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
      label.style.fontWeight = 'bold';
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

    // External Links
    if (data.external_sources && data.external_sources.external_links) {
      const externalLinks = data.external_sources.external_links;
      
      if (externalLinks.length > 0) {
        const linkTitle = document.createElement('h3');
        linkTitle.style.fontWeight = 'bold';
        linkTitle.textContent = 'External Sources';
        linkTitle.classList.add('external-links-title'); // Add a custom class if you want to style
        container.appendChild(linkTitle);

        const ul = document.createElement('ul');
        ul.classList.add('external-links-list'); // Optional class for styling

        externalLinks.forEach(link => {
          const li = document.createElement('li');
          const a = document.createElement('a');
          a.href = link;
          a.textContent = link;
          a.target = '_blank'; // Open link in new tab
          li.appendChild(a);
          ul.appendChild(li);
        });

        container.appendChild(ul);
      }
    }

    if (conclusion) {
      const label = document.createElement('span');
      label.style.fontWeight = 'bold';
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
      h3.style.fontWeight = 'bold';
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

    // Property Stats
  if ('total_properties' in data) {
    const stats = document.createElement('div');
    stats.classList.add('property-stats');
    stats.innerHTML = `
      <h3><b>Property Stats</b></h3>
      <p><strong>Total Properties:</strong> ${data.total_properties}</p>
      <p><strong>Sold Properties:</strong> ${data.sold_properties_count}</p>
      <p><strong>Unsold Properties:</strong> ${data.unsold_properties_count}</p>
    `;
    container.appendChild(stats);
  }

  function renderObjectBlock(title, obj) {
    if (!obj) return;
    const block = document.createElement('div');
    block.classList.add('property-block');
    const header = document.createElement('h4');
    header.style.fontWeight = 'bold';
    header.textContent = title;
    block.appendChild(header);
    const list = document.createElement('ul');
    Object.entries(obj).forEach(([k, v]) => {
      const li = document.createElement('li');
      li.innerHTML = `<strong>${k.replace(/_/g, ' ')}:</strong> ${Array.isArray(v) ? v.join(', ') : v}`;
      list.appendChild(li);
    });
    block.appendChild(list);
    container.appendChild(block);
  }

  renderObjectBlock('Lowest Price Property', data.lowest_price_property);
  renderObjectBlock('Highest Price Property', data.highest_price_property);

  // Render lists
  function renderPropertyList(title, list) {
    if (!list?.length) return;
    const section = document.createElement('div');
    section.classList.add('property-section');
    const header = document.createElement('h3');
    header.style.fontWeight = 'bold';
    header.textContent = title;
    section.appendChild(header);
    list.forEach(item => {
      renderObjectBlock('', item);
    });
    container.appendChild(section);
  }

  renderPropertyList('Newly Listed Properties', data.newly_listed_properties);
  renderPropertyList('Recently Sold Properties', data.recently_sold_properties);

  // Categorized Properties
  if (data.categorized_properties) {
    const catSection = document.createElement('div');
    catSection.innerHTML = '<h3><b>Categorized Properties</b></h3>';
    for (const [type, props] of Object.entries(data.categorized_properties)) {
      renderPropertyList(`${type.charAt(0).toUpperCase() + type.slice(1)} Properties`, props);
    }
  }

  // Property Summary Table
  if (data.property_summary_table?.length) {
    const tableTitle = document.createElement('h3');
    tableTitle.style.fontWeight = 'bold';
    tableTitle.textContent = 'Property Summary Table';
    container.appendChild(tableTitle);

    const table = document.createElement('table');
    table.classList.add('data-table-prpperty');

    const headers = Object.keys(data.property_summary_table[0]);
    const thead = document.createElement('thead');
    const headRow = document.createElement('tr');
    headers.forEach(h => {
      const th = document.createElement('th');
      th.textContent = h.replace(/_/g, ' ');
      headRow.appendChild(th);
    });
    thead.appendChild(headRow);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    data.property_summary_table.forEach(row => {
      const tr = document.createElement('tr');
      headers.forEach(k => {
        const td = document.createElement('td');
        td.textContent = Array.isArray(row[k]) ? row[k].join(', ') : row[k];
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });

    table.appendChild(tbody);
    container.appendChild(table);
  }

  // Property Details
  renderPropertyList('Property Details', data.property_details);

  // Price Trends
  renderPropertyList('Property Price Trends', data.property_price_trends);

  // Additional Notes
  if (data.additional_notes) {
    const label = document.createElement('span');
    label.style.fontWeight = 'bold';
    label.textContent = 'Additional Notes:';
    label.classList.add('field-label');

    const notes = document.createElement('p');
    notes.textContent = data.additional_notes;
    notes.classList.add('notes-text');

    container.appendChild(label);
    container.appendChild(notes);
  }

  // Check if broadband data is an array
  const broadbandList = Array.isArray(data) ? data : data.broadband || [];

  if (broadbandList.length > 0) {
    // Find best deal by lowest price
    const minPrice = Math.min(
      ...broadbandList.map(p => parseFloat(p.price)).filter(p => !isNaN(p))
    );

    broadbandList.forEach(entry => {
      const isBestDeal = parseFloat(entry.price) === minPrice;

      const broadbandSection = document.createElement('div');
      broadbandSection.classList.add('broadband-section');
      broadbandSection.style.marginBottom = '20px';
      broadbandSection.style.padding = '15px';
      broadbandSection.style.borderRadius = '8px';
      broadbandSection.style.backgroundColor = isBestDeal ? '#e6ffec' : '#f9f9f9';
      broadbandSection.style.border = isBestDeal ? '2px solid green' : '1px solid #ddd';

      if (isBestDeal) {
        const bestLabel = document.createElement('div');
        bestLabel.textContent = '💡 Best Deal';
        bestLabel.style.fontWeight = 'bold';
        bestLabel.style.color = 'green';
        bestLabel.style.marginBottom = '10px';
        broadbandSection.appendChild(bestLabel);
      }

      const addInfo = (label, value) => {
        if (value !== undefined && value !== null && value !== '') {
          const p = document.createElement('p');
          p.innerHTML = `<strong>${label}:</strong> ${value}`;
          broadbandSection.appendChild(p);
        }
      };

      addInfo('Provider', entry.provider);
      addInfo('Price ($/month)', entry.price);
      addInfo('Download Speed', entry.download_speed ? entry.download_speed + ' Mbps' : null);
      addInfo('Upload Speed', entry.upload_speed ? entry.upload_speed + ' Mbps' : null);
      addInfo('Connection Type', entry.connection_type);
      addInfo('Data Cap', entry.data_cap);
      addInfo('Contract', entry.contract);
      addInfo('Equipment Fee', entry.equipment_fee);
      addInfo('Availability', entry.availability);

      // Features list
      if (Array.isArray(entry.features) && entry.features.length > 0) {
        const featureHeader = document.createElement('span');
        featureHeader.textContent = 'Features:';
        featureHeader.classList.add('field-label');
        broadbandSection.appendChild(featureHeader);

        const ul = document.createElement('ul');
        ul.classList.add('styled-list');

        entry.features.forEach(feature => {
          const li = document.createElement('li');
          li.textContent = feature;
          ul.appendChild(li);
        });

        broadbandSection.appendChild(ul);
      }

      container.appendChild(broadbandSection);
    });
  } else {
    const noBroadband = document.createElement('p');
    noBroadband.textContent = 'No broadband data available.';
    container.appendChild(noBroadband);
  }
}



