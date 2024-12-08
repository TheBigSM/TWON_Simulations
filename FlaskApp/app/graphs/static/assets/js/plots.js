function RunSimulation() {
	console.log("RunSimulation function triggered");
    const topic = $('#topicInput').val().trim();
	const num_of_loops = $('#num_of_loopsInput').val().trim();
	const model = $('input[name="model"]:checked').val();

    $.ajax({
        url: "/sensoranalysis/runsimulation",
        type: "POST",  // Changed to POST
        contentType: 'application/json;charset=UTF-8',
        data: JSON.stringify({
            'topic': topic,
			'model': model,
			'num_of_loops': num_of_loops,
        }),
        dataType: "json",
        success: function (data) {
			console.log("AJAX success:", data);
            Plotly.newPlot('done', data)
        },
        error: function(xhr, status, error) {
            console.error("Error running simulation:", error);
            alert("Failed to run simulation: " + xhr.responseJSON.error);
        }
    });
}


function GenerateNetworks() {
	const num_of_agents =$('#num_of_agentsInput').val().trim();

	if (!num_of_agents || isNaN(num_of_agents) || num_of_agents <= 0) {
        alert("Please enter a valid number for agents.");
        return;
    }

    $.ajax({
        url: "/sensoranalysis/generatenetworks",
        type: "POST",  // Changed to POST
        contentType: 'application/json;charset=UTF-8',
		data: JSON.stringify({
			'num_of_agents': num_of_agents
        }),
        dataType: "json",
        success: function (data) {
            Plotly.newPlot('done', data)
        },
        error: function(xhr, status, error) {
            console.error("Error generating networks:", error);
            alert("Failed to generate networks: " + xhr.responseJSON.error);
        }
    });
}

function CaseStudyDone(){
	$.ajax({
		url: "/sensoranalysis/CaseStudyDoneRoute",
		type: "GET",
		contentType: 'application/json;charset=UTF-8',
		data: {
			'barrier': ""
		},
		dataType: "json",
		success: function (data) {
			Plotly.newPlot('done', data)
		}
	});
};

function TotalTimeCaseStudy(){
	$.ajax({
		url: "/sensoranalysis/TotalTimeCaseStudyRoute",
		type: "GET",
		contentType: 'application/json;charset=UTF-8',
		data: {
			'barrier': ""
		},
		dataType: "json",
		success: function (data) {
			Plotly.newPlot('total', data)
		}
	});
};

function BotsTotalLikedPosts(){
	$.ajax({
		url: "/sensoranalysis/BotsTotalLikedPostsRoute",
		type: "GET",
		contentType: 'application/json;charset=UTF-8',
		data: {
			'barrier': ""
		},
		dataType: "json",
		success: function (data) {
			Plotly.newPlot('nineGraph', data)
		}
	});
};
function BotsTotalLikedComents(){
	$.ajax({
		url: "/sensoranalysis/BotsTotalLikedComentsRoute",
		type: "GET",
		contentType: 'application/json;charset=UTF-8',
		data: {
			'barrier': ""
		},
		dataType: "json",
		success: function (data) {
			Plotly.newPlot('tenGraph', data)
		}
	});
};
function BotsTotalReplies(){
	$.ajax({
		url: "/sensoranalysis/BotsTotalRepliesRoute",
		type: "GET",
		contentType: 'application/json;charset=UTF-8',
		data: {
			'barrier': ""
		},
		dataType: "json",
		success: function (data) {
			Plotly.newPlot('elevenGraph', data)
		}
	});
};

function BotsTotalPosts(){
	$.ajax({
		url: "/sensoranalysis/BotsTotalPostsRoute",
		type: "GET",
		contentType: 'application/json;charset=UTF-8',
		data: {
			'barrier': ""
		},
		dataType: "json",
		success: function (data) {
			Plotly.newPlot('postsGraph', data)
		}
	});
};

