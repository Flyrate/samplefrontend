var datatable_init_config = {
    pagingType: "simple",
    // pagingType: "listboxWithButtons",
    orderCellsTop: true,
    fixedHeader: true,
    serverSide: true,
    ajax: {
      type: "POST",
      dataType: "json",
      contentType: "application/json",
      url: api_url,
      data: function () {
        return dataToSend();
      },
      beforeSend: function () {
        // Here, manually add the loading message.
        $(`${datatable} > tbody`).html(
          '<tr class="odd">' +
            '<td valign="top" colspan="8" class="dataTables_empty">Loading&hellip;</td>' +
            "</tr>"
        );
      },
      dataFilter: async function (data) {
        data = JSON.parse(data);
        if (
          data.LastEvaluatedKey != undefined &&
          data.LastEvaluatedKey != null
        ) {
          //$(datatable).DataTable().page.info().page this gives the page number before clicking the next button
          if (
            $(datatable).DataTable().page.info().page ==
            page_no_requested_by_user - 1
          ) {
            paginations[$(datatable).DataTable().page.info().page + 2] =
              data.LastEvaluatedKey;
          }
        }

        data = {
          draw: draw,
          recordsTotal: data.ScannedCount,
          recordsFiltered: data.Count,
          data: data.Items,
        };

        draw++;
        console.log(JSON.stringify(data));

        return JSON.stringify(data);
      },
    },
    dom: "liptip",
    scrollY: datatableMaxHeight,
    ordering: false,
    scrollX: true,
    scrollCollapse: tableHeightCollapseOnFewData,
    lengthMenu: lengthMenu,
    processing: true,
    pageLength: pageLength,
    columns: datatableColumns,
    fnRowCallback: function (nRow, aData, iDisplayIndex) {
      var oSettings = this.fnSettings();
      $("td:first", nRow).html(
        oSettings._iDisplayStart + iDisplayIndex + 1
      );
      return nRow;
    },
    drawCallback: function () {
      $(".paginate_button.previous:not(.disabled) a").on(
        "click",
        function () {
          page_no_requested_by_user =
            $(datatable).DataTable().page.info().page > 0
              ? $(datatable).DataTable().page.info().page - 1
              : 0;
        }
      );
      $(".paginate_button.next:not(.disabled) a").on("click", function () {
        console.log("updated page no req by user");
        console.log($(datatable).DataTable().page.info().page);
        page_no_requested_by_user =
          $(datatable).DataTable().page.info().page + 1;
      });
    },
  };


  var filtertotal = 0;
      var total = 0;
      async function count() {
        filtertotal = 0;
        total = 0;
        var api_data = dataToSend(true);

        console.time("ajax");
        ajaxCall(api_data);
        console.timeEnd("ajax");
      }
      function ajaxCall(api_data) {
        $.ajax({
          type: "POST",
          async: false, // set async false to wait for previous response
          url: api_url,
          dataType: "json",
          contentType: "application/json; charset=utf",
          data: api_data,
          success: function (data) {
            filtertotal += data.Count;
            total += data.ScannedCount;
            if (data.LastEvaluatedKey != undefined) {
              api_data = JSON.parse(api_data);
              api_data.ExclusiveStartKey = data.LastEvaluatedKey;
              ajaxCall(JSON.stringify(api_data));
            }
          },
        });
      }