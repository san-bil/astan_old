
timeline_obj=null;
tl_dataset=null;
timeline_updater_fast=null;
current_event_start=null;
current_event_end=null;
start_end_toggle="start";
can_play_annotation=false;
current_annotation_overrun_block = null;



//mea culpa
new_video_flag=0;

function echo(my_arg){
  console.log(my_arg)
}

function func_logger(){
  var ignore_funcs = ["update_timeline","create_new_timeline"]

  if(ignore_funcs.lastIndexOf(func_logger.caller.name)==-1){ 
    console.log(func_logger.caller.name +"()"); 
  }
}

function get_video_duration(){
  return $("video").get(0).duration*1000;
}

function set_video_time(new_video_time){
  $("video").get(0).currentTime=new_video_time+0.0;
  console.log(new_video_time);
}

function get_video_time(){
  return $("video").get(0).currentTime;
}

function is_video_paused(){
  return (($("video").get(0).paused))
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

function get_annotations_fetch_endpoint(subject, videoName, task_name){
  var annotations_fetch_endpoint = "/fetch_json_annos?subject=" + subject + "&video=" + videoName +"&task_name=" + task_name
  return annotations_fetch_endpoint
}

function get_annotations_push_endpoint(subject, videoName, task_name){
  var annotations_fetch_endpoint = "/push_json_annos?subject=" + subject + "&video=" + videoName +"&task_name=" + task_name
  return annotations_fetch_endpoint
}

function get_gesture_selection(){
  var gesture = $('#gesturedropdown>option:selected').text();
  return gesture;
}

function def_key_combos(e, ui){
    console.log()
    if(e.keyCode == 32 && (($("video").get(0).paused))){
      $("video").get(0).play()
      window.clearInterval(current_annotation_overrun_block);
    } else if(e.keyCode == 32 && !((($("video").get(0).paused))) ) {
      $("video").get(0).pause()
      window.clearInterval(current_annotation_overrun_block);
    } else if(e.keyCode == 113){


        var time_window = timeline_obj.getWindow()
        var time_window_start = Date.parse(time_window.start)+time_window.start.getMilliseconds();
        var time_window_end = Date.parse(time_window.end)+time_window.end.getMilliseconds()
        var time_window_size = time_window_end-time_window_start;
        var step = time_window_size*0.35;
        timeline_obj.setWindow((time_window_start-step), ((time_window_end-step)), {animate:0});
    

    } else if(e.keyCode == 119){


        var time_window = timeline_obj.getWindow()
        var time_window_start = Date.parse(time_window.start)+time_window.start.getMilliseconds();
        var time_window_end = Date.parse(time_window.end)+time_window.end.getMilliseconds()
        var time_window_size = time_window_end-time_window_start;
        var step = time_window_size*0.35;
        timeline_obj.setWindow((time_window_start+step), ((time_window_end+step)), {animate:0});


    } else if(e.keyCode == 100){
      console.log(current_event_start)
      console.log(current_event_end)
      console.log(e)
      if( start_end_toggle == "start" ){
        set_video_time(current_event_end);
        start_end_toggle = "end";
        console.log("start->end")
      }
      else if( start_end_toggle == "end" ){
        set_video_time(current_event_start);
        start_end_toggle = "start";
        console.log("end->start")
      }
    }else if (e.keyCode == 102 && can_play_annotation && $("video").get(0).paused) {
      $("video").get(0).play();
      current_annotation_overrun_block = setInterval(function(){
        if(get_video_time()>=current_event_end){
          $("video").get(0).pause();
          window.clearInterval(current_annotation_overrun_block);
        }      
      }, 50);
      
    }else{
      console.log(e.keyCode);    
    }
}

function get_timeline_options(vid_length_msec){

  var tl_options = {
    width: 'auto',
    height: '400px',
    editable: true,
    max: vid_length_msec,
    min: 0,
    start: 0,
    end: vid_length_msec,
    movable: true,
    selectable: true,
    showCustomTime: true,
    showMajorLabels: true,
    type: "range",
    zoomable: true,
    zoomMax: vid_length_msec,
    zoomMin: 1000,
    showCustomTime: true,
    onRemove: function (item, callback) {
      if (confirm('Remove ' + item.content + '?')) {
        callback(item); // confirm deletion
      }
      else {
        callback(null); // cancel deletion
      }
    },
    onAdd: function (item, callback) {
      item.content = get_gesture_selection();

      console.log(item)
      console.log(item['start'].getMilliseconds())
      callback(item);
    },
  };
  return tl_options;
}



function right_click_set_time(my_event){


  //if((($("video").get(0).paused))){
  if(true){    
    event.preventDefault();
    var click_location = (my_event.x)

    var time_window = timeline_obj.getWindow()
    echo("mins: "+time_window.start.getMinutes())
    echo("secs: "+time_window.start.getSeconds())
    echo("ms: "+time_window.start.getMilliseconds())

    var time_window_start = Date.parse(time_window.start)+time_window.start.getMilliseconds();
    var time_window_end = Date.parse(time_window.end)+time_window.end.getMilliseconds()
    var time_window_size = time_window_end-time_window_start;
    echo("time_window_start: " + time_window_start)
    echo("time_window_end: " + time_window_end)
    echo("time_window_size: " + time_window_size)


    var left_phys_edge = $(".vispanel.center").offset().left
    var timeline_div_width = $(".vispanel.center").width()

    var relative_click_location = (click_location-left_phys_edge)/timeline_div_width;
    var new_time = ( relative_click_location * time_window_size ) + time_window_start;
    echo(new_time)

    set_video_time(new_time/1000);
    update_timeline()
    echo("--------")
    return false;
  }

}

function update_timeline(){

  var curr_vid_time = get_video_time();

  if(!is_video_paused()){
    var old_bookends = timeline_obj.getWindow() 
    var left_bookend = Date.parse(old_bookends.start)/1000
    var right_bookend = Date.parse(old_bookends.end)/1000
    var window_size = right_bookend-left_bookend;

    if( (curr_vid_time>right_bookend) || (curr_vid_time<left_bookend)){
      timeline_obj.setWindow(curr_vid_time*1000, (curr_vid_time*1000)+(window_size*1000), {animate:0});
    }
  }

  timeline_obj.setCustomTime(curr_vid_time*1000);

  var playback_speed = $("#playbackdropdown").val();
  $("video").get(0).playbackRate=Number(playback_speed);

}

function create_new_dataset_from_JSON(annotations){
  func_logger()

  var new_dataset = new vis.DataSet(annotations.annos);
  var subject = get_subject();
  var task_name = get_taskname();

  new_dataset.on('*', function(event, properties) {
    var tosend = {
      "video": annotations.video,
      "annos": new_dataset.get({
        fields: ['content','end','start','id', 'date'],
        type: {
          start: 'ISODate', 
          end: 'ISODate'       
        }                 
      })
    };

    console.log(tosend)

    var push_url = get_annotations_push_endpoint(subject, annotations.video, task_name )

    outbound_request = $.ajax({
      type: 'post',
      url: push_url,
      contentType: 'application/json',
      data: JSON.stringify(tosend),
      dataType:'json'
    });

    outbound_request.fail(function( jqXHR, textStatus, errorThrown ) {
      console.log(errorThrown);

      if(jqXHR.status==200){

      }else{
        alert("Server is down. Stop annotating for now. Email the admin to ask what's wrong. Press Ctrl+Shift+J in chrome and attach a screenshot.");
        
      }
    });

  });
  return new_dataset;
}

function fetch_annotations(data_url){


  var annotations = null


  inbound_request = $.ajax({ url: data_url, 
           async: false,
           dataType: 'json',
           success: function(data) {
                annotations = data;
            }
  });

  inbound_request.fail(function( jqXHR, textStatus ) {
      alert("Server is down. Stop annotating for now. Email the admin to ask what's wrong. Press Ctrl+Shift+J in chrome and attach a screenshot.");
      console.log(jqXHR);
  });


  return annotations;

}

function create_new_timeline(timeline_dataset, timeline_options){
  func_logger()
  var timeline_container = $("#timeline").get(0);
  var new_timeline = new vis.Timeline(timeline_container, timeline_dataset, timeline_options);

  new_timeline.on('select', function (properties) {
    if(properties.items.length>0){

      var selected_event = tl_dataset.get(properties.items[0]);
      
      if(typeof(selected_event["start"])=="object"){
        event_start = Date.parse((selected_event["start"].toISOString()));
        event_end = Date.parse((selected_event["end"].toISOString()));
      }else{
        event_start = Date.parse(selected_event["start"]);
        event_end = Date.parse(selected_event["end"]);
      }

      var event_start_normalized = (event_start+0.0)/1000;
      var event_end_normalized = (event_end+0.0)/1000;

      current_event_start = event_start_normalized;
      current_event_end = event_end_normalized;
      
      
      start_end_toggle="start";
      set_video_time(event_start_normalized);
      
      can_play_annotation=true;

    }else{
      start_end_toggle = null;    
      can_play_annotation = false;
    }
  });

  $("#timeline").get(0).addEventListener('contextmenu', right_click_set_time , false);


  $("video").on("play",function(){timeline_updater_fast = setInterval(update_timeline, 50);});
  $("video").on("pause",function(){clearInterval(timeline_updater_fast)});

  $("video").on("seeking",update_timeline);
  $("video").on("seeked",update_timeline);
  $("video").on("timeupdate",update_timeline);  

  return new_timeline;
}

function set_up_annotation_state(){
  func_logger()

  if(new_video_flag==1){
    console.log("New video selected")
    $(window).keypress(def_key_combos)

    var vid_length_msec = get_video_duration();
    var subject = get_subject();
    var videoName = get_video_selection();
    var task_name = get_taskname();
    var annotations_fetch_endpoint = get_annotations_fetch_endpoint(subject, videoName, task_name);

    var annotations = fetch_annotations(annotations_fetch_endpoint);

    tl_dataset = create_new_dataset_from_JSON(annotations)
    var tl_options = get_timeline_options(vid_length_msec);
    timeline_obj = create_new_timeline(tl_dataset, tl_options);
  }
  new_video_flag=0;
  
}

$(function(){ /* DOM ready */



  function change_video() {

    var vidpane = $("#vidpane")
    var vid_path = $( "#videodropdown" ).val()
    $("video").remove()
    if(!(timeline_obj==null)){
        timeline_obj.destroy();
     //   console.log("destroying timeline")
    }
    

    var video = $('<video width="600" height="600"></video>').attr("preload","auto").attr("controls","controls")
        .append('<source src="' + vid_path + '"/>')
        .appendTo($("#vidpane"));

    $('#playbackdropdown').val('1');
     
    new_video_flag=1;
    
    $("video").on("canplay",set_up_annotation_state);

    
  }

  
  $( "#videodropdown" ).change(change_video);
  change_video()



});