function PreSurveyComparison(){
	$.ajax({
		url: "/sensoranalysis/presurveysubmissiontime",
		type: "GET",
		contentType: 'application/json;charset=UTF-8',
		data: {
			'barrier': ""
		},
		dataType: "json",
		success: function (data) {
			Plotly.newPlot('seventhGraph', data)
		}
	});
};

function PostSurveyComparison(){
	$.ajax({
		url: "/sensoranalysis/postsurveysubmissiontime",
		type: "GET",
		contentType: 'application/json;charset=UTF-8',
		data: {
			'barrier': ""
		},
		dataType: "json",
		success: function (data) {
			Plotly.newPlot('eightGraph', data)
		}
	});
};


function UsersComparison(){
	$.ajax({
		url: "/sensoranalysis/usercomparison",
		type: "GET",
		contentType: 'application/json;charset=UTF-8',
		data: {
			'barrier': ""
		},
		dataType: "json",
		success: function (data) {
			Plotly.newPlot('firstGraph', data)
		}
	});
};

function postsbyUsers(){
	$.ajax({
		url: "/sensoranalysis/postsbyUsers",
		type: "GET",
		contentType: 'application/json;charset=UTF-8',
		data: {
			'barrier': ""
		},
		dataType: "json",
		success: function (data) {
			Plotly.newPlot('fourthGraph', data)
		}
	});
};


function totalRankedPosts(){
	$.ajax({
		url: "/sensoranalysis/totalRankedPosts",
		type: "GET",
		contentType: 'application/json;charset=UTF-8',
		data: {
			'barrier': ""
		},
		dataType: "json",
		success: function (data) {
			Plotly.newPlot('fourteenGraph', data)
		}
	});
};

function viewershipsOfPosts(){
	$.ajax({
		url: "/sensoranalysis/viewershipsOfPosts",
		type: "GET",
		contentType: 'application/json;charset=UTF-8',
		data: {
			'barrier': ""
		},
		dataType: "json",
		success: function (data) {
			Plotly.newPlot('fifthGraph', data)
		}
	});
};


function userssovertime(){
	$.ajax({
		url: "/sensoranalysis/userssovertime",
		type: "GET",
		contentType: 'application/json;charset=UTF-8',
		data: {
			'barrier': ""
		},
		dataType: "json",
		success: function (data) {
			Plotly.newPlot('ThirteenGraph', data)
		}
	});
};
function postsovertime(){
	$.ajax({
		url: "/sensoranalysis/postsovertime",
		type: "GET",
		contentType: 'application/json;charset=UTF-8',
		data: {
			'barrier': ""
		},
		dataType: "json",
		success: function (data) {
			Plotly.newPlot('secondGraph', data)
		}
	});
};

function activity(){
	$.ajax({
		url: "/sensoranalysis/userActivityHome",
		type: "GET",
		contentType: 'application/json;charset=UTF-8',
		data: {
			'barrier': ""
		},
		dataType: "json",
		success: function (data) {
			Plotly.newPlot('thirdGraph', data)
		}
	});
};

function postDetailActivity(){
	$.ajax({
		url: "/sensoranalysis/postDetailActivity",
		type: "GET",
		contentType: 'application/json;charset=UTF-8',
		data: {
			'barrier': ""
		},
		dataType: "json",
		success: function (data) {
			Plotly.newPlot('sixthGraph', data)
		}
	});
};


