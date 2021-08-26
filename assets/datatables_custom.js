$(document).ready(function () {
  $.getScript("assets/env/root_env.js", function () {
    $.getScript("assets/env/datatable_env.js", function () {
      // this paginations variable stores the exclusive start keys
      let paginations = {};
      let draw = 1;
      let datatable_page_no = 1;
      let timeout = {};
      var filterStatus = false;
      var initial_data_request = true;
      var table = null;
      var page_no_requested_by_user = 1;
      var filterTotal = 0;
      var total = 0;

      // DataTable configureation
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
          dataFilter: function (data) {
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
            var c = async () => {
              count();
            };
            c();

            data = {
              draw: draw,
              recordsTotal: data.ScannedCount,
              recordsFiltered: data.Count,
              data: data.Items,
            };

            draw++;

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
      $("#search_form").submit(function (event) {
        $("#show_requested_data_div").show("slow");
        if (initial_data_request || table == null) {
          table = $(datatable).DataTable(datatable_init_config);
          initial_data_request = false;
        } else {
          table.draw();
        }
        event.preventDefault();
      });

      function count() {
        filterTotal = 0;
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
            filterTotal += data.Count;
            total += data.ScannedCount;
            if (data.LastEvaluatedKey != undefined) {
              api_data = JSON.parse(api_data);
              api_data.ExclusiveStartKey = data.LastEvaluatedKey;
              ajaxCall(JSON.stringify(api_data));
            }
          },
        });
      }

      function dataToSend(count = false) {
        const filterbySubject = $("#filterbySubject").val().trim();
        const filterbySender = $("#filterbySender").val().trim();
        const filterbyDestination = $("#filterbyDestination").val().trim();

        var filter = {};
        filterStatus = false;

        if (filterbySubject != "") {
          filterStatus = true;
          filter["Subject"] = filterbySubject;
        }

        if (filterbySender != "") {
          filterStatus = true;
          filter["SESSenderAddress"] = filterbySender;
        }

        if (filterbyDestination != "") {
          filterStatus = true;
          filter["SESDestinationAddress"] = filterbyDestination;
        }

        let exclusiveStartKey = undefined;
        console.log(paginations);
        console.log(page_no_requested_by_user);
        if (paginations[page_no_requested_by_user] != undefined) {
          try {
            exclusiveStartKey = paginations[page_no_requested_by_user];
          } catch (e) {
            exclusiveStartKey = undefined;
          }
        }
        return JSON.stringify(
          apiDataObject(
            $(datatable).DataTable().page.len(),
            filterStatus ? filter : undefined,
            exclusiveStartKey,
            count ? count : undefined
          )
        );
      }

      // call this function to enable header search on 3rd, 4th and 5th column.
      function headerSearch() {
        // Setup - add a text input to each footer cell
        $(`${datatable} thead tr`).clone(true).appendTo(`${datatable} thead`);
        $(`${datatable} thead tr:eq(1) th`).each(function (i) {
          var id = "filterbySubject";
          if (i == 3) {
            id = "filterbySender";
          } else if (i == 4) {
            id = "filterbyDestination";
          }
          if (i == 2 || i == 3 || i == 4) {
            var title = $(this).text();
            $(this).html(
              '<input id="' +
                id +
                '" type="text" class="form-control form-control-sm deleteable" placeholder="Search: ' +
                title +
                '" />'
            );

            $("input", this).on("keyup", function () {
              // Clear the timeout if it has already been set.
              // This will prevent the previous task from executing
              // if it has been less than <MILLISECONDS>
              clearTimeout(timeout[i]);

              // Make a new timeout set to go off in 1000ms (1 second)
              timeout[i] = setTimeout(function () {
                if (table.column(i).search() !== this.value) {
                  filterStatus = true;
                  table.clear();
                  table.ajax.reload();
                }
              }, 1000);
            });
          } else {
            $(this).html("");
          }
        });
      }
      headerSearch();
    });
  });
});
