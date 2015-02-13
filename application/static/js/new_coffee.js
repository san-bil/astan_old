$("#video").get(0).play();
$("#video").delay(1000).get(0).pause();

var vidframe_contents = $('#videoFrame').contents()
var videoName = $("div[id^=videonamehack_]").attr('id').substring(("videonamehack_".length))
var subject = $("div[id^=subjecthack]").attr('id').substring(("subjecthack".length)) 

var tl_options, timeline_container, timeline_obj, tl_dataset, subject, videoName

$.getJSON("/fetch_annos/?subject=" + subject + "&video=" + videoName).done(function(data) {
  console.log(data);
  console.log(data["annos"]);
  console.log(data["video"]);
  tl_dataset = new vis.DataSet(data.annos);
  tl_dataset.on('*', function(event, properties) {
    var tosend;
    console.log(event);
    tosend = {
      "annos": tl_dataset.get(),
      "video": videoName
    };
    console.log(tosend);
    return $.ajax({
      type: 'post',
      url: 'save_value?subject=' + subject,
      dataType: 'json',
      data: {
        buffer: tosend
      }
    });
  });
  tl_options = {
    width: '100%',
    height: '400px',
    editable: true,
    max: 1200000,
    min: 0,
    start: 0,
    end: 1200000,
    movable: true,
    selectable: true,
    showCustomTime: true,
    showMajorLabels: true,
    type: "range",
    zoomable: true,
    zoomMax: 1200000,
    zoomMin: 10,
    showCustomTime: true
  };
  timeline_container = $("#timeline").get(0);
  timeline_obj = new vis.Timeline(timeline_container, tl_dataset, tl_options);
  timeline_obj.setCustomTime(1200000 / 2);
  setInterval( function(){ timeline_obj.setCustomTime(timeline_obj.getCustomTime()+1000); console.log('step') }, 1000);

  return setInterval( function(){ timeline_obj.setCustomTime($("#video").get(0).currentTime) }, 200);
});


