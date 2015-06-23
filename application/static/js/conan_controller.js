buffer = [];
maxBufferSize = 100;

new_video_flag=0;

function get_video_duration(){
  return $("video").get(0).duration*1000;
}

function get_taskname(){
  var task_name = $("div[id^=tasknamehack_]").attr('id').substring(("tasknamehack_".length));
  return task_name;
}

function get_subject(){
  var subject = $("div[id^=subjecthack_]").attr('id').substring(("subjecthack_".length));
  return subject;
}

function get_video_selection(){
  var videoName = $('#videodropdown>option:selected').text();
  return videoName;
}

function get_annotations_push_endpoint(subject, videoName, task_name){
  var annotations_fetch_endpoint = "/push_csv_annos?subject=" + subject + "&video=" + videoName +"&task_name=" + task_name
  return annotations_fetch_endpoint
}

function get_variable_selection(){
  var variable = $('#variabledropdown>option:selected').text();
  return variable;
}

def_key_combos = function(e, ui) {
  var v;
  console.log(e.keyCode);
  if (e.keyCode === 13 || e.keyCode === 32 || e.keyCode === 115) {
    v = $("#video");
    v.get(0).pause();
  }
  if (e.keyCode === 32) {
    return !(e.keyCode === 32);
  }
  $("#slider").slider("disable");
  return $("#slider").slider("enable");
};

play_video = function(e, ui) {
  var v;
  v = $("#video");
  return v.get(0).play();
};

pause_video = function(e, ui) {
  var v;
  console.log(e);
  v = $("#video");
  return v.get(0).pause();
};


function set_up_annotation_state(){

  if(new_video_flag==1){
    $(window).keypress(def_key_combos)
  }
  new_video_flag=0;
}


send_buffer_to_server = function() {
  var tosend;
  tosend = buffer;
  buffer = [];
  var subject = get_subject();
  var task_name = get_taskname();
  var video_name = get_video_selection();
  var endpoint = get_annotations_push_endpoint(subject, video_name, task_name)
  outbound_request = $.ajax({
    type: 'post',
    url: endpoint,
    dataType: 'json',
    contentType: 'application/json',
    data: JSON.stringify({buffer:tosend}),
  });

  outbound_request.fail(function( jqXHR, textStatus, errorThrown ) {
    console.log(errorThrown);
    if(jqXHR.status==200){
    }else{
      alert("Server is down. Stop annotating for now. Email the admin to ask what's wrong. Press Ctrl+Shift+J in chrome and attach a screenshot.");
    }
  });



};

on_slider_change = function(e, ui) {
  var dimension = get_variable_selection();
  var videoName = get_video_selection();
  var subject = get_subject();
  
  buffer.push({
    clienttime: Date.now(),
    subject: subject,
    video: videoName,
    dimension: dimension,
    time: $("#video").get(0).currentTime,
    value: ui.value,
    playing: !($("#video").get(0).paused)
  });
  if (buffer.length >= maxBufferSize) {
    return send_buffer_to_server();
  }
};

on_mouse_move = function(e, ui) {
  var h, s, val;
  s = $("#slider");
  h = $(".ui-slider-handle", s);
  if (h.hasClass("ui-state-focus")) {
    val = ((e.clientX - s.offset().left) / s.width()) * 2 - 1;
    if (val > 1) {
      val = 1;
    }
    if (val < -1) {
      val = -1;
    }
    return s.slider("option", "value", val);
  }
};


function change_video() {

  var vidpane = $("#vidpane")
  var vid_path = $( "#videodropdown" ).val()
  $("video").remove()

  var video = $('<video id="video" width="600" height="600"></video>').attr("preload","auto").attr("controls","controls")
      .append('<source src="' + vid_path + '"/>')
      .appendTo($("#vidpane"));

  $('#playbackdropdown').val('1');
   
  new_video_flag=1;
  
  $("video").on("canplay",set_up_annotation_state);
  $( "#slider" ).slider( "value", 0 );
}

function change_variable() {
  var variable = get_variable_selection();
 
  $("#variabledropdown option").each(function()
  {
      $("#slider").removeClass($(this).val());

  });

  $("#dimension").empty();
  $("#slider").addClass(variable);
  $("#dimension").append(variable);
  $( "#slider" ).slider( "value", 0 );
}

$(function(){


  $( "#videodropdown" ).change(change_video);
  change_video();

  $( "#variabledropdown" ).change(change_variable);
  change_variable();


  $(window).keypress(def_key_combos);

  $("#labels").click(pause_video);

  $(document).mousemove(on_mouse_move);

  $("#slider").slider({
    orientation: 'horizontal',
    min: -1,
    max: 1,
    value: 0,
    step: 0.01,
    slide: on_slider_change,
    change: on_slider_change,
    start: play_video,
  });

  $("#video").bind("ended", function() {
    return send_buffer_to_server();
  });

});