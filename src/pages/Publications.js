import React, { useState } from 'react';
import publicationsData from '../data/publications.json';
import './Publications.css';

// Function to format date: "Jan 2025" -> "Jan 2025" (already in correct format)
function formatDate(dateString) {
  if (!dateString) return '';
  // Date is already in "Jan 2025" format, return as is
  return dateString;
}

// Function to format name: "Thang Doan Viet" -> "Thang Viet Doan"
function formatAuthorName(name) {
  const normalizedName = name.trim();
  
  // Check if it's "Thang Doan Viet" and convert to "Thang Viet Doan"
  if (normalizedName === 'Thang Doan Viet' || 
      normalizedName === 'Thang DoanViet' ||
      normalizedName === 'ThangDoanViet') {
    return 'Thang Viet Doan';
  }
  
  // Check if it's "ThangDV" or similar variations
  if (normalizedName === 'ThangDV' || 
      normalizedName === 'ThangDV' ||
      normalizedName.toLowerCase() === 'thangdv') {
    return 'Thang Viet Doan';
  }
  
  // Check if it contains all three parts: Thang, Doan, Viet (in any order)
  const nameLower = normalizedName.toLowerCase();
  if (nameLower.includes('thang') && nameLower.includes('doan') && nameLower.includes('viet')) {
    // If it's already "Thang Viet Doan", return as is
    if (normalizedName === 'Thang Viet Doan') {
      return normalizedName;
    }
    // Otherwise, convert to "Thang Viet Doan"
    return 'Thang Viet Doan';
  }
  
  return normalizedName;
}

const USER_NAME = 'Thang Viet Doan';

// Resolve a path from publications.json: absolute URLs as is, local files from /public
function resolveAsset(path) {
  if (!path) return '';
  return /^https?:\/\//.test(path) ? path : `${process.env.PUBLIC_URL}/${path}`;
}

function getCorrespondingAuthors(pub) {
  return (pub['corresponding-authors'] || []).map(formatAuthorName);
}

// Envelope mark shown after a corresponding author's name
function CorrespondingMark() {
  return (
    <sup className="corresponding-mark" title="Corresponding author" aria-label="corresponding author">
      ✉
    </sup>
  );
}

// Function to render authors list
function renderAuthors(pub) {
  // Check if publication has first-authors or co-first-authors
  const firstAuthors = pub['first-authors'] || pub['co-first-authors'] || [];
  const otherAuthors = pub['other-authors'] || [];
  const regularAuthors = pub.authors || [];
  const correspondingAuthors = getCorrespondingAuthors(pub);

  // If we have first-authors structure
  if (firstAuthors.length > 0) {
    const allAuthors = [];

    // Process first authors: add * to first 3 if there are more than 1
    const shouldAddAsterisk = firstAuthors.length > 1;
    firstAuthors.forEach((author, idx) => {
      const formattedName = formatAuthorName(author);
      const displayName = shouldAddAsterisk && idx < 3 ? `${formattedName}*` : formattedName;
      const isUser = formattedName === USER_NAME;

      allAuthors.push(
        <span key={`first-${idx}`}>
          {isUser ? (
            <span className="author-highlight">{displayName}</span>
          ) : (
            displayName
          )}
          {correspondingAuthors.includes(formattedName) && <CorrespondingMark />}
        </span>
      );
    });

    // Add other authors
    otherAuthors.forEach((author, idx) => {
      const formattedName = formatAuthorName(author);
      const isUser = formattedName === USER_NAME;

      allAuthors.push(
        <span key={`other-${idx}`}>
          {isUser ? (
            <span className="author-highlight">{formattedName}</span>
          ) : (
            formattedName
          )}
          {correspondingAuthors.includes(formattedName) && <CorrespondingMark />}
        </span>
      );
    });
    
    // Render with commas
    return allAuthors.map((authorSpan, idx) => (
      <React.Fragment key={idx}>
        {authorSpan}
        {idx < allAuthors.length - 1 && ', '}
      </React.Fragment>
    ));
  }
  
  // Fallback to regular authors array
  return regularAuthors.map((author, authIdx) => {
    const formattedName = formatAuthorName(author);
    const isUser = formattedName === USER_NAME || author === 'ThangDV';

    return (
      <span key={authIdx}>
        {isUser ? (
          <span className="author-highlight">{formattedName}</span>
        ) : (
          formattedName
        )}
        {correspondingAuthors.includes(formattedName) && <CorrespondingMark />}
        {authIdx < regularAuthors.length - 1 && ', '}
      </span>
    );
  });
}

