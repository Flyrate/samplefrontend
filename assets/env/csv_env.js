// environment for the csv export
    let csv_data_header = [
      "SN",
      "Send Date and Time",
      "Subject",
      "From",
      "To",
      "Message Type",
      "Source IP",
      "SMTP Response",
    ];
    const csv_length = 1000;

    function getRowToExportFromExistingRow(row) {
      return [
        row.sn,
        row.SnsPublishTime,
        row.Subject,
        row.SESSenderAddress,
        row.SESDestinationAddress,
        row.SESMessageType,
        row.SourceIP,
        row.SMTPresponse,
      ];
    }
