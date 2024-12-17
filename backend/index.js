const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const fs = require("fs");
const mysql = require("mysql2");
const cors = require("cors");
const session = require("express-session");
const multer = require("multer");
const { connect } = require("http2");
const e = require("express");
const app = express();
require("dotenv").config();
const port = process.env.PORT || 5005;

//db connect
require("./db/conn.js");

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_HOST,
});

app.use("/images", express.static(path.join(__dirname, "public/images")));
app.use("/videos", express.static(path.join(__dirname, "public/videos")));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/images/");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname); // Append extension
  },
});

const upload = multer({ storage: storage });

app.post("/uploadImage", upload.single("image"), (req, res) => {
  try {
    const file = req.file;
    console.log(file);
    if (!file) {
      return res.status(400).send("No file uploaded.");
    }
    // const query = `INSERT INTO customImages (imagePath,appUrl) VALUES (file.filename,file.path)`;
    const imageUrl = `/images/${file.filename}`;
    const appUrl = req.body.appUrl;
    const isWhite = req.body.isWhite;
    const isBanner = req.body.isBanner;

    console.log(isBanner);

    // query for the insertion of the image in customImages tables
    const query = `INSERT INTO customImages (imagePath,appUrl,isWhite,isBanner) VALUES (?,?,?,?)`;

    connection.query(
      query,
      [file.filename, appUrl, isWhite, isBanner],
      (error, results) => {
        if (error) {
          console.error("Error inserting data into customImages table:", error);
          return res.status(500).json({ error: "Internal Server Error" });
        } else {
          console.log("Data inserted successfully:", results);
          return res.status(200).json({
            message: "File uploaded successfully",
            imageUrl: imageUrl,
          });
        }
      }
    );
  } catch (error) {
    res.status(500).send("Error uploading file");
  }
});

app.post("/addAdsHandleData", (req, res) => {
  const { ApkUniqueKey, AdslistData } = req.body;
  console.log(ApkUniqueKey, AdslistData);
  const date = new Date().toISOString().slice(0, 10);
  // Query to check if ApkUniqueKey exists
  const checkQuery = `SELECT AdslistData FROM AdsHandleTable WHERE ApkUniqueKey = ?`;
  connection.query(checkQuery, [ApkUniqueKey], (checkError, checkResults) => {
    if (checkError) {
      console.error(
        "Error checking ApkUniqueKey in AdsHandleTable:",
        checkError
      );
      return res
        .status(500)
        .send("Error checking ApkUniqueKey in AdsHandleTable");
    }

    if (checkResults.length > 0) {
      // ApkUniqueKey exists, update the existing row
      const existingAdslistData = checkResults[0].AdslistData
      const updatedAdslistData = Array.from(
        new Set(existingAdslistData.concat(AdslistData))
      );

      const updateQuery = `UPDATE AdsHandleTable SET date = ?, AdslistData = ? WHERE ApkUniqueKey = ?`;
      connection.query(
        updateQuery,
        [date, JSON.stringify(updatedAdslistData), ApkUniqueKey],
        (updateError, updateResults) => {
          if (updateError) {
            console.error(
              "Error updating data in AdsHandleTable:",
              updateError
            );
            return res
              .status(500)
              .send("Error updating data in AdsHandleTable");
          } else {
            console.log('')
            return res
              .status(200)
              .send("Data updated successfully in AdsHandleTable");
          }
        }
      );
    } else {
      // ApkUniqueKey does not exist, insert a new row
      const insertQuery = `INSERT INTO AdsHandleTable (date, ApkUniqueKey, AdslistData) VALUES (?, ?, ?)`;
      connection.query(
        insertQuery,
        [date, ApkUniqueKey, JSON.stringify(Array.from(new Set(AdslistData)))],
        (insertError, insertResults) => {
          if (insertError) {
            console.error(
              "Error inserting data into AdsHandleTable:",
              insertError
            );
            return res
              .status(500)
              .send("Error inserting data into AdsHandleTable");
          } else {
            return res
              .status(200)
              .send("Data inserted successfully into AdsHandleTable");
          }
        }
      );
    }
  });
});

