var tablename;
var elemId;
var totalNum;
var currentPage = 1;

$("body").on("focus", ".datepicker_recurring_start", function () {
  $(this).datetimepicker({
    defaultDate: new Date(),
    format: "YYYY-MM-DD HH:mm:ss",
    sideBySide: true,
  });
});

function getData(data, l1, l2) {
  tablename = data;
  setActiveButton(data);
  $.getJSON("http://127.0.0.1:5000/api/" + data, function (result) {
    totalNum = result.length;
    $.getJSON(
      "http://127.0.0.1:5000/api/" + data + "?limit1=" + l1 + "&limit2=" + l2,
      function (result) {
        makeTable(result, l1, l2);
      }
    );
  });
}

function getHeaders(result) {
  var headers = [];
  $.each(result, function (key, value) {
    headers.push(key);
    //console.log(key);
  });
  return headers;
}

function makeTable(result, l1, l2) {
  isIncremented = false;
  var modalIndex = 0;
  $("#pageHeader").html(translateHeader(tablename.charAt(0).toUpperCase() + tablename.slice(1)) + " кестесі");
  $("#pageContent").css("margin-right", "15px");

  // Modern card design for actions
  table =
    '<div class="row mb-4">' +
    '<div class="col-xl-3 col-md-6 mb-4">' +
    '<div class="card card-hover border-left-primary shadow-sm h-100 py-2" data-toggle="modal" data-target="#addModal" style="cursor: pointer; transition: all 0.3s ease;">' +
    '<div class="card-body">' +
    '<div class="row no-gutters align-items-center">' +
    '<div class="col mr-2">' +
    '<div class="text-xs font-weight-bold text-primary text-uppercase mb-2">Қосу</div>' +
    '<div class="h5 mb-0 font-weight-bold text-gray-800">Жаңа жазба жасау</div>' +
    '</div>' +
    '<div class="col-auto">' +
    '<i class="fas fa-plus fa-2x text-primary opacity-50"></i>' +
    '</div>' +
    '</div>' +
    '</div>' +
    '</div>' +
    '</div>';

  // Stats card with improved design
  table +=
    '<div class="col-xl-3 col-md-6 mb-4">' +
    '<div class="card border-left-success shadow-sm h-100 py-2">' +
    '<div class="card-body">' +
    '<div class="row no-gutters align-items-center">' +
    '<div class="col mr-2">' +
    '<div class="text-xs font-weight-bold text-success text-uppercase mb-2">Саны: ' +
    translateHeader(tablename.charAt(0).toUpperCase() + tablename.slice(1)) +
    '</div>' +
    '<div class="h5 mb-0 font-weight-bold text-gray-800">' +
    totalNum +
    '</div>' +
    '</div>' +
    '<div class="col-auto">' +
    '<i class="fas fa-warehouse fa-2x text-success opacity-50"></i>' +
    '</div>' +
    '</div>' +
    '</div>' +
    '</div>' +
    '</div>' +
    '</div>';

  table +=
    '<div class="alert alert-info mb-4" role="alert" style="margin-left:18px; margin-right:18px;">' +
    '<i class="fas fa-info-circle mr-2"></i> Кесте жазбадағы барлық мәндерді көрсетпейді. Олардың барлығын көру және жаңартуларды орындау үшін жазбаны басыңыз.' +
    '</div>';

  // Enhanced table design
  table +=
    '<div class="card shadow-sm mb-4" style="margin:18px;">' +
    '<div class="card-body p-0">' +
    '<div class="table-responsive">' +
    '<table class="table table-hover mb-0">' +
    '<thead class="bg-light">' +
    '<tr>';

  var headers = getHeaders(result[0]);
  var modals = makeModals(result);
  var picModals = "";

  var i = 0;
  for (var header in headers) {
    if (i < 8) {
      table += '<th scope="col" class="px-4 py-3">' + headers[header] + "</th>";
      i++;
    }
  }
  table += "</tr></thead><tbody>";

  $.each(result, function (key, value) {
    table += '<tr class="align-middle">';
    i = 0;
    for (var index in value) {
      if (i < 8) {
        var t = "" + value[index];
        var picId = 1;
        if (t.toLowerCase().includes(".jpg") || t.toLowerCase().includes(".png")) {
          table +=
            '<td class="px-4 py-3">' +
            '<button class="btn btn-primary btn-sm" data-toggle="modal" data-target="#modalPic' +
            picId +
            '">' +
            '<i class="fas fa-camera mr-1"></i> Суретті көру' +
            '</button>' +
            '</td>';

          picModals +=
            '<div class="modal fade" id="modalPic' +
            picId +
            '" tabindex="-1" role="dialog">' +
            '<div class="modal-dialog modal-lg" role="document">' +
            '<div class="modal-content">' +
            '<div class="modal-header">' +
            '<h5 class="modal-title">Сурет</h5>' +
            '<button type="button" class="close" data-dismiss="modal" aria-label="Close">' +
            '<span aria-hidden="true">&times;</span>' +
            '</button>' +
            '</div>' +
            '<div class="modal-body text-center">' +
            '<img class="img-fluid" src="' + value[index] + '" alt="Receipt" />' +
            '</div>' +
            '<div class="modal-footer">' +
            '<button type="button" class="btn btn-secondary" data-dismiss="modal">Жабу</button>' +
            '</div>' +
            '</div>' +
            '</div>' +
            '</div>';
          picId++;
        } else {
          table +=
            '<td class="px-4 py-3" data-toggle="modal" data-target="#modal' +
            modalIndex +
            '" style="cursor: pointer;">' +
            value[index] +
            "</td>";
        }
        i++;
      }
    }
    table += "</tr>";
    modalIndex++;
  });

  table += "</tbody></table></div></div></div>";
  table = table.replace(/null/g, "");
  currentPage = 1;
  var totalPages = Math.ceil(totalNum / 10);

  // Enhanced pagination design
  if (l2 == 0) {
    if (result.length < 10) {
      table +=
        '<div class="d-flex justify-content-between align-items-center px-4 py-3">' +
        '<div class="text-muted">Бет ' + currentPage + ' / ' + totalPages + '</div>' +
        '<div class="btn-group">' +
        '<button class="btn btn-secondary btn-sm disabled"><i class="fas fa-angle-left"></i></button>' +
        '<button class="btn btn-secondary btn-sm disabled"><i class="fas fa-angle-right"></i></button>' +
        '</div>' +
        '</div>';
    } else {
      l2 += 10;
      table +=
        '<div class="d-flex justify-content-between align-items-center px-4 py-3">' +
        '<div class="text-muted">Бет ' + currentPage + ' / ' + totalPages + '</div>' +
        '<div class="btn-group">' +
        '<button class="btn btn-secondary btn-sm disabled"><i class="fas fa-angle-left"></i></button>' +
        '<button class="btn btn-primary btn-sm" onclick="getData(\'' + tablename + "'," + l1 + "," + l2 + ');currentPage++;"><i class="fas fa-angle-right"></i></button>' +
        '</div>' +
        '</div>';
    }
  } else {
    if (result.length < 10) {
      l2 -= 10;
      table +=
        '<div class="d-flex justify-content-between align-items-center px-4 py-3">' +
        '<div class="text-muted">Бет ' + currentPage + ' / ' + totalPages + '</div>' +
        '<div class="btn-group">' +
        '<button class="btn btn-primary btn-sm" onclick="getData(\'' + tablename + "'," + l1 + "," + l2 + ');"><i class="fas fa-angle-left"></i></button>' +
        '<button class="btn btn-secondary btn-sm disabled"><i class="fas fa-angle-right"></i></button>' +
        '</div>' +
        '</div>';
    } else {
      l2 -= 10;
      table +=
        '<div class="d-flex justify-content-between align-items-center px-4 py-3">' +
        '<div class="text-muted">Бет ' + currentPage + ' / ' + totalPages + '</div>' +
        '<div class="btn-group">' +
        '<button class="btn btn-primary btn-sm" onclick="getData(\'' + tablename + "'," + l1 + "," + l2 + ');"><i class="fas fa-angle-left"></i></button>';
      l2 += 20;
      table +=
        '<button class="btn btn-primary btn-sm" onclick="getData(\'' + tablename + "'," + l1 + "," + l2 + ');"><i class="fas fa-angle-right"></i></button>' +
        '</div>' +
        '</div>';
    }
  }

  $("#pageContent").html(table);
  $("#modals").html(modals + picModals);

  // Add hover effects
  $(".card-hover").hover(
    function() {
      $(this).addClass("shadow").css('transform', 'translateY(-5px)');
    },
    function() {
      $(this).removeClass("shadow").css('transform', 'translateY(0)');
    }
  );
}

