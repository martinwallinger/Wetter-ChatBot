var socket = new WebSocket('ws://localhost:8181/', 'chat');
var name = 'u1'
socket.onopen = function () {
  socket.send('{"type": "join", "name":"self"}');
}



$(function () {
  var INDEX = 0;
  $("#chat-submit").click(function (e) {
    e.preventDefault();
    var msg = $("#chat-input").val();
    if (msg.trim() == '') {
      return false;
    }
    socket.send('{"type": "msg", "msg": "' + msg + '"}');
    generate_message(msg, 'self');
    
    socket.onmessage = function (msg) {
      var data = JSON.parse(msg.data);
      if (data.name != "self"){
        generate_message(data.msg, 'user')
      }
    };
    
  })

  function generate_message(msg, type) {
    INDEX++;
    var str = "";
    str += "<div id='cm-msg-" + INDEX + "' class=\"chat-msg " + type + "\">";
    str += "          <span class=\"msg-avatar\">";
    if (type == 'self'){
      str += "            <img src=\"/images/human_icon.webp\">";
    } else {
      str += "            <img src=\"/images/bot_icon.png\">";
    }
    str += "          <\/span>";
    str += "          <div class=\"cm-msg-text\">";
    str += msg;
    str += "          <\/div>";
    str += "        <\/div>";
    $(".chat-logs").append(str);
    $("#cm-msg-" + INDEX).hide().fadeIn(300);
    if (type == 'self') {
      $("#chat-input").val('');
    }
    $(".chat-logs").stop().animate({ scrollTop: $(".chat-logs")[0].scrollHeight }, 1000);
  }


  $(document).delegate(".chat-btn", "click", function () {
    var value = $(this).attr("chat-value");
    var name = $(this).html();
    $("#chat-input").attr("disabled", false);
    generate_message(name, 'self');
  })

  $("#chat-circle").click(function () {
    $("#chat-circle").toggle('scale');
    $(".chat-box").toggle('scale');
  })

  $(".chat-box-toggle").click(function () {
    $("#chat-circle").toggle('scale');
    $(".chat-box").toggle('scale');
  })

})
