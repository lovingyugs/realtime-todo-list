/*
This is the type of object stored in the localstorage
var todo = [{
  id: 0
  title: 'work2',
  content: 'work2 content',
  past_status: false,
  date: new Date(),
}, {
  id: 1
  title: 'work3',
  content: 'work3 content',
  past_status: false,
  date: new Date()
}];
 */
var todo = [];


/* It is the global array which stores all the todo's which will have past the deadline*/
var pending = [];

/**
 * This function is called automatically in every 5 seconds
 * @return {Function} Returns a setInterval async function
 */
var auto_refresh = function () {
  return setInterval(

    function () {
      todo.forEach(function (val, i) {
        var cur_date = (new Date());
        var dt = new Date(val.date);
        if (dt.getTime() <= cur_date.getTime()) {
          if (pending.indexOf(val) < 0) {
            todo[i].past_status = true;
            pending.push(todo[i]);
            alert('You have 1 more pending request now. Total ' + pending.length + ' requests are pending now');
            giveColor(todo[i]);
          }
        } else {
          if (pending.indexOf(val) >= 0) {
            todo[i].past_status = false;
            pending.splice(i, 1);
            pending.push(todo[i]);
          }
        }
      });
    }, 5000); // refresh every 5000 milliseconds
}

/**
 * This function changes the color of the row which has a past todo data.
 * @param  {Object} val  It is the row object of which we are going to change the color
 */
function giveColor(val) {
  var tr = $('.main tbody').find('tr:eq(' + (val.id + 1) + ')');
  $('.main tbody').find('tr:eq(' + (val.id + 1) + ')').css({ 'background': '#f37171' });
  $(tr).find('td:eq(4)').find('#edit').html('Update');
  $(tr).find('td:eq(4)').find('#delete').html('Discard');
}

/**
 * This function check whether for the difference between the time stored in the array and the curr_time
 * @param  {Function} callback It takes a function as parameter, ie, autorefresh function
 */
function checkPending(callback) {
  todo.forEach(function (val, i) {
    var cur_date = (new Date());
    var dt = new Date(val.date);
    if (dt.getTime() <= cur_date.getTime()) {
      if (pending.indexOf(val) < 0) {
        todo[i].past_status = true;
        pending.push(todo[i]);
      }
    } else {
      if (pending.indexOf(val) >= 0) {
        todo[i].past_status = false;
        pending.splice(i, 1);
        pending.push(todo[i]);
      }
    }
  });

  if (pending.length > 0) {
    alert('you have ' + pending.length + ' pending request either delete it or update it');
    pending.forEach(function (val, i) {
      giveColor(val);
    });
  }
  callback();
}

/**
 * This function displays the data stored in todo global array to html tr's. ie, table rows.
 * @param  {boolean} doAlert  boolean value which is used to determine whether to call the 
 * checkPending function or not.
 */
function displayTodo(doAlert) {
  for (var i = 0; i < todo.length; i++) {
    $(".main tbody").append('<tr><td>' + (todo[i].id + 1) + '</td><td>' + todo[i].title + '</td><td>' + todo[i].content + '</td><td>' + (new Date(todo[i].date)) + '</td>' + '<td><button id="edit">edit</button><button id="delete">delete</button></td>');
    if (todo[i].past_status) {
      giveColor(todo[i]);
    }
  }

  /*
  If doAlert is false we do not call checkPending function
   */
  if (i === todo.length - 1 && doAlert) {
    checkPending(auto_refresh);
  }
}