function makeModals(result) {
  var modal = "";
  var modalIndex = 0;
  var elemId;

  $.each(result, function (key, value) {
    modal +=
      '<div class="modal fade" id="modal' +
      modalIndex +
      '" tabindex="-1" role="dialog" aria-hidden="true">';
    modal += '<div class="modal-dialog modal-xl" role="document">';
    modal += '<div class="modal-content">';
    modal += '<div class="modal-header">';
    modal += '<h5 class="modal-title">Update Record</h5>';
    modal +=
      '<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>';
    modal += "</div>";
    modal += '<div class="modal-body"><form name="form' + modalIndex + '">';

    var oddCheck = 0;
    first_iteration = true;
    for (var index in value) {
      if (first_iteration) {
        elemId = value[index];
        first_iteration = false;
        modal +=
          '<input type="hidden" id="elemId' +
          modalIndex +
          '" value="' +
          elemId +
          '">';
      } else {
        console.log(index + " - oddCheck: " + oddCheck);
        var disabled = "";
        if (
          index.toLowerCase().includes("datecreated") ||
          index.toLowerCase().includes("lastconnected")
        ) {
          disabled = 'disabled="disabled"';
        }

        if (oddCheck % 2 == 1) {
          if (
            index.toLowerCase().includes("date") ||
            index.toLowerCase().includes("lastconnected")
          ) {
            modal +=
              '<div class="row"><div class="col-sm"><label>' +
              index +
              '</label></div><div class="col-sm"><div id="date" class="input-group date"><input type="text" ' +
              disabled +
              ' class="form-control datepicker_recurring_start" name="' +
              index +
              '" value="' +
              value[index] +
              ' "/><div class="input-group-append"><span class="input-group-text" id="basic-addon2"><i class="fas fa-calendar-alt"></i></span></div></div></div>';
          } else {
            modal +=
              '<div class="row"><div class="col-sm"><label>' +
              index +
              '</label></div><div class="col-sm"><input class="form-control" type="text" name="' +
              index +
              '" value="' +
              value[index] +
              '" /></div>';
          }
        } else {
          if (
            index.toLowerCase().includes("date") ||
            index.toLowerCase().includes("lastconnected")
          ) {
            modal +=
              '<div class="col-sm"><label>' +
              index +
              '</label></div><div class="col-sm"><div id="date" class="input-group"><input type="text" ' +
              disabled +
              ' class="form-control datepicker_recurring_start" name="' +
              index +
              '" value="' +
              value[index] +
              ' "/><div class="input-group-append"><span class="input-group-text" id="basic-addon2"><i class="fas fa-calendar-alt"></i></span></div></div></div></div><br>';
          } else {
            modal +=
              '<div class="col-sm"><label>' +
              index +
              '</label></div><div class="col-sm"><input class="form-control" type="text" name="' +
              index +
              '" value="' +
              value[index] +
              '" /></div></div><br>';
          }
        }
      }
      oddCheck++;
    }
    oddCheck--;
    if (oddCheck % 2 != 0) {
      modal += '<div class="col-sm"></div><div class="col-sm"></div></div>';
    }

    modal +=
      '</form></div><div class="modal-footer"><button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button><button type="button" class="btn btn-danger" data-toggle="modal" onclick="getRowId(\'elemId' +
      modalIndex +
      '\');" data-target="#deleteModal" data-dismiss="modal">Delete</button><button type="button" class="btn btn-primary" data-dismiss="modal" onclick="updateRecord(' +
      modalIndex +
      "," +
      elemId +
      ",'" +
      tablename +
      "');\">Save changes</button></div></div></div></div>";
    modalIndex++;
  });

  var headers = getHeaders(result[0]);

  modal +=
    '<div class="modal fade" id="addModal" tabindex="-1" role="dialog" aria-hidden="true"><div class="modal-dialog modal-xl" role="document"><div class="modal-content"><div class="modal-header"><h5 class="modal-title">Жаңа жазба жасау</h5><button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button></div><div class="modal-body"><form name="createForm" id="createForm">';

  var first_iteration = true;
  oddCheck = 0;
  for (var header in headers) {
    if (first_iteration) {
      first_iteration = false;
    } else {
      //modal += '<div class="row"><div class="col-sm"><label>' + headers[header] + '</label></div><div class="col-sm"><input type="text" name="' +  headers[header] + '" /></div></div><br>';

      disabled = "";
      if (
        headers[header].toLowerCase().includes("datecreated") ||
        headers[header].toLowerCase().includes("lastconnected")
      ) {
        disabled = 'disabled="disabled"';
      }

      if (oddCheck % 2 == 1) {
        if (
          headers[header].toLowerCase().includes("date") ||
          headers[header].toLowerCase().includes("lastconnected")
        ) {
          modal +=
            '<div class="row"><div class="col-sm"><label>' +
            headers[header] +
            '</label></div><div class="col-sm"><div id="date" class="input-group"><input type="text" ' +
            disabled +
            ' class="form-control datepicker_recurring_start" name="' +
            headers[header] +
            '" /><div class="input-group-append"><span class="input-group-text" id="basic-addon2"><i class="fas fa-calendar-alt"></i></span></div></div></div>';
        } else {
          modal +=
            '<div class="row"><div class="col-sm"><label>' +
            headers[header] +
            '</label></div><div class="col-sm"><input class="form-control" type="text" name="' +
            headers[header] +
            '" /></div>';
        }
      } else {
        if (
          headers[header].toLowerCase().includes("date") ||
          headers[header].toLowerCase().includes("lastconnected")
        ) {
          modal +=
            '<div class="col-sm"><label>' +
            headers[header] +
            '</label></div><div class="col-sm"><div id="date" class="input-group"><input type="text" ' +
            disabled +
            ' class="form-control datepicker_recurring_start" name="' +
            headers[header] +
            '" /><div class="input-group-append"><span class="input-group-text" id="basic-addon2"><i class="fas fa-calendar-alt"></i></span></div></div></div></div><br>';
        } else {
          modal +=
            '<div class="col-sm"><label>' +
            headers[header] +
            '</label></div><div class="col-sm"><input class="form-control" type="text" name="' +
            headers[header] +
            '" /></div></div><br>';
        }
      }
    }
    oddCheck++;
  }
  oddCheck--;
  if (oddCheck % 2 != 0) {
    modal += '<div class="col-sm"></div><div class="col-sm"></div></div>';
  }

  modal +=
    '</form></div><div class="modal-footer"><button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button><button type="button" class="btn btn-primary" data-dismiss="modal" onclick="createRecord(\'' +
    tablename +
    "');\">Жаңа жазба жасау</button></div></div></div></div>";

  modal +=
    '<div class="modal fade" id="deleteModal" tabindex="-1" role="dialog" aria-hidden="true"><div class="modal-dialog" role="document"><div class="modal-content"><div class="modal-header"><h5 class="modal-title">Delete Record</h5><button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button></div><div class="modal-body"><p>Are you sure you want to delete this record?<br>This cannot be undone.</p></div><div class="modal-footer"><button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button><button type="button" class="btn btn-danger" data-dismiss="modal" onclick="deleteRecord(\'' +
    tablename +
    "');\">Delete</button></div></div></div></div>";

  modal = modal.replace(/null/g, "");

  return modal;
}

