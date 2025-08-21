function doPost(e) {
  try {
    // Get the active spreadsheet and sheet
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName("Sheet1"); // Ensure your sheet is named "Sheet1" or update accordingly
    const folder = DriveApp.getFolderById("YOUR_GOOGLE_DRIVE_FOLDER_ID"); // Replace with your Google Drive folder ID

    // Parse the form data
    const formData = e.parameter;
    const files = e.postData.contents;

    // Handle file uploads
    let fileUrls = "";
    if (e.postData.type === "multipart/form-data") {
      const boundary = "--" + e.contentType.split("boundary=")[1];
      const parts = e.postData.contents.split(boundary);
      for (let part of parts) {
        if (part.includes("Content-Disposition: form-data; name=\"files\"")) {
          const fileNameMatch = part.match(/filename="(.+?)"/);
          if (fileNameMatch) {
            const fileName = fileNameMatch[1];
            const fileContentMatch = part.match(/Content-Type: .+\r\n\r\n([\s\S]*?)\r\n--/);
            if (fileContentMatch) {
              const fileData = fileContentMatch[1];
              const blob = Utilities.newBlob(fileData, "application/octet-stream", fileName);
              const file = folder.createFile(blob);
              fileUrls += file.getUrl() + ",";
            }
          }
        }
      }
    }

    // Prepare data for the sheet
    const row = [
      formData.name || "",
      formData.email || "",
      formData.phone || "",
      formData.dob || "",
      formData.tob || "",
      formData.pob || "",
      formData.address || "",
      formData.category || "",
      formData.description || "",
      fileUrls,
      new Date().toISOString()
    ];

    // Append to the sheet
    sheet.appendRow(row);

    // Return success response
    return ContentService.createTextOutput(JSON.stringify({ status: "success" }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    // Return error response
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: error.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
