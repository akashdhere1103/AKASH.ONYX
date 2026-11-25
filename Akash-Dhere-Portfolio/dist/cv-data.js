const enerlogs = {
  id: 'enerlogs',
  type: 'Internship',
  title: 'Full-Stack Developer Intern',
  organisation: 'Enerlogs Analytics Pvt. Ltd.',
  dates: '13 Oct 2025 – 10 Apr 2026',
  points: [
    'Contributed to development and maintenance of a live web application in the renewable-energy sector.',
    'Worked on backend and frontend features independently and with team members.',
    'Investigated reported portal issues and supported debugging and bug fixes.',
    'Used PHP and CodeIgniter 4 with MySQL for backend development and application data.',
    'Built and updated interfaces with JavaScript, jQuery, AJAX, HTML, CSS and Bootstrap.',
    'Used Tabulator and amCharts to display meter readings and other application data.'
  ]
};

const agni = {
  id: 'agni',
  type: 'Practical training',
  title: 'Trainee Technician',
  organisation: 'Agni Aero-Sports Adventure Academy Pvt. Ltd.',
  dates: '13 Feb – 2 Jun 2023',
  points: [
    'Completed practical training in aircraft construction and maintenance.',
    'Gained exposure to the Cessna 180, Zen Air microlight and X-Air microlight.',
    'Took part in technician-level learning activities related to aircraft construction.'
  ]
};

const taneja = {
  id: 'taneja',
  type: 'Industrial training',
  title: 'Aeronautical Engineering Intern',
  organisation: 'Taneja Aerospace and Aviation Limited',
  dates: '7–28 Dec 2021',
  points: [
    'Completed industrial training covering aerodynamics, Air Traffic Control (ATC) and aircraft maintenance.',
    'Gained exposure to heat treatment, process engineering and aircraft assembly.',
    'Learned about sheet-metal operations, CNC machining and general machining.'
  ]
};

export const profiles = {
  software: {
    label: 'Software Development',
    summary: 'B.Tech graduate with full-stack internship experience on a live renewable-energy web application. Worked on features, portal troubleshooting, databases, and data displays.',
    artworkLabel: 'Full-stack development',
    caption: 'Web applications · Databases · Data displays',
    experience: [
      enerlogs,
      {
        id: 'meter',
        type: 'Selected project',
        title: 'Meter Monitoring and Energy Data Display',
        organisation: 'Meter-monitoring demo',
        points: [
          'Worked on a demo with a Tabulator table, a meter details modal and date-based readings.',
          'Worked with total, import and export energy values for tables and charts.',
          'Handled data flow between controller and model methods for plant and meter information.'
        ]
      },
      {
        id: 'mern',
        type: 'Training',
        title: 'MERN Stack Development Training',
        points: [
          'Completed hands-on training with exposure to MongoDB, Express.js, ReactJS and Node.js.'
        ]
      }
    ],
    skills: [
      { name: 'Backend', items: ['PHP', 'CodeIgniter 4'] },
      { name: 'Frontend', items: ['JavaScript', 'HTML', 'CSS', 'jQuery', 'Bootstrap'] },
      { name: 'Databases', items: ['MySQL', 'Oracle'] },
      { name: 'Tools', items: ['AJAX', 'Tabulator', 'amCharts'] },
      { name: 'MERN training', items: ['MongoDB', 'Express.js', 'ReactJS', 'Node.js'] },
      { name: 'Work skills', items: ['Application troubleshooting', 'Debugging', 'Database operations', 'Data handling', 'Team collaboration'] }
    ]
  },
  aero: {
    label: 'Aeronautical Engineering',
    summary: 'B.Tech Aeronautical Engineering graduate with practical training in aircraft construction and maintenance and industrial exposure to aircraft assembly and aerospace manufacturing.',
    artworkLabel: 'Aircraft construction and maintenance',
    caption: 'Aircraft maintenance · Production · Manufacturing',
    experience: [
      agni,
      taneja,
      {
        ...enerlogs,
        type: 'Additional experience',
        points: [
          'Contributed to features and maintenance on a live renewable-energy application.',
          'Investigated reported portal issues and supported debugging and bug fixes.',
          'Used PHP, CodeIgniter 4, MySQL, JavaScript, jQuery, AJAX, HTML, CSS and Bootstrap.',
          'Used Tabulator and amCharts to display application data and meter readings.'
        ]
      }
    ],
    skills: [
      { name: 'Aircraft exposure', items: ['Cessna 180', 'Zen Air microlight', 'X-Air microlight'] },
      { name: 'Aircraft work', items: ['Aircraft construction', 'Maintenance training', 'Aircraft assembly'] },
      { name: 'Manufacturing', items: ['Sheet-metal work', 'Heat treatment', 'CNC machining', 'General machining'] },
      { name: 'Engineering topics', items: ['Aerodynamics', 'Air Traffic Control (ATC)', 'Process engineering'] },
      { name: 'Work skills', items: ['Problem-solving', 'Teamwork', 'Technical learning', 'Documentation'] },
      { name: 'Computer skills', items: ['PHP', 'JavaScript', 'HTML', 'CSS', 'Bootstrap', 'jQuery', 'ReactJS', 'CodeIgniter 4', 'MySQL', 'Oracle', 'AJAX', 'Tabulator', 'amCharts'] }
    ]
  }
};

