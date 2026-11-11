/* =========================================================
   SITE CONTENT — the only file you need to edit to update
   your resume and your articles / documents.

   HOW TO ADD A DOCUMENT (PDF, Word, slides…)
     1. Put the file in the "documents" folder next to index.html
        e.g.  documents/consolidation-playbook.pdf
     2. Add an entry below with  url: 'documents/consolidation-playbook.pdf'

   HOW TO ADD AN ONLINE ARTICLE (LinkedIn post, Medium, news, Google Drive…)
     Just paste the full link into  url: 'https://...'

   Tip: avoid spaces in file names — use dashes instead.
   ========================================================= */

window.SITE_CONTENT = {

  resume: {
    file: 'documents/Soh-Weng-Sing-Resume.pdf',   // put your resume PDF here
    downloadName: 'Soh-Weng-Sing-Resume.pdf',      // file name visitors get when downloading
    updated: 'Nov 2026'                            // shown on the resume card ('' to hide)
  },

  // Newest first. While this list is empty, the site shows "Articles coming soon".
  articles: [

    // ---- Copy a block, remove the // at the start of each line, then fill it in ----

    // {
    //   title:   'Cutting month-end close from 15 days to 9',
    //   type:    'LinkedIn',          // any label: Article · LinkedIn · PDF · Report · Slides
    //   date:    'Dec 2026',
    //   summary: 'One or two lines describing what readers will get.',
    //   url:     'https://www.linkedin.com/pulse/your-article-link',
    //   download: false               // false = opens in a new tab
    // },

    // {
    //   title:   'Group Consolidation Checklist',
    //   type:    'PDF',
    //   date:    'Jan 2027',
    //   summary: 'A practical checklist for multi-entity month-end.',
    //   url:     'documents/group-consolidation-checklist.pdf',
    //   download: true                // true = downloads the file instead
    // },

  ]
};
