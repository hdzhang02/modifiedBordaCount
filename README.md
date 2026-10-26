# Ranked Vote Counter — User Guide

This tool counts a ranked election using the modified Borda Count rules. It works on your computer without sending your votes, spreadsheet, or executive password anywhere.

You do **not** need to install a program or use a command prompt to run the completed tool.

## Before you start

You will need:

1. The counter file: `index.html`.
2. Access to the Google Sheet containing the form responses.
3. The confidential password used by outgoing Executive members (if Executive votes should count twice).

Keep both the spreadsheet and password private, as they may contain election information.

## 1. Get the counter file

The completed counter is here:

`dist/index.html`

If you received the project folder, open the `dist` folder and copy `index.html` to a convenient location, such as your Desktop or an election folder.

You can rename the file if you wish, for example to `AUSCO-ranked-vote-counter.html`. Make sure it still ends in `.html`.

> **Important:** Use the `index.html` inside the `dist` folder. Do not use the `index.html` in the main project folder; that one is for development only.

## 2. Download the responses from Google Sheets

1. Open the Google Sheet that receives the Google Form responses.
2. Choose **File** in the top-left menu.
3. Choose **Download**.
4. Choose either:
   - **Microsoft Excel (.xlsx)** — recommended; or
   - **Comma-separated values (.csv)** — also works, but only downloads the currently selected worksheet.
5. Save the downloaded file somewhere you can find it.

Do not manually add helper columns or totals before using the counter. The tool reads the original form-response columns and performs the calculation itself.

## 3. Open the counter

1. Find the downloaded `index.html` file.
2. Double-click it.
3. It should open in your usual web browser, such as Microsoft Edge, Google Chrome, Firefox, or Safari.

There is no sign-in and no internet connection is required after you have the file. If double-clicking does not open it in a browser, right-click the file, choose **Open with**, and select a web browser.

## 4. Load the response spreadsheet

1. In the counter, select **Choose a spreadsheet**.
2. Select the `.xlsx` or `.csv` file you downloaded from Google Sheets.
3. The counter will read the file on your computer and show the column choices.

### If the file will not open

Download it again directly from Google Sheets using **File → Download → Microsoft Excel (.xlsx)** or **Comma-separated values (.csv)**. Some old or renamed Excel files cannot be read by browsers even though Microsoft Excel can open them.

## 5. Check the columns

The counter normally detects the columns automatically. Check the following before calculating:

- Each **Candidate name** matches the nominee shown in the form.
- Each candidate’s **Ranking column** matches their ranking question.
- The **No Vote column** points to the form question used for “No Vote”.
- The **Executive key column** points to the confidential-key question.

If a name or column is wrong, use the boxes and drop-down lists to correct it. Every candidate must have a different ranking column.

## 6. Enter count settings

1. Enter the **Executive password**. This must match the confidential key given to Executive voters.
   - A matching key makes that whole ballot count twice.
   - An empty password means no ballots are doubled.
   - The password is not stored, exported, or sent over the internet.
2. Set **Number provisionally nominated**. This is normally `3`.
3. Select **Calculate ranked result**.

## 7. Read and check the result

The results table is ordered with the **lowest total score first**. A candidate with a lower total rank score is placed higher.

The tool displays:

- each candidate’s position and total score;
- a **Nominated** label for the configured number of lowest-scoring candidates;
- how many regular and Executive points each candidate received;
- how many ballots placed each candidate at each rank;
- the number of valid, doubled Executive, No Vote, and invalid ballots.

### Warnings to review

Read the yellow **Review required** section before accepting a result.

- **Invalid ballots** are excluded. A ballot is invalid if it has a missing rank, a repeated rank, or a rank outside the allowed range.
- A ballot marked **No Vote** is excluded, even if it also contains candidate rankings.
- If somebody entered a key that does not match the Executive password, their ballot counts as a normal vote and is shown as a warning.
- If candidates have the same total score, they share the same position. The tool does not apply a tie-break rule.

For a detailed check, open **Ballot audit** below the results. It shows how every imported response was classified and whether it was given a weight of `1×` or `2×`.

## 8. Save the result

Select **Download results CSV** to save the result as a spreadsheet-friendly CSV file. It will normally appear in your browser’s Downloads folder.

You can open the CSV in Microsoft Excel, Google Sheets, LibreOffice Calc, or similar spreadsheet software.

## Privacy and safe handling

- The counter processes the spreadsheet in the browser on your device.
- It does not upload responses or send the Executive password anywhere.
- The Executive password is not included in the downloaded result file.
- Close the browser tab when you have finished counting.
- Store or delete the downloaded response spreadsheet and exported results according to your organisation’s election and privacy procedures.

## Quick checklist

1. Download fresh responses from Google Sheets as `.xlsx` or `.csv`.
2. Open `dist/index.html` in a browser.
3. Choose the downloaded responses file.
4. Check candidate, No Vote, and Executive-key columns.
5. Enter the Executive password and leave the nominee count at `3` unless instructed otherwise.
6. Calculate the result.
7. Review warnings and the ballot audit.
8. Download and securely keep the results CSV.