function updateRecord(formId, elemId, table) {
  $("form:eq(" + formId + ") *")
    .filter(":input")
    .each(function () {
      if (this.value == "") {
        this.value = "None";
      }
      if (this.value == " ") {
        this.value = "None";
      }
    });
  var str = $("form:eq(" + formId + ")").serialize();
  str = str.replace(/null/g, "None");
  str = str.replace(/\s/g, "None");
  console.log(str);
  $.ajax({
    method: "PUT",
    url: "http://127.0.0.1:5000/api/" + table + "/" + elemId + "?" + str,
    success: function (dat) {
      getData(table, 10, 0);
    },
  });
}

function deleteRecord(table) {
  $.ajax({
    method: "DELETE",
    url: "http://127.0.0.1:5000/api/" + table + "/" + elemId,
    success: function (dat) {
      getData(table, 10, 0);
    },
  });
}

function createRecord(table) {
  $('form[name="createForm"] *')
    .filter(":input")
    .each(function () {
      if (this.value == "") {
        this.value = "None";
      }
    });
  var str = $('form[name="createForm"]').serialize();
  str = str.replace(/null/g, "None");
  str = str.replace(/\s/g, "None");
  $.ajax({
    method: "POST",
    url: "http://127.0.0.1:5000/api/" + table + "?" + str,
    success: function (dat) {
      getData(table, 10, 0);
    },
  });
}

function getRowId(elemModal) {
  elemId = $("#" + elemModal).val();
}

function setActiveButton(id) {
  $(".nav-item").removeClass("active");
  $("#nav-" + id).addClass("active");
}

function changePassword() {
  var oldpas = $("#oldPassword").val();
  var newpas1 = $("#newPassword1").val();
  var newpas2 = $("#newPassword2").val();
  if (newpas1 == newpas2) {
    $.ajax({
      method: "PUT",
      url:
        "http://127.0.0.1:5000/admin/changepassword?oldPassowrd=" +
        oldpas +
        "&newPassword=" +
        newpas1,
      success: function (dat) {
        if (dat.Status == "Error") {
          $("#changePasswordMessage").text(dat.Message);
          $("#oldPassword").val("");
          $("#newPassword1").val("");
          $("#newPassword2").val("");
        } else {
          $("#changePasswordModal").modal("toggle");
          alert(dat.Message);
          $("#oldPassword").val("");
          $("#newPassword1").val("");
          $("#newPassword2").val("");
        }
      },
    });
  } else {
    $("#changePasswordMessage").text("New passwords don't match.");
  }
}