export const roles = {
  fullstack: {
    label: 'Full-Stack Developer',
    fit: 'software',
    entry: 'enerlogs',
    note: 'Application development',
    signals: ['PHP', 'CodeIgniter 4', 'JavaScript'],
    evidence: 'The Enerlogs internship covers frontend and backend work on a live application, using PHP, CodeIgniter 4, MySQL, JavaScript and jQuery.',
    other: 'Also lists the Enerlogs internship and its technology stack.',
    detail: 'Adds the meter-monitoring project, including controller and model data flow, plus MERN stack training.'
  },
  php: {
    label: 'PHP / CodeIgniter Developer',
    fit: 'software',
    entry: 'meter',
    note: 'Data flow',
    signals: ['PHP', 'CodeIgniter 4', 'MySQL'],
    evidence: 'The CV connects PHP and CodeIgniter 4 work at Enerlogs with a project that used controller and model methods for plant and meter data.',
    other: 'Lists PHP, CodeIgniter 4 and MySQL in the Enerlogs internship.',
    detail: 'Describes backend work, database operations and the flow of project data between controller and model methods.'
  },
  frontend: {
    label: 'Frontend Web Developer',
    fit: 'software',
    entry: 'meter',
    note: 'Web interface',
    signals: ['JavaScript', 'Bootstrap', 'Tabulator'],
    evidence: 'The CV covers interface work with JavaScript, jQuery, HTML, CSS and Bootstrap, plus meter tables and charts built with Tabulator and amCharts.',
    other: 'Lists the frontend tools and display work under the Enerlogs internship.',
    detail: 'Adds a project example with a meter details modal and date-based readings. ReactJS is listed alongside MERN training exposure.'
  },
  support: {
    label: 'Web Application Support',
    fit: 'software',
    entry: 'enerlogs',
    note: 'Portal support',
    signals: ['Application troubleshooting', 'Debugging', 'MySQL'],
    evidence: 'The CV describes investigating live portal issues, supporting bug fixes and retrieving and managing application data with MySQL.',
    other: 'Also describes portal troubleshooting and bug fixing at Enerlogs.',
    detail: 'Pairs the live application support work with an explicit skills section covering troubleshooting, debugging and database operations.'
  },
  maintenance: {
    label: 'Aircraft Maintenance Support',
    fit: 'aero',
    entry: 'agni',
    signals: ['Maintenance training', 'Aircraft construction', 'Cessna 180'],
    evidence: 'The Agni trainee technician role documents practical training in construction and maintenance, with exposure to the Cessna 180, Zen Air and X-Air.',
    other: 'Lists the B.Tech in Aeronautical Engineering and focuses its experience section on software.',
    detail: 'Also records aircraft maintenance topics from industrial training at Taneja Aerospace and Aviation Limited.'
  },
  production: {
    label: 'Aircraft Production',
    fit: 'aero',
    entry: 'taneja',
    signals: ['Aircraft assembly', 'Aircraft construction', 'Sheet-metal work'],
    evidence: 'Taneja’s industrial training covered aircraft assembly and sheet-metal operations. The Agni placement adds practical aircraft construction training.',
    other: 'Lists the B.Tech in Aeronautical Engineering.',
    detail: 'Documents aircraft assembly and process engineering exposure at Taneja along with construction training at Agni.'
  },
  manufacturing: {
    label: 'Aerospace Manufacturing',
    fit: 'aero',
    entry: 'taneja',
    signals: ['Sheet-metal work', 'Heat treatment', 'CNC machining'],
    evidence: 'The Taneja internship documents training exposure to sheet-metal operations, heat treatment, CNC machining, general machining and process engineering.',
    other: 'Lists the B.Tech in Aeronautical Engineering and software development work.',
    detail: 'Groups the workshop and manufacturing skills together and ties them to the Taneja industrial training.'
  },
  aero: {
    label: 'Aeronautical Engineering',
    fit: 'aero',
    entry: 'taneja',
    signals: ['Aerodynamics', 'Air Traffic Control (ATC)', 'Process engineering'],
    evidence: 'The CV pairs the aeronautical B.Tech with industrial training in aerodynamics, air traffic control and maintenance, and practical training at Agni.',
    other: 'Lists the same B.Tech degree in the education section.',
    detail: 'Adds two aircraft-related internships, including the Taneja industrial training and the Agni technician placement.'
  }
};