app.get('/',(req,res)=>{
  res.send("hello")
})

app.get("/getsAllData", (req, res) => {
  const query = `
    WITH AdsItems AS (
      SELECT
        a.id,
        a.date,
        a.ApkUniqueKey,
        a.AdslistData,
        JSON_UNQUOTE(JSON_EXTRACT(a.AdslistData, CONCAT('$[', numbers.n, ']'))) AS clickedItem
      FROM
        AdsHandleTable a
      JOIN (
        SELECT 0 AS n UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3
        UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL
        SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9
      ) numbers ON numbers.n < JSON_LENGTH(a.AdslistData)
    )
    SELECT
      ai.id,
      ai.date,
      ai.ApkUniqueKey,
      ai.AdslistData,
      ai.clickedItem,
      COALESCE(dc.clickCount, 0) AS dailyClickCount,
      COALESCE(i.clickCount, 0) AS impressionClickCount
    FROM
      AdsItems ai
    LEFT JOIN
      DailyClicks dc ON ai.clickedItem = dc.clickedItem AND ai.date = dc.date
    LEFT JOIN
      Impressions i ON ai.clickedItem = i.clickedItem AND ai.date = i.date;
  `;

  connection.query(query, (error, results) => {
    if (error) {
      console.error("Error retrieving data from AdsHandleTable:", error);
      return res.status(500).send("Error retrieving data from AdsHandleTable");
    }

    if (results.length > 0) {
      const parsedResults = results.reduce((acc, result) => {
        try {
          let adslistData;
          try {
            adslistData = result.AdslistData;
          } catch (e) {
            console.error(`Error parsing AdslistData for ApkUniqueKey ${result.ApkUniqueKey}:`, e);
            adslistData = [];
          }

          let record = acc.find((r) => r.ApkUniqueKey === result.ApkUniqueKey);
          if (!record) {
            record = {
              id: result.id,
              date: result.date,
              ApkUniqueKey: result.ApkUniqueKey,
              AdslistData: [],
            };
            acc.push(record);
          }

          const existingAd = record.AdslistData.find((item) => item.packageName === result.clickedItem);

          if (existingAd) {
            existingAd.totalClicks += result.dailyClickCount;
            existingAd.totalImpressions += result.impressionClickCount;
          } else {
            record.AdslistData.push({
              packageName: result.clickedItem,
              totalImpressions: result.impressionClickCount,
              totalClicks: result.dailyClickCount,
            });
          }
        } catch (e) {
          console.error(`Error processing data for ApkUniqueKey ${result.ApkUniqueKey}:`, e);
        }

        return acc;
      }, []);
      return res.status(200).json(parsedResults);
    } else {
      return res.status(404).send("Data not found for the given ApkUniqueKey");
    }
  });
});

app.delete("/deleteAdItem", (req, res) => {
  const { ApkUniqueKey, adItem } = req.body;

  const selectQuery =
    "SELECT AdslistData FROM AdsHandleTable WHERE ApkUniqueKey = ?";
  connection.query(selectQuery, [ApkUniqueKey], (error, results) => {
    if (error) {
      console.error("Error fetching data:", error);
      return res.status(500).json({ message: "Error fetching data" });
    }
    if (results.length === 0) {
      return res
        .status(404)
        .json({ message: "Data not found for the given ApkUniqueKey" });
    }
    let adsListData = results[0].AdslistData
    // Remove the specified ad item
    adsListData = adsListData.filter((ad) => ad !== adItem);
    // Update the AdslistData in the database
    const updateQuery =
      "UPDATE AdsHandleTable SET AdslistData = ? WHERE ApkUniqueKey = ?";
    connection.query(
      updateQuery,
      [JSON.stringify(adsListData), ApkUniqueKey],
      (updateError) => {
        if (updateError) {
          console.error("Error updating data:", updateError);
          return res.status(500).json({ message: "Error updating data" });
        }
        res
          .status(200)
          .json({ message: "Ad item deleted successfully", adsListData });
      }
    );
  });
});

