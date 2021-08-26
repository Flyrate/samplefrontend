var datatable = "#datatable";
var lengthMenu = [
  [10, 20, 25, 50],
  [10, 20, 25, 50],
];
var datatableColumns = [
  {
    title: "SN",
    data: "SnsPublishTime.S",
  },
  { data: "SnsPublishTime.S" },
  { data: "Subject.S" },
  { data: "SESSenderAddress.S" },
  { data: "SESDestinationAddress.S" },
  { data: "SESMessageType.S" },
  { data: "SourceIP.S" },
  { data: "SMTPresponse.S" },
];

var pageLength = 2000;
var datatableMaxHeight = "280px";
var tableHeightCollapseOnFewData = false;