// Inline PDF reader shown below a publication
function PdfViewer({ pub, onClose }) {
  const pdfUrl = resolveAsset(pub.pdf);

  return (
    <div className="pdf-viewer">
      <div className="pdf-viewer-toolbar">
        <span className="pdf-viewer-title">{pub.title}</span>
        <div className="pdf-viewer-actions">
          <a href={pdfUrl} target="_blank" rel="noopener noreferrer">Open in new tab</a>
          <a href={pdfUrl} download>Download</a>
          <button type="button" onClick={onClose}>Close</button>
        </div>
      </div>
      <iframe
        className="pdf-viewer-frame"
        src={`${pdfUrl}#view=FitH`}
        title={`PDF: ${pub.title}`}
        loading="lazy"
      />
      <p className="pdf-viewer-fallback">
        PDF not showing? <a href={pdfUrl} target="_blank" rel="noopener noreferrer">Open it in a new tab</a>.
      </p>
    </div>
  );
}

function PublicationItem({ pub, expandedAbstracts, toggleAbstract, openPdfs, togglePdf }) {
  const titleHref = pub.link || resolveAsset(pub.pdf);
  const isCorrespondingAuthor = getCorrespondingAuthors(pub).includes(USER_NAME);

  return (
    <article className="publication-item">
      <div className="publication-wrapper">
        <div className="publication-content">
          {pub.type && <span className={`publication-type ${getTypeClass(pub.type)}`}>{pub.type}</span>}
          <h4 className="publication-title">
            {titleHref ? (
              <a href={titleHref} target="_blank" rel="noopener noreferrer">{pub.title}</a>
            ) : (
              pub.title
            )}
          </h4>
          <div className="publication-authors">
            {renderAuthors(pub)}
            {pub.venue && (
              <>
                {' in '}
                <span className="publication-venue">{pub.venue}</span>
              </>
            )}
          </div>
          <div className="publication-meta">
            {pub['public-date'] && <span>{formatDate(pub['public-date'])}</span>}
            {pub['open-access'] && <span className="publication-oa">Open Access</span>}
            {isCorrespondingAuthor && (
              <span className="publication-role">
                <span className="publication-role-badge">✉ Corresponding Author</span>
              </span>
            )}
          </div>
          {pub.notes && pub.notes.length > 0 && (
            <div className="publication-notes">
              <ul className="notes-list">
                {pub.notes.map((note, noteIdx) => (
                  <li key={noteIdx} className="note-item">{note}</li>
                ))}
              </ul>
            </div>
          )}
          <div className="publication-actions">
            <button
              className="btn-abstract"
              onClick={() => toggleAbstract(pub.id)}
            >
              {expandedAbstracts[pub.id] ? 'Hide Abstract' : 'Abstract'}
            </button>
            {pub.pdf && (
              <button
                className={`btn-pdf ${openPdfs[pub.id] ? 'active' : ''}`}
                onClick={() => togglePdf(pub.id)}
              >
                {openPdfs[pub.id] ? 'Hide PDF' : 'View PDF'}
              </button>
            )}
            {pub.link && (
              <a href={pub.link} target="_blank" rel="noopener noreferrer" className="btn-paper">
                Paper
              </a>
            )}
            {pub.code && (
              <a href={pub.code} target="_blank" rel="noopener noreferrer" className="btn-paper">
                Code
              </a>
            )}
          </div>
          {expandedAbstracts[pub.id] && pub.abstract && (
            <div className="publication-abstract">
              <div className="abstract-title">Abstract</div>
              <div className="abstract-text">{pub.abstract}</div>
            </div>
          )}
        </div>
        {pub.image && (
          <div
            className={`publication-image ${pub.pdf ? 'clickable' : ''}`}
            onClick={pub.pdf ? () => togglePdf(pub.id) : undefined}
            title={pub.pdf ? 'View PDF' : undefined}
          >
            <img src={resolveAsset(pub.image)} alt={pub.title} loading="lazy" />
          </div>
        )}
      </div>
      {openPdfs[pub.id] && pub.pdf && (
        <PdfViewer pub={pub} onClose={() => togglePdf(pub.id)} />
      )}
    </article>
  );
}

// Flatten every section of publications.json into one list, newest first
function getAllPublications() {
  return Object.values(publicationsData)
    .flat()
    .flatMap(yearGroup => yearGroup.items.map(pub => ({ ...pub, year: yearGroup.year })))
    .sort((a, b) => {
      if (a.year !== b.year) return Number(b.year) - Number(a.year);
      return (Date.parse(b['public-date']) || 0) - (Date.parse(a['public-date']) || 0);
    });
}

const ALL_PUBLICATIONS = getAllPublications();
const PUBLICATION_TYPES = [...new Set(ALL_PUBLICATIONS.map(pub => pub.type).filter(Boolean))];
const PUBLICATION_YEARS = [...new Set(ALL_PUBLICATIONS.map(pub => pub.year))];

// CSS class giving each publication type its own tag color
function getTypeClass(type) {
  return `type-${(type || '').toLowerCase().replace(/\s+/g, '-')}`;
}