app.get("/getsadsData/:ApkUniqueKey", (req, res) => {
  const { ApkUniqueKey } = req.params;

  const query = `SELECT * FROM AdsHandleTable WHERE ApkUniqueKey = ?`;

  connection.query(query, [ApkUniqueKey], (error, results) => {
    if (error) {
      console.error("Error retrieving data from AdsHandleTable:", error);
      return res.status(500).send("Error retrieving data from AdsHandleTable");
    }
    if (results.length > 0) {
      return res.status(200).json(results);
    } else {
      return res.status(404).send("Data not found for the given ApkUniqueKey");
    }
  });
});

// Ads list update endpoint

app.put("/updateAdsHandleData", (req, res) => {
  const { ApkUniqueKey, AdslistData } = req.body;
  const date = new Date().toISOString().slice(0, 10);

  const checkQuery = `SELECT AdslistData FROM AdsHandleTable WHERE ApkUniqueKey = ?`;

  connection.query(checkQuery, [ApkUniqueKey], (checkError, checkResults) => {
    if (checkError) {
      console.error(
        "Error checking ApkUniqueKey in AdsHandleTable:",
        checkError
      );
      return res
        .status(500)
        .send("Error checking ApkUniqueKey in AdsHandleTable");
    }

    if (checkResults.length > 0) {
      // ApkUniqueKey exists, update the existing row
      const existingAdslistData = checkResults[0].AdslistData
      const updatedAdslistData = Array.from(
        new Set(existingAdslistData.concat(AdslistData))
      );

      const updateQuery = `UPDATE AdsHandleTable SET date = ?, AdslistData = ? WHERE ApkUniqueKey = ?`;
      connection.query(
        updateQuery,
        [date, JSON.stringify(updatedAdslistData), ApkUniqueKey],
        (updateError, updateResults) => {
          if (updateError) {
            console.error(
              "Error updating data in AdsHandleTable:",
              updateError
            );
            return res
              .status(500)
              .send("Error updating data in AdsHandleTable");
          } else {
            return res
              .status(200)
              .send("Data updated successfully in AdsHandleTable");
          }
        }
      );
    } else {
      return res.status(404).send("ApkUniqueKey not found in AdsHandleTable");
    }
  });
});

app.get("/getAdsHandleData", (req, res) => {
  const { ApkUniqueKey } = req.query;
  const date = new Date().toISOString().slice(0, 10);

  const selectQuery = `SELECT AdslistData FROM AdsHandleTable WHERE ApkUniqueKey = ? AND date = ?`;
  connection.query(selectQuery, [ApkUniqueKey, date], (error, results) => {
    if (error) {
      console.error("Error fetching data from AdsHandleTable:", error);
      res.status(500).send("Error fetching data from AdsHandleTable");
    } else {
      if (results.length > 0) {
        // Parse the AdslistData JSON string into an array
        const adsListDataArray = results[0].AdslistData

        // Select a random item from the array
        const randomItem =
          adsListDataArray[Math.floor(Math.random() * adsListDataArray.length)];

        // Return the random item as a string
        res.status(200).send(randomItem);
      } else {
        res.status(404).send("No data found for the given key and date");
      }
    }
  });
});