$(document).ready(function () {

  /* Getting the todo array from localstorage */
  todo = localStorage.getItem('todo');
  todo = JSON.parse(todo);
  console.log(todo);
  if (todo === null || typeof (todo) === 'string') {
    todo = [];
  } else if (todo.length > 0) {
    //if anything is there in todo we show it in each td
    //we sort the data on the basis of id, ie, by S.NO. 
    todo.sort(function (a, b) {
      if (a.id < b.id) {
        return -1;
      } else {
        return 1;
      }
    });

    /*
      Call for displaying the list. true is passed so that we can call the checkPending function in displayTodo function
     */
    displayTodo(true);
  }

  $("#add").on('click', function (e) {
    // we add an todo
    $('.main tbody').append('<tr><td id="sno">' + (todo.length + 1) + '</td><td><input placeholder="title" type="text" id="title-input"/></td><td> <input placeholder="content" type="text" id="content-input"/></td><td><input placeholder="date" type="date" id="date-input"/><input placeholder="time" type="time" id="time-input"/></td></tr>');
    $('#add').removeClass('show');
    $('#add').addClass('hide');
    $('#save').removeClass('hide');
    $("#save").addClass('show');
  })

  $("#save").on('click', function () {
    // we save the todo
    var title = $('.main tbody tr:last #title-input').val();
    var content = $('.main tbody tr:last #content-input').val();
    var date = $('.main tbody tr:last #date-input').val();
    var time = $('.main tbody tr:last #time-input').val();
    var timeArray = time.split(":");
    var hour = parseInt(timeArray[0]);
    var min = parseInt(timeArray[1]);
    var timeString = hour + ':' + min + ':00';
    date = (date + ' ' + timeString);

    if (title && content && date) {
      todo.push({
        id: todo.length,
        title: title,
        content: content,
        date: date,
        past_status: false,
      });

      $('.main tbody tr:last').remove();
      $('#save').removeClass('show');
      $("#save").addClass('hide');
      $('#add').removeClass('hide');
      $('#add').addClass('show');
      var i = todo.length - 1;
      $('.main tbody').append('<tr><td>' + (todo[i].id + 1) + '</td><td>' + todo[i].title + '</td><td>' + todo[i].content + '</td><td>' + (new Date(todo[i].date)) + '</td>' + '<td><button id="edit">edit</button><button id="delete">delete</button></td>')
      localStorage.setItem('todo', JSON.stringify(todo));
    } else {
      //if input fileds are empty
      alert('add something');
    }
    if (todo.length === 1) {
      auto_refresh();
    }

  })

  $(".main tbody").on('click', 'tr #delete', function (e) {
    // we delete the todo from both html and localstorage
    var index = $(this).closest('tr').index();
    index = index - 1;
    // var i=0;
    todo.forEach(function (item, i) {
      if (item.id > index) {
        todo[i].id = todo[i].id - 1;
      }
      // return item;
    })
    var i = 0;
    $('.main tbody tr:gt(0)').each(function () {
      if (i > index)
        $(this).find('td:eq(0)').html(todo[i].id + 1);
      i++;
    });
    todo.splice(index, 1);
    $(this).closest('tr').remove();
    localStorage.setItem('todo', JSON.stringify(''));
    localStorage.setItem('todo', JSON.stringify(todo));
  });

  $(".main tbody").on('click', 'tr #edit', function () {
    //on clicking edit we show input fields
    var tr = $(this).closest('tr');
    var td = (tr[0].children[0]);
    var sno = tr[0].children[0].innerText;
    var title = tr[0].children[1].innerText;
    var content = tr[0].children[2].innerText;
    var date = tr[0].children[3].innerText;
    date = new Date(date);
    var month = (date.getMonth() + 1).toString();
    var dt = date.getDate().toString();
    if (month.length === 1) {
      month = '0' + (date.getMonth() + 1);
    }
    if (dt.length === 1) {
      dt = '0' + dt;
    }
    var showDate = date.getFullYear() + '-' + month + '-' + dt;
    var hr = date.getHours().toString(),
      min = date.getMinutes().toString();
    if (hr.length === 1) {
      hr = '0' + hr;
    }
    if (min.length === 1) {
      min = '0' + min;
    }
    var showTime = hr + ':' + min;
    $(this).closest('tr').prev().after('<tr><td>' + sno + '</td><td><input  type="text" id="title-input" value="' + title + '"/></td><td><input  type="text" id="content-input" value="' + content + '"/></td><td><input placeholder="date" type="date" value="' + showDate + '" id="date-input"/><input placeholder="time" type="time" value="' + showTime + '" id="time-input"/></td><td><button id="edit-save">save</button><button id="delete">delete</button></td>');
    $(this).closest('tr').remove();
  });

  $(".main tbody").on('click', 'tr #edit-save', function () {
    //edit and save it.
    var index = $(this).closest('tr').index();
    index = index - 1;
    var title = $(this).closest('tr').find('td').eq(1).find('input').val();
    var content = $(this).closest('tr').find('td').eq(2).find('input').val()
    var date = $(this).closest('tr').find('td').eq(3).find('input').val();
    var time = $(this).closest('tr').find('td').eq(3).find('#time-input').val();
    var timeArray = time.split(":");
    var hour = parseInt(timeArray[0]);
    var min = parseInt(timeArray[1]);
    var timeString = hour + ':' + min + ':00';
    date = (date + ' ' + timeString);
    if (title && content && date) {
      //if all 3 are present
      todo[index].title = title;
      todo[index].content = content;
      todo[index].date = date;
      todo[index].past_status = false;
      var i = index;
      $(this).closest('tr').prev().after('<tr><td>' + (todo[i].id + 1) + '</td><td>' + todo[i].title + '</td><td>' + todo[i].content + '</td><td>' + (new Date(todo[i].date)) + '</td>' + '<td><button id="edit">edit</button><button id="delete">delete</button></td>');
      $(this).closest('tr').remove();
      localStorage.setItem('todo', JSON.stringify(''));
      localStorage.setItem('todo', JSON.stringify(todo));
      checkPending(auto_refresh);
    } else {
      //something is not there
      alert('cannot leave input blank');
    }
  });

  $('#clear').on('click', function () {
    //clears all the localhoststorage
    localStorage.setItem('todo', JSON.stringify(''));
    window.location.reload();
  });

  $(".filter #bydate").on('click', function (oEvent) {
    //We sort the array by date and remove active class from s_no and add it to date.
    if ($("#bysno").hasClass('active')) {
      $("#bysno").removeClass('active');
      $(".main tbody").find("tr:gt(0)").remove();
      todo.sort(function (a, b) {
        var dt1 = a.date;
        var dt2 = b.date;
        if (dt1 > dt2) {
          return 1;
        } else {
          return -1;
        }
      });

      //call for displaying the rows in sorted order.
      displayTodo(false);
    }
    $("#bydate").addClass('active');
  })

  $(".filter #bysno").on('click', function (oEvent) {
    //We sort the array by s.no. and remove active class from date and add it to s.no.
    if ($("#bydate").hasClass('active')) {
      $("#bydate").removeClass('active');
      $(".main tbody").find("tr:gt(0)").remove();
      todo.sort(function (a, b) {
        if (a.id < b.id) {
          return -1;
        } else {
          return 1;
        }
      });

      //call for displaying the rows in sorted order.
      displayTodo(false);
    }
    $("#bysno").addClass('active');
  })
});