const FIELD_FILTERS = [
  { value: 'CS', label: 'Computer Science' },
  { value: 'Economics', label: 'Economics' },
  { value: 'All', label: 'All' },
];

function Publications() {
  const [expandedAbstracts, setExpandedAbstracts] = useState({});
  const [openPdfs, setOpenPdfs] = useState({});
  const [activeFilter, setActiveFilter] = useState('CS'); // Default to CS
  const [typeFilter, setTypeFilter] = useState('All');
  const [yearFilter, setYearFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const toggleAbstract = (pubId) => {
    setExpandedAbstracts(prev => ({
      ...prev,
      [pubId]: !prev[pubId]
    }));
  };

  const togglePdf = (pubId) => {
    setOpenPdfs(prev => ({
      ...prev,
      [pubId]: !prev[pubId]
    }));
  };

  const query = searchQuery.trim().toLowerCase();
  const filteredPublications = ALL_PUBLICATIONS.filter(pub =>
    (activeFilter === 'All' || pub.category === activeFilter) &&
    (typeFilter === 'All' || pub.type === typeFilter) &&
    (yearFilter === 'All' || pub.year === yearFilter) &&
    (!query || pub.title.toLowerCase().includes(query))
  );

  // Group the filtered list by year, keeping the newest-first order
  const yearGroups = [];
  filteredPublications.forEach(pub => {
    const lastGroup = yearGroups[yearGroups.length - 1];
    if (lastGroup && lastGroup.year === pub.year) {
      lastGroup.items.push(pub);
    } else {
      yearGroups.push({ year: pub.year, items: [pub] });
    }
  });

  const hasExtraFilters = typeFilter !== 'All' || yearFilter !== 'All' || query;

  return (
    <div className="publications-page">
      <h2 className="page-title">PUBLICATIONS</h2>
      <p className="publications-note">
        For a full list of publications, visit my{' '}
        <a href="https://scholar.google.com/citations?view_op=list_works&hl=en&hl=en&user=Oi6ma9wAAAAJ&sortby=pubdate" target="_blank" rel="noopener noreferrer">Google Scholar page</a>.
      </p>
      <p className="publications-note">
        <sup>*</sup> indicates equal contribution (co-first authors).{' '}
        <sup className="corresponding-mark">✉</sup> indicates corresponding author.
      </p>

      <div className="publications-panel">
        <div className="publications-search-wrap">
          <svg className="publications-search-icon" viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <line x1="16.5" y1="16.5" x2="21" y2="21" />
          </svg>
          <input
            type="text"
            className="publications-search"
            placeholder="Search by title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search publications by title"
          />
          {searchQuery && (
            <button
              type="button"
              className="publications-search-clear"
              onClick={() => setSearchQuery('')}
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>

        <div className="filter-row">
          <span className="filter-label">Field</span>
          <div className="filter-chips">
            {FIELD_FILTERS.map(filter => (
              <button
                key={filter.value}
                className={`filter-chip ${activeFilter === filter.value ? 'active' : ''}`}
                onClick={() => setActiveFilter(filter.value)}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        <div className="filter-row">
          <span className="filter-label">Type</span>
          <div className="filter-chips">
            <button
              className={`filter-chip ${typeFilter === 'All' ? 'active' : ''}`}
              onClick={() => setTypeFilter('All')}
            >
              All
            </button>
            {PUBLICATION_TYPES.map(type => (
              <button
                key={type}
                className={`filter-chip filter-chip-type ${getTypeClass(type)} ${typeFilter === type ? 'active' : ''}`}
                onClick={() => setTypeFilter(type)}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <div className="filter-row">
          <span className="filter-label">Year</span>
          <div className="filter-chips">
            {['All', ...PUBLICATION_YEARS].map(year => (
              <button
                key={year}
                className={`filter-chip ${yearFilter === year ? 'active' : ''}`}
                onClick={() => setYearFilter(year)}
              >
                {year}
              </button>
            ))}
          </div>
        </div>

        <div className="filter-footer">
          <span className="publications-count">
            {filteredPublications.length} publication{filteredPublications.length === 1 ? '' : 's'}
          </span>
          {hasExtraFilters && (
            <button
              type="button"
              className="publications-reset"
              onClick={() => {
                setTypeFilter('All');
                setYearFilter('All');
                setSearchQuery('');
              }}
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {yearGroups.length === 0 && (
        <p className="publications-empty">No publications match your filters.</p>
      )}

      {yearGroups.map(yearGroup => (
        <section key={yearGroup.year} className="year-group">
          <h3 className="year-title">{yearGroup.year}</h3>
          {yearGroup.items.map(pub => (
            <PublicationItem
              key={pub.id}
              pub={pub}
              expandedAbstracts={expandedAbstracts}
              toggleAbstract={toggleAbstract}
              openPdfs={openPdfs}
              togglePdf={togglePdf}
            />
          ))}
        </section>
      ))}
    </div>
  );
}

export default Publications;