app.post("/updateImpressions", (req, res) => {
  const { clickedItem } = req.body;
  const date = new Date().toISOString().split("T")[0]; // Get current date

  const updateImpressionsQuery = `
    INSERT INTO Impressions (date, clickedItem, clickCount)
    VALUES (?, ?, 1)
    ON DUPLICATE KEY UPDATE clickCount = clickCount + 1
  `;

  connection.query(
    updateImpressionsQuery,
    [date, clickedItem],
    (updateError) => {
      if (updateError) {
        console.error("Error updating Impressions table:", updateError);
        return res.status(500).json({ error: "Internal Server Error" });
      } else {
        console.log("Impressions table updated successfully.");
        return res.status(200).json({ success: true });
      }
    }
  );
});

app.get("/getRandomAdsImage", (req, res) => {
  const { ApkUniqueKey } = req.query;
  const date = new Date().toISOString().slice(0, 10);

  const selectAdsQuery = `SELECT AdslistData FROM AdsHandleTable WHERE ApkUniqueKey = ? AND date = ?`;

  connection.query(
    selectAdsQuery,
    [ApkUniqueKey, date],
    (adsError, adsResults) => {
      if (adsError) {
        console.error("Error fetching data from AdsHandleTable:", adsError);
        return res.status(500).json({ error: "Internal Server Error" });
      } else {
        if (adsResults.length > 0) {
          const adsListDataArray = adsResults[0].AdslistData

          const randomAdItem =
            adsListDataArray[
              Math.floor(Math.random() * adsListDataArray.length)
            ];

          const getImageQuery = `SELECT * FROM customImages WHERE imagePath = ? LIMIT 1`;

          connection.query(
            getImageQuery,
            [randomAdItem],
            (imageError, imageResults) => {
              if (imageError) {
                console.error(
                  "Error fetching image from customImages:",
                  imageError
                );
                return res.status(500).json({ error: "Internal Server Error" });
              } else {
                if (imageResults.length > 0) {
                  const randomImage = imageResults[0];
                  const response = {
                    isBlack: randomImage.isWhite,
                    randomImage: randomImage.imagePath,
                    appurl: randomImage.appUrl,
                  };

                  return res.status(200).json(response);
                  // Update Impressions table
                  // const updateImpressionsQuery = `
                  //   INSERT INTO Impressions (date, clickedItem, clickCount)
                  //   VALUES (?, ?, 1)
                  //   ON DUPLICATE KEY UPDATE clickCount = clickCount + 1
                  // `;

                  // connection.query(
                  //   updateImpressionsQuery,
                  //   [date, randomAdItem],
                  //   (updateError) => {
                  //     if (updateError) {
                  //       console.error(
                  //         "Error updating Impressions table:",
                  //         updateError
                  //       );
                  //       return res.status(500).json({ error: "Internal Server Error" });
                  //     } else {
                  //       console.log("updating successfully");
                  //       console.log("Impressions table updated successfully.");
                  //       return res.status(200).json(response);
                  //     }
                  //   }
                  // );
                } else {
                  return res
                    .status(404)
                    .json({ error: "No matching image found" });
                }
              }
            }
          );
        } else {
          return res
            .status(404)
            .json({ error: "No data found for the given key and date" });
        }
      }
    }
  );
});

app.post("/modifyAdsListData", (req, res) => {
  const { id, newData } = req.body;

  const updateQuery = `UPDATE AdsHandleTable SET AdslistData = ? WHERE id = ?`;

  connection.query(
    updateQuery,
    [JSON.stringify(newData), id],
    (error, results) => {
      if (error) {
        console.error("Error updating AdslistData:", error);
        res.status(500).send("Error updating AdslistData");
      } else {
        res.status(200).send("AdslistData updated successfully");
      }
    }
  );
});

app.use(
  session({
    secret: "your_session_secret",
    resave: false,
    saveUninitialized: true,
  })
);

app.post("/api/login", (req, res) => {
  const { username, password } = req.body;

  if (username === "admin" && password === "adminpassword") {
    req.session.isAdminLoggedIn = true;
    res.json({ success: true });
  } else {
    res.json({ success: false, message: "Invalid credentials" });
  }
});