$("#dwnButton").unbind().click(function() {
			topbar.show()
			
			$.ajax({
						url: '/sensoranalysis/downloadEvents',
						type: 'GET',
						contentType: 'application/json;charset=UTF-8',
						data: {
							'selected_event': document.getElementById('phone').value
						},
						dataType: "json",
						success: function (data) {
							console.log("file downloaded complete");
							console.log(data);
							console.log(data.length)
							var x= document.getElementById('customEventSelection');
							let keys = Object.keys(data);
							let vals = Object.values(data);
							
							console.log(keys);
							console.log(vals[0]);
							
							for (var i = 0; i<keys.length; i++){
								var opt = document.createElement('option');
								opt.value = keys[i];
								opt.innerHTML = vals[i];
								
								x.add(opt);
							}
							topbar.hide()
							if(keys.length > 1){
								showAlert(keys.length + " Events related to the keywords have been downloaded!");
								
							}
							else if(keys.length == 1){
								showAlert(keys.length + " Event related to the keywords have been downloaded!");
								
							} else {
								showAlert("Unfortunately, there is no event available for the keywords!");
								
							}
							//$('#hcsg').empty();
							//Plotly.newPlot('hcsg', data)
						},
						error: function (err) {
							topbar.hide()
							showAlert("Unfortunately, there is no event available for the keywords!");
						}
					});
		});

function BarrierSelectedQA(button){
	$.ajax({
		url: "/sensoranalysis/qaselect",
		type: "GET",
		contentType: 'application/json;charset=UTF-8',
		data: {
			'barrier': document.getElementById('barrier').value
		},
		dataType: "json",
		success: function (data) {
			$('#topicgraph').empty();
			$('#topicdist').empty();
			$('#topictable').empty();
			$('#trendtable').empty();
			$('#linegraph').empty();
		}
	});
};

function getSelectValues(select) {
var result = [];
var options = select.selectedOptions;
var opt;
console.log(options.length)
for (var i=0, iLen=options.length; i<iLen; i++) {
  opt = options[i];
  var a = opt.value
  console.log(a)
  result.push(a);
}
console.log(result.join(","));
return result.join(",");
}

function GetTrendsQA(button){
	topbar.show()
	$.ajax({
		url: '/sensoranalysis/qaline',
		type: 'GET',
		contentType: 'application/json;charset=UTF-8',
		data: {
			  'commaValues': getSelectValues(document.getElementById('commaValues')),
			  'selBarrier': document.getElementById('barrier').value
		},
		dataType: "json",
		success: function (data) {
			var layout = {'xaxis.range': [1, 30]}
			Plotly.newPlot('qalinegraph', data);
			
			$.ajax({
				url: '/sensoranalysis/BertTopicQA',
				type: 'GET',
				contentType: 'application/json;charset=UTF-8',
				data: {
					'commaValues': getSelectValues(document.getElementById('commaValues')),
					'selBarrier': document.getElementById('barrier').value,
					'width' : document.getElementById('qalinegraph').getBoundingClientRect().width,
					'height' : document.getElementById('qalinegraph').getBoundingClientRect().height
				},
				dataType: "json",
				success: function (data) {
					console.log("Button clicked")
					try{
						console.log(data['data'].length)
					}
					catch(e)
					{
						console.log("failed")
					}
					var tot = data.length;
					document.getElementById("qawordcloud").innerHTML = "";
				
				var totalhighet = 0;
				for(x=0; x<tot;x++) {
					var elements = data[x]['data']
					var calh  = (Math.ceil(elements.length/4))*document.getElementById('qalinegraph').getBoundingClientRect().height + 'px';
					totalhighet = totalhighet + calh;
				}
				document.getElementById('qawordcloud').style.height = totalhighet + 'px';
				document.getElementById('qawordcloud').style.width = document.getElementById('qalinegraph').getBoundingClientRect().width + 'px';
				//document.getElementById('qawordcloud').setAttribute('justify-content', 'center');
				//document.getElementById('qawordcloud').setAttribute('align-items', 'center');
				//console.log("total discusions word clouds")
				//console.log(tot)
				
				var x = 0;
				var totalhighet = 0;
				for(x=0; x<tot;x++) {
					var elements = data[x]['data']
					var board = document.createElement('div');
					var idstr = "div_"+x.toString();
					board.id = idstr;
					var calh  = (Math.ceil(elements.length/4))*document.getElementById('qalinegraph').getBoundingClientRect().height + 'px';
					board.style.height = calh
					totalhighet = totalhighet + board.style.height;
					board.style.width = document.getElementById('qawordcloud').style.width;
					document.getElementById('qawordcloud').appendChild(board);
					Plotly.newPlot(idstr, data[x])
					document.getElementById(idstr).setAttribute('align', 'center');
				}
				$("#qawordcloud").children().each(function () {
					$(this).css('text-align','center');
					$(this).css('justify-content','center');
				})
				topbar.hide()
				},
				error: function (err) {
					topbar.hide()
					showAlert("Unfortunately, failed to create word couds!");
				}
			});
		},
				error: function (err) {
					topbar.hide()
					showAlert("Unfortunately, failed to create line graph!");
				}
	});
};

