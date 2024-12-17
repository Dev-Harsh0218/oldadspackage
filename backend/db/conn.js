const mysql = require("mysql2");
require("dotenv").config();
console.log(process.env.DB_HOST);

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
  });

connection.connect((err) => {
    if (err) {
      console.error("Error connecting to MySQL:", err.stack);
      return;
    }
    console.log("Connected to MySQL as id", connection.threadId);
  
    //   comment under this
        const createTableQuery = `
        CREATE TABLE IF NOT EXISTS customImages (
            id INT AUTO_INCREMENT PRIMARY KEY,
        isWhite VARCHAR(255),
        imagePath VARCHAR(255),
        appUrl VARCHAR(255),
        isBanner BOOLEAN DEFAULT false
      )`;
  
    connection.query(createTableQuery, (createTableError) => {
        if (createTableError) {
            console.error('Error creating table:', createTableError);
          } else {
              console.log('Table created or already exists.');
            }
          });
  
    // //       // Insert image data into the table
          // const insertDataQuery = `
          //   INSERT INTO customImages (isWhite, imagePath, appUrl) VALUES
            // (false, 'com.as.speakercleaner-1.png', 'https://play.google.com/store/apps/details?id=com.as.speakercleaner&hl=en-IN'),
            // (false, 'com.as.speakercleaner.png', 'https://play.google.com/store/apps/details?id=com.as.speakercleaner&hl=en-IN'),
            // (true, 'com.clock.sandtimer-1.png', 'https://play.google.com/store/apps/details?id=com.clock.sandtimer&hl=en-IN'),
            // (true, 'com.clock.sandtimer.png', 'https://play.google.com/store/apps/details?id=com.clock.sandtimer&hl=en-IN'),
            // (false, 'com.meditation.medit8-1.png', 'https://play.google.com/store/apps/details?id=com.meditation.medit8&hl=en-IN'),
            // (false, 'com.meditation.medit8-2.png', 'https://play.google.com/store/apps/details?id=com.meditation.medit8&hl=en-IN'),
            // (false, 'com.walli.hd.wallpapervideo.mp4', 'https://play.google.com/store/apps/details?id=com.walli.hd.wallpaper&hl=en-IN'),
            // (false, 'commeditationmedit8video.mp4', 'https://play.google.com/store/apps/details?id=com.walli.hd.wallpaper&hl=en-IN'),
            // (false, 'com.meditation.medit8.png', 'https://play.google.com/store/apps/details?id=com.meditation.medit8&hl=en-IN'),
            // (false, 'com.music.focusflow-1.png', 'https://play.google.com/store/apps/details?id=com.music.focusflow&hl=en-IN'),
            // (false, 'com.music.focusflow.png', 'https://play.google.com/store/apps/details?id=com.music.focusflow&hl=en-IN'),
            // (true, 'com.walli.hd.wallpaper1.png', 'https://play.google.com/store/apps/details?id=com.walli.hd.wallpaper&hl=en-IN'),
            // (true, 'com.walli.hd.wallpaper2.png', 'https://play.google.com/store/apps/details?id=com.walli.hd.wallpaper&hl=en-IN'),
            // (true, 'com.walli.hd.wallpaper3.png', 'https://play.google.com/store/apps/details?id=com.walli.hd.wallpaper&hl=en-IN')
          // `;
          // connection.query(insertDataQuery, (insertDataError) => {
          //     if (insertDataError) {
          //         console.error('Error inserting data:', insertDataError);
          //       } else {
          //           console.log('Data inserted into the table.');
          //         }
          //       });
        
    // // // comment over this

    const createClickTrackingTableQuery = `
      CREATE TABLE IF NOT EXISTS ClickTracking (
        id INT AUTO_INCREMENT PRIMARY KEY,
        imageId VARCHAR(255) UNIQUE,
        clickCount INT DEFAULT 0,
        date DATETIME DEFAULT CURRENT_TIMESTAMP
      )`;
  
    connection.query(createClickTrackingTableQuery, (createTableError) => {
      if (createTableError) {
        console.error("Error creating ClickTracking table:", createTableError);
      } else {
        console.log("ClickTracking table created or already exists.");
      }
    });
  
    const createDailyClicksTableQuery = `
    CREATE TABLE IF NOT EXISTS DailyClicks (
      id INT AUTO_INCREMENT PRIMARY KEY,
      date DATE,
      clickedItem VARCHAR(255),
      clickCount INT DEFAULT 0,
      UNIQUE KEY unique_date_item (date, clickedItem)
    )
  `;
  
  connection.query(createDailyClicksTableQuery, (createTableError) => {
    if (createTableError) {
      console.error("Error creating DailyClicks table:", createTableError);
    } else {
      console.log("DailyClicks table created or already exists.");
    }
  });
  
    const createImpressionsTable = `
    CREATE TABLE IF NOT EXISTS Impressions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      date DATE,
      clickedItem VARCHAR(255),
      clickCount INT DEFAULT 0,
      UNIQUE KEY unique_date_item (date, clickedItem)
    )
  `;
  
  
  connection.query(createImpressionsTable, (createTableError) => {
    if (createTableError) {
      console.error("Error creating Impressions table:", createTableError);
    } else {
      console.log("Impressions table created or already exists.");
    }
  });
  
    const createUsersApikeyTable = `
  CREATE TABLE IF NOT EXISTS ApiKey (
    id INT AUTO_INCREMENT PRIMARY KEY,
    UserName VARCHAR(255),
    ApiKey VARCHAR(255)
    )
    `;
  
    connection.query(createUsersApikeyTable, (createTableError) => {
      if (createTableError) {
        console.error("Error creating ApiKey table:", createTableError);
      } else {
        console.log("ApiKey table created or already exists.");
      }
    });
  
    const createAdsHandleTable = `
  CREATE TABLE IF NOT EXISTS AdsHandleTable (
    id INT AUTO_INCREMENT PRIMARY KEY,
    date DATE,
    ApkUniqueKey VARCHAR(255) UNIQUE,
    AdslistData JSON,
    Interstitial_ads JSON,
    Banner_ads JSON NULL
  )
  `;
  
    connection.query(createAdsHandleTable, (createTableError) => {
      if (createTableError) {
        console.error("Error creating AdsHandleTable table:", createTableError);
      } else {
        console.log("AdsHandleTable table created or already exists.");
      }
    });
  });