app.post("/api/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Error destroying session:", err);
      res.json({ success: false });
    } else {
      res.json({ success: true });
    }
  });
});

app.get("/api/checkAdminLogin", (req, res) => {
  res.json({ isAdminLoggedIn: req.session.isAdminLoggedIn || false });
});

// app.get('/getRandomImage', (req, res) => {

//   const getRandomImageQuery = `
//       SELECT imagePath
//       FROM customImages
//       ORDER BY RAND()
//       LIMIT 1;
//   `;

//   connection.query(getRandomImageQuery, (error, results) => {
//       if (error) {
//           console.error('Error fetching random image:', error);
//           res.status(500).json({ error: 'Internal Server Error' });
//       } else {
//           if (results.length > 0) {
//               const randomImage = results[0];
//               const imagePath = randomImage.imagePath;
//               res.send(imagePath);
//           } else {
//               res.status(404).json({ error: 'No images found' });
//           }
//       }
//   });
// });

app.get("/getRandomImage", (req, res) => {
  const getRandomImageQuery = `
    SELECT * FROM customImages
    ORDER BY RAND()
    LIMIT 1;
  `;

  connection.query(getRandomImageQuery, (error, results) => {
    if (error) {
      console.error("Error fetching random image:", error);
      res.status(500).json({ error: "Internal Server Error" });
    } else {
      if (results.length > 0) {
        const randomImage = results[0];
        const response = {
          isBlack: randomImage.isWhite,
          randomImage: randomImage.imagePath,
          appurl: randomImage.appUrl,
        };
        res.json(response);
      } else {
        res.status(404).json({ error: "No images found" });
      }
    }
  });
});

app.get("/getImageName", (req, res) => {
  const getRandomImageQuery = `
    SELECT * FROM customImages
    ORDER BY RAND()
    LIMIT 1;
  `;

  connection.query(getRandomImageQuery, (error, results) => {
    if (error) {
      console.error("Error fetching random image:", error);
      res.status(500).json({ error: "Internal Server Error" });
    } else {
      if (results.length > 0) {
        const randomImage = results[0];
        const response = randomImage.imagePath;
        res.send(response);
      } else {
        res.status(404).json({ error: "No images found" });
      }
    }
  });
});

app.get("/getAppUrl", (req, res) => {
  const getRandomImageQuery = `
    SELECT * FROM customImages
    ORDER BY RAND()
    LIMIT 1;
  `;

  connection.query(getRandomImageQuery, (error, results) => {
    if (error) {
      console.error("Error fetching random image:", error);
      res.status(500).json({ error: "Internal Server Error" });
    } else {
      if (results.length > 0) {
        const randomImage = results[0];
        const response = randomImage.appUrl;
        res.send(response);
      } else {
        res.status(404).json({ error: "No images found" });
      }
    }
  });
});

app.post("/incrementClickCount", (req, res) => {
  console.log("Request body:", req.body);

  const imageId = req.body.imageId;
  console.log("imageId:", imageId);

  if (!imageId) {
    return res.status(400).json({ error: "Invalid imageId" });
  }

  const incrementClickCountQuery = `
    INSERT INTO ClickTracking (imageId, clickCount)
    VALUES (?, 1) 
    ON DUPLICATE KEY UPDATE clickCount = clickCount + 1;
  `;

  connection.query(incrementClickCountQuery, [imageId], (error) => {
    if (error) {
      console.error("Error incrementing click count:", error);
      res.status(500).send({ error: "Internal Server Error" });
    } else {
      res.status(200).send({ success: true });
    }
  });
});

