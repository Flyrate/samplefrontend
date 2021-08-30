// environment for the csv export
// set this variable to name the header of the exported csv file
let csv_data_header = [
  "SN",
  "ID",
  "Send Date and Time",
  "Time",
  "Subject",
  "From",
  "To",
  "Message Type",
  "Source IP",
  "SMTP Response",
];
// this length is the one time fetch limit of the csv, currently its disabled but can be maintained in the future
const csv_length = 1000;

// set the reutrn of the function to show which data to put under which header above
function getRowToExportFromExistingRow(row) {
  return [
    // for the header on the line no 4 use the data of line 22
    row.sn,
    // for the header on the line no 5 use the data of line no 24 and so on
    row.SESMessageId.S,
    serverDateToLocalDate(row.SnsPublishTime.S),
    row.Time.S,
    row.Subject.S,
    row.SESSenderAddress.S,
    row.SESDestinationAddress.S,
    row.SESMessageType.S,
    row.SourceIP.S,
    row.SMTPresponse.S,
  ];
}
