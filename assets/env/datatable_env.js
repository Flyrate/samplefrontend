var datatable = "#datatable";
var lengthMenu = [
  [500, 1000, 1500, 2000],
  [500, 1000, 1500, 2000],
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

var pageLength = 500;
var datatableMaxHeight = "280px";
var tableHeightCollapseOnFewData = false;