app.post("/ImpressionsCount", (req, res) => {
  console.log("Request body:", req.body);

  const imageId = req.body.imageId;

  if (!imageId) {
    return res.status(400).json({ error: "Invalid imageId" });
  }

  const incrementClickCountQuery = `
    INSERT INTO Impressions (imageId, clickCount)
    VALUES (?, 1) 
    ON DUPLICATE KEY UPDATE clickCount = clickCount + 1;
  `;

  connection.query(incrementClickCountQuery, [imageId], (error) => {
    if (error) {
      console.error("Error incrementing click count:", error);
      res.status(500).send({ error: "Internal Server Error" });
    } else {
      res.status(200).send({ success: true });
    }
  });
});

app.post("/insertImageData", (req, res) => {
  const imageData = req.body;
  console.log(imageData);

  if (!imageData) {
    return res.status(400).json({ error: "Invalid image data" });
  }

  const insertDataQuery = `
    INSERT INTO imagedata (isWhite, imagePath, appUrl)
    VALUES (?, ?, ?);
  `;

  connection.query(
    insertDataQuery,
    [imageData.isWhite, imageData.imagePath, imageData.appUrl],
    (error) => {
      if (error) {
        console.error("Error inserting image data:", error);
        res.status(500).json({ error: "Internal Server Error" });
      } else {
        res.status(200).json({ success: true });
      }
    }
  );
});

app.post("/incrementDailyClickCount", (req, res) => {
  const today = new Date().toISOString().split("T")[0];
  const clickedItem = req.body.imageId;
  console.log("clickedItem------------------------------:", clickedItem);

  const insertQuery = `
    INSERT INTO DailyClicks (date, clickedItem, clickCount)
    VALUES (?, ?, 1)
    ON DUPLICATE KEY UPDATE 
      clickCount = clickCount + 1;
  `;

  connection.query(insertQuery, [today, clickedItem], (insertError) => {
    if (insertError) {
      console.error(
        "Error inserting data into DailyClicks table:",
        insertError
      );
      res.status(500).json({ error: "Internal Server Error" });
    } else {
      console.log("Data inserted successfully.................................................");
      console.log("Data inserted or updated successfully.");
      res.status(200).json({ success: true });
    }
  });
});

app.get("/api/getApiKey/:username", (req, res) => {
  const { username } = req.params;
  console.log(username);

  const selectQuery = `
    SELECT ApiKey
    FROM ApiKey
    WHERE UserName = ?
  `;

  connection.query(selectQuery, [username], (selectError, result) => {
    if (selectError) {
      console.error("Error fetching data from ApiKey table:", selectError);
      res.status(500).json({ error: "Internal Server Error" });
    } else {
      if (result.length > 0) {
        const apiKey = result[0].ApiKey;
        console.log(apiKey);
        res.status(200).json({ apiKey });
      } else {
        res.status(404).json({ error: "User not found" });
      }
    }
  });
});

app.post("/api/insertApiKey", (req, res) => {
  const { UserName } = req.body;
  console.log(req.body);
  const ApiKey = crypto.randomUUID();

  const insertQuery = `
    INSERT INTO ApiKey (UserName, ApiKey)
    VALUES (?, ?)
  `;
  connection.query(insertQuery, [UserName, ApiKey], (insertError, result) => {
    if (insertError) {
      console.error("Error inserting data into ApiKey table:", insertError);
      res.status(500).json({ error: "Internal Server Error" });
    } else {
      console.log("Data inserted successfully:", result);
      res.status(200).json({ message: "Data inserted successfully" });
    }
  });
});

// fetching public images
app.get("/api/images", (req, res) => {
  const imagesDir = path.join(__dirname, "public", "images");

  fs.readdir(imagesDir, (err, files) => {
    if (err) {
      console.error("Error reading images directory:", err);
      return res.status(500).send("Error reading images directory");
    }

    const imageFiles = files.filter((file) => {
      const fileExt = path.extname(file).toLowerCase();
      return [".png", ".jpg", ".jpeg", ".gif"].includes(fileExt);
    });

    res.json(imageFiles);
  });
});

app.listen(port,() => {
  console.log(`Server is running on port ${port}`);
});



