$('#trendsQA').on('click', 'button', function () {
	topbar.show()
	$.ajax({
		url: '/sensoranalysis/qaline',
		type: 'GET',
		contentType: 'application/json;charset=UTF-8',
		data: {
			  'commaValues': getSelectValues(document.getElementById('commaValues')),
			  'selBarrier': document.getElementById('barrier').value
		},
		dataType: "json",
		success: function (data) {
			var layout = {'xaxis.range': [1, 30]}
			Plotly.newPlot('qalinegraph', data);
			
			$.ajax({
				url: '/sensoranalysis/BertTopicQA',
				type: 'GET',
				contentType: 'application/json;charset=UTF-8',
				data: {
					'commaValues': getSelectValues(document.getElementById('commaValues')),
					'selBarrier': document.getElementById('barrier').value
				},
				dataType: "json",
				success: function (data) {
					console.log("Button clicked")
					try{
						console.log(data['data'].length)
					}
					catch(e)
					{
						console.log("failed")
					}
					var tot = data.length;
					document.getElementById("qawordcloud").innerHTML = "";
				
				var totalhighet = 0;
				for(x=0; x<tot;x++) {
					var elements = data[x]['data']
					var calh  = (Math.ceil(elements.length/4))*300 + 'px';
					totalhighet = totalhighet + calh;
				}
				document.getElementById('qawordcloud').style.height = totalhighet + 'px';
				document.getElementById('qawordcloud').setAttribute('justify-content', 'center');
				document.getElementById('qawordcloud').setAttribute('align-items', 'center');
				console.log("total discusions word clouds")
				console.log(tot)
				
				var x = 0;
				var totalhighet = 0;
				for(x=0; x<tot;x++) {
					var elements = data[x]['data']
					var board = document.createElement('div');
					var idstr = "div_"+x.toString();
					board.id = idstr;
					var calh  = (Math.ceil(elements.length/4))*300 + 'px';
					board.style.height = calh
					totalhighet = totalhighet + board.style.height;
					board.style.width = document.getElementById('qawordcloud').style.width;
					document.getElementById('qawordcloud').appendChild(board);
					Plotly.newPlot(idstr, data[x])
					document.getElementById(idstr).setAttribute('align', 'center'); 
				}
				$("#qawordcloud").children().each(function () {
					$(this).css('text-align','center');
					$(this).css('justify-content','center');
				})
				topbar.hide()
				},
				error: function (err) {
					topbar.hide()
					showAlert("Unfortunately, failed to create word couds!");
				}
			});
		},
				error: function (err) {
					topbar.hide()
					showAlert("Unfortunately, failed to create line graph!");
				}
	});
});

$('div#ThemeRiverHC').on('plotly_click', function (_, data) {
	topbar.show()
	$.ajax({
		url: '/sensoranalysis/hcThemeRiver',
		type: 'GET',
		contentType: 'application/json;charset=UTF-8',
		data: {
			'x': data.points[0].x
		},
		dataType: "json",
		success: function (data) {
			document.getElementById("label").style.display = 'none';
			Plotly.newPlot('hcsg', data)
			topbar.hide()
		},
				error: function (err) {
					topbar.hide()
					showAlert("Unfortunately, failed to create hierarchical clustering!");
				}
	});
});