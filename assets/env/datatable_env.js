// environment settings for the table
// basic configurations are here

//datatable id or class to identify the datatable in the datatables_custom
// this variable is used instead of the id of datatables in the datatables_custom
var datatable = "#datatable";

// length menu
let lengthMenu = [
  // length to fetch from the server
  [25, 50, 100],
  // string/number to display on the frontend
  [25, 50, 100],
];
// defaultpageLength of datatable
let pageLength = 50;
// max height for the datatable
// change this to resize the height of datatable
let datatableMaxHeight = "280px";
// change this to true if you want table to shrink in height if no data is present
let tableHeightCollapseOnFewData = false;
// columns to display on the each and every cell of a row
// Change this and th in index.html if you want to change the order of columns
// Note: columns in the poistion in the 3, 4 and 5 should be fixed. Columns position count starts from
let datatableColumns = [
  {
    data: "SnsPublishTime.S",
    width: "5%",
  },
  { data: "SnsPublishTime.S", width: "20%" },
  { data: "Time.S", width: "7%" },
  { data: "Subject.S", width: "13%" },
  { data: "SESSenderAddress.S", width: "15%" },
  { data: "SESDestinationAddress.S", width: "15%" },
  { data: "SESMessageType.S", width: "7%" },
  { data: "SourceIP.S", width: "7%" },
  { data: "SMTPresponse.S", width: "8%" },
];
