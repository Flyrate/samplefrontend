// environment settings for the table
// basic configurations are here

var datatable = "#datatable";

var lengthMenu = [
  [2, 25, 50, 100, 200, 3000],
  [2, 25, 50, 100, 200, 3000],
];
var pageLength = 2;
var datatableMaxHeight = "280px";
var tableHeightCollapseOnFewData = false;
var datatableColumns = [
